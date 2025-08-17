import { Router } from 'express'
import { OperationsController } from '../controllers/operationsController.js'
import { telegramAuth } from '../middleware/telegramAuth.js'

const router = Router()
const operationsController = new OperationsController()

router.get('/', telegramAuth, operationsController.getUserOperations)
router.post('/', telegramAuth, operationsController.createOperation)
router.get('/:code', telegramAuth, operationsController.getOperationByCode)
router.post('/:id/cancel', telegramAuth, operationsController.cancelOperation)

export default router