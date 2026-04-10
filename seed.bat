@echo off
echo Seeding database with demo data...
cd server
node seed.js
cd ..
pause
