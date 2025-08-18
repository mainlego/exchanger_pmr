const axios = require('axios');
const { User } = require('../db');

const BOT_TOKEN = process.env.BOT_TOKEN || '8200049903:AAETV6_6XOLA6SP-jaW2Hizsm5hVjv_p5CY';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Отправка уведомления через Telegram
async function sendTelegramNotification(telegramId, message, keyboard = null) {
  try {
    const params = {
      chat_id: telegramId,
      text: message,
      parse_mode: 'HTML'
    };

    if (keyboard) {
      params.reply_markup = JSON.stringify(keyboard);
    }

    const response = await axios.post(`${TELEGRAM_API}/sendMessage`, params);
    return response.data;
  } catch (error) {
    console.error('Error sending Telegram notification:', error.response?.data || error);
    return null;
  }
}

// Уведомление о новом предложении всем пользователям
async function notifyNewOffer(offer) {
  try {
    // Получаем всех пользователей, кроме создателя предложения
    const users = await User.find({ 
      _id: { $ne: offer.user_id },
      telegram_id: { $exists: true }
    }).select('telegram_id preferred_currencies').lean();

    const offerType = offer.type === 'buy' ? '💵 Покупка' : '💰 Продажа';
    const message = `
<b>🔥 Новое предложение!</b>

${offerType}
<b>${offer.amount_from} ${offer.currency_from} → ${offer.amount_to} ${offer.currency_to}</b>
Курс: ${offer.rate} ${offer.currency_to}/${offer.currency_from}
📍 ${offer.district}

<b>От:</b> ${offer.user_id?.first_name || 'Пользователь'}
⭐ Рейтинг: ${offer.user_id?.rating || 0} (${offer.user_id?.deals_count || 0} сделок)

<i>Нажмите кнопку ниже, чтобы открыть приложение</i>
    `.trim();

    const keyboard = {
      inline_keyboard: [[
        {
          text: '📱 Открыть предложение',
          web_app: {
            url: `${process.env.WEB_APP_URL || 'https://p2p-exchange-pmr.onrender.com'}/#/offers/${offer._id}`
          }
        }
      ]]
    };

    // Отправляем уведомления пользователям, которые интересуются этими валютами
    const notifications = users
      .filter(user => {
        // Если у пользователя нет предпочтений, отправляем все
        if (!user.preferred_currencies || user.preferred_currencies.length === 0) {
          return true;
        }
        // Проверяем, интересуют ли пользователя эти валюты
        return user.preferred_currencies.includes(offer.currency_from) || 
               user.preferred_currencies.includes(offer.currency_to);
      })
      .map(user => sendTelegramNotification(user.telegram_id, message, keyboard));

    await Promise.allSettled(notifications);
    console.log(`Sent notifications for new offer to ${notifications.length} users`);
  } catch (error) {
    console.error('Error notifying users about new offer:', error);
  }
}

// Уведомление о новой сделке
async function notifyNewDeal(deal, takerName) {
  try {
    const maker = await User.findById(deal.maker_id).select('telegram_id').lean();
    if (!maker?.telegram_id) return;

    const message = `
<b>🤝 У вас новая сделка!</b>

<b>Сумма:</b> ${deal.amount}
<b>От пользователя:</b> ${takerName}

<i>Откройте приложение для деталей</i>
    `.trim();

    const keyboard = {
      inline_keyboard: [[
        {
          text: '📱 Открыть сделку',
          web_app: {
            url: `${process.env.WEB_APP_URL || 'https://p2p-exchange-pmr.onrender.com'}/#/deals/${deal._id}`
          }
        }
      ]]
    };

    await sendTelegramNotification(maker.telegram_id, message, keyboard);
  } catch (error) {
    console.error('Error notifying about new deal:', error);
  }
}

// Уведомление об изменении статуса сделки
async function notifyDealStatusChange(dealId, status, userId) {
  try {
    const statusText = {
      accepted: '✅ принята',
      completed: '🎉 завершена',
      cancelled: '❌ отменена',
      disputed: '⚠️ оспорена'
    };

    const message = `
<b>📊 Статус вашей сделки изменен</b>

Новый статус: <b>${statusText[status] || status}</b>

<i>Откройте приложение для деталей</i>
    `.trim();

    const keyboard = {
      inline_keyboard: [[
        {
          text: '📱 Открыть сделку',
          web_app: {
            url: `${process.env.WEB_APP_URL || 'https://p2p-exchange-pmr.onrender.com'}/#/deals/${dealId}`
          }
        }
      ]]
    };

    const user = await User.findById(userId).select('telegram_id').lean();
    if (user?.telegram_id) {
      await sendTelegramNotification(user.telegram_id, message, keyboard);
    }
  } catch (error) {
    console.error('Error notifying about deal status change:', error);
  }
}

// Уведомление о новом отзыве
async function notifyNewReview(review) {
  try {
    const user = await User.findById(review.to_user_id).select('telegram_id').lean();
    if (!user?.telegram_id) return;

    const stars = '⭐'.repeat(review.rating);
    const message = `
<b>📝 У вас новый отзыв!</b>

<b>Рейтинг:</b> ${stars}
<b>От:</b> ${review.from_user_id?.first_name || 'Пользователь'}
${review.comment ? `<b>Комментарий:</b> ${review.comment}` : ''}

<i>Ваш общий рейтинг обновлен</i>
    `.trim();

    const keyboard = {
      inline_keyboard: [[
        {
          text: '📱 Открыть профиль',
          web_app: {
            url: `${process.env.WEB_APP_URL || 'https://p2p-exchange-pmr.onrender.com'}/#/profile`
          }
        }
      ]]
    };

    await sendTelegramNotification(user.telegram_id, message, keyboard);
  } catch (error) {
    console.error('Error notifying about new review:', error);
  }
}

module.exports = {
  sendTelegramNotification,
  notifyNewOffer,
  notifyNewDeal,
  notifyDealStatusChange,
  notifyNewReview
};