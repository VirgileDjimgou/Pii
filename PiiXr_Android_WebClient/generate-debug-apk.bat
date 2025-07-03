@echo off
echo ============================================
echo    Quick Debug APK Generation
echo ============================================
echo.

echo Building Vue application...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo Syncing with Android...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ERROR: Sync failed!
    pause
    exit /b 1
)

echo Generating debug APK...
cd android
call gradlew assembleDebug
if %errorlevel% neq 0 (
    echo ERROR: APK generation failed!
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ============================================
echo    SUCCESS! Debug APK Generated
echo ============================================
echo Location: android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo You can now install this APK on your Android device for testing.
echo Note: This is a debug version. For production, use generate-apk.bat
echo.
pause
