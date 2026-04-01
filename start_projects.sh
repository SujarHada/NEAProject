
#!/bin/bash

# Navigate to project root (same level as BE and FE)
cd "$(dirname "$0")"

# Try to get 192.168.* IP address
if command -v ipconfig.exe &> /dev/null; then
    CURRENT_IP=$(ipconfig.exe | grep -i "IPv4" | grep -o '192\.168\.[0-9]*\.[0-9]*' | head -n 1)
else
    CURRENT_IP=$(ifconfig 2>/dev/null | grep -Eo '192\.168\.[0-9]*\.[0-9]*' | head -n 1)
    if [ -z "$CURRENT_IP" ]; then
        CURRENT_IP=$(ip -4 addr show 2>/dev/null | grep -Eo '192\.168\.[0-9]*\.[0-9]*' | head -n 1)
    fi
fi

ENV_FILE="FE/NEAprojectFE/.env"

if [ -n "$CURRENT_IP" ]; then
    echo "Updating .env file with current IP..."
    echo "VITE_API_URL=http://$CURRENT_IP:8000" > "$ENV_FILE"
else
    echo "Could not find a 192.168.* IP address."
    echo "Updating .env file with localhost..."
    echo "VITE_API_URL=http://localhost:8000" > "$ENV_FILE"
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js not found. Installing Node.js LTS..."

    if command -v apt-get &> /dev/null; then
        # Debian/Ubuntu — use NodeSource LTS
        echo "Detected apt-based system. Installing via NodeSource..."
        curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
        sudo apt-get install -y nodejs
    elif command -v dnf &> /dev/null; then
        echo "Detected dnf-based system. Installing Node.js..."
        sudo dnf install -y nodejs npm
    elif command -v yum &> /dev/null; then
        echo "Detected yum-based system. Installing via NodeSource..."
        curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
        sudo yum install -y nodejs
    elif command -v pacman &> /dev/null; then
        echo "Detected pacman-based system. Installing Node.js..."
        sudo pacman -Sy --noconfirm nodejs npm
    elif command -v zypper &> /dev/null; then
        echo "Detected zypper-based system. Installing Node.js..."
        sudo zypper install -y nodejs npm
    else
        echo "ERROR: Could not detect a supported package manager."
        echo "Please install Node.js manually from https://nodejs.org/"
        exit 1
    fi

    # Verify installation
    if ! command -v node &> /dev/null; then
        echo "ERROR: Node.js installation failed. Please install it manually from https://nodejs.org/"
        exit 1
    fi
    echo "Node.js $(node --version) installed successfully."
else
    echo "Node.js $(node --version) is already installed."
fi

# Check if node_modules exists in FE/NEAprojectFE
if [ ! -d "FE/NEAprojectFE/node_modules" ]; then
    echo "node_modules not found. Running npm install..."
    cd FE/NEAprojectFE
    npm install --legacy-peer-deps
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
    # python manage.py create_admin
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

