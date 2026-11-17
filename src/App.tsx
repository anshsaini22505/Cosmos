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
import { OfflineIndicator } from './pwa/PWAInstallButton';
import { UpdateAndApkModal } from './components/UpdateAndApkModal';
import {
  MobileTouchController,
  TouchInputState,
} from './components/MobileTouchAndRadar';
import {
  planetaryAudio,
  PLANET_AUDIO_PROFILES,
} from './services/spaceAudioAndPacks';

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

// Native Android Bottom Navigation SVG Icons
const IconPlanetScope = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="7" />
    <ellipse cx="12" cy="12" rx="11" ry="4" transform="rotate(-24 12 12)" />
  </svg>
);

const IconAutoTour = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const IconAtlasBook = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const IconQuizStar = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const IconCoreXray = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

function triggerAndroidHaptic(ms: number = 10) {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  } catch {
    // Ignore
  }
}

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
  // Launch directly into the live 3D Android Observatory (no web landing page clutter!)
  const [gameState] = useState<GameStateMode>('playing');
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('overview');
  const [graphicsQuality, setGraphicsQuality] =
    useState<GraphicsQualityMode>('high');
  const [timeScale, setTimeScale] = useState<number>(1);
  const [telemetry, setTelemetry] = useState<HudTelemetry>(INITIAL_TELEMETRY);
  const [show3DLabels, setShow3DLabels] = useState<boolean>(true);

  // Selected Planet or Black Hole in 3D Scope
  const [focusPlanetId, setFocusPlanetId] = useState<string | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'overview' | 'core' | 'probes'>('overview');

  // Native Android Bottom Nav Active Sheet ('scope' | 'atlas' | 'quiz')
  const [activeNavTab, setActiveNavTab] = useState<'scope' | 'atlas' | 'quiz'>('scope');

  const [selectedArticle, setSelectedArticle] = useState<UniverseResearchArticle>(
    UNIVERSE_RESEARCH_ARTICLES[0]
  );

  const [knowledgeTab, setKnowledgeTab] = useState<'quiz' | 'probes' | 'settings'>('quiz');
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [showTouchPad, setShowTouchPad] = useState<boolean>(false);
  const [playingPlanetAudioId, setPlayingPlanetAudioId] = useState<string | null>(null);

  const t = getUIStrings(langCode);
  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === langCode) ||
    SUPPORTED_LANGUAGES[0];
  const isHindi = langCode === 'hi' || langCode === 'hinglish';

  const handleLanguageChange = (newCode: string) => {
    triggerAndroidHaptic(12);
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
        return isHindi ? 'सैजिटेरियस A* (ब्लैक होल)' : 'Sagittarius A*';
      }
      return t.planetNames[planet.id] || planet.hindiName || planet.name;
    },
    [t, isHindi]
  );

  // Native Android Hardware Back Button & Gesture Navigation Handler
  useEffect(() => {
    window.history.pushState({ androidApp: true }, '');
    const onPopState = () => {
      if (showUpdateModal) {
        setShowUpdateModal(false);
        window.history.pushState({ androidApp: true }, '');
        return;
      }
      if (activeNavTab !== 'scope') {
        setActiveNavTab('scope');
        window.history.pushState({ androidApp: true }, '');
        return;
      }
      if (focusPlanetId) {
        setFocusPlanetId(null);
        window.history.pushState({ androidApp: true }, '');
        return;
      }
      window.history.pushState({ androidApp: true }, '');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [showUpdateModal, activeNavTab, focusPlanetId]);

  const handleToggleMute = () => {
    triggerAndroidHaptic(10);
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  const handleSelectPlanetInScope = (planetId: string) => {
    triggerAndroidHaptic(15);
    soundEngine.playCollect();
    planetaryAudio.stop();
    setPlayingPlanetAudioId(null);
    setActiveNavTab('scope');
    if (planetId === 'blackhole') {
      canvasRef.current?.warpToBlackHole();
      setFocusPlanetId('blackhole');
      setInspectorTab('overview');
      return;
    }
    setFocusPlanetId(planetId);
    canvasRef.current?.warpToPlanet(planetId);
  };

  const focusedPlanetData: PlanetData | null =
    focusPlanetId === 'blackhole'
      ? (BLACK_HOLE_INSPECTOR_DATA as PlanetData)
      : focusPlanetId
        ? SOLAR_SYSTEM_DATA.find((p) => p.id === focusPlanetId) || null
        : null;

  const activeAudioProfile = focusedPlanetData
    ? PLANET_AUDIO_PROFILES[focusedPlanetData.id === 'blackhole' ? 'sagittarius-a' : focusedPlanetData.id] ||
      PLANET_AUDIO_PROFILES.sun
    : null;

  const handleTogglePlanetSpaceAudio = async () => {
    if (!focusedPlanetData) return;
    triggerAndroidHaptic(14);
    const key = focusedPlanetData.id === 'blackhole' ? 'sagittarius-a' : focusedPlanetData.id;
    const isNowPlaying = await planetaryAudio.togglePlanetAudio(key);
    setPlayingPlanetAudioId(isNowPlaying ? key : null);
  };

  const focusedPlanetLayers = focusedPlanetData
    ? PLANET_INTERNAL_LAYERS[focusedPlanetData.id] || []
    : [];

  const currentQuiz = COSMIC_KNOWLEDGE_QUIZ[quizIndex] || COSMIC_KNOWLEDGE_QUIZ[0];

  return (
    <div
      dir={currentLangObj.dir || 'ltr'}
      onContextMenu={(e) => e.preventDefault()}
      style={{ overscrollBehavior: 'none', WebkitTapHighlightColor: 'transparent' }}
      className="relative w-screen h-screen overflow-hidden bg-[#040711] select-none touch-none"
    >
      <OfflineIndicator />

      {/* 100% Fullscreen Hardware-Accelerated 3D Solar System & Universe Canvas */}
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
          triggerAndroidHaptic(12);
          setFocusPlanetId(planet.id);
          setInspectorTab('overview');
        }}
      />

      {/* =====================================================================
          FLOATING 3D PLANET & BLACK HOLE LABELS (SOLAR SYSTEM SCOPE STYLE)
         ===================================================================== */}
      {activeNavTab === 'scope' &&
        show3DLabels &&
        !focusPlanetId &&
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
                  className="pointer-events-auto absolute flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#060c1d]/90 active:scale-95 border border-slate-700/80 text-[11px] font-display font-semibold text-white shadow-lg cursor-pointer whitespace-nowrap"
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
          NATIVE ANDROID APP HUD OVERLAY
         ===================================================================== */}
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between">
        {/* TOP FLOATING ANDROID STATUS PILLS (Minimal, Clean, Zero Website Look) */}
        <div className="flex items-center justify-between gap-2 px-3 pt-2.5 sm:px-5 sm:pt-3.5">
          {/* Top-Left: Orbital Time-Speed Scrubber Pill */}
          <div className="pointer-events-auto flex items-center gap-1 bg-[#080f22]/90 border border-slate-800 rounded-full px-2 py-1 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 ml-1" />
            <span className="text-[10px] font-mono text-slate-300 mr-1 hidden sm:inline">
              ORBIT
            </span>
            {[
              { label: '0×', val: 0 },
              { label: '1×', val: 1 },
              { label: '3×', val: 3 },
            ].map((spd) => (
              <button
                key={spd.val}
                onClick={() => {
                  triggerAndroidHaptic(8);
                  setTimeScale(spd.val);
                }}
                className={`px-2.5 py-1 rounded-full font-mono text-[11px] cursor-pointer transition ${
                  timeScale === spd.val
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-300'
                }`}
              >
                {spd.label}
              </button>
            ))}
          </div>

          {/* Top-Right: Camera View, 3D Labels, Language & 300MB Pack Badge */}
          <div className="pointer-events-auto flex items-center gap-1.5 bg-[#080f22]/90 border border-slate-800 rounded-full px-2.5 py-1 shadow-lg text-xs">
            <button
              onClick={() => {
                triggerAndroidHaptic(10);
                setShow3DLabels((p) => !p);
              }}
              className={`px-2 py-1 rounded-full font-mono text-[10px] cursor-pointer ${
                show3DLabels
                  ? 'bg-sky-500/25 text-sky-200 border border-sky-400/50'
                  : 'text-slate-400'
              }`}
            >
              {show3DLabels ? 'NAMES ON' : 'NAMES OFF'}
            </button>

            <button
              onClick={() => {
                triggerAndroidHaptic(10);
                setFocusPlanetId(null);
                setCameraMode((prev) =>
                  prev === 'overview' ? 'chase' : 'overview'
                );
              }}
              className="px-2.5 py-1 rounded-full bg-[#111e3d] text-amber-300 font-mono text-[10px] cursor-pointer"
            >
              {cameraMode === 'overview' ? '3D MAP' : 'SHIP CAM'}
            </button>

            <select
              value={langCode}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-transparent text-white font-medium text-[11px] focus:outline-none cursor-pointer max-w-[88px] truncate"
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
              onClick={() => {
                triggerAndroidHaptic(10);
                setShowUpdateModal(true);
              }}
              className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-mono text-[10px] cursor-pointer"
            >
              300MB
            </button>
          </div>
        </div>

        {/* =================================================================
            MIDDLE-TO-BOTTOM NATIVE ANDROID BOTTOM SHEET:
            PLANET & BLACK HOLE SCIENTIFIC INSPECTOR + 3D CORE X-RAY
           ================================================================= */}
        {activeNavTab === 'scope' && focusedPlanetData && (
          <div className="pointer-events-auto mt-auto lg:my-auto lg:ml-auto lg:mr-4 w-full lg:max-w-md bg-[#070d1e]/96 border-t lg:border border-slate-700/90 rounded-t-3xl lg:rounded-2xl p-4 shadow-2xl text-white max-h-[44vh] lg:max-h-[68vh] flex flex-col">
            {/* Android Sheet Drag Handle */}
            <div className="w-10 h-1 rounded-full bg-slate-600 mx-auto mb-2 lg:hidden shrink-0" />

            <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-800 shrink-0">
              <div>
                <div className="text-[10px] font-mono text-amber-400 uppercase">
                  {focusedPlanetData.type} · {focusedPlanetData.subtitle}
                </div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <span>{getLocalizedPlanetName(focusedPlanetData)}</span>
                  <span className="text-xs font-normal text-sky-400">
                    ({focusedPlanetData.name})
                  </span>
                </h2>
              </div>

              <button
                onClick={() => {
                  triggerAndroidHaptic(10);
                  planetaryAudio.stop();
                  setPlayingPlanetAudioId(null);
                  setFocusPlanetId(null);
                }}
                className="px-3 py-1 rounded-full bg-slate-800 text-xs font-mono text-amber-300 active:scale-95 cursor-pointer shrink-0"
              >
                ✕ {isHindi ? 'वापस' : 'Back'}
              </button>
            </div>

            {/* Real 300MB Pack Planetary Magnetosphere & Plasma Wave Audio Bar */}
            {activeAudioProfile && (
              <div className="mt-2 bg-gradient-to-r from-[#0e1b38] to-[#132347] border border-sky-500/40 rounded-xl p-2 flex items-center justify-between gap-2 shrink-0">
                <div className="min-w-0">
                  <div className="text-[10px] font-mono text-sky-300 truncate">
                    🛰️ {activeAudioProfile.instrument}
                  </div>
                  <div className="text-xs font-bold text-white truncate">
                    {isHindi ? activeAudioProfile.hindiTitle : activeAudioProfile.title}
                  </div>
                </div>
                <button
                  onClick={handleTogglePlanetSpaceAudio}
                  className={`px-3 py-1.5 rounded-lg font-display font-bold text-xs shrink-0 cursor-pointer transition active:scale-95 ${
                    playingPlanetAudioId
                      ? 'bg-emerald-400 text-slate-950 shadow-md'
                      : 'bg-amber-400 text-slate-950'
                  }`}
                >
                  {playingPlanetAudioId
                    ? isHindi
                      ? '⏹ ध्वनि रोकें'
                      : '⏹ Stop Wave'
                    : isHindi
                      ? '🔊 अंतरिक्ष ध्वनि सुनें'
                      : '🔊 Listen Wave'}
                </button>
              </div>
            )}

            {/* 3 Native Android Segmented Pills */}
            <div className="grid grid-cols-3 gap-1 bg-[#0c162c] p-1 rounded-xl my-2 text-xs font-display font-bold shrink-0">
              <button
                onClick={() => {
                  triggerAndroidHaptic(10);
                  setInspectorTab('overview');
                }}
                className={`py-1.5 rounded-lg cursor-pointer transition ${
                  inspectorTab === 'overview'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-300'
                }`}
              >
                {isHindi ? 'परिचय' : 'Overview'}
              </button>
              <button
                onClick={() => {
                  triggerAndroidHaptic(12);
                  setInspectorTab('core');
                }}
                className={`flex items-center justify-center gap-1 py-1.5 rounded-lg cursor-pointer transition ${
                  inspectorTab === 'core'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-300'
                }`}
              >
                <IconCoreXray />
                <span>
                  {focusedPlanetData.id === 'blackhole'
                    ? isHindi
                      ? 'होराइजन'
                      : 'Horizon'
                    : isHindi
                      ? '3D कोर'
                      : '3D Core'}
                </span>
              </button>
              <button
                onClick={() => {
                  triggerAndroidHaptic(10);
                  setInspectorTab('probes');
                }}
                className={`py-1.5 rounded-lg cursor-pointer transition ${
                  inspectorTab === 'probes'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-300'
                }`}
              >
                {isHindi ? 'तथ्य व वायुमंडल' : 'Atmosphere'}
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 pr-1 text-xs">
              {inspectorTab === 'overview' && (
                <>
                  <p className="text-slate-200 leading-relaxed bg-[#0c162e] border border-slate-800 rounded-xl p-2.5">
                    {isHindi
                      ? focusedPlanetData.descriptionHi
                      : focusedPlanetData.descriptionEn}
                  </p>

                  <div className="grid grid-cols-2 gap-1.5 font-mono tabular-nums">
                    <div className="bg-[#0b1326] border border-slate-800 rounded-lg p-2">
                      <div className="text-[10px] text-slate-400">
                        {t.distanceFromSun}
                      </div>
                      <div className="text-white font-semibold">
                        {focusedPlanetData.distanceFromSunKm}
                      </div>
                    </div>
                    <div className="bg-[#0b1326] border border-slate-800 rounded-lg p-2">
                      <div className="text-[10px] text-slate-400">
                        {t.orbitalPeriod}
                      </div>
                      <div className="text-white font-semibold">
                        {focusedPlanetData.yearLength}
                      </div>
                    </div>
                    <div className="bg-[#0b1326] border border-slate-800 rounded-lg p-2">
                      <div className="text-[10px] text-slate-400">
                        {t.temperature}
                      </div>
                      <div className="text-amber-300 font-semibold">
                        {focusedPlanetData.temperature}
                      </div>
                    </div>
                    <div className="bg-[#0b1326] border border-slate-800 rounded-lg p-2">
                      <div className="text-[10px] text-slate-400">
                        {t.gravity} · {t.moons}
                      </div>
                      <div className="text-sky-300 font-semibold">
                        {focusedPlanetData.gravity} · {focusedPlanetData.moonsCount}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {inspectorTab === 'core' && (
                <div className="space-y-1.5">
                  {focusedPlanetLayers.map((layer, idx) => (
                    <div
                      key={idx}
                      className="bg-[#0c162e] border border-slate-800 rounded-xl p-2.5 space-y-0.5"
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
                    </div>
                  ))}
                </div>
              )}

              {inspectorTab === 'probes' && (
                <div className="space-y-2">
                  <div className="bg-[#0c162e] border border-slate-800 rounded-xl p-2.5">
                    <div className="text-[10px] font-mono text-sky-400">
                      {isHindi ? 'वायुमंडल (Atmosphere)' : 'Atmosphere'}
                    </div>
                    <div className="text-white font-semibold mt-0.5">
                      {focusedPlanetData.atmosphere}
                    </div>
                  </div>
                  <div className="bg-[#0c162e] border border-slate-800 rounded-xl p-2.5">
                    <div className="text-[10px] font-mono text-amber-400">
                      {isHindi ? 'रोचक वैज्ञानिक तथ्य' : 'Scientific Fact'}
                    </div>
                    <div className="text-slate-200 mt-0.5">
                      {focusedPlanetData.funFact}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Optional Spacecraft Flight Stick */}
        {showTouchPad &&
          activeNavTab === 'scope' &&
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
            BOTTOM DOCK: PLANET CAROUSEL + NATIVE ANDROID 4-TAB NAVIGATION BAR
           ================================================================= */}
        <div className="pointer-events-auto mt-auto flex flex-col">
          {/* Horizontal Thumb-Friendly Planet & Black Hole Carousel */}
          {activeNavTab === 'scope' && (
            <div className="flex items-center gap-1.5 overflow-x-auto px-3 py-2 bg-gradient-to-t from-[#050914] via-[#050914]/90 to-transparent">
              {SOLAR_SYSTEM_DATA.map((planet) => {
                const isSelected = focusPlanetId === planet.id;
                return (
                  <button
                    key={planet.id}
                    onClick={() => handleSelectPlanetInScope(planet.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition active:scale-95 cursor-pointer whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-md'
                        : 'bg-[#0b1428]/95 text-slate-200 border-slate-800'
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

              <button
                onClick={() => handleSelectPlanetInScope('blackhole')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition active:scale-95 cursor-pointer whitespace-nowrap shrink-0 ${
                  focusPlanetId === 'blackhole'
                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                    : 'bg-[#170f2e]/95 text-amber-300 border-purple-500/50'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-black border border-amber-400 shrink-0" />
                <span>{isHindi ? 'ब्लैक होल (Sgr A*)' : 'Black Hole'}</span>
              </button>
            </div>
          )}

          {/* NATIVE ANDROID BOTTOM NAVIGATION BAR */}
          <nav className="grid grid-cols-4 bg-[#060b18] border-t border-slate-800/90 px-2 py-1.5 shadow-2xl">
            <button
              onClick={() => {
                triggerAndroidHaptic(10);
                setActiveNavTab('scope');
              }}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl cursor-pointer transition ${
                activeNavTab === 'scope' && !telemetry.autoPilotActive
                  ? 'text-amber-400 font-bold'
                  : 'text-slate-400'
              }`}
            >
              <IconPlanetScope />
              <span className="text-[10px] font-display">
                {isHindi ? '3D सौर मंडल' : '3D Scope'}
              </span>
            </button>

            <button
              onClick={() => {
                triggerAndroidHaptic(12);
                setActiveNavTab('scope');
                setFocusPlanetId(null);
                setCameraMode('chase');
                canvasRef.current?.toggleAutoPilot();
              }}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl cursor-pointer transition ${
                telemetry.autoPilotActive
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400'
              }`}
            >
              <IconAutoTour />
              <span className="text-[10px] font-display">
                {telemetry.autoPilotActive
                  ? isHindi
                    ? 'यात्रा चालू'
                    : 'Touring...'
                  : isHindi
                    ? 'ऑटो यात्रा'
                    : 'Auto Tour'}
              </span>
            </button>

            <button
              onClick={() => {
                triggerAndroidHaptic(10);
                setActiveNavTab((p) => (p === 'atlas' ? 'scope' : 'atlas'));
              }}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl cursor-pointer transition ${
                activeNavTab === 'atlas'
                  ? 'text-sky-400 font-bold'
                  : 'text-slate-400'
              }`}
            >
              <IconAtlasBook />
              <span className="text-[10px] font-display">
                {isHindi ? 'ब्रह्मांड ज्ञान' : 'Encyclopedia'}
              </span>
            </button>

            <button
              onClick={() => {
                triggerAndroidHaptic(10);
                setActiveNavTab((p) => (p === 'quiz' ? 'scope' : 'quiz'));
              }}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl cursor-pointer transition ${
                activeNavTab === 'quiz'
                  ? 'text-amber-400 font-bold'
                  : 'text-slate-400'
              }`}
            >
              <IconQuizStar />
              <span className="text-[10px] font-display">
                {isHindi ? 'क्विज़ व सेटिंग' : 'Quiz & App'}
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* =====================================================================
          NATIVE ANDROID TAB 3 SHEET: COMPLETE UNIVERSE ENCYCLOPEDIA
         ===================================================================== */}
      {activeNavTab === 'atlas' && (
        <div className="fixed inset-x-0 top-0 bottom-14 z-30 bg-[#050a17] flex flex-col overflow-hidden text-white pointer-events-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#081024]">
            <div>
              <div className="text-[10px] font-mono text-amber-400">
                ISRO · NASA · JWST · EVENT HORIZON ENCYCLOPEDIA
              </div>
              <h2 className="font-display text-base sm:text-lg font-bold text-white">
                {isHindi
                  ? 'संपूर्ण ब्रह्मांड और खगोल विज्ञान ज्ञानकोश'
                  : 'Universe & Space Research Encyclopedia'}
              </h2>
            </div>

            <button
              onClick={() => setActiveNavTab('scope')}
              className="px-3.5 py-1.5 rounded-full bg-amber-400 text-slate-950 font-display font-bold text-xs cursor-pointer"
            >
              {isHindi ? '3D स्पेस में लौटें' : '3D View'}
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto px-4 py-2.5 border-b border-slate-800 bg-[#070d1e] shrink-0">
            {UNIVERSE_RESEARCH_ARTICLES.map((art) => (
              <button
                key={art.id}
                onClick={() => {
                  triggerAndroidHaptic(8);
                  setSelectedArticle(art);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-display font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedArticle.id === art.id
                    ? 'bg-sky-400 text-slate-950'
                    : 'bg-[#0f1b36] text-slate-300 border border-slate-800'
                }`}
              >
                {isHindi ? art.titleHi.split(':')[0] : art.titleEn.split(':')[0]}
              </button>
            ))}
          </div>

          <div className="overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start max-w-5xl mx-auto">
              <div className="lg:col-span-6 space-y-3">
                <div className="rounded-2xl overflow-hidden border border-slate-700 bg-black">
                  <img
                    src={selectedArticle.image}
                    alt={selectedArticle.titleEn}
                    className="w-full h-56 sm:h-68 object-cover"
                  />
                </div>

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

              <div className="lg:col-span-6 space-y-3">
                <div className="inline-block rounded-md bg-amber-400/15 border border-amber-400/50 px-2.5 py-0.5 text-[10px] font-mono text-amber-300">
                  {selectedArticle.badge}
                </div>

                <h3 className="font-display text-xl font-bold text-white leading-snug">
                  {isHindi ? selectedArticle.titleHi : selectedArticle.titleEn}
                </h3>

                <p className="text-sm text-slate-200 leading-relaxed bg-[#0c162d] border border-slate-800 rounded-xl p-3.5">
                  {isHindi
                    ? selectedArticle.summaryHi
                    : selectedArticle.summaryEn}
                </p>

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

                <div className="pt-1 flex flex-wrap gap-2">
                  {selectedArticle.id === 'black-holes-event-horizon' && (
                    <button
                      onClick={() => handleSelectPlanetInScope('blackhole')}
                      className="px-4 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-display font-bold text-xs cursor-pointer"
                    >
                      {isHindi
                        ? '3D ब्लैक होल (Sagittarius A*) देखें →'
                        : 'Inspect 3D Black Hole →'}
                    </button>
                  )}

                  {selectedArticle.targetPlanetId && (
                    <button
                      onClick={() =>
                        handleSelectPlanetInScope(
                          selectedArticle.targetPlanetId!
                        )
                      }
                      className="px-4 py-2.5 rounded-xl bg-sky-400 text-slate-950 font-display font-bold text-xs cursor-pointer"
                    >
                      {isHindi
                        ? '3D अंतरिक्ष में देखें →'
                        : 'View in 3D Space →'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          NATIVE ANDROID TAB 4 SHEET: COSMIC QUIZ, SPACECRAFT & APP SETTINGS
         ===================================================================== */}
      {activeNavTab === 'quiz' && (
        <div className="fixed inset-x-0 top-0 bottom-14 z-30 bg-[#050a17] flex flex-col overflow-hidden text-white pointer-events-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#081024]">
            <h2 className="font-display text-base sm:text-lg font-bold text-white">
              {isHindi
                ? 'ब्रह्मांड ज्ञान क्विज़, ISRO/NASA यान और सेटिंग्स'
                : 'Cosmic Quiz, Spacecraft & App Settings'}
            </h2>
            <button
              onClick={() => setActiveNavTab('scope')}
              className="px-3.5 py-1.5 rounded-full bg-amber-400 text-slate-950 font-display font-bold text-xs cursor-pointer"
            >
              {isHindi ? '3D स्पेस' : '3D View'}
            </button>
          </div>

          <div className="flex gap-1.5 px-4 py-2.5 bg-[#070d1e] border-b border-slate-800 shrink-0">
            {(
              [
                {
                  id: 'quiz',
                  label: isHindi
                    ? `ज्ञान क्विज़ (${quizScore}/${COSMIC_KNOWLEDGE_QUIZ.length})`
                    : `Quiz (${quizScore}/${COSMIC_KNOWLEDGE_QUIZ.length})`,
                },
                {
                  id: 'probes',
                  label: isHindi ? 'ISRO व NASA यान' : 'Spacecraft',
                },
                {
                  id: 'settings',
                  label: isHindi ? 'सेटिंग्स व 300MB APK' : 'Settings & 300MB APK',
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  triggerAndroidHaptic(8);
                  setKnowledgeTab(tab.id);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-display font-bold cursor-pointer ${
                  knowledgeTab === tab.id
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-[#0f1b36] text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="overflow-y-auto p-4 sm:p-6 max-w-3xl mx-auto w-full space-y-4">
            {knowledgeTab === 'quiz' && (
              <div className="bg-[#0c162e] border border-slate-800 rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-sky-400">
                  <span>
                    QUESTION {quizIndex + 1} / {COSMIC_KNOWLEDGE_QUIZ.length}
                  </span>
                  <span className="text-amber-300 font-bold">
                    SCORE: {quizScore}
                  </span>
                </div>

                <h3 className="font-display text-base sm:text-lg font-bold text-white">
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
                      'bg-[#081022] border-slate-700 text-slate-200';
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
                          triggerAndroidHaptic(15);
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
                          ? '✗ वैज्ञानिक व्याख्या:'
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
                      className="px-4 py-2 rounded-lg bg-amber-400 text-slate-950 font-display font-bold text-xs cursor-pointer"
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
                      onClick={() => handleSelectPlanetInScope(prb.hostPlanetId)}
                      className="w-full py-2 rounded-lg bg-sky-400/20 border border-sky-400/50 text-sky-200 font-display font-bold text-xs cursor-pointer"
                    >
                      {isHindi ? '3D कक्षा में देखें →' : 'Locate in 3D Orbit →'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {knowledgeTab === 'settings' && (
              <div className="space-y-3 bg-[#0c162e] border border-slate-800 rounded-2xl p-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-bold">
                    {t.graphicsQuality}:
                  </span>
                  <div className="flex gap-1.5">
                    {(
                      ['ultra', 'high', 'saver'] as GraphicsQualityMode[]
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

                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-bold">
                    {isHindi ? 'ध्वनि (Space Audio):' : 'Space Audio:'}
                  </span>
                  <button
                    onClick={handleToggleMute}
                    className="px-4 py-1.5 rounded-lg bg-slate-800 text-amber-300 font-mono cursor-pointer"
                  >
                    {isMuted ? t.audioMuted : t.audioActive}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-bold">
                    {isHindi ? 'स्पेसक्राफ्ट जॉयस्टिक:' : 'Spacecraft Flight Stick:'}
                  </span>
                  <button
                    onClick={() => setShowTouchPad((p) => !p)}
                    className="px-4 py-1.5 rounded-lg bg-slate-800 text-sky-300 font-mono cursor-pointer"
                  >
                    {showTouchPad ? 'ON' : 'OFF (360° Touch)'}
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setShowUpdateModal(true)}
                    className="w-full py-2.5 rounded-xl bg-emerald-400 text-slate-950 font-display font-bold text-xs cursor-pointer"
                  >
                    {isHindi
                      ? '📦 300 MB Native Android APK पैक व डाउनलोड खोलें'
                      : '📦 Open 300 MB Native Android APK Pack & Download'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 300MB Single-APK Download & Offline Pack Modal */}
      <UpdateAndApkModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        langCode={langCode}
      />
    </div>
  );
}
