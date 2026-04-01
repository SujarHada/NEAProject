@echo off

REM Fetch the current IP address starting with 192.168
set "CURRENT_IP="
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4" ^| findstr "192.168"') do (
    for /f "tokens=* delims= " %%j in ("%%i") do (
        set "CURRENT_IP=%%j"
    )
)

set "ENV_FILE=FE\NEAprojectFE\.env"

if not "%CURRENT_IP%"=="" (
    setlocal EnableDelayedExpansion
    set "NEW_URL=http://!CURRENT_IP!:8000"
    
    echo Updating .env file with current IP...
    echo VITE_API_URL=!NEW_URL!> "!ENV_FILE!"
    endlocal
) else (
    echo Could not find a 192.168.* IP address.
    echo Updating .env file with localhost...
    echo VITE_API_URL=http://localhost:8000> "%ENV_FILE%"
)

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js not found. Installing Node.js via winget...
    winget install --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements --silent
    echo Refreshing PATH...
    REM Refresh PATH so node/npm are available in this session
    for /f "tokens=2*" %%A in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v Path 2^>nul') do set "SYS_PATH=%%B"
    for /f "tokens=2*" %%A in ('reg query "HKCU\Environment" /v Path 2^>nul') do set "USR_PATH=%%B"
    set "PATH=%SYS_PATH%;%USR_PATH%"
    REM Verify node is now available
    where node >nul 2>nul
    if %errorlevel% neq 0 (
        echo ERROR: Node.js was installed but is not found on PATH.
        echo Please close this window, open a new terminal, and run this script again.
        pause
        exit /b 1
    )
    echo Node.js is now available.
) else (
    echo Node.js is already installed.
)

REM Check if node_modules exists in FE/NEAprojectFE
if not exist "FE\NEAprojectFE\node_modules" (
    echo node_modules not found. Running npm install...
    cd FE\NEAprojectFE
    call npm install --legacy-peer-deps
    cd ..\..
)
REM Check if uv is installed
where uv >nul 2>nul
if %errorlevel% neq 0 (
    echo uv not found. Installing uv...
    powershell -Command Set-ExecutionPolicy RemoteSigned -scope CurrentUser
    powershell -Command "irm https://astral.sh/uv/install.ps1 | iex"
) else (
    echo uv is already installed.
)
REM Check if venv exists in BE
if not exist "BE\.venv" (
    echo venv not found. Creating virtual environment...
    cd BE
    uv init
    cd NEAProjectBE
    echo Installing Python dependencies...
    uv add -r requirements.txt
    echo Running migrations...
    uv run manage.py migrate
    cd ..\..
) else (
    echo venv found. Checking migrations...
    cd BE
    cd NEAProjectBE
    uv run manage.py migrate
    cd ..\..
)

REM Start Django backend in a new minimized window
start "Django Backend" /min cmd /k "cd BE && cd NEAProjectBE && uv run manage.py create_admin && uv run manage.py runserver 0.0.0.0:8000"

REM Start React frontend in a new minimized window
start "React Frontend" /min cmd /k "cd .\FE\NEAprojectFE && npm run dev"

REM Wait for servers to start
timeout /t 3 /nobreak >nul

REM Open frontend in default browser
start "" "http://%CURRENT_IP%:5173/"

REM Minimize this window
powershell -window minimized -command ""
exit
