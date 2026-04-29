@echo off
setlocal

echo === SyncStuff Desktop Build ===
echo.

cd /d "%~dp0apps\desktop"

echo [1/4] Cleaning...
if exist "build" rmdir /s /q "build"

echo [2/4] Getting dependencies...
call flutter pub get

echo [3/4] Setting up VS environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat" x64

echo [4/4] Building Windows desktop...
call flutter build windows
if errorlevel 1 (
    echo.
    echo === Build Failed ===
    exit /b 1
)

echo.
echo === Build Successful! ===
echo Executable: %CD%\build\windows\x64\runner\Release\desktop.exe
endlocal