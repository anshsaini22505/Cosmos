# Security Policy

## Supported Versions & Platforms

| Platform / Version | Supported |
| :--- | :--- |
| **Web / Progressive Web App (PWA)** | ✅ Active |
| **Android 7.0 (API 24) – Android 17 (API 37)** | ✅ Active |
| **iOS / iPadOS Safari Standalone** | ✅ Active |

## Security Architecture
- **100% Procedural Assets**: All 3D planetary textures, normal/ring maps, spacecraft geometries, and Web Audio sound effects are generated procedurally in-memory with zero external third-party script or binary asset dependencies.
- **Offline Sandbox Safe**: Service worker precaching only caches verified first-party build artifacts and Google Fonts stylesheets.
- **No Secret Leakage**: Environment variables are templated in `.env.example` and excluded via `.gitignore`.
