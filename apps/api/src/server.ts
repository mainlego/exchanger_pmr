import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import { errorHandler } from './middleware/errorHandler.js'
import { rateLimiter } from './middleware/rateLimiter.js'
import authRoutes from './routes/auth.js'
import ratesRoutes from './routes/rates.js'
import operationsRoutes from './routes/operations.js'
import usersRoutes from './routes/users.js'
import { initWebSocket } from './websocket/index.js'
import { initDatabase } from './db/index.js'
import { initRedis } from './utils/redis.js'
import { initQueue } from './jobs/queue.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  }
})

const PORT = process.env.PORT || 4000

app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api', rateLimiter)

app.use('/api/auth', authRoutes)
app.use('/api/rates', ratesRoutes)
app.use('/api/operations', operationsRoutes)
app.use('/api/users', usersRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use(errorHandler)

initWebSocket(io)

const startServer = async () => {
  try {
    await initDatabase()
    await initRedis()
    await initQueue()
    
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📡 WebSocket server ready`)
      console.log(`🗄️  Database connected`)
      console.log(`💾 Redis connected`)
      console.log(`📋 Queue system initialized`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err)
  process.exit(1)
})

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  httpServer.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})