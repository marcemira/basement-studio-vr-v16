@echo off
cd /d "%~dp0"
set "ROOM_NODE=C:\Users\marce\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%ROOM_NODE%" set "ROOM_NODE=node"
start "Room VR Viewer" /min "%ROOM_NODE%" "%~dp0serve.mjs"
timeout /t 2 /nobreak >nul
start "" "http://localhost:8877"
