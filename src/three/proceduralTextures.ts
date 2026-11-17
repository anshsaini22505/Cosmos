import * as THREE from 'three';

const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * High-speed Smooth Bilinear 256x256 Permutation Lattice.
 * Initializes in <1ms and provides silky-smooth, non-blocky multi-octave fBm
 * so 1024x512 high-definition planet textures & Milky Way skyboxes generate
 * rapidly without hanging mobile CPUs.
 */
const GRID = 256;
const MASK = GRID - 1;
const lattice = new Float32Array(GRID * GRID);

(function initLattice() {
  let seed = 987654321;
  for (let i = 0; i < lattice.length; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    lattice[i] = (seed & 0xffff) / 0xffff;
  }
})();

function smoothNoise(x: number, y: number, periodX: number, periodY: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;

  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);

  const x0 = ((xi % periodX) + periodX) % periodX & MASK;
  const x1 = (((xi + 1) % periodX) + periodX) % periodX & MASK;
  const y0 = ((yi % periodY) + periodY) % periodY & MASK;
  const y1 = (((yi + 1) % periodY) + periodY) % periodY & MASK;

  const a = lattice[(y0 << 8) + x0];
  const b = lattice[(y0 << 8) + x1];
  const c = lattice[(y1 << 8) + x0];
  const d = lattice[(y1 << 8) + x1];

  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbmSeamless(
  u: number,
  v: number,
  baseFreqX: number,
  baseFreqY: number,
  octaves: number = 4,
  seedOffset: number = 0
): number {
  let sum = 0;
  let amp = 0.52;
  let fx = baseFreqX;
  let fy = baseFreqY;
  let norm = 0;

  for (let i = 0; i < octaves; i++) {
    sum +=
      smoothNoise(
        u * fx + seedOffset * 13.7,
        v * fy + seedOffset * 9.3,
        fx,
        fy
      ) * amp;
    norm += amp;
    amp *= 0.5;
    fx *= 2;
    fy *= 2;
  }
  return sum / norm;
}

/**
 * Custom GLSL Fresnel Atmospheric Scattering & Limb Glow Shader (Solar System Scope Style)
 */
export function createAtmosphereFresnelMaterial(
  colorHex: number,
  intensity: number = 1.35,
  power: number = 2.6
): THREE.ShaderMaterial {
  const color = new THREE.Color(colorHex);
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: color },
      uIntensity: { value: intensity },
      uPower: { value: power },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uIntensity;
      uniform float uPower;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        vec3 viewDir = normalize(vViewPosition);
        float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), uPower);
        gl_FragColor = vec4(uColor, clamp(fresnel * uIntensity, 0.0, 0.95));
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.BackSide,
  });
}

/**
 * Solar System Scope Style 360° Milky Way Galactic Panorama Skybox Texture
 */
export function createMilkyWayPanoramaTexture(): THREE.CanvasTexture {
  const cacheKey = 'milky_way_skybox_v2';
  const existing = textureCache.get(cacheKey);
  if (existing) return existing;

  const w = 1024;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // 1. Deep space base gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#02040a');
  bgGrad.addColorStop(0.35, '#050b1a');
  bgGrad.addColorStop(0.5, '#0b1630');
  bgGrad.addColorStop(0.65, '#050b1a');
  bgGrad.addColorStop(1, '#02040a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. Milky Way Galactic Plane Band & Dark Dust Rift
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  for (let y = 0; y < h; y++) {
    const v = y / h;
    for (let x = 0; x < w; x++) {
      const u = x / w;
      const idx = (y * w + x) * 4;

      // Tilted galactic equator curve
      const waveCenter = 0.5 + Math.sin(u * Math.PI * 2) * 0.14;
      const distFromPlane = Math.abs(v - waveCenter);
      const bandProfile = Math.exp(-distFromPlane * distFromPlane * 38);

      if (bandProfile > 0.02) {
        const nCloud = fbmSeamless(u, v, 6, 4, 4, 11);
        const nRift = fbmSeamless(u, v, 12, 8, 3, 27);
        // Galactic center bulge near u = 0.5
        const bulge = Math.exp(-Math.pow((u - 0.5) * 3.5, 2));
        const dustMask = nRift > 0.54 && distFromPlane < 0.055 ? 0.28 : 1.0;
        const glow = bandProfile * nCloud * dustMask * (0.85 + bulge * 0.95);

        data[idx] = Math.min(255, data[idx] + Math.round(glow * (145 + bulge * 95)));
        data[idx + 1] = Math.min(255, data[idx + 1] + Math.round(glow * (120 + bulge * 55)));
        data[idx + 2] = Math.min(255, data[idx + 2] + Math.round(glow * (185 - bulge * 20)));
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // 3. Sprinkle 4,500 crisp multi-colored stars across the Milky Way
  let starSeed = 420099;
  const rand = () => {
    starSeed = (starSeed * 1664525 + 1013904223) >>> 0;
    return (starSeed & 0xffff) / 0xffff;
  };

  const starPalette = ['#ffffff', '#bae6fd', '#fde68a', '#fef08a', '#c7d2fe', '#fbcfe8'];
  for (let i = 0; i < 4500; i++) {
    const u = rand();
    // Concentrate 60% of stars near the Milky Way band
    const inBand = i < 2700;
    const waveCenter = 0.5 + Math.sin(u * Math.PI * 2) * 0.14;
    const v = inBand
      ? Math.max(0.02, Math.min(0.98, waveCenter + (rand() - 0.5) * 0.26))
      : rand();

    const sx = u * w;
    const sy = v * h;
    const radius = rand() > 0.94 ? 1.45 : rand() > 0.7 ? 0.95 : 0.6;
    ctx.fillStyle = starPalette[i % starPalette.length];
    ctx.globalAlpha = 0.45 + rand() * 0.55;
    ctx.beginPath();
    ctx.arc(sx, sy, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  textureCache.set(cacheKey, tex);
  return tex;
}

/**
 * Solar System Scope Style Volumetric Sun Corona & Lens Flare Starburst Sprite
 */
export function createSunGlowSpriteTexture(): THREE.CanvasTexture {
  const cacheKey = 'sun_lens_flare_v2';
  const existing = textureCache.get(cacheKey);
  if (existing) return existing;

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const cx = size / 2;
  const cy = size / 2;

  // Radial corona glow
  const grad = ctx.createRadialGradient(cx, cy, 8, cx, cy, 250);
  grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
  grad.addColorStop(0.12, 'rgba(254, 240, 138, 0.95)');
  grad.addColorStop(0.28, 'rgba(251, 191, 36, 0.65)');
  grad.addColorStop(0.55, 'rgba(234, 88, 12, 0.25)');
  grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Subtle Solar System Scope starburst rays
  ctx.save();
  ctx.translate(cx, cy);
  for (let i = 0; i < 12; i++) {
    ctx.rotate(Math.PI / 6);
    const rayGrad = ctx.createLinearGradient(0, -240, 0, 240);
    rayGrad.addColorStop(0, 'rgba(254, 240, 138, 0)');
    rayGrad.addColorStop(0.45, 'rgba(254, 240, 138, 0.16)');
    rayGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.35)');
    rayGrad.addColorStop(0.55, 'rgba(254, 240, 138, 0.16)');
    rayGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = rayGrad;
    ctx.fillRect(-2.5, -240, 5, 480);
  }
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  textureCache.set(cacheKey, tex);
  return tex;
}

/**
 * High-Definition Smooth Bilinear 1024x512 Planetary Surface Texture Generator
 */
export function createPlanetTexture(
  planetId: string,
  maxAnisotropy: number = 8
): THREE.CanvasTexture {
  const cacheKey = `surf_scope_hd_${planetId}`;
  const existing = textureCache.get(cacheKey);
  if (existing) return existing;

  const w = 1024;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(w, h);
  const data = imgData.data;

  for (let y = 0; y < h; y++) {
    const v = y / h;
    const lat = Math.abs(v - 0.5) * 2;
    const rowOffset = y * w * 4;

    for (let x = 0; x < w; x++) {
      const u = x / w;
      const idx = rowOffset + x * 4;
      let r = 128;
      let g = 128;
      let b = 128;

      const n1 = fbmSeamless(u, v, 4, 2, 4, 1);
      const n2 = fbmSeamless(u, v, 10, 5, 3, 5);
      const n3 = smoothNoise(u * 28, v * 14, 28, 14);
      const n = n1 * 0.58 + n2 * 0.28 + n3 * 0.14;

      if (planetId === 'sun') {
        const gran = fbmSeamless(u + n2 * 0.08, v + n1 * 0.08, 16, 8, 3, 9);
        const flare = Math.pow(gran, 1.4);
        r = 255;
        g = Math.min(255, Math.max(95, Math.round(125 + flare * 135)));
        b = Math.min(255, Math.max(15, Math.round(18 + Math.pow(flare, 2.2) * 210)));
      } else if (planetId === 'mercury') {
        const crater = Math.abs(n2 - 0.5) < 0.045 ? -26 : 0;
        const ray = n3 > 0.76 ? 24 : 0;
        const base = 92 + n * 95 + crater + ray;
        r = base + 8;
        g = base + 4;
        b = base;
      } else if (planetId === 'venus') {
        const swirl = fbmSeamless(u + v * 0.35, v + n1 * 0.12, 6, 4, 4, 14);
        const chev = Math.sin((v + swirl * 0.18) * 16) * 0.5 + 0.5;
        r = 218 + chev * 34;
        g = 152 + chev * 52 + n2 * 16;
        b = 68 + chev * 35;
      } else if (planetId === 'earth') {
        const cont = fbmSeamless(u, v, 4, 2, 5, 3);
        if (lat > 0.85 - n2 * 0.07) {
          r = 244;
          g = 250;
          b = 255;
        } else if (cont > 0.495) {
          const elev = (cont - 0.495) / 0.505;
          if (elev > 0.58) {
            // Snow-capped mountain ranges (Himalayas / Andes)
            r = 155 + elev * 85;
            g = 148 + elev * 85;
            b = 142 + elev * 85;
          } else if (lat < 0.28 && n2 > 0.49) {
            // Golden deserts (Sahara / Arabia / Australia)
            r = 212 - n3 * 22;
            g = 176 - n3 * 20;
            b = 112 - n3 * 18;
          } else {
            // Lush emerald forests & plains
            r = 28 + n2 * 48;
            g = 115 + n1 * 62;
            b = 38 + n3 * 25;
          }
        } else {
          // Deep blue bathymetry + turquoise coastal shelves
          const shelf = Math.pow(cont / 0.495, 2.2);
          r = 6 + shelf * 28;
          g = 42 + shelf * 88;
          b = 118 + shelf * 112;
        }
      } else if (planetId === 'mars') {
        if (lat > 0.89 - n1 * 0.05) {
          r = 245;
          g = 236;
          b = 228;
        } else {
          const basalt = n1 < 0.43 ? -34 : 0;
          r = Math.min(255, 178 + n * 68 + basalt);
          g = Math.max(28, 74 + n * 48 + basalt * 0.6);
          b = Math.max(18, 42 + n * 28 + basalt * 0.4);
        }
      } else if (planetId === 'jupiter') {
        const turb = fbmSeamless(u, v, 8, 6, 3, 21) * 0.065;
        const jet = Math.sin((v + turb) * 38);
        const du = (u - 0.56) * 3.2;
        const dv = (v - 0.63) * 6.5;
        const spotDist = du * du + dv * dv;
        if (spotDist < 0.14) {
          const blend = 1 - spotDist / 0.14;
          r = 222 + blend * 30;
          g = 76 + (1 - blend) * 62;
          b = 46 + (1 - blend) * 38;
        } else if (jet > 0.18) {
          r = 238 - n3 * 18;
          g = 208 - n3 * 20;
          b = 168 - n3 * 18;
        } else if (jet < -0.18) {
          r = 182 + n2 * 24;
          g = 110 + n2 * 18;
          b = 64 + n2 * 14;
        } else {
          r = 214;
          g = 172;
          b = 128;
        }
      } else if (planetId === 'saturn') {
        const turb = n2 * 0.03;
        const band = Math.sin((v + turb) * 42);
        r = 232 + band * 18;
        g = 202 + band * 18;
        b = 138 + band * 14;
      } else if (planetId === 'uranus') {
        const band = Math.sin(v * 18 + n1 * 1.1) * 14;
        r = 88 + band;
        g = 220 + band;
        b = 240 + band * 0.5;
      } else if (planetId === 'neptune') {
        const band = Math.sin((v + n2 * 0.05) * 26) * 22;
        r = 26 + Math.max(0, band);
        g = 88 + band;
        b = 222 + band;
      } else {
        const du = (u - 0.5) * 2.8;
        const dv = (v - 0.52) * 3.0;
        const heart = du * du + dv * dv < 0.16;
        r = heart ? 240 : 152 + n * 45;
        g = heart ? 230 : 138 + n * 40;
        b = heart ? 220 : 128 + n * 35;
      }

      data[idx] = Math.max(0, Math.min(255, r));
      data[idx + 1] = Math.max(0, Math.min(255, g));
      data[idx + 2] = Math.max(0, Math.min(255, b));
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = Math.min(8, maxAnisotropy);
  tex.needsUpdate = true;

  textureCache.set(cacheKey, tex);
  return tex;
}

/**
 * Smooth 512x256 Bump Map Generator
 */
export function createPlanetBumpTexture(
  planetId: string,
  maxAnisotropy: number = 4
): THREE.CanvasTexture {
  const cacheKey = `bump_scope_${planetId}`;
  const existing = textureCache.get(cacheKey);
  if (existing) return existing;

  const w = 512;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(w, h);
  const data = imgData.data;

  for (let y = 0; y < h; y++) {
    const v = y / h;
    const rowOffset = y * w * 4;
    for (let x = 0; x < w; x++) {
      const u = x / w;
      const idx = rowOffset + x * 4;
      const n = fbmSeamless(u, v, 8, 4, 3, 7);
      const val = Math.round(n * 255);
      data[idx] = val;
      data[idx + 1] = val;
      data[idx + 2] = val;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = Math.min(4, maxAnisotropy);
  tex.needsUpdate = true;

  textureCache.set(cacheKey, tex);
  return tex;
}

/**
 * Smooth 512x256 Swirling Cloud Layer Texture for Earth
 */
export function createCloudLayerTexture(
  maxAnisotropy: number = 4
): THREE.CanvasTexture {
  const cacheKey = 'earth_clouds_scope';
  const existing = textureCache.get(cacheKey);
  if (existing) return existing;

  const w = 512;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(w, h);
  const data = imgData.data;

  for (let y = 0; y < h; y++) {
    const v = y / h;
    const rowOffset = y * w * 4;
    for (let x = 0; x < w; x++) {
      const u = x / w;
      const idx = rowOffset + x * 4;
      const n = fbmSeamless(u, v, 6, 3, 4, 15);
      const alpha =
        n > 0.49 ? Math.min(235, Math.round(((n - 0.49) / 0.51) * 255)) : 0;
      data[idx] = 255;
      data[idx + 1] = 255;
      data[idx + 2] = 255;
      data[idx + 3] = alpha;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = Math.min(4, maxAnisotropy);
  tex.needsUpdate = true;

  textureCache.set(cacheKey, tex);
  return tex;
}

/**
 * 512x512 Concentric Ring Texture (Cassini Division)
 */
export function createRingTexture(
  isSaturn: boolean,
  maxAnisotropy: number = 4
): THREE.CanvasTexture {
  const cacheKey = isSaturn ? 'ring_saturn_scope' : 'ring_uranus_scope';
  const existing = textureCache.get(cacheKey);
  if (existing) return existing;

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const cx = size / 2;
  const cy = size / 2;

  for (let r = 100; r < 250; r += 1) {
    const norm = (r - 100) / 150;
    const cassiniGap = norm > 0.62 && norm < 0.69;
    const enckeGap = norm > 0.86 && norm < 0.88;
    if (cassiniGap || enckeGap) continue;

    const wave = Math.sin(norm * 95) * 0.25 + 0.75;
    const alpha = isSaturn
      ? Math.sin(norm * Math.PI) * 0.88 * wave
      : Math.sin(norm * Math.PI) * 0.38 * wave;

    ctx.strokeStyle = isSaturn
      ? `rgba(${Math.round(234 + wave * 20)}, ${Math.round(204 + wave * 20)}, 148, ${alpha.toFixed(3)})`
      : `rgba(125, 232, 250, ${alpha.toFixed(3)})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(4, maxAnisotropy);
  tex.needsUpdate = true;

  textureCache.set(cacheKey, tex);
  return tex;
}

/**
 * 512x512 Relativistic Black Hole Accretion Disk Texture
 */
export function createAccretionDiskTexture(
  maxAnisotropy: number = 4
): THREE.CanvasTexture {
  const cacheKey = 'bh_accretion_scope';
  const existing = textureCache.get(cacheKey);
  if (existing) return existing;

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const cx = size / 2;
  const cy = size / 2;

  const grad = ctx.createRadialGradient(cx, cy, 55, cx, cy, 248);
  grad.addColorStop(0.0, 'rgba(0, 0, 0, 0)');
  grad.addColorStop(0.06, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.18, 'rgba(254, 240, 138, 0.96)');
  grad.addColorStop(0.42, 'rgba(249, 115, 22, 0.88)');
  grad.addColorStop(0.72, 'rgba(168, 85, 247, 0.48)');
  grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(4, maxAnisotropy);
  tex.needsUpdate = true;

  textureCache.set(cacheKey, tex);
  return tex;
}
