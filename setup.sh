#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  3D Word Cloud — Setup & Launch"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# --- Backend ---
echo ""
echo "[1/4] Setting up Python backend..."
cd "$ROOT_DIR/backend"
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt --quiet
python -m spacy download en_core_web_sm --quiet
deactivate

# --- Frontend ---
echo "[2/4] Installing frontend dependencies..."
cd "$ROOT_DIR/frontend"
npm install --legacy-peer-deps --silent

# --- Launch ---
echo "[3/4] Starting servers..."
echo ""

cd "$ROOT_DIR/backend"
source venv/bin/activate
uvicorn main:app --reload --port 8000 --log-level warning &
BACKEND_PID=$!

cd "$ROOT_DIR/frontend"
npm run dev -- --port 5173 &
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
