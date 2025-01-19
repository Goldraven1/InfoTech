import eel
from routes import Routes

eel.init('static')
routes = Routes()
eel.start('work.html', size=(1920, 1080))