require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const http = require('http');

const bot = new Telegraf(process.env.BOT_TOKEN || '8200049903:AAETV6_6XOLA6SP-jaW2Hizsm5hVjv_p5CY');
const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://p2p-exchange-pmr.onrender.com';

// Bot instance management
let botLaunched = false;
let isShuttingDown = false;
let retryCount = 0;
const MAX_RETRIES = 5;

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
        [Markup.button.webApp('Открыть профиль', WEB_APP_URL + '/#/profile')]
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
        [Markup.button.webApp('Открыть сделку', `${WEB_APP_URL}/#/deals/${deal.id}`)]
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
        [Markup.button.webApp('Открыть сделку', `${WEB_APP_URL}/#/deals/${dealId}`)]
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
        [Markup.button.webApp('Открыть профиль', `${WEB_APP_URL}/#/profile`)]
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

// Start bot
console.log('Starting bot...');
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  RENDER: process.env.RENDER,
  BOT_TOKEN: process.env.BOT_TOKEN ? 'Set' : 'Not set',
  WEB_APP_URL: process.env.WEB_APP_URL
});

// Function to start bot with proper cleanup
async function startBot() {
  // Prevent multiple instances
  if (botLaunched) {
    console.log('Bot already launched, skipping...');
    return;
  }
  
  if (isShuttingDown) {
    console.log('Bot is shutting down, skipping start...');
    return;
  }
  
  try {
    console.log(`Starting bot (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
    
    // First, try to stop any existing bot instance
    try {
      await bot.stop();
      console.log('Stopped any existing bot instance');
    } catch (stopError) {
      // Ignore stop errors - bot might not be running
    }
    
    // Delete any existing webhook with longer timeout
    console.log('Deleting webhook...');
    try {
      await bot.telegram.deleteWebhook({ drop_pending_updates: true });
      console.log('Webhook deleted');
    } catch (webhookError) {
      console.error('Webhook deletion error (continuing anyway):', webhookError.message);
    }
    
    // Wait longer to ensure cleanup
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Now start with polling
    await bot.launch({
      dropPendingUpdates: true,
      allowedUpdates: [] // Receive all update types
    });
    
    botLaunched = true;
    console.log('🤖 Bot started successfully in polling mode');
    retryCount = 0; // Reset retry count on success
  } catch (error) {
    console.error('Failed to start bot:', error);
    botLaunched = false;
    retryCount++;
    
    if (retryCount >= MAX_RETRIES) {
      console.error(`Max retries (${MAX_RETRIES}) reached. Please check:`);
      console.error('1. Only one instance of the bot is running');
      console.error('2. The bot token is correct');
      console.error('3. No other services are using the same bot token');
      process.exit(1);
    }
    
    if (error.response?.error_code === 409) {
      console.error('Conflict: Another bot instance is using the same token.');
      const delay = 15 + retryCount * 5;
      console.error(`Waiting ${delay} seconds before retry...`);
      
      // Try aggressive cleanup
      try {
        await bot.telegram.deleteWebhook({ drop_pending_updates: true });
        await bot.stop();
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
      
      setTimeout(() => startBot(), delay * 1000);
    } else {
      // For other errors, retry after increasing delay
      const delay = 5 + retryCount * 3;
      console.error(`Retrying in ${delay} seconds...`);
      setTimeout(() => startBot(), delay * 1000);
    }
  }
}

// Start the bot
startBot();

// Create simple HTTP server for health checks
const PORT = process.env.PORT || 3001;
const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', bot: 'running' }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`Health check server running on port ${PORT}`);
});

// Enable graceful stop
async function gracefulShutdown(signal) {
  console.log(`Received ${signal}, shutting down gracefully...`);
  isShuttingDown = true;
  
  try {
    // Stop the bot
    if (botLaunched) {
      console.log('Stopping bot...');
      await bot.stop(signal);
      botLaunched = false;
      console.log('Bot stopped');
    }
    
    // Close HTTP server
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
    
    // Force exit after 10 seconds
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

process.once('SIGINT', () => gracefulShutdown('SIGINT'));
process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Log but don't shutdown on unhandled rejections
});