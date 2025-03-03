# Мониторинг приложения InfoTech

## Введение

В этом документе описан процесс настройки и использования мониторинга для приложения InfoTech с использованием Prometheus и Grafana через Docker.

## Требования

- Docker
- Docker Compose
- Python 3.x с установленными зависимостями из `requirements.txt`

## Установка

1. Установите необходимые зависимости:

```bash
pip install -r requirements.txt
```

2. Запустите стек мониторинга:

```bash
./start_monitoring.sh
```

Или используйте команду:

```bash
docker-compose up -d
```

## Доступ к интерфейсам

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000
  - Логин: `admin`
  - Пароль: `admin`

## Настройка Grafana

1. Войдите в Grafana по адресу http://localhost:3000
2. Добавьте Prometheus как источник данных:
   - Перейдите в "Configuration" -> "Data sources"
   - Нажмите "Add data source"
   - Выберите "Prometheus"
   - В поле URL введите `http://prometheus:9090`
   - Нажмите "Save & Test"

3. Импортируйте дашборд:
   - Перейдите в "Create" -> "Import"
   - Загрузите файл дашборда или используйте ID существующего дашборда

## Доступные метрики

- `http_requests_total` - Общее количество HTTP запросов
- `login_attempts_total` - Количество попыток входа в систему
- `register_attempts_total` - Количество попыток регистрации
- `request_duration_seconds` - Время выполнения HTTP запросов
- `active_users` - Количество активных пользователей

## Примеры запросов Prometheus

### Количество успешных входов за последний час:
```
sum(increase(login_attempts_total{status="success"}[1h]))
```

### Среднее время ответа за последние 5 минут:
```
rate(request_duration_seconds_sum[5m]) / rate(request_duration_seconds_count[5m])
```

### Количество неудачных регистраций:
```
sum(register_attempts_total{status="failure"})
```
