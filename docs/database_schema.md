# Схема базы данных

Проект InfoTech использует PostgreSQL для хранения данных. Ниже приведена структура базы данных и описание основных таблиц.

## Таблицы

### users

Таблица содержит информацию о пользователях системы.

| Колонка     | Тип данных | Описание                         | Ограничения     |
|-------------|------------|----------------------------------|-----------------|
| id          | SERIAL     | Уникальный идентификатор         | PRIMARY KEY     |
| name        | VARCHAR    | Имя пользователя                 | NOT NULL        |
| description | TEXT       | Описание пользователя            |                 |
| created_at  | TIMESTAMP  | Дата и время создания записи     | DEFAULT NOW()   |
| updated_at  | TIMESTAMP  | Дата и время обновления записи   | DEFAULT NOW()   |

#### SQL для создания:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Дополнительные таблицы (предложения для расширения)

#### user_roles

Таблица для хранения ролей пользователей.

| Колонка   | Тип данных | Описание                     | Ограничения |
|-----------|------------|------------------------------|-------------|
| id        | SERIAL     | Уникальный идентификатор     | PRIMARY KEY |
| name      | VARCHAR    | Название роли                | NOT NULL    |
| code      | VARCHAR    | Код роли для программы       | NOT NULL    |

#### SQL для создания:

```sql
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE
);
```

#### user_role_mappings

Связь многие-ко-многим между пользователями и ролями.

| Колонка   | Тип данных | Описание                     | Ограничения                 |
|-----------|------------|------------------------------|----------------------------|
| user_id   | INTEGER    | ID пользователя              | FOREIGN KEY REFERENCES users |
| role_id   | INTEGER    | ID роли                      | FOREIGN KEY REFERENCES user_roles |

#### SQL для создания:

```sql
CREATE TABLE user_role_mappings (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES user_roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);
```

## Индексы

Для оптимизации запросов рекомендуется создать следующие индексы:

```sql
-- Индекс для быстрого поиска по имени пользователя
CREATE INDEX idx_users_name ON users(name);

-- Индекс для оптимизации сортировки по дате создания
CREATE INDEX idx_users_created_at ON users(created_at);
```

## Триггеры и функции

### Автоматическое обновление updated_at

```sql
-- Функция для автоматического обновления поля updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для таблицы users
CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_timestamp();
```

## Схема связей

```
┌────────────┐      ┌────────────────────┐      ┌─────────────┐
│   users    │      │ user_role_mappings │      │ user_roles  │
├────────────┤      ├────────────────────┤      ├─────────────┤
│ id         │◄─┐   │ user_id            │   ┌─►│ id          │
│ name       │  └───┼───────────────────┐│   │  │ name        │
│ description│      │ role_id           ├┘   │  │ code        │
│ created_at │      └────────────────────┘   │  └─────────────┘
│ updated_at │                                │
└────────────┘                                │
                                              │
                                              │
```

## Примеры запросов

### Получение всех пользователей

```sql
SELECT * FROM users;
```

### Поиск пользователей по имени

```sql
SELECT * FROM users WHERE name LIKE '%поисковый_запрос%';
```

### Добавление нового пользователя

```sql
INSERT INTO users (name, description) VALUES ('Имя пользователя', 'Описание пользователя');
```

### Обновление информации о пользователе

```sql
UPDATE users SET name = 'Новое имя', description = 'Новое описание' WHERE id = 1;
```

### Удаление пользователя

```sql
DELETE FROM users WHERE id = 1;
```

### Получение пользователей с их ролями (при расширении схемы)

```sql
SELECT u.id, u.name, array_agg(r.name) as roles
FROM users u
JOIN user_role_mappings m ON u.id = m.user_id
JOIN user_roles r ON m.role_id = r.id
GROUP BY u.id, u.name;
```

## Миграции базы данных

Для управления изменениями схемы базы данных рекомендуется использовать миграции.
В директории `/migrations` можно создать файлы миграций с последовательными версиями
схемы базы данных и инструкциями для обновления с предыдущей версии.

### Пример структуры миграций:

```
/migrations
  ├── 001_initial_schema.sql
  ├── 002_add_user_roles.sql
  └── 003_add_indexes.sql
```
