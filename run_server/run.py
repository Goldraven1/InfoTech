import eel
from db import connectionpostgresql
from bottle import route, request, response
import os

eel.init('static')

UPLOAD_FOLDER = 'uploads' 

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

        # Сохранение файлов
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)

        music_path = os.path.join(UPLOAD_FOLDER, music.filename)
        cover_path = os.path.join(UPLOAD_FOLDER, cover.filename)

        music.save(music_path)
        cover.save(cover_path)

        # Дополнительная обработка, например, сохранение в БД

        response.content_type = 'application/json'
        return {"success": True, "message": "Файлы успешно загружены."}

    except Exception as e:
        response.status = 500
        return {"error": str(e)}

eel.start('index.html', size=(1920, 1080), host="localhost")