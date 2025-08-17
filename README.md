# 💱 Exchange PMR - Telegram Mini App

Telegram Mini App для обменника валют в Приднестровье с real-time курсами, калькулятором и системой бронирования.

## 🚀 Функционал

- 📊 Актуальные курсы валют (USD, EUR, MDL к рублю ПМР)
- 🧮 Калькулятор обмена с комиссией
- 📝 Создание и отслеживание заявок на обмен
- 🏢 Выбор офиса или доставки
- 📈 Графики изменения курсов
- 👤 Личный кабинет со статистикой
- 🎁 Реферальная программа
- 🔔 Real-time обновления через WebSocket

## 🛠 Технологии

### Frontend
- Vue 3 (Composition API)
- TypeScript
- Tailwind CSS
- Pinia
- Telegram Web App API

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL
- Redis
- Socket.io
- Bull.js (очереди)

## 📦 Установка

### Требования
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- npm 10+

### Шаги установки

1. Клонируйте репозиторий:
```bash
git clone https://github.com/your-repo/exchange-pmr.git
cd exchange-pmr
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
# Отредактируйте .env и добавьте ваши настройки
```

4. Запустите базу данных и Redis через Docker:
```bash
docker-compose up -d postgres redis
```

5. Выполните миграции базы данных:
```bash
npm run -w @exchange/api db:migrate
```

## 🚀 Запуск

### Режим разработки

Запуск всех сервисов:
```bash
# Frontend
npm run web:dev

# Backend (в другом терминале)
npm run api:dev

# Bot (в третьем терминале)
npm run bot:dev
```

### Production через Docker

```bash
docker-compose up -d
```

## 📱 Настройка Telegram Bot

1. Создайте бота через [@BotFather](https://t.me/botfather)
2. Получите токен бота
3. Включите режим Mini App:
   ```
   /setmenubutton
   Выберите вашего бота
   Введите URL вашего Mini App
   ```
4. Добавьте токен в `.env`:
   ```
   BOT_TOKEN=your_bot_token_here
   ```

## 🗂 Структура проекта

```
exchange-miniapp/
├── apps/
│   ├── web/          # Vue 3 Mini App
│   ├── api/          # Express API
│   └── bot/          # Telegram Bot
├── packages/
│   ├── shared/       # Общие типы
│   └── database/     # Модели БД
└── docker/           # Docker конфигурации
```

## 📝 API Endpoints

### Авторизация
- `POST /api/auth/telegram` - Вход через Telegram
- `GET /api/auth/me` - Текущий пользователь

### Курсы валют
- `GET /api/rates/current` - Текущие курсы
- `GET /api/rates/history` - История курсов
- `POST /api/calculate` - Расчет обмена

### Операции
- `GET /api/operations` - Список операций
- `POST /api/operations` - Создать операцию
- `GET /api/operations/:code` - Детали операции
- `POST /api/operations/:id/cancel` - Отменить

## 🔧 Скрипты

```json
{
  "dev": "Запуск всех сервисов в dev режиме",
  "build": "Сборка всех приложений",
  "web:dev": "Запуск frontend",
  "api:dev": "Запуск backend",
  "bot:dev": "Запуск бота",
  "docker:up": "Запуск через Docker",
  "docker:down": "Остановка Docker"
}
```

## 🔐 Безопасность

- Валидация Telegram InitData
- Rate limiting
- SQL injection защита
- XSS защита
- HTTPS only в production

## 📄 Лицензия

MIT

## 👥 Контакты

- Telegram: [@pmr_exchange_support](https://t.me/pmr_exchange_support)
- Email: support@exchange-pmr.com