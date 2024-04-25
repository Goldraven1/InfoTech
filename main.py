import eel
import psycopg2
import hashlib
import secrets

eel.init('static')

# Параметры подключения к базе данных PostgreSQL
db_config = {
    "dbname": "InfoTech",
    "user": "postgres",
    "password": "123",
    "host": "localhost",
    "port": "5432"
}

# Функция для хеширования пароля с солью
def hash_password(password, salt):
    hasher = hashlib.sha256()
    hasher.update(password.encode('utf-8'))
    hasher.update(salt.encode('utf-8'))
    return hasher.hexdigest()

@eel.expose
def register(username, password):
    conn = None
    cur = None
    try:
        conn = psycopg2.connect(**db_config)
        cur = conn.cursor()
        salt = secrets.token_hex(16)  # Генерация случайной соли
        hashed_password = hash_password(password, salt)  # Хеширование пароля с солью
        cur.execute("INSERT INTO users (username, password, salt) VALUES (%s, %s, %s)", (username, hashed_password, salt))
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
def login(username, password):
    conn = None
    cur = None
    try:
        conn = psycopg2.connect(**db_config)
        cur = conn.cursor()
        cur.execute("SELECT password, salt FROM users WHERE username = %s", (username,))
        result = cur.fetchone()
        if result is None:
            return "Пользователь не найден"
        hashed_password, salt = result  # Получение хешированного пароля и соли из базы данных
        hashed_password_with_salt = hash_password(password, salt)  # Хеширование введенного пароля с солью из базы данных
        if hashed_password == hashed_password_with_salt:  # Проверка пароля
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

try:
    
    conn = psycopg2.connect(**db_config)
    conn.close()
except psycopg2.OperationalError as e:
    print(f"Не удалось подключиться к базе данных: {e}")

eel.start('index.html', size=(1920, 1080))
