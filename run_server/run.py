"""
Точка входа в приложение InfoTech.

Этот модуль отвечает за запуск веб-серверного приложения с использованием Eel.
Он инициализирует соединение с базой данных, настраивает маршруты и запускает
главное окно приложения.
"""

import eel
import os
import logging
from routes import Routes
from db import connectionpostgresql
from bottle import run, default_app
from metrics import initialize_metrics  # Импорт функции для инициализации метрик

# Настраиваем логирование
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Получаем путь к статическим файлам
static_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'static'))
if not os.path.exists(static_path):
    print(f"Директория статических файлов не найдена: {static_path}")
    logging.error(f"Директория статических файлов не найдена: {static_path}")
    static_path = 'static'  # Используем относительный путь как запасной вариант

# Инициализация подключения к базе данных
print("Подключение к базе данных...")
db = connectionpostgresql()

# Инициализация метрик Prometheus
print("Инициализация сервера метрик Prometheus...")
initialize_metrics(port=8000)  # Запуск на порту 8000

# Инициализация Eel с указанием директории статических файлов
print(f"Инициализация Eel с директорией {static_path}...")
eel.init(static_path, allowed_extensions=['.js', '.html', '.css', '.mp3', '.jpg', '.png'])

# Инициализация маршрутов приложения
routes = Routes()

# Точка входа приложения
if __name__ == '__main__':
    """
    Запускает веб-интерфейс приложения.
    
    При запуске этого модуля напрямую (python run.py):
    1. Создается окно с размером 1920x1080
    2. Устанавливается хост localhost и порт 8080
    3. Открывается начальная страница index.html
    """
    print("Запуск веб-интерфейса...")
    eel.start('index.html', mode="none", size=(1920, 1080), host="localhost", port=8080)