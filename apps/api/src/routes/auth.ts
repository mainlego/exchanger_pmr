import { Router } from 'express'
import { telegramAuth } from '../middleware/telegramAuth.js'
import { AuthController } from '../controllers/authController.js'

const router = Router()
const authController = new AuthController()

router.post('/telegram', telegramAuth, authController.telegramLogin)
router.get('/me', telegramAuth, authController.getCurrentUser)

export default router