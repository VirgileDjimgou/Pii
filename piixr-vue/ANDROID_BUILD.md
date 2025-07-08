# Android Build Instructions for PiixR AR

## Prerequisites

Before building the Android APK, you need to have the following installed:

1. **Android Studio** (latest version)
   - Download from: https://developer.android.com/studio
   - Install with Android SDK, Android SDK Platform-Tools, and Android SDK Build-Tools

2. **Java Development Kit (JDK) 17 or higher**
   - Android Studio usually includes this, but you can download from: https://adoptium.net/

## Environment Setup

1. **Install Android Studio** and open it at least once to complete the initial setup
2. **Configure Android SDK path** by creating a `local.properties` file in the `android` directory:

```properties
sdk.dir=C:\\Users\\[YourUsername]\\AppData\\Local\\Android\\Sdk
```

Replace `[YourUsername]` with your actual Windows username.

## Build Process

### Option 1: Using NPM Scripts (Recommended)

```bash
# Build and sync to Android (from project root)
npm run build:android

# Open in Android Studio
npm run open:android

# Build and run on connected device
npm run run:android
```

### Option 2: Manual Steps

1. **Build the web app:**
   ```bash
   npm run build
   ```

2. **Sync to Android:**
   ```bash
   npx cap sync android
   ```

3. **Open in Android Studio:**
   ```bash
   npx cap open android
   ```

4. **Build APK in Android Studio:**
   - Select `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - The APK will be generated in `android/app/build/outputs/apk/debug/`

### Option 3: Command Line Build

```bash
cd android
./gradlew assembleDebug
```

## APK Location

After successful build, the APK will be located at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## Installation on Device

1. **Enable Developer Mode** on your Android device:
   - Go to Settings → About phone → Tap "Build number" 7 times
   - Go back to Settings → Developer options → Enable "USB debugging"

2. **Install via ADB:**
   ```bash
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

3. **Or copy the APK** to your device and install manually

## Troubleshooting

- **SDK location not found**: Ensure `local.properties` exists with correct SDK path
- **Build tools version**: Update Android SDK Build-Tools to latest version
- **Gradle sync failed**: Run `./gradlew clean` and try again
- **ADB not found**: Add Android SDK platform-tools to your PATH

## Release Build

For a release build ready for Play Store:

1. Generate a signing key:
   ```bash
   keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Configure signing in `android/app/build.gradle`

3. Build release APK:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

The app includes all your latest features:
- Vue 3 + TypeScript architecture
- Three.js 3D AR preview
- Horizontal scrollable button panel
- Modern dark UI design
- All existing functionality preserved
