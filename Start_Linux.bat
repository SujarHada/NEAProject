::[Bat To Exe Converter]
::
::YAwzoRdxOk+EWAjk
::fBw5plQjdCyDJGyX8VAjFDpneTe+GGStCLkT6ezo0+OErUMbW/A6YIqV07eBQA==
::YAwzuBVtJxjWCl3EqQJgSA==
::ZR4luwNxJguZRRnk
::Yhs/ulQjdF+5
::cxAkpRVqdFKZSzk=
::cBs/ulQjdF+5
::ZR41oxFsdFKZSDk=
::eBoioBt6dFKZSDk=
::cRo6pxp7LAbNWATEpCI=
::egkzugNsPRvcWATEpCI=
::dAsiuh18IRvcCxnZtBJQ
::cRYluBh/LU+EWAnk
::YxY4rhs+aU+JeA==
::cxY6rQJ7JhzQF1fEqQJQ
::ZQ05rAF9IBncCkqN+0xwdVs0
::ZQ05rAF9IAHYFVzEqQJQ
::eg0/rx1wNQPfEVWB+kM9LVsJDGQ=
::fBEirQZwNQPfEVWB+kM9LVsJDGQ=
::cRolqwZ3JBvQF1fEqQJQ
::dhA7uBVwLU+EWDk=
::YQ03rBFzNR3SWATElA==
::dhAmsQZ3MwfNWATElA==
::ZQ0/vhVqMQ3MEVWAtB9wSA==
::Zg8zqx1/OA3MEVWAtB9wSA==
::dhA7pRFwIByZRRnk
::Zh4grVQjdCyDJGyX8VAjFDpneTe+GGStCLkT6ezo09mTo18JGcMvaLDs07qKL/cApED8cPY=
::YB416Ek+ZG8=
::
::
::978f952a14a936cc963da21a135fa983
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
    cd ..\..
)

REM Start Django backend in a new minimized window
start "Django Backend" /min cmd /k "cd BE && call .\venv\Scripts\activate.bat && cd NEAProjectBE && python manage.py create_admin && python manage.py runserver 0.0.0.0:8000"

REM Start React frontend in a new minimized window
start "React Frontend" /min cmd /k "cd .\FE\NEAprojectFE && npm run dev"

REM Wait for servers to start
timeout /t 3 /nobreak >nul

REM Open frontend in default browser
start "" http://localhost:5173/

REM Minimize this window
powershell -window minimized -command ""
exit