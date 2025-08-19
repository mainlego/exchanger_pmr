const router = require('express').Router();
const { Offer, User } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { notifyNewOffer } = require('../services/notifications');

// Получить все активные предложения
router.get('/', async (req, res) => {
  try {
    const { 
      type, 
      currency_from, 
      currency_to, 
      district,
      min_amount,
      max_amount,
      sort = 'createdAt',
      order = 'DESC'
    } = req.query;

    // Построение фильтра
    const filter = {
      is_active: true,
      expires_at: { $gt: new Date() }
    };

    if (type) filter.type = type;
    if (currency_from) filter.currency_from = currency_from;
    if (currency_to) filter.currency_to = currency_to;
    if (district) filter.district = district;
    if (min_amount) filter.amount_from = { $gte: parseFloat(min_amount) };
    if (max_amount) filter.amount_from = { ...filter.amount_from, $lte: parseFloat(max_amount) };

    // Определение сортировки
    const sortOptions = {};
    const sortField = sort === 'created_at' ? 'createdAt' : sort;
    sortOptions[sortField] = order === 'ASC' ? 1 : -1;

    const offers = await Offer.find(filter)
      .populate('user_id', 'username first_name last_name photo_url rating deals_count is_verified is_online last_seen')
      .sort(sortOptions)
      .limit(50)
      .lean();

    // Форматируем ответ
    const formattedOffers = offers.map(offer => ({
      ...offer,
      username: offer.user_id?.username,
      first_name: offer.user_id?.first_name,
      last_name: offer.user_id?.last_name,
      photo_url: offer.user_id?.photo_url,
      rating: offer.user_id?.rating,
      deals_count: offer.user_id?.deals_count,
      is_verified: offer.user_id?.is_verified,
      is_online: offer.user_id?.is_online,
      last_seen: offer.user_id?.last_seen
    }));
    
    res.json(formattedOffers);
  } catch (error) {
    console.error('Get offers error:', error);
    res.status(500).json({ error: 'Failed to get offers' });
  }
});

// Создать новое предложение
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      type,
      currency_from,
      currency_to,
      amount_from,
      amount_to,
      rate,
      min_amount,
      max_amount,
      location,
      district,
      comment
    } = req.body;

    // Валидация
    if (!type || !currency_from || !currency_to || !amount_from || !rate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Creating offer for user:', req.user.id);
    
    const offer = await Offer.create({
      user_id: req.user.id,
      type,
      currency_from,
      currency_to,
      amount_from: parseFloat(amount_from),
      amount_to: parseFloat(amount_to || amount_from * rate),
      rate: parseFloat(rate),
      min_amount: parseFloat(min_amount || amount_from * 0.1),
      max_amount: parseFloat(max_amount || amount_from),
      location,
      district,
      comment
    });

    // Заполняем данные пользователя
    const populatedOffer = await Offer.findById(offer._id)
      .populate('user_id', 'username first_name last_name photo_url rating deals_count is_verified')
      .lean();
    
    console.log('Offer created:', populatedOffer);

    // Отправить уведомление через WebSocket
    const io = req.app.locals.io;
    if (io) {
      io.to('offers').emit('new_offer', offer);
      io.to(`currency:${currency_from}`).emit('new_offer', offer);
    }

    // Форматируем ответ для frontend
    const responseOffer = {
      ...populatedOffer,
      username: populatedOffer.user_id?.username,
      first_name: populatedOffer.user_id?.first_name,
      last_name: populatedOffer.user_id?.last_name,
      photo_url: populatedOffer.user_id?.photo_url,
      rating: populatedOffer.user_id?.rating,
      deals_count: populatedOffer.user_id?.deals_count,
      is_verified: populatedOffer.user_id?.is_verified
    };
    
    // Отправляем уведомления пользователям о новом предложении
    notifyNewOffer(populatedOffer).catch(err => {
      console.error('Failed to send notifications:', err);
    });
    
    res.status(201).json(responseOffer);
  } catch (error) {
    console.error('Create offer error:', error);
    res.status(500).json({ error: 'Failed to create offer' });
  }
});

// Получить предложение по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await Offer.findById(id)
      .populate('user_id', 'username first_name last_name photo_url rating deals_count is_verified is_online last_seen telegram_id')
      .lean();

    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    // Увеличить счетчик просмотров
    await Offer.findByIdAndUpdate(id, { $inc: { views_count: 1 } });

    // Форматируем ответ
    const formattedOffer = {
      ...offer,
      username: offer.user_id?.username,
      first_name: offer.user_id?.first_name,
      last_name: offer.user_id?.last_name,
      photo_url: offer.user_id?.photo_url,
      rating: offer.user_id?.rating,
      deals_count: offer.user_id?.deals_count,
      is_verified: offer.user_id?.is_verified,
      is_online: offer.user_id?.is_online,
      last_seen: offer.user_id?.last_seen,
      telegram_id: offer.user_id?.telegram_id
    };

    res.json(formattedOffer);
  } catch (error) {
    console.error('Get offer error:', error);
    res.status(500).json({ error: 'Failed to get offer' });
  }
});

// Обновить предложение
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Проверка владельца
    const offer = await Offer.findById(id);
    
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    if (offer.user_id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Разрешенные поля для обновления
    const allowedFields = ['rate', 'amount_from', 'amount_to', 'location', 'district', 'comment', 'is_active'];
    const updateData = {};
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    }

    const updatedOffer = await Offer.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedOffer);
  } catch (error) {
    console.error('Update offer error:', error);
    res.status(500).json({ error: 'Failed to update offer' });
  }
});

// Удалить (деактивировать) предложение
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Проверка владельца
    const offer = await Offer.findById(id);
    
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    if (offer.user_id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Деактивируем предложение
    await Offer.findByIdAndUpdate(id, { is_active: false });

    res.json({ message: 'Offer deactivated' });
  } catch (error) {
    console.error('Delete offer error:', error);
    res.status(500).json({ error: 'Failed to delete offer' });
  }
});

// Получить мои предложения
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const { active_only = 'true' } = req.query;

    const filter = { user_id: req.user.id };
    
    if (active_only === 'true') {
      filter.is_active = true;
      filter.expires_at = { $gt: new Date() };
    }

    const offers = await Offer.find(filter)
      .populate('user_id', 'username first_name last_name photo_url rating deals_count is_verified')
      .sort({ createdAt: -1 })
      .lean();

    // Форматируем ответ
    const formattedOffers = offers.map(offer => ({
      ...offer,
      username: offer.user_id?.username,
      first_name: offer.user_id?.first_name,
      last_name: offer.user_id?.last_name,
      photo_url: offer.user_id?.photo_url,
      rating: offer.user_id?.rating,
      deals_count: offer.user_id?.deals_count,
      is_verified: offer.user_id?.is_verified
    }));

    res.json(formattedOffers);
  } catch (error) {
    console.error('Get my offers error:', error);
    res.status(500).json({ error: 'Failed to get offers' });
  }
});

// Получить предложения пользователя
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { active_only = 'true' } = req.query;

    const filter = { user_id: userId };
    
    if (active_only === 'true') {
      filter.is_active = true;
      filter.expires_at = { $gt: new Date() };
    }

    const offers = await Offer.find(filter)
      .populate('user_id', 'username first_name last_name photo_url rating deals_count is_verified')
      .sort({ createdAt: -1 })
      .lean();

    // Форматируем ответ
    const formattedOffers = offers.map(offer => ({
      ...offer,
      username: offer.user_id?.username,
      first_name: offer.user_id?.first_name,
      last_name: offer.user_id?.last_name,
      photo_url: offer.user_id?.photo_url,
      rating: offer.user_id?.rating,
      deals_count: offer.user_id?.deals_count,
      is_verified: offer.user_id?.is_verified
    }));

    res.json(formattedOffers);
  } catch (error) {
    console.error('Get user offers error:', error);
    res.status(500).json({ error: 'Failed to get user offers' });
  }
});

module.exports = router;