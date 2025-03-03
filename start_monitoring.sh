#!/bin/bash

# Запуск контейнеров Prometheus и Grafana через Docker Compose
docker-compose up -d

echo "Мониторинг запущен!"
echo "Prometheus доступен на http://localhost:9090"
echo "Grafana доступна на http://localhost:3000 (логин: admin, пароль: admin)"
