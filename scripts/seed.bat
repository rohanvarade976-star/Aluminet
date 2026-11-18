@echo off
cd /d "%~dp0.."
echo Seeding database with demo data...
cd server
node seed.js
cd ..
pause
