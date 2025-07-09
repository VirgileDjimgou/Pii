# PiixR AR - Vue 3 + TypeScript + Vite + Capacitor

A modern AR-focused mobile application built with Vue 3, TypeScript, and Capacitor for cross-platform deployment.

## Features

- 🎯 **Vue 3** with Composition API and `<script setup>` syntax
- 🔧 **TypeScript** for type safety and better development experience  
- ⚡ **Vite** for fast development and optimized builds
- 📱 **Capacitor** for native mobile app deployment
- 🎨 **Three.js** for 3D AR preview and interactive visualizations
- 🎮 **Horizontal scrollable UI** with modern button panels
- 🌙 **Dark theme** with AR-inspired design

## Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Mobile App Development

### Android Build

See [ANDROID_BUILD.md](./ANDROID_BUILD.md) for complete Android build instructions.

**Quick Start:**
1. Install Android Studio and configure SDK
2. Copy `android/local.properties.template` to `android/local.properties` and update SDK path
3. Run the build script: `build-android.bat`

**Available Scripts:**
```bash
npm run build:android    # Build web app and sync to Android
npm run open:android     # Open project in Android Studio  
npm run run:android      # Build and run on connected device
```

## Project Structure

```
src/
├── components/          # Vue components
│   ├── ar/             # AR-specific components  
│   ├── ui/             # UI components (ScrollableButtonPanel, etc.)
│   └── visualizations/ # Three.js components
├── composables/        # Vue composables for logic
├── stores/             # Pinia state management
├── views/              # Page components
└── router/             # Vue Router configuration
```

## Technology Stack

- **Frontend**: Vue 3, TypeScript, Vite
- **3D Graphics**: Three.js, GSAP animations
- **Mobile**: Capacitor (Android/iOS)
- **State Management**: Pinia
- **Routing**: Vue Router
- **Styling**: Scoped CSS with modern design patterns

Learn more about [Vue 3 TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).
