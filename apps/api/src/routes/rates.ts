import { Router } from 'express'
import { RatesController } from '../controllers/ratesController.js'
import { optionalTelegramAuth } from '../middleware/telegramAuth.js'

const router = Router()
const ratesController = new RatesController()

router.get('/current', optionalTelegramAuth, ratesController.getCurrentRates)
router.get('/history', optionalTelegramAuth, ratesController.getRateHistory)
router.post('/calculate', optionalTelegramAuth, ratesController.calculateExchange)

export default router