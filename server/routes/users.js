const router = require('express').Router();
const { User, Deal, Review, Favorite } = require('../db');
const { authMiddleware } = require('../middleware/auth');

// Получить мой профиль - ДОЛЖЕН БЫТЬ ПЕРЕД /:id
router.get('/me', authMiddleware, async (req, res) => {
  try {
    console.log('Getting profile for user:', req.user.id);
    const user = await User.findById(req.user.id).lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Получить избранных пользователей
router.get('/favorites', authMiddleware, async (req, res) => {
  try {
    const favorites = await Favorite.find({ user_id: req.user.id })
      .populate('favorite_user_id', 'telegram_id username first_name last_name photo_url rating deals_count is_verified is_online last_seen')
      .sort({ createdAt: -1 })
      .lean();

    // Форматируем ответ
    const formattedFavorites = favorites.map(fav => ({
      ...fav.favorite_user_id,
      favorited_at: fav.createdAt
    }));

    res.json(formattedFavorites);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to get favorites' });
  }
});

// Поиск пользователей
router.get('/search', async (req, res) => {
  try {
    const { q, min_rating, verified_only } = req.query;
    
    const filter = {};

    if (q) {
      filter.$or = [
        { username: { $regex: q, $options: 'i' } },
        { first_name: { $regex: q, $options: 'i' } },
        { last_name: { $regex: q, $options: 'i' } }
      ];
    }

    if (min_rating) {
      filter.rating = { $gte: parseFloat(min_rating) };
    }

    if (verified_only === 'true') {
      filter.is_verified = true;
    }

    const users = await User.find(filter)
      .sort({ rating: -1, deals_count: -1 })
      .limit(50)
      .lean();

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Получить профиль пользователя по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Получить статистику пользователя
    const [totalDeals, completedDeals, reviewsCount] = await Promise.all([
      Deal.countDocuments({ $or: [{ maker_id: id }, { taker_id: id }] }),
      Deal.countDocuments({ 
        $or: [{ maker_id: id }, { taker_id: id }],
        status: 'completed' 
      }),
      Review.countDocuments({ to_user_id: id })
    ]);

    const reviews = await Review.find({ to_user_id: id }).select('rating');
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0;

    const userWithStats = {
      ...user,
      stats: {
        total_deals: totalDeals,
        completed_deals: completedDeals,
        reviews_count: reviewsCount,
        average_rating: averageRating
      }
    };

    res.json(userWithStats);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Обновить профиль
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { phone, email, bio, preferred_districts, preferred_currencies } = req.body;
    
    const updateData = {};
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (bio !== undefined) updateData.bio = bio;
    if (preferred_districts !== undefined) updateData.preferred_districts = preferred_districts;
    if (preferred_currencies !== undefined) updateData.preferred_currencies = preferred_currencies;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Получить отзывы пользователя
router.get('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const reviews = await Review.find({ to_user_id: id })
      .populate('from_user_id', 'username first_name last_name photo_url')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .lean();

    // Форматируем ответ
    const formattedReviews = reviews.map(review => ({
      ...review,
      from_username: review.from_user_id?.username,
      from_first_name: review.from_user_id?.first_name,
      from_last_name: review.from_user_id?.last_name,
      from_photo_url: review.from_user_id?.photo_url
    }));

    res.json(formattedReviews);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
  }
});

// Добавить/удалить из избранного
router.post('/:id/favorite', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (userId === id) {
      return res.status(400).json({ error: 'Cannot add yourself to favorites' });
    }

    // Проверяем, есть ли уже в избранном
    const existing = await Favorite.findOne({
      user_id: userId,
      favorite_user_id: id
    });

    if (existing) {
      // Удаляем из избранного
      await existing.deleteOne();
      res.json({ favorited: false });
    } else {
      // Добавляем в избранное
      await Favorite.create({
        user_id: userId,
        favorite_user_id: id
      });
      res.json({ favorited: true });
    }
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
});

module.exports = router;