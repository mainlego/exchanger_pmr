import { query } from '../db/index.js'

export class RateService {
  async getCurrentRates() {
    const defaultRates = [
      {
        currency: 'USD',
        symbol: '$',
        buyRate: 16.10,
        sellRate: 16.50,
        trend: 'up' as const,
        change: 0.5,
        updatedAt: new Date()
      },
      {
        currency: 'EUR',
        symbol: '€',
        buyRate: 18.4184,
        sellRate: 19.5360,
        trend: 'down' as const,
        change: -0.3,
        updatedAt: new Date()
      },
      {
        currency: 'MDL',
        symbol: 'L',
        buyRate: 0.9437,
        sellRate: 1.0476,
        trend: 'stable' as const,
        change: 0,
        updatedAt: new Date()
      },
      {
        currency: 'UAH',
        symbol: '₴',
        buyRate: 0.36,
        sellRate: 0.43,
        trend: 'stable' as const,
        change: 0.1,
        updatedAt: new Date()
      },
      {
        currency: 'RUB',
        symbol: '₽',
        buyRate: 0.1851,
        sellRate: 0.2143,
        trend: 'down' as const,
        change: -0.2,
        updatedAt: new Date()
      }
    ]

    try {
      const result = await query(
        `SELECT * FROM rates 
         WHERE (currency_from = 'RUB' OR currency_to = 'RUB')
         ORDER BY updated_at DESC 
         LIMIT 3`
      )

      if (result.rows.length === 0) {
        await this.seedRates()
        return defaultRates
      }

      return result.rows.map(rate => ({
        currency: rate.currency_from === 'RUB' ? rate.currency_to : rate.currency_from,
        symbol: this.getCurrencySymbol(rate.currency_from === 'RUB' ? rate.currency_to : rate.currency_from),
        buyRate: parseFloat(rate.buy_rate),
        sellRate: parseFloat(rate.sell_rate),
        trend: this.calculateTrend(rate),
        change: this.calculateChange(rate),
        updatedAt: rate.updated_at
      }))
    } catch (error) {
      console.error('Error getting rates:', error)
      return defaultRates
    }
  }

  async getRateHistory(currency: string, period: 'day' | 'week' | 'month') {
    const intervals = {
      day: '1 day',
      week: '7 days',
      month: '30 days'
    }

    const result = await query(
      `SELECT * FROM rate_history 
       WHERE (currency_from = $1 OR currency_to = $1)
       AND recorded_at >= NOW() - INTERVAL '${intervals[period]}'
       ORDER BY recorded_at ASC`,
      [currency]
    )

    return result.rows
  }

  async calculateExchange(amount: number, from: string, to: string, type: 'buy' | 'sell') {
    let rate = 1
    let commission = amount * 0.01
    let result = amount

    if (from === 'RUB' && to !== 'RUB') {
      const rateData = await this.getRate(to, 'RUB')
      rate = type === 'buy' ? rateData.buyRate : rateData.sellRate
      result = amount / rate
    } else if (from !== 'RUB' && to === 'RUB') {
      const rateData = await this.getRate(from, 'RUB')
      rate = type === 'buy' ? rateData.buyRate : rateData.sellRate
      result = amount * rate
    } else if (from !== 'RUB' && to !== 'RUB') {
      const fromRate = await this.getRate(from, 'RUB')
      const toRate = await this.getRate(to, 'RUB')
      const rubAmount = type === 'buy' ? amount * fromRate.buyRate : amount * fromRate.sellRate
      result = type === 'buy' ? rubAmount / toRate.sellRate : rubAmount / toRate.buyRate
      rate = result / amount
    }

    return {
      amount,
      from,
      to,
      result: parseFloat(result.toFixed(2)),
      rate: parseFloat(rate.toFixed(4)),
      commission: parseFloat(commission.toFixed(2)),
      total: parseFloat((result - commission).toFixed(2))
    }
  }

  private async getRate(currency: string, base: string = 'RUB') {
    const result = await query(
      `SELECT * FROM rates 
       WHERE (currency_from = $1 AND currency_to = $2)
       OR (currency_from = $2 AND currency_to = $1)
       ORDER BY updated_at DESC 
       LIMIT 1`,
      [currency, base]
    )

    if (result.rows.length === 0) {
      const defaultRates: Record<string, { buyRate: number, sellRate: number }> = {
        USD: { buyRate: 16.10, sellRate: 16.50 },
        EUR: { buyRate: 18.4184, sellRate: 19.5360 },
        MDL: { buyRate: 0.9437, sellRate: 1.0476 },
        UAH: { buyRate: 0.36, sellRate: 0.43 },
        RUB: { buyRate: 0.1851, sellRate: 0.2143 }
      }

      return defaultRates[currency] || { buyRate: 1, sellRate: 1 }
    }

    const rate = result.rows[0]
    return {
      buyRate: parseFloat(rate.buy_rate),
      sellRate: parseFloat(rate.sell_rate)
    }
  }

  private getCurrencySymbol(currency: string): string {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      MDL: 'L',
      RUB: '₽'
    }
    return symbols[currency] || currency
  }

  private calculateTrend(rate: any): 'up' | 'down' | 'stable' {
    return 'stable'
  }

  private calculateChange(rate: any): number {
    return 0
  }

  private async seedRates() {
    const rates = [
      { from: 'USD', to: 'RUP', buy: 16.10, sell: 16.50 },
      { from: 'EUR', to: 'RUP', buy: 18.4184, sell: 19.5360 },
      { from: 'MDL', to: 'RUP', buy: 0.9437, sell: 1.0476 },
      { from: 'UAH', to: 'RUP', buy: 0.36, sell: 0.43 },
      { from: 'RUB', to: 'RUP', buy: 0.1851, sell: 0.2143 }
    ]

    for (const rate of rates) {
      await query(
        `INSERT INTO rates (currency_from, currency_to, buy_rate, sell_rate)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [rate.from, rate.to, rate.buy, rate.sell]
      )
    }
  }
}