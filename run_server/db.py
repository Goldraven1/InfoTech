import psycopg2
import secrets
import hashlib
import eel
from config import host, user, db_password, db_name, port
from metrics import login_attempts_total, register_attempts_total  

"""
Модуль для работы с базой данных PostgreSQL.
Предоставляет функции для аутентификации и регистрации пользователей.

База данных содержит таблицу users со следующей структурой:
- username (text): Имя пользователя
- password (text): Хешированный пароль (SHA-256)
- salt (text): Уникальная соль для хеширования
"""

class connectionpostgresql:
    """
    Класс для работы с базой данных пользователей.
    Предоставляет методы для регистрации и аутентификации.
    """

    @staticmethod
    def hash_password(password, salt):
        """
        Хеширует пароль с использованием соли.
        
        Args:
            password (str): Пароль пользователя
            salt (str): Соль для хеширования
            
        Returns:
            str: Хешированный пароль
        """
        hasher = hashlib.sha256()
        hasher.update(password.encode('utf-8'))
        hasher.update(salt.encode('utf-8'))
        return hasher.hexdigest()

    @eel.expose
    def register(username, user_password):
        """
        Регистрирует нового пользователя в системе.
        
        Args:
            username (str): Имя пользователя
            user_password (str): Пароль пользователя
            
        Returns:
            str: Сообщение о результате операции
            
        Примечание:
            Функция создает запись в таблице users с хешированным паролем и уникальной солью
        """
        conn = None
        cur = None
        try:
            conn = psycopg2.connect(
                host=host,
                user=user,
                password=db_password,  
                database=db_name,
                port=port
            )
            cur = conn.cursor()
            salt = secrets.token_hex(16)
            hashed_password = connectionpostgresql.hash_password(user_password, salt)
            cur.execute(
                "INSERT INTO users (username, password, salt) VALUES (%s, %s, %s)",
                (username, hashed_password, salt)
            )
            conn.commit()
            register_attempts_total.labels(status="success").inc()  # Метрика успешной регистрации
            return "Регистрация успешна"
        except psycopg2.Error as e:
            print(f"Произошла ошибка: {e}")
            register_attempts_total.labels(status="failure").inc()  # Метрика неудачной регистрации
            return "Регистрация не удалась"
        finally:
            if cur:
                cur.close()
            if conn:
                conn.close()

    @eel.expose
    def login(username, user_password):
        """
        Аутентифицирует пользователя по имени и паролю.
        
        Args:
            username (str): Имя пользователя
            user_password (str): Пароль пользователя
            
        Returns:
            str: Сообщение о результате операции
            
        Примечание:
            Функция проверяет хеш пароля пользователя с использованием сохраненной соли
        """
        conn = None
        cur = None
        try:
            conn = psycopg2.connect(
                host=host,
                user=user,
                password=db_password,
                database=db_name,
                port=port
            )
            cur = conn.cursor()
            cur.execute(
                "SELECT password, salt FROM users WHERE username = %s",
                (username,)
            )
            result = cur.fetchone()
            if result is None:
                login_attempts_total.labels(status="failure").inc()  # Метрика неудачного входа
                return "Пользователь не найден"
            hashed_password, salt = result
            hashed_password_with_salt = connectionpostgresql.hash_password(user_password, salt)
            if hashed_password == hashed_password_with_salt:
                login_attempts_total.labels(status="success").inc()  # Метрика успешного входа
                return "Вход выполнен успешно"
            else:
                login_attempts_total.labels(status="failure").inc()  # Метрика неудачного входа
                return "Неправильный пароль"
        except psycopg2.Error as e:
            print(f"Произошла ошибка: {e}")
            login_attempts_total.labels(status="failure").inc()  # Метрика неудачного входа
            return "Вход не выполнен"
        finally:
            if cur:
                cur.close()
            if conn:
                conn.close()

    # Проверка подключения при запуске
    try:
        conn = psycopg2.connect(
            host=host,
            user=user,
            password=db_password,  # Используем db_password из config.py
            database=db_name,
            port=port
        )
        conn.close()
        print("Подключение к базе данных успешно")
    except psycopg2.OperationalError as e:
        print(f"Не удалось подключиться к базе данных: {e}")