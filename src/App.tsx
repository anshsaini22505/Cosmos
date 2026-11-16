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
  SPACE_PROBES,
  PlanetData,
} from './data/solarSystemData';
import {
  HIGH_RES_SPACE_IMAGES,
  PLANET_INTERNAL_LAYERS,
  UNIVERSE_RESEARCH_ARTICLES,
  BLACK_HOLE_INSPECTOR_DATA,
  COSMIC_KNOWLEDGE_QUIZ,
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
  projectedLabels: [],
};

// Precision Observatory SVG Vector Icons
const IconScope = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="3" />
    <line x1="12" y1="1" x2="12" y2="4" />
    <line x1="12" y1="20" x2="12" y2="23" />
    <line x1="1" y1="12" x2="4" y2="12" />
    <line x1="20" y1="12" x2="23" y2="12" />
  </svg>
);

const IconRocket = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const IconGalaxy = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3a9 9 0 0 1 9 9c0 3.9-2.5 7.2-6 8.4" />
    <path d="M12 21a9 9 0 0 1-9-9c0-3.9 2.5-7.2 6-8.4" />
    <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-28 12 12)" />
  </svg>
);

const IconQuiz = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    <circle cx="12" cy="12" r="4" />
  </svg>
);

const IconCore = () => (
  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

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
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('overview');
  const [graphicsQuality, setGraphicsQuality] =
    useState<GraphicsQualityMode>('ultra');
  const [timeScale, setTimeScale] = useState<number>(1);
  const [telemetry, setTelemetry] = useState<HudTelemetry>(INITIAL_TELEMETRY);
  const [show3DLabels, setShow3DLabels] = useState<boolean>(true);

  // Solar System Scope Planet & Black Hole Focus + Inspector Drawer
  const [focusPlanetId, setFocusPlanetId] = useState<string | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'overview' | 'core' | 'probes'>('overview');

  // Deep Space & Universe Research Atlas Modal
  const [showResearchHub, setShowResearchHub] = useState<boolean>(false);
  const [selectedArticle, setSelectedArticle] = useState<UniverseResearchArticle>(
    UNIVERSE_RESEARCH_ARTICLES[0]
  );

  // Cosmic Knowledge Quiz, ISRO/NASA Probes & Observatory Settings Modal
  const [showKnowledgeModal, setShowKnowledgeModal] = useState<boolean>(false);
  const [knowledgeTab, setKnowledgeTab] = useState<'quiz' | 'probes' | 'settings'>('quiz');
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [showTouchPad, setShowTouchPad] = useState<boolean>(false);

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
      if (planet.id === 'blackhole') {
        return isHindi ? 'सैजिटेरियस A* (ब्लैक होल)' : 'Sagittarius A* (Black Hole)';
      }
      return t.planetNames[planet.id] || planet.hindiName || planet.name;
    },
    [t, isHindi]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        if (showResearchHub) {
          setShowResearchHub(false);
          return;
        }
        if (showKnowledgeModal) {
          setShowKnowledgeModal(false);
          return;
        }
        if (focusPlanetId) {
          setFocusPlanetId(null);
          return;
        }
      } else if (e.code === 'KeyC' && gameState === 'playing') {
        setFocusPlanetId((prev) =>
          prev ? null : telemetry.nearestPlanet.id
        );
      } else if (e.code === 'KeyU' && gameState === 'playing') {
        setShowResearchHub((prev) => !prev);
      } else if (e.code === 'KeyL' && gameState === 'playing') {
        setShow3DLabels((prev) => !prev);
      } else if (e.code === 'KeyV' && gameState === 'playing') {
        setFocusPlanetId(null);
        setCameraMode((prev) =>
          prev === 'overview'
            ? 'chase'
            : prev === 'chase'
              ? 'cockpit'
              : 'overview'
        );
      } else if (e.code === 'KeyP' && gameState === 'playing') {
        setFocusPlanetId(null);
        canvasRef.current?.toggleAutoPilot();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    gameState,
    telemetry.nearestPlanet.id,
    showResearchHub,
    showKnowledgeModal,
    focusPlanetId,
  ]);

  const handleStartSolarScope = () => {
    soundEngine.playWarp();
    setCameraMode('overview');
    setFocusPlanetId(null);
    setGameState('playing');
  };

  const handleStartEarthCore = () => {
    soundEngine.playWarp();
    setGameState('playing');
    setFocusPlanetId('earth');
    setInspectorTab('core');
  };

  const handleStartGuidedTour = () => {
    soundEngine.playWarp();
    setFocusPlanetId(null);
    setCameraMode('chase');
    setGameState('playing');
    setTimeout(() => {
      if (!telemetry.autoPilotActive) {
        canvasRef.current?.toggleAutoPilot();
      }
    }, 120);
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  const handleSelectPlanetInScope = (planetId: string) => {
    soundEngine.playCollect();
    if (planetId === 'blackhole') {
      canvasRef.current?.warpToBlackHole();
      setFocusPlanetId('blackhole');
      setInspectorTab('overview');
      return;
    }
    setFocusPlanetId(planetId);
    canvasRef.current?.warpToPlanet(planetId);
  };

  // Supports all 10 Solar System worlds AND Sagittarius A* Supermassive Black Hole!
  const focusedPlanetData: PlanetData | null =
    focusPlanetId === 'blackhole'
      ? (BLACK_HOLE_INSPECTOR_DATA as PlanetData)
      : focusPlanetId
        ? SOLAR_SYSTEM_DATA.find((p) => p.id === focusPlanetId) || null
        : null;

  const focusedPlanetLayers = focusedPlanetData
    ? PLANET_INTERNAL_LAYERS[focusedPlanetData.id] || []
    : [];

  const currentQuiz = COSMIC_KNOWLEDGE_QUIZ[quizIndex] || COSMIC_KNOWLEDGE_QUIZ[0];

  return (
    <div
      dir={currentLangObj.dir || 'ltr'}
      className="relative w-screen h-screen overflow-hidden bg-[#040711] select-none"
    >
      <OfflineIndicator />

      {/* Primary 100vw x 100vh 3D WebGL Solar System & Deep Space Observatory Canvas */}
      <SpaceCanvas
        ref={canvasRef}
        gameState={gameState}
        cameraMode={cameraMode}
        graphicsQuality={graphicsQuality}
        timeScale={timeScale}
        focusPlanetId={focusPlanetId}
        showCoreCutaway={Boolean(
          focusPlanetId &&
            focusPlanetId !== 'blackhole' &&
            inspectorTab === 'core'
        )}
        touchInputRef={touchInputRef}
        onTelemetryUpdate={setTelemetry}
        onGameEnd={() => {}}
        onSelectPlanetCodex={(planet) => {
          setFocusPlanetId(planet.id);
          setInspectorTab('overview');
        }}
      />

      {/* =====================================================================
          FLOATING 3D PLANET & BLACK HOLE LABELS (SOLAR SYSTEM SCOPE STYLE)
         ===================================================================== */}
      {gameState === 'playing' &&
        show3DLabels &&
        !focusPlanetId &&
        !showResearchHub &&
        !showKnowledgeModal &&
        telemetry.projectedLabels && (
          <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
            {telemetry.projectedLabels.map((lbl) =>
              lbl.visible ? (
                <button
                  key={lbl.id}
                  onClick={() => handleSelectPlanetInScope(lbl.id)}
                  style={{
                    left: `${lbl.x}%`,
                    top: `${lbl.y}%`,
                    transform: 'translate(-50%, -100%)',
                  }}
                  className="pointer-events-auto absolute flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#060c1d]/85 hover:bg-amber-400 hover:text-slate-950 border border-slate-700/80 hover:border-amber-300 text-[11px] font-display font-semibold text-slate-100 shadow-md transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: lbl.color }}
                  />
                  <span>
                    {t.planetNames[lbl.id] || (isHindi ? lbl.hindiName : lbl.name)}
                  </span>
                </button>
              ) : null
            )}
          </div>
        )}

      {/* =====================================================================
          1. WORLD-CLASS 3D SPACE ENCYCLOPEDIA & OBSERVATORY TITLE SCREEN
         ===================================================================== */}
      {gameState === 'title' && (
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-8 bg-gradient-to-r from-[#040711]/95 via-[#040711]/75 to-transparent">
          {/* Top Clean Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-display font-bold text-xs shadow-lg">
                3D
              </div>
              <div>
                <div className="font-display font-bold text-white tracking-wider text-sm sm:text-base">
                  ASTRAL ODYSSEY · COSMOS ENCYCLOPEDIA
                </div>
                <div className="text-[11px] font-mono text-sky-400 tracking-wide">
                  {isHindi
                    ? 'संपूर्ण 3D सौर मंडल, ग्रह आंतरिक संरचना (Core X-Ray) और ब्रह्मांड ज्ञानकोश'
                    : 'Interactive 3D Solar System Scope, Planetary Core Cutaways & Universe Research Atlas'}
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

              {/* 36-Language Global Selector */}
              <label className="flex items-center gap-1.5 bg-[#0b1329] border border-slate-700/90 rounded-lg px-2.5 py-1.5 text-xs text-slate-200">
                <span className="font-mono text-[10px] text-sky-400 uppercase">36 LANG</span>
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

          {/* Center Hero Content + 8K Universe Encyclopedia Preview Card */}
          <div className="my-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center max-w-6xl">
            <div className="lg:col-span-7 pointer-events-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-sky-500/15 border border-sky-400/40 text-xs font-mono text-sky-300 mb-4">
                <span>GLOBAL 3D SPACE ENCYCLOPEDIA</span>
                <span>·</span>
                <span>ISRO · NASA · JWST · EHT</span>
              </div>

              <h1
                className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.12] mb-4"
                style={{ textWrap: 'balance' }}
              >
                {isHindi
                  ? 'संपूर्ण ब्रह्मांड और 3D सौर मंडल का प्रत्यक्ष वैज्ञानिक दर्शन'
                  : 'Explore the Complete 3D Solar System, Planetary Cores & Deep Universe'}
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mb-6">
                {isHindi
                  ? 'सूर्य से प्लूटो और सुपरमैसिव ब्लैक होल (Sagittarius A*) तक 360° में घुमाकर देखें। किसी भी ग्रह या सूर्य को काटकर (3D Core Cutaway) उसकी आंतरिक परतें, चंद्रयान-3, आदित्य-L1, जेम्स वेब टेलीस्कोप और 93 अरब प्रकाश-वर्ष के ब्रह्मांड का संपूर्ण ज्ञान प्राप्त करें।'
                  : 'Rotate 360° around every planet, peel open true 3D interior core cutaways from the Sun to Pluto, inspect Sagittarius A* Black Hole, and study landmark discoveries from ISRO Chandrayaan-3, Aditya-L1, and JWST.'}
              </p>

              {/* 3 Pure Educational & Exploration Launch Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleStartSolarScope}
                  className="flex items-center gap-2 px-6 py-3.5 text-sm font-display font-bold tracking-wide text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <IconScope />
                  <span>
                    {isHindi
                      ? '3D सौर मंडल वेधशाला खोलें (Solar Scope)'
                      : 'Launch 3D Solar System Scope'}
                  </span>
                </button>

                <button
                  onClick={handleStartEarthCore}
                  className="flex items-center gap-2 px-5 py-3.5 text-sm font-display font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-xl shadow-md transition-colors cursor-pointer whitespace-nowrap"
                >
                  <IconCore />
                  <span>
                    {isHindi
                      ? '3D ग्रह आंतरिक कोर एक्स-रे देखें'
                      : 'Inspect 3D Planet Core Cutaway'}
                  </span>
                </button>

                <button
                  onClick={handleStartGuidedTour}
                  className="flex items-center gap-2 px-5 py-3.5 text-sm font-medium text-white bg-[#0d1730] hover:bg-[#162447] border border-slate-700 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                >
                  <IconRocket />
                  <span>
                    {isHindi
                      ? 'स्वचालित ब्रह्मांड यात्रा (Guided Tour)'
                      : 'Start Guided Solar Tour'}
                  </span>
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
                    COMPLETE ASTROPHYSICS &amp; SPACE RESEARCH ATLAS
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <div className="font-display font-bold text-base text-white group-hover:text-amber-300 transition-colors">
                    {isHindi
                      ? 'संपूर्ण ब्रह्मांड ज्ञानकोश: चंद्रयान-3, ब्लैक होल और JWST'
                      : 'Complete Universe Atlas: Chandrayaan-3, Black Holes & JWST'}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isHindi
                      ? 'सूर्य से प्लूटो की 3D आंतरिक परतें (Core Cutaway), सुपरमैसिव ब्लैक होल Sagittarius A*, जेम्स वेब नेबुला और 93 अरब प्रकाश-वर्ष का ब्रह्मांड।'
                      : 'Explore live 3D planetary core cutaways, Sagittarius A* Black Hole, JWST Pillars of Creation, and 93B light-years of cosmic research.'}
                  </p>
                  <div className="pt-1 text-xs font-mono text-sky-400 flex items-center justify-between">
                    <span>
                      {isHindi
                        ? '6 हाई-डेफिनिशन रिसर्च अध्याय खोलें →'
                        : 'Open 6 HD Research Chapters →'}
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
                ? 'उंगली/माउस से 360° घुमाएँ · पिंच/स्क्रॉल से ज़ूम करें · किसी भी ग्रह पर टैप करके उसकी 3D आंतरिक कोर देखें'
                : 'Drag 360° to Rotate · Pinch/Scroll to Zoom · Tap any world for 3D Core Cutaway & Encyclopedia'}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400">
                36 GLOBAL LANGUAGES
              </span>
              <span>·</span>
              <span className="text-amber-400">
                100% SCIENTIFIC &amp; EDUCATIONAL
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          2. ULTRA-CLEAN SINGLE-ROW "SOLAR SYSTEM SCOPE" OBSERVATORY HUD
         ===================================================================== */}
      {gameState !== 'title' && (
        <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-2 sm:p-3.5">
          {/* SINGLE COMPACT TOP BAR (Never crowds mobile screens!) */}
          <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-1.5 bg-[#060b18]/92 border border-slate-800/90 rounded-2xl px-2.5 py-1.5 shadow-xl">
            {/* Left: Brand & Orbital Time-Speed Scrubber */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setGameState('title')}
                className="flex items-center gap-2 pr-2 border-r border-slate-800 cursor-pointer group"
                title="Return to Title Screen"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-400 flex items-center justify-center text-slate-950 font-display font-bold text-xs">
                  3D
                </div>
                <div className="hidden sm:block text-left">
                  <div className="font-display font-bold text-xs text-white group-hover:text-amber-300 leading-none">
                    COSMOS SCOPE
                  </div>
                  <div className="text-[10px] font-mono text-sky-400 mt-0.5">
                    {telemetry.scannedPlanets.length}/10 Worlds Explored
                  </div>
                </div>
              </button>

              {/* Orbital Time-Speed Scrubber */}
              <div className="flex items-center gap-0.5 bg-[#0c152a] border border-slate-800 rounded-lg p-0.5 font-mono text-[10px]">
                {[
                  { label: 'PAUSE', val: 0 },
                  { label: '0.5×', val: 0.5 },
                  { label: '1×', val: 1 },
                  { label: '3×', val: 3 },
                ].map((spd) => (
                  <button
                    key={spd.val}
                    onClick={() => setTimeScale(spd.val)}
                    className={`px-2 py-1 rounded-md cursor-pointer transition ${
                      timeScale === spd.val
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Center: 4 Pure Knowledge & Exploration Modes */}
            <div className="flex flex-wrap items-center gap-1">
              <button
                onClick={() => {
                  if (focusPlanetId) {
                    setFocusPlanetId(null);
                    setCameraMode('overview');
                  } else {
                    setFocusPlanetId('earth');
                    setInspectorTab('overview');
                  }
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-display font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
                  focusPlanetId
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <IconScope />
                <span>
                  {focusPlanetId
                    ? isHindi
                      ? 'संपूर्ण सौर नक्शा (3D Map)'
                      : 'Full 3D Solar Map'
                    : isHindi
                      ? 'ग्रह एक्स-रे (Inspect)'
                      : 'Inspect Planet'}
                </span>
              </button>

              <button
                onClick={() => {
                  setFocusPlanetId(null);
                  setCameraMode('chase');
                  canvasRef.current?.toggleAutoPilot();
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-display font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
                  telemetry.autoPilotActive
                    ? 'bg-emerald-400 text-slate-950 shadow-sm'
                    : 'text-sky-300 hover:bg-slate-800'
                }`}
              >
                <IconRocket />
                <span>
                  {telemetry.autoPilotActive
                    ? isHindi
                      ? 'गाइडेड टूर चालू'
                      : 'Tour Active'
                    : isHindi
                      ? 'गाइडेड टूर (Auto Tour)'
                      : 'Guided Tour'}
                </span>
              </button>

              <button
                onClick={() => setShowResearchHub(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-display font-bold rounded-xl bg-sky-500/20 border border-sky-400/50 text-sky-200 hover:bg-sky-500/30 transition cursor-pointer whitespace-nowrap"
              >
                <IconGalaxy />
                <span>{isHindi ? 'ब्रह्मांड ज्ञानकोश' : 'Universe Atlas'}</span>
              </button>

              <button
                onClick={() => setShowKnowledgeModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-display font-bold rounded-xl bg-[#101c38] border border-slate-700 text-amber-300 hover:border-amber-400 transition cursor-pointer whitespace-nowrap"
              >
                <IconQuiz />
                <span>{isHindi ? 'क्विज़ व मिशन' : 'Quiz & Probes'}</span>
              </button>
            </div>

            {/* Right: 3D Labels Toggle, Camera View & 36-Language Selector */}
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setShow3DLabels((prev) => !prev)}
                className={`hidden sm:inline-flex px-2 py-1 rounded-lg border font-mono text-[10px] cursor-pointer transition ${
                  show3DLabels
                    ? 'bg-sky-500/20 border-sky-400/60 text-sky-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
                title="Toggle 3D Floating Planet Names (L)"
              >
                {show3DLabels ? 'LABELS ON' : 'LABELS OFF'}
              </button>

              <button
                onClick={() => {
                  setFocusPlanetId(null);
                  setCameraMode((prev) =>
                    prev === 'overview'
                      ? 'chase'
                      : prev === 'chase'
                        ? 'cockpit'
                        : 'overview'
                  );
                }}
                className="px-2 py-1 rounded-lg bg-[#0e1933] border border-slate-700 text-sky-300 hover:text-white font-mono text-[11px] cursor-pointer whitespace-nowrap"
                title="Switch Camera View (V)"
              >
                {cameraMode === 'overview'
                  ? '3D Map'
                  : cameraMode === 'cockpit'
                    ? 'Cockpit'
                    : 'Spacecraft'}
              </button>

              <select
                value={langCode}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-[#0e1933] text-amber-300 border border-slate-700 rounded-lg px-2 py-1 text-xs focus:outline-none cursor-pointer"
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
            </div>
          </div>

          {/* Interactive 360° Guidance Banner */}
          {telemetry.activeAlert ? (
            <div className="pointer-events-none mx-auto bg-[#0b1329]/95 border border-amber-400/60 text-amber-200 px-3.5 py-1 rounded-lg text-xs font-mono tracking-wide shadow-md max-w-md text-center">
              {telemetry.activeAlert}
            </div>
          ) : (
            <div className="pointer-events-none mx-auto bg-[#070d1e]/85 border border-slate-800 text-slate-300 px-3 py-1 rounded-lg text-[11px] font-mono tracking-wide shadow-sm text-center">
              {focusPlanetId
                ? isHindi
                  ? '360° घुमाने के लिए स्क्रीन ड्रैग करें · पिंच या माउस व्हील से ज़ूम करें'
                  : 'Drag anywhere to rotate 360° · Pinch or Scroll wheel to zoom in/out'
                : isHindi
                  ? 'किसी भी ग्रह के नाम पर टैप करें या 360° में पूरा सौर मंडल घुमाकर देखें'
                  : 'Tap any planet label to inspect in 3D or drag 360° across the Solar System'}
            </div>
          )}

          {/* =================================================================
              RESPONSIVE PLANET & BLACK HOLE INSPECTOR
              (Compact Bottom-Sheet on Mobile so 3D Planet stays 100% visible,
               Right-Side Observatory Drawer on Desktop!)
             ================================================================= */}
          {focusedPlanetData && (
            <div className="pointer-events-auto mt-auto lg:my-auto lg:ml-auto w-full lg:max-w-md bg-[#070d1e]/95 border border-slate-700/90 rounded-2xl p-3.5 sm:p-5 shadow-2xl text-white max-h-[42vh] lg:max-h-[72vh] flex flex-col">
              {/* Drawer Header */}
              <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-800">
                <div>
                  <div className="text-[10px] font-mono text-amber-400 uppercase">
                    {focusedPlanetData.type} · {focusedPlanetData.subtitle}
                  </div>
                  <h2 className="font-display text-lg sm:text-2xl font-bold text-white flex flex-wrap items-center gap-2 mt-0.5">
                    <span>{getLocalizedPlanetName(focusedPlanetData)}</span>
                    <span className="text-xs font-normal text-sky-400">
                      ({focusedPlanetData.name})
                    </span>
                  </h2>
                </div>

                <button
                  onClick={() => setFocusPlanetId(null)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-amber-300 cursor-pointer shrink-0"
                >
                  ✕ {isHindi ? 'सौर नक्शा' : 'Solar Map'}
                </button>
              </div>

              {/* Inspector Sub-Tabs: Overview / 3D Core Structure / Space Missions */}
              <div className="grid grid-cols-3 gap-1 bg-[#0c162c] p-1 rounded-xl my-2.5 text-xs font-display font-bold shrink-0">
                <button
                  onClick={() => setInspectorTab('overview')}
                  className={`py-1.5 rounded-lg cursor-pointer transition ${
                    inspectorTab === 'overview'
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {isHindi ? 'विज्ञान डेटा' : 'Overview'}
                </button>
                <button
                  onClick={() => setInspectorTab('core')}
                  className={`flex items-center justify-center gap-1 py-1.5 rounded-lg cursor-pointer transition ${
                    inspectorTab === 'core'
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <IconCore />
                  <span>
                    {focusedPlanetData.id === 'blackhole'
                      ? isHindi
                        ? 'इवेंट होराइजन'
                        : 'Horizon Layers'
                      : isHindi
                        ? '3D कोर कटअवे'
                        : '3D Core X-Ray'}
                  </span>
                </button>
                <button
                  onClick={() => setInspectorTab('probes')}
                  className={`py-1.5 rounded-lg cursor-pointer transition ${
                    inspectorTab === 'probes'
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {isHindi ? 'वायुमंडल व रोचक तथ्य' : 'Facts & Moons'}
                </button>
              </div>

              {/* Scrollable Scientific Content */}
              <div className="overflow-y-auto pr-1 space-y-2.5 text-xs">
                {inspectorTab === 'overview' && (
                  <>
                    <p className="text-slate-200 leading-relaxed bg-[#0c162e] border border-slate-800 rounded-xl p-3">
                      {isHindi
                        ? focusedPlanetData.descriptionHi
                        : focusedPlanetData.descriptionEn}
                    </p>

                    <div className="grid grid-cols-2 gap-2 font-mono tabular-nums">
                      <div className="bg-[#0b1326] border border-slate-800 rounded-lg p-2">
                        <div className="text-[10px] text-slate-400">
                          {t.distanceFromSun}
                        </div>
                        <div className="text-white font-semibold mt-0.5">
                          {focusedPlanetData.distanceFromSunKm}
                        </div>
                      </div>
                      <div className="bg-[#0b1326] border border-slate-800 rounded-lg p-2">
                        <div className="text-[10px] text-slate-400">
                          {t.orbitalPeriod}
                        </div>
                        <div className="text-white font-semibold mt-0.5">
                          {focusedPlanetData.yearLength}
                        </div>
                      </div>
                      <div className="bg-[#0b1326] border border-slate-800 rounded-lg p-2">
                        <div className="text-[10px] text-slate-400">
                          {t.temperature}
                        </div>
                        <div className="text-amber-300 font-semibold mt-0.5">
                          {focusedPlanetData.temperature}
                        </div>
                      </div>
                      <div className="bg-[#0b1326] border border-slate-800 rounded-lg p-2">
                        <div className="text-[10px] text-slate-400">
                          {t.gravity} · {t.moons}
                        </div>
                        <div className="text-sky-300 font-semibold mt-0.5">
                          {focusedPlanetData.gravity} · {focusedPlanetData.moonsCount}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setInspectorTab('core')}
                      className="w-full py-2 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/50 text-amber-300 font-display font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition"
                    >
                      <IconCore />
                      <span>
                        {focusedPlanetData.id === 'blackhole'
                          ? isHindi
                            ? 'इवेंट होराइजन और सिंगुलैरिटी परतें देखें →'
                            : 'Inspect Event Horizon & Singularity Layers →'
                          : isHindi
                            ? '3D ग्रह को काटकर आंतरिक कोर (Mantle & Core) देखें →'
                            : 'Slice Open 3D Planet Core & Mantle Layers →'}
                      </span>
                    </button>
                  </>
                )}

                {inspectorTab === 'core' && (
                  <div className="space-y-2">
                    <div className="bg-amber-500/10 border border-amber-400/40 rounded-xl p-2.5 text-[11px] font-mono text-amber-200">
                      {focusedPlanetData.id === 'blackhole'
                        ? isHindi
                          ? 'सैजिटेरियस A* की सापेक्षतावादी (Relativistic) संरचना:'
                          : 'Relativistic Spacetime Structure of Sagittarius A*:'
                        : isHindi
                          ? `3D चौथाई कटअवे (3/4 Cutaway) सक्रिय: 3D ${focusedPlanetData.hindiName} के कटे हुए हिस्से में अंदर की परतें देखें।`
                          : `3D 90° WEDGE CUTAWAY ACTIVE: Rotate the 3D ${focusedPlanetData.name} model to inspect its solid internal core layers.`}
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
                          Span / Depth: {layer.depthKm}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {inspectorTab === 'probes' && (
                  <div className="space-y-2.5">
                    <div className="bg-[#0c162e] border border-slate-800 rounded-xl p-3 space-y-1.5">
                      <div className="text-[10px] font-mono text-sky-400 uppercase">
                        {isHindi ? 'वायुमंडलीय संघटन (Atmosphere)' : 'Atmospheric Composition'}
                      </div>
                      <div className="text-white font-semibold">
                        {focusedPlanetData.atmosphere}
                      </div>
                    </div>

                    <div className="bg-[#0c162e] border border-slate-800 rounded-xl p-3 space-y-1.5">
                      <div className="text-[10px] font-mono text-amber-400 uppercase">
                        {isHindi ? 'वैज्ञानिक रहस्य (Scientific Fact)' : 'Key Scientific Fact'}
                      </div>
                      <div className="text-slate-200 leading-relaxed">
                        {focusedPlanetData.funFact}
                      </div>
                    </div>

                    <div className="bg-[#0c162e] border border-slate-800 rounded-xl p-3 space-y-1.5">
                      <div className="text-[10px] font-mono text-emerald-400 uppercase">
                        {isHindi ? 'घूर्णन काल (Sidereal Day)' : 'Rotation Period (Day Length)'}
                      </div>
                      <div className="text-white font-mono">
                        {focusedPlanetData.dayLength}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Optional Clean Spacecraft Flight Stick (Only if user explicitly enabled Touch Flight Stick in Settings & is in Spacecraft mode) */}
          {showTouchPad &&
            gameState === 'playing' &&
            !focusPlanetId &&
            cameraMode !== 'overview' && (
              <MobileTouchController
                touchInputRef={touchInputRef}
                onScanPlanet={() => {
                  setFocusPlanetId(telemetry.nearestPlanet.id);
                  setInspectorTab('overview');
                }}
              />
            )}

          {/* =================================================================
              BOTTOM "SOLAR SYSTEM SCOPE" CELESTIAL SELECTOR RIBBON
             ================================================================= */}
          <div className="pointer-events-auto mx-auto w-full max-w-5xl mt-2">
            <div className="flex items-center gap-1.5 overflow-x-auto bg-[#060b18]/92 border border-slate-800 rounded-2xl px-3 py-1.5 shadow-2xl">
              {SOLAR_SYSTEM_DATA.map((planet) => {
                const isSelected = focusPlanetId === planet.id;
                return (
                  <button
                    key={planet.id}
                    onClick={() => handleSelectPlanetInScope(planet.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition cursor-pointer whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-md'
                        : 'bg-[#0b1428] text-slate-300 border-slate-800 hover:border-slate-600 hover:text-white'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: planet.color }}
                    />
                    <span>{getLocalizedPlanetName(planet)}</span>
                  </button>
                );
              })}

              {/* 3D Supermassive Black Hole Quick-Select Button */}
              <button
                onClick={() => handleSelectPlanetInScope('blackhole')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition cursor-pointer whitespace-nowrap shrink-0 ${
                  focusPlanetId === 'blackhole'
                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                    : 'bg-[#170f2e] text-amber-300 border-purple-500/50 hover:border-amber-400'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-black border border-amber-400 shrink-0" />
                <span>{isHindi ? 'ब्लैक होल (Sgr A*)' : 'Black Hole (Sgr A*)'}</span>
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
                    ? 'संपूर्ण ब्रह्मांड, इसरो-नासा और आधुनिक खगोल विज्ञान शोध'
                    : 'Universe & Space Research Atlas (ISRO · NASA · JWST)'}
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
                        ? 'प्रमुख वैज्ञानिक खोजें (Key Scientific Findings):'
                        : 'Key Scientific Findings:'}
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
                          <span className="text-amber-400 font-bold">•</span>
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
                          handleSelectPlanetInScope('blackhole');
                        }}
                        className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-bold text-xs cursor-pointer"
                      >
                        {isHindi
                          ? '3D ब्लैक होल (Sagittarius A*) पर ज़ूम करें →'
                          : 'Inspect 3D Black Hole Now →'}
                      </button>
                    )}

                    {selectedArticle.targetPlanetId && (
                      <button
                        onClick={() => {
                          setShowResearchHub(false);
                          handleSelectPlanetInScope(
                            selectedArticle.targetPlanetId!
                          );
                        }}
                        className="px-5 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-display font-bold text-xs cursor-pointer"
                      >
                        {isHindi
                          ? '3D अंतरिक्ष में इसे करीब से देखें →'
                          : 'Inspect in 3D Space →'}
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
          4. COSMIC KNOWLEDGE QUIZ, ISRO/NASA PROBES & OBSERVATORY SETTINGS MODAL
         ===================================================================== */}
      {showKnowledgeModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 pointer-events-auto">
          <div className="w-full max-w-3xl bg-[#080f20] border border-slate-700 rounded-2xl p-5 sm:p-6 shadow-2xl text-white max-h-[88vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="font-display text-xl font-bold text-white">
                {isHindi
                  ? 'अंतरिक्ष ज्ञान प्रश्नोत्तरी (Cosmic Quiz), यान और सेटिंग्स'
                  : 'Cosmic Knowledge Quiz, Space Probes & Settings'}
              </h2>
              <button
                onClick={() => setShowKnowledgeModal(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs cursor-pointer"
              >
                ✕ {t.close}
              </button>
            </div>

            {/* Sub-navigation */}
            <div className="flex flex-wrap gap-1.5 my-3 bg-[#0c162d] p-1.5 rounded-xl">
              {(
                [
                  {
                    id: 'quiz',
                    label: isHindi
                      ? `ब्रह्मांड ज्ञान क्विज़ (Score: ${quizScore})`
                      : `Astronomy Quiz (Score: ${quizScore})`,
                  },
                  {
                    id: 'probes',
                    label: isHindi
                      ? 'ISRO व NASA अंतरिक्ष यान'
                      : 'ISRO & NASA Spacecraft',
                  },
                  {
                    id: 'settings',
                    label: isHindi ? 'ग्राफ़िक्स व डिस्प्ले सेटिंग्स' : 'Observatory Settings',
                  },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setKnowledgeTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-display font-bold transition cursor-pointer ${
                    knowledgeTab === tab.id
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto space-y-4 pr-1">
              {knowledgeTab === 'quiz' && (
                <div className="bg-[#0c162e] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono text-sky-400">
                    <span>
                      QUESTION {quizIndex + 1} OF {COSMIC_KNOWLEDGE_QUIZ.length}
                    </span>
                    <span className="text-amber-300 font-bold">
                      KNOWLEDGE SCORE: {quizScore} / {COSMIC_KNOWLEDGE_QUIZ.length}
                    </span>
                  </div>

                  <h3 className="font-display text-base sm:text-lg font-bold text-white leading-snug">
                    {isHindi ? currentQuiz.questionHi : currentQuiz.questionEn}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(isHindi
                      ? currentQuiz.optionsHi
                      : currentQuiz.optionsEn
                    ).map((opt, idx) => {
                      const isPicked = selectedOption === idx;
                      const isCorrect = idx === currentQuiz.correctIndex;
                      let btnStyle =
                        'bg-[#081022] border-slate-700 text-slate-200 hover:border-sky-400';
                      if (selectedOption !== null) {
                        if (isCorrect) {
                          btnStyle =
                            'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold';
                        } else if (isPicked) {
                          btnStyle =
                            'bg-red-500/20 border-red-400 text-red-200';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            if (selectedOption !== null) return;
                            setSelectedOption(idx);
                            if (idx === currentQuiz.correctIndex) {
                              soundEngine.playCollect();
                              setQuizScore((s) => s + 1);
                            }
                          }}
                          className={`p-3 rounded-xl border text-left text-xs transition cursor-pointer ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {selectedOption !== null && (
                    <div className="bg-[#081124] border border-amber-400/50 rounded-xl p-3.5 space-y-2 text-xs">
                      <div className="font-bold text-amber-300">
                        {selectedOption === currentQuiz.correctIndex
                          ? isHindi
                            ? '✓ बिल्कुल सही उत्तर!'
                            : '✓ Correct Answer!'
                          : isHindi
                            ? '✗ वैज्ञानिक तथ्य जानें:'
                            : '✗ Scientific Explanation:'}
                      </div>
                      <p className="text-slate-200 leading-relaxed">
                        {isHindi
                          ? currentQuiz.explanationHi
                          : currentQuiz.explanationEn}
                      </p>
                      <button
                        onClick={() => {
                          setSelectedOption(null);
                          setQuizIndex(
                            (i) => (i + 1) % COSMIC_KNOWLEDGE_QUIZ.length
                          );
                        }}
                        className="mt-1 px-4 py-2 rounded-lg bg-amber-400 text-slate-950 font-display font-bold text-xs cursor-pointer"
                      >
                        {isHindi ? 'अगला प्रश्न →' : 'Next Question →'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {knowledgeTab === 'probes' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SPACE_PROBES.map((prb) => (
                    <div
                      key={prb.id}
                      className="p-4 rounded-xl bg-[#0c162e] border border-slate-800 flex flex-col justify-between gap-3"
                    >
                      <div>
                        <div className="text-[10px] font-mono text-amber-400">
                          {prb.agency}
                        </div>
                        <div className="font-display font-bold text-sm text-white mt-0.5">
                          {prb.name} —{' '}
                          <span className="text-sky-300">{prb.hindiName}</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                          {isHindi ? prb.summaryHi : prb.summaryEn}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setShowKnowledgeModal(false);
                          handleSelectPlanetInScope(prb.hostPlanetId);
                        }}
                        className="w-full py-2 rounded-lg bg-sky-400/20 hover:bg-sky-400/30 border border-sky-400/50 text-sky-200 font-display font-bold text-xs cursor-pointer"
                      >
                        {isHindi
                          ? '3D कक्षा में देखें →'
                          : 'Locate in 3D Orbit →'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {knowledgeTab === 'settings' && (
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
                      {isHindi
                        ? '3D ग्रहों के नाम (Floating 3D Labels):'
                        : '3D Floating Planet Names:'}
                    </span>
                    <button
                      onClick={() => setShow3DLabels((prev) => !prev)}
                      className="px-4 py-1.5 rounded-lg bg-slate-800 text-amber-300 font-mono cursor-pointer"
                    >
                      {show3DLabels ? 'ENABLED' : 'HIDDEN'}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-slate-300 font-bold">
                      {isHindi
                        ? 'मोबाइल स्पेसक्राफ्ट जॉयस्टिक:'
                        : 'On-Screen Spacecraft Stick:'}
                    </span>
                    <button
                      onClick={() => setShowTouchPad((prev) => !prev)}
                      className="px-4 py-1.5 rounded-lg bg-slate-800 text-sky-300 font-mono cursor-pointer"
                    >
                      {showTouchPad ? 'ON' : 'OFF (360° Touch Orbit)'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Automated Single-APK Download & Updates Modal */}
      <UpdateAndApkModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        langCode={langCode}
      />
    </div>
  );
}
