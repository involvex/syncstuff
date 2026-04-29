@echo off
setlocal enabledelayedexpansion

echo === SyncStuff Desktop Dev ===
echo.

cd /d "%~dp0apps\desktop"

echo [1/3] Setting up VS environment...

set "VCVARS="
if exist "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat" (
    set "VCVARS=C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat"
)
if exist "C:\Program Files\Microsoft Visual Studio\2022\Professional\VC\Auxiliary\Build\vcvars64.bat" (
    set "VCVARS=C:\Program Files\Microsoft Visual Studio\2022\Professional\VC\Auxiliary\Build\vcvars64.bat"
)
if exist "C:\Program Files\Microsoft Visual Studio\2022\Enterprise\VC\Auxiliary\Build\vcvars64.bat" (
    set "VCVARS=C:\Program Files\Microsoft Visual Studio\2022\Enterprise\VC\Auxiliary\Build\vcvars64.bat"
)
if exist "C:\Program Files\Microsoft Visual Studio\2022\Preview\VC\Auxiliary\Build\vcvars64.bat" (
    set "VCVARS=C:\Program Files\Microsoft Visual Studio\2022\Preview\VC\Auxiliary\Build\vcvars64.bat"
)

if defined VCVARS (
    echo Found VS environment: !VCVARS!
    call "!VCVARS!" x64
) else (
    echo WARNING: Visual Studio 2022 not found. C++ compiler may not be available.
    echo If build fails, install Visual Studio 2022 with C++ Desktop Development workload.
)

echo [2/3] Getting dependencies...
call flutter pub get

echo [3/3] Running in debug mode...
call flutter run -d windows

endlocal