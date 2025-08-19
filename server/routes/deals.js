const router = require('express').Router();
const { Deal, Offer, User, DealMessage } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { notifyNewDeal, notifyDealStatusChange } = require('../services/notifications');

// Создать новую сделку
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { offer_id, amount, message, contact_telegram, contact_phone } = req.body;
    const taker_id = req.user.id;

    // Проверяем предложение
    const offer = await Offer.findById(offer_id)
      .populate('user_id', 'username first_name last_name telegram_id');

    if (!offer || !offer.is_active) {
      return res.status(404).json({ error: 'Offer not found or inactive' });
    }

    // Проверяем, что пользователь не создает сделку сам с собой
    if (offer.user_id._id.toString() === taker_id) {
      return res.status(400).json({ error: 'Cannot create deal with yourself' });
    }

    // Проверяем лимиты суммы
    if (amount < offer.min_amount || amount > offer.max_amount) {
      return res.status(400).json({ 
        error: `Amount must be between ${offer.min_amount} and ${offer.max_amount}` 
      });
    }

    // Создаем сделку
    const deal = await Deal.create({
      offer_id: offer._id,
      maker_id: offer.user_id._id,
      taker_id,
      amount,
      message,
      contact_telegram,
      contact_phone,
      status: 'pending'
    });

    console.log('Created deal:', {
      id: deal._id,
      maker_id: offer.user_id._id,
      taker_id,
      amount,
      status: 'pending'
    });

    // Получаем информацию о taker
    const taker = await User.findById(taker_id)
      .select('username first_name last_name telegram_id');

    // Отправляем уведомление maker через Telegram
    console.log('Sending notification to maker:', offer.user_id._id);
    await notifyNewDeal(deal, taker.first_name || taker.username || 'Пользователь');

    // Отправляем уведомление через WebSocket
    const io = req.app.locals.io;
    if (io) {
      io.to(`user:${offer.user_id._id}`).emit('new_deal', {
        ...deal.toObject(),
        offer: offer.toObject(),
        taker: taker.toObject()
      });
    }

    // Возвращаем полную информацию о сделке
    const populatedDeal = await Deal.findById(deal._id)
      .populate({
        path: 'offer_id',
        select: 'type currency_from currency_to rate location district'
      })
      .populate('maker_id', 'username first_name last_name telegram_id rating')
      .populate('taker_id', 'username first_name last_name telegram_id rating')
      .lean();

    res.status(201).json(populatedDeal);
  } catch (error) {
    console.error('Create deal error:', error);
    res.status(500).json({ error: 'Failed to create deal' });
  }
});

// Получить мои сделки
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const { status, role } = req.query;
    const userId = req.user.id;

    console.log('Fetching deals for user:', userId, 'with filters:', { status, role });

    // Построение фильтра
    const filter = {};
    
    // Фильтр по роли (maker или taker)
    if (role === 'maker') {
      filter.maker_id = userId;
    } else if (role === 'taker') {
      filter.taker_id = userId;
    } else {
      filter.$or = [{ maker_id: userId }, { taker_id: userId }];
    }

    // Фильтр по статусу
    if (status) {
      filter.status = status;
    }

    console.log('Deal filter:', JSON.stringify(filter));

    const deals = await Deal.find(filter)
      .populate({
        path: 'offer_id',
        select: 'type currency_from currency_to rate location district'
      })
      .populate('maker_id', 'username first_name last_name telegram_id rating photo_url')
      .populate('taker_id', 'username first_name last_name telegram_id rating photo_url')
      .sort({ createdAt: -1 })
      .lean();

    console.log(`Found ${deals.length} deals for user ${userId}`);

    res.json(deals);
  } catch (error) {
    console.error('Get my deals error:', error);
    res.status(500).json({ error: 'Failed to get deals' });
  }
});

// Получить сделку по ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deal = await Deal.findById(id)
      .populate({
        path: 'offer_id',
        select: 'type currency_from currency_to rate location district comment'
      })
      .populate('maker_id', 'username first_name last_name telegram_id rating photo_url')
      .populate('taker_id', 'username first_name last_name telegram_id rating photo_url')
      .lean();

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    // Проверяем доступ к сделке
    if (deal.maker_id._id.toString() !== userId && deal.taker_id._id.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(deal);
  } catch (error) {
    console.error('Get deal error:', error);
    res.status(500).json({ error: 'Failed to get deal' });
  }
});

// Обновить статус сделки
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // Проверяем сделку и права доступа
    const deal = await Deal.findById(id);

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    const isMaker = deal.maker_id.toString() === userId;
    const isTaker = deal.taker_id.toString() === userId;

    if (!isMaker && !isTaker) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Обработка завершения сделки - требуется подтверждение от обеих сторон
    if (status === 'completed' && deal.status === 'accepted') {
      // Устанавливаем флаг подтверждения для текущего пользователя
      if (isMaker) {
        deal.maker_confirmed = true;
      } else if (isTaker) {
        deal.taker_confirmed = true;
      }

      // Если обе стороны подтвердили - завершаем сделку
      if (deal.maker_confirmed && deal.taker_confirmed) {
        deal.status = 'completed';
        deal.completed_at = new Date();
        
        // Обновляем счетчики пользователей
        await User.updateMany(
          { _id: { $in: [deal.maker_id, deal.taker_id] } },
          { $inc: { deals_count: 1 } }
        );
      }
      
      await deal.save();

      // Отправляем уведомления
      const otherUserId = isMaker ? deal.taker_id : deal.maker_id;
      const io = req.app.locals.io;
      
      if (deal.status === 'completed') {
        await notifyDealStatusChange(id, 'completed', otherUserId);
        if (io) {
          io.to(`user:${otherUserId}`).emit('deal_status_changed', {
            deal_id: id,
            status: 'completed',
            changed_by: userId
          });
        }
      } else {
        // Уведомляем о подтверждении от одной стороны
        if (io) {
          io.to(`user:${otherUserId}`).emit('deal_confirmation', {
            deal_id: id,
            confirmed_by: userId,
            maker_confirmed: deal.maker_confirmed,
            taker_confirmed: deal.taker_confirmed
          });
        }
      }
      
      return res.json(deal);
    }

    // Остальные переходы статусов
    const allowedTransitions = {
      pending: {
        accepted: [deal.maker_id.toString()], // Только maker может принять
        cancelled: [deal.maker_id.toString(), deal.taker_id.toString()] // Оба могут отменить
      },
      accepted: {
        disputed: [deal.maker_id.toString(), deal.taker_id.toString()], // Оба могут оспорить
        cancelled: [deal.maker_id.toString(), deal.taker_id.toString()] // Оба могут отменить
      }
    };

    const currentStatus = deal.status;
    const allowedUsers = allowedTransitions[currentStatus]?.[status];

    if (!allowedUsers || !allowedUsers.includes(userId)) {
      return res.status(403).json({ 
        error: 'Not authorized to change status or invalid status transition' 
      });
    }

    // Обновляем статус
    deal.status = status;
    await deal.save();

    // Отправляем уведомление другому участнику
    const otherUserId = userId === deal.maker_id.toString() ? deal.taker_id : deal.maker_id;
    await notifyDealStatusChange(id, status, otherUserId);

    // Отправляем уведомления через WebSocket
    const io = req.app.locals.io;
    if (io) {
      io.to(`user:${otherUserId}`).emit('deal_status_changed', {
        deal_id: id,
        status,
        changed_by: userId
      });
    }

    res.json(deal);
  } catch (error) {
    console.error('Update deal status error:', error);
    res.status(500).json({ error: 'Failed to update deal status' });
  }
});

// Добавить сообщение к сделке
router.post('/:id/messages', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    // Проверяем доступ к сделке
    const deal = await Deal.findById(id).select('maker_id taker_id');

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    if (deal.maker_id.toString() !== userId && deal.taker_id.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Добавляем сообщение
    const dealMessage = await DealMessage.create({
      deal_id: id,
      user_id: userId,
      message
    });

    // Отправляем уведомление другому участнику
    const io = req.app.locals.io;
    if (io) {
      const otherUserId = userId === deal.maker_id.toString() ? deal.taker_id : deal.maker_id;
      io.to(`user:${otherUserId}`).emit('new_deal_message', {
        deal_id: id,
        message: dealMessage
      });
    }

    res.status(201).json(dealMessage);
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

// Получить сообщения сделки
router.get('/:id/messages', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Проверяем доступ к сделке
    const deal = await Deal.findById(id).select('maker_id taker_id');

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    if (deal.maker_id.toString() !== userId && deal.taker_id.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Получаем сообщения
    const messages = await DealMessage.find({ deal_id: id })
      .populate('user_id', 'username first_name last_name photo_url')
      .sort({ createdAt: 1 })
      .lean();

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Получить статистику по сделкам
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const [
      pendingCount,
      acceptedCount,
      completedCount,
      cancelledCount,
      disputedCount,
      totalCount,
      asMakerCount,
      asTakerCount
    ] = await Promise.all([
      Deal.countDocuments({ $or: [{ maker_id: userId }, { taker_id: userId }], status: 'pending' }),
      Deal.countDocuments({ $or: [{ maker_id: userId }, { taker_id: userId }], status: 'accepted' }),
      Deal.countDocuments({ $or: [{ maker_id: userId }, { taker_id: userId }], status: 'completed' }),
      Deal.countDocuments({ $or: [{ maker_id: userId }, { taker_id: userId }], status: 'cancelled' }),
      Deal.countDocuments({ $or: [{ maker_id: userId }, { taker_id: userId }], status: 'disputed' }),
      Deal.countDocuments({ $or: [{ maker_id: userId }, { taker_id: userId }] }),
      Deal.countDocuments({ maker_id: userId }),
      Deal.countDocuments({ taker_id: userId })
    ]);

    res.json({
      pending_count: pendingCount,
      accepted_count: acceptedCount,
      completed_count: completedCount,
      cancelled_count: cancelledCount,
      disputed_count: disputedCount,
      total_count: totalCount,
      as_maker_count: asMakerCount,
      as_taker_count: asTakerCount
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

module.exports = router;