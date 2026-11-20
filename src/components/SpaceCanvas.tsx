import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  SOLAR_SYSTEM_DATA,
  BUILDABLE_STRUCTURES,
  STARSHIP_UPGRADES,
  SPACE_MISSIONS,
  SPACE_PROBES,
  DEEP_SPACE_GALAXIES,
  DeepSpaceGalaxyObject,
  PlanetData,
} from '../data/solarSystemData';
import {
  FAMOUS_STARS_CATALOG,
  FamousStarData,
} from '../data/famousStarsData';
import {
  createPlanetTexture,
  createPlanetBumpTexture,
  createCloudLayerTexture,
  createRingTexture,
  createAccretionDiskTexture,
  createAtmosphereFresnelMaterial,
  createMilkyWayPanoramaTexture,
  createSunGlowSpriteTexture,
} from '../three/proceduralTextures';
import {
  createPlayerStarship,
  createPirateInterceptor,
  createOrbitalStructureModel,
  createCometModel,
  createWormholeGateModel,
  createSpaceProbeModel,
} from '../three/proceduralModels';
import { soundEngine } from '../audio/soundEngine';
import { TouchInputState, RadarBlip } from './MobileTouchAndRadar';
import { tryLoadOfflinePlanetTexture } from '../services/spaceAudioAndPacks';

export type GameStateMode = 'title' | 'playing' | 'paused' | 'victory' | 'gameover';
export type CameraViewMode = 'chase' | 'cockpit' | 'overview';
export type GraphicsQualityMode = 'ultra' | 'high' | 'auto' | 'saver';

export interface BuiltOutpostInfo {
  id: string;
  planetId: string;
  planetName: string;
  type: 'turret' | 'extractor' | 'station';
}

export interface ShipUpgradeLevels {
  laser: number;
  engine: number;
  hull: number;
  shield: number;
  tractor: number;
}

export interface ProjectedCelestialLabel {
  id: string;
  name: string;
  hindiName: string;
  color: string;
  x: number; // percentage 0..100
  y: number; // percentage 0..100
  visible: boolean;
  distKm: string;
  category?: 'planet' | 'blackhole' | 'probe' | 'galaxy' | 'star';
}

export interface HudTelemetry {
  hull: number;
  maxHull: number;
  shield: number;
  maxShield: number;
  boostEnergy: number;
  missileReadyPct: number;
  score: number;
  crystals: number;
  titanium: number;
  speed: number;
  fps: number;
  shipYaw: number;
  autoPilotActive: boolean;
  autoPilotTargetName: string | null;
  nearestPlanet: PlanetData;
  nearestDistance: number;
  scannedPlanets: string[];
  discoveredProbes: string[];
  builtOutposts: BuiltOutpostInfo[];
  piratesDestroyed: number;
  asteroidsMined: number;
  waveNumber: number;
  activeAlert: string | null;
  upgrades: ShipUpgradeLevels;
  completedMissions: string[];
  radarBlips: RadarBlip[];
  projectedLabels?: ProjectedCelestialLabel[];
  voyageActive?: boolean;
  voyageProgressPct?: number;
  voyageElapsedSec?: number;
  voyageSpeedMultiplier?: number;
  cosmicZoneEn?: string;
  cosmicZoneHi?: string;
  cosmicDistanceLabel?: string;
}

export interface SpaceCanvasHandle {
  warpToPlanet: (planetId: string) => void;
  warpToBlackHole: () => void;
  startGalaxyExitVoyage: () => void;
  stopGalaxyExitVoyage: () => void;
  toggleVoyageFastForward: () => void;
  buildStructureNearPlanet: (type: 'turret' | 'extractor' | 'station') => boolean;
  upgradeShipSystem: (id: keyof ShipUpgradeLevels) => boolean;
  fireHomingMissile: () => void;
  toggleAutoPilot: () => void;
  resetMission: () => void;
  scanNearestPlanet: () => void;
  exportSaveJson: () => string;
  resetAllSavedData: () => void;
}

interface SpaceCanvasProps {
  gameState: GameStateMode;
  cameraMode: CameraViewMode;
  graphicsQuality: GraphicsQualityMode;
  timeScale: number;
  focusPlanetId?: string | null;
  showCoreCutaway?: boolean;
  showStarSunComparison?: boolean;
  touchInputRef: React.MutableRefObject<TouchInputState>;
  onTelemetryUpdate: (telemetry: HudTelemetry) => void;
  onGameEnd: (result: 'victory' | 'gameover') => void;
  onSelectPlanetCodex: (planet: PlanetData) => void;
  onSelectStarId?: (starId: string) => void;
}

const SAVE_STORAGE_KEY = 'astral_odyssey_save_v2';

// Pre-allocated module-scope math objects (100% Zero GC in render loop)
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _vec3C = new THREE.Vector3();
const _vec3D = new THREE.Vector3();
const _vec3CamTarget = new THREE.Vector3();
const _vec3LookAt = new THREE.Vector3();
const _mat4 = new THREE.Matrix4();
const _quat = new THREE.Quaternion();
const _euler = new THREE.Euler();
const _scale = new THREE.Vector3();
const _color = new THREE.Color();

export const SpaceCanvas = forwardRef<SpaceCanvasHandle, SpaceCanvasProps>(
  (
    {
      gameState,
      cameraMode,
      graphicsQuality,
      timeScale,
      focusPlanetId = null,
      showCoreCutaway = false,
      showStarSunComparison = false,
      touchInputRef,
      onTelemetryUpdate,
      onGameEnd,
      onSelectPlanetCodex,
      onSelectStarId,
    },
    ref
  ) => {
    const canvasMountRef = useRef<HTMLDivElement>(null);

    const gameStateRef = useRef<GameStateMode>(gameState);
    const cameraModeRef = useRef<CameraViewMode>(cameraMode);
    const graphicsQualityRef = useRef<GraphicsQualityMode>(graphicsQuality);
    const timeScaleRef = useRef<number>(timeScale);
    const focusPlanetIdRef = useRef<string | null>(focusPlanetId);
    const showCoreCutawayRef = useRef<boolean>(showCoreCutaway);
    const showStarSunComparisonRef = useRef<boolean>(showStarSunComparison);
    const onTelemetryRef = useRef(onTelemetryUpdate);
    const onGameEndRef = useRef(onGameEnd);
    const onSelectPlanetRef = useRef(onSelectPlanetCodex);
    const onSelectStarIdRef = useRef(onSelectStarId);

    useEffect(() => {
      gameStateRef.current = gameState;
    }, [gameState]);
    useEffect(() => {
      cameraModeRef.current = cameraMode;
    }, [cameraMode]);
    useEffect(() => {
      graphicsQualityRef.current = graphicsQuality;
    }, [graphicsQuality]);
    useEffect(() => {
      timeScaleRef.current = timeScale;
    }, [timeScale]);
    useEffect(() => {
      focusPlanetIdRef.current = focusPlanetId ?? null;
    }, [focusPlanetId]);
    useEffect(() => {
      showCoreCutawayRef.current = Boolean(showCoreCutaway);
    }, [showCoreCutaway]);
    useEffect(() => {
      showStarSunComparisonRef.current = Boolean(showStarSunComparison);
    }, [showStarSunComparison]);
    useEffect(() => {
      onTelemetryRef.current = onTelemetryUpdate;
    }, [onTelemetryUpdate]);
    useEffect(() => {
      onGameEndRef.current = onGameEnd;
    }, [onGameEnd]);
    useEffect(() => {
      onSelectPlanetRef.current = onSelectPlanetCodex;
    }, [onSelectPlanetCodex]);
    useEffect(() => {
      onSelectStarIdRef.current = onSelectStarId;
    }, [onSelectStarId]);

    const actionsRef = useRef<SpaceCanvasHandle>({
      warpToPlanet: () => {},
      warpToBlackHole: () => {},
      startGalaxyExitVoyage: () => {},
      stopGalaxyExitVoyage: () => {},
      toggleVoyageFastForward: () => {},
      buildStructureNearPlanet: () => false,
      upgradeShipSystem: () => false,
      fireHomingMissile: () => {},
      toggleAutoPilot: () => {},
      resetMission: () => {},
      scanNearestPlanet: () => {},
      exportSaveJson: () => '{}',
      resetAllSavedData: () => {},
    });

    useImperativeHandle(ref, () => ({
      warpToPlanet: (id: string) => actionsRef.current.warpToPlanet(id),
      warpToBlackHole: () => actionsRef.current.warpToBlackHole(),
      startGalaxyExitVoyage: () => actionsRef.current.startGalaxyExitVoyage(),
      stopGalaxyExitVoyage: () => actionsRef.current.stopGalaxyExitVoyage(),
      toggleVoyageFastForward: () => actionsRef.current.toggleVoyageFastForward(),
      buildStructureNearPlanet: (type) =>
        actionsRef.current.buildStructureNearPlanet(type),
      upgradeShipSystem: (id) => actionsRef.current.upgradeShipSystem(id),
      fireHomingMissile: () => actionsRef.current.fireHomingMissile(),
      toggleAutoPilot: () => actionsRef.current.toggleAutoPilot(),
      resetMission: () => actionsRef.current.resetMission(),
      scanNearestPlanet: () => actionsRef.current.scanNearestPlanet(),
      exportSaveJson: () => actionsRef.current.exportSaveJson(),
      resetAllSavedData: () => actionsRef.current.resetAllSavedData(),
    }));

    useEffect(() => {
      const container = canvasMountRef.current;
      if (!container) return;

      // 1. Detect software WebGL (SwiftShader, llvmpipe, WARP)
      const isSoftwareGl = (() => {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      })();

      const isMobileDevice =
        typeof window !== 'undefined' &&
        ('ontouchstart' in window ||
          navigator.maxTouchPoints > 0 ||
          window.innerWidth < 900);

      const renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl && !isMobileDevice,
        powerPreference: 'high-performance',
      });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      const basePixelRatio = isSoftwareGl
        ? 1
        : isMobileDevice
          ? Math.min(window.devicePixelRatio || 1, 1.25)
          : Math.min(window.devicePixelRatio || 1, 1.65);
      renderer.setPixelRatio(basePixelRatio);
      renderer.shadowMap.enabled = false;
      renderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(renderer.domElement);

      const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

      // 2. Scene & 360° Milky Way Galactic Panorama Skybox (Solar System Scope Signature Look)
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x02040a);

      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      const envRT = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
      pmremGenerator.dispose();

      const skyboxGeo = new THREE.SphereGeometry(28000, 48, 32);
      const skyboxTex = createMilkyWayPanoramaTexture();
      const skyboxMat = new THREE.MeshBasicMaterial({
        map: skyboxTex,
        side: THREE.BackSide,
        depthWrite: false,
      });
      const skyboxMesh = new THREE.Mesh(skyboxGeo, skyboxMat);
      skyboxMesh.rotation.z = 0.28;
      scene.add(skyboxMesh);

      // 2B. Astronomical Constellation Lines Overlay across the Celestial Sphere
      const constellationGroup = new THREE.Group();
      const constLineMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.26,
      });
      const constStarMat = new THREE.MeshBasicMaterial({ color: 0xbae6fd });
      const constStarGeo = new THREE.OctahedronGeometry(2.8, 0);

      // Famous Constellations (Azimuth/Elevation spherical coordinates on r=1380 dome)
      const CONSTELLATIONS: [number, number][][] = [
        // Ursa Major (Saptarishi / Big Dipper)
        [
          [0.4, 0.55],
          [0.52, 0.58],
          [0.62, 0.52],
          [0.74, 0.48],
          [0.76, 0.36],
          [0.9, 0.38],
          [0.88, 0.5],
          [0.74, 0.48],
        ],
        // Orion (The Hunter / Mriga)
        [
          [1.65, 0.25],
          [1.78, 0.22],
          [1.74, 0.05],
          [1.71, 0.04],
          [1.68, 0.03],
          [1.64, -0.15],
          [1.8, -0.14],
          [1.74, 0.05],
        ],
        // Cassiopeia (W-Shape)
        [
          [2.55, 0.62],
          [2.68, 0.52],
          [2.78, 0.58],
          [2.9, 0.48],
          [3.02, 0.59],
        ],
        // Scorpius (Vrischika)
        [
          [3.8, -0.12],
          [3.9, -0.18],
          [4.02, -0.28],
          [4.12, -0.42],
          [4.24, -0.45],
          [4.32, -0.36],
        ],
        // Cygnus (Northern Cross)
        [
          [4.95, 0.48],
          [5.1, 0.35],
          [5.25, 0.22],
          [5.1, 0.35],
          [4.98, 0.24],
          [5.22, 0.46],
        ],
        // Leo (Simha)
        [
          [5.75, 0.18],
          [5.88, 0.28],
          [5.98, 0.25],
          [5.95, 0.12],
          [6.15, 0.08],
          [6.22, 0.19],
          [5.95, 0.12],
        ],
      ];

      CONSTELLATIONS.forEach((chain) => {
        const pts: THREE.Vector3[] = [];
        chain.forEach(([az, el]) => {
          const r = 1380;
          const v = new THREE.Vector3(
            r * Math.cos(el) * Math.cos(az),
            r * Math.sin(el),
            r * Math.cos(el) * Math.sin(az)
          );
          pts.push(v);
          const sMesh = new THREE.Mesh(constStarGeo, constStarMat);
          sMesh.position.copy(v);
          constellationGroup.add(sMesh);
        });
        const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
        constellationGroup.add(new THREE.Line(lineGeo, constLineMat));
      });
      scene.add(constellationGroup);

      // 2C. Solar System Scope Ecliptic Polar Grid (Concentric AU Rings + 12 Radial Sector Lines)
      const eclipticGridGroup = new THREE.Group();
      eclipticGridGroup.position.y = -0.35;
      const gridLineMat = new THREE.LineBasicMaterial({
        color: 0x1e3a8a,
        transparent: true,
        opacity: 0.28,
      });
      [50, 100, 150, 200, 250, 300, 350, 400].forEach((r) => {
        const pts: THREE.Vector3[] = [];
        for (let s = 0; s <= 96; s++) {
          const a = (s / 96) * Math.PI * 2;
          pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
        }
        const gGeo = new THREE.BufferGeometry().setFromPoints(pts);
        eclipticGridGroup.add(new THREE.Line(gGeo, gridLineMat));
      });
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const rayPts = [
          new THREE.Vector3(Math.cos(a) * 28, 0, Math.sin(a) * 28),
          new THREE.Vector3(Math.cos(a) * 400, 0, Math.sin(a) * 400),
        ];
        const rGeo = new THREE.BufferGeometry().setFromPoints(rayPts);
        eclipticGridGroup.add(new THREE.Line(rGeo, gridLineMat));
      }
      scene.add(eclipticGridGroup);

      // 3. Camera (Extended 42,000-unit Far Plane for Interstellar Stars -> Milky Way Exit -> Observable Universe!)
      const camera = new THREE.PerspectiveCamera(
        56,
        container.clientWidth / container.clientHeight,
        0.5,
        42000
      );
      camera.position.set(0, 48, 135);

      // 4. True Solar Point-Light Illumination (Dramatic Day/Night Planetary Terminator!)
      const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x050814, 0.22);
      scene.add(hemiLight);

      const sunLight = new THREE.PointLight(0xfff7ed, 4.8, 1450, 0.18);
      sunLight.position.set(0, 0, 0);
      scene.add(sunLight);

      const dirKeyLight = new THREE.DirectionalLight(0xfef08a, 0.25);
      dirKeyLight.position.set(0, 90, 0);
      scene.add(dirKeyLight);

      // 5. Starfield InstancedMesh (1,500 stars across deep space)
      const starCount = 1500;
      const starGeo = new THREE.OctahedronGeometry(0.45, 0);
      const starMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const starInstanced = new THREE.InstancedMesh(starGeo, starMat, starCount);
      const starColors = [0xffffff, 0xbae6fd, 0xfef08a, 0xfde68a, 0xc7d2fe];

      for (let i = 0; i < starCount; i++) {
        const r = 440 + Math.random() * 540;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        _vec3A.set(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta) * 0.65,
          r * Math.cos(phi)
        );
        const s = 0.5 + Math.random() * 1.8;
        _scale.set(s, s, s);
        _quat.identity();
        _mat4.compose(_vec3A, _quat, _scale);
        starInstanced.setMatrixAt(i, _mat4);
        _color.setHex(starColors[i % starColors.length]);
        starInstanced.setColorAt(i, _color);
      }
      starInstanced.instanceMatrix.needsUpdate = true;
      if (starInstanced.instanceColor) starInstanced.instanceColor.needsUpdate = true;
      starInstanced.computeBoundingSphere();
      scene.add(starInstanced);

      // 5B. Cosmic Nebulae Dust Field (Ultra High Graphics volumetric atmosphere)
      const nebulaCount = 200;
      const nebulaGeo = new THREE.DodecahedronGeometry(22, 1);
      const nebulaMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const nebulaInstanced = new THREE.InstancedMesh(nebulaGeo, nebulaMat, nebulaCount);
      const nebulaPalette = [0x7c3aed, 0x06b6d4, 0x3b82f6, 0xf59e0b, 0xec4899];
      for (let i = 0; i < nebulaCount; i++) {
        const r = 320 + Math.random() * 450;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        _vec3A.set(
          r * Math.sin(phi) * Math.cos(theta),
          (Math.random() - 0.5) * 160,
          r * Math.cos(phi)
        );
        const s = 1.0 + Math.random() * 2.2;
        _scale.set(s, s * 0.7, s);
        _euler.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        _quat.setFromEuler(_euler);
        _mat4.compose(_vec3A, _quat, _scale);
        nebulaInstanced.setMatrixAt(i, _mat4);
        _color.setHex(nebulaPalette[i % nebulaPalette.length]);
        nebulaInstanced.setColorAt(i, _color);
      }
      nebulaInstanced.instanceMatrix.needsUpdate = true;
      if (nebulaInstanced.instanceColor) nebulaInstanced.instanceColor.needsUpdate = true;
      nebulaInstanced.computeBoundingSphere();
      scene.add(nebulaInstanced);

      // 6. Build the Solar System (Sun + 9 Planets/Dwarf Planets + Moons + Orbit Rings)
      interface PlanetRuntime {
        data: PlanetData;
        rootGroup: THREE.Group;
        mesh: THREE.Mesh;
        coreGroup: THREE.Group;
        angle: number;
        moons: { mesh: THREE.Mesh; angle: number; dist: number; speed: number }[];
        scannerRing: THREE.Mesh;
      }

      const planetsRuntime: PlanetRuntime[] = [];
      let sunCoronaMesh: THREE.Mesh | null = null;
      let sunOuterCoronaMesh: THREE.Mesh | null = null;
      let earthCloudMesh: THREE.Mesh | null = null;

      const atmoColorMap: Record<string, number> = {
        mercury: 0x94a3b8,
        venus: 0xfbbf24,
        earth: 0x38bdf8,
        mars: 0xf97316,
        jupiter: 0xfde68a,
        saturn: 0xfef08a,
        uranus: 0x22d3ee,
        neptune: 0x3b82f6,
        pluto: 0xd6d3d1,
      };

      SOLAR_SYSTEM_DATA.forEach((pData, idx) => {
        const rootGroup = new THREE.Group();
        scene.add(rootGroup);

        if (pData.orbitRadius > 0) {
          // Crisp Glowing Solar System Scope Orbit Line
          const orbitPts: THREE.Vector3[] = [];
          const segs = 180;
          for (let s = 0; s <= segs; s++) {
            const a = (s / segs) * Math.PI * 2;
            orbitPts.push(
              new THREE.Vector3(
                Math.cos(a) * pData.orbitRadius,
                0,
                Math.sin(a) * pData.orbitRadius
              )
            );
          }
          const orbitLineGeo = new THREE.BufferGeometry().setFromPoints(orbitPts);
          const orbitLineMat = new THREE.LineBasicMaterial({
            color: pData.color,
            transparent: true,
            opacity: 0.52,
          });
          scene.add(new THREE.Line(orbitLineGeo, orbitLineMat));
        }

        const tex = createPlanetTexture(pData.id, maxAnisotropy);
        const geo = new THREE.SphereGeometry(pData.radius, 48, 36);

        let mat: THREE.Material;
        if (pData.id === 'sun') {
          mat = new THREE.MeshBasicMaterial({ map: tex });
          const coronaGeo = new THREE.SphereGeometry(pData.radius * 1.16, 40, 28);
          const coronaMat = createAtmosphereFresnelMaterial(0xf59e0b, 1.65, 2.0);
          sunCoronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
          rootGroup.add(sunCoronaMesh);

          const outerCoronaGeo = new THREE.SphereGeometry(pData.radius * 1.38, 40, 28);
          const outerCoronaMat = createAtmosphereFresnelMaterial(0xea580c, 0.95, 2.8);
          sunOuterCoronaMesh = new THREE.Mesh(outerCoronaGeo, outerCoronaMat);
          rootGroup.add(sunOuterCoronaMesh);

          // Volumetric Solar Lens Flare & Starburst Sprite (Solar System Scope Signature)
          const sunFlareTex = createSunGlowSpriteTexture();
          const sunFlareMat = new THREE.SpriteMaterial({
            map: sunFlareTex,
            color: 0xfef08a,
            transparent: true,
            opacity: 0.92,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          });
          const sunFlareSprite = new THREE.Sprite(sunFlareMat);
          sunFlareSprite.scale.set(pData.radius * 5.2, pData.radius * 5.2, 1);
          rootGroup.add(sunFlareSprite);
        } else {
          const bumpTex = createPlanetBumpTexture(pData.id, maxAnisotropy);
          mat = new THREE.MeshStandardMaterial({
            map: tex,
            bumpMap: bumpTex,
            bumpScale: pData.type.includes('Gas') ? 0.08 : 0.38,
            roughness: pData.type.includes('Gas') ? 0.55 : 0.68,
            metalness: pData.id === 'mercury' ? 0.32 : 0.1,
            transparent: true,
            opacity: 1.0,
          });

          // Custom GLSL Fresnel Atmospheric Rim Halo on Every Planet
          const atmoHex = atmoColorMap[pData.id] || 0x38bdf8;
          const atmoGeo = new THREE.SphereGeometry(
            pData.radius * (pData.id === 'earth' || pData.id === 'venus' ? 1.065 : 1.045),
            48,
            36
          );
          const atmoMat = createAtmosphereFresnelMaterial(
            atmoHex,
            pData.id === 'earth' ? 1.35 : 0.95,
            3.1
          );
          rootGroup.add(new THREE.Mesh(atmoGeo, atmoMat));

          if (pData.id === 'earth') {
            const cloudGeo = new THREE.SphereGeometry(pData.radius * 1.018, 48, 36);
            const cloudTex = createCloudLayerTexture(maxAnisotropy);
            const cloudMat = new THREE.MeshStandardMaterial({
              map: cloudTex,
              transparent: true,
              opacity: 0.84,
              depthWrite: false,
              roughness: 0.9,
            });
            earthCloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
            rootGroup.add(earthCloudMesh);
          }
        }

        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.z = pData.tilt;
        mesh.castShadow = pData.id !== 'sun';
        mesh.receiveShadow = pData.id !== 'sun';
        rootGroup.add(mesh);

        // True 3/4 Sliced Quarter-Wedge 3D Core Cutaway Group (Works on ALL worlds including the Sun!)
        const coreGroup = new THREE.Group();
        coreGroup.visible = false;

        // 1. 270-degree (3/4) Outer Cutaway Shell so a clean 90-degree wedge is open
        const cutawayShellGeo = new THREE.SphereGeometry(
          pData.radius * 0.995,
          48,
          36,
          0,
          Math.PI * 1.5,
          0,
          Math.PI
        );
        const cutawayShellMat =
          pData.id === 'sun'
            ? new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })
            : new THREE.MeshStandardMaterial({
                map: tex,
                roughness: 0.65,
                metalness: 0.15,
                side: THREE.DoubleSide,
              });
        coreGroup.add(new THREE.Mesh(cutawayShellGeo, cutawayShellMat));

        // Automatically upgrade planet texture from bundled ~300MB offline NASA / 2048x1024 RGBA8 packs when available
        void tryLoadOfflinePlanetTexture(pData.id, (offlineTex) => {
          offlineTex.anisotropy = maxAnisotropy;
          (mat as THREE.MeshStandardMaterial | THREE.MeshBasicMaterial).map = offlineTex;
          mat.needsUpdate = true;
          (cutawayShellMat as THREE.MeshStandardMaterial | THREE.MeshBasicMaterial).map = offlineTex;
          cutawayShellMat.needsUpdate = true;
        });

        // 2. Solid Concentric Interior Layers (Mantle / Radiative Zone, Outer Core, Inner Core)
        const mantleColor =
          pData.id === 'sun'
            ? 0xea580c
            : pData.id === 'uranus' || pData.id === 'neptune'
              ? 0x0284c7
              : 0xc2410c;
        const outerCoreColor =
          pData.id === 'sun'
            ? 0xf59e0b
            : pData.id === 'uranus' || pData.id === 'neptune'
              ? 0x38bdf8
              : 0xf97316;
        const innerCoreColor = 0xfef08a;

        // Mantle / Convective Sphere (with slightly wider wedge cutaway)
        const mantleGeo = new THREE.SphereGeometry(
          pData.radius * 0.82,
          40,
          30,
          0.12,
          Math.PI * 1.65,
          0,
          Math.PI
        );
        const mantleMat = new THREE.MeshBasicMaterial({
          color: mantleColor,
          side: THREE.DoubleSide,
        });
        coreGroup.add(new THREE.Mesh(mantleGeo, mantleMat));

        // Liquid Outer Core / Radiative Zone Sphere
        const outerCoreGeo = new THREE.SphereGeometry(
          pData.radius * 0.56,
          36,
          28,
          0.25,
          Math.PI * 1.8,
          0,
          Math.PI
        );
        const outerCoreMat = new THREE.MeshBasicMaterial({
          color: outerCoreColor,
          side: THREE.DoubleSide,
        });
        coreGroup.add(new THREE.Mesh(outerCoreGeo, outerCoreMat));

        // Solid Glowing Inner Core (Full sphere in the center!)
        const innerCoreGeo = new THREE.SphereGeometry(pData.radius * 0.31, 32, 24);
        const innerCoreMat = new THREE.MeshBasicMaterial({
          color: innerCoreColor,
        });
        coreGroup.add(new THREE.Mesh(innerCoreGeo, innerCoreMat));

        rootGroup.add(coreGroup);

        if (pData.hasRings && pData.ringInnerRadius && pData.ringOuterRadius) {
          const rGeo = new THREE.RingGeometry(
            pData.ringInnerRadius,
            pData.ringOuterRadius,
            64
          );
          rGeo.rotateX(-Math.PI / 2);
          const rTex = createRingTexture(pData.id === 'saturn', maxAnisotropy);
          const rMat = new THREE.MeshStandardMaterial({
            map: rTex,
            side: THREE.DoubleSide,
            transparent: true,
            roughness: 0.5,
            metalness: 0.2,
            depthWrite: false,
          });
          const rMesh = new THREE.Mesh(rGeo, rMat);
          rMesh.rotation.z = pData.tilt * 0.6;
          rootGroup.add(rMesh);
        }

        const scanGeo = new THREE.RingGeometry(
          pData.radius + 1.4,
          pData.radius + 1.85,
          48
        );
        scanGeo.rotateX(-Math.PI / 2);
        const scanMat = new THREE.MeshBasicMaterial({
          color: pData.accentColor,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.35,
          depthWrite: false,
        });
        const scannerRing = new THREE.Mesh(scanGeo, scanMat);
        scannerRing.position.y = -0.1;
        rootGroup.add(scannerRing);

        const moonsRuntime: {
          mesh: THREE.Mesh;
          angle: number;
          dist: number;
          speed: number;
        }[] = [];
        if (pData.moons) {
          pData.moons.forEach((m, mIdx) => {
            // Subtle Moon Orbit Line around parent planet
            const mOrbitPts: THREE.Vector3[] = [];
            for (let s = 0; s <= 64; s++) {
              const a = (s / 64) * Math.PI * 2;
              mOrbitPts.push(
                new THREE.Vector3(
                  Math.cos(a) * m.distance,
                  0,
                  Math.sin(a) * m.distance
                )
              );
            }
            const mOrbitGeo = new THREE.BufferGeometry().setFromPoints(mOrbitPts);
            const mOrbitMat = new THREE.LineBasicMaterial({
              color: 0x64748b,
              transparent: true,
              opacity: 0.35,
            });
            rootGroup.add(new THREE.Line(mOrbitGeo, mOrbitMat));

            const mGeo = new THREE.SphereGeometry(m.radius, 18, 14);
            const mMat = new THREE.MeshStandardMaterial({
              color: m.color,
              roughness: 0.78,
              metalness: 0.12,
            });
            const mMesh = new THREE.Mesh(mGeo, mMat);
            const startAngle = mIdx * 2.1;
            mMesh.position.set(
              Math.cos(startAngle) * m.distance,
              0,
              Math.sin(startAngle) * m.distance
            );
            rootGroup.add(mMesh);
            moonsRuntime.push({
              mesh: mMesh,
              angle: startAngle,
              dist: m.distance,
              speed: m.speed,
            });
          });
        }

        const startAngle = idx === 3 ? 0.6 : idx * 1.15;
        if (pData.orbitRadius > 0) {
          rootGroup.position.set(
            Math.cos(startAngle) * pData.orbitRadius,
            0,
            Math.sin(startAngle) * pData.orbitRadius
          );
        }

        planetsRuntime.push({
          data: pData,
          rootGroup,
          mesh,
          coreGroup,
          angle: startAngle,
          moons: moonsRuntime,
          scannerRing,
        });
      });

      // 6B. Halley's Comet, Dual Wormhole Gates, and Famous ISRO/NASA Space Probes
      const cometGroup = createCometModel();
      scene.add(cometGroup);
      let cometAngle = 0.8;

      const innerWormhole = createWormholeGateModel();
      innerWormhole.group.position.set(-125, 0, -45);
      scene.add(innerWormhole.group);

      const outerWormhole = createWormholeGateModel();
      outerWormhole.group.position.set(295, 0, -185);
      scene.add(outerWormhole.group);
      let wormholeCooldown = 0;

      // 6C. 3D Supermassive Black Hole ("Sagittarius A* / Gargantua") in Deep Space
      const blackHoleGroup = new THREE.Group();
      blackHoleGroup.position.set(-260, 0, -240);
      scene.add(blackHoleGroup);

      const bhHorizonGeo = new THREE.SphereGeometry(11, 40, 32);
      const bhHorizonMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      blackHoleGroup.add(new THREE.Mesh(bhHorizonGeo, bhHorizonMat));

      const bhAccretionTex = createAccretionDiskTexture(maxAnisotropy);
      const bhDiskGeo = new THREE.RingGeometry(11.4, 38, 64);
      bhDiskGeo.rotateX(-Math.PI / 2);
      const bhDiskMat = new THREE.MeshBasicMaterial({
        map: bhAccretionTex,
        side: THREE.DoubleSide,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const bhAccretionDisk = new THREE.Mesh(bhDiskGeo, bhDiskMat);
      bhAccretionDisk.rotation.z = 0.22;
      blackHoleGroup.add(bhAccretionDisk);

      const bhLensingGeo = new THREE.RingGeometry(11.2, 20.5, 64);
      const bhLensingMat = new THREE.MeshBasicMaterial({
        map: bhAccretionTex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const bhLensingRing = new THREE.Mesh(bhLensingGeo, bhLensingMat);
      blackHoleGroup.add(bhLensingRing);

      interface ProbeRuntime {
        info: (typeof SPACE_PROBES)[number];
        group: THREE.Group;
        hostPlanetIndex: number;
        orbitAngle: number;
      }
      const probesRuntime: ProbeRuntime[] = [];
      SPACE_PROBES.forEach((probeInfo, idx) => {
        const hostIdx = Math.max(
          0,
          planetsRuntime.findIndex((p) => p.data.id === probeInfo.hostPlanetId)
        );
        const group = createSpaceProbeModel();
        scene.add(group);
        probesRuntime.push({
          info: probeInfo,
          group,
          hostPlanetIndex: hostIdx,
          orbitAngle: idx * 1.15,
        });
      });

      // 6D. 3D Deep-Space Galaxies, Nebulae, Superclusters & CMB Horizon (Visible when zooming out with 2 fingers or warping!)
      interface GalaxyRuntime {
        data: DeepSpaceGalaxyObject;
        group: THREE.Group;
        diskMesh: THREE.Mesh;
        coreMesh: THREE.Mesh;
      }
      const galaxiesRuntime: GalaxyRuntime[] = [];
      const sharedGalaxyGlowTex = createSunGlowSpriteTexture();

      DEEP_SPACE_GALAXIES.forEach((gData, gIdx) => {
        const gGroup = new THREE.Group();
        gGroup.position.set(
          gData.position3D[0],
          gData.position3D[1],
          gData.position3D[2]
        );

        // Luminous Galactic Core / Star Cluster Bulge
        const coreGeo = new THREE.SphereGeometry(
          Math.max(5, gData.scale3D * 0.16),
          24,
          20
        );
        const coreMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(gData.secondaryColor),
        });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        gGroup.add(coreMesh);

        // Glowing Spiral Disk / Accretion / Nebula Structure
        const diskGeo = new THREE.RingGeometry(
          Math.max(5.5, gData.scale3D * 0.14),
          gData.scale3D,
          64
        );
        diskGeo.rotateX(-Math.PI / 2);
        const diskMat = new THREE.MeshBasicMaterial({
          map: bhAccretionTex,
          color: new THREE.Color(gData.color),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.88,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const diskMesh = new THREE.Mesh(diskGeo, diskMat);
        diskMesh.rotation.z = gIdx * 0.45;
        diskMesh.rotation.x = 0.28 + (gIdx % 3) * 0.18;
        gGroup.add(diskMesh);

        // Volumetric Galactic Halo Sprite
        const haloMat = new THREE.SpriteMaterial({
          map: sharedGalaxyGlowTex,
          color: new THREE.Color(gData.color),
          transparent: true,
          opacity: 0.72,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const haloSprite = new THREE.Sprite(haloMat);
        haloSprite.scale.set(gData.scale3D * 2.3, gData.scale3D * 2.3, 1);
        gGroup.add(haloSprite);

        // Special Relativistic Bipolar Plasma Jet for M87* Supergiant Galaxy
        if (gData.id === 'm87-virgo') {
          const jetGeo = new THREE.CylinderGeometry(1.2, 8.5, gData.scale3D * 2.2, 16, 1, true);
          const jetMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.65,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false,
          });
          const jetMesh = new THREE.Mesh(jetGeo, jetMat);
          jetMesh.rotation.z = 0.42;
          gGroup.add(jetMesh);
        }

        // Special Cosmic Web Filaments for Laniakea Supercluster
        if (gData.id === 'laniakea-supercluster') {
          const webMat = new THREE.LineBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.55,
          });
          for (let f = 0; f < 16; f++) {
            const pts: THREE.Vector3[] = [new THREE.Vector3(0, 0, 0)];
            const angle = (f / 16) * Math.PI * 2;
            const elev = ((f % 5) - 2) * 0.25;
            for (let step = 1; step <= 5; step++) {
              const r = (step / 5) * gData.scale3D;
              pts.push(
                new THREE.Vector3(
                  Math.cos(angle + step * 0.18) * r,
                  Math.sin(elev) * r + Math.sin(step * 1.7) * 18,
                  Math.sin(angle + step * 0.18) * r
                )
              );
            }
            gGroup.add(
              new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), webMat)
            );
          }
        }

        scene.add(gGroup);
        galaxiesRuntime.push({
          data: gData,
          group: gGroup,
          diskMesh,
          coreMesh,
        });
      });

      // 6E. 14 Clickable 3D Famous Interstellar & Hypergiant Stars Along the Journey Out of the Milky Way!
      interface FamousStarRuntime {
        data: FamousStarData;
        group: THREE.Group;
        photosphereMesh: THREE.Mesh;
        coronaSprite: THREE.Sprite;
        sunCompGroup: THREE.Group;
      }
      const starsRuntime: FamousStarRuntime[] = [];

      FAMOUS_STARS_CATALOG.forEach((sData) => {
        const sGroup = new THREE.Group();
        sGroup.position.set(
          sData.position3D[0],
          sData.position3D[1],
          sData.position3D[2]
        );

        // Glowing 3D Photosphere (Clickable via Raycaster)
        const starGeo = new THREE.SphereGeometry(sData.visualRadius3D, 32, 24);
        const starMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(sData.coreColor),
        });
        const photosphereMesh = new THREE.Mesh(starGeo, starMat);
        sGroup.add(photosphereMesh);

        // Fiery Chromosphere Plasma Shell
        const shellGeo = new THREE.SphereGeometry(sData.visualRadius3D * 1.12, 24, 18);
        const shellMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(sData.color),
          transparent: true,
          opacity: 0.45,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const shellMesh = new THREE.Mesh(shellGeo, shellMat);
        sGroup.add(shellMesh);

        // Volumetric Stellar Corona Glow Sprite
        const coronaMat = new THREE.SpriteMaterial({
          map: sharedGalaxyGlowTex,
          color: new THREE.Color(sData.color),
          transparent: true,
          opacity: 0.92,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const coronaSprite = new THREE.Sprite(coronaMat);
        coronaSprite.scale.set(
          sData.visualRadius3D * 5.8,
          sData.visualRadius3D * 5.8,
          1
        );
        sGroup.add(coronaSprite);

        // 3D Sun-Size Reference Companion Hologram (Shown when inspecting Star vs Sun in 3D!)
        const sunCompGroup = new THREE.Group();
        sunCompGroup.visible = false;
        const refSunRadius =
          sData.sunRadiusMultiplier < 1
            ? sData.visualRadius3D * 1.4
            : Math.max(
                0.75,
                Math.min(
                  sData.visualRadius3D * 0.85,
                  sData.visualRadius3D / Math.pow(sData.sunRadiusMultiplier, 0.35)
                )
              );
        const refSunOffset = sData.visualRadius3D + refSunRadius + Math.max(4, sData.visualRadius3D * 0.45);
        const refSunMesh = new THREE.Mesh(
          new THREE.SphereGeometry(refSunRadius, 24, 18),
          new THREE.MeshBasicMaterial({ color: 0xfde047 })
        );
        refSunMesh.position.set(-refSunOffset, 0, 0);
        sunCompGroup.add(refSunMesh);

        const refSunGlow = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: sharedGalaxyGlowTex,
            color: 0xf59e0b,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          })
        );
        refSunGlow.scale.set(refSunRadius * 4.5, refSunRadius * 4.5, 1);
        refSunGlow.position.copy(refSunMesh.position);
        sunCompGroup.add(refSunGlow);

        // Reference scale measurement ring around the star
        const measPts: THREE.Vector3[] = [];
        const ringR = sData.visualRadius3D * 1.32;
        for (let k = 0; k <= 64; k++) {
          const ang = (k / 64) * Math.PI * 2;
          measPts.push(new THREE.Vector3(Math.cos(ang) * ringR, 0, Math.sin(ang) * ringR));
        }
        sunCompGroup.add(
          new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(measPts),
            new THREE.LineBasicMaterial({
              color: 0x38bdf8,
              transparent: true,
              opacity: 0.55,
            })
          )
        );
        sGroup.add(sunCompGroup);

        scene.add(sGroup);
        starsRuntime.push({
          data: sData,
          group: sGroup,
          photosphereMesh,
          coronaSprite,
          sunCompGroup,
        });
      });

      // Outer Oort Cloud & Heliosphere Boundary Ring (r = 465)
      const oortRingPts: THREE.Vector3[] = [];
      for (let s = 0; s <= 128; s++) {
        const a = (s / 128) * Math.PI * 2;
        oortRingPts.push(new THREE.Vector3(Math.cos(a) * 465, 0, Math.sin(a) * 465));
      }
      const oortRingMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.22,
      });
      scene.add(
        new THREE.Line(new THREE.BufferGeometry().setFromPoints(oortRingPts), oortRingMat)
      );

      // 7. Asteroid Belt InstancedMesh
      const asteroidCount = 320;
      const astGeo = new THREE.DodecahedronGeometry(1.1, 1);
      const astMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.85,
        metalness: 0.25,
      });
      const asteroidBelt = new THREE.InstancedMesh(astGeo, astMat, asteroidCount);
      asteroidBelt.frustumCulled = false;

      interface AsteroidData {
        active: boolean;
        orbitRadius: number;
        angle: number;
        orbitSpeed: number;
        yOffset: number;
        scale: number;
        rotX: number;
        rotY: number;
        respawnTimer: number;
      }
      const asteroidsData: AsteroidData[] = [];
      const astPalette = [0x94a3b8, 0x64748b, 0x78716c, 0xa8a29e, 0xcbd5e1];

      for (let i = 0; i < asteroidCount; i++) {
        const orbitRadius = 132 + Math.random() * 20;
        const angle = Math.random() * Math.PI * 2;
        const yOffset = (Math.random() - 0.5) * 7;
        const scale = 0.55 + Math.random() * 1.35;
        asteroidsData.push({
          active: true,
          orbitRadius,
          angle,
          orbitSpeed: 0.04 + Math.random() * 0.05,
          yOffset,
          scale,
          rotX: Math.random() * Math.PI,
          rotY: Math.random() * Math.PI,
          respawnTimer: 0,
        });
        _color.setHex(astPalette[i % astPalette.length]);
        asteroidBelt.setColorAt(i, _color);
      }
      if (asteroidBelt.instanceColor) asteroidBelt.instanceColor.needsUpdate = true;
      scene.add(asteroidBelt);

      // 8. Collectible Starlight Crystals
      const crystalCount = 42;
      const crystalGeo = new THREE.OctahedronGeometry(1.15, 0);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.85,
        roughness: 0.15,
        metalness: 0.8,
      });
      interface CrystalNode {
        mesh: THREE.Mesh;
        active: boolean;
        orbitRadius: number;
        angle: number;
        respawnTimer: number;
      }
      const crystals: CrystalNode[] = [];
      for (let i = 0; i < crystalCount; i++) {
        const mesh = new THREE.Mesh(crystalGeo, crystalMat);
        const orbitRadius = 40 + (i / crystalCount) * 315;
        const angle = Math.random() * Math.PI * 2;
        mesh.position.set(
          Math.cos(angle) * orbitRadius,
          0,
          Math.sin(angle) * orbitRadius
        );
        scene.add(mesh);
        crystals.push({
          mesh,
          active: true,
          orbitRadius,
          angle,
          respawnTimer: 0,
        });
      }

      // 9. Player Starship ("Vajra-IX Starfighter") & Debounced Save State
      const playerShip = createPlayerStarship(isSoftwareGl);
      scene.add(playerShip.group);

      // Forward Tactical Spotlight for High Graphics
      const shipSpotlight = new THREE.SpotLight(0xbae6fd, 2.8, 130, 0.5, 0.6, 1.2);
      shipSpotlight.position.set(0, 0.4, 1.8);
      const shipSpotlightTarget = new THREE.Object3D();
      shipSpotlightTarget.position.set(0, 0, -45);
      playerShip.group.add(shipSpotlightTarget);
      shipSpotlight.target = shipSpotlightTarget;
      playerShip.group.add(shipSpotlight);

      let savedData: {
        score?: number;
        crystals?: number;
        titanium?: number;
        scannedPlanets?: string[];
        discoveredProbes?: string[];
        upgrades?: ShipUpgradeLevels;
        completedMissions?: string[];
        piratesDestroyed?: number;
        asteroidsMined?: number;
      } = {};
      try {
        const raw = localStorage.getItem(SAVE_STORAGE_KEY);
        if (raw) savedData = JSON.parse(raw);
      } catch {
        // Ignore storage error
      }

      const initialUpgrades: ShipUpgradeLevels = savedData.upgrades || {
        laser: 1,
        engine: 1,
        hull: 1,
        shield: 1,
        tractor: 1,
      };

      const earthRuntime = planetsRuntime[3];
      const maxHullInit = 100 + (initialUpgrades.hull - 1) * 30;
      const maxShieldInit = 100 + (initialUpgrades.shield - 1) * 30;

      const playerState = {
        position: new THREE.Vector3(
          earthRuntime.rootGroup.position.x + 12,
          0,
          earthRuntime.rootGroup.position.z + 14
        ),
        velocity: new THREE.Vector3(),
        yaw: -0.4,
        bankRoll: 0,
        speed: 0,
        hull: maxHullInit,
        maxHull: maxHullInit,
        shield: maxShieldInit,
        maxShield: maxShieldInit,
        boostEnergy: 100,
        missileCooldown: 0,
        score: savedData.score ?? 0,
        crystals: savedData.crystals ?? 140,
        titanium: savedData.titanium ?? 90,
        scannedPlanets: new Set<string>(savedData.scannedPlanets ?? ['earth']),
        discoveredProbes: new Set<string>(savedData.discoveredProbes ?? []),
        completedMissions: new Set<string>(savedData.completedMissions ?? []),
        upgrades: { ...initialUpgrades },
        piratesDestroyed: savedData.piratesDestroyed ?? 0,
        asteroidsMined: savedData.asteroidsMined ?? 0,
        waveNumber: 1,
        fireCooldown: 0,
        shieldFlash: 0,
        recoilStretch: 0,
        autoPilotActive: false,
        autoPilotPlanetIdx: 0,
        autoPilotOrbitTimer: 0,
        activeAlert: null as string | null,
        alertTimer: 0,
      };
      playerShip.group.position.copy(playerState.position);

      let saveDirty = false;
      let saveFlushTimer = 0;

      const markSaveDirty = () => {
        saveDirty = true;
      };

      const flushSaveToStorage = () => {
        if (!saveDirty) return;
        saveDirty = false;
        try {
          localStorage.setItem(
            SAVE_STORAGE_KEY,
            JSON.stringify({
              score: Math.round(playerState.score),
              crystals: Math.round(playerState.crystals),
              titanium: Math.round(playerState.titanium),
              scannedPlanets: Array.from(playerState.scannedPlanets),
              discoveredProbes: Array.from(playerState.discoveredProbes),
              completedMissions: Array.from(playerState.completedMissions),
              upgrades: playerState.upgrades,
              piratesDestroyed: playerState.piratesDestroyed,
              asteroidsMined: playerState.asteroidsMined,
            })
          );
        } catch {
          // Ignore storage error
        }
      };

      // 10. Built Orbital Structures around Planets
      interface RuntimeOutpost {
        info: BuiltOutpostInfo;
        group: THREE.Group;
        planetIndex: number;
        orbitAngle: number;
        orbitDist: number;
        fireCooldown: number;
      }
      const builtOutposts: RuntimeOutpost[] = [];

      const spawnOutpostModel = (
        planetIndex: number,
        type: 'turret' | 'extractor' | 'station',
        customAngle?: number
      ) => {
        const pRuntime = planetsRuntime[planetIndex];
        const model = createOrbitalStructureModel(type);
        scene.add(model);
        const angle =
          customAngle !== undefined
            ? customAngle
            : builtOutposts.filter((o) => o.planetIndex === planetIndex).length * 1.65;
        const dist = pRuntime.data.radius + 4.8;
        const info: BuiltOutpostInfo = {
          id: `${pRuntime.data.id}-${type}-${Date.now()}-${Math.random()}`,
          planetId: pRuntime.data.id,
          planetName: pRuntime.data.name,
          type,
        };
        builtOutposts.push({
          info,
          group: model,
          planetIndex,
          orbitAngle: angle,
          orbitDist: dist,
          fireCooldown: 0,
        });
      };

      spawnOutpostModel(3, 'station', 0.4);

      // 11. Pooled Laser Bolts & Homing Plasma Torpedo
      interface LaserBolt {
        mesh: THREE.Mesh;
        active: boolean;
        position: THREE.Vector3;
        velocity: THREE.Vector3;
        life: number;
        isEnemy: boolean;
        isHomingMissile?: boolean;
      }
      const laserPool: LaserBolt[] = [];
      const playerLaserGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.6, 6);
      playerLaserGeo.rotateX(Math.PI / 2);
      const playerLaserMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const enemyLaserMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const missileMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

      for (let i = 0; i < 72; i++) {
        const mesh = new THREE.Mesh(playerLaserGeo, playerLaserMat);
        mesh.visible = false;
        scene.add(mesh);
        laserPool.push({
          mesh,
          active: false,
          position: new THREE.Vector3(),
          velocity: new THREE.Vector3(),
          life: 0,
          isEnemy: false,
          isHomingMissile: false,
        });
      }

      const fireLaser = (
        origin: THREE.Vector3,
        dir: THREE.Vector3,
        isEnemy: boolean,
        isHomingMissile: boolean = false
      ) => {
        const bolt = laserPool.find((b) => !b.active);
        if (!bolt) return;
        bolt.active = true;
        bolt.isEnemy = isEnemy;
        bolt.isHomingMissile = isHomingMissile;
        bolt.life = isHomingMissile ? 4.0 : isEnemy ? 2.4 : 1.5;
        bolt.position.copy(origin);
        bolt.velocity
          .copy(dir)
          .multiplyScalar(isHomingMissile ? 92 : isEnemy ? 68 : 142);
        bolt.mesh.material = isHomingMissile
          ? missileMat
          : isEnemy
            ? enemyLaserMat
            : playerLaserMat;
        bolt.mesh.scale.setScalar(isHomingMissile ? 2.1 : 1.0);
        bolt.mesh.position.copy(origin);
        _vec3B.copy(origin).add(dir);
        bolt.mesh.lookAt(_vec3B);
        bolt.mesh.visible = true;
      };

      // 12. Pooled 3D Particle Bursts
      interface ParticleBurst {
        mesh: THREE.Mesh;
        active: boolean;
        velocity: THREE.Vector3;
        life: number;
        maxLife: number;
      }
      const particlePool: ParticleBurst[] = [];
      const partGeo = new THREE.OctahedronGeometry(0.38, 0);
      const partMats = [
        new THREE.MeshBasicMaterial({ color: 0xf59e0b }),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 }),
        new THREE.MeshBasicMaterial({ color: 0xef4444 }),
        new THREE.MeshBasicMaterial({ color: 0xfef08a }),
      ];
      for (let i = 0; i < 90; i++) {
        const mesh = new THREE.Mesh(partGeo, partMats[i % partMats.length]);
        mesh.visible = false;
        scene.add(mesh);
        particlePool.push({
          mesh,
          active: false,
          velocity: new THREE.Vector3(),
          life: 0,
          maxLife: 0.6,
        });
      }

      const spawnExplosionParticles = (
        center: THREE.Vector3,
        count: number,
        speedScale: number
      ) => {
        const effectiveCount =
          graphicsQualityRef.current === 'ultra'
            ? Math.min(particlePool.length, Math.ceil(count * 1.6))
            : graphicsQualityRef.current === 'saver'
              ? Math.ceil(count * 0.5)
              : count;
        let spawned = 0;
        for (let i = 0; i < particlePool.length && spawned < effectiveCount; i++) {
          const p = particlePool[i];
          if (!p.active) {
            p.active = true;
            p.maxLife = 0.45 + Math.random() * 0.35;
            p.life = p.maxLife;
            p.mesh.position.copy(center);
            p.mesh.scale.setScalar(1.2);
            p.mesh.visible = true;
            p.velocity
              .set(
                Math.random() - 0.5,
                (Math.random() - 0.5) * 0.6,
                Math.random() - 0.5
              )
              .normalize()
              .multiplyScalar((12 + Math.random() * 26) * speedScale);
            spawned++;
          }
        }
      };

      // 13. Peaceful Observatory Mode (No hostile pirates interrupting learning)
      interface PirateEnemy {
        group: THREE.Group;
        telegraphRing: THREE.Mesh;
        active: boolean;
        hp: number;
        maxHp: number;
        position: THREE.Vector3;
        velocity: THREE.Vector3;
        windupTimer: number;
        cooldownTimer: number;
        respawnTimer: number;
      }
      const pirates: PirateEnemy[] = [];
      const spawnPirateAtIndex = (_p: PirateEnemy, _idx: number) => {};
      void createPirateInterceptor;

      // 14. Input Handling
      const heldKeys = new Set<string>();
      const justPressedKeys = new Set<string>();

      const onKeyDown = (e: KeyboardEvent) => {
        const code = e.code;
        if (!heldKeys.has(code)) {
          justPressedKeys.add(code);
        }
        heldKeys.add(code);
      };

      const onKeyUp = (e: KeyboardEvent) => {
        heldKeys.delete(e.code);
      };

      const onWindowBlur = () => {
        heldKeys.clear();
        justPressedKeys.clear();
        flushSaveToStorage();
      };

      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
      window.addEventListener('blur', onWindowBlur);

      // Interactive 360-Degree Touch/Mouse Camera Orbit + Multi-Scale Progressive Zoom (0.16x to 92x) + 45s Milky Way Exit Voyage
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      let isDraggingOrbit = false;
      let isTwoFingerGesture = false;
      let activeOrbitPointerId: number | null = null;
      let dragStartX = 0;
      let dragStartY = 0;
      let lastPointerX = 0;
      let lastPointerY = 0;
      let orbitAzimuth = 0.65;
      let orbitElevation = 0.32;
      let orbitZoomMultiplier = 1.0;
      let displayedZoom = 1.0;
      let pinchStartDist = 0;
      let pinchStartZoom = 1.0;
      let lastTouchMidX = 0;
      let lastTouchMidY = 0;
      const cameraPanOffset = new THREE.Vector3(0, 0, 0);

      // 45-Second Progressive Interstellar & Milky Way Exit Voyage State
      const VOYAGE_DURATION_SEC = 45.0;
      let voyageActive = false;
      let voyageElapsed = 0;
      let voyageSpeedMult = 1;

      const onPointerDown = (e: PointerEvent) => {
        if (gameStateRef.current !== 'playing' || isTwoFingerGesture) return;
        if (activeOrbitPointerId !== null) return;
        activeOrbitPointerId = e.pointerId;
        isDraggingOrbit = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
      };

      const onPointerMove = (e: PointerEvent) => {
        if (isTwoFingerGesture || !isDraggingOrbit || e.pointerId !== activeOrbitPointerId)
          return;
        const dx = e.clientX - lastPointerX;
        const dy = e.clientY - lastPointerY;
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;

        // Right-mouse drag or Shift+drag pans in all directions on desktop
        if (e.buttons === 2 || e.shiftKey) {
          const panScale = 0.38 * orbitZoomMultiplier;
          const rightX = -Math.sin(orbitAzimuth);
          const rightZ = Math.cos(orbitAzimuth);
          cameraPanOffset.x -= rightX * dx * panScale;
          cameraPanOffset.z -= rightZ * dx * panScale;
          cameraPanOffset.y += dy * panScale * 0.75;
          return;
        }

        orbitAzimuth -= dx * 0.0075;
        orbitElevation = Math.max(
          -1.35,
          Math.min(1.35, orbitElevation + dy * 0.0065)
        );
      };

      const onPointerUp = (e: PointerEvent) => {
        if (e.pointerId !== activeOrbitPointerId) return;
        isDraggingOrbit = false;
        activeOrbitPointerId = null;
        if (isTwoFingerGesture) return;
        const moveDist = Math.hypot(
          e.clientX - dragStartX,
          e.clientY - dragStartY
        );
        // If user tapped without dragging, raycast to select 3D Planet OR 3D Famous Star!
        if (moveDist < 9 && gameStateRef.current === 'playing') {
          const rect = renderer.domElement.getBoundingClientRect();
          pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
          raycaster.setFromCamera(pointer, camera);

          const planetMeshes = planetsRuntime.map((p) => p.mesh);
          const hits = raycaster.intersectObjects(planetMeshes, false);
          if (hits.length > 0) {
            const hitMesh = hits[0].object;
            const found = planetsRuntime.find((p) => p.mesh === hitMesh);
            if (found) {
              voyageActive = false;
              playerState.scannedPlanets.add(found.data.id);
              orbitZoomMultiplier = 1.0;
              cameraPanOffset.set(0, 0, 0);
              markSaveDirty();
              soundEngine.playCollect();
              onSelectPlanetRef.current(found.data);
              return;
            }
          }

          // Check 14 Clickable 3D Famous Interstellar Stars!
          const starMeshes = starsRuntime.map((s) => s.photosphereMesh);
          const starHits = raycaster.intersectObjects(starMeshes, false);
          if (starHits.length > 0) {
            const hitStarMesh = starHits[0].object;
            const foundStar = starsRuntime.find(
              (s) => s.photosphereMesh === hitStarMesh
            );
            if (foundStar) {
              voyageActive = false;
              orbitZoomMultiplier = 1.0;
              displayedZoom = 1.0;
              cameraPanOffset.set(0, 0, 0);
              soundEngine.playCollect();
              onSelectStarIdRef.current?.(foundStar.data.id);
              return;
            }
          }
        }
      };

      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        voyageActive = false;
        // Progressive gentle wheel zoom so gliding past stars & exiting Milky Way feels majestic
        const zoomFactor = e.deltaY > 0 ? 1.08 : 0.92;
        orbitZoomMultiplier = Math.max(
          0.16,
          Math.min(92.0, orbitZoomMultiplier * zoomFactor)
        );
      };

      const onTouchStart = (e: TouchEvent) => {
        if (e.touches.length >= 2) {
          isTwoFingerGesture = true;
          isDraggingOrbit = false;
          activeOrbitPointerId = null;
          voyageActive = false;
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          pinchStartDist = Math.hypot(dx, dy);
          pinchStartZoom = orbitZoomMultiplier;
          lastTouchMidX = (e.touches[0].clientX + e.touches[1].clientX) * 0.5;
          lastTouchMidY = (e.touches[0].clientY + e.touches[1].clientY) * 0.5;
        }
      };

      const onTouchMove = (e: TouchEvent) => {
        if (e.touches.length >= 2 && pinchStartDist > 10) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const dist = Math.hypot(dx, dy);
          const ratio = pinchStartDist / Math.max(18, dist);
          // Progressive multi-scale pinch-zoom: Solar System -> Interstellar Stars -> Milky Way -> Galaxies & CMB!
          const nextZoom = pinchStartZoom * Math.pow(ratio, 0.88);
          orbitZoomMultiplier = Math.max(0.16, Math.min(92.0, nextZoom));

          // 2-Finger Multi-Directional Pan across the Solar System, Stars, Milky Way & Galaxies!
          const midX = (e.touches[0].clientX + e.touches[1].clientX) * 0.5;
          const midY = (e.touches[0].clientY + e.touches[1].clientY) * 0.5;
          const panDx = midX - lastTouchMidX;
          const panDy = midY - lastTouchMidY;
          lastTouchMidX = midX;
          lastTouchMidY = midY;

          const panScale = 0.42 * Math.max(0.5, displayedZoom);
          const rightX = -Math.sin(orbitAzimuth);
          const rightZ = Math.cos(orbitAzimuth);
          const fwdX = -Math.cos(orbitAzimuth) * Math.sin(orbitElevation);
          const fwdZ = -Math.sin(orbitAzimuth) * Math.sin(orbitElevation);

          cameraPanOffset.x += (rightX * panDx + fwdX * panDy) * panScale;
          cameraPanOffset.z += (rightZ * panDx + fwdZ * panDy) * panScale;
          cameraPanOffset.y += panDy * panScale * 0.65;
          cameraPanOffset.clampLength(0, 12500);
        }
      };

      const onTouchEnd = (e: TouchEvent) => {
        if (e.touches.length < 2) {
          isTwoFingerGesture = false;
        }
      };

      renderer.domElement.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
      renderer.domElement.addEventListener('touchstart', onTouchStart, {
        passive: true,
      });
      renderer.domElement.addEventListener('touchmove', onTouchMove, {
        passive: true,
      });
      renderer.domElement.addEventListener('touchend', onTouchEnd, {
        passive: true,
      });

      const getNearestPlanet = (): {
        runtime: PlanetRuntime;
        index: number;
        dist: number;
      } => {
        let bestIdx = 3;
        let bestDist = Infinity;
        for (let i = 0; i < planetsRuntime.length; i++) {
          const pr = planetsRuntime[i];
          const d = Math.max(
            0,
            playerState.position.distanceTo(pr.rootGroup.position) - pr.data.radius
          );
          if (d < bestDist) {
            bestDist = d;
            bestIdx = i;
          }
        }
        return { runtime: planetsRuntime[bestIdx], index: bestIdx, dist: bestDist };
      };

      const evaluateCampaignMissions = () => {
        SPACE_MISSIONS.forEach((m) => {
          if (playerState.completedMissions.has(m.id)) return;
          let achieved = false;
          if (m.id === 'scan_inner' && playerState.scannedPlanets.size >= 3)
            achieved = true;
          if (m.id === 'mine_belt' && playerState.asteroidsMined >= 5)
            achieved = true;
          if (m.id === 'build_first' && builtOutposts.length >= 2) achieved = true;
          if (m.id === 'pirate_hunter' && playerState.piratesDestroyed >= 4)
            achieved = true;
          if (m.id === 'grand_tour' && playerState.scannedPlanets.size >= 10)
            achieved = true;

          if (achieved) {
            playerState.completedMissions.add(m.id);
            playerState.crystals += m.rewardCrystals;
            playerState.score += m.rewardScore;
            soundEngine.playBuildOutpost();
            playerState.activeAlert = `Mission Complete: ${m.titleEn}! +${m.rewardCrystals} Crystals & +${m.rewardScore} Score`;
            playerState.alertTimer = 4.2;
            markSaveDirty();
          }
        });
      };

      let cameraShake = 0;
      let hitstopTimer = 0;

      actionsRef.current = {
        warpToPlanet: (targetId: string) => {
          voyageActive = false;
          orbitZoomMultiplier = 1.0;
          displayedZoom = 1.0;
          cameraPanOffset.set(0, 0, 0);
          soundEngine.playWarp();

          // 1. Check if targetId is a Planet
          const targetIdx = planetsRuntime.findIndex(
            (p) => p.data.id === targetId
          );
          if (targetIdx !== -1) {
            const target = planetsRuntime[targetIdx];
            const offsetDist = target.data.radius + 14;
            playerState.position.set(
              target.rootGroup.position.x + offsetDist * 0.7,
              0,
              target.rootGroup.position.z + offsetDist * 0.7
            );
            playerState.velocity.set(0, 0, 0);
            playerState.speed = 0;
            const dx = target.rootGroup.position.x - playerState.position.x;
            const dz = target.rootGroup.position.z - playerState.position.z;
            playerState.yaw = Math.atan2(-dx, -dz);
            playerState.scannedPlanets.add(target.data.id);
            playerState.autoPilotPlanetIdx = targetIdx;
            cameraShake = 0.25;
            evaluateCampaignMissions();
            markSaveDirty();
            return;
          }

          // 2. Check if targetId is a Famous Interstellar Star
          const starTarget = starsRuntime.find((s) => s.data.id === targetId);
          if (starTarget) {
            cameraShake = 0.28;
            return;
          }

          // 3. Check if targetId is a Spacecraft / Viman (SPACE_PROBES)
          const probeTarget = probesRuntime.find((prb) => prb.info.id === targetId);
          if (probeTarget) {
            playerState.discoveredProbes.add(probeTarget.info.id);
            playerState.position.copy(probeTarget.group.position).add(new THREE.Vector3(6, 1, 6));
            playerState.velocity.set(0, 0, 0);
            playerState.speed = 0;
            cameraShake = 0.25;
            markSaveDirty();
            return;
          }

          // 4. Check if targetId is a Deep-Space Galaxy / Nebula / Supercluster / CMB
          const galTarget = galaxiesRuntime.find((g) => g.data.id === targetId);
          if (galTarget) {
            cameraShake = 0.3;
            return;
          }
        },

        startGalaxyExitVoyage: () => {
          cameraPanOffset.set(0, 0, 0);
          orbitZoomMultiplier = 1.0;
          displayedZoom = 1.0;
          orbitElevation = 0.24;
          voyageElapsed = 0;
          voyageSpeedMult = 1;
          voyageActive = true;
          soundEngine.playWarp();
        },

        stopGalaxyExitVoyage: () => {
          voyageActive = false;
        },

        toggleVoyageFastForward: () => {
          voyageSpeedMult = voyageSpeedMult === 1 ? 2 : 1;
        },

        warpToBlackHole: () => {
          voyageActive = false;
          orbitZoomMultiplier = 1.0;
          displayedZoom = 1.0;
          cameraPanOffset.set(0, 0, 0);
          soundEngine.playWarp();
          playerState.position.set(
            blackHoleGroup.position.x + 36,
            2,
            blackHoleGroup.position.z + 36
          );
          playerState.velocity.set(0, 0, 0);
          playerState.speed = 0;
          const dx = blackHoleGroup.position.x - playerState.position.x;
          const dz = blackHoleGroup.position.z - playerState.position.z;
          playerState.yaw = Math.atan2(-dx, -dz);
          playerState.autoPilotActive = false;
          cameraShake = 0.35;
        },

        buildStructureNearPlanet: (type: 'turret' | 'extractor' | 'station') => {
          const spec = BUILDABLE_STRUCTURES.find((s) => s.id === type);
          if (!spec) return false;
          if (
            playerState.crystals < spec.costCrystals ||
            playerState.titanium < spec.costTitanium
          ) {
            playerState.activeAlert = `Need ${spec.costCrystals} Crystals & ${spec.costTitanium} Titanium! Mine asteroids or crystals.`;
            playerState.alertTimer = 3.0;
            return false;
          }

          const nearest = getNearestPlanet();
          playerState.crystals -= spec.costCrystals;
          playerState.titanium -= spec.costTitanium;
          playerState.score += type === 'station' ? 500 : 250;
          playerState.scannedPlanets.add(nearest.runtime.data.id);

          spawnOutpostModel(nearest.index, type);
          soundEngine.playBuildOutpost();
          playerState.activeAlert = `Constructed ${spec.name} in orbit around ${nearest.runtime.data.name}!`;
          playerState.alertTimer = 3.5;
          evaluateCampaignMissions();
          markSaveDirty();
          return true;
        },

        upgradeShipSystem: (id: keyof ShipUpgradeLevels) => {
          const spec = STARSHIP_UPGRADES.find((u) => u.id === id);
          if (!spec) return false;
          const currentLvl = playerState.upgrades[id];
          if (currentLvl >= spec.maxLevel) return false;

          const costCrystals = Math.round(
            spec.baseCostCrystals * Math.pow(1.45, currentLvl - 1)
          );
          const costTitanium = Math.round(
            spec.baseCostTitanium * Math.pow(1.45, currentLvl - 1)
          );

          if (
            playerState.crystals < costCrystals ||
            playerState.titanium < costTitanium
          ) {
            playerState.activeAlert = `Need ${costCrystals} Crystals & ${costTitanium} Titanium to upgrade ${spec.name}!`;
            playerState.alertTimer = 3.0;
            return false;
          }

          playerState.crystals -= costCrystals;
          playerState.titanium -= costTitanium;
          playerState.upgrades[id] = currentLvl + 1;
          playerState.score += 180;

          if (id === 'hull') {
            playerState.maxHull = 100 + (playerState.upgrades.hull - 1) * 30;
            playerState.hull = playerState.maxHull;
          } else if (id === 'shield') {
            playerState.maxShield = 100 + (playerState.upgrades.shield - 1) * 30;
            playerState.shield = playerState.maxShield;
          }

          soundEngine.playBuildOutpost();
          playerState.activeAlert = `Upgraded ${spec.name} to Mk.${currentLvl + 1}!`;
          playerState.alertTimer = 3.2;
          markSaveDirty();
          return true;
        },

        fireHomingMissile: () => {
          if (playerState.missileCooldown > 0) {
            playerState.activeAlert = `Homing Torpedo Recharging (${playerState.missileCooldown.toFixed(1)}s)...`;
            playerState.alertTimer = 1.5;
            return;
          }
          playerState.missileCooldown = 3.2;
          _vec3A.set(
            -Math.sin(playerState.yaw),
            0,
            -Math.cos(playerState.yaw)
          );
          _vec3B.copy(playerState.position).addScaledVector(_vec3A, 3.0);
          fireLaser(_vec3B, _vec3A, false, true);
          soundEngine.playMissileLaunch();
        },

        toggleAutoPilot: () => {
          playerState.autoPilotActive = !playerState.autoPilotActive;
          if (playerState.autoPilotActive) {
            playerState.autoPilotOrbitTimer = 0;
            const target = planetsRuntime[playerState.autoPilotPlanetIdx];
            playerState.activeAlert = `Auto-Pilot Engaged: Guiding to ${target.data.name} (${target.data.hindiName})`;
            playerState.alertTimer = 3.5;
            soundEngine.playWarp();
          } else {
            playerState.activeAlert = 'Auto-Pilot Disengaged — Manual Flight Control';
            playerState.alertTimer = 2.5;
          }
        },

        scanNearestPlanet: () => {
          const nearest = getNearestPlanet();
          playerState.scannedPlanets.add(nearest.runtime.data.id);
          evaluateCampaignMissions();
          markSaveDirty();
          soundEngine.playCollect();
          onSelectPlanetRef.current(nearest.runtime.data);
        },

        resetMission: () => {
          const earth = planetsRuntime[3];
          playerState.position.set(
            earth.rootGroup.position.x + 12,
            0,
            earth.rootGroup.position.z + 14
          );
          playerState.velocity.set(0, 0, 0);
          playerState.speed = 0;
          playerState.hull = playerState.maxHull;
          playerState.shield = playerState.maxShield;
          playerState.boostEnergy = 100;
          pirates.forEach((p, idx) => spawnPirateAtIndex(p, idx));
          markSaveDirty();
        },

        exportSaveJson: () => {
          flushSaveToStorage();
          return localStorage.getItem(SAVE_STORAGE_KEY) || '{}';
        },

        resetAllSavedData: () => {
          try {
            localStorage.removeItem(SAVE_STORAGE_KEY);
          } catch {
            // Ignore
          }
          playerState.score = 0;
          playerState.crystals = 140;
          playerState.titanium = 90;
          playerState.scannedPlanets = new Set(['earth']);
          playerState.discoveredProbes = new Set();
          playerState.completedMissions = new Set();
          playerState.upgrades = {
            laser: 1,
            engine: 1,
            hull: 1,
            shield: 1,
            tractor: 1,
          };
          playerState.maxHull = 100;
          playerState.hull = 100;
          playerState.maxShield = 100;
          playerState.shield = 100;
          playerState.activeAlert = 'Commander Profile Reset to Factory Default';
          playerState.alertTimer = 3.0;
        },
      };

      if (!isSoftwareGl) {
        renderer.compile(scene, camera);
      }

      // 15. Animation Loop with Adaptive FPS Governor & Software-WebGL Pacing
      let frameId = 0;
      let isDisposed = false;
      const clock = new THREE.Clock();
      let resourceTickTimer = 0;
      let hudSyncTimer = 0;
      let titleCamAngle = 0.4;
      let rollingFps = 60;
      let currentAppliedPixelRatio = basePixelRatio;

      function afterDraw(cb: () => void) {
        if (isDisposed) return;
        const gl = renderer.getContext() as WebGL2RenderingContext;
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (isDisposed) return;
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      }

      function tick() {
        if (isDisposed) return;
        const rawDt = clock.getDelta();
        const dt = Math.min(rawDt, 0.05);
        const simDt = dt * timeScaleRef.current;

        // Rolling FPS calculation & Adaptive PixelRatio Governor (prevents any lag/hang on older devices)
        if (rawDt > 0.001) {
          const instantFps = Math.min(120, 1 / rawDt);
          rollingFps = rollingFps * 0.92 + instantFps * 0.08;
        }

        if (!isSoftwareGl) {
          let desiredPR = basePixelRatio;
          if (graphicsQualityRef.current === 'saver' || rollingFps < 45) {
            desiredPR = Math.min(1.0, basePixelRatio);
          } else if (graphicsQualityRef.current === 'ultra') {
            desiredPR = isMobileDevice ? Math.min(1.35, basePixelRatio) : Math.min(1.65, basePixelRatio);
          }
          if (Math.abs(desiredPR - currentAppliedPixelRatio) > 0.05) {
            currentAppliedPixelRatio = desiredPR;
            renderer.setPixelRatio(currentAppliedPixelRatio);
          }
        }

        // Animate volumetric cosmic nebulae, Earth clouds, Black Hole accretion disk, Galaxies & solar corona
        nebulaInstanced.rotation.y += 0.012 * dt;
        if (earthCloudMesh) {
          earthCloudMesh.rotation.y += 0.26 * simDt;
        }
        bhAccretionDisk.rotation.y -= 0.75 * dt;
        bhLensingRing.lookAt(camera.position);

        for (let g = 0; g < galaxiesRuntime.length; g++) {
          galaxiesRuntime[g].diskMesh.rotation.z -= 0.14 * dt;
        }

        if (sunCoronaMesh) {
          const s = 1.0 + 0.045 * Math.sin(clock.getElapsedTime() * 2.8);
          sunCoronaMesh.scale.set(s, s, s);
        }
        if (sunOuterCoronaMesh) {
          const s2 = 1.0 + 0.065 * Math.cos(clock.getElapsedTime() * 1.9);
          sunOuterCoronaMesh.scale.set(s2, s2, s2);
        }

        // Flush debounced localStorage save every 2.5 seconds if dirty
        saveFlushTimer += dt;
        if (saveFlushTimer >= 2.5) {
          saveFlushTimer = 0;
          flushSaveToStorage();
        }

        if (hitstopTimer > 0) {
          hitstopTimer -= dt;
          renderer.render(scene, camera);
          if (isSoftwareGl) afterDraw(tick);
          else frameId = requestAnimationFrame(tick);
          return;
        }

        // Advance Solar System Orbits & Axial Rotations
        for (let i = 0; i < planetsRuntime.length; i++) {
          const pr = planetsRuntime[i];
          pr.mesh.rotation.y += pr.data.rotationSpeed * simDt;
          pr.scannerRing.rotation.z -= 0.45 * dt;

          if (pr.data.orbitRadius > 0) {
            pr.angle += pr.data.orbitSpeed * 0.14 * simDt;
            pr.rootGroup.position.set(
              Math.cos(pr.angle) * pr.data.orbitRadius,
              0,
              Math.sin(pr.angle) * pr.data.orbitRadius
            );
          }

          for (let m = 0; m < pr.moons.length; m++) {
            const moon = pr.moons[m];
            moon.angle += moon.speed * 0.5 * simDt;
            moon.mesh.position.set(
              Math.cos(moon.angle) * moon.dist,
              0,
              Math.sin(moon.angle) * moon.dist
            );
          }
        }

        // Advance Famous ISRO & NASA Space Probes in Orbit
        for (let i = 0; i < probesRuntime.length; i++) {
          const prb = probesRuntime[i];
          const host = planetsRuntime[prb.hostPlanetIndex];
          prb.orbitAngle += 0.65 * dt;
          prb.group.position.set(
            host.rootGroup.position.x +
              Math.cos(prb.orbitAngle) * prb.info.orbitOffset,
            1.8,
            host.rootGroup.position.z +
              Math.sin(prb.orbitAngle) * prb.info.orbitOffset
          );
          prb.group.rotation.y += 1.1 * dt;

          if (
            gameStateRef.current === 'playing' &&
            !playerState.discoveredProbes.has(prb.info.id) &&
            playerState.position.distanceTo(prb.group.position) < 16
          ) {
            playerState.discoveredProbes.add(prb.info.id);
            playerState.score += 250;
            playerState.crystals += 40;
            soundEngine.playBuildOutpost();
            playerState.activeAlert = `Historic Spacecraft Discovered: ${prb.info.name} (${prb.info.hindiName})! +250 Score`;
            playerState.alertTimer = 4.5;
            markSaveDirty();
          }
        }

        // Advance Halley's Comet
        cometAngle += 0.11 * simDt;
        const cometX = Math.cos(cometAngle) * 215 - 65;
        const cometZ = Math.sin(cometAngle) * 115;
        cometGroup.position.set(cometX, Math.sin(cometAngle * 2) * 6, cometZ);
        cometGroup.lookAt(0, 0, 0);

        // Advance Dual Wormhole Singularity Gates
        innerWormhole.outerRing.rotation.z += 1.2 * dt;
        innerWormhole.innerRing.rotation.x += 1.9 * dt;
        outerWormhole.outerRing.rotation.z -= 1.2 * dt;
        outerWormhole.innerRing.rotation.x -= 1.9 * dt;
        if (wormholeCooldown > 0) wormholeCooldown -= dt;

        // Advance Asteroid Belt InstancedMesh
        for (let i = 0; i < asteroidCount; i++) {
          const ast = asteroidsData[i];
          if (!ast.active) {
            ast.respawnTimer -= dt;
            if (ast.respawnTimer <= 0) {
              ast.active = true;
            } else {
              _mat4.makeScale(0.0001, 0.0001, 0.0001);
              asteroidBelt.setMatrixAt(i, _mat4);
              continue;
            }
          }
          ast.angle += ast.orbitSpeed * 0.25 * simDt;
          ast.rotX += 0.6 * dt;
          ast.rotY += 0.8 * dt;
          _vec3A.set(
            Math.cos(ast.angle) * ast.orbitRadius,
            ast.yOffset,
            Math.sin(ast.angle) * ast.orbitRadius
          );
          _euler.set(ast.rotX, ast.rotY, 0);
          _quat.setFromEuler(_euler);
          _scale.setScalar(ast.scale);
          _mat4.compose(_vec3A, _quat, _scale);
          asteroidBelt.setMatrixAt(i, _mat4);
        }
        asteroidBelt.instanceMatrix.needsUpdate = true;

        // Advance Collectible Starlight Crystals + Tractor Beam Pull
        const tractorRadius = 6.5 + (playerState.upgrades.tractor - 1) * 5.5;
        for (let i = 0; i < crystals.length; i++) {
          const c = crystals[i];
          if (!c.active) {
            c.respawnTimer -= dt;
            if (c.respawnTimer <= 0) {
              c.active = true;
              c.mesh.visible = true;
            }
            continue;
          }
          c.angle += 0.03 * simDt;
          const distToShip = c.mesh.position.distanceTo(playerState.position);
          if (gameStateRef.current === 'playing' && distToShip < tractorRadius) {
            c.mesh.position.lerp(playerState.position, 1 - Math.exp(-9 * dt));
          } else {
            c.mesh.position.set(
              Math.cos(c.angle) * c.orbitRadius,
              Math.sin(clock.elapsedTime * 2.2 + i) * 0.8,
              Math.sin(c.angle) * c.orbitRadius
            );
          }
          c.mesh.rotation.y += 1.8 * dt;
          c.mesh.rotation.x += 0.9 * dt;
        }

        // Advance Built Orbital Structures
        resourceTickTimer += dt;
        if (resourceTickTimer >= 5.0) {
          resourceTickTimer = 0;
          const extractors = builtOutposts.filter(
            (o) => o.info.type === 'extractor'
          ).length;
          if (extractors > 0 && gameStateRef.current === 'playing') {
            playerState.crystals += extractors * 6;
            playerState.titanium += extractors * 4;
            playerState.score += extractors * 35;
            markSaveDirty();
          }
        }

        for (let i = 0; i < builtOutposts.length; i++) {
          const out = builtOutposts[i];
          const hostPlanet = planetsRuntime[out.planetIndex];
          out.orbitAngle += 0.55 * dt;
          out.group.position.set(
            hostPlanet.rootGroup.position.x +
              Math.cos(out.orbitAngle) * out.orbitDist,
            1.2,
            hostPlanet.rootGroup.position.z +
              Math.sin(out.orbitAngle) * out.orbitDist
          );
          out.group.rotation.y += 0.8 * dt;

          if (out.info.type === 'station' && gameStateRef.current === 'playing') {
            if (playerState.position.distanceTo(out.group.position) < 28) {
              playerState.hull = Math.min(
                playerState.maxHull,
                playerState.hull + 15 * dt
              );
              playerState.shield = Math.min(
                playerState.maxShield,
                playerState.shield + 22 * dt
              );
            }
          }

          if (out.info.type === 'turret' && gameStateRef.current === 'playing') {
            out.fireCooldown -= dt;
            if (out.fireCooldown <= 0) {
              const targetPirate = pirates.find(
                (p) => p.active && p.position.distanceTo(out.group.position) < 95
              );
              if (targetPirate) {
                out.fireCooldown = 0.85;
                _vec3B
                  .copy(targetPirate.position)
                  .sub(out.group.position)
                  .normalize();
                fireLaser(out.group.position, _vec3B, false, false);
                soundEngine.playTurretLaser();
              }
            }
          }
        }

        // Title Screen Atmospheric Live-World Camera Pan
        if (gameStateRef.current === 'title') {
          titleCamAngle += 0.08 * dt;
          const camRadius = 128;
          camera.position.set(
            Math.cos(titleCamAngle) * camRadius,
            34 + Math.sin(titleCamAngle * 0.7) * 12,
            Math.sin(titleCamAngle) * camRadius
          );
          camera.lookAt(0, 0, 0);

          const earthPos = planetsRuntime[3].rootGroup.position;
          playerState.position.set(earthPos.x + 10, 2, earthPos.z + 12);
          playerShip.group.position.copy(playerState.position);
          playerShip.group.rotation.y = titleCamAngle + Math.PI;
        } else if (gameStateRef.current === 'playing') {
          // ACTIVE GAMEPLAY SIMULATION
          const tInput = touchInputRef.current;

          const keyTurnLeft =
            heldKeys.has('KeyA') || heldKeys.has('ArrowLeft') || heldKeys.has('KeyQ');
          const keyTurnRight =
            heldKeys.has('KeyD') ||
            heldKeys.has('ArrowRight') ||
            heldKeys.has('KeyE');
          const keyThrustForward = heldKeys.has('KeyW') || heldKeys.has('ArrowUp');
          const keyThrustReverse = heldKeys.has('KeyS') || heldKeys.has('ArrowDown');

          let turnInput = tInput.turnAxis;
          if (keyTurnLeft) turnInput = 1;
          if (keyTurnRight) turnInput = -1;

          let thrustInput = tInput.thrustAxis;
          if (keyThrustForward) thrustInput = 1;
          if (keyThrustReverse) thrustInput = -1;

          // Disengage Auto-Pilot if user manually steers or thrusts
          if (
            playerState.autoPilotActive &&
            (Math.abs(turnInput) > 0.15 || Math.abs(thrustInput) > 0.15)
          ) {
            playerState.autoPilotActive = false;
            playerState.activeAlert =
              'Manual Controls Detected — Auto-Pilot Disengaged';
            playerState.alertTimer = 2.0;
          }

          // Auto-Pilot / Full Self-Playing AI Commander Logic
          let aiWantsFire = false;
          if (playerState.autoPilotActive) {
            const targetPlanet = planetsRuntime[playerState.autoPilotPlanetIdx];
            const desiredDist = targetPlanet.data.radius + 13;

            // Check if a hostile pirate is very close (< 52u); if so, engage pirate briefly!
            let closePirate: PirateEnemy | null = null;
            let closePirateDist = 52;
            for (let pIdx = 0; pIdx < pirates.length; pIdx++) {
              const p = pirates[pIdx];
              if (!p.active) continue;
              const d = p.position.distanceTo(playerState.position);
              if (d < closePirateDist) {
                closePirateDist = d;
                closePirate = p;
              }
            }

            if (closePirate) {
              const dx = closePirate.position.x - playerState.position.x;
              const dz = closePirate.position.z - playerState.position.z;
              const targetYaw = Math.atan2(-dx, -dz);
              let angleDiff = targetYaw - playerState.yaw;
              while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
              while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
              turnInput = THREE.MathUtils.clamp(angleDiff * 3.0, -1, 1);
              thrustInput = closePirateDist > 24 ? 0.85 : 0.35;
              if (Math.abs(angleDiff) < 0.45) {
                aiWantsFire = true;
                if (playerState.missileCooldown <= 0) {
                  actionsRef.current.fireHomingMissile();
                }
              }
            } else {
              const dx =
                targetPlanet.rootGroup.position.x - playerState.position.x;
              const dz =
                targetPlanet.rootGroup.position.z - playerState.position.z;
              const distToCenter = Math.hypot(dx, dz);

              if (distToCenter > desiredDist + 4) {
                const targetYaw = Math.atan2(-dx, -dz);
                let angleDiff = targetYaw - playerState.yaw;
                while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                turnInput = THREE.MathUtils.clamp(angleDiff * 2.4, -1, 1);
                thrustInput = 1;
                // Fire at asteroids if passing through the Asteroid Belt
                if (
                  playerState.position.length() > 125 &&
                  playerState.position.length() < 158
                ) {
                  aiWantsFire = true;
                }
              } else {
                // Orbit smoothly around the planet for 4 seconds, auto-build if affordable, then advance
                thrustInput = 0.32;
                turnInput = 0.58;
                playerState.autoPilotOrbitTimer += dt;

                // Auto-build an orbital structure around this planet if none exists yet and resources allow
                const hasOutpostHere = builtOutposts.some(
                  (o) => o.planetIndex === playerState.autoPilotPlanetIdx
                );
                if (
                  !hasOutpostHere &&
                  playerState.crystals >= 50 &&
                  playerState.titanium >= 35
                ) {
                  actionsRef.current.buildStructureNearPlanet('extractor');
                }

                if (playerState.autoPilotOrbitTimer >= 4.0) {
                  playerState.autoPilotOrbitTimer = 0;
                  playerState.autoPilotPlanetIdx =
                    (playerState.autoPilotPlanetIdx + 1) %
                    planetsRuntime.length;
                  const nextP = planetsRuntime[playerState.autoPilotPlanetIdx];
                  playerState.activeAlert = `Auto-Play → ${nextP.data.name} (${nextP.data.hindiName})`;
                  playerState.alertTimer = 3.5;
                  soundEngine.playWarp();
                }
              }
            }
          }

          const isBoosting =
            (heldKeys.has('ShiftLeft') ||
              heldKeys.has('ShiftRight') ||
              tInput.boosting ||
              playerState.autoPilotActive) &&
            playerState.boostEnergy > 5;

          const turnSpeed = 2.4;
          playerState.yaw += turnInput * turnSpeed * dt;
          const targetRoll = turnInput * 0.48;
          playerState.bankRoll = THREE.MathUtils.damp(
            playerState.bankRoll,
            targetRoll,
            8,
            dt
          );

          _vec3A.set(
            -Math.sin(playerState.yaw),
            0,
            -Math.cos(playerState.yaw)
          );

          const engineBonus = 1 + (playerState.upgrades.engine - 1) * 0.18;
          const maxSpeed = (isBoosting ? 78 : 44) * engineBonus;

          if (thrustInput > 0.08) {
            playerState.speed = THREE.MathUtils.damp(
              playerState.speed,
              maxSpeed * thrustInput,
              4.5,
              dt
            );
          } else if (thrustInput < -0.08) {
            playerState.speed = THREE.MathUtils.damp(
              playerState.speed,
              18 * thrustInput,
              4.5,
              dt
            );
          } else {
            playerState.speed = THREE.MathUtils.damp(playerState.speed, 0, 2.8, dt);
          }

          if (isBoosting && thrustInput > 0.1 && !playerState.autoPilotActive) {
            playerState.boostEnergy = Math.max(0, playerState.boostEnergy - 26 * dt);
          } else {
            playerState.boostEnergy = Math.min(100, playerState.boostEnergy + 18 * dt);
          }

          playerState.velocity.copy(_vec3A).multiplyScalar(playerState.speed);
          playerState.position.addScaledVector(playerState.velocity, dt);

          // Wormhole Gate Teleportation Check (Zero-GC using _vec3D)
          if (wormholeCooldown <= 0) {
            if (
              playerState.position.distanceTo(innerWormhole.group.position) < 7.5
            ) {
              wormholeCooldown = 4.0;
              _vec3D.set(10, 0, 10);
              playerState.position
                .copy(outerWormhole.group.position)
                .add(_vec3D);
              soundEngine.playWarp();
              cameraShake = 0.6;
              playerState.activeAlert =
                'Wormhole Singularity Transit: Warped to Kuiper Belt Sector!';
              playerState.alertTimer = 3.5;
            } else if (
              playerState.position.distanceTo(outerWormhole.group.position) < 7.5
            ) {
              wormholeCooldown = 4.0;
              _vec3D.set(10, 0, 10);
              playerState.position
                .copy(innerWormhole.group.position)
                .add(_vec3D);
              soundEngine.playWarp();
              cameraShake = 0.6;
              playerState.activeAlert =
                'Wormhole Singularity Transit: Returned to Inner Solar Sector!';
              playerState.alertTimer = 3.5;
            }
          }

          const distFromSun = playerState.position.length();
          if (distFromSun > 405) {
            playerState.position.setLength(405);
          }
          if (distFromSun < 21) {
            playerState.position.setLength(21);
          }

          playerState.recoilStretch = THREE.MathUtils.damp(
            playerState.recoilStretch,
            isBoosting && thrustInput > 0.1 ? 0.16 : 0,
            10,
            dt
          );

          playerShip.group.position.copy(playerState.position);
          playerShip.group.rotation.set(0, playerState.yaw, playerState.bankRoll);
          playerShip.group.scale.set(
            1 - playerState.recoilStretch * 0.35,
            1 - playerState.recoilStretch * 0.35,
            1 + playerState.recoilStretch
          );

          const flameScale =
            0.6 +
            (Math.abs(playerState.speed) / 44) * 1.1 +
            Math.sin(clock.elapsedTime * 35) * 0.15;
          playerShip.thrusterLeft.scale.set(1, flameScale, 1);
          playerShip.thrusterRight.scale.set(1, flameScale, 1);

          const shieldRegen = 4.5 * (1 + (playerState.upgrades.shield - 1) * 0.4);
          playerState.shield = Math.min(
            playerState.maxShield,
            playerState.shield + shieldRegen * dt
          );
          playerState.shieldFlash = Math.max(0, playerState.shieldFlash - 2.5 * dt);
          (playerShip.shieldMesh.material as THREE.MeshBasicMaterial).opacity =
            playerState.shieldFlash * 0.45;

          // Firing Pulse Lasers & Homing Torpedoes
          playerState.fireCooldown -= dt;
          if (playerState.missileCooldown > 0) {
            playerState.missileCooldown = Math.max(
              0,
              playerState.missileCooldown - dt
            );
          }

          const fireRateCooldown = Math.max(
            0.09,
            0.18 - (playerState.upgrades.laser - 1) * 0.02
          );
          if (
            (heldKeys.has('Space') ||
              justPressedKeys.has('Space') ||
              tInput.firing ||
              aiWantsFire) &&
            playerState.fireCooldown <= 0
          ) {
            playerState.fireCooldown = fireRateCooldown;
            playerState.recoilStretch = -0.09;

            if (playerState.upgrades.laser >= 3) {
              _vec3C.set(_vec3A.z, 0, -_vec3A.x);
              _vec3B
                .copy(playerState.position)
                .addScaledVector(_vec3A, 2.5)
                .addScaledVector(_vec3C, -1.1);
              fireLaser(_vec3B, _vec3A, false, false);
              _vec3B
                .copy(playerState.position)
                .addScaledVector(_vec3A, 2.5)
                .addScaledVector(_vec3C, 1.1);
              fireLaser(_vec3B, _vec3A, false, false);
            } else {
              _vec3B.copy(playerState.position).addScaledVector(_vec3A, 2.6);
              fireLaser(_vec3B, _vec3A, false, false);
            }
            soundEngine.playLaser();
          }

          if (justPressedKeys.has('KeyR')) {
            actionsRef.current.fireHomingMissile();
          }
          if (justPressedKeys.has('Digit1')) {
            actionsRef.current.buildStructureNearPlanet('turret');
          }
          if (justPressedKeys.has('Digit2')) {
            actionsRef.current.buildStructureNearPlanet('extractor');
          }
          if (justPressedKeys.has('Digit3')) {
            actionsRef.current.buildStructureNearPlanet('station');
          }

          // Auto-scan planet when flying close
          const nearest = getNearestPlanet();
          if (
            nearest.dist < 18 &&
            !playerState.scannedPlanets.has(nearest.runtime.data.id)
          ) {
            playerState.scannedPlanets.add(nearest.runtime.data.id);
            playerState.score += 150;
            playerState.crystals += 15;
            soundEngine.playCollect();
            playerState.activeAlert = `Discovered & Scanned ${nearest.runtime.data.name} (${nearest.runtime.data.hindiName})! +150 Score`;
            playerState.alertTimer = 3.5;
            evaluateCampaignMissions();
            markSaveDirty();
          }

          // Collect Starlight Crystals
          for (let i = 0; i < crystals.length; i++) {
            const c = crystals[i];
            if (c.active && c.mesh.position.distanceTo(playerState.position) < 4.8) {
              c.active = false;
              c.mesh.visible = false;
              c.respawnTimer = 16;
              playerState.crystals += 16;
              playerState.titanium += 9;
              playerState.score += 75;
              soundEngine.playCollect();
              spawnExplosionParticles(c.mesh.position, 10, 0.7);
              markSaveDirty();
            }
          }

          // Update Enemy Void Pirates
          for (let i = 0; i < pirates.length; i++) {
            const p = pirates[i];
            if (!p.active) {
              p.respawnTimer -= dt;
              if (p.respawnTimer <= 0) {
                spawnPirateAtIndex(p, i);
              }
              continue;
            }

            const distToPlayer = p.position.distanceTo(playerState.position);
            _vec3B.copy(playerState.position).sub(p.position).normalize();

            if (distToPlayer > 28) {
              p.position.addScaledVector(
                _vec3B,
                (distToPlayer < 110 ? 22 : 12) * dt
              );
            } else {
              _vec3C.set(-_vec3B.z, 0, _vec3B.x);
              p.position.addScaledVector(_vec3C, 18 * dt);
            }

            p.group.position.copy(p.position);
            p.group.lookAt(playerState.position);

            if (distToPlayer < 85) {
              if (p.windupTimer > 0) {
                p.windupTimer -= dt;
                const progress = 1 - p.windupTimer / 0.65;
                const s = 1.6 - progress * 0.9;
                p.telegraphRing.scale.setScalar(s);
                (p.telegraphRing.material as THREE.MeshBasicMaterial).opacity =
                  0.35 + progress * 0.65;

                if (p.windupTimer <= 0) {
                  (p.telegraphRing.material as THREE.MeshBasicMaterial).opacity = 0;
                  fireLaser(p.position, _vec3B, true, false);
                  p.cooldownTimer = 2.4 + Math.random() * 1.2;
                }
              } else {
                p.cooldownTimer -= dt;
                if (p.cooldownTimer <= 0) {
                  p.windupTimer = 0.65;
                  soundEngine.playTelegraphAlert();
                }
              }
            } else {
              p.windupTimer = 0;
              (p.telegraphRing.material as THREE.MeshBasicMaterial).opacity = 0;
            }
          }

          // Update Laser Bolts, Homing Torpedoes & Collisions
          const laserDamage = 20 * (1 + (playerState.upgrades.laser - 1) * 0.35);

          for (let i = 0; i < laserPool.length; i++) {
            const b = laserPool[i];
            if (!b.active) continue;
            b.life -= dt;
            if (b.life <= 0) {
              b.active = false;
              b.mesh.visible = false;
              continue;
            }

            // Homing Missile steering toward nearest pirate
            if (b.isHomingMissile) {
              let closestPirate: PirateEnemy | null = null;
              let minD = 160;
              for (let pIdx = 0; pIdx < pirates.length; pIdx++) {
                const p = pirates[pIdx];
                if (!p.active) continue;
                const d = p.position.distanceTo(b.position);
                if (d < minD) {
                  minD = d;
                  closestPirate = p;
                }
              }
              if (closestPirate) {
                _vec3D
                  .copy(closestPirate.position)
                  .sub(b.position)
                  .normalize()
                  .multiplyScalar(105);
                b.velocity.lerp(_vec3D, 1 - Math.exp(-7 * dt));
              }
            }

            b.position.addScaledVector(b.velocity, dt);
            b.mesh.position.copy(b.position);

            if (b.isEnemy) {
              if (b.position.distanceTo(playerState.position) < 2.8) {
                b.active = false;
                b.mesh.visible = false;
                soundEngine.playHit();
                cameraShake = 0.45;
                playerState.shieldFlash = 1.0;
                spawnExplosionParticles(playerState.position, 8, 0.6);

                if (playerState.shield >= 14) {
                  playerState.shield -= 14;
                } else {
                  const rem = 14 - playerState.shield;
                  playerState.shield = 0;
                  playerState.hull = Math.max(0, playerState.hull - rem);
                }

                if (playerState.hull <= 0) {
                  soundEngine.playExplosion('heavy');
                  onGameEndRef.current('gameover');
                }
              }
            } else {
              const hitRadius = b.isHomingMissile ? 5.2 : 3.0;
              const hitDmg = b.isHomingMissile ? 75 : laserDamage;

              for (let pIdx = 0; pIdx < pirates.length; pIdx++) {
                const p = pirates[pIdx];
                if (p.active && b.position.distanceTo(p.position) < hitRadius) {
                  b.active = false;
                  b.mesh.visible = false;
                  p.hp -= hitDmg;
                  spawnExplosionParticles(
                    p.position,
                    b.isHomingMissile ? 16 : 7,
                    b.isHomingMissile ? 1.1 : 0.6
                  );

                  if (p.hp <= 0) {
                    p.active = false;
                    p.group.visible = false;
                    p.respawnTimer = 14;
                    playerState.piratesDestroyed += 1;
                    playerState.score += 200;
                    playerState.crystals += 20;
                    playerState.titanium += 15;
                    soundEngine.playExplosion('heavy');
                    hitstopTimer = 0.045;
                    cameraShake = 0.55;
                    spawnExplosionParticles(p.position, 22, 1.3);

                    if (playerState.piratesDestroyed % 4 === 0) {
                      playerState.waveNumber += 1;
                    }
                    evaluateCampaignMissions();
                    markSaveDirty();
                  } else {
                    soundEngine.playExplosion('small');
                  }
                  break;
                }
              }

              if (b.active) {
                for (let aIdx = 0; aIdx < asteroidCount; aIdx++) {
                  const ast = asteroidsData[aIdx];
                  if (!ast.active) continue;
                  _vec3C.set(
                    Math.cos(ast.angle) * ast.orbitRadius,
                    ast.yOffset,
                    Math.sin(ast.angle) * ast.orbitRadius
                  );
                  if (b.position.distanceTo(_vec3C) < ast.scale * 1.8) {
                    b.active = false;
                    b.mesh.visible = false;
                    ast.active = false;
                    ast.respawnTimer = 20;
                    playerState.asteroidsMined += 1;
                    playerState.titanium += 12;
                    playerState.crystals += 8;
                    playerState.score += 50;
                    soundEngine.playExplosion('small');
                    spawnExplosionParticles(_vec3C, 12, 0.8);
                    evaluateCampaignMissions();
                    markSaveDirty();
                    break;
                  }
                }
              }
            }
          }

          // Camera Choreography (Zero-GC using _vec3D)
          cameraShake = Math.max(0, cameraShake - 2.2 * dt);
          const shakeX = (Math.random() - 0.5) * cameraShake * 1.6;
          const shakeY = (Math.random() - 0.5) * cameraShake * 1.6;

          // Update True 3/4 Sliced 3D Planet Core Cutaway (Works on ALL worlds including the Sun!)
          const activeFocusId = focusPlanetIdRef.current;
          const cutawayOn = showCoreCutawayRef.current;
          for (let i = 0; i < planetsRuntime.length; i++) {
            const pr = planetsRuntime[i];
            const isTargetCutaway =
              cutawayOn && activeFocusId === pr.data.id;
            pr.coreGroup.visible = isTargetCutaway;
            pr.mesh.visible = !isTargetCutaway;
            pr.coreGroup.rotation.y += 0.35 * dt;
          }

          // Animate 14 Clickable Famous Stars + Toggle 3D Sun-Size Reference Comparison Hologram
          const starElapsed = clock.getElapsedTime();
          for (let s = 0; s < starsRuntime.length; s++) {
            const sr = starsRuntime[s];
            sr.photosphereMesh.rotation.y += 0.22 * dt;
            const pulse = 1 + Math.sin(starElapsed * 2.2 + s * 0.9) * 0.06;
            const baseScale = sr.data.visualRadius3D * 5.8 * pulse;
            sr.coronaSprite.scale.set(baseScale, baseScale, 1);
            sr.sunCompGroup.visible =
              activeFocusId === sr.data.id && showStarSunComparisonRef.current;
            if (sr.sunCompGroup.visible) {
              sr.sunCompGroup.rotation.y += 0.35 * dt;
            }
          }

          // Advance 45-Second Progressive Milky Way Exit Voyage when active!
          if (voyageActive && !activeFocusId) {
            voyageElapsed = Math.min(
              VOYAGE_DURATION_SEC,
              voyageElapsed + dt * voyageSpeedMult
            );
            const p = voyageElapsed / VOYAGE_DURATION_SEC;

            // Multi-Stage Real Cosmic Journey Curve (45 seconds total!)
            // Stage 1 (0–8s, p: 0..0.18): Solar System -> Oort Cloud (1.0x -> 3.2x)
            // Stage 2 (8–28s, p: 0.18..0.62): 20 Full Seconds Cruising Past 14 Famous Interstellar Stars (3.2x -> 26.0x)
            // Stage 3 (28–37s, p: 0.62..0.82): Rising Above the Milky Way Spiral Disk (26.0x -> 52.0x)
            // Stage 4 (37–45s, p: 0.82..1.00): Local Group -> Andromeda -> M87* -> Laniakea -> CMB (52.0x -> 88.0x)
            if (p < 0.18) {
              const tStage = p / 0.18;
              orbitZoomMultiplier = 1.0 * Math.pow(3.2, tStage);
              orbitElevation = THREE.MathUtils.lerp(0.24, 0.28, tStage);
            } else if (p < 0.62) {
              const tStage = (p - 0.18) / 0.44;
              orbitZoomMultiplier = 3.2 * Math.pow(26.0 / 3.2, tStage);
              orbitElevation = THREE.MathUtils.lerp(0.28, 0.40, tStage);
            } else if (p < 0.82) {
              const tStage = (p - 0.62) / 0.20;
              orbitZoomMultiplier = 26.0 * Math.pow(52.0 / 26.0, tStage);
              orbitElevation = THREE.MathUtils.lerp(0.40, 0.64, tStage);
            } else {
              const tStage = (p - 0.82) / 0.18;
              orbitZoomMultiplier = 52.0 * Math.pow(88.0 / 52.0, tStage);
              orbitElevation = THREE.MathUtils.lerp(0.64, 0.56, tStage);
            }

            if (!isDraggingOrbit && !isTwoFingerGesture) {
              orbitAzimuth += 0.17 * dt * voyageSpeedMult;
            }
            if (voyageElapsed >= VOYAGE_DURATION_SEC) {
              voyageActive = false;
            }
          }

          displayedZoom = THREE.MathUtils.damp(
            displayedZoom,
            orbitZoomMultiplier,
            voyageActive ? 4.5 : 3.2,
            dt
          );

          const focusedPlanetRuntime = activeFocusId
            ? planetsRuntime.find((p) => p.data.id === activeFocusId)
            : null;
          const focusedStarRuntime =
            activeFocusId && !focusedPlanetRuntime
              ? starsRuntime.find((s) => s.data.id === activeFocusId)
              : null;
          const focusedProbeRuntime =
            activeFocusId && !focusedPlanetRuntime && !focusedStarRuntime
              ? probesRuntime.find((prb) => prb.info.id === activeFocusId)
              : null;
          const focusedGalaxyRuntime =
            activeFocusId &&
            !focusedPlanetRuntime &&
            !focusedStarRuntime &&
            !focusedProbeRuntime
              ? galaxiesRuntime.find((g) => g.data.id === activeFocusId)
              : null;

          if (!isDraggingOrbit && !isTwoFingerGesture && !voyageActive) {
            orbitAzimuth += 0.11 * dt;
          }

          if (activeFocusId === 'blackhole') {
            const dist = 46 * displayedZoom;
            const horiz = Math.cos(orbitElevation) * dist;
            _vec3CamTarget.set(
              blackHoleGroup.position.x + Math.cos(orbitAzimuth) * horiz,
              blackHoleGroup.position.y + Math.sin(orbitElevation) * dist,
              blackHoleGroup.position.z + Math.sin(orbitAzimuth) * horiz
            );
            camera.position.lerp(_vec3CamTarget, 1 - Math.exp(-7.0 * dt));
            camera.lookAt(blackHoleGroup.position);
            playerShip.group.visible = false;
          } else if (focusedPlanetRuntime) {
            // Interactive 360-degree Solar System Scope Orbital Camera (Touch/Mouse Drag + Pinch/Wheel Zoom)
            const baseDist = Math.max(6.8, focusedPlanetRuntime.data.radius * 2.65);
            const inspectDist = baseDist * displayedZoom;
            const horiz = Math.cos(orbitElevation) * inspectDist;
            _vec3CamTarget.set(
              focusedPlanetRuntime.rootGroup.position.x +
                Math.cos(orbitAzimuth) * horiz,
              focusedPlanetRuntime.rootGroup.position.y +
                Math.sin(orbitElevation) * inspectDist,
              focusedPlanetRuntime.rootGroup.position.z +
                Math.sin(orbitAzimuth) * horiz
            );
            camera.position.lerp(_vec3CamTarget, 1 - Math.exp(-8.0 * dt));
            camera.lookAt(focusedPlanetRuntime.rootGroup.position);
            camera.fov = THREE.MathUtils.damp(camera.fov, 48, 6, dt);
            camera.updateProjectionMatrix();
            playerShip.group.visible = false;
          } else if (focusedStarRuntime) {
            // Close-up 3D Stellar Inspection Camera (with 3D Sun-Size Comparison side-by-side!)
            const starBaseDist = Math.max(
              24,
              focusedStarRuntime.data.visualRadius3D * 4.4
            );
            const starDist =
              starBaseDist * Math.max(0.45, Math.min(4.5, displayedZoom));
            const horiz = Math.cos(orbitElevation) * starDist;
            _vec3CamTarget.set(
              focusedStarRuntime.group.position.x + Math.cos(orbitAzimuth) * horiz,
              focusedStarRuntime.group.position.y + Math.sin(orbitElevation) * starDist,
              focusedStarRuntime.group.position.z + Math.sin(orbitAzimuth) * horiz
            );
            const starGap = camera.position.distanceTo(_vec3CamTarget);
            const starLerpSpeed = starGap > 900 ? 2.4 : 6.8;
            camera.position.lerp(_vec3CamTarget, 1 - Math.exp(-starLerpSpeed * dt));
            camera.lookAt(focusedStarRuntime.group.position);
            camera.fov = THREE.MathUtils.damp(camera.fov, 50, 6, dt);
            camera.updateProjectionMatrix();
            playerShip.group.visible = false;
          } else if (focusedProbeRuntime) {
            // Close-up 3D Orbital Inspection of Historic Spacecraft / Viman!
            const probeDist = 6.5 * Math.max(0.45, Math.min(4.0, displayedZoom));
            const horiz = Math.cos(orbitElevation) * probeDist;
            _vec3CamTarget.set(
              focusedProbeRuntime.group.position.x + Math.cos(orbitAzimuth) * horiz,
              focusedProbeRuntime.group.position.y + Math.sin(orbitElevation) * probeDist,
              focusedProbeRuntime.group.position.z + Math.sin(orbitAzimuth) * horiz
            );
            camera.position.lerp(_vec3CamTarget, 1 - Math.exp(-8.5 * dt));
            camera.lookAt(focusedProbeRuntime.group.position);
            camera.fov = THREE.MathUtils.damp(camera.fov, 46, 6, dt);
            camera.updateProjectionMatrix();
            playerShip.group.visible = false;
          } else if (focusedGalaxyRuntime) {
            // Intergalactic 3D Camera Orbit around Deep-Space Galaxy, Nebula, Supercluster or CMB!
            const galDist =
              focusedGalaxyRuntime.data.scale3D *
              1.55 *
              Math.max(0.35, Math.min(4.5, displayedZoom));
            const horiz = Math.cos(orbitElevation) * galDist;
            _vec3CamTarget.set(
              focusedGalaxyRuntime.group.position.x + Math.cos(orbitAzimuth) * horiz,
              focusedGalaxyRuntime.group.position.y + Math.sin(orbitElevation) * galDist,
              focusedGalaxyRuntime.group.position.z + Math.sin(orbitAzimuth) * horiz
            );
            // Smooth cinematic glide across intergalactic distances instead of hard-snapping!
            const galGap = camera.position.distanceTo(_vec3CamTarget);
            const galLerpSpeed = galGap > 1800 ? 1.85 : 5.5;
            camera.position.lerp(_vec3CamTarget, 1 - Math.exp(-galLerpSpeed * dt));
            camera.lookAt(focusedGalaxyRuntime.group.position);
            camera.fov = THREE.MathUtils.damp(camera.fov, 54, 6, dt);
            camera.updateProjectionMatrix();
            playerShip.group.visible = false;
          } else if (cameraModeRef.current === 'chase') {
            _vec3D.set(shakeX, 6.8 + shakeY, 0);
            _vec3CamTarget
              .copy(playerState.position)
              .addScaledVector(_vec3A, -16.5 * displayedZoom)
              .add(_vec3D);

            camera.position.lerp(_vec3CamTarget, 1 - Math.exp(-8.5 * dt));
            _vec3LookAt
              .copy(playerState.position)
              .addScaledVector(_vec3A, 14);
            camera.lookAt(_vec3LookAt);

            const targetFov = isBoosting && thrustInput > 0.1 ? 72 : 60;
            camera.fov = THREE.MathUtils.damp(camera.fov, targetFov, 6, dt);
            camera.updateProjectionMatrix();
            playerShip.group.visible = true;
          } else if (cameraModeRef.current === 'cockpit') {
            _vec3D.set(shakeX * 0.5, 0.75 + shakeY * 0.5, 0);
            _vec3CamTarget
              .copy(playerState.position)
              .addScaledVector(_vec3A, 1.8)
              .add(_vec3D);
            camera.position.copy(_vec3CamTarget);
            _vec3LookAt
              .copy(playerState.position)
              .addScaledVector(_vec3A, 40);
            camera.lookAt(_vec3LookAt);
            playerShip.group.visible = false;
          } else {
            // Interactive 360-degree Multi-Scale Solar System -> 14 Famous Stars -> Milky Way -> Local Group Galaxies -> CMB Camera!
            const mapDist = 175 * displayedZoom;
            const mapElev = Math.max(-1.25, Math.min(1.3, orbitElevation + 0.18));
            _vec3CamTarget.set(
              cameraPanOffset.x + Math.cos(orbitAzimuth) * Math.cos(mapElev) * mapDist,
              cameraPanOffset.y + Math.sin(mapElev) * mapDist,
              cameraPanOffset.z + Math.sin(orbitAzimuth) * Math.cos(mapElev) * mapDist
            );
            camera.position.lerp(_vec3CamTarget, 1 - Math.exp(-5.8 * dt));
            camera.lookAt(cameraPanOffset);
            playerShip.group.visible = false;
          }
        }

        // Update Active Explosion Particles
        for (let i = 0; i < particlePool.length; i++) {
          const p = particlePool[i];
          if (!p.active) continue;
          p.life -= dt;
          if (p.life <= 0) {
            p.active = false;
            p.mesh.visible = false;
            continue;
          }
          p.mesh.position.addScaledVector(p.velocity, dt);
          const ratio = p.life / p.maxLife;
          p.mesh.scale.setScalar(ratio * 1.3);
        }

        if (playerState.alertTimer > 0) {
          playerState.alertTimer -= dt;
          if (playerState.alertTimer <= 0) {
            playerState.activeAlert = null;
          }
        }

        // Sync Telemetry to React HUD at a gentle ~2.5Hz (0.4s) to prevent React re-render lag on Android phones!
        hudSyncTimer += dt;
        if (hudSyncTimer >= 0.4) {
          hudSyncTimer = 0;
          const nearest = getNearestPlanet();

          const radarRange = 240;
          const cosY = Math.cos(playerState.yaw);
          const sinY = Math.sin(playerState.yaw);
          const blips: RadarBlip[] = [];

          const pushBlip = (
            worldPos: THREE.Vector3,
            color: string,
            size: number,
            label?: string
          ) => {
            const dx = (worldPos.x - playerState.position.x) / radarRange;
            const dz = (worldPos.z - playerState.position.z) / radarRange;
            const rx = dx * cosY - dz * sinY;
            const rz = dx * sinY + dz * cosY;
            blips.push({ x: rx, z: rz, color, size, label });
          };

          planetsRuntime.forEach((pr) => {
            pushBlip(
              pr.rootGroup.position,
              pr.data.color,
              pr.data.id === 'sun' ? 4.2 : 2.6,
              pr.data.name.slice(0, 3)
            );
          });

          pirates.forEach((p) => {
            if (p.active) {
              pushBlip(p.position, '#ef4444', 2.2);
            }
          });

          builtOutposts.forEach((o) => {
            pushBlip(o.group.position, '#10b981', 1.8);
          });

          pushBlip(innerWormhole.group.position, '#a855f7', 2.8, 'WH');
          pushBlip(outerWormhole.group.position, '#a855f7', 2.8, 'WH');

          const missileReadyPct = Math.round(
            Math.max(0, 1 - playerState.missileCooldown / 3.2) * 100
          );

          // Project 3D Planet, Famous Star, Black Hole & Deep-Space Galaxy coordinates to 2D Screen Space
          const projectedLabels: ProjectedCelestialLabel[] = [];
          const projectWorldPos = (
            id: string,
            name: string,
            hindiName: string,
            color: string,
            worldPos: THREE.Vector3,
            yOffset: number,
            distKm: string,
            category: 'planet' | 'blackhole' | 'probe' | 'galaxy' | 'star' = 'planet'
          ) => {
            _vec3C.copy(worldPos);
            _vec3C.y += yOffset;
            _vec3C.project(camera);
            const isInFront = _vec3C.z > -1 && _vec3C.z < 1;
            const xPct = (_vec3C.x * 0.5 + 0.5) * 100;
            const yPct = (-_vec3C.y * 0.5 + 0.5) * 100;
            const onScreen =
              isInFront && xPct >= 4 && xPct <= 96 && yPct >= 10 && yPct <= 86;
            projectedLabels.push({
              id,
              name,
              hindiName,
              color,
              x: xPct,
              y: yPct,
              visible: onScreen,
              distKm,
              category,
            });
          };

          // 1. Show Planet labels when inside Solar System zoom range (displayedZoom <= 5.5)
          if (displayedZoom <= 5.5) {
            planetsRuntime.forEach((pr) => {
              projectWorldPos(
                pr.data.id,
                pr.data.name,
                pr.data.hindiName,
                pr.data.color,
                pr.rootGroup.position,
                pr.data.radius + 2.2,
                pr.data.distanceFromSunKm,
                'planet'
              );
            });
          }

          // 2. Show 14 Clickable Famous Interstellar Stars while traveling through the Milky Way (2.1x to 48x)
          if (displayedZoom >= 2.1 && displayedZoom <= 48.0) {
            starsRuntime.forEach((sr) => {
              projectWorldPos(
                sr.data.id,
                `${sr.data.name} (${sr.data.sunRadiusMultiplier}×☉)`,
                `${sr.data.hindiName.split('(')[0].trim()} (${sr.data.sunRadiusMultiplier}× सूर्य)`,
                sr.data.color,
                sr.group.position,
                sr.data.visualRadius3D + 16,
                sr.data.distanceLightYears,
                'star'
              );
            });
          }

          if (displayedZoom <= 18.0) {
            projectWorldPos(
              'blackhole',
              'Sagittarius A*',
              'ब्लैक होल (Sgr A*)',
              '#f59e0b',
              blackHoleGroup.position,
              18,
              '26,670 LY',
              'blackhole'
            );
          }

          // 3. Project Extragalactic Galaxies, Superclusters & CMB Horizon when leaving the Milky Way!
          if (displayedZoom >= 14.0) {
            galaxiesRuntime.forEach((gal) => {
              projectWorldPos(
                gal.data.id,
                gal.data.name,
                gal.data.hindiName,
                gal.data.color,
                gal.group.position,
                gal.data.scale3D * 0.45,
                gal.data.distanceLightYears,
                'galaxy'
              );
            });
          }

          // Compute Live Cosmic Depth Zone Name & Distance Indicator
          let cosmicZoneEn = 'Solar System (Sun & 8 Planets)';
          let cosmicZoneHi = 'सौर मंडल (सूर्य व 8 ग्रह)';
          let cosmicDistanceLabel = '0.0005 Light-Years (30 AU)';

          if (displayedZoom >= 68) {
            cosmicZoneEn = 'Observable Universe & CMB Edge';
            cosmicZoneHi = 'दृश्य ब्रह्मांड और CMB सीमा (46.5 अरब प्रकाश-वर्ष)';
            cosmicDistanceLabel = '46.5 Billion Light-Years';
          } else if (displayedZoom >= 46) {
            cosmicZoneEn = 'Local Group & Andromeda (M31)';
            cosmicZoneHi = 'लोकल ग्रुप आकाशगंगाएं व एंड्रोमेडा (M31)';
            cosmicDistanceLabel = '2.5 – 520 Million Light-Years';
          } else if (displayedZoom >= 26) {
            cosmicZoneEn = 'Exiting Milky Way Spiral Galaxy';
            cosmicZoneHi = 'मिल्की वे आकाशगंगा से बाहर निकल रहे हैं';
            cosmicDistanceLabel = '55,000 – 105,700 Light-Years';
          } else if (displayedZoom >= 10) {
            cosmicZoneEn = 'Milky Way Hypergiant Stars (Betelgeuse · Stephenson 2-18)';
            cosmicZoneHi = 'मिल्की वे के महाविशाल तारे (बेटेलग्यूज़ · स्टीफेंसन 2-18)';
            cosmicDistanceLabel = '640 – 19,000 Light-Years';
          } else if (displayedZoom >= 3.0) {
            cosmicZoneEn = 'Local Interstellar Neighborhood (Proxima · Sirius · Vega)';
            cosmicZoneHi = 'इंटरस्टेलर तारा क्षेत्र (प्रॉक्सिमा · सीरियस · वेगा)';
            cosmicDistanceLabel = '4.2 – 430 Light-Years';
          } else if (displayedZoom >= 1.9) {
            cosmicZoneEn = 'Kuiper Belt & Oort Cloud Boundary';
            cosmicZoneHi = 'कुइपर बेल्ट व ऊर्ट क्लाउड सीमा';
            cosmicDistanceLabel = '1.5 Light-Years';
          }

          onTelemetryRef.current({
            hull: Math.round(playerState.hull),
            maxHull: playerState.maxHull,
            shield: Math.round(playerState.shield),
            maxShield: playerState.maxShield,
            boostEnergy: Math.round(playerState.boostEnergy),
            missileReadyPct,
            score: Math.round(playerState.score),
            crystals: Math.round(playerState.crystals),
            titanium: Math.round(playerState.titanium),
            speed: Math.round(Math.abs(playerState.speed) * 18),
            fps: Math.round(rollingFps),
            shipYaw: playerState.yaw,
            autoPilotActive: playerState.autoPilotActive,
            autoPilotTargetName: playerState.autoPilotActive
              ? planetsRuntime[playerState.autoPilotPlanetIdx]?.data.name ?? null
              : null,
            nearestPlanet: nearest.runtime.data,
            nearestDistance: Math.round(nearest.dist),
            scannedPlanets: Array.from(playerState.scannedPlanets),
            discoveredProbes: Array.from(playerState.discoveredProbes),
            builtOutposts: builtOutposts.map((o) => o.info),
            piratesDestroyed: playerState.piratesDestroyed,
            asteroidsMined: playerState.asteroidsMined,
            waveNumber: playerState.waveNumber,
            activeAlert: playerState.activeAlert,
            upgrades: { ...playerState.upgrades },
            completedMissions: Array.from(playerState.completedMissions),
            radarBlips: blips,
            projectedLabels,
            voyageActive,
            voyageProgressPct: Math.round(
              (voyageElapsed / VOYAGE_DURATION_SEC) * 100
            ),
            voyageElapsedSec: Math.round(voyageElapsed),
            voyageSpeedMultiplier: voyageSpeedMult,
            cosmicZoneEn,
            cosmicZoneHi,
            cosmicDistanceLabel,
          });
        }

        justPressedKeys.clear();
        renderer.render(scene, camera);

        if (isSoftwareGl) afterDraw(tick);
        else frameId = requestAnimationFrame(tick);
      }

      frameId = requestAnimationFrame(tick);

      const onResize = () => {
        if (!container) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', onResize);

      return () => {
        isDisposed = true;
        flushSaveToStorage();
        cancelAnimationFrame(frameId);
        clearTimeout(frameId);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        window.removeEventListener('blur', onWindowBlur);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        renderer.domElement.removeEventListener('pointerdown', onPointerDown);
        renderer.domElement.removeEventListener('wheel', onWheel);
        renderer.domElement.removeEventListener('touchstart', onTouchStart);
        renderer.domElement.removeEventListener('touchmove', onTouchMove);
        renderer.domElement.removeEventListener('touchend', onTouchEnd);

        // Full Three.js GPU VRAM cleanup
        scene.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry?.dispose();
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose());
            } else {
              obj.material?.dispose();
            }
          }
        });
        envRT.dispose();
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    }, []);

    return (
      <div
        ref={canvasMountRef}
        className="absolute inset-0 w-full h-full overflow-hidden bg-[#040711]"
      />
    );
  }
);
