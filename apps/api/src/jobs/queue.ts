import Bull from 'bull'
import dotenv from 'dotenv'

dotenv.config()

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

export const notificationQueue = new Bull('notifications', REDIS_URL)
export const emailQueue = new Bull('emails', REDIS_URL)
export const rateUpdateQueue = new Bull('rate-updates', REDIS_URL)

export const initQueue = async () => {
  notificationQueue.process(async (job) => {
    const { userId, title, message, type } = job.data
    console.log(`Processing notification for user ${userId}: ${title}`)
  })

  emailQueue.process(async (job) => {
    const { to, subject, html } = job.data
    console.log(`Sending email to ${to}: ${subject}`)
  })

  rateUpdateQueue.process(async (job) => {
    console.log('Updating exchange rates...')
  })

  rateUpdateQueue.add({}, { repeat: { cron: '*/5 * * * *' } })

  console.log('Queue system initialized')
}

export const addNotificationJob = (data: {
  userId: number
  title: string
  message: string
  type: string
}) => {
  return notificationQueue.add(data)
}

export const addEmailJob = (data: {
  to: string
  subject: string
  html: string
}) => {
  return emailQueue.add(data)
}