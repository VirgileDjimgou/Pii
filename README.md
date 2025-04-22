# 🧠 AssistAR Live – Remote Industrial Guidance in Augmented Reality  
Vue.js + Three.js + AR.js + MQTT + Net.Core + ASP.NET Core

AssistAR Live is a lightweight, real-time **remote support platform** designed for industrial environments where operators need expert assistance to solve robotic or mechanical issues.  
It enables technicians on the shop floor to stream their camera view via a mobile AR interface, while remote experts can overlay visual guidance (arrows, zones, annotations) aligned with the real-world context.

## 🎯 Project Scope (Real-World + Lightweight)

This project is **not** meant to replace full-scale AR headsets or proprietary maintenance systems.  
Instead, it provides:
- 📱 A low-barrier, browser-based AR solution for field technicians using smartphones
- 🧑‍💻 A web interface for remote experts to annotate live video feeds
- 🔁 Real-time bidirectional communication using MQTT and WebRTC
- 🔧 Easy deployment on mobile or desktop with Capacitor or Electron

## 🧩 Core Modules

### Frontend (Vue.js + Three.js + AR.js)
- 🎥 ARClient — Activates smartphone camera and tracks physical markers or surfaces
- 🧭 AnnotationOverlay — Displays arrows, highlights, or text notes in sync with real-world coordinates
- 🌍 ThreeScene — Renders interactive 3D overlays with Three.js
- 📡 MqttSyncClient — Receives commands and annotation data from remote expert
- 🧩 WebRTCModule — Streams live video feed to support interface (optional)

### Expert Dashboard (Web/Desktop)
- 🖥 AnnotationPanel — Lets the remote expert draw, annotate, and guide in real-time
- 📡 MqttPublisher — Sends annotation coordinates and messages to mobile
- 🎥 VideoFeedViewer — Displays incoming WebRTC video stream from field technician

### Backend (Optional)
- 💬 MQTT Broker — Central message relay (Mosquitto or HiveMQ)
- 🧠 AnnotationBridge — Optional Node.js or ASP.NET Core relay to log sessions, events, and diagnostics
- 📚 SessionLogger — Saves annotation and help session data for future review

## 📦 Project Structure

assist-ar-live/
├── mobile-client/              → Vue 3 + Three.js + AR.js (Capacitor app)
│   └── components/ARClient.vue, AnnotationOverlay.vue
├── expert-dashboard/          → Web app (Vue.js) for remote guidance
│   └── components/AnnotationPanel.vue, VideoFeedViewer.vue
├── shared-mqtt/               → MQTT Topics, interfaces
│   └── topics.ts, annotations.ts
├── backend-api/               → Optional backend (ASP.NET Core or Node.js)
│   └── AnnotationController.cs or index.ts
├── mqtt-broker/               → Mosquitto config + startup
└── docs/                      → Technical architecture, mockups, use cases

## 🚀 MVP Implementation Plan (4 Weeks)

### Week 1
- [x] Setup Vue + Capacitor mobile client
- [x] Integrate AR.js with camera + marker detection
- [x] Establish MQTT communication (Mosquitto)

### Week 2
- [x] Implement 3D annotation overlay (arrows, zones)
- [x] Build expert dashboard for drawing/annotation
- [x] Sync AR overlay with remote actions via MQTT

### Week 3
- [ ] Add video stream (WebRTC) to expert UI
- [ ] Save annotations and session logs in backend

### Week 4
- [ ] Optimize UI/UX for industrial settings
- [ ] Package APK for Android, test with real scenario

## 📚 Example Interaction Flow

1. Technician opens **AssistAR mobile app** and scans the robot with AR.js
2. Remote expert opens dashboard and sees the video stream
3. Expert clicks “Draw arrow” pointing to a faulty screw
4. A message is sent via MQTT:
   ```json
   { "type": "annotation", "shape": "arrow", "position": { "x": 0.4, "y": 1.2, "z": -0.6 } }
   ```
5. Arrow appears live in technician's AR view aligned with robot

## 🔗 Technologies
- Vue 3 + TypeScript + Three.js + AR.js
- Capacitor (Android build)
- WebRTC (video stream)
- MQTT (Mosquitto or HiveMQ)
- Optional backend: ASP.NET Core or Node.js
- Docker (for Mosquitto, backend services)

## 💡 Use Cases
- 🛠 Remote machine diagnostics
- 🤝 Expert-guided assembly or maintenance
- 📚 Training new technicians with AR overlay
- 📡 AR-enabled support in resource-limited areas
