import * as THREE from 'three';

/**
 * Deterministic Fast 2D Value/Gradient Noise + Fractal Brownian Motion (fBm)
 * Produces realistic fractal continents, craters, clouds, and fluid storm bands.
 */
function hash2D(ix: number, iy: number, seed: number): number {
  let n = (ix * 374761393 + iy * 668265263 + seed * 1442695041) | 0;
  n = (n ^ (n >> 13)) * 1274126177;
  return ((n ^ (n >> 16)) >>> 0) / 4294967295;
}

function valueNoise2D(x: number, y: number, seed: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);

  const a = hash2D(ix, iy, seed);
  const b = hash2D(ix + 1, iy, seed);
  const c = hash2D(ix, iy + 1, seed);
  const d = hash2D(ix + 1, iy + 1, seed);

  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbm(
  x: number,
  y: number,
  octaves: number,
  seed: number,
  lacunarity = 2.05,
  gain = 0.5
): number {
  let sum = 0;
  let amp = 0.5;
  let freq = 1.0;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise2D(x * freq, y * freq, seed + i * 31);
    norm += amp;
    freq *= lacunarity;
    amp *= gain;
  }
  return sum / norm;
}

function lerpColor(
  c1: [number, number, number],
  c2: [number, number, number],
  t: number
): [number, number, number] {
  const cl = Math.max(0, Math.min(1, t));
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * cl),
    Math.round(c1[1] + (c2[1] - c1[1]) * cl),
    Math.round(c1[2] + (c2[2] - c1[2]) * cl),
  ];
}

/**
 * Custom GLSL Fresnel Atmospheric Limb Glow Material (Solar System Scope style)
 */
export function createAtmosphereFresnelMaterial(
  hexColor: number,
  intensity = 1.15,
  power = 3.2
): THREE.ShaderMaterial {
  const col = new THREE.Color(hexColor);
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: col },
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
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);
        float rim = 1.0 - max(0.0, abs(dot(normal, viewDir)));
        float alpha = pow(rim, uPower) * uIntensity;
        gl_FragColor = vec4(uColor, clamp(alpha, 0.0, 0.92));
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.FrontSide,
  });
}

export function createPlanetTexture(
  planetId: string,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const w = 1024;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(w, h);
  const data = imgData.data;

  // Seamless cylindrical mapping helper so left/right edges never have a seam
  const sampleSeamless = (
    u: number,
    v: number,
    scale: number,
    octaves: number,
    seed: number
  ) => {
    const angle = u * Math.PI * 2;
    const nx = Math.cos(angle) * scale + 10;
    const nz = Math.sin(angle) * scale + 10;
    const ny = v * scale * 2;
    return fbm(nx + nz * 0.7, ny + nz * 0.3, octaves, seed);
  };

  for (let y = 0; y < h; y++) {
    const v = y / h;
    const lat = Math.abs(v - 0.5) * 2; // 0 at equator, 1 at poles

    for (let x = 0; x < w; x++) {
      const u = x / w;
      const idx = (y * w + x) * 4;
      let rgb: [number, number, number] = [128, 128, 128];

      if (planetId === 'sun') {
        const n1 = sampleSeamless(u, v, 4.5, 5, 11);
        const n2 = sampleSeamless(u + n1 * 0.08, v - n1 * 0.08, 9.0, 4, 29);
        const heat = Math.pow(n2, 1.3);
        if (heat > 0.68) {
          rgb = lerpColor([251, 191, 36], [255, 255, 240], (heat - 0.68) * 3.1);
        } else if (heat > 0.35) {
          rgb = lerpColor([234, 88, 12], [251, 191, 36], (heat - 0.35) * 3.0);
        } else {
          rgb = lerpColor([124, 45, 18], [234, 88, 12], heat * 2.8);
        }
      } else if (planetId === 'earth') {
        const warp = sampleSeamless(u, v, 2.2, 3, 101);
        const elev = sampleSeamless(
          u + (warp - 0.5) * 0.12,
          v + (warp - 0.5) * 0.12,
          2.6,
          6,
          202
        );
        const moisture = sampleSeamless(u, v, 4.0, 4, 303);

        // Polar ice caps
        if (lat + (elev - 0.5) * 0.22 > 0.84) {
          rgb = [244, 248, 255];
        } else if (elev < 0.48) {
          // Deep ocean to turquoise coastal shelf
          const depth = elev / 0.48;
          if (depth > 0.88) {
            rgb = lerpColor([2, 132, 199], [56, 189, 248], (depth - 0.88) * 8.3);
          } else {
            rgb = lerpColor([10, 25, 68], [2, 105, 168], Math.pow(depth, 1.5));
          }
        } else {
          // Land biomes: tropical forest, temperate plains, desert, mountains, snow peaks
          const landH = (elev - 0.48) / 0.52;
          if (landH > 0.72) {
            rgb = lerpColor([120, 113, 108], [248, 250, 252], (landH - 0.72) * 3.5);
          } else if (landH > 0.48) {
            rgb = lerpColor([87, 83, 78], [140, 128, 115], (landH - 0.48) * 4.1);
          } else if (moisture < 0.42 && lat < 0.55) {
            // Sahara / Arabian / Australian deserts
            rgb = lerpColor([194, 142, 76], [234, 189, 122], moisture * 2.3);
          } else {
            // Lush forests & grasslands
            rgb = lerpColor([21, 94, 48], [62, 138, 68], moisture);
          }
        }
      } else if (planetId === 'mars') {
        const n = sampleSeamless(u, v, 3.2, 6, 404);
        const detail = sampleSeamless(u, v, 9.0, 4, 409);
        if (lat + (n - 0.5) * 0.15 > 0.89) {
          rgb = [245, 245, 248];
        } else if (n < 0.42) {
          // Dark basaltic maria (Syrtis Major)
          rgb = lerpColor([78, 28, 14], [138, 52, 24], n / 0.42);
        } else {
          // Rusty iron-oxide highlands & Tharsis dusty plains
          rgb = lerpColor(
            [168, 62, 28],
            [236, 132, 74],
            (n - 0.42) * 1.7 + (detail - 0.5) * 0.25
          );
        }
      } else if (planetId === 'jupiter') {
        const turb = sampleSeamless(u, v, 3.8, 4, 505);
        const bandPos = v * 16 + (turb - 0.5) * 2.2;
        const bandWave = Math.sin(bandPos * Math.PI);
        const fine = sampleSeamless(u * 2, v * 6, 5.0, 4, 509);
        if (bandWave > 0.25) {
          rgb = lerpColor([217, 155, 98], [254, 243, 199], fine);
        } else if (bandWave > -0.35) {
          rgb = lerpColor([168, 85, 38], [217, 132, 68], fine);
        } else {
          rgb = lerpColor([92, 38, 16], [154, 62, 26], fine);
        }
      } else if (planetId === 'saturn') {
        const turb = sampleSeamless(u, v, 2.5, 4, 606);
        const band = Math.sin((v * 14 + (turb - 0.5) * 1.1) * Math.PI);
        rgb = lerpColor(
          [161, 118, 52],
          [253, 236, 166],
          (band + 1) * 0.5
        );
      } else if (planetId === 'venus') {
        const swirl = sampleSeamless(u, v, 3.0, 5, 707);
        const chevron = Math.sin((u * 2 + Math.abs(v - 0.5) * 3 + swirl) * Math.PI * 2);
        rgb = lerpColor(
          [168, 92, 28],
          [253, 224, 138],
          (chevron + 1) * 0.35 + swirl * 0.3
        );
      } else if (planetId === 'mercury') {
        const n = sampleSeamless(u, v, 4.2, 6, 808);
        const c = Math.round(68 + n * 118);
        rgb = [c, c + 4, c + 10];
      } else if (planetId === 'uranus') {
        const band = Math.sin(v * Math.PI * 6) * 0.08 + (1 - lat * 0.25);
        rgb = lerpColor([14, 132, 162], [165, 243, 252], band);
      } else if (planetId === 'neptune') {
        const storm = sampleSeamless(u, v, 4.0, 5, 909);
        const band = Math.sin((v * 10 + storm) * Math.PI) * 0.25 + storm * 0.75;
        rgb = lerpColor([20, 48, 138], [76, 145, 250], band);
      } else {
        // Pluto
        const n = sampleSeamless(u, v, 3.5, 5, 999);
        rgb = lerpColor([68, 60, 56], [214, 205, 194], n);
      }

      data[idx] = rgb[0];
      data[idx + 1] = rgb[1];
      data[idx + 2] = rgb[2];
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Overlay crisp astronomical landmarks (Great Red Spot, Tombaugh Regio, Crater Rays)
  if (planetId === 'jupiter') {
    const grs = ctx.createRadialGradient(620, 315, 6, 620, 315, 58);
    grs.addColorStop(0, '#dc2626');
    grs.addColorStop(0.55, '#ea580c');
    grs.addColorStop(0.85, '#d97706');
    grs.addColorStop(1, 'rgba(180,83,9,0)');
    ctx.fillStyle = grs;
    ctx.beginPath();
    ctx.ellipse(620, 315, 64, 38, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (planetId === 'pluto') {
    const heart = ctx.createRadialGradient(520, 265, 10, 520, 265, 95);
    heart.addColorStop(0, 'rgba(250, 250, 249, 0.92)');
    heart.addColorStop(0.65, 'rgba(231, 229, 228, 0.55)');
    heart.addColorStop(1, 'rgba(168, 162, 158, 0)');
    ctx.fillStyle = heart;
    ctx.beginPath();
    ctx.ellipse(495, 260, 74, 58, -0.22, 0, Math.PI * 2);
    ctx.ellipse(555, 260, 68, 54, 0.22, 0, Math.PI * 2);
    ctx.fill();
  } else if (planetId === 'mercury' || planetId === 'mars') {
    for (let i = 0; i < 240; i++) {
      const cx = Math.random() * w;
      const cy = 40 + Math.random() * (h - 80);
      const r = 2 + Math.random() * 16;
      ctx.strokeStyle =
        planetId === 'mercury'
          ? 'rgba(226,232,240,0.28)'
          : 'rgba(254,215,170,0.22)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function createPlanetBumpTexture(
  planetId: string,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const w = 512;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(w, h);
  const data = imgData.data;

  const seed = planetId.charCodeAt(0) * 97;
  for (let y = 0; y < h; y++) {
    const v = y / h;
    for (let x = 0; x < w; x++) {
      const u = x / w;
      const angle = u * Math.PI * 2;
      const val = fbm(
        Math.cos(angle) * 5 + 10,
        v * 10 + Math.sin(angle) * 5,
        5,
        seed
      );
      const c = Math.round(val * 255);
      const idx = (y * w + x) * 4;
      data[idx] = c;
      data[idx + 1] = c;
      data[idx + 2] = c;
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Add sharp crater rims on rocky worlds
  if (
    planetId === 'mercury' ||
    planetId === 'mars' ||
    planetId === 'pluto'
  ) {
    for (let i = 0; i < 260; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = 2 + Math.random() * 14;
      const g = ctx.createRadialGradient(x, y, r * 0.15, x, y, r);
      g.addColorStop(0, 'rgba(25,25,25,0.85)');
      g.addColorStop(0.78, 'rgba(235,235,235,0.85)');
      g.addColorStop(1, 'rgba(128,128,128,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = maxAnisotropy;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function createCloudLayerTexture(
  maxAnisotropy: number
): THREE.CanvasTexture {
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
    for (let x = 0; x < w; x++) {
      const u = x / w;
      const angle = u * Math.PI * 2;
      const warp = fbm(Math.cos(angle) * 3, v * 6, 3, 711);
      const n = fbm(
        Math.cos(angle) * 4.5 + warp * 1.4,
        v * 9 + Math.sin(angle) * 4.5,
        5,
        823
      );
      const alpha = Math.max(0, Math.min(255, Math.round((n - 0.44) * 520)));
      const idx = (y * w + x) * 4;
      data[idx] = 255;
      data[idx + 1] = 255;
      data[idx + 2] = 255;
      data[idx + 3] = alpha;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function createRingTexture(
  isSaturn: boolean,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;
  const cx = 512;
  const cy = 512;

  const grad = ctx.createRadialGradient(cx, cy, 220, cx, cy, 500);
  if (isSaturn) {
    grad.addColorStop(0, 'rgba(254, 240, 138, 0.0)');
    grad.addColorStop(0.08, 'rgba(180, 130, 70, 0.25)'); // D Ring
    grad.addColorStop(0.18, 'rgba(217, 169, 96, 0.55)'); // C Ring
    grad.addColorStop(0.32, 'rgba(254, 243, 199, 0.94)'); // B Ring (Brightest)
    grad.addColorStop(0.56, 'rgba(245, 208, 125, 0.88)');
    grad.addColorStop(0.61, 'rgba(10, 15, 30, 0.04)'); // Cassini Division gap
    grad.addColorStop(0.66, 'rgba(234, 195, 118, 0.76)'); // A Ring
    grad.addColorStop(0.86, 'rgba(202, 158, 84, 0.45)');
    grad.addColorStop(0.95, 'rgba(253, 230, 138, 0.22)'); // F Ring
    grad.addColorStop(1, 'rgba(202, 138, 4, 0.0)');
  } else {
    grad.addColorStop(0, 'rgba(103, 232, 249, 0.0)');
    grad.addColorStop(0.42, 'rgba(103, 232, 249, 0.44)');
    grad.addColorStop(0.75, 'rgba(34, 211, 238, 0.26)');
    grad.addColorStop(1, 'rgba(34, 211, 238, 0.0)');
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

export function createAccretionDiskTexture(
  maxAnisotropy: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  const cx = 256;
  const cy = 256;

  const grad = ctx.createRadialGradient(cx, cy, 72, cx, cy, 250);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  grad.addColorStop(0.08, 'rgba(255, 255, 255, 0.98)');
  grad.addColorStop(0.22, 'rgba(253, 224, 71, 0.92)');
  grad.addColorStop(0.48, 'rgba(249, 115, 22, 0.78)');
  grad.addColorStop(0.75, 'rgba(185, 28, 28, 0.42)');
  grad.addColorStop(1, 'rgba(124, 45, 18, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
}
