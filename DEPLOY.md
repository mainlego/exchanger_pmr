# 🚀 Инструкция по деплою на Render.com

## Шаг 1: Подготовка GitHub репозитория

1. Создайте репозиторий на GitHub (если еще не создан)
2. Запушьте код:
```bash
git push -u origin main
```

## Шаг 2: Настройка Render.com

### 2.1 Создание аккаунта
1. Зайдите на [render.com](https://render.com)
2. Войдите через GitHub

### 2.2 Создание Blueprint
1. Нажмите "New +" → "Blueprint"
2. Подключите GitHub репозиторий `mainlego/exchanger_pmr`
3. Render автоматически найдет файл `render.yaml`

### 2.3 Настройка переменных окружения
После создания сервисов, добавьте секретные переменные:

#### Для API сервиса:
- `BOT_TOKEN` = Ваш токен бота из BotFather

#### Для Bot сервиса:
- `BOT_TOKEN` = Ваш токен бота из BotFather

## Шаг 3: Альтернативный ручной деплой

Если автоматический деплой не работает, создайте сервисы вручную:

### 3.1 База данных PostgreSQL
1. New → PostgreSQL
2. Name: `exchangepmr-db`
3. Database: `exchange_pmr`
4. Plan: Free

### 3.2 Redis
1. New → Redis
2. Name: `exchangepmr-redis`
3. Plan: Free

### 3.3 Backend API
1. New → Web Service
2. Connect GitHub repo
3. Name: `exchangepmr-api`
4. Root Directory: `apps/api`
5. Build Command: `npm install && npm run build`
6. Start Command: `npm start`
7. Environment Variables:
   - `NODE_ENV` = production
   - `BOT_TOKEN` = [ваш токен]
   - `DATABASE_URL` = [из PostgreSQL]
   - `REDIS_URL` = [из Redis]

### 3.4 Frontend
1. New → Static Site
2. Name: `exchangepmr-web`
3. Root Directory: `apps/web`
4. Build Command: `npm install && npm run build`
5. Publish Directory: `dist`

### 3.5 Telegram Bot
1. New → Background Worker
2. Name: `exchangepmr-bot`
3. Root Directory: `apps/bot`
4. Build Command: `npm install && npm run build`
5. Start Command: `npm start`
6. Environment Variables:
   - `BOT_TOKEN` = [ваш токен]
   - `CLIENT_URL` = [URL от Frontend]

## Шаг 4: Настройка Telegram Bot

1. Откройте @BotFather
2. Выберите вашего бота
3. Используйте команду `/setmenubutton`
4. Введите URL вашего Frontend из Render (например: `https://exchangepmr-web.onrender.com`)

## Шаг 5: Проверка

1. Дождитесь завершения деплоя всех сервисов (10-15 минут)
2. Проверьте статус в Render Dashboard
3. Откройте бота в Telegram
4. Отправьте `/start`
5. Нажмите "Открыть обменник"

## 🔧 Устранение проблем

### База данных не подключается
- Проверьте DATABASE_URL в переменных окружения
- Убедитесь, что PostgreSQL запущен

### Бот не отвечает
- Проверьте BOT_TOKEN
- Посмотрите логи в Render Dashboard

### Frontend не открывается
- Проверьте Build Logs
- Убедитесь, что путь к dist правильный

## 📝 Обновление после изменений

1. Сделайте коммит изменений:
```bash
git add .
git commit -m "Update"
git push
```

2. Render автоматически задеплоит изменения

## 🔒 Важно для production

1. Измените `CLIENT_URL` в боте на реальный URL
2. Настройте HTTPS (Render делает автоматически)
3. Добавьте домен (опционально)
4. Настройте мониторинг

## 💰 Стоимость

Бесплатный план Render включает:
- 750 часов в месяц для web services
- PostgreSQL до 1GB
- Redis до 25MB
- Автоматический sleep после 15 минут неактивности

Для production рекомендуется платный план ($7/месяц за сервис).