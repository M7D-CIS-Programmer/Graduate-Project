@echo off
echo Installing frontend dependencies...
cd /d "%~dp0frontend"
npm install

echo.
echo Restoring backend packages...
cd /d "%~dp0backend"
dotnet restore

echo.
echo Building backend...
dotnet build

echo.
echo Setup complete! Run start.bat to launch the app.
pause
