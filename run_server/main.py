import eel
from db import connectionpostgresql
import sys

# Инициализация веб-файлов
try:
    eel.init('static')
except:
    print("Ошибка инициализации папки static")
    sys.exit(1)

# Сетевые настройки
HOST = 'localhost'  # Позволяет подключаться с любого IP
PORT = 8080       # Порт для подключения
MODE = 'chrome'   # Предпочтительный браузер

# Запуск приложения
try:
    # Пытаемся запустить в Chrome
    eel.start('index.html', 
              mode=MODE,
              host=HOST, 
              port=PORT,
              size=(1920, 1080))
except (SystemExit, KeyboardInterrupt):
    # Корректное завершение при закрытии
    print("Выход из приложения")
except Exception as e:
    # Если Chrome недоступен, запускаем в браузере по умолчанию
    print(f"Невозможно запустить Chrome: {e}")
    try:
        eel.start('index.html',
                  mode='default',
                  host=HOST,
                  port=PORT,
                  size=(1920, 1080))
    except Exception as e:
        print(f"Ошибка запуска: {e}")