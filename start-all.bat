@echo off
setlocal enabledelayedexpansion

echo.
echo ============================================
echo   AI Video Subtitle Processor
echo   Starting All Services...
echo ============================================
echo.

REM Kill any existing processes on ports 5000 and 5173
for /f "tokens=5" %%a in ('netstat -aon ^| find "5000"') do taskkill /pid %%a /f 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find "5173"') do taskkill /pid %%a /f 2>nul

REM Start backend
echo [1/2] Starting Backend Service (Node.js)...
start "Backend - AI Subtitle Processor" cmd /k "cd backend && npm run dev"
timeout /t 5 /nobreak

REM Start frontend
echo [2/2] Starting Frontend Service (React)...
start "Frontend - AI Subtitle Processor" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak

echo.
echo ============================================
echo   Services Started Successfully!
echo ============================================
echo.
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:5173
echo.
echo   Opening browser... (in 3 seconds)
echo ============================================
echo.

timeout /t 3 /nobreak
start http://localhost:5173

pause
