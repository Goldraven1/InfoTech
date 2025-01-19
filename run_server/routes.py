import eel
from bottle import route, request, response
import os
import base64
import json

eel.init('static')

UPLOAD_FOLDER = 'uploads'

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

class Routes:  
    @staticmethod
    @route('/upload', method='POST')
    def upload():
        try:
            music = request.files.get('music')
            cover = request.files.get('cover')
            name = request.forms.get('name')
            type_ = request.forms.get('type')

            if not (music and cover and name and type_):
                response.status = 400
                return {"error": "Все поля обязательны."}

            music_path = os.path.join(UPLOAD_FOLDER, music.filename)
            cover_path = os.path.join(UPLOAD_FOLDER, cover.filename)

            music.save(music_path)
            cover.save(cover_path)

            return {"success": True, "message": "Файлы успешно загружены."}

        except Exception as e:
            response.status = 500
            return {"error": str(e)}

@eel.expose
def upload_files(music_data, cover_data, name, type_):
    try:
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

