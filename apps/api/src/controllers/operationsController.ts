import { Response } from 'express'
import { AuthRequest } from '../middleware/telegramAuth.js'
import { OperationService } from '../services/OperationService.js'
import { UserService } from '../services/UserService.js'
import { AppError } from '../middleware/errorHandler.js'

export class OperationsController {
  private operationService: OperationService
  private userService: UserService

  constructor() {
    this.operationService = new OperationService()
    this.userService = new UserService()
  }

  getUserOperations = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.telegramUser) {
        throw new AppError('Unauthorized', 401)
      }

      const user = await this.userService.getUserByTelegramId(req.telegramUser.id)
      if (!user) {
        throw new AppError('User not found', 404)
      }

      const { limit = 10, offset = 0, status } = req.query
      
      const operations = await this.operationService.getUserOperations(
        user.id,
        {
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          status: status as string
        }
      )
      
      res.json(operations)
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get operations'
      })
    }
  }

  createOperation = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.telegramUser) {
        throw new AppError('Unauthorized', 401)
      }

      const user = await this.userService.getUserByTelegramId(req.telegramUser.id)
      if (!user) {
        throw new AppError('User not found', 404)
      }

      const operation = await this.operationService.createOperation({
        userId: user.id,
        ...req.body
      })
      
      res.json({
        success: true,
        operation
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create operation'
      })
    }
  }

  getOperationByCode = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.telegramUser) {
        throw new AppError('Unauthorized', 401)
      }

      const { code } = req.params
      const operation = await this.operationService.getOperationByCode(code)
      
      if (!operation) {
        throw new AppError('Operation not found', 404)
      }

      const user = await this.userService.getUserByTelegramId(req.telegramUser.id)
      if (!user || operation.user_id !== user.id) {
        throw new AppError('Access denied', 403)
      }
      
      res.json(operation)
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get operation'
      })
    }
  }

  cancelOperation = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.telegramUser) {
        throw new AppError('Unauthorized', 401)
      }

      const { id } = req.params
      const user = await this.userService.getUserByTelegramId(req.telegramUser.id)
      if (!user) {
        throw new AppError('User not found', 404)
      }

      const success = await this.operationService.cancelOperation(parseInt(id), user.id)
      
      if (!success) {
        throw new AppError('Cannot cancel operation', 400)
      }
      
      res.json({
        success: true,
        message: 'Operation cancelled'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to cancel operation'
      })
    }
  }
}