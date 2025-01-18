# Используем официальный образ Nginx для деплоя статических файлов
FROM nginx:alpine

# Копируем все файлы из вашего проекта в директорию Nginx
COPY . /usr/share/nginx/html

# Открываем порт 80 для доступа к приложению
EXPOSE 80

# Запускаем Nginx
CMD ["nginx", "-g", "daemon off;"]
