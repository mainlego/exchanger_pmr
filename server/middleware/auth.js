const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Проверка данных от Telegram
const verifyTelegramData = (initData) => {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  if (!BOT_TOKEN) {
    console.error('BOT_TOKEN not configured');
    return null;
  }

  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');

  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(BOT_TOKEN)
    .digest();

  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (calculatedHash !== hash) {
    return null;
  }

  // Проверка времени
  const authDate = parseInt(urlParams.get('auth_date') || '0');
  const currentTime = Math.floor(Date.now() / 1000);
  
  // Данные действительны 24 часа
  if (currentTime - authDate > 86400) {
    return null;
  }

  const userString = urlParams.get('user');
  if (!userString) {
    return null;
  }

  try {
    return JSON.parse(userString);
  } catch {
    return null;
  }
};

// Middleware для проверки авторизации
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Создание JWT токена
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      telegram_id: user.telegram_id,
      username: user.username
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = {
  verifyTelegramData,
  authMiddleware,
  generateToken
};