import eel
from db import connectionpostgresql 
 

eel.init('static')
eel.start('index.html', size=(1920, 1080))