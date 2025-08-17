import { query } from '../db/index.js'
import crypto from 'crypto'

interface CreateOperationData {
  userId: number
  currencyFrom: string
  currencyTo: string
  amountFrom: number
  amountTo: number
  rate: number
  deliveryType: 'office' | 'delivery'
  deliveryAddress?: string
  scheduledTime?: Date
}

export class OperationService {
  async createOperation(data: CreateOperationData) {
    const code = this.generateOperationCode()
    const commission = data.amountFrom * 0.01

    const result = await query(
      `INSERT INTO operations (
        code, user_id, currency_from, currency_to,
        amount_from, amount_to, rate, commission,
        status, delivery_type, delivery_address, scheduled_time
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        code,
        data.userId,
        data.currencyFrom,
        data.currencyTo,
        data.amountFrom,
        data.amountTo,
        data.rate,
        commission,
        'new',
        data.deliveryType,
        data.deliveryAddress || null,
        data.scheduledTime || null
      ]
    )

    return result.rows[0]
  }

  async getUserOperations(userId: number, options: {
    limit?: number
    offset?: number
    status?: string
  } = {}) {
    const { limit = 10, offset = 0, status } = options
    
    let queryText = `
      SELECT * FROM operations 
      WHERE user_id = $1
    `
    const params: any[] = [userId]
    
    if (status) {
      queryText += ` AND status = $${params.length + 1}`
      params.push(status)
    }
    
    queryText += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const result = await query(queryText, params)
    
    return result.rows.map(op => ({
      id: op.id,
      code: op.code,
      currencyFrom: op.currency_from,
      currencyTo: op.currency_to,
      amountFrom: parseFloat(op.amount_from),
      amountTo: parseFloat(op.amount_to),
      rate: parseFloat(op.rate),
      commission: parseFloat(op.commission),
      status: op.status,
      deliveryType: op.delivery_type,
      deliveryAddress: op.delivery_address,
      scheduledTime: op.scheduled_time,
      completedAt: op.completed_at,
      createdAt: op.created_at
    }))
  }

  async getOperationByCode(code: string) {
    const result = await query(
      'SELECT * FROM operations WHERE code = $1',
      [code]
    )
    
    if (result.rows.length === 0) {
      return null
    }
    
    const op = result.rows[0]
    return {
      id: op.id,
      code: op.code,
      user_id: op.user_id,
      currencyFrom: op.currency_from,
      currencyTo: op.currency_to,
      amountFrom: parseFloat(op.amount_from),
      amountTo: parseFloat(op.amount_to),
      rate: parseFloat(op.rate),
      commission: parseFloat(op.commission),
      status: op.status,
      deliveryType: op.delivery_type,
      deliveryAddress: op.delivery_address,
      scheduledTime: op.scheduled_time,
      completedAt: op.completed_at,
      createdAt: op.created_at
    }
  }

  async cancelOperation(operationId: number, userId: number) {
    const checkResult = await query(
      'SELECT * FROM operations WHERE id = $1 AND user_id = $2',
      [operationId, userId]
    )
    
    if (checkResult.rows.length === 0) {
      return false
    }
    
    const operation = checkResult.rows[0]
    
    if (!['new', 'confirmed'].includes(operation.status)) {
      return false
    }
    
    await query(
      `UPDATE operations 
       SET status = 'cancelled', updated_at = NOW() 
       WHERE id = $1`,
      [operationId]
    )
    
    return true
  }

  async updateOperationStatus(operationId: number, status: string) {
    const result = await query(
      `UPDATE operations 
       SET status = $1, updated_at = NOW()
       ${status === 'completed' ? ', completed_at = NOW()' : ''}
       WHERE id = $2
       RETURNING *`,
      [status, operationId]
    )
    
    return result.rows[0]
  }

  private generateOperationCode(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase()
  }
}