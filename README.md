# Astral Odyssey: 3D Solar System & Space Command (सौर मंडल एवं अंतरिक्ष अभियान)

An interactive 3D space flight, full Solar System exploration, orbital base-building, starship upgrade hangar, and cosmic defense game built with **Three.js**, **React 19**, **Tailwind CSS v4**, and **PWA / Capacitor Android**.

## Android 7.0 to Android 17 Compatibility Matrix

| Android Release | API Level | Architecture / Support Details |
| :--- | :--- | :--- |
| **Android 7.0 / 7.1 (Nougat)** | API 24–25 | `minSdkVersion = 24` · WebGL2 / Hardware-Accelerated Canvas + Software Fallback Pacing |
| **Android 8.0 / 8.1 (Oreo)** | API 26–27 | Adaptive Maskable Icons (`pwa-maskable-512x512.png`) + Web Audio Synth |
| **Android 9 (Pie) – Android 11** | API 28–30 | Full-Screen Immersive Display Cutout & Dual-Thumb Virtual Joystick |
| **Android 12 – Android 14** | API 31–34 | 60fps/120Hz High-Refresh Rate Damping & Haptic Vibration Feedback |
| **Android 15 – Android 16** | API 35–36 | Edge-to-Edge Viewport & Standalone WebAPK / TWA Support |
| **Android 17 (Baklava+)** | API 37 | `targetSdkVersion = 37` & `compileSdkVersion = 37` Ready |

---

## Quick Start & Push to GitHub

```bash
# 1. Install dependencies & run locally
npm install
npm run dev

# 2. Push to your GitHub Repository
git init
git add .
git commit -m "feat: Astral Odyssey 3D Solar System Game + PWA + Android 7-17"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

Once pushed to GitHub, the included workflow (`.github/workflows/android-and-github-pages.yml`) automatically:
1. Builds the offline-capable **Progressive Web App (PWA)** for GitHub Pages.
2. Compiles an installable **Android 7–17 APK** (`Astral-Odyssey-Android-7-to-17-APK`) under your repository's **Actions → Artifacts** tab.
