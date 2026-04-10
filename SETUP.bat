@echo off
echo ============================================
echo    AlumiNet - Auto Setup Script
echo ============================================
echo.

echo [1/3] Installing server dependencies...
cd server
call npm install
cd ..

echo.
echo [2/3] Installing client dependencies...
cd client
call npm install
cd ..

echo.
echo [3/3] Setup complete!
echo.
echo ============================================
echo  NEXT STEP: Add your MongoDB URI to .env
echo  File location: server\.env
echo ============================================
echo.
echo  After setting up .env, run:
echo    seed.bat   (to add demo data)
echo    start.bat  (to run the app)
echo.
pause
