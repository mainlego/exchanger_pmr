const router = require('express').Router();
const { Review, Deal, User } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { notifyNewReview } = require('../services/notifications');

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
    const deal = await Deal.findById(deal_id);

    if (!deal || deal.status !== 'completed') {
      return res.status(404).json({ error: 'Deal not found or not completed' });
    }

    // Проверяем, что пользователь участвовал в сделке
    if (deal.maker_id.toString() !== from_user_id && deal.taker_id.toString() !== from_user_id) {
      return res.status(403).json({ error: 'You are not a participant of this deal' });
    }

    // Определяем, кому оставляется отзыв
    const to_user_id = from_user_id === deal.maker_id.toString() ? deal.taker_id : deal.maker_id;

    // Проверяем, не оставлен ли уже отзыв
    const existing = await Review.findOne({
      deal_id,
      from_user_id
    });

    if (existing) {
      return res.status(400).json({ error: 'Review already exists for this deal' });
    }

    // Создаем отзыв
    const review = await Review.create({
      deal_id,
      from_user_id,
      to_user_id,
      rating,
      comment
    });

    // Обновляем рейтинг пользователя
    await updateUserRating(to_user_id);

    // Заполняем данные об авторе
    const populatedReview = await Review.findById(review._id)
      .populate('from_user_id', 'username first_name last_name photo_url')
      .lean();

    // Отправляем уведомление через Telegram
    await notifyNewReview(populatedReview);

    // Отправляем уведомление через WebSocket
    const io = req.app.locals.io;
    if (io) {
      io.to(`user:${to_user_id}`).emit('new_review', populatedReview);
    }

    res.status(201).json(populatedReview);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Проверить существующий отзыв по сделке от текущего пользователя
router.get('/check/:dealId', authMiddleware, async (req, res) => {
  try {
    const { dealId } = req.params;
    const userId = req.user.id;

    const review = await Review.findOne({
      deal_id: dealId,
      from_user_id: userId
    })
    .populate('from_user_id', 'username first_name last_name photo_url')
    .lean();

    if (review) {
      res.json({ exists: true, review });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error('Check review error:', error);
    res.status(500).json({ error: 'Failed to check review' });
  }
});

// Получить отзывы по сделке
router.get('/deal/:dealId', async (req, res) => {
  try {
    const { dealId } = req.params;

    const reviews = await Review.find({ deal_id: dealId })
      .populate('from_user_id', 'username first_name last_name photo_url')
      .populate('to_user_id', 'username first_name last_name')
      .sort({ createdAt: -1 })
      .lean();

    res.json(reviews);
  } catch (error) {
    console.error('Get deal reviews error:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
  }
});

// Получить отзыв по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id)
      .populate('from_user_id', 'username first_name last_name photo_url')
      .populate('to_user_id', 'username first_name last_name photo_url')
      .populate({
        path: 'deal_id',
        select: 'status amount',
        populate: {
          path: 'offer_id',
          select: 'currency_from currency_to type'
        }
      })
      .lean();

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json(review);
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
    const review = await Review.findOne({
      _id: id,
      from_user_id: userId
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found or not authorized' });
    }

    // Валидация рейтинга
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Обновляем отзыв
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    
    await review.save();

    // Обновляем рейтинг пользователя, если изменился рейтинг
    if (rating !== undefined) {
      await updateUserRating(review.to_user_id);
    }

    res.json(review);
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
    const review = await Review.findOne({
      _id: id,
      from_user_id: userId
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found or not authorized' });
    }

    const to_user_id = review.to_user_id;

    // Удаляем отзыв
    await review.deleteOne();

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

    const reviews = await Review.find({ to_user_id: userId }).select('rating');
    
    const stats = {
      total_reviews: reviews.length,
      average_rating: reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0,
      five_star: reviews.filter(r => r.rating === 5).length,
      four_star: reviews.filter(r => r.rating === 4).length,
      three_star: reviews.filter(r => r.rating === 3).length,
      two_star: reviews.filter(r => r.rating === 2).length,
      one_star: reviews.filter(r => r.rating === 1).length
    };

    res.json(stats);
  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({ error: 'Failed to get review stats' });
  }
});

// Вспомогательная функция для обновления рейтинга пользователя
async function updateUserRating(userId) {
  try {
    const reviews = await Review.find({ to_user_id: userId }).select('rating');
    
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    await User.findByIdAndUpdate(userId, {
      rating: parseFloat(avgRating.toFixed(2))
    });
  } catch (error) {
    console.error('Update user rating error:', error);
  }
}

module.exports = router;