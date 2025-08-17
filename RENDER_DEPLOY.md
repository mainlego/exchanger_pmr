# 🚀 Деплой на Render.com (Frontend + Bot)

## Быстрый старт за 3 минуты

### Вариант 1: Автоматический деплой через Blueprint

1. Зайдите на [render.com](https://render.com)
2. Войдите через GitHub
3. Нажмите **"New +" → "Blueprint"**
4. Выберите репозиторий `mainlego/exchanger_pmr`
5. Render найдет файл `render.yaml` автоматически
6. Нажмите **"Apply"**
7. В настройках добавьте `BOT_TOKEN` для бота

### Вариант 2: Ручной деплой (если Blueprint не работает)

#### 1️⃣ Frontend
1. **New → Web Service**
2. Подключите репозиторий
3. Настройки:
   - **Name:** `pmr-exchange-web`
   - **Root Directory:** `apps/web`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** Node
4. Deploy!

#### 2️⃣ Bot
1. **New → Web Service**
2. Подключите репозиторий
3. Настройки:
   - **Name:** `pmr-exchange-bot`
   - **Root Directory:** `apps/bot`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** Node
4. В Environment Variables добавьте:
   - `BOT_TOKEN` = `8200049903:AAETV6_6XOLA6SP-jaW2Hizsm5hVjv_p5CY`
   - `CLIENT_URL` = URL вашего frontend (например: `https://pmr-exchange-web.onrender.com`)
   - `NODE_ENV` = `production`
5. Deploy!

## 📱 Настройка Telegram Bot

После деплоя:

1. Откройте @BotFather
2. Выберите вашего бота
3. Команда `/setmenubutton`
4. Введите URL frontend: `https://pmr-exchange-web.onrender.com`

## ✅ Что получаем бесплатно:

- ✅ Frontend работает как Node.js приложение
- ✅ Bot работает через webhook
- ✅ Автоматический HTTPS
- ✅ 750 часов в месяц (достаточно для 1 сервиса 24/7)
- ✅ Автоматический деплой при push в GitHub

## ⚠️ Ограничения бесплатного плана:

- Сервис засыпает после 15 минут неактивности
- Первый запрос после сна занимает ~30 секунд
- Можно запустить только 1-2 сервиса одновременно

## 💡 Советы для production:

1. **Чтобы сервисы не засыпали:**
   - Используйте [cron-job.org](https://cron-job.org) 
   - Настройте пинг каждые 14 минут на URLs:
     - `https://pmr-exchange-web.onrender.com/health`
     - `https://pmr-exchange-bot.onrender.com/`

2. **Для полноценной работы добавьте:**
   - PostgreSQL на [Supabase](https://supabase.com) (бесплатно)
   - Redis на [Upstash](https://upstash.com) (бесплатно)

## 🔧 Проверка работы:

1. Откройте: `https://pmr-exchange-web.onrender.com`
2. В Telegram найдите вашего бота
3. Отправьте `/start`
4. Нажмите "💱 Открыть обменник"

Готово! Ваш обменник работает! 🎉