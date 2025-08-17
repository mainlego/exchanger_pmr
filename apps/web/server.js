const express = require('express')
const path = require('path')
const fs = require('fs')

const app = express()
const PORT = process.env.PORT || 3000

// Путь к собранным файлам
const distPath = path.join(__dirname, 'dist')

// Проверяем существует ли папка dist
if (!fs.existsSync(distPath)) {
  console.error('❌ Папка dist не найдена! Сначала выполните npm run build')
  process.exit(1)
}

// Middleware для логирования
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Headers для Telegram Mini App
app.use((req, res, next) => {
  res.header('X-Frame-Options', 'SAMEORIGIN')
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-Telegram-Init-Data')
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

// Статические файлы
app.use(express.static(distPath))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Все остальные роуты -> index.html (для Vue Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

// Запуск сервера
app.listen(PORT, () => {
  console.log(`✅ Frontend сервер запущен на порту ${PORT}`)
  console.log(`📁 Раздача статики из: ${distPath}`)
  console.log(`🌐 URL: http://localhost:${PORT}`)
})