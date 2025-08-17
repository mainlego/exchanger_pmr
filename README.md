# P2P Exchange PMR

Платформа для прямого обмена валют между людьми в Приднестровье через Telegram Mini App.

## Функционал

- 💱 Создание и управление предложениями обмена валют
- 🔍 Поиск предложений с фильтрами по валютам, суммам и районам
- 🤝 Система сделок между пользователями
- ⭐ Рейтинги и отзывы после завершения сделок
- 📱 Полная интеграция с Telegram
- 🔔 Уведомления о новых сделках и отзывах
- 💬 Прямая связь через Telegram

## Технологии

- **Frontend**: Vue 3, Tailwind CSS, Vite
- **Backend**: Node.js, Express, PostgreSQL
- **Bot**: Telegraf
- **Real-time**: Socket.io
- **Auth**: Telegram Web App API

## Установка

1. Клонируйте репозиторий
2. Установите зависимости:
```bash
npm run install:all
```

3. Настройте PostgreSQL и создайте базу данных `p2p_exchange`

4. Скопируйте и настройте .env файлы:
```bash
cp server/.env.example server/.env
cp bot/.env.example bot/.env
```

5. Обновите BOT_TOKEN в .env файлах

## Запуск в режиме разработки

```bash
npm run dev
```

Это запустит:
- Server: http://localhost:5000
- Client: http://localhost:3000
- Bot: Telegram bot

## Структура проекта

```
/
├── client/          # Vue 3 frontend
├── server/          # Express backend
│   ├── routes/      # API endpoints
│   ├── middleware/  # Auth middleware
│   └── db.js        # Database setup
├── bot/             # Telegram bot
└── package.json     # Root package
```

## API Endpoints

- `POST /api/auth/telegram` - Авторизация через Telegram
- `GET /api/offers` - Список предложений
- `POST /api/offers` - Создать предложение
- `GET /api/deals` - Список сделок
- `POST /api/deals` - Создать сделку
- `POST /api/reviews` - Оставить отзыв
- `GET /api/users/:id` - Профиль пользователя

## Деплой

### Frontend (Render)
1. Создайте Static Site на Render
2. Build Command: `cd client && npm install && npm run build`
3. Publish Directory: `client/dist`

### Backend (Render)
1. Создайте Web Service на Render
2. Build Command: `cd server && npm install`
3. Start Command: `cd server && npm start`
4. Добавьте PostgreSQL database

### Bot (Render)
1. Создайте Background Worker на Render
2. Build Command: `cd bot && npm install`
3. Start Command: `cd bot && npm start`

## Безопасность

- Все данные проверяются через Telegram InitData
- JWT токены для сессий
- Rate limiting на API
- Валидация всех входных данных

## Лицензия

MIT