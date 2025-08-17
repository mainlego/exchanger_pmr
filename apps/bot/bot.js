const TelegramBot = require('node-telegram-bot-api')
const express = require('express')
require('dotenv').config()

const token = process.env.BOT_TOKEN
const PORT = process.env.PORT || 10000
const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const WEBAPP_URL = process.env.CLIENT_URL || 'https://pmr-exchange-web.onrender.com'

if (!token) {
  console.error('❌ BOT_TOKEN не найден!')
  process.exit(1)
}

// Express для Render
const app = express()
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ status: 'Bot is running', timestamp: new Date().toISOString() })
})

// Создаем бота
const bot = IS_PRODUCTION 
  ? new TelegramBot(token, { webHook: true })
  : new TelegramBot(token, { polling: true })

if (IS_PRODUCTION) {
  const webhookUrl = `https://${process.env.RENDER_EXTERNAL_HOSTNAME || 'pmr-exchange-bot.onrender.com'}/bot${token}`
  bot.setWebHook(webhookUrl)
  
  app.post(`/bot${token}`, (req, res) => {
    bot.processUpdate(req.body)
    res.sendStatus(200)
  })
}

// Команды бота
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id
  const firstName = msg.from?.first_name || 'Пользователь'
  
  const welcomeMessage = `
👋 Привет, ${firstName}!

Добро пожаловать в *Обменник ПМР* - лучший сервис обмена валют в Приднестровье!

💱 *Актуальные курсы:*
🇺🇸 USD: 16.10 / 16.50 руб
🇪🇺 EUR: 18.42 / 19.54 руб
🇲🇩 MDL: 0.94 / 1.05 руб
🇺🇦 UAH: 0.36 / 0.43 руб
🇷🇺 RUB: 0.19 / 0.21 руб

Нажмите кнопку ниже, чтобы открыть приложение:`

  bot.sendMessage(chatId, welcomeMessage, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🚀 Открыть обменник', web_app: { url: WEBAPP_URL } }],
        [
          { text: '📊 Курсы', callback_data: 'rates' },
          { text: '💬 Поддержка', url: 'https://t.me/pmr_exchange_support' }
        ]
      ]
    }
  })
})

bot.onText(/\/rates|📊/, (msg) => {
  const chatId = msg.chat.id
  
  const ratesMessage = `
💱 *Актуальные курсы валют*

🇺🇸 *USD/RUP* Доллар США
Покупка: *16.10* руб
Продажа: *16.50* руб

🇪🇺 *EUR/RUP* Евро
Покупка: *18.42* руб
Продажа: *19.54* руб

🇲🇩 *MDL/RUP* Молдавский лей
Покупка: *0.94* руб
Продажа: *1.05* руб

🇺🇦 *UAH/RUP* Гривна
Покупка: *0.36* руб
Продажа: *0.43* руб

🇷🇺 *RUB/RUP* Рубль РФ
Покупка: *0.19* руб
Продажа: *0.21* руб`

  bot.sendMessage(chatId, ratesMessage, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '💱 Открыть калькулятор', web_app: { url: WEBAPP_URL } }]
      ]
    }
  })
})

bot.on('callback_query', (callbackQuery) => {
  const chatId = callbackQuery.message?.chat.id
  const data = callbackQuery.data
  
  if (!chatId) return

  if (data === 'rates') {
    bot.emit('text', { chat: { id: chatId }, text: '/rates' })
  }
  
  bot.answerCallbackQuery(callbackQuery.id)
})

// Запуск сервера
if (IS_PRODUCTION) {
  app.listen(PORT, () => {
    console.log(`🌐 Express server: ${PORT}`)
    console.log('🤖 Bot: webhook mode')
    console.log(`📱 WebApp: ${WEBAPP_URL}`)
  })
} else {
  console.log('🤖 Bot: polling mode')
  console.log(`📱 WebApp: ${WEBAPP_URL}`)
}

bot.on('polling_error', console.error)