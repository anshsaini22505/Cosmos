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

Once pushed to GitHub, the included workflows (`.github/workflows/build-apk.yml` and `.github/workflows/android-and-github-pages.yml`) automatically:
1. **GitHub Actions Tab**: Compiles ready-to-install Android APKs (`Astral-Odyssey-Android-APK`) accessible directly under your repository's **Actions → Artifacts** tab.
2. **GitHub Releases**: Automatically attaches the `.apk` (`Astral-Odyssey-Solar-Command-v2.2.0.apk`) to GitHub Releases for direct 1-tap phone downloads.
3. **GitHub Pages PWA**: Deploys the full-fidelity web version with offline service worker support.

## 📲 How to Download & Install the APK on Your Phone
1. Go to your GitHub repository and click the **Actions** tab.
2. Select the latest workflow run named **"Build Android APK (Automated Release)"**.
3. Under the **Artifacts** section at the bottom, tap **`Astral-Odyssey-Android-APK`** to download.
4. Or visit the **Releases** tab to download the standalone `.apk` directly without unzipping.
5. Tap the `.apk` file on your Android phone and click **Install**!

## 🌟 Visual & Gameplay Features
- **Ultra 4K Graphics**: Planetary atmospheric halos (Earth, Venus, Mars, Jupiter), volumetric cosmic nebulae dust clouds, dynamic plasma thrusters, pulsating solar corona, and forward tactical starship spotlights.
- **Autonomous AI Pilot**: Complete self-playing mode that navigates between all 10 solar worlds, scans planets, mines asteroid belts, and battles Void Pirates automatically.
- **In-App Update & APK Hub**: In-game version tracking, update check animations, and direct download links.
- **36 Languages**: Automatic browser language detection with instant live switching for 36 Indian and international languages.
