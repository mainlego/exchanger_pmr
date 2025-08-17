import { query } from '../db/index.js'
import crypto from 'crypto'

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
}

export class UserService {
  async findOrCreateUser(telegramUser: TelegramUser) {
    const existingUser = await this.getUserByTelegramId(telegramUser.id)
    
    if (existingUser) {
      await this.updateUser(existingUser.id, telegramUser)
      return this.getUserById(existingUser.id)
    }
    
    return this.createUser(telegramUser)
  }

  async createUser(telegramUser: TelegramUser) {
    const referralCode = this.generateReferralCode()
    
    const result = await query(
      `INSERT INTO users (
        telegram_id, username, first_name, last_name, 
        language_code, is_premium, referral_code
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *`,
      [
        telegramUser.id,
        telegramUser.username || null,
        telegramUser.first_name,
        telegramUser.last_name || null,
        telegramUser.language_code || 'ru',
        telegramUser.is_premium || false,
        referralCode
      ]
    )
    
    return result.rows[0]
  }

  async updateUser(userId: number, telegramUser: Partial<TelegramUser>) {
    const updates = []
    const values = []
    let paramCount = 1

    if (telegramUser.username !== undefined) {
      updates.push(`username = $${paramCount++}`)
      values.push(telegramUser.username)
    }
    if (telegramUser.first_name !== undefined) {
      updates.push(`first_name = $${paramCount++}`)
      values.push(telegramUser.first_name)
    }
    if (telegramUser.last_name !== undefined) {
      updates.push(`last_name = $${paramCount++}`)
      values.push(telegramUser.last_name)
    }
    if (telegramUser.is_premium !== undefined) {
      updates.push(`is_premium = $${paramCount++}`)
      values.push(telegramUser.is_premium)
    }

    updates.push(`updated_at = NOW()`)
    values.push(userId)

    await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount}`,
      values
    )
  }

  async getUserById(userId: number) {
    const result = await query('SELECT * FROM users WHERE id = $1', [userId])
    return result.rows[0]
  }

  async getUserByTelegramId(telegramId: number) {
    const result = await query('SELECT * FROM users WHERE telegram_id = $1', [telegramId])
    return result.rows[0]
  }

  async getUserByReferralCode(code: string) {
    const result = await query('SELECT * FROM users WHERE referral_code = $1', [code])
    return result.rows[0]
  }

  private generateReferralCode(): string {
    return 'PMR' + crypto.randomBytes(4).toString('hex').toUpperCase().substring(0, 5)
  }
}