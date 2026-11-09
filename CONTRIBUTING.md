# Contributing to Astral Odyssey: 3D Solar System & Space Command

Thank you for your interest in contributing to **Astral Odyssey (सौर मंडल एवं अंतरिक्ष अभियान)**!

## Development Workflow

1. **Fork & Clone the Repository**
   ```bash
   git clone https://github.com/<your-username>/astral-odyssey-solar-cmd.git
   cd astral-odyssey-solar-cmd
   npm install
   ```

2. **Start Local Development Server**
   ```bash
   npm run dev
   ```
   The application runs on `http://localhost:3000`.

3. **Type-Check & Production Build Verification**
   Always verify that TypeScript and the Vite + Workbox PWA build succeed with zero errors before opening a Pull Request:
   ```bash
   npm run lint
   npm run build
   ```

4. **Android 7.0 (API 24) to Android 17 (API 37) Testing**
   - Touch controls can be tested on desktop at any time using the **`Touch Pad: ON`** toggle in the bottom command dock.
   - Software-WebGL fallback pacing (`isSoftwareGl` + `afterDraw`) and the Adaptive FPS Governor ensure 60fps responsiveness across low-end Android 7.0 Nougat devices through flagship Android 17 hardware.
