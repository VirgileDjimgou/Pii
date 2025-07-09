@echo off
echo Building PiixR AR for Android...
echo.

REM Check if Android SDK is configured
if not exist "android\local.properties" (
    echo ERROR: local.properties not found!
    echo Please copy android\local.properties.template to android\local.properties
    echo and update the SDK path for your system.
    echo.
    pause
    exit /b 1
)

echo Step 1: Building Vue app...
call npm run build
if errorlevel 1 (
    echo ERROR: Web build failed!
    pause
    exit /b 1
)

echo Step 2: Syncing to Android...
call npx cap sync android
if errorlevel 1 (
    echo ERROR: Capacitor sync failed!
    pause
    exit /b 1
)

echo Step 3: Building Android APK...
cd android
call gradlew.bat assembleDebug
if errorlevel 1 (
    echo ERROR: Android build failed!
    echo Make sure Android SDK is properly configured in local.properties
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ✅ Build completed successfully!
echo APK location: android\app\build\outputs\apk\debug\app-debug.apk
echo.

REM Check if APK exists and show its info
if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
    echo APK file size:
    dir "android\app\build\outputs\apk\debug\app-debug.apk" | find "app-debug.apk"
    echo.
    echo To install on device: adb install android\app\build\outputs\apk\debug\app-debug.apk
)

pause
