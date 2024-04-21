import eel
import psycopg2
import bcrypt

eel.init('static')

@eel.expose
def register(username, password):
    conn = psycopg2.connect(
        dbname="Info Tech", 
        user="Postgre SQL 15", 
        password="123", 
        host="localhost"
    )
    cur = conn.cursor()

    
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    cur.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (username, hashed_password))
    conn.commit()
    cur.close()
    conn.close()
    return {'success': True}

eel.start('index.html', size=(1920, 1080))