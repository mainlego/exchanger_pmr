@echo off
echo Starting Exchange PMR Services...
echo.

echo [1/3] Starting PostgreSQL and Redis via Docker...
docker-compose up -d postgres redis
timeout /t 5

echo.
echo [2/3] Installing dependencies...
call npm install
timeout /t 2

echo.
echo [3/3] Starting services in separate windows...
start "API Server" cmd /k "npm run api:dev"
timeout /t 3
start "Web App" cmd /k "npm run web:dev"
timeout /t 2
start "Telegram Bot" cmd /k "npm run bot:dev"

echo.
echo ======================================
echo All services started successfully!
echo ======================================
echo.
echo Web App: http://localhost:3000
echo API Server: http://localhost:4000
echo.
echo Press any key to stop all services...
pause >nul

echo.
echo Stopping all services...
docker-compose down
taskkill /F /FI "WindowTitle eq API Server*" /T
taskkill /F /FI "WindowTitle eq Web App*" /T
taskkill /F /FI "WindowTitle eq Telegram Bot*" /T
echo Done!