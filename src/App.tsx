import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  SpaceCanvas,
  SpaceCanvasHandle,
  GameStateMode,
  CameraViewMode,
  GraphicsQualityMode,
  HudTelemetry,
} from './components/SpaceCanvas';
import {
  SOLAR_SYSTEM_DATA,
  BUILDABLE_STRUCTURES,
  STARSHIP_UPGRADES,
  SPACE_MISSIONS,
  SPACE_PROBES,
  PlanetData,
} from './data/solarSystemData';
import {
  HIGH_RES_SPACE_IMAGES,
  PLANET_INTERNAL_LAYERS,
  UNIVERSE_RESEARCH_ARTICLES,
  UniverseResearchArticle,
} from './data/universeResearchData';
import {
  SUPPORTED_LANGUAGES,
  detectInitialLanguage,
  getUIStrings,
} from './data/i18n';
import { soundEngine } from './audio/soundEngine';
import { PWAInstallButton, OfflineIndicator } from './pwa/PWAInstallButton';
import { UpdateAndApkModal } from './components/UpdateAndApkModal';
import {
  MobileTouchController,
  TacticalRadarMinimap,
  TouchInputState,
} from './components/MobileTouchAndRadar';

const INITIAL_TELEMETRY: HudTelemetry = {
  hull: 100,
  maxHull: 100,
  shield: 100,
  maxShield: 100,
  boostEnergy: 100,
  missileReadyPct: 100,
  score: 0,
  crystals: 140,
  titanium: 90,
  speed: 0,
  fps: 60,
  shipYaw: 0,
  autoPilotActive: false,
  autoPilotTargetName: null,
  nearestPlanet: SOLAR_SYSTEM_DATA[3],
  nearestDistance: 14,
  scannedPlanets: ['earth'],
  discoveredProbes: [],
  builtOutposts: [],
  piratesDestroyed: 0,
  asteroidsMined: 0,
  waveNumber: 1,
  activeAlert: null,
  upgrades: {
    laser: 1,
    engine: 1,
    hull: 1,
    shield: 1,
    tractor: 1,
  },
  completedMissions: [],
  radarBlips: [],
};

export default function App() {
  const canvasRef = useRef<SpaceCanvasHandle>(null);

  const touchInputRef = useRef<TouchInputState>({
    turnAxis: 0,
    thrustAxis: 0,
    firing: false,
    boosting: false,
  });

  const [langCode, setLangCode] = useState<string>(() =>
    detectInitialLanguage()
  );
  const [gameState, setGameState] = useState<GameStateMode>('title');
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('chase');
  const [graphicsQuality, setGraphicsQuality] =
    useState<GraphicsQualityMode>('ultra');
  const [timeScale, setTimeScale] = useState<number>(1);
  const [telemetry, setTelemetry] = useState<HudTelemetry>(INITIAL_TELEMETRY);

  // Solar System Scope style Planet Focus & Inspector Drawer
  const [focusPlanetId, setFocusPlanetId] = useState<string | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'overview' | 'core' | 'probes'>('overview');

  // Deep Space & Universe Research Atlas Modal
  const [showResearchHub, setShowResearchHub] = useState<boolean>(false);
  const [selectedArticle, setSelectedArticle] = useState<UniverseResearchArticle>(
    UNIVERSE_RESEARCH_ARTICLES[0]
  );

  // Clean Command Hangar Modal (Base Building, Ship Upgrades, Missions, Settings)
  const [showCommandModal, setShowCommandModal] = useState<boolean>(false);
  const [commandTab, setCommandTab] = useState<'build' | 'hangar' | 'missions' | 'settings'>('build');

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);

  const [showTouchPad, setShowTouchPad] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.innerWidth < 820
    );
  });

  const t = getUIStrings(langCode);
  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === langCode) ||
    SUPPORTED_LANGUAGES[0];
  const isHindi = langCode === 'hi' || langCode === 'hinglish';

  const handleLanguageChange = (newCode: string) => {
    setLangCode(newCode);
    try {
      localStorage.setItem('astral_odyssey_lang', newCode);
    } catch {
      // Ignore
    }
  };

  const getLocalizedPlanetName = useCallback(
    (planet: PlanetData) => {
      return t.planetNames[planet.id] || planet.hindiName || planet.name;
    },
    [t]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        if (showResearchHub) {
          setShowResearchHub(false);
          return;
        }
        if (showCommandModal) {
          setShowCommandModal(false);
          return;
        }
        if (focusPlanetId) {
          setFocusPlanetId(null);
          return;
        }
        setGameState((prev) =>
          prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev
        );
      } else if (e.code === 'KeyC' && gameState === 'playing') {
        setFocusPlanetId((prev) =>
          prev ? null : telemetry.nearestPlanet.id
        );
      } else if (e.code === 'KeyU' && gameState === 'playing') {
        setShowResearchHub((prev) => !prev);
      } else if (e.code === 'KeyB' && gameState === 'playing') {
        setShowCommandModal((prev) => !prev);
      } else if (e.code === 'KeyV' && gameState === 'playing') {
        setFocusPlanetId(null);
        setCameraMode((prev) =>
          prev === 'chase'
            ? 'overview'
            : prev === 'overview'
              ? 'cockpit'
              : 'chase'
        );
      } else if (e.code === 'KeyP' && gameState === 'playing') {
        setFocusPlanetId(null);
        canvasRef.current?.toggleAutoPilot();
      } else if (
        (e.code === 'KeyR' || e.code === 'KeyF') &&
        gameState === 'playing'
      ) {
        canvasRef.current?.fireHomingMissile();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    gameState,
    telemetry.nearestPlanet.id,
    showResearchHub,
    showCommandModal,
    focusPlanetId,
  ]);

  const handleStartExploreScope = () => {
    soundEngine.playWarp();
    setGameState('playing');
    setFocusPlanetId('earth');
    setInspectorTab('overview');
  };

  const handleStartFlightMode = () => {
    soundEngine.playWarp();
    setFocusPlanetId(null);
    setGameState('playing');
  };

  const handleStartAutoPlay = () => {
    soundEngine.playWarp();
    setFocusPlanetId(null);
    setGameState('playing');
    setTimeout(() => {
      if (!telemetry.autoPilotActive) {
        canvasRef.current?.toggleAutoPilot();
      }
    }, 120);
  };

  const handleRestartGame = () => {
    canvasRef.current?.resetMission();
    setFocusPlanetId(null);
    setGameState('playing');
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  const handleSelectPlanetInScope = (planet: PlanetData) => {
    soundEngine.playCollect();
    setFocusPlanetId(planet.id);
    canvasRef.current?.warpToPlanet(planet.id);
  };

  const focusedPlanetData =
    focusPlanetId && focusPlanetId !== 'blackhole'
      ? SOLAR_SYSTEM_DATA.find((p) => p.id === focusPlanetId) || null
      : null;

  const focusedPlanetLayers = focusedPlanetData
    ? PLANET_INTERNAL_LAYERS[focusedPlanetData.id] || []
    : [];

  const hullPct = Math.max(
    0,
    Math.min(100, Math.round((telemetry.hull / telemetry.maxHull) * 100))
  );
  const shieldPct = Math.max(
    0,
    Math.min(100, Math.round((telemetry.shield / telemetry.maxShield) * 100))
  );

  return (
    <div
      dir={currentLangObj.dir || 'ltr'}
      className="relative w-screen h-screen overflow-hidden bg-[#040711] select-none"
    >
      <OfflineIndicator />

      {/* Primary 100vw x 100vh 3D WebGL Solar System & Deep Space Canvas */}
      <SpaceCanvas
        ref={canvasRef}
        gameState={gameState}
        cameraMode={cameraMode}
        graphicsQuality={graphicsQuality}
        timeScale={timeScale}
        focusPlanetId={focusPlanetId}
        touchInputRef={touchInputRef}
        onTelemetryUpdate={setTelemetry}
        onGameEnd={(res) => setGameState(res)}
        onSelectPlanetCodex={(planet) => {
          setFocusPlanetId(planet.id);
          setInspectorTab('overview');
        }}
      />

      {/* =====================================================================
          1. PLAY-STORE-GRADE CINEMATIC TITLE SCREEN
         ===================================================================== */}
      {gameState === 'title' && (
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-8 bg-gradient-to-r from-[#040711]/95 via-[#040711]/75 to-transparent">
          {/* Top Clean Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-slate-950 font-display font-bold text-sm shadow-md">
                3D
              </div>
              <div>
                <div className="font-display font-bold text-white tracking-wider text-sm">
                  ASTRAL ODYSSEY
                </div>
                <div className="text-[11px] font-mono text-sky-400">
                  {t.appSubtitle}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <PWAInstallButton />

              <button
                onClick={() => setShowUpdateModal(true)}
                className="flex items-center gap-1.5 rounded-lg bg-[#0b1329] hover:bg-[#132042] border border-sky-400/50 px-3 py-1.5 text-xs font-display font-bold text-sky-200 transition cursor-pointer whitespace-nowrap shrink-0"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{t.updateBtn}</span>
              </button>

              {/* 36-Language Selector */}
              <label className="flex items-center gap-1.5 bg-[#0b1329] border border-slate-700/90 rounded-lg px-2.5 py-1.5 text-xs text-slate-200">
                <span>🌐</span>
                <select
                  value={langCode}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option
                      key={l.code}
                      value={l.code}
                      className="bg-[#080f20] text-white"
                    >
                      {l.nativeName} ({l.name})
                    </option>
                  ))}
                </select>
              </label>

              <button
                onClick={handleToggleMute}
                className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#0b1329] border border-slate-700/80 rounded-lg hover:border-amber-400/60 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {isMuted ? t.audioMuted : t.audioActive}
              </button>
            </div>
          </div>

          {/* Center Hero Content + High-Res Universe Preview Card */}
          <div className="my-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center max-w-6xl">
            <div className="lg:col-span-7 pointer-events-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-sky-500/15 border border-sky-400/40 text-xs font-mono text-sky-300 mb-4">
                <span>SOLAR SYSTEM SCOPE 3D</span>
                <span>·</span>
                <span>NASA / ISRO / JWST ATLAS</span>
              </div>

              <h1
                className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.1] mb-4"
                style={{ textWrap: 'balance' }}
              >
                {t.heroTitle}
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mb-6">
                {t.heroDesc}
              </p>

              {/* 3 Crystal-Clear Mode Launch Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleStartExploreScope}
                  className="px-6 py-3.5 text-sm font-display font-bold tracking-wide text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  🔭 {isHindi ? '3D सौर मंडल और ब्रह्मांड देखें' : 'Explore 3D Solar Scope'}
                </button>

                <button
                  onClick={handleStartAutoPlay}
                  className="px-5 py-3.5 text-sm font-display font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-xl shadow-md transition-colors cursor-pointer whitespace-nowrap"
                >
                  🚀 {t.autoPlayBtn}
                </button>

                <button
                  onClick={handleStartFlightMode}
                  className="px-5 py-3.5 text-sm font-medium text-white bg-[#0d1730] hover:bg-[#162447] border border-slate-700 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                >
                  🎮 {t.startBtn}
                </button>
              </div>
            </div>

            {/* Right: 8K Commercial-Safe Universe Research Preview Card */}
            <div className="lg:col-span-5 pointer-events-auto">
              <div
                onClick={() => {
                  soundEngine.playWarp();
                  setGameState('playing');
                  setShowResearchHub(true);
                }}
                className="group relative rounded-2xl overflow-hidden border border-slate-700/80 bg-[#080f20]/90 shadow-2xl cursor-pointer transition hover:border-amber-400/70"
              >
                <div className="relative h-44 sm:h-52 overflow-hidden">
                  <img
                    src={HIGH_RES_SPACE_IMAGES.solarSystem}
                    alt="Solar System & Deep Space"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080f20] via-[#080f20]/30 to-transparent" />
                  <span className="absolute top-3 left-3 rounded-md bg-amber-400 px-2.5 py-1 text-[10px] font-display font-bold text-slate-950">
                    NEW · COMPLETE UNIVERSE RESEARCH
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <div className="font-display font-bold text-base text-white group-hover:text-amber-300 transition-colors">
                    {isHindi
                      ? '🌌 संपूर्ण ब्रह्मांड ज्ञानकोश: चंद्रयान-3, ब्लैक होल और JWST'
                      : '🌌 Complete Universe Atlas: Chandrayaan-3, Black Holes & JWST'}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isHindi
                      ? 'सूर्य से प्लूटो की आंतरिक परतें (Core Cutaway), सुपरमैसिव ब्लैक होल Sagittarius A*, जेम्स वेब नेबुला और 93 अरब प्रकाश-वर्ष का ब्रह्मांड।'
                      : 'Explore planetary core cutaways, Sagittarius A* Black Hole, JWST Pillars of Creation, and 93B light-years of cosmic research.'}
                  </p>
                  <div className="pt-1 text-xs font-mono text-sky-400 flex items-center justify-between">
                    <span>
                      {isHindi
                        ? '6 हाई-डेफिनिशन रिसर्च अध्याय →'
                        : '6 HD Research Chapters →'}
                    </span>
                    <span className="text-amber-300 font-bold">OPEN ATLAS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Clean Bottom Status Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800/80 text-xs font-mono text-slate-400">
            <div>
              {isHindi
                ? 'ग्रह पर टैप करें = 3D ज़ूम और आंतरिक कोर · Auto-Play = यान खुद उड़ेगा'
                : 'Tap any planet = 3D Orbital Zoom & Core Cutaway · Auto-Play = Autonomous AI Tour'}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400">
                ★ {t.graphicsQuality}: {graphicsQuality.toUpperCase()}
              </span>
              <span>·</span>
              <span className="text-amber-400">
                {t.scanned}: {telemetry.scannedPlanets.length}/10
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          2. ULTRA-CLEAN "SOLAR SYSTEM SCOPE" + FLIGHT HUD (85%+ CLEAR VIEWPORT)
         ===================================================================== */}
      {gameState !== 'title' && (
        <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-2.5 sm:p-4">
          {/* TOP BAR: 3 Clean Zones */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Top-Left: Compact Starship Status & Radar */}
            <div className="pointer-events-auto flex items-center gap-2.5 bg-[#070c1a]/92 border border-slate-800 rounded-xl px-3 py-2 shadow-lg">
              <div className="hidden sm:block">
                <TacticalRadarMinimap
                  blips={telemetry.radarBlips}
                  shipYaw={telemetry.shipYaw}
                />
              </div>

              <div className="flex flex-col gap-1.5 min-w-[185px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display font-bold text-xs text-white tracking-wider">
                    🚀 VAJRA-IX
                  </span>
                  <span className="font-mono text-[11px] text-sky-400 tabular-nums">
                    {telemetry.speed} km/s
                  </span>
                </div>

                {/* Compact Hull & Shield Bars */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono tabular-nums">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-0.5">
                      <span>{t.hull}</span>
                      <span className="text-emerald-400">{telemetry.hull}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 transition-all duration-150"
                        style={{ width: `${hullPct}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-0.5">
                      <span>{t.shield}</span>
                      <span className="text-sky-400">{telemetry.shield}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-sky-400 transition-all duration-150"
                        style={{ width: `${shieldPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-300 pt-0.5 border-t border-slate-800/80">
                  <span>
                    💎 <strong className="text-sky-400">{telemetry.crystals}</strong>
                  </span>
                  <span>
                    ⚙️ <strong className="text-amber-400">{telemetry.titanium}</strong>
                  </span>
                  <span>
                    ★ <strong className="text-white">{telemetry.score}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Top-Center: Clean 4-Button Mode Bar (Solar Scope / Auto-Tour / Universe Atlas / Command Hangar) */}
            <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 bg-[#070c1a]/92 border border-slate-800 rounded-xl p-1.5 shadow-lg">
              <button
                onClick={() => {
                  if (focusPlanetId) {
                    setFocusPlanetId(null);
                  } else {
                    setFocusPlanetId(telemetry.nearestPlanet.id);
                    setInspectorTab('overview');
                  }
                }}
                className={`px-3 py-1.5 text-xs font-display font-bold rounded-lg transition cursor-pointer whitespace-nowrap ${
                  focusPlanetId
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                🔭 {isHindi ? 'ग्रह ज़ूम (Scope)' : 'Planet Scope'}
              </button>

              <button
                onClick={() => {
                  setFocusPlanetId(null);
                  canvasRef.current?.toggleAutoPilot();
                }}
                className={`px-3 py-1.5 text-xs font-display font-bold rounded-lg transition cursor-pointer whitespace-nowrap ${
                  telemetry.autoPilotActive
                    ? 'bg-emerald-400 text-slate-950 shadow-sm'
                    : 'text-sky-300 hover:bg-slate-800'
                }`}
              >
                🚀 {telemetry.autoPilotActive ? t.autoPilotOn : t.autoPilotOff}
              </button>

              <button
                onClick={() => setShowResearchHub(true)}
                className="px-3 py-1.5 text-xs font-display font-bold rounded-lg bg-sky-500/20 border border-sky-400/50 text-sky-200 hover:bg-sky-500/30 transition cursor-pointer whitespace-nowrap"
              >
                🌌 {isHindi ? 'ब्रह्मांड रिसर्च' : 'Universe Atlas'}
              </button>

              <button
                onClick={() => setShowCommandModal(true)}
                className="px-3 py-1.5 text-xs font-display font-bold rounded-lg bg-[#101c38] border border-slate-700 text-amber-300 hover:border-amber-400 transition cursor-pointer whitespace-nowrap"
              >
                🛠️ {isHindi ? 'बेस और अपग्रेड' : 'Base & Hangar'}
              </button>
            </div>

            {/* Top-Right: Camera View, Language & Pause */}
            <div className="pointer-events-auto flex items-center gap-1.5 bg-[#070c1a]/92 border border-slate-800 rounded-xl px-3 py-2 shadow-lg text-xs">
              <button
                onClick={() => {
                  setFocusPlanetId(null);
                  setCameraMode((prev) =>
                    prev === 'chase'
                      ? 'overview'
                      : prev === 'overview'
                        ? 'cockpit'
                        : 'chase'
                  );
                }}
                className="px-2.5 py-1 rounded-md bg-[#0e1933] border border-slate-700 text-sky-300 hover:text-white font-mono cursor-pointer whitespace-nowrap"
                title="Switch Camera View (V)"
              >
                🎥 {cameraMode === 'overview' ? 'Solar Map' : cameraMode === 'cockpit' ? 'Cockpit' : '3D Ship'}
              </button>

              <select
                value={langCode}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-[#0e1933] text-amber-300 border border-slate-700 rounded-md px-2 py-1 text-xs focus:outline-none cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option
                    key={l.code}
                    value={l.code}
                    className="bg-[#080f20] text-white"
                  >
                    {l.nativeName}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setGameState('paused')}
                className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 hover:text-white cursor-pointer"
              >
                ⏸
              </button>
            </div>
          </div>

          {/* Dynamic Center Notification Toast */}
          {telemetry.activeAlert && (
            <div className="pointer-events-none mx-auto bg-[#0b1329]/95 border border-amber-400/60 text-amber-200 px-4 py-1.5 rounded-lg text-xs font-mono tracking-wide shadow-md max-w-md text-center">
              {telemetry.activeAlert}
            </div>
          )}

          {/* =================================================================
              SOLAR SYSTEM SCOPE SIDE INSPECTOR DRAWER (WHEN A PLANET IS SELECTED)
             ================================================================= */}
          {focusedPlanetData && (
            <div className="pointer-events-auto my-auto ml-auto w-full max-w-md bg-[#070d1e]/95 border border-slate-700/90 rounded-2xl p-4 sm:p-5 shadow-2xl text-white max-h-[72vh] flex flex-col">
              {/* Drawer Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="text-[11px] font-mono text-amber-400 uppercase">
                    {focusedPlanetData.type} · {focusedPlanetData.subtitle}
                  </div>
                  <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2 mt-0.5">
                    <span>{getLocalizedPlanetName(focusedPlanetData)}</span>
                    <span className="text-sm font-normal text-sky-400">
                      ({focusedPlanetData.name})
                    </span>
                  </h2>
                </div>

                <button
                  onClick={() => setFocusPlanetId(null)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 cursor-pointer shrink-0"
                >
                  ✕ {isHindi ? 'फ्री फ्लाइट' : 'Free Flight'}
                </button>
              </div>

              {/* Inspector Sub-Tabs: Overview / Internal Core Cutaway / Probes */}
              <div className="grid grid-cols-3 gap-1 bg-[#0c162c] p-1 rounded-xl my-3 text-xs font-display font-bold">
                <button
                  onClick={() => setInspectorTab('overview')}
                  className={`py-1.5 rounded-lg cursor-pointer transition ${
                    inspectorTab === 'overview'
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  🪐 {isHindi ? 'परिचय' : 'Overview'}
                </button>
                <button
                  onClick={() => setInspectorTab('core')}
                  className={`py-1.5 rounded-lg cursor-pointer transition ${
                    inspectorTab === 'core'
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  🔥 {isHindi ? 'आंतरिक परतें' : 'Core Layers'}
                </button>
                <button
                  onClick={() => setInspectorTab('probes')}
                  className={`py-1.5 rounded-lg cursor-pointer transition ${
                    inspectorTab === 'probes'
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  🛰️ {isHindi ? 'मिशन व बेस' : 'Missions'}
                </button>
              </div>

              {/* Tab Content */}
              <div className="overflow-y-auto pr-1 space-y-3 text-xs">
                {inspectorTab === 'overview' && (
                  <>
                    <p className="text-slate-200 leading-relaxed bg-[#0c162e] border border-slate-800 rounded-xl p-3">
                      {isHindi
                        ? focusedPlanetData.descriptionHi
                        : focusedPlanetData.descriptionEn}
                    </p>

                    <div className="grid grid-cols-2 gap-2 font-mono tabular-nums">
                      <div className="bg-[#0b1326] border border-slate-800 rounded-lg p-2.5">
                        <div className="text-[10px] text-slate-400">
                          {t.distanceFromSun}
                        </div>
                        <div className="text-white font-semibold mt-0.5">
                          {focusedPlanetData.distanceFromSunKm}
                        </div>
                      </div>
                      <div className="bg-[#0b1326] border border-slate-800 rounded-lg p-2.5">
                        <div className="text-[10px] text-slate-400">
                          {t.orbitalPeriod}
                        </div>
                        <div className="text-white font-semibold mt-0.5">
                          {focusedPlanetData.yearLength}
                        </div>
                      </div>
                      <div className="bg-[#0b1326] border border-slate-800 rounded-lg p-2.5">
                        <div className="text-[10px] text-slate-400">
                          {t.temperature}
                        </div>
                        <div className="text-amber-300 font-semibold mt-0.5">
                          {focusedPlanetData.temperature}
                        </div>
                      </div>
                      <div className="bg-[#0b1326] border border-slate-800 rounded-lg p-2.5">
                        <div className="text-[10px] text-slate-400">
                          {t.gravity} · {t.moons}
                        </div>
                        <div className="text-sky-300 font-semibold mt-0.5">
                          {focusedPlanetData.gravity} · {focusedPlanetData.moonsCount}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {inspectorTab === 'core' && (
                  <div className="space-y-2.5">
                    <div className="text-[11px] font-mono text-amber-300">
                      {isHindi
                        ? `${focusedPlanetData.hindiName} की आंतरिक संरचना (Internal Core Cutaway):`
                        : `Internal Structure of ${focusedPlanetData.name}:`}
                    </div>

                    {/* Visual Concentric Core Diagram */}
                    <div className="flex items-center justify-center py-2 bg-[#0b1326] border border-slate-800 rounded-xl">
                      <div
                        className="w-28 h-28 rounded-full flex items-center justify-center border-2 shadow-inner"
                        style={{
                          borderColor: focusedPlanetLayers[0]?.color || '#38bdf8',
                          background: 'radial-gradient(circle, #fef08a 0%, #f59e0b 35%, #ea580c 68%, #1e293b 100%)',
                        }}
                      >
                        <div className="w-16 h-16 rounded-full border border-white/50 flex items-center justify-center bg-amber-500/30">
                          <div className="w-7 h-7 rounded-full bg-yellow-200 shadow-lg" />
                        </div>
                      </div>
                    </div>

                    {focusedPlanetLayers.map((layer, idx) => (
                      <div
                        key={idx}
                        className="bg-[#0c162e] border border-slate-800 rounded-xl p-2.5 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block"
                              style={{ backgroundColor: layer.color }}
                            />
                            {isHindi ? layer.nameHi : layer.nameEn}
                          </span>
                          <span className="font-mono text-[10px] text-amber-300">
                            {layer.temp}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300">
                          {isHindi ? layer.compositionHi : layer.compositionEn}
                        </div>
                        <div className="text-[10px] font-mono text-sky-400">
                          Depth / Span: {layer.depthKm}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {inspectorTab === 'probes' && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-3 gap-1.5">
                      {BUILDABLE_STRUCTURES.map((st) => (
                        <button
                          key={st.id}
                          onClick={() =>
                            canvasRef.current?.buildStructureNearPlanet(st.id)
                          }
                          className="p-2 rounded-xl bg-[#0e1933] hover:bg-[#16274c] border border-slate-700 hover:border-amber-400 text-left transition cursor-pointer"
                        >
                          <div className="font-bold text-white text-[11px]">
                            + {st.hindiName}
                          </div>
                          <div className="text-[10px] font-mono text-amber-300 mt-0.5">
                            💎{st.costCrystals} ⚙️{st.costTitanium}
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="text-[11px] font-mono text-emerald-400 pt-1">
                      ISRO &amp; NASA SPACE PROBES:
                    </div>
                    {SPACE_PROBES.map((prb) => (
                      <div
                        key={prb.id}
                        className="p-2.5 rounded-xl bg-[#0b1326] border border-slate-800"
                      >
                        <div className="font-bold text-white">
                          {prb.name} ({prb.agency}) —{' '}
                          <span className="text-amber-300">{prb.hindiName}</span>
                        </div>
                        <div className="text-[11px] text-slate-300 mt-1">
                          {prb.summaryHi}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dual-Thumb Touch Controller (Only when in active free flight, hidden when inspecting a planet) */}
          {showTouchPad && gameState === 'playing' && !focusPlanetId && (
            <MobileTouchController
              touchInputRef={touchInputRef}
              onScanPlanet={() => {
                setFocusPlanetId(telemetry.nearestPlanet.id);
                setInspectorTab('overview');
              }}
              onQuickBuildTurret={() =>
                canvasRef.current?.buildStructureNearPlanet('turret')
              }
              onFireMissile={() => canvasRef.current?.fireHomingMissile()}
            />
          )}

          {/* =================================================================
              BOTTOM "SOLAR SYSTEM SCOPE" PLANET & BLACK HOLE RIBBON
             ================================================================= */}
          <div className="pointer-events-auto mx-auto w-full max-w-5xl">
            <div className="flex items-center gap-1.5 overflow-x-auto bg-[#070c1a]/92 border border-slate-800 rounded-2xl px-3 py-2 shadow-2xl">
              {SOLAR_SYSTEM_DATA.map((planet) => {
                const isSelected = focusPlanetId === planet.id;
                const isNearest =
                  !focusPlanetId && telemetry.nearestPlanet.id === planet.id;
                return (
                  <button
                    key={planet.id}
                    onClick={() => handleSelectPlanetInScope(planet)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition cursor-pointer whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-md'
                        : isNearest
                          ? 'bg-[#132247] text-white border-sky-400/70 font-semibold'
                          : 'bg-[#0b1428] text-slate-300 border-slate-800 hover:border-slate-600 hover:text-white'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: planet.color }}
                    />
                    <span>{getLocalizedPlanetName(planet)}</span>
                  </button>
                );
              })}

              {/* 3D Supermassive Black Hole Quick-Select Button */}
              <button
                onClick={() => {
                  canvasRef.current?.warpToBlackHole();
                  setFocusPlanetId('blackhole');
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition cursor-pointer whitespace-nowrap shrink-0 ${
                  focusPlanetId === 'blackhole'
                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                    : 'bg-[#170f2e] text-amber-300 border-purple-500/50 hover:border-amber-400'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-black border border-amber-400 shrink-0" />
                <span>🕳️ {isHindi ? 'ब्लैक होल (Sgr A*)' : 'Black Hole (Sgr A*)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          3. COMPLETE UNIVERSE & SPACE RESEARCH ATLAS MODAL (WITH 8K VISUALS)
         ===================================================================== */}
      {showResearchHub && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-6 bg-black/85 pointer-events-auto">
          <div className="w-full max-w-5xl bg-[#070d1d] border border-slate-700 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden text-white">
            {/* Modal Top Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-800 bg-[#0a1228]">
              <div>
                <div className="text-[11px] font-mono text-amber-400">
                  COMPLETE SPACE &amp; ASTROPHYSICS RESEARCH ENCYCLOPEDIA
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
                  {isHindi
                    ? '🌌 संपूर्ण ब्रह्मांड, इसरो-नासा और आधुनिक खगोल विज्ञान शोध'
                    : '🌌 Universe & Space Research Atlas (ISRO · NASA · JWST)'}
                </h2>
              </div>

              <button
                onClick={() => setShowResearchHub(false)}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-bold text-xs cursor-pointer"
              >
                ✕ {t.close}
              </button>
            </div>

            {/* Category Selector Strip */}
            <div className="flex items-center gap-2 overflow-x-auto px-5 py-3 border-b border-slate-800 bg-[#080f20]">
              {UNIVERSE_RESEARCH_ARTICLES.map((art) => (
                <button
                  key={art.id}
                  onClick={() => setSelectedArticle(art)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-display font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                    selectedArticle.id === art.id
                      ? 'bg-sky-400 text-slate-950 shadow-md'
                      : 'bg-[#0f1b36] text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  {isHindi ? art.titleHi.split(':')[0] : art.titleEn.split(':')[0]}
                </button>
              ))}
            </div>

            {/* Main Article Body */}
            <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* High-Res Commercial-Safe Astrophotography */}
                <div className="lg:col-span-6 space-y-3">
                  <div className="rounded-2xl overflow-hidden border border-slate-700 shadow-xl bg-black">
                    <img
                      src={selectedArticle.image}
                      alt={selectedArticle.titleEn}
                      className="w-full h-64 sm:h-72 object-cover"
                    />
                  </div>

                  {/* Key Scientific Telemetry Cards */}
                  <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                    {selectedArticle.keyMetrics.map((m, i) => (
                      <div
                        key={i}
                        className="bg-[#0c162d] border border-slate-800 rounded-xl p-2.5"
                      >
                        <div className="text-[10px] text-slate-400">
                          {isHindi ? m.labelHi : m.labelEn}
                        </div>
                        <div className="text-amber-300 font-bold mt-0.5 text-[11px]">
                          {m.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scientific Article Text & Discoveries */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="inline-block rounded-md bg-amber-400/15 border border-amber-400/50 px-2.5 py-1 text-[11px] font-mono text-amber-300">
                    {selectedArticle.badge}
                  </div>

                  <h3 className="font-display text-2xl font-bold text-white leading-snug">
                    {isHindi ? selectedArticle.titleHi : selectedArticle.titleEn}
                  </h3>

                  <p className="text-xs font-mono text-sky-300">
                    {isHindi
                      ? selectedArticle.subtitleHi
                      : selectedArticle.subtitleEn}
                  </p>

                  <p className="text-sm text-slate-200 leading-relaxed bg-[#0c162d] border border-slate-800 rounded-xl p-4">
                    {isHindi
                      ? selectedArticle.summaryHi
                      : selectedArticle.summaryEn}
                  </p>

                  <div className="space-y-2">
                    <div className="text-xs font-mono text-emerald-400 font-bold">
                      {isHindi
                        ? '🔬 प्रमुख वैज्ञानिक खोजें (Key Scientific Findings):'
                        : '🔬 Key Scientific Findings:'}
                    </div>
                    <ul className="space-y-2 text-xs text-slate-200 leading-relaxed">
                      {(isHindi
                        ? selectedArticle.discoveriesHi
                        : selectedArticle.discoveriesEn
                      ).map((d, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 bg-[#0a1326] border border-slate-800/80 rounded-xl p-3"
                        >
                          <span className="text-amber-400 font-bold">★</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Interactive 3D Action Button */}
                  <div className="pt-2 flex flex-wrap gap-3">
                    {selectedArticle.id === 'black-holes-event-horizon' && (
                      <button
                        onClick={() => {
                          setShowResearchHub(false);
                          canvasRef.current?.warpToBlackHole();
                          setFocusPlanetId('blackhole');
                        }}
                        className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-bold text-xs cursor-pointer"
                      >
                        🕳️{' '}
                        {isHindi
                          ? '3D ब्लैक होल (Sagittarius A*) पर उड़ान भरें'
                          : 'Fly to 3D Black Hole Now'}
                      </button>
                    )}

                    {selectedArticle.targetPlanetId && (
                      <button
                        onClick={() => {
                          setShowResearchHub(false);
                          setFocusPlanetId(selectedArticle.targetPlanetId!);
                          canvasRef.current?.warpToPlanet(
                            selectedArticle.targetPlanetId!
                          );
                        }}
                        className="px-5 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-display font-bold text-xs cursor-pointer"
                      >
                        🔭{' '}
                        {isHindi
                          ? '3D अंतरिक्ष में इसे करीब से देखें'
                          : 'Inspect in 3D Space'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          4. CLEAN COMMAND HANGAR MODAL (BASE BUILDING, UPGRADES, MISSIONS & SETTINGS)
         ===================================================================== */}
      {showCommandModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 pointer-events-auto">
          <div className="w-full max-w-3xl bg-[#080f20] border border-slate-700 rounded-2xl p-5 sm:p-6 shadow-2xl text-white max-h-[86vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="font-display text-xl font-bold text-white">
                🛠️ {isHindi ? 'स्पेस बेस, यान अपग्रेड और सेटिंग्स' : 'Space Command & Hangar'}
              </h2>
              <button
                onClick={() => setShowCommandModal(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs cursor-pointer"
              >
                ✕ {t.close}
              </button>
            </div>

            {/* Sub-navigation */}
            <div className="flex flex-wrap gap-1.5 my-3 bg-[#0c162d] p-1.5 rounded-xl">
              {(
                [
                  { id: 'build', label: `🏗️ ${t.tabBuild}` },
                  { id: 'hangar', label: `⚡ ${t.tabHangar}` },
                  {
                    id: 'missions',
                    label: `🎯 ${t.tabMissions} (${telemetry.completedMissions.length}/5)`,
                  },
                  { id: 'settings', label: `⚙️ ${t.tabSettings}` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCommandTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-display font-bold transition cursor-pointer ${
                    commandTab === tab.id
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto space-y-3 pr-1">
              {commandTab === 'build' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {BUILDABLE_STRUCTURES.map((st) => {
                    const canAfford =
                      telemetry.crystals >= st.costCrystals &&
                      telemetry.titanium >= st.costTitanium;
                    return (
                      <div
                        key={st.id}
                        className="bg-[#0c162e] border border-slate-800 rounded-xl p-4 flex flex-col justify-between gap-3"
                      >
                        <div>
                          <div className="font-display font-bold text-white text-sm">
                            {st.name}
                          </div>
                          <div className="text-xs text-amber-300">
                            {st.hindiName}
                          </div>
                          <p className="text-xs text-slate-300 mt-1.5">
                            {st.summary} — {st.benefit}
                          </p>
                        </div>

                        <div>
                          <div className="text-xs font-mono text-slate-400 mb-2">
                            💎 {st.costCrystals} · ⚙️ {st.costTitanium}
                          </div>
                          <button
                            onClick={() =>
                              canvasRef.current?.buildStructureNearPlanet(st.id)
                            }
                            className={`w-full py-2 rounded-lg text-xs font-display font-bold cursor-pointer ${
                              canAfford
                                ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {isHindi
                              ? `${getLocalizedPlanetName(telemetry.nearestPlanet)} पर बनाएँ`
                              : `Build at ${telemetry.nearestPlanet.name}`}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {commandTab === 'hangar' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {STARSHIP_UPGRADES.map((up) => {
                    const lvl = telemetry.upgrades[up.id];
                    const isMax = lvl >= up.maxLevel;
                    const costC = Math.round(
                      up.baseCostCrystals * Math.pow(1.45, lvl - 1)
                    );
                    const costT = Math.round(
                      up.baseCostTitanium * Math.pow(1.45, lvl - 1)
                    );
                    const canAfford =
                      !isMax &&
                      telemetry.crystals >= costC &&
                      telemetry.titanium >= costT;
                    return (
                      <div
                        key={up.id}
                        className="bg-[#0c162e] border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between gap-2"
                      >
                        <div>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-sm text-white">
                              {up.hindiName}
                            </span>
                            <span className="font-mono text-xs text-amber-400">
                              Mk.{lvl}/{up.maxLevel}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            {up.benefitPerLevel}
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            canvasRef.current?.upgradeShipSystem(up.id)
                          }
                          disabled={isMax}
                          className={`w-full py-2 rounded-lg text-xs font-display font-bold cursor-pointer ${
                            isMax
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : canAfford
                                ? 'bg-sky-400 text-slate-950 hover:bg-sky-300'
                                : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {isMax ? 'MAX LEVEL' : `Upgrade (💎${costC} ⚙️${costT})`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {commandTab === 'missions' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SPACE_MISSIONS.map((m) => {
                    const done = telemetry.completedMissions.includes(m.id);
                    return (
                      <div
                        key={m.id}
                        className={`p-3.5 rounded-xl border ${
                          done
                            ? 'bg-emerald-950/30 border-emerald-500/50'
                            : 'bg-[#0c162e] border-slate-800'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm text-white">
                            {m.titleHi} ({m.titleEn})
                          </span>
                          <span className="text-xs font-mono text-amber-300">
                            {done ? '✓ DONE' : `+${m.rewardCrystals}💎`}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">
                          {m.targetText}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {commandTab === 'settings' && (
                <div className="space-y-4 bg-[#0c162e] border border-slate-800 rounded-xl p-4 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-slate-300 font-bold">
                      {t.graphicsQuality}:
                    </span>
                    <div className="flex gap-1.5">
                      {(
                        ['ultra', 'high', 'auto', 'saver'] as GraphicsQualityMode[]
                      ).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setGraphicsQuality(mode)}
                          className={`px-3 py-1.5 rounded-lg font-mono uppercase cursor-pointer ${
                            graphicsQuality === mode
                              ? 'bg-amber-400 text-slate-950 font-bold'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-slate-300 font-bold">
                      {t.orbitSpeed}:
                    </span>
                    <div className="flex gap-1.5">
                      {[0.25, 1, 2.5].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => setTimeScale(spd)}
                          className={`px-3 py-1.5 rounded-lg font-mono cursor-pointer ${
                            timeScale === spd
                              ? 'bg-sky-400 text-slate-950 font-bold'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {spd}×
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-slate-300 font-bold">
                      {t.touchPad}:
                    </span>
                    <button
                      onClick={() => setShowTouchPad((prev) => !prev)}
                      className="px-4 py-1.5 rounded-lg bg-slate-800 text-sky-300 font-mono cursor-pointer"
                    >
                      {showTouchPad ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          5. PAUSE / VICTORY / GAME OVER MODAL
         ===================================================================== */}
      {(gameState === 'paused' ||
        gameState === 'victory' ||
        gameState === 'gameover') && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/80 pointer-events-auto">
          <div className="w-full max-w-md bg-[#080f20] border border-slate-700 rounded-2xl p-6 text-center shadow-2xl">
            <h2 className="font-display text-3xl font-bold text-white mb-2">
              {gameState === 'paused'
                ? t.pause
                : gameState === 'victory'
                  ? 'Solar System Secured!'
                  : 'Vajra-IX Destroyed'}
            </h2>

            <div className="bg-[#0c162e] border border-slate-800 rounded-xl p-3.5 my-5 grid grid-cols-2 gap-2.5 text-xs font-mono tabular-nums text-left">
              <div>
                <span className="text-slate-400">{t.score}:</span>{' '}
                <strong className="text-white">{telemetry.score}</strong>
              </div>
              <div>
                <span className="text-slate-400">{t.scanned}:</span>{' '}
                <strong className="text-sky-400">
                  {telemetry.scannedPlanets.length}/10
                </strong>
              </div>
              <div>
                <span className="text-slate-400">{t.crystals}:</span>{' '}
                <strong className="text-amber-400">{telemetry.crystals}</strong>
              </div>
              <div>
                <span className="text-slate-400">{t.tabMissions}:</span>{' '}
                <strong className="text-emerald-400">
                  {telemetry.completedMissions.length}/5
                </strong>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {gameState === 'paused' || gameState === 'victory' ? (
                <button
                  onClick={() => setGameState('playing')}
                  className="w-full sm:w-auto px-6 py-2.5 text-xs font-display font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer"
                >
                  {t.resume}
                </button>
              ) : null}

              <button
                onClick={handleRestartGame}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer"
              >
                {t.restart}
              </button>

              <button
                onClick={() => setGameState('title')}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
              >
                {t.titleScreen}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Automated APK Download & Updates Modal */}
      <UpdateAndApkModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        langCode={langCode}
      />
    </div>
  );
}
