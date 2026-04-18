@echo off
start "Backend" cmd /k "cd /d "%~dp0backend" && dotnet run"
start "Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"
