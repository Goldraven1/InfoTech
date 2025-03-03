"""
Модуль для экспорта метрик в Prometheus.

Предоставляет объекты для сбора метрик производительности и бизнес-метрик
приложения InfoTech.
"""

from prometheus_client import Counter, Histogram, Gauge, start_http_server
import time
import logging

# Логгер
logger = logging.getLogger(__name__)

# Счетчики запросов
http_requests_total = Counter(
    'http_requests_total', 
    'Total count of HTTP requests',
    ['method', 'endpoint', 'status']
)

# Счетчик для авторизаций
login_attempts_total = Counter(
    'login_attempts_total',
    'Count of login attempts',
    ['status']  # success или failure
)

# Счетчик для регистраций
register_attempts_total = Counter(
    'register_attempts_total',
    'Count of registration attempts',
    ['status']  # success или failure
)

# Гистограмма для времени ответа
request_duration_seconds = Histogram(
    'request_duration_seconds', 
    'HTTP request duration in seconds',
    ['method', 'endpoint'],
    buckets=(0.005, 0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1.0, 2.5, 5.0, 7.5, 10.0)
)

# Gauge для отслеживания активных пользователей
active_users = Gauge('active_users', 'Number of active users')

def initialize_metrics(port=8000):
    """
    Инициализация HTTP сервера для метрик Prometheus.
    
    Args:
        port (int): Порт для HTTP сервера метрик (по умолчанию 8000)
    """
    logger.info(f"Запуск сервера метрик на порту {port}")
    try:
        start_http_server(port)
        logger.info(f"Сервер метрик запущен на порту {port}")
    except Exception as e:
        logger.error(f"Не удалось запустить сервер метрик: {e}")

def track_request_duration(method, endpoint):
    """
    Декоратор для отслеживания времени выполнения запроса.
    
    Args:
        method (str): HTTP метод (GET, POST, etc.)
        endpoint (str): Путь запроса
        
    Returns:
        function: Декоратор для функции запроса
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            start_time = time.time()
            result = func(*args, **kwargs)
            duration = time.time() - start_time
            request_duration_seconds.labels(method=method, endpoint=endpoint).observe(duration)
            return result
        return wrapper
    return decorator
