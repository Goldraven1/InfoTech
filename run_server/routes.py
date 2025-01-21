import eel
from bottle import route, request, response, static_file
import os
import base64
import json
import re
from unicodedata import normalize
from urllib.parse import unquote, quote
from functools import wraps
from collections import defaultdict

# Глобальная переменная для хранения активных пользователей
active_users = defaultdict(int)

# Decorator для обработки асинхронных ответов
def async_response(f):
    @wraps(f)
    def wrapped(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            print(f"Error in {f.__name__}: {str(e)}")
            return {'success': False, 'error': str(e)}
    return wrapped

# Инициализация eel с настройками
eel.init('static', allowed_extensions=['.js', '.html', '.css'])

# Правильный путь к папке uploads (абсолютный путь)
UPLOAD_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'static', 'uploads'))

# Создаем папку если её нет
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Маршрут для раздачи статических файлов из uploads
@route('/static/uploads/<filepath:path>')
def serve_uploads(filepath):
    return static_file(filepath, root=UPLOAD_FOLDER)

def normalize_filename(filename):
    # Декодируем URL-encoded строку и нормализуем Unicode
    filename = unquote(filename)
    filename = normalize('NFKD', filename)
    # Оставляем буквы, цифры, пробелы и некоторые знаки
    filename = re.sub(r'[^\w\s-а-яА-ЯёЁ.]', '', filename)
    return filename.strip()

class Routes:
    @staticmethod
    @route('/upload', method='POST')
    @async_response
    def upload():
        try:
            music = request.files.get('music')
            cover = request.files.get('cover')
            name = request.forms.get('name')
            type_ = request.forms.get('type')

            if not all([music, cover, name, type_]):
                return {"success": False, "error": "Все поля обязательны."}

            # Нормализуем имя папки
            safe_name = normalize_filename(name)
            
            # Проверяем расширение музыкального файла
            allowed_music_ext = ('.mp3', '.wav')
            allowed_image_ext = ('.jpg', '.jpeg', '.png')
            
            music_ext = os.path.splitext(music.filename)[1].lower()
            cover_ext = os.path.splitext(cover.filename)[1].lower()
            
            if music_ext not in allowed_music_ext:
                return {"success": False, "error": "Поддерживаются только MP3 и WAV файлы"}
            
            if cover_ext not in allowed_image_ext:
                return {"success": False, "error": "Поддерживаются только JPG и PNG файлы"}

            folder_path = os.path.join(UPLOAD_FOLDER, safe_name)
            os.makedirs(folder_path, exist_ok=True)

            # Сохраняем файлы с нормализованными именами
            music_filename = normalize_filename(music.filename)
            cover_filename = normalize_filename(cover.filename)
            
            music_path = os.path.join(folder_path, music_filename)
            cover_path = os.path.join(folder_path, cover_filename)

            music.save(music_path)
            cover.save(cover_path)

            metadata = {
                "name": name,  # Оригинальное имя
                "type": type_,
                "music_file": music_filename,
                "cover_file": cover_filename,
                "plays": 0
            }

            metadata_path = os.path.join(folder_path, 'metadata.json')
            with open(metadata_path, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, ensure_ascii=False, indent=4)

            return {"success": True, "message": "Файлы успешно загружены"}

        except Exception as e:
            print(f"Ошибка при загрузке файлов: {str(e)}")
            return {"success": False, "error": str(e)}

LISTENING_STATS_FILE = os.path.join(os.path.dirname(__file__), 'listening_stats.json')

def load_listening_stats():
    if not os.path.exists(LISTENING_STATS_FILE):
        with open(LISTENING_STATS_FILE, 'w', encoding='utf-8') as f:
            json.dump({}, f, ensure_ascii=False, indent=4)
    with open(LISTENING_STATS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_listening_stats(data):
    with open(LISTENING_STATS_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

@eel.expose
def update_listening_time(track_id, seconds):
    try:
        track_id = int(track_id)
        stats = load_listening_stats()
        # Прибавляем время для трека
        stats[str(track_id)] = stats.get(str(track_id), 0) + seconds
        save_listening_stats(stats)
        return {'success': True}
    except Exception as e:
        return {'success': False, 'error': str(e)}

@eel.expose 
def get_all_tracks():
    try:
        stats = load_listening_stats()
        tracks = []
        # Рекурсивно ищем все треки во всех подпапках
        for root, dirs, files in os.walk(UPLOAD_FOLDER):
            if 'metadata.json' in files:
                with open(os.path.join(root, 'metadata.json'), 'r', encoding='utf-8') as f:
                    metadata = json.load(f)
                    relative_path = os.path.relpath(root, UPLOAD_FOLDER)
                    # Кодируем пути файлов
                    music_path = quote(f"/static/uploads/{relative_path}/{metadata['music_file']}")
                    cover_path = quote(f"/static/uploads/{relative_path}/{metadata['cover_file']}")
                    track_id = len(tracks)
                    # Конвертируем секунды в минуты и округляем до 1 знака
                    total_listening_minutes = round(stats.get(str(track_id), 0) / 60, 1)
                    track_data = {
                        'id': track_id,
                        'name': metadata['name'],
                        'type': metadata['type'],
                        'music_file': music_path,
                        'cover_file': cover_path,
                        'plays': total_listening_minutes  # Теперь храним время в минутах
                    }
                    tracks.append(track_data)
        
        # Сортируем по суммарному времени прослушивания
        tracks.sort(key=lambda x: x['plays'], reverse=True)
        return {'success': True, 'tracks': tracks}
    except Exception as e:
        print(f"Error in get_all_tracks: {str(e)}")
        return {'success': False, 'error': str(e)}

@eel.expose
def get_top_tracks(limit=3):
    try:
        all_tracks = get_all_tracks()
        if all_tracks['success']:
            # Фильтруем треки с plays > 0
            filtered_tracks = [track for track in all_tracks['tracks'] if track['plays'] > 0]
            if not filtered_tracks:
                return {'success': True, 'tracks': []}
            # Сортируем по plays и берем топ N
            sorted_tracks = sorted(filtered_tracks, key=lambda x: x['plays'], reverse=True)
            return {'success': True, 'tracks': sorted_tracks[:limit]}
        return all_tracks
    except Exception as e:
        return {'success': False, 'error': str(e)}

@eel.expose
def get_tracks_by_genre():
    try:
        all_tracks = []
        for root, dirs, files in os.walk(UPLOAD_FOLDER):
            if 'metadata.json' in files:
                with open(os.path.join(root, 'metadata.json'), 'r', encoding='utf-8') as f:
                    metadata = json.load(f)
                    relative_path = os.path.relpath(root, UPLOAD_FOLDER)
                    # Используем urlencode для специальных символов
                    music_file = quote(metadata['music_file'])
                    cover_file = quote(metadata['cover_file'])
                    track_data = {
                        'id': len(all_tracks),
                        'name': metadata['name'],
                        'type': metadata['type'],
                        'music_file': f"/static/uploads/{quote(relative_path)}/{music_file}",
                        'cover_file': f"/static/uploads/{quote(relative_path)}/{cover_file}",
                        'plays': metadata.get('plays', 0)
                    }
                    all_tracks.append(track_data)
        
        tracks_by_genre = {}
        for track in all_tracks:
            genre = track['type']
            if genre not in tracks_by_genre:
                tracks_by_genre[genre] = []
            tracks_by_genre[genre].append(track)
            
        return {'success': True, 'genres': tracks_by_genre}
    except Exception as e:
        return {'success': False, 'error': str(e)}

@eel.expose
def update_play_count(track_id):
    try:
        all_tracks = get_all_tracks()
        if all_tracks['success']:
            for track in all_tracks['tracks']:
                if track['id'] == track_id:
                    folder_path = os.path.join(UPLOAD_FOLDER, track['name'])
                    metadata_path = os.path.join(folder_path, 'metadata.json')
                    
                    with open(metadata_path, 'r', encoding='utf-8') as f:
                        metadata = json.load(f)
                    
                    metadata['plays'] = metadata.get('plays', 0) + 1
                    
                    with open(metadata_path, 'w', encoding='utf-8') as f:
                        json.dump(metadata, f, ensure_ascii=False, indent=4)
                    
                    return {'success': True}
        return {'success': False, 'error': 'Track not found'}
    except Exception as e:
        return {'success': False, 'error': str(e)}

# Новый маршрут для отслеживания пользователей
@route('/api/user/track', method='POST')
def track_user():
    try:
        data = request.json
        action = data.get('action')
        
        if action == 'visit':
            active_users[request.remote_addr] += 1
        elif action == 'leave':
            if active_users[request.remote_addr] > 0:
                active_users[request.remote_addr] -= 1
                if active_users[request.remote_addr] == 0:
                    del active_users[request.remote_addr]
        else:
            return {'success': False, 'error': 'Неверное действие'}
        
        return {'success': True, 'active_users': len(active_users)}
    except Exception as e:
        print(f"Ошибка в track_user: {str(e)}")
        return {'success': False, 'error': str(e)}

@eel.expose
def get_active_users():
    """Функция для получения количества активных пользователей"""
    return {'success': True, 'active_users': len(active_users)}

@route('/api/get_active_users')
def get_active_users_route():
    return get_active_users()

@eel.expose
def upload_files(music_data, cover_data, name, type_):
    try:
        # Проверяем расширение файла
        if not music_data['name'].lower().endswith(('.mp3', '.wav')):
            return {"success": False, "error": "Поддерживаются только аудио файлы MP3 или WAV"}
            
        track_folder = os.path.join(UPLOAD_FOLDER, name)
        if not os.path.exists(track_folder):
            os.makedirs(track_folder)
            
        # Сохранение музыкального файла
        music_path = os.path.join(track_folder, music_data['name'])
        music_bytes = base64.b64decode(music_data['data'])
        with open(music_path, 'wb') as f:
            f.write(music_bytes)
        
        # Сохранение обложки
        cover_path = os.path.join(track_folder, cover_data['name'])
        cover_bytes = base64.b64decode(cover_data['data'])
        with open(cover_path, 'wb') as f:
            f.write(cover_bytes)
        
        # Сохранение метаданных
        metadata = {
            "name": name,
            "type": type_,
            "music_file": music_data['name'],
            "cover_file": cover_data['name']
        }
        
        metadata_path = os.path.join(track_folder, 'metadata.json')
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=4)
        
        return {"success": True, "message": "Файлы успешно загружены"}
    except Exception as e:
        print(f"Ошибка при загрузке файлов: {str(e)}")
        return {"success": False, "error": str(e)}

@eel.expose
def search_tracks(query):
    try:
        query = query.lower()
        all_tracks = []
        for root, dirs, files in os.walk(UPLOAD_FOLDER):
            if 'metadata.json' in files:
                with open(os.path.join(root, 'metadata.json'), 'r', encoding='utf-8') as f:
                    metadata = json.load(f)
                    if query in metadata['name'].lower() or query in metadata['type'].lower():
                        relative_path = os.path.relpath(root, UPLOAD_FOLDER)
                        music_path = quote(f"/static/uploads/{relative_path}/{metadata['music_file']}")
                        cover_path = quote(f"/static/uploads/{relative_path}/{metadata['cover_file']}")
                        track_id = len(all_tracks)
                        total_listening_minutes = round(load_listening_stats().get(str(track_id), 0) / 60, 1)
                        track_data = {
                            'id': track_id,
                            'name': metadata['name'],
                            'type': metadata['type'],
                            'music_file': music_path,
                            'cover_file': cover_path,
                            'plays': total_listening_minutes
                        }
                        all_tracks.append(track_data)
        return {'success': True, 'tracks': all_tracks}
    except Exception as e:
        print(f"Error in search_tracks: {str(e)}")
        return {'success': False, 'error': str(e)}
