import { Response } from 'express'
import { AuthRequest } from '../middleware/telegramAuth.js'
import { UserService } from '../services/UserService.js'
import { AppError } from '../middleware/errorHandler.js'

export class AuthController {
  private userService: UserService

  constructor() {
    this.userService = new UserService()
  }

  telegramLogin = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.telegramUser) {
        throw new AppError('Telegram user data is required', 400)
      }

      const user = await this.userService.findOrCreateUser(req.telegramUser)
      
      res.json({
        success: true,
        user
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to authenticate'
      })
    }
  }

  getCurrentUser = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.telegramUser) {
        throw new AppError('Unauthorized', 401)
      }

      const user = await this.userService.getUserByTelegramId(req.telegramUser.id)
      
      res.json({
        success: true,
        user
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get user'
      })
    }
  }
}