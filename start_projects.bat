@echo off

REM Check if node_modules exists in FE/NEAprojectFE
if not exist "FE\NEAprojectFE\node_modules" (
    echo node_modules not found. Running npm install...
    cd FE\NEAprojectFE
    call npm install
    cd ..\..
)

REM Check if venv exists in BE
if not exist "BE\venv" (
    echo venv not found. Creating virtual environment...
    cd BE
    python -m venv venv
    call .\venv\Scripts\activate.bat
    cd NEAProjectBE
    echo Installing Python dependencies...
    pip install -r requirements.txt
    echo Running migrations...
    python manage.py migrate
    cd ..\..
) else (
    echo venv found. Checking migrations...
    cd BE
    call .\venv\Scripts\activate.bat
    cd NEAProjectBE
    python manage.py migrate
    python manage.py create_admin
    cd ..\..
)

REM Start Django backend in a new minimized window
start "Django Backend" /min cmd /k "cd BE && call .\venv\Scripts\activate.bat && cd NEAProjectBE && python manage.py runserver 0.0.0.0:8000"

REM Start React frontend in a new minimized window
start "React Frontend" /min cmd /k "cd .\FE\NEAprojectFE && npm run dev"

REM Wait for servers to start
timeout /t 3 /nobreak >nul

REM Open frontend in default browser
start "" http://localhost:5173/

REM Minimize this window
powershell -window minimized -command ""
exit