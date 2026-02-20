@echo off

REM Start MongoDB
start "MongoDB" "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath C:\data\db

REM Start Backend
start "Backend" cmd /k "cd backend && npm start"

REM Start Frontend
start "Frontend" cmd /k "cd frontend && npm start"
