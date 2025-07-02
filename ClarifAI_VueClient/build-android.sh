#!/bin/bash

# Build script for ClarifAI Vue client with Capacitor integration
echo "Building ClarifAI Vue client for Android..."

# Step 1: Build the Vue application
echo "Step 1: Building Vue application..."
npm run build

# Step 2: Sync with Capacitor
echo "Step 2: Syncing with Capacitor..."
npx cap sync android

# Step 3: Open Android Studio (optional)
echo "Step 3: Ready to open in Android Studio"
echo "Run 'npx cap open android' to open in Android Studio"
echo "Build complete!"
