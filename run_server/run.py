import eel
from routes import Routes
from db import connectionpostgresql

db = connectionpostgresql()


eel.init('static', allowed_extensions=['.js', '.html', '.css', '.mp3', '.jpg', '.png'])
routes = Routes()

eel.start('work.html', size=(2500, 2000), mode='none', port=8080)