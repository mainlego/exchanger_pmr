require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf(process.env.BOT_TOKEN || '8200049903:AAETV6_6XOLA6SP-jaW2Hizsm5hVjv_p5CY');
const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://your-app.render.com';

// Start command
bot.start((ctx) => {
  const welcomeMessage = `
🎉 Добро пожаловать в P2P Exchange PMR!

Это платформа для безопасного обмена валют напрямую между людьми в Приднестровье.

💱 Что вы можете делать:
• Создавать предложения об обмене
• Находить выгодные курсы
• Связываться с проверенными обменниками
• Оставлять отзывы после сделок

Используйте кнопки ниже для навигации:
  `;

  ctx.reply(welcomeMessage, 
    Markup.keyboard([
      [Markup.button.webApp('🌐 Открыть приложение', WEB_APP_URL)],
      ['💱 Мои предложения', '🤝 Мои сделки'],
      ['⭐ Мой рейтинг', '❓ Помощь']
    ]).resize()
  );
});

// My offers command
bot.hears('💱 Мои предложения', async (ctx) => {
  try {
    // Here we would fetch user's offers from API
    ctx.reply('Ваши активные предложения:\n\nДля управления предложениями откройте веб-приложение:', 
      Markup.inlineKeyboard([
        [Markup.button.webApp('Открыть приложение', WEB_APP_URL)]
      ])
    );
  } catch (error) {
    ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
});

// My deals command
bot.hears('🤝 Мои сделки', async (ctx) => {
  try {
    ctx.reply('Ваши активные сделки:\n\nДля просмотра деталей откройте веб-приложение:', 
      Markup.inlineKeyboard([
        [Markup.button.webApp('Открыть приложение', WEB_APP_URL)]
      ])
    );
  } catch (error) {
    ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
});

// My rating command
bot.hears('⭐ Мой рейтинг', async (ctx) => {
  try {
    const userId = ctx.from.id;
    // Here we would fetch user's rating from API
    
    ctx.reply(`
Ваш профиль:
👤 Имя: ${ctx.from.first_name}
⭐ Рейтинг: 0.0
🤝 Сделок: 0
📅 Дата регистрации: сегодня

Для подробной информации откройте веб-приложение:
    `, 
      Markup.inlineKeyboard([
        [Markup.button.webApp('Открыть профиль', WEB_APP_URL + '/profile')]
      ])
    );
  } catch (error) {
    ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
});

// Help command
bot.hears('❓ Помощь', (ctx) => {
  ctx.reply(`
📖 Как пользоваться ботом:

1️⃣ Откройте веб-приложение через кнопку
2️⃣ Создайте предложение об обмене
3️⃣ Дождитесь откликов от других пользователей
4️⃣ Договоритесь о встрече через Telegram
5️⃣ После сделки оставьте отзыв

⚠️ Правила безопасности:
• Встречайтесь только в публичных местах
• Проверяйте купюры на подлинность
• Не передавайте деньги заранее
• Обращайте внимание на рейтинг пользователя

По всем вопросам: @support_pmr_exchange
  `);
});

// Handle any text
bot.on('text', (ctx) => {
  ctx.reply('Используйте кнопки меню для навигации или откройте веб-приложение:',
    Markup.inlineKeyboard([
      [Markup.button.webApp('🌐 Открыть приложение', WEB_APP_URL)]
    ])
  );
});

// Notification functions (to be called from server)
async function sendNewDealNotification(telegramId, deal) {
  try {
    await bot.telegram.sendMessage(telegramId, 
      `🔔 У вас новая сделка!\n\n` +
      `Сумма: ${deal.amount}\n` +
      `Пользователь: ${deal.taker_name}\n\n` +
      `Откройте приложение для деталей:`,
      Markup.inlineKeyboard([
        [Markup.button.webApp('Открыть сделку', `${WEB_APP_URL}/deals/${deal.id}`)]
      ])
    );
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

async function sendDealStatusNotification(telegramId, dealId, status) {
  const statusText = {
    accepted: '✅ принята',
    completed: '🎉 завершена',
    cancelled: '❌ отменена',
    disputed: '⚠️ оспорена'
  };

  try {
    await bot.telegram.sendMessage(telegramId, 
      `🔔 Статус вашей сделки изменен на: ${statusText[status] || status}\n\n` +
      `Откройте для деталей:`,
      Markup.inlineKeyboard([
        [Markup.button.webApp('Открыть сделку', `${WEB_APP_URL}/deals/${dealId}`)]
      ])
    );
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

async function sendNewReviewNotification(telegramId, review) {
  try {
    await bot.telegram.sendMessage(telegramId, 
      `⭐ У вас новый отзыв!\n\n` +
      `Рейтинг: ${'⭐'.repeat(review.rating)}\n` +
      `От: ${review.from_name}\n` +
      `Комментарий: ${review.comment || 'Без комментария'}\n\n` +
      `Ваш общий рейтинг обновлен.`,
      Markup.inlineKeyboard([
        [Markup.button.webApp('Открыть профиль', `${WEB_APP_URL}/profile`)]
      ])
    );
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

// Export notification functions for use in server
module.exports = {
  bot,
  sendNewDealNotification,
  sendDealStatusNotification,
  sendNewReviewNotification
};

// Start bot with webhook for production or polling for development
if (process.env.NODE_ENV === 'production' && process.env.RENDER) {
  // Use webhook in production on Render
  const WEBHOOK_DOMAIN = process.env.RENDER_EXTERNAL_URL || process.env.WEB_APP_URL;
  const WEBHOOK_PATH = `/bot${bot.secretPathComponent()}`;
  
  bot.telegram.setWebhook(`${WEBHOOK_DOMAIN}${WEBHOOK_PATH}`)
    .then(() => {
      console.log('🤖 Bot webhook set successfully');
    })
    .catch((error) => {
      console.error('Failed to set webhook:', error);
      process.exit(1);
    });
} else {
  // Use polling in development
  bot.launch({
    dropPendingUpdates: true // Ignore old messages
  }).then(() => {
    console.log('🤖 Bot started successfully in polling mode');
  }).catch((error) => {
    console.error('Failed to start bot:', error);
    if (error.response?.error_code === 409) {
      console.error('Another bot instance is already running. Please stop it first.');
      process.exit(1);
    }
  });
}

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));