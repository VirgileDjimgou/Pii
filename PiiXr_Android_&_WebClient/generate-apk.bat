@echo off
echo ============================================
echo    PiiXr Android APK Generation
echo ============================================
echo.

echo Step 1: Building Vue application...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo ✓ Build completed successfully!
echo.

echo Step 2: Syncing with Android platform...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ERROR: Sync failed!
    pause
    exit /b 1
)
echo ✓ Sync completed successfully!
echo.

echo Step 3: Opening Android Studio...
call npx cap open android
echo.

echo ============================================
echo    Complete the APK generation in Android Studio:
echo ============================================
echo 1. Wait for Gradle sync to finish
echo 2. Go to Build → Generate Signed Bundle / APK
echo 3. Select "APK" (not Bundle)
echo 4. Create/select keystore and signing config
echo 5. Choose "release" build variant
echo 6. Click Finish
echo.
echo APK will be saved to:
echo android\app\build\outputs\apk\release\app-release.apk
echo.
echo For testing only, you can also generate debug APK:
echo cd android && gradlew assembleDebug
echo.
pause
