# 🚀 Быстрый деплой за 5 минут

## Вариант 1: Полный деплой (Frontend + Bot)

### Шаг 1: Frontend на Vercel (бесплатно)
1. Зайдите на [vercel.com](https://vercel.com)
2. Войдите через GitHub
3. Нажмите "Import Project"
4. Выберите репозиторий `mainlego/exchanger_pmr`
5. В настройках укажите:
   - Framework Preset: `Vue.js`
   - Root Directory: `apps/web`
   - Build Command: `npm install && npm run build`
   - Output Directory: `dist`
6. Нажмите "Deploy"
7. Скопируйте URL вашего сайта (например: `https://exchanger-pmr.vercel.app`)

### Шаг 2: Bot на Render (бесплатно)
1. Зайдите на [render.com](https://render.com)
2. Войдите через GitHub
3. Нажмите "New +" → "Web Service"
4. Подключите репозиторий `mainlego/exchanger_pmr`
5. Настройте:
   - Name: `pmr-exchange-bot`
   - Root Directory: `apps/bot`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
6. В Environment Variables добавьте:
   - `BOT_TOKEN` = `8200049903:AAETV6_6XOLA6SP-jaW2Hizsm5hVjv_p5CY`
   - `CLIENT_URL` = URL из Vercel (например: `https://exchanger-pmr.vercel.app`)
   - `NODE_ENV` = `production`
7. Нажмите "Create Web Service"

### Шаг 3: Настройка Telegram Bot
1. Откройте @BotFather в Telegram
2. Выберите вашего бота
3. Команда `/setmenubutton`
4. Введите URL из Vercel

## Вариант 2: Только Bot (если нужен только бот)

1. Форкните репозиторий или используйте свой
2. На Render создайте Web Service с файлом `render-bot.yaml`
3. Добавьте BOT_TOKEN в переменные окружения
4. Готово!

## 🎯 Проверка

1. Откройте бота в Telegram
2. Отправьте `/start`
3. Нажмите "💱 Открыть обменник"
4. Mini App должен открыться

## ⚠️ Важные URL для настройки

После деплоя обновите:
- В боте CLIENT_URL на реальный URL Vercel
- В Telegram Bot через @BotFather URL на Mini App

## 🆓 Что бесплатно:

**Vercel:**
- Неограниченные деплои
- 100GB bandwidth в месяц
- Автоматический HTTPS
- Быстрый CDN

**Render:**
- 750 часов в месяц
- Автоматический sleep после 15 минут неактивности
- При первом обращении просыпается за 30 секунд

## 💡 Советы:

1. Для production используйте внешнюю БД (например, Supabase PostgreSQL - бесплатно до 500MB)
2. Для Redis можно использовать Upstash (бесплатно до 10000 запросов в день)
3. Чтобы бот не засыпал, используйте cron-job.org для пинга каждые 14 минут

## 📝 Команды бота:
- `/start` - Запуск бота
- `/rates` - Текущие курсы
- `/calculator` - Калькулятор
- `/support` - Поддержка
- `/about` - О сервисе

Готово! Ваш обменник работает! 🎉