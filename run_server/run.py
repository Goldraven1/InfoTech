import eel
from routes import Routes
from db import connectionpostgresql
from bottle import run, default_app
import ssl

db = connectionpostgresql()

eel.init('static', allowed_extensions=['.js', '.html', '.css', '.mp3', '.jpg', '.png'])
routes = Routes()

if __name__ == '__main__':
    eel.start('work.html', mode="none", size=(1920, 1080), host="0.0.0.0", port=8080)