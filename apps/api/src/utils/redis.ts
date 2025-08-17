import { createClient } from 'redis'
import dotenv from 'dotenv'

dotenv.config()

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
})

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err)
})

redisClient.on('connect', () => {
  console.log('Redis Client Connected')
})

export const initRedis = async () => {
  try {
    await redisClient.connect()
  } catch (error) {
    console.error('Failed to connect to Redis:', error)
    throw error
  }
}

export const getCached = async (key: string) => {
  try {
    const data = await redisClient.get(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Redis get error:', error)
    return null
  }
}

export const setCached = async (key: string, value: any, ttl: number = 300) => {
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value))
  } catch (error) {
    console.error('Redis set error:', error)
  }
}

export const deleteCached = async (key: string) => {
  try {
    await redisClient.del(key)
  } catch (error) {
    console.error('Redis delete error:', error)
  }
}

export const invalidatePattern = async (pattern: string) => {
  try {
    const keys = await redisClient.keys(pattern)
    if (keys.length > 0) {
      await redisClient.del(keys)
    }
  } catch (error) {
    console.error('Redis invalidate pattern error:', error)
  }
}

export default redisClient