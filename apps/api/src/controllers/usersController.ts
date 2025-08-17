import { Response } from 'express'
import { AuthRequest } from '../middleware/telegramAuth.js'
import { UserService } from '../services/UserService.js'
import { query } from '../db/index.js'
import { AppError } from '../middleware/errorHandler.js'

export class UsersController {
  private userService: UserService

  constructor() {
    this.userService = new UserService()
  }

  getProfile = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.telegramUser) {
        throw new AppError('Unauthorized', 401)
      }

      const user = await this.userService.getUserByTelegramId(req.telegramUser.id)
      
      if (!user) {
        throw new AppError('User not found', 404)
      }
      
      res.json({
        success: true,
        user
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get profile'
      })
    }
  }

  updateProfile = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.telegramUser) {
        throw new AppError('Unauthorized', 401)
      }

      const user = await this.userService.getUserByTelegramId(req.telegramUser.id)
      
      if (!user) {
        throw new AppError('User not found', 404)
      }

      const { phone } = req.body
      
      if (phone) {
        await query(
          'UPDATE users SET phone = $1, updated_at = NOW() WHERE id = $2',
          [phone, user.id]
        )
      }
      
      const updatedUser = await this.userService.getUserById(user.id)
      
      res.json({
        success: true,
        user: updatedUser
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update profile'
      })
    }
  }

  getStats = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.telegramUser) {
        throw new AppError('Unauthorized', 401)
      }

      const user = await this.userService.getUserByTelegramId(req.telegramUser.id)
      
      if (!user) {
        throw new AppError('User not found', 404)
      }

      const totalOperationsResult = await query(
        'SELECT COUNT(*) as count FROM operations WHERE user_id = $1',
        [user.id]
      )

      const completedOperationsResult = await query(
        `SELECT COUNT(*) as count FROM operations 
         WHERE user_id = $1 AND status = 'completed'`,
        [user.id]
      )

      const totalVolumeResult = await query(
        `SELECT SUM(amount_from) as total FROM operations 
         WHERE user_id = $1 AND status = 'completed'`,
        [user.id]
      )

      const savedCommissionResult = await query(
        `SELECT SUM(commission) as total FROM operations 
         WHERE user_id = $1 AND status = 'completed'`,
        [user.id]
      )

      const referralsResult = await query(
        'SELECT COUNT(*) as count FROM users WHERE referred_by = $1',
        [user.id]
      )
      
      res.json({
        success: true,
        stats: {
          totalOperations: parseInt(totalOperationsResult.rows[0].count) || 0,
          completedOperations: parseInt(completedOperationsResult.rows[0].count) || 0,
          totalVolume: parseFloat(totalVolumeResult.rows[0]?.total) || 0,
          savedCommission: parseFloat(savedCommissionResult.rows[0]?.total) || 0,
          referrals: parseInt(referralsResult.rows[0].count) || 0
        }
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get stats'
      })
    }
  }
}