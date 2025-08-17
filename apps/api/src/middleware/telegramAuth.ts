import { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'
import { AppError } from './errorHandler.js'

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
}

export interface AuthRequest extends Request {
  telegramUser?: TelegramUser
}

const verifyTelegramWebAppData = (initData: string): TelegramUser | null => {
  const BOT_TOKEN = process.env.BOT_TOKEN
  if (!BOT_TOKEN) {
    throw new Error('BOT_TOKEN is not configured')
  }

  const urlParams = new URLSearchParams(initData)
  const hash = urlParams.get('hash')
  urlParams.delete('hash')

  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(BOT_TOKEN)
    .digest()

  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex')

  if (calculatedHash !== hash) {
    return null
  }

  const authDate = parseInt(urlParams.get('auth_date') || '0')
  const currentTime = Math.floor(Date.now() / 1000)
  
  if (currentTime - authDate > 86400) {
    return null
  }

  const userString = urlParams.get('user')
  if (!userString) {
    return null
  }

  try {
    return JSON.parse(userString) as TelegramUser
  } catch {
    return null
  }
}

export const telegramAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const initData = req.headers['x-telegram-init-data'] as string

  if (!initData) {
    return next(new AppError('Telegram init data is required', 401))
  }

  const user = verifyTelegramWebAppData(initData)
  
  if (!user) {
    return next(new AppError('Invalid Telegram authentication', 401))
  }

  req.telegramUser = user
  next()
}

export const optionalTelegramAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const initData = req.headers['x-telegram-init-data'] as string

  if (initData) {
    const user = verifyTelegramWebAppData(initData)
    if (user) {
      req.telegramUser = user
    }
  }

  next()
}