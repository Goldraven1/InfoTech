import eel
from routes import Routes
from db import connectionpostgresql

db = connectionpostgresql()

eel.init('static')
routes = Routes()

eel.start('index.html', size=(1920, 1080))