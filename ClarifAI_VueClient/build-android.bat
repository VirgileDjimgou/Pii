@echo off
REM Build script for ClarifAI Vue client with Capacitor integration
echo Building ClarifAI Vue client for Android...

REM Step 1: Build the Vue application
echo Step 1: Building Vue application...
call npm run build

REM Step 2: Sync with Capacitor
echo Step 2: Syncing with Capacitor...
call npx cap sync android

REM Step 3: Open Android Studio (optional)
echo Step 3: Ready to open in Android Studio
echo Run 'npx cap open android' to open in Android Studio
echo Build complete!
pause
