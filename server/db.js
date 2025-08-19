const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://vladmelbiz:bfDndkQ6RrBbCyX5@tg-game-2.zsxexae.mongodb.net/p2p-exchange?retryWrites=true&w=majority&appName=tg-game-2';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Schemas
const userSchema = new mongoose.Schema({
  telegram_id: { type: Number, required: true, unique: true },
  username: String,
  first_name: String,
  last_name: String,
  photo_url: String,
  rating: { type: Number, default: 0 },
  deals_count: { type: Number, default: 0 },
  is_verified: { type: Boolean, default: false },
  is_online: { type: Boolean, default: false },
  last_seen: { type: Date, default: Date.now },
  phone: String,
  email: String,
  bio: String,
  preferred_districts: [String],
  preferred_currencies: [String]
}, { timestamps: true });

const offerSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['buy', 'sell'], required: true },
  currency_from: { type: String, required: true },
  currency_to: { type: String, required: true },
  amount_from: { type: Number, required: true },
  amount_to: { type: Number, required: true },
  rate: { type: Number, required: true },
  min_amount: Number,
  max_amount: Number,
  location: String,
  district: String,
  comment: String,
  is_active: { type: Boolean, default: true },
  views_count: { type: Number, default: 0 },
  expires_at: { type: Date, default: () => Date.now() + 24*60*60*1000 }
}, { timestamps: true });

const dealSchema = new mongoose.Schema({
  offer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
  maker_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  taker_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'completed', 'cancelled', 'disputed'],
    default: 'pending' 
  },
  message: String,
  contact_telegram: String,
  contact_phone: String,
  maker_confirmed: { type: Boolean, default: false },
  taker_confirmed: { type: Boolean, default: false },
  completed_at: Date
}, { timestamps: true });

const reviewSchema = new mongoose.Schema({
  deal_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal', required: true },
  from_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String
}, { timestamps: true });

const favoriteSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  favorite_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const dealMessageSchema = new mongoose.Schema({
  deal_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true }
}, { timestamps: true });

// Indexes (telegram_id already has unique index)
userSchema.index({ rating: -1 });
offerSchema.index({ is_active: 1, created_at: -1 });
offerSchema.index({ currency_from: 1, currency_to: 1 });
offerSchema.index({ user_id: 1, is_active: 1 });
dealSchema.index({ maker_id: 1, taker_id: 1 });
reviewSchema.index({ to_user_id: 1 });
reviewSchema.index({ deal_id: 1, from_user_id: 1 }, { unique: true });
favoriteSchema.index({ user_id: 1, favorite_user_id: 1 }, { unique: true });

// Models
const User = mongoose.model('User', userSchema);
const Offer = mongoose.model('Offer', offerSchema);
const Deal = mongoose.model('Deal', dealSchema);
const Review = mongoose.model('Review', reviewSchema);
const Favorite = mongoose.model('Favorite', favoriteSchema);
const DealMessage = mongoose.model('DealMessage', dealMessageSchema);

module.exports = {
  connectDB,
  User,
  Offer,
  Deal,
  Review,
  Favorite,
  DealMessage
};