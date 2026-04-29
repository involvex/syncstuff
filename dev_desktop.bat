@echo off
setlocal

echo === SyncStuff Desktop Dev ===
echo.

cd /d "%~dp0apps\desktop"

echo Setting up VS environment for CMake...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat" x64

echo Running desktop app in debug mode...
call flutter run -d windows

endlocal