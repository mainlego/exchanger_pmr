import { Router } from 'express'
import { UsersController } from '../controllers/usersController.js'
import { telegramAuth } from '../middleware/telegramAuth.js'

const router = Router()
const usersController = new UsersController()

router.get('/profile', telegramAuth, usersController.getProfile)
router.put('/profile', telegramAuth, usersController.updateProfile)
router.get('/stats', telegramAuth, usersController.getStats)

export default router