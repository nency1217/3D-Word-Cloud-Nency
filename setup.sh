#!/bin/bash
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  3D Word Cloud — Setup & Launch"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# --- Backend ---
echo ""
echo "[1/4] Setting up Python backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt --quiet
python -m spacy download en_core_web_sm --quiet
cd ..

# --- Frontend ---
echo "[2/4] Installing frontend dependencies..."
cd frontend
npm install --legacy-peer-deps --silent
cd ..

# --- Launch ---
echo "[3/4] Starting servers..."
echo ""

cd backend && source venv/bin/activate && \
  uvicorn main:app --reload --port 8000 --log-level warning &
BACKEND_PID=$!

cd frontend && npm run dev -- --port 5173 &
FRONTEND_PID=$!

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Backend  →  http://localhost:8000"
echo "  Frontend →  http://localhost:5173"
echo "  Press Ctrl+C to stop both servers"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

trap "echo 'Shutting down...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
