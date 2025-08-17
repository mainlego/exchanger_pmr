#!/bin/bash

echo "Starting Exchange PMR Services..."
echo ""

echo "[1/3] Starting PostgreSQL and Redis via Docker..."
docker-compose up -d postgres redis
sleep 5

echo ""
echo "[2/3] Installing dependencies..."
npm install
sleep 2

echo ""
echo "[3/3] Starting services..."

# Start services in background
npm run api:dev &
API_PID=$!
sleep 3

npm run web:dev &
WEB_PID=$!
sleep 2

npm run bot:dev &
BOT_PID=$!

echo ""
echo "======================================"
echo "All services started successfully!"
echo "======================================"
echo ""
echo "Web App: http://localhost:3000"
echo "API Server: http://localhost:4000"
echo ""
echo "Press Ctrl+C to stop all services..."

# Wait for Ctrl+C
trap cleanup INT

cleanup() {
    echo ""
    echo "Stopping all services..."
    kill $API_PID $WEB_PID $BOT_PID 2>/dev/null
    docker-compose down
    echo "Done!"
    exit 0
}

# Keep script running
while true; do
    sleep 1
done