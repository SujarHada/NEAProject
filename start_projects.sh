#!/bin/bash

# Navigate to project root (same level as BE and FE)
cd "$(dirname "$0")"

# Check if node_modules exists in FE/NEAprojectFE
if [ ! -d "FE/NEAprojectFE/node_modules" ]; then
    echo "node_modules not found. Running npm install..."
    cd FE/NEAprojectFE
    npm install
    cd ../..
fi

# Check if venv exists in BE
if [ ! -d "BE/venv" ]; then
    echo "venv not found. Creating virtual environment..."
    cd BE
    python3 -m venv venv
    source ./venv/bin/activate
    cd NEAProjectBE
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
    python manage.py create_admin
    echo "Running migrations..."
    python manage.py migrate
    cd ../..
else
    echo "venv found. Checking migrations..."
    source ./BE/venv/bin/activate
    cd ./BE/NEAProjectBE
    python manage.py migrate
    cd ../..
fi

# Function to minimize terminal window
minimize_terminal() {
    if command -v xdotool &> /dev/null; then
        WINDOW_ID=$(xdotool getactivewindow)
        xdotool windowminimize $WINDOW_ID
    elif command -v wmctrl &> /dev/null; then
        wmctrl -r :ACTIVE: -b add,hidden
    fi
}

# Activate Python virtual environment
source ./BE/venv/bin/activate

# Start Django backend in background
cd ./BE/NEAProjectBE
python manage.py create_admin
python manage.py runserver 0.0.0.0:8000 &
DJANGO_PID=$!


# Start React frontend in background
cd ../../FE/NEAprojectFE
npm run dev &
REACT_PID=$!

# Wait a moment for servers to start
sleep 3

# Open frontend in default browser
xdg-open http://localhost:5173/ >/dev/null 2>&1 &

# Minimize the terminal
minimize_terminal

# Wait for both background jobs to complete
wait $DJANGO_PID $REACT_PID