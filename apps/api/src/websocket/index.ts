import { Server, Socket } from 'socket.io'
import { getCached } from '../utils/redis.js'

interface RateUpdate {
  type: 'rates_update'
  rates: any[]
}

export const initWebSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`)

    socket.on('subscribe_rates', async () => {
      socket.join('rates')
      const cachedRates = await getCached('current_rates')
      if (cachedRates) {
        socket.emit('rates_update', {
          type: 'rates_update',
          rates: cachedRates
        })
      }
    })

    socket.on('unsubscribe_rates', () => {
      socket.leave('rates')
    })

    socket.on('subscribe_operations', (userId: string) => {
      socket.join(`user_${userId}`)
    })

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`)
    })
  })

  setInterval(async () => {
    const rates = await getCached('current_rates')
    if (rates) {
      io.to('rates').emit('rates_update', {
        type: 'rates_update',
        rates
      })
    }
  }, 30000)
}

export const broadcastRateUpdate = (io: Server, rates: any[]) => {
  io.to('rates').emit('rates_update', {
    type: 'rates_update',
    rates
  })
}

export const notifyUser = (io: Server, userId: string, notification: any) => {
  io.to(`user_${userId}`).emit('notification', notification)
}