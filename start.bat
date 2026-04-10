@echo off
echo Starting AlumiNet...
echo.
echo  Backend  -> http://localhost:5000
echo  Frontend -> http://localhost:5173
echo.
echo Opening two terminal windows...

start "AlumiNet Backend" cmd /k "cd server && npm run dev"
timeout /t 3
start "AlumiNet Frontend" cmd /k "cd client && npm run dev"

echo.
echo Both servers are starting...
echo Open http://localhost:5173 in your browser!
pause
