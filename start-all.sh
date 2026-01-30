#!/bin/bash

echo ""
echo "============================================"
echo "  AI Video Subtitle Processor"
echo "  Starting All Services..."
echo "============================================"
echo ""

# Kill any existing processes on ports 5000 and 5173
lsof -ti:5000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

# Start backend
echo "[1/2] Starting Backend Service (Node.js)..."
cd backend
npm run dev &
BACKEND_PID=$!
sleep 5

# Start frontend
echo "[2/2] Starting Frontend Service (React)..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!
sleep 3

echo ""
echo "============================================"
echo "  Services Started Successfully!"
echo "============================================"
echo ""
echo "  Backend:  http://localhost:5000"
echo "  Frontend: http://localhost:5173"
echo ""
echo "  Press Ctrl+C to stop all services"
echo "============================================"
echo ""

wait $BACKEND_PID $FRONTEND_PID
