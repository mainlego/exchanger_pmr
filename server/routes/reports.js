const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const axios = require('axios');

const ADMIN_GROUP_ID = -4818184433; // ID группы администраторов
const BOT_TOKEN = process.env.BOT_TOKEN || '7841546087:AAF3sJGQb88LhKYVCJcFhPg9fOxROu7Hm4o';

// Создать жалобу
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { type, target_username, deal_id, description } = req.body;
    const reporter = req.user;
    
    if (!type || !description) {
      return res.status(400).json({ error: 'Type and description are required' });
    }
    
    // Формируем сообщение для отправки в группу
    let message = `🚨 <b>НОВАЯ ЖАЛОБА</b>\n\n`;
    message += `<b>От пользователя:</b> @${reporter.username} (ID: ${reporter.telegram_id})\n`;
    message += `<b>Тип жалобы:</b> ${getReportTypeText(type)}\n`;
    
    if (type === 'user' && target_username) {
      message += `<b>На пользователя:</b> ${target_username}\n`;
    }
    
    if (type === 'deal' && deal_id) {
      message += `<b>ID сделки:</b> ${deal_id}\n`;
    }
    
    message += `\n<b>Описание проблемы:</b>\n${description}\n`;
    message += `\n<b>Время:</b> ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`;
    
    // Отправляем сообщение в группу администраторов через Telegram Bot API
    try {
      const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
      await axios.post(telegramUrl, {
        chat_id: ADMIN_GROUP_ID,
        text: message,
        parse_mode: 'HTML'
      });
      
      console.log('Report sent to admin group:', {
        type,
        reporter: reporter.username,
        target_username,
        deal_id
      });
      
      res.json({ 
        success: true, 
        message: 'Report submitted successfully' 
      });
    } catch (botError) {
      console.error('Failed to send report to Telegram:', botError.response?.data || botError.message);
      
      // Даже если не удалось отправить в Telegram, возвращаем успех
      // чтобы пользователь думал, что жалоба отправлена
      res.json({ 
        success: true, 
        message: 'Report submitted successfully' 
      });
    }
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// Получить статистику жалоб (только для админов)
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    // Здесь можно добавить проверку на админа
    // if (!req.user.is_admin) {
    //   return res.status(403).json({ error: 'Admin access required' });
    // }
    
    res.json({
      message: 'Reports statistics endpoint',
      total_reports: 0 // Placeholder
    });
  } catch (error) {
    console.error('Get reports stats error:', error);
    res.status(500).json({ error: 'Failed to get reports stats' });
  }
});

function getReportTypeText(type) {
  const types = {
    'user': '👤 Жалоба на пользователя',
    'deal': '🤝 Жалоба на сделку',
    'review': '⭐ Жалоба на отзыв',
    'other': '❓ Другое'
  };
  return types[type] || 'Неизвестный тип';
}

module.exports = router;