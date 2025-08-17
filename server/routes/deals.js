const router = require('express').Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

// Создать новую сделку
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { offer_id, amount, message } = req.body;
    const taker_id = req.user.id;

    // Проверяем предложение
    const offer = await db.query(
      'SELECT * FROM offers WHERE id = $1 AND is_active = true',
      [offer_id]
    );

    if (offer.rows.length === 0) {
      return res.status(404).json({ error: 'Offer not found or inactive' });
    }

    const offerData = offer.rows[0];

    // Проверяем, что пользователь не создает сделку сам с собой
    if (offerData.user_id === taker_id) {
      return res.status(400).json({ error: 'Cannot create deal with yourself' });
    }

    // Проверяем лимиты суммы
    if (amount < offerData.min_amount || amount > offerData.max_amount) {
      return res.status(400).json({ 
        error: `Amount must be between ${offerData.min_amount} and ${offerData.max_amount}` 
      });
    }

    // Создаем сделку
    const result = await db.query(
      `INSERT INTO deals (offer_id, maker_id, taker_id, amount, message, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [offer_id, offerData.user_id, taker_id, amount, message]
    );

    const deal = result.rows[0];

    // Получаем информацию о пользователях
    const users = await db.query(
      'SELECT id, telegram_id, username, first_name FROM users WHERE id IN ($1, $2)',
      [offerData.user_id, taker_id]
    );

    // Отправляем уведомление через WebSocket
    const io = req.app.locals.io;
    if (io) {
      io.to(`user:${offerData.user_id}`).emit('new_deal', {
        ...deal,
        offer: offerData,
        taker: users.rows.find(u => u.id === taker_id)
      });
    }

    res.status(201).json(deal);
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

    let query = `
      SELECT 
        d.*,
        o.type as offer_type,
        o.currency_from,
        o.currency_to,
        o.rate,
        o.location,
        o.district,
        maker.username as maker_username,
        maker.first_name as maker_first_name,
        maker.telegram_id as maker_telegram_id,
        maker.rating as maker_rating,
        taker.username as taker_username,
        taker.first_name as taker_first_name,
        taker.telegram_id as taker_telegram_id,
        taker.rating as taker_rating
      FROM deals d
      JOIN offers o ON d.offer_id = o.id
      JOIN users maker ON d.maker_id = maker.id
      JOIN users taker ON d.taker_id = taker.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    // Фильтр по роли (maker или taker)
    if (role === 'maker') {
      query += ` AND d.maker_id = $${paramCount++}`;
      params.push(userId);
    } else if (role === 'taker') {
      query += ` AND d.taker_id = $${paramCount++}`;
      params.push(userId);
    } else {
      query += ` AND (d.maker_id = $${paramCount} OR d.taker_id = $${paramCount})`;
      params.push(userId);
      paramCount++;
    }

    // Фильтр по статусу
    if (status) {
      query += ` AND d.status = $${paramCount++}`;
      params.push(status);
    }

    query += ' ORDER BY d.created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
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

    const result = await db.query(`
      SELECT 
        d.*,
        o.type as offer_type,
        o.currency_from,
        o.currency_to,
        o.rate,
        o.location,
        o.district,
        o.comment as offer_comment,
        maker.username as maker_username,
        maker.first_name as maker_first_name,
        maker.last_name as maker_last_name,
        maker.telegram_id as maker_telegram_id,
        maker.rating as maker_rating,
        maker.photo_url as maker_photo_url,
        taker.username as taker_username,
        taker.first_name as taker_first_name,
        taker.last_name as taker_last_name,
        taker.telegram_id as taker_telegram_id,
        taker.rating as taker_rating,
        taker.photo_url as taker_photo_url
      FROM deals d
      JOIN offers o ON d.offer_id = o.id
      JOIN users maker ON d.maker_id = maker.id
      JOIN users taker ON d.taker_id = taker.id
      WHERE d.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    const deal = result.rows[0];

    // Проверяем доступ к сделке
    if (deal.maker_id !== userId && deal.taker_id !== userId) {
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
    const deal = await db.query(
      'SELECT * FROM deals WHERE id = $1',
      [id]
    );

    if (deal.rows.length === 0) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    const dealData = deal.rows[0];

    // Определяем разрешенные переходы статусов
    const allowedTransitions = {
      pending: {
        accepted: [dealData.maker_id], // Только maker может принять
        cancelled: [dealData.maker_id, dealData.taker_id] // Оба могут отменить
      },
      accepted: {
        completed: [dealData.maker_id, dealData.taker_id], // Оба могут завершить
        disputed: [dealData.maker_id, dealData.taker_id], // Оба могут оспорить
        cancelled: [dealData.maker_id, dealData.taker_id] // Оба могут отменить
      }
    };

    const currentStatus = dealData.status;
    const allowedUsers = allowedTransitions[currentStatus]?.[status];

    if (!allowedUsers || !allowedUsers.includes(userId)) {
      return res.status(403).json({ 
        error: 'Not authorized to change status or invalid status transition' 
      });
    }

    // Обновляем статус
    const result = await db.query(
      `UPDATE deals 
       SET status = $1, 
           completed_at = CASE WHEN $1 = 'completed' THEN NOW() ELSE NULL END
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    // Если сделка завершена, обновляем счетчики пользователей
    if (status === 'completed') {
      await db.query(
        'UPDATE users SET deals_count = deals_count + 1 WHERE id IN ($1, $2)',
        [dealData.maker_id, dealData.taker_id]
      );
    }

    // Отправляем уведомления через WebSocket
    const io = req.app.locals.io;
    if (io) {
      const otherUserId = userId === dealData.maker_id ? dealData.taker_id : dealData.maker_id;
      io.to(`user:${otherUserId}`).emit('deal_status_changed', {
        deal_id: id,
        status,
        changed_by: userId
      });
    }

    res.json(result.rows[0]);
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
    const deal = await db.query(
      'SELECT maker_id, taker_id FROM deals WHERE id = $1',
      [id]
    );

    if (deal.rows.length === 0) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    const dealData = deal.rows[0];
    if (dealData.maker_id !== userId && dealData.taker_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Добавляем сообщение (можно создать отдельную таблицу deal_messages)
    const result = await db.query(
      `INSERT INTO deal_messages (deal_id, user_id, message)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, userId, message]
    );

    // Отправляем уведомление другому участнику
    const io = req.app.locals.io;
    if (io) {
      const otherUserId = userId === dealData.maker_id ? dealData.taker_id : dealData.maker_id;
      io.to(`user:${otherUserId}`).emit('new_deal_message', {
        deal_id: id,
        message: result.rows[0]
      });
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

// Получить статистику по сделкам
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await db.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE status = 'accepted') as accepted_count,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_count,
        COUNT(*) FILTER (WHERE status = 'disputed') as disputed_count,
        COUNT(*) as total_count,
        COUNT(*) FILTER (WHERE maker_id = $1) as as_maker_count,
        COUNT(*) FILTER (WHERE taker_id = $1) as as_taker_count
      FROM deals
      WHERE maker_id = $1 OR taker_id = $1
    `, [userId]);

    res.json(stats.rows[0]);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

module.exports = router;