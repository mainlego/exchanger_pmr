const router = require('express').Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

// Создать отзыв
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { deal_id, rating, comment } = req.body;
    const from_user_id = req.user.id;

    // Валидация рейтинга
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Проверяем сделку
    const deal = await db.query(
      'SELECT * FROM deals WHERE id = $1 AND status = $2',
      [deal_id, 'completed']
    );

    if (deal.rows.length === 0) {
      return res.status(404).json({ error: 'Deal not found or not completed' });
    }

    const dealData = deal.rows[0];

    // Проверяем, что пользователь участвовал в сделке
    if (dealData.maker_id !== from_user_id && dealData.taker_id !== from_user_id) {
      return res.status(403).json({ error: 'You are not a participant of this deal' });
    }

    // Определяем, кому оставляется отзыв
    const to_user_id = from_user_id === dealData.maker_id ? dealData.taker_id : dealData.maker_id;

    // Проверяем, не оставлен ли уже отзыв
    const existing = await db.query(
      'SELECT id FROM reviews WHERE deal_id = $1 AND from_user_id = $2',
      [deal_id, from_user_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Review already exists for this deal' });
    }

    // Создаем отзыв
    const result = await db.query(
      `INSERT INTO reviews (deal_id, from_user_id, to_user_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [deal_id, from_user_id, to_user_id, rating, comment]
    );

    // Обновляем рейтинг пользователя
    await updateUserRating(to_user_id);

    // Получаем информацию об авторе отзыва
    const author = await db.query(
      'SELECT username, first_name, last_name, photo_url FROM users WHERE id = $1',
      [from_user_id]
    );

    const review = {
      ...result.rows[0],
      author: author.rows[0]
    };

    // Отправляем уведомление через WebSocket
    const io = req.app.locals.io;
    if (io) {
      io.to(`user:${to_user_id}`).emit('new_review', review);
    }

    res.status(201).json(review);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Получить отзывы по сделке
router.get('/deal/:dealId', async (req, res) => {
  try {
    const { dealId } = req.params;

    const result = await db.query(`
      SELECT 
        r.*,
        fu.username as from_username,
        fu.first_name as from_first_name,
        fu.last_name as from_last_name,
        fu.photo_url as from_photo_url,
        tu.username as to_username,
        tu.first_name as to_first_name,
        tu.last_name as to_last_name
      FROM reviews r
      JOIN users fu ON r.from_user_id = fu.id
      JOIN users tu ON r.to_user_id = tu.id
      WHERE r.deal_id = $1
      ORDER BY r.created_at DESC
    `, [dealId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get deal reviews error:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
  }
});

// Получить отзыв по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      SELECT 
        r.*,
        fu.username as from_username,
        fu.first_name as from_first_name,
        fu.last_name as from_last_name,
        fu.photo_url as from_photo_url,
        tu.username as to_username,
        tu.first_name as to_first_name,
        tu.last_name as to_last_name,
        tu.photo_url as to_photo_url,
        d.status as deal_status,
        d.amount as deal_amount,
        o.currency_from,
        o.currency_to,
        o.type as offer_type
      FROM reviews r
      JOIN users fu ON r.from_user_id = fu.id
      JOIN users tu ON r.to_user_id = tu.id
      JOIN deals d ON r.deal_id = d.id
      JOIN offers o ON d.offer_id = o.id
      WHERE r.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({ error: 'Failed to get review' });
  }
});

// Обновить отзыв
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // Проверяем авторство
    const review = await db.query(
      'SELECT * FROM reviews WHERE id = $1 AND from_user_id = $2',
      [id, userId]
    );

    if (review.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found or not authorized' });
    }

    // Валидация рейтинга
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Обновляем отзыв
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (rating !== undefined) {
      updates.push(`rating = $${paramCount++}`);
      values.push(rating);
    }
    if (comment !== undefined) {
      updates.push(`comment = $${paramCount++}`);
      values.push(comment);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const query = `UPDATE reviews SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await db.query(query, values);

    // Обновляем рейтинг пользователя, если изменился рейтинг
    if (rating !== undefined) {
      await updateUserRating(review.rows[0].to_user_id);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Удалить отзыв
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Проверяем авторство
    const review = await db.query(
      'SELECT to_user_id FROM reviews WHERE id = $1 AND from_user_id = $2',
      [id, userId]
    );

    if (review.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found or not authorized' });
    }

    const to_user_id = review.rows[0].to_user_id;

    // Удаляем отзыв
    await db.query('DELETE FROM reviews WHERE id = $1', [id]);

    // Обновляем рейтинг пользователя
    await updateUserRating(to_user_id);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// Получить статистику отзывов пользователя
router.get('/user/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await db.query(`
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating,
        COUNT(*) FILTER (WHERE rating = 5) as five_star,
        COUNT(*) FILTER (WHERE rating = 4) as four_star,
        COUNT(*) FILTER (WHERE rating = 3) as three_star,
        COUNT(*) FILTER (WHERE rating = 2) as two_star,
        COUNT(*) FILTER (WHERE rating = 1) as one_star
      FROM reviews
      WHERE to_user_id = $1
    `, [userId]);

    res.json(stats.rows[0]);
  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({ error: 'Failed to get review stats' });
  }
});

// Вспомогательная функция для обновления рейтинга пользователя
async function updateUserRating(userId) {
  try {
    const result = await db.query(
      'SELECT AVG(rating) as avg_rating FROM reviews WHERE to_user_id = $1',
      [userId]
    );

    const avgRating = result.rows[0].avg_rating || 0;

    await db.query(
      'UPDATE users SET rating = $1 WHERE id = $2',
      [parseFloat(avgRating).toFixed(2), userId]
    );
  } catch (error) {
    console.error('Update user rating error:', error);
  }
}

module.exports = router;