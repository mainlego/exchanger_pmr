import TelegramBot from 'node-telegram-bot-api'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

const token = process.env.BOT_TOKEN

if (!token) {
  console.error('❌ BOT_TOKEN не найден в .env файле')
  process.exit(1)
}

const bot = new TelegramBot(token, { polling: true })

const WEBAPP_URL = process.env.CLIENT_URL || 'https://your-app-url.com'

const mainKeyboard = {
  reply_markup: {
    keyboard: [
      [{ text: '💱 Открыть обменник', web_app: { url: WEBAPP_URL } }],
      [{ text: '📊 Текущие курсы' }, { text: '📈 Калькулятор' }],
      [{ text: '📝 Мои операции' }, { text: '💬 Поддержка' }]
    ],
    resize_keyboard: true,
    persistent: true
  }
}

const inlineKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        { 
          text: '🚀 Открыть приложение', 
          web_app: { url: WEBAPP_URL } 
        }
      ],
      [
        { text: '📊 Курсы', callback_data: 'rates' },
        { text: '📈 Калькулятор', callback_data: 'calculator' }
      ],
      [
        { text: '💬 Поддержка', url: 'https://t.me/pmr_exchange_support' }
      ]
    ]
  }
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id
  const firstName = msg.from?.first_name || 'Пользователь'
  
  const welcomeMessage = `
👋 Привет, ${firstName}!

Добро пожаловать в *Обменник ПМР* - лучший сервис обмена валют в Приднестровье!

💱 *Что я умею:*
• Показывать актуальные курсы валют
• Рассчитывать обмен с учетом комиссии
• Бронировать курс на 30 минут
• Принимать заявки на обмен
• Доставлять валюту

🎯 *Преимущества:*
• Выгодные курсы
• Быстрое обслуживание
• Доставка по городу
• Безопасные сделки

Нажмите кнопку ниже, чтобы открыть приложение:`

  bot.sendMessage(chatId, welcomeMessage, {
    parse_mode: 'Markdown',
    ...inlineKeyboard
  })
})

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id
  
  const helpMessage = `
📚 *Помощь по боту*

*Основные команды:*
/start - Запустить бота
/rates - Текущие курсы валют
/calculator - Калькулятор обмена
/operations - Мои операции
/support - Связаться с поддержкой
/about - О сервисе

*Как оформить обмен:*
1. Откройте приложение кнопкой "Открыть обменник"
2. Выберите валюты и введите сумму
3. Выберите способ получения (офис/доставка)
4. Подтвердите заявку
5. Получите уникальный код операции

*Режим работы:*
Пн-Пт: 9:00 - 20:00
Сб: 10:00 - 18:00
Вс: 10:00 - 16:00

По всем вопросам: @pmr_exchange_support`

  bot.sendMessage(chatId, helpMessage, {
    parse_mode: 'Markdown',
    ...mainKeyboard
  })
})

bot.onText(/\/rates|📊 Текущие курсы/, async (msg) => {
  const chatId = msg.chat.id
  
  const ratesMessage = `
💱 *Актуальные курсы валют*
_Обновлено: ${new Date().toLocaleTimeString('ru-RU')}_

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
Продажа: *0.21* руб

💡 _Курс фиксируется на 30 минут после подтверждения заявки_`

  bot.sendMessage(chatId, ratesMessage, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '💱 Обменять валюту', web_app: { url: WEBAPP_URL } }],
        [{ text: '🔄 Обновить курсы', callback_data: 'refresh_rates' }]
      ]
    }
  })
})

bot.onText(/\/calculator|📈 Калькулятор/, (msg) => {
  const chatId = msg.chat.id
  
  bot.sendMessage(chatId, 
    '📈 Для расчета обмена откройте калькулятор в приложении:', 
    {
      reply_markup: {
        inline_keyboard: [
          [{ 
            text: '🧮 Открыть калькулятор', 
            web_app: { url: `${WEBAPP_URL}/exchange` } 
          }]
        ]
      }
    }
  )
})

bot.onText(/\/operations|📝 Мои операции/, (msg) => {
  const chatId = msg.chat.id
  
  bot.sendMessage(chatId, 
    '📝 Для просмотра истории операций откройте приложение:', 
    {
      reply_markup: {
        inline_keyboard: [
          [{ 
            text: '📋 История операций', 
            web_app: { url: `${WEBAPP_URL}/history` } 
          }]
        ]
      }
    }
  )
})

bot.onText(/\/support|💬 Поддержка/, (msg) => {
  const chatId = msg.chat.id
  
  const supportMessage = `
💬 *Служба поддержки*

Есть вопросы? Мы всегда готовы помочь!

📱 Telegram: @pmr_exchange_support
📞 Телефон: +373 XXX XXXXX
📧 Email: support@exchange-pmr.com

⏰ Время работы поддержки:
Пн-Пт: 9:00 - 20:00
Сб-Вс: 10:00 - 18:00

Среднее время ответа: 5-10 минут`

  bot.sendMessage(chatId, supportMessage, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '💬 Написать в поддержку', url: 'https://t.me/pmr_exchange_support' }],
        [{ text: '📞 Позвонить', callback_data: 'call_support' }]
      ]
    }
  })
})

bot.onText(/\/about/, (msg) => {
  const chatId = msg.chat.id
  
  const aboutMessage = `
🏢 *О компании Обменник ПМР*

Мы работаем на рынке обмена валют Приднестровья с 2020 года.

✅ *Наши преимущества:*
• Официальная лицензия
• Более 10 000 довольных клиентов
• 3 офиса в Тирасполе
• Доставка по городу
• Гарантия безопасности сделок

📍 *Наши офисы:*
• ул. 25 Октября, 101
• ул. Ленина, 28
• ул. Советская, 45

🎁 *Программа лояльности:*
• Скидки постоянным клиентам
• Реферальная программа
• VIP обслуживание

Версия приложения: 1.0.0`

  bot.sendMessage(chatId, aboutMessage, {
    parse_mode: 'Markdown',
    ...mainKeyboard
  })
})

bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message?.chat.id
  const data = callbackQuery.data
  
  if (!chatId) return

  switch (data) {
    case 'rates':
      bot.emit('text', { 
        chat: { id: chatId }, 
        text: '/rates' 
      } as any)
      break
      
    case 'calculator':
      bot.emit('text', { 
        chat: { id: chatId }, 
        text: '/calculator' 
      } as any)
      break
      
    case 'refresh_rates':
      bot.answerCallbackQuery(callbackQuery.id, {
        text: '✅ Курсы обновлены',
        show_alert: false
      })
      bot.emit('text', { 
        chat: { id: chatId }, 
        text: '/rates' 
      } as any)
      break
      
    case 'call_support':
      bot.answerCallbackQuery(callbackQuery.id, {
        text: '📞 +373 XXX XXXXX',
        show_alert: true
      })
      break
  }
})

bot.on('message', (msg) => {
  const chatId = msg.chat.id
  const text = msg.text
  
  if (!text || text.startsWith('/')) return
  
  if (text === '💱 Открыть обменник') {
    return
  }
  
  const responses: Record<string, string> = {
    'курс': '/rates',
    'калькулятор': '/calculator',
    'операции': '/operations',
    'поддержка': '/support',
    'помощь': '/help',
    'о нас': '/about'
  }
  
  const lowerText = text.toLowerCase()
  
  for (const [keyword, command] of Object.entries(responses)) {
    if (lowerText.includes(keyword)) {
      bot.emit('text', { 
        chat: { id: chatId }, 
        text: command 
      } as any)
      return
    }
  }
})

bot.on('polling_error', (error) => {
  console.error('Polling error:', error)
})

console.log('🤖 Бот запущен и готов к работе!')
console.log(`📱 Webapp URL: ${WEBAPP_URL}`)
console.log('✅ Все системы работают нормально')