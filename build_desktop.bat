@echo off
cd /d "D:\repos\ionic\syncstuff\apps\desktop"

echo === SyncStuff Desktop Build ===
echo.

echo [1/6] Cleaning...
if exist "build" rmdir /s /q "build"

echo [2/6] Getting dependencies...
call flutter pub get

echo [3/6] Setting up VS environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat" x64

echo [4/6] Configuring...
"C:\Program Files\CMake\bin\cmake.exe" -G Ninja -DCMAKE_BUILD_TYPE=Release -S windows -B build/windows
if errorlevel 1 goto :fail

echo [5/6] Building...
"C:\Program Files\CMake\bin\cmake.exe" --build build/windows --config Release
if errorlevel 1 goto :fail

echo [6/6] Copying data files...
REM Create data directory
if not exist "build\windows\runner\data" mkdir "build\windows\runner\data"

REM Copy flutter assets
if exist "windows\flutter\ephemeral\icudtl.dat" copy "windows\flutter\ephemeral\icudtl.dat" "build\windows\runner\data\"
if exist "windows\flutter\ephemeral\flutter_windows.dll" copy "windows\flutter\ephemeral\flutter_windows.dll" "build\windows\runner\"

REM Check for flutter_assets
if exist "build\windows\data\flutter_assets" (
    xcopy /s /y "build\windows\data\flutter_assets\*" "build\windows\runner\data\flutter_assets\" 2>nul
)

REM Copy app.so (AOT compiled Dart code)
if exist "build\windows\app.so" copy "build\windows\app.so" "build\windows\runner\data\app.so"

echo.
echo === Build Successful! ===
echo Executable: %CD%\build\windows\runner\desktop.exe
goto :end

:fail
echo.
echo === Build Failed ===
exit /b 1

:end