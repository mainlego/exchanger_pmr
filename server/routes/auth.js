const router = require('express').Router();
const { User } = require('../db');
const { verifyTelegramData, generateToken } = require('../middleware/auth');

// Вход через Telegram
router.post('/telegram', async (req, res) => {
  try {
    const { initData } = req.body;
    
    if (!initData) {
      return res.status(400).json({ error: 'Init data required' });
    }

    const telegramUser = verifyTelegramData(initData);
    
    if (!telegramUser) {
      return res.status(401).json({ error: 'Invalid Telegram data' });
    }

    // Поиск или создание пользователя
    let user = await User.findOne({ telegram_id: telegramUser.id });

    if (!user) {
      // Создаем нового пользователя
      user = await User.create({
        telegram_id: telegramUser.id,
        username: telegramUser.username || null,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name || null,
        photo_url: telegramUser.photo_url || null
      });
    } else {
      // Обновляем данные существующего пользователя
      user.username = telegramUser.username || user.username;
      user.first_name = telegramUser.first_name;
      user.last_name = telegramUser.last_name || user.last_name;
      user.photo_url = telegramUser.photo_url || user.photo_url;
      user.last_seen = new Date();
      await user.save();
    }

    const token = generateToken(user);
    
    res.json({
      token,
      user: user.toObject()
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

module.exports = router;