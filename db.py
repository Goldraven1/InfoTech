import psycopg2
import secrets
import hashlib
import eel
from config import host, user, db_password, db_name, port

class connectionpostgresql:

    @staticmethod
    def hash_password(password, salt):
        hasher = hashlib.sha256()
        hasher.update(password.encode('utf-8'))
        hasher.update(salt.encode('utf-8'))
        return hasher.hexdigest()

    @eel.expose
    def register(username, user_password):
        conn = None
        cur = None
        try:
            conn = psycopg2.connect(
                host=host,
                user=user,
                password=db_password,  # Используем db_password из config.py
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
            return "Регистрация успешна"
        except psycopg2.Error as e:
            print(f"Произошла ошибка: {e}")
            return "Регистрация не удалась"
        finally:
            if cur:
                cur.close()
            if conn:
                conn.close()

    @eel.expose
    def login(username, user_password):
        conn = None
        cur = None
        try:
            conn = psycopg2.connect(
                host=host,
                user=user,
                password=db_password,  # Используем db_password из config.py
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
                return "Пользователь не найден"
            hashed_password, salt = result
            hashed_password_with_salt = connectionpostgresql.hash_password(user_password, salt)
            if hashed_password == hashed_password_with_salt:
                return "Вход выполнен успешно"
            else:
                return "Неправильный пароль"
        except psycopg2.Error as e:
            print(f"Произошла ошибка: {e}")
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