import eel
import psycopg2
import bcrypt

eel.init('static')

@eel.expose
def register(username, password):
    try:
        conn = psycopg2.connect(
            dbname="InfoTech", 
            user="PostgreSQL15", 
            password="123", 
            host="localhost",
            port=5432
        )
        cur = conn.cursor()

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        cur.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (username, hashed_password))
        conn.commit()
    except Exception as e:
        print(f"Произошла ошибка: {e}")
        return {'success': False}
    finally:
        cur.close()
        conn.close()

    return {'success': True}

@eel.expose
def login(username, password):
    try:
        conn = psycopg2.connect(
            dbname="InfoTech", 
            user="PostgreSQL15", 
            password="123", 
            host="localhost",
            port=5432
        )
        cur = conn.cursor()

        cur.execute("SELECT password FROM users WHERE username = %s", (username,))
        result = cur.fetchone()

        if result is None:
            print("Пользователь не найден")
            return {'success': False}

        hashed_password = result[0]

        if bcrypt.checkpw(password.encode('utf-8'), hashed_password):
            print("Вход успешно выполнен")
            return {'success': True}
        else:
            print("Неверный пароль")
            return {'success': False}
    except Exception as e:
        print(f"Произошла ошибка: {e}")
        return {'success': False}
    finally:
        cur.close()
        conn.close()

@eel.expose
def workHTML():
    #переход на другую страницу
    eel.workHTML(workHTML=True)
    pass

eel.start('index.html', size=(1920, 1080))
