import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

const connectionString = process.env.DATABASE_URL

const pool = connectionString 
  ? new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'exchange_pmr',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

export const initDatabase = async () => {
  try {
    await pool.query('SELECT NOW()')
    console.log('Database connection established')
    await createTables()
  } catch (error) {
    console.error('Database connection failed:', error)
    throw error
  }
}

const createTables = async () => {
  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      telegram_id BIGINT UNIQUE NOT NULL,
      username VARCHAR(255),
      first_name VARCHAR(255),
      last_name VARCHAR(255),
      phone VARCHAR(20),
      language_code VARCHAR(5) DEFAULT 'ru',
      is_vip BOOLEAN DEFAULT FALSE,
      is_premium BOOLEAN DEFAULT FALSE,
      referral_code VARCHAR(10) UNIQUE,
      referred_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,
    
    `CREATE TABLE IF NOT EXISTS rates (
      id SERIAL PRIMARY KEY,
      currency_from VARCHAR(3),
      currency_to VARCHAR(3),
      buy_rate DECIMAL(10,4),
      sell_rate DECIMAL(10,4),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,
    
    `CREATE TABLE IF NOT EXISTS rate_history (
      id SERIAL PRIMARY KEY,
      currency_from VARCHAR(3),
      currency_to VARCHAR(3),
      buy_rate DECIMAL(10,4),
      sell_rate DECIMAL(10,4),
      recorded_at TIMESTAMP DEFAULT NOW()
    )`,
    
    `CREATE TABLE IF NOT EXISTS operations (
      id SERIAL PRIMARY KEY,
      code VARCHAR(10) UNIQUE,
      user_id INTEGER REFERENCES users(id),
      currency_from VARCHAR(3),
      currency_to VARCHAR(3),
      amount_from DECIMAL(10,2),
      amount_to DECIMAL(10,2),
      rate DECIMAL(10,4),
      commission DECIMAL(10,2),
      status VARCHAR(20) DEFAULT 'new',
      delivery_type VARCHAR(20),
      delivery_address TEXT,
      scheduled_time TIMESTAMP,
      completed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,
    
    `CREATE TABLE IF NOT EXISTS offices (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      address TEXT,
      latitude DECIMAL(10,8),
      longitude DECIMAL(11,8),
      working_hours JSONB,
      phone VARCHAR(20),
      is_active BOOLEAN DEFAULT TRUE
    )`,
    
    `CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      type VARCHAR(50),
      title VARCHAR(255),
      message TEXT,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    )`
  ]

  for (const query of queries) {
    try {
      await pool.query(query)
    } catch (error) {
      console.error('Error creating table:', error)
    }
  }

  await createIndexes()
}

const createIndexes = async () => {
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_rates_currency ON rates(currency_from, currency_to, updated_at)',
    'CREATE INDEX IF NOT EXISTS idx_operations_user ON operations(user_id, created_at)',
    'CREATE INDEX IF NOT EXISTS idx_operations_code ON operations(code)',
    'CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read)'
  ]

  for (const index of indexes) {
    try {
      await pool.query(index)
    } catch (error) {
      console.error('Error creating index:', error)
    }
  }
}

export const query = (text: string, params?: any[]) => pool.query(text, params)

export default pool