# 🚀 Инструкция по деплою на Render

## Шаг 1: Подготовка GitHub репозитория
1. Создайте репозиторий на GitHub
2. Запушьте код (уже сделано через git commit)

## Шаг 2: Регистрация на Render
1. Перейдите на [render.com](https://render.com)
2. Зарегистрируйтесь через GitHub аккаунт

## Шаг 3: Деплой через render.yaml
1. После входа в Render, нажмите **"New +"** → **"Blueprint"**
2. Подключите ваш GitHub репозиторий
3. Render автоматически найдет файл `render.yaml` и создаст все сервисы:
   - **p2p-exchange-api** - Backend API
   - **p2p-exchange-pmr** - Frontend 
   - **p2p-exchange-bot** - Telegram Bot

## Шаг 4: Настройка Telegram Bot
1. Откройте @BotFather в Telegram
2. Отправьте команду `/setmenubutton`
3. Выберите вашего бота
4. Введите URL вашего приложения: `https://p2p-exchange-pmr.onrender.com`
5. Введите текст кнопки: "Открыть приложение"

## Шаг 5: Обновление переменных окружения
После деплоя, обновите URL в настройках сервисов:
- В **p2p-exchange-api**: 
  - `CLIENT_URL` = URL вашего фронтенда
- В **p2p-exchange-bot**:
  - `WEB_APP_URL` = URL вашего фронтенда
  - `API_URL` = URL вашего API

## 🔑 Важные переменные окружения:
- `BOT_TOKEN`: 8200049903:AAETV6_6XOLA6SP-jaW2Hizsm5hVjv_p5CY
- `MONGODB_URI`: mongodb+srv://vladmelbiz:bfDndkQ6RrBbCyX5@tg-game-2.zsxexae.mongodb.net/p2p-exchange

## 📝 Примечания:
- Первый деплой может занять 5-10 минут
- Бесплатный план Render включает 750 часов в месяц
- Сервисы могут "засыпать" после 15 минут неактивности

## 🎉 После успешного деплоя:
1. Откройте вашего бота в Telegram
2. Нажмите кнопку "Открыть приложение"
3. Приложение готово к использованию!