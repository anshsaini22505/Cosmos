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
  SUPPORTED_LANGUAGES,
  detectInitialLanguage,
  getUIStrings,
} from './data/i18n';
import { soundEngine } from './audio/soundEngine';
import { PWAInstallButton, OfflineIndicator } from './pwa/PWAInstallButton';
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
  shipYaw: -0.4,
  autoPilotActive: false,
  autoPilotTargetName: null,
  nearestPlanet: SOLAR_SYSTEM_DATA[3],
  nearestDistance: 12,
  scannedPlanets: ['earth'],
  discoveredProbes: [],
  builtOutposts: [
    {
      id: 'init-earth-station',
      planetId: 'earth',
      planetName: 'Earth',
      type: 'station',
    },
  ],
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
    useState<GraphicsQualityMode>('auto');
  const [timeScale, setTimeScale] = useState<number>(1);
  const [telemetry, setTelemetry] = useState<HudTelemetry>(INITIAL_TELEMETRY);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [dockTab, setDockTab] = useState<
    'warp' | 'build' | 'hangar' | 'missions' | 'flight'
  >('warp');
  const [codexPlanet, setCodexPlanet] = useState<PlanetData | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);

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

  const handleLanguageChange = (newCode: string) => {
    setLangCode(newCode);
    try {
      localStorage.setItem('astral_odyssey_lang', newCode);
    } catch {
      // Ignore
    }
  };

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      soundEngine.setMuted(next);
      return next;
    });
  }, []);

  const handleStartGame = useCallback(() => {
    soundEngine.playWarp();
    setGameState('playing');
  }, []);

  const handleStartAutoPlay = useCallback(() => {
    soundEngine.playWarp();
    setGameState('playing');
    setTimeout(() => {
      canvasRef.current?.toggleAutoPilot();
    }, 80);
  }, []);

  const handleRestartGame = useCallback(() => {
    canvasRef.current?.resetMission();
    soundEngine.playWarp();
    setGameState('playing');
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'title') {
        if (e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          handleStartGame();
        }
        return;
      }

      if (e.code === 'Escape') {
        e.preventDefault();
        if (codexPlanet) {
          setCodexPlanet(null);
        } else if (gameState === 'playing') {
          setGameState('paused');
        } else if (gameState === 'paused') {
          setGameState('playing');
        }
      } else if (e.code === 'KeyH' && gameState === 'playing') {
        setDockCollapsed((prev) => !prev);
      } else if (e.code === 'KeyF' && gameState === 'playing') {
        canvasRef.current?.scanNearestPlanet();
      } else if (e.code === 'KeyG' && gameState === 'playing') {
        canvasRef.current?.toggleAutoPilot();
      } else if (e.code === 'KeyC' && gameState === 'playing') {
        setCodexPlanet((prev) =>
          prev ? null : telemetry.nearestPlanet || SOLAR_SYSTEM_DATA[3]
        );
      } else if (e.code === 'KeyU' && gameState === 'playing') {
        setDockCollapsed(false);
        setDockTab('hangar');
      } else if (e.code === 'KeyV' && gameState === 'playing') {
        setCameraMode((prev) =>
          prev === 'chase'
            ? 'cockpit'
            : prev === 'cockpit'
              ? 'overview'
              : 'chase'
        );
      } else if (e.code === 'KeyM') {
        handleToggleMute();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    gameState,
    codexPlanet,
    telemetry.nearestPlanet,
    handleStartGame,
    handleToggleMute,
  ]);

  const outpostsNearCurrentPlanet = telemetry.builtOutposts.filter(
    (o) => o.planetId === telemetry.nearestPlanet.id
  );

  const hullPct = Math.min(
    100,
    Math.round((telemetry.hull / Math.max(1, telemetry.maxHull)) * 100)
  );
  const shieldPct = Math.min(
    100,
    Math.round((telemetry.shield / Math.max(1, telemetry.maxShield)) * 100)
  );

  const getLocalizedPlanetName = (p: PlanetData) =>
    t.planetNames[p.id] || p.name;

  return (
    <div
      dir={currentLangObj.dir || 'ltr'}
      className="relative w-screen h-screen overflow-hidden bg-[#040711] select-none"
    >
      <OfflineIndicator />

      {/* Isolated 60fps Three.js WebGL Solar System Canvas */}
      <SpaceCanvas
        ref={canvasRef}
        gameState={gameState}
        cameraMode={cameraMode}
        graphicsQuality={graphicsQuality}
        timeScale={timeScale}
        touchInputRef={touchInputRef}
        onTelemetryUpdate={setTelemetry}
        onGameEnd={(res) => setGameState(res)}
        onSelectPlanetCodex={(planet) => setCodexPlanet(planet)}
      />

      {/* =====================================================================
          1. TITLE SCREEN OVERLAY (Clean, Atmospheric & Multi-Language)
         ===================================================================== */}
      {gameState === 'title' && (
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 sm:p-10 md:p-12 pointer-events-none bg-gradient-to-t from-[#040711]/92 via-[#040711]/25 to-[#040711]/80">
          {/* Top Bar: Brand + 36-Language Selector + Audio */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 pointer-events-auto">
            <div className="flex items-center gap-2.5">
              <span className="font-display font-bold tracking-wider text-amber-400">
                ASTRAL ODYSSEY
              </span>
              <span aria-hidden="true">·</span>
              <span>{t.appSubtitle}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <PWAInstallButton />

              {/* 36-Language Selector */}
              <label className="flex items-center gap-1.5 bg-[#0b1329] border border-slate-700/90 rounded-lg px-2.5 py-1.5 text-xs text-slate-200">
                <svg
                  className="w-3.5 h-3.5 text-amber-400 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  />
                </svg>
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

          {/* Center-Left Hero Lockup */}
          <div className="my-auto max-w-2xl pointer-events-auto">
            <div className="mb-3 flex items-center gap-3">
              <svg
                className="w-12 h-12 text-amber-400 shrink-0"
                viewBox="0 0 64 64"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.6"
                />
                <ellipse
                  cx="32"
                  cy="32"
                  rx="26"
                  ry="10"
                  transform="rotate(-22 32 32)"
                  stroke="#38bdf8"
                  strokeWidth="1.75"
                />
                <circle cx="32" cy="32" r="9" fill="currentColor" />
                <circle cx="51" cy="24" r="3" fill="#38bdf8" />
                <circle cx="15" cy="40" r="2.5" fill="#f87171" />
              </svg>
              <div className="text-xs font-mono text-sky-400 tracking-widest">
                SOLAR SYSTEM · 10 CELESTIAL WORLDS · SELF-PLAYING AI PILOT
              </div>
            </div>

            <h1
              className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.08] mb-4"
              style={{ textWrap: 'balance' }}
            >
              {t.heroTitle}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mb-6">
              {t.heroDesc}
            </p>

            {/* Primary CTA Row */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleStartGame}
                className="px-7 py-3.5 text-sm font-display font-bold tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-lg transition-transform active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
              >
                {t.startBtn}
              </button>

              <button
                onClick={handleStartAutoPlay}
                className="px-5 py-3.5 text-sm font-display font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {t.autoPlayBtn}
              </button>

              <button
                onClick={() => {
                  handleStartGame();
                  setCodexPlanet(SOLAR_SYSTEM_DATA[0]);
                }}
                className="px-5 py-3.5 text-sm font-medium text-slate-100 bg-[#0d1730] hover:bg-[#162447] border border-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {t.encyclopediaBtn}
              </button>
            </div>
          </div>

          {/* Single Flat Control-Hint Line at Bottom */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800/80 text-xs font-mono text-slate-400">
            <div>
              WASD / Touch Fly · Space Laser · R Missile · Shift Boost · G
              Auto-Play · Esc {t.pause}
            </div>
            <div className="text-amber-400/90">
              {t.score}: {telemetry.score} · {t.scanned}:{' '}
              {telemetry.scannedPlanets.length}/10
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          2. ACTIVE GAMEPLAY HUD
         ===================================================================== */}
      {gameState !== 'title' && (
        <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-3 sm:p-5">
          {/* TOP PERIMETER CLUSTER */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            {/* Top-Left: Starship Integrity + Tactical Radar Minimap */}
            <div className="pointer-events-auto flex items-center gap-3 bg-[#070c1a]/92 border border-slate-800 rounded-xl p-3 shadow-lg">
              <TacticalRadarMinimap
                blips={telemetry.radarBlips}
                shipYaw={telemetry.shipYaw}
              />

              <div className="flex flex-col gap-2 min-w-[245px] sm:min-w-[275px]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-amber-400 shrink-0"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2L4 20l8-4 8 4L12 2z" />
                    </svg>
                    <span className="font-display font-bold text-sm text-white tracking-wide">
                      VAJRA-IX
                    </span>
                  </div>
                  <span className="font-mono text-xs text-sky-400 tabular-nums">
                    {telemetry.speed} km/s
                  </span>
                </div>

                {/* Hull, Shield, Boost & Homing Torpedo Bars */}
                <div className="grid grid-cols-4 gap-2 text-[10px] font-mono tabular-nums">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-0.5">
                      <span className="truncate">{t.hull}</span>
                      <span className="text-emerald-400">{telemetry.hull}</span>
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
                      <span className="truncate">{t.shield}</span>
                      <span className="text-sky-400">{telemetry.shield}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-sky-400 transition-all duration-150"
                        style={{ width: `${shieldPct}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-0.5">
                      <span className="truncate">{t.boost}</span>
                      <span className="text-amber-400">
                        {telemetry.boostEnergy}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-amber-400 transition-all duration-150"
                        style={{ width: `${telemetry.boostEnergy}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-0.5">
                      <span className="truncate">{t.torpedo}</span>
                      <span className="text-purple-300">
                        {telemetry.missileReadyPct}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-purple-400 transition-all duration-150"
                        style={{ width: `${telemetry.missileReadyPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Unboxed Metadata Line for Resources & Score */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px] font-mono tabular-nums text-slate-300">
                  <span>
                    {t.crystals}:{' '}
                    <strong className="text-sky-400">{telemetry.crystals}</strong>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {t.titanium}:{' '}
                    <strong className="text-amber-400">
                      {telemetry.titanium}
                    </strong>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {t.score}:{' '}
                    <strong className="text-white">{telemetry.score}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Center Dynamic Alert Banner */}
            {telemetry.activeAlert && (
              <div className="pointer-events-none bg-[#0b1329]/95 border border-amber-400/60 text-amber-200 px-4 py-2 rounded-lg text-xs font-mono tracking-wide shadow-md max-w-md text-center">
                {telemetry.activeAlert}
              </div>
            )}

            {/* Top-Right: Nearest World, Self-Playing Auto-Pilot Toggle & Language */}
            <div className="pointer-events-auto bg-[#070c1a]/92 border border-slate-800 rounded-xl px-4 py-3 flex flex-col gap-2 min-w-[290px] shadow-lg">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {t.nearestWorld.toUpperCase()} · {telemetry.nearestDistance}u
                  </div>
                  <div className="font-display font-bold text-base text-white flex items-center gap-2">
                    <span>{getLocalizedPlanetName(telemetry.nearestPlanet)}</span>
                    <span className="text-xs font-normal text-amber-400">
                      {telemetry.nearestPlanet.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => canvasRef.current?.toggleAutoPilot()}
                    className={`px-3 py-1.5 text-xs font-display font-bold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      telemetry.autoPilotActive
                        ? 'bg-emerald-400 text-slate-950 shadow-sm'
                        : 'bg-[#102042] text-sky-300 border border-sky-400/50 hover:bg-[#172d5c]'
                    }`}
                  >
                    {telemetry.autoPilotActive ? t.autoPilotOn : t.autoPilotOff}
                  </button>
                  <button
                    onClick={() => setCodexPlanet(telemetry.nearestPlanet)}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {t.inspectBtn}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 text-xs text-slate-400 font-mono tabular-nums pt-1 border-t border-slate-800/80">
                <span>
                  {t.scanned}: {telemetry.scannedPlanets.length}/10
                </span>
                <span aria-hidden="true">·</span>
                <select
                  value={langCode}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-[#0d1730] text-amber-300 border border-slate-700 rounded px-1.5 py-0.5 text-[11px] focus:outline-none cursor-pointer"
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
                <span aria-hidden="true">·</span>
                <button
                  onClick={() => setGameState('paused')}
                  className="text-slate-300 hover:text-white underline cursor-pointer"
                >
                  {t.pause}
                </button>
              </div>
            </div>
          </div>

          {/* =================================================================
              DUAL-THUMB TOUCH CONTROLLER
             ================================================================= */}
          {showTouchPad && gameState === 'playing' && (
            <MobileTouchController
              touchInputRef={touchInputRef}
              onScanPlanet={() => canvasRef.current?.scanNearestPlanet()}
              onQuickBuildTurret={() =>
                canvasRef.current?.buildStructureNearPlanet('turret')
              }
              onFireMissile={() => canvasRef.current?.fireHomingMissile()}
            />
          )}

          {/* =================================================================
              UNIFIED COLLAPSIBLE BOTTOM CONTROL DOCK
             ================================================================= */}
          <div
            className="pointer-events-auto mx-auto w-full max-w-[960px] flex flex-col items-center transition-transform duration-200"
            style={{
              transform: dockCollapsed
                ? 'translateY(calc(100% - 32px))'
                : 'translateY(0)',
            }}
          >
            {/* Collapse / Expand & Quick Modals Strip */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mb-1.5">
              <button
                onClick={() => setDockCollapsed((prev) => !prev)}
                className="px-3 py-1 text-xs font-mono text-slate-300 hover:text-white bg-[#070c1a]/95 border border-slate-800 rounded-t-lg cursor-pointer whitespace-nowrap shrink-0"
              >
                {dockCollapsed ? `▴ ${t.showControls}` : `▾ ${t.hideControls}`}
              </button>
              <button
                onClick={() =>
                  setCodexPlanet((prev) =>
                    prev ? null : telemetry.nearestPlanet
                  )
                }
                className="px-3 py-1 text-xs font-mono text-amber-300 hover:text-amber-200 bg-[#070c1a]/95 border border-slate-800 rounded-t-lg cursor-pointer whitespace-nowrap shrink-0"
              >
                {t.encyclopediaBtn} (C)
              </button>
              <button
                onClick={() => setShowTouchPad((prev) => !prev)}
                className={`px-3 py-1 text-xs font-mono rounded-t-lg border cursor-pointer whitespace-nowrap shrink-0 ${
                  showTouchPad
                    ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                    : 'bg-[#070c1a]/95 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {t.touchPad}: {showTouchPad ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Main Bottom Dock Surface */}
            <div className="w-full bg-[#070c1a]/95 border border-slate-800 rounded-xl p-3 shadow-2xl">
              {/* Dock Mode Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-800/90">
                <div className="flex flex-wrap items-center gap-1 p-1 bg-[#0d162c] rounded-lg">
                  <button
                    onClick={() => setDockTab('warp')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      dockTab === 'warp'
                        ? 'bg-amber-400 text-slate-950 font-semibold'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {t.tabWarp}
                  </button>
                  <button
                    onClick={() => setDockTab('build')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      dockTab === 'build'
                        ? 'bg-amber-400 text-slate-950 font-semibold'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {t.tabBuild} ({getLocalizedPlanetName(telemetry.nearestPlanet)})
                  </button>
                  <button
                    onClick={() => setDockTab('hangar')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      dockTab === 'hangar'
                        ? 'bg-amber-400 text-slate-950 font-semibold'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {t.tabHangar}
                  </button>
                  <button
                    onClick={() => setDockTab('missions')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      dockTab === 'missions'
                        ? 'bg-amber-400 text-slate-950 font-semibold'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {t.tabMissions} ({telemetry.completedMissions.length}/5)
                  </button>
                  <button
                    onClick={() => setDockTab('flight')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      dockTab === 'flight'
                        ? 'bg-amber-400 text-slate-950 font-semibold'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {t.tabSettings}
                  </button>
                </div>

                <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-400 tabular-nums">
                  <button
                    onClick={() => canvasRef.current?.toggleAutoPilot()}
                    className={`px-2.5 py-1 rounded border cursor-pointer ${
                      telemetry.autoPilotActive
                        ? 'bg-emerald-400/20 border-emerald-400 text-emerald-300'
                        : 'bg-sky-500/15 border-sky-400/40 text-sky-300'
                    }`}
                  >
                    {telemetry.autoPilotActive ? t.autoPilotOn : t.autoPilotOff}
                  </button>
                  <button
                    onClick={() => canvasRef.current?.fireHomingMissile()}
                    className="px-2.5 py-1 rounded bg-purple-500/20 border border-purple-400/50 text-purple-300 hover:bg-purple-500/30 cursor-pointer"
                  >
                    {t.torpedo} (R)
                  </button>
                </div>
              </div>

              {/* TAB 1: SOLAR SYSTEM WARP NAVIGATOR */}
              {dockTab === 'warp' && (
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                  {SOLAR_SYSTEM_DATA.map((planet) => {
                    const isNearest = telemetry.nearestPlanet.id === planet.id;
                    const isScanned = telemetry.scannedPlanets.includes(
                      planet.id
                    );
                    return (
                      <button
                        key={planet.id}
                        onClick={() => canvasRef.current?.warpToPlanet(planet.id)}
                        className={`px-2 py-1.5 rounded-lg border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                          isNearest
                            ? 'bg-[#132247] border-amber-400/80 text-white'
                            : 'bg-[#0b1326] border-slate-800/90 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: planet.color }}
                          />
                          <span className="text-[10px] font-mono text-emerald-400">
                            {isScanned ? '✓' : ''}
                          </span>
                        </div>
                        <div className="mt-1">
                          <div className="text-[11px] font-semibold truncate">
                            {getLocalizedPlanetName(planet)}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {planet.name}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* TAB 2: ORBITAL BASE BUILDING AROUND NEAREST PLANET */}
              {dockTab === 'build' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {BUILDABLE_STRUCTURES.map((spec, idx) => {
                    const canAfford =
                      telemetry.crystals >= spec.costCrystals &&
                      telemetry.titanium >= spec.costTitanium;
                    const countHere = outpostsNearCurrentPlanet.filter(
                      (o) => o.type === spec.id
                    ).length;

                    return (
                      <button
                        key={spec.id}
                        onClick={() =>
                          canvasRef.current?.buildStructureNearPlanet(spec.id)
                        }
                        className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                          canAfford
                            ? 'bg-[#0d1832] border-slate-700 hover:border-amber-400'
                            : 'bg-[#091021] border-slate-800/80 opacity-65'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-display font-bold text-white">
                            [{idx + 1}] {spec.name} ({spec.hindiName})
                          </span>
                          <span className="text-[11px] font-mono text-amber-400 tabular-nums">
                            {countHere}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300 mt-1">
                          {spec.benefit}
                        </div>
                        <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-slate-800 text-[11px] font-mono tabular-nums">
                          <span className="text-sky-400">
                            {spec.costCrystals} {t.crystals}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="text-amber-400">
                            {spec.costTitanium} {t.titanium}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* TAB 3: STARSHIP UPGRADE HANGAR */}
              {dockTab === 'hangar' && (
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {STARSHIP_UPGRADES.map((u) => {
                    const lvl = telemetry.upgrades[u.id];
                    const isMax = lvl >= u.maxLevel;
                    const costC = Math.round(
                      u.baseCostCrystals * Math.pow(1.45, lvl - 1)
                    );
                    const costT = Math.round(
                      u.baseCostTitanium * Math.pow(1.45, lvl - 1)
                    );
                    const canAfford =
                      !isMax &&
                      telemetry.crystals >= costC &&
                      telemetry.titanium >= costT;

                    return (
                      <button
                        key={u.id}
                        disabled={isMax}
                        onClick={() =>
                          canvasRef.current?.upgradeShipSystem(u.id)
                        }
                        className={`p-2.5 rounded-lg border text-left transition-colors flex flex-col justify-between ${
                          isMax
                            ? 'bg-[#0b192e] border-emerald-500/40 cursor-default'
                            : canAfford
                              ? 'bg-[#0d1832] border-slate-700 hover:border-amber-400 cursor-pointer'
                              : 'bg-[#091021] border-slate-800/80 opacity-65 cursor-pointer'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-display font-bold text-white truncate">
                              {u.name}
                            </span>
                            <span className="text-[10px] font-mono text-amber-400 shrink-0">
                              Mk.{lvl}/{u.maxLevel}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {u.hindiName}
                          </div>
                          <div className="text-[10px] text-slate-300 mt-1 line-clamp-2">
                            {u.benefitPerLevel}
                          </div>
                        </div>

                        <div className="mt-2 pt-1 border-t border-slate-800 text-[10px] font-mono tabular-nums">
                          {isMax ? (
                            <span className="text-emerald-400 font-semibold">
                              MAX
                            </span>
                          ) : (
                            <span>
                              <span className="text-sky-400">{costC} C</span> ·{' '}
                              <span className="text-amber-400">{costT} T</span>
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* TAB 4: SPACE COMMAND CAMPAIGN MISSIONS */}
              {dockTab === 'missions' && (
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {SPACE_MISSIONS.map((m) => {
                    const done = telemetry.completedMissions.includes(m.id);
                    return (
                      <div
                        key={m.id}
                        className={`p-2.5 rounded-lg border flex flex-col justify-between ${
                          done
                            ? 'bg-[#0a1d24] border-emerald-500/50'
                            : 'bg-[#0b1326] border-slate-800'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-semibold text-white truncate">
                              {m.titleEn}
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400 shrink-0">
                              {done ? '✓' : ''}
                            </span>
                          </div>
                          <div className="text-[10px] text-amber-300/90 mt-0.5 truncate">
                            {m.titleHi}
                          </div>
                          <div className="text-[10px] text-slate-300 mt-1">
                            {m.targetText}
                          </div>
                        </div>
                        <div className="mt-2 pt-1 border-t border-slate-800/80 text-[10px] font-mono text-sky-400">
                          +{m.rewardCrystals} {t.crystals} · +{m.rewardScore}{' '}
                          {t.score}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 5: CAMERA, ORBIT SPEED, LANGUAGE & GRAPHICS */}
              {dockTab === 'flight' && (
                <div className="flex flex-wrap items-center justify-between gap-3 py-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 mr-1">
                      {t.camera}:
                    </span>
                    {(['chase', 'cockpit', 'overview'] as CameraViewMode[]).map(
                      (mode) => (
                        <button
                          key={mode}
                          onClick={() => setCameraMode(mode)}
                          className={`px-2.5 py-1.5 text-xs font-medium rounded-md capitalize cursor-pointer whitespace-nowrap shrink-0 ${
                            cameraMode === mode
                              ? 'bg-sky-400 text-slate-950 font-semibold'
                              : 'bg-[#0e1830] text-slate-300 hover:text-white border border-slate-800'
                          }`}
                        >
                          {mode === 'overview' ? 'Solar Map' : mode}
                        </button>
                      )
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 mr-1">
                      {t.orbitSpeed}:
                    </span>
                    {[0.25, 1, 2.5].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => setTimeScale(spd)}
                        className={`px-2.5 py-1.5 text-xs font-mono rounded-md cursor-pointer whitespace-nowrap shrink-0 ${
                          timeScale === spd
                            ? 'bg-amber-400 text-slate-950 font-semibold'
                            : 'bg-[#0e1830] text-slate-300 hover:text-white border border-slate-800'
                        }`}
                      >
                        {spd}×
                      </button>
                    ))}
                  </div>

                  {/* 36-Language Selector in Settings */}
                  <div className="flex items-center gap-1.5">
                    <select
                      value={langCode}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="bg-[#0e1830] text-white border border-slate-700 rounded-md px-2.5 py-1.5 text-xs cursor-pointer"
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

                    <button
                      onClick={handleToggleMute}
                      className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#0e1830] border border-slate-700 rounded-md hover:border-amber-400 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      {isMuted ? t.audioMuted : t.audioActive}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          3. INTERACTIVE SOLAR SYSTEM ENCYCLOPEDIA / CODEX MODAL
         ===================================================================== */}
      {codexPlanet && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/75 pointer-events-auto">
          <div className="w-full max-w-3xl bg-[#080f20] border border-slate-700 rounded-2xl p-6 shadow-2xl max-h-[88vh] flex flex-col">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 border-b border-slate-800">
              {SOLAR_SYSTEM_DATA.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setCodexPlanet(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
                    codexPlanet.id === p.id
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-[#0e1933] text-slate-300 hover:text-white'
                  }`}
                >
                  {getLocalizedPlanetName(p)} ({p.name})
                </button>
              ))}
            </div>

            <div className="overflow-y-auto pr-1 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-mono text-amber-400">
                    {codexPlanet.type} · {codexPlanet.subtitle}
                  </div>
                  <h2 className="font-display text-3xl font-bold text-white mt-0.5">
                    {getLocalizedPlanetName(codexPlanet)}{' '}
                    <span className="text-xl font-normal text-sky-400">
                      — {codexPlanet.hindiName}
                    </span>
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      canvasRef.current?.warpToPlanet(codexPlanet.id);
                      setCodexPlanet(null);
                    }}
                    className="px-4 py-2 text-xs font-display font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {t.warpHere}
                  </button>
                  <button
                    onClick={() => setCodexPlanet(null)}
                    className="px-3.5 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {t.close} (Esc)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-[#0d1730] border border-slate-800 rounded-xl p-4">
                  <div className="text-xs font-mono text-amber-400 mb-1.5">
                    अंतरिक्ष एवं ग्रह विवरण (HINDI)
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {codexPlanet.descriptionHi}
                  </p>
                </div>

                <div className="bg-[#0d1730] border border-slate-800 rounded-xl p-4">
                  <div className="text-xs font-mono text-sky-400 mb-1.5">
                    ASTRONOMICAL OVERVIEW (ENGLISH)
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {codexPlanet.descriptionEn}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs tabular-nums">
                <div className="bg-[#0b1326] border border-slate-800/90 rounded-lg p-3">
                  <div className="text-slate-400">{t.distanceFromSun}</div>
                  <div className="text-white font-semibold mt-0.5">
                    {codexPlanet.distanceFromSunKm}
                  </div>
                </div>
                <div className="bg-[#0b1326] border border-slate-800/90 rounded-lg p-3">
                  <div className="text-slate-400">{t.orbitalPeriod}</div>
                  <div className="text-white font-semibold mt-0.5">
                    {codexPlanet.yearLength}
                  </div>
                </div>
                <div className="bg-[#0b1326] border border-slate-800/90 rounded-lg p-3">
                  <div className="text-slate-400">{t.dayLength}</div>
                  <div className="text-white font-semibold mt-0.5">
                    {codexPlanet.dayLength}
                  </div>
                </div>
                <div className="bg-[#0b1326] border border-slate-800/90 rounded-lg p-3">
                  <div className="text-slate-400">{t.temperature}</div>
                  <div className="text-amber-300 font-semibold mt-0.5">
                    {codexPlanet.temperature}
                  </div>
                </div>
                <div className="bg-[#0b1326] border border-slate-800/90 rounded-lg p-3">
                  <div className="text-slate-400">{t.gravity}</div>
                  <div className="text-sky-300 font-semibold mt-0.5">
                    {codexPlanet.gravity}
                  </div>
                </div>
                <div className="bg-[#0b1326] border border-slate-800/90 rounded-lg p-3">
                  <div className="text-slate-400">{t.moons}</div>
                  <div className="text-emerald-300 font-semibold mt-0.5">
                    {codexPlanet.moonsCount}
                  </div>
                </div>
              </div>

              {/* Historic ISRO & NASA Space Probes Section */}
              <div className="bg-[#0d1730] border border-slate-800 rounded-xl p-4">
                <div className="text-xs font-mono text-emerald-400 mb-2">
                  ISRO &amp; NASA SPACE PROBES ({telemetry.discoveredProbes.length}/
                  {SPACE_PROBES.length})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {SPACE_PROBES.map((prb) => {
                    const found = telemetry.discoveredProbes.includes(prb.id);
                    return (
                      <div
                        key={prb.id}
                        className={`p-2.5 rounded-lg border ${
                          found
                            ? 'bg-[#091d26] border-emerald-500/50'
                            : 'bg-[#081022] border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold text-white">
                          <span>
                            {prb.name} ({prb.agency})
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400">
                            {found ? '✓' : ''}
                          </span>
                        </div>
                        <div className="text-[11px] text-amber-300 mt-0.5">
                          {prb.hindiName}
                        </div>
                        <div className="text-[11px] text-slate-300 mt-1">
                          {prb.summaryHi}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          4. PAUSE / VICTORY / GAME OVER MODAL
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
    </div>
  );
}
