import { Request, Response } from 'express'
import { RateService } from '../services/RateService.js'
import { getCached, setCached } from '../utils/redis.js'

export class RatesController {
  private rateService: RateService

  constructor() {
    this.rateService = new RateService()
  }

  getCurrentRates = async (req: Request, res: Response) => {
    try {
      const cacheKey = 'current_rates'
      const cached = await getCached(cacheKey)
      
      if (cached) {
        return res.json(cached)
      }

      const rates = await this.rateService.getCurrentRates()
      await setCached(cacheKey, rates, 30)
      
      res.json(rates)
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get rates'
      })
    }
  }

  getRateHistory = async (req: Request, res: Response) => {
    try {
      const { currency, period = 'day' } = req.query
      
      if (!currency) {
        return res.status(400).json({
          success: false,
          error: 'Currency is required'
        })
      }

      const history = await this.rateService.getRateHistory(
        currency as string,
        period as 'day' | 'week' | 'month'
      )
      
      res.json(history)
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get rate history'
      })
    }
  }

  calculateExchange = async (req: Request, res: Response) => {
    try {
      const { amount, from, to, type = 'sell' } = req.body
      
      if (!amount || !from || !to) {
        return res.status(400).json({
          success: false,
          error: 'Amount, from and to currencies are required'
        })
      }

      const result = await this.rateService.calculateExchange(
        parseFloat(amount),
        from,
        to,
        type as 'buy' | 'sell'
      )
      
      res.json({
        success: true,
        ...result
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to calculate exchange'
      })
    }
  }
}