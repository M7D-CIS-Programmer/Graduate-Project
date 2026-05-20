@echo off
echo ============================================================
echo  InsightCV - Project Setup
echo ============================================================

echo.
echo [1/4] Installing frontend dependencies...
cd /d "%~dp0frontend"
npm install

echo.
echo [2/4] Restoring backend packages...
cd /d "%~dp0backend"
dotnet restore

echo.
echo [3/4] Building backend...
dotnet build

echo.
echo [4/4] Checking configuration...
if not exist "%~dp0backend\appsettings.json" (
    echo   appsettings.json not found - copying from template...
    copy "%~dp0backend\appsettings.example.json" "%~dp0backend\appsettings.json" >nul
    echo.
    echo   *** ACTION REQUIRED ***
    echo   appsettings.json has been created from the template.
    echo   Please open backend\appsettings.json and replace:
    echo     - REPLACE_WITH_YOUR_SECRET_KEY_MIN_32_CHARACTERS_LONG
    echo     - REPLACE_WITH_YOUR_GEMINI_API_KEY
    echo   with your real values before running the app.
    echo.
) else (
    echo   appsettings.json already exists. Skipping.
)

echo.
echo ============================================================
echo  Setup complete! Run start.bat to launch the app.
echo ============================================================
pause
