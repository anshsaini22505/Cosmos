import * as THREE from 'three';

export function createPlanetTexture(
  planetId: string,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const w = canvas.width;
  const h = canvas.height;

  if (planetId === 'sun') {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#ea580c');
    grad.addColorStop(0.25, '#f59e0b');
    grad.addColorStop(0.5, '#fef08a');
    grad.addColorStop(0.75, '#f59e0b');
    grad.addColorStop(1, '#c2410c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // High-resolution solar granulation, magnetic sunspots & plasma filaments
    for (let i = 0; i < 650; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = 4 + Math.random() * 34;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(
        0,
        i % 5 === 0
          ? 'rgba(255,255,255,0.85)'
          : i % 7 === 0
            ? 'rgba(124,45,18,0.65)'
            : 'rgba(234,88,12,0.55)'
      );
      g.addColorStop(1, 'rgba(245,158,11,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (planetId === 'mercury') {
    const base = ctx.createLinearGradient(0, 0, 0, h);
    base.addColorStop(0, '#475569');
    base.addColorStop(0.5, '#64748b');
    base.addColorStop(1, '#334155');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);

    // Caloris Basin & impact craters with ejecta rays
    for (let i = 0; i < 420; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = 2 + Math.random() * 24;
      ctx.fillStyle =
        i % 2 === 0 ? 'rgba(30,41,59,0.6)' : 'rgba(148,163,184,0.42)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(226,232,240,0.35)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  } else if (planetId === 'venus') {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#92400e');
    grad.addColorStop(0.25, '#d97706');
    grad.addColorStop(0.5, '#fde68a');
    grad.addColorStop(0.75, '#b45309');
    grad.addColorStop(1, '#78350f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Super-rotating V-shaped sulfuric acid cloud chevron bands
    for (let y = 0; y < h; y += 8) {
      ctx.fillStyle =
        y % 16 === 0 ? 'rgba(254,243,199,0.22)' : 'rgba(120,53,15,0.24)';
      ctx.beginPath();
      for (let x = 0; x <= w; x += 20) {
        const dy = Math.sin((x / w) * Math.PI * 4 + y * 0.04) * 9;
        if (x === 0) ctx.moveTo(x, y + dy);
        else ctx.lineTo(x, y + dy);
      }
      ctx.lineTo(w, y + 8);
      ctx.lineTo(0, y + 8);
      ctx.closePath();
      ctx.fill();
    }
  } else if (planetId === 'earth') {
    // Deep bathymetric ocean gradient
    const ocean = ctx.createLinearGradient(0, 0, 0, h);
    ocean.addColorStop(0, '#0f172a');
    ocean.addColorStop(0.2, '#1e3a8a');
    ocean.addColorStop(0.5, '#0369a1');
    ocean.addColorStop(0.8, '#1e3a8a');
    ocean.addColorStop(1, '#0f172a');
    ctx.fillStyle = ocean;
    ctx.fillRect(0, 0, w, h);

    // Continental shelves & landmass biomes
    const continents = [
      // North & Central America
      { x: 190, y: 145, rx: 95, ry: 68, c: '#15803d', rot: 0.25 },
      { x: 210, y: 135, rx: 45, ry: 32, c: '#ca8a04', rot: 0.1 },
      // South America & Amazon
      { x: 275, y: 310, rx: 58, ry: 92, c: '#166534', rot: -0.15 },
      // Eurasia & India
      { x: 640, y: 145, rx: 185, ry: 78, c: '#15803d', rot: 0.08 },
      { x: 695, y: 215, rx: 38, ry: 48, c: '#16a34a', rot: 0.0 }, // Indian Subcontinent
      { x: 650, y: 170, rx: 75, ry: 28, c: '#a16207', rot: 0.05 }, // Himalayan & Tibetan Plateau
      // Africa & Sahara
      { x: 525, y: 265, rx: 76, ry: 95, c: '#15803d', rot: 0.05 },
      { x: 520, y: 215, rx: 68, ry: 38, c: '#d97706', rot: 0.0 }, // Sahara Desert
      // Australia
      { x: 835, y: 355, rx: 62, ry: 44, c: '#c2410c', rot: 0.15 },
    ];
    continents.forEach((cont) => {
      // Shallow turquoise coastal shelf glow
      ctx.fillStyle = 'rgba(14, 165, 233, 0.28)';
      ctx.beginPath();
      ctx.ellipse(
        cont.x,
        cont.y,
        cont.rx * 1.12,
        cont.ry * 1.12,
        cont.rot,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.fillStyle = cont.c;
      ctx.beginPath();
      ctx.ellipse(cont.x, cont.y, cont.rx, cont.ry, cont.rot, 0, Math.PI * 2);
      ctx.fill();
    });

    // Subtle golden city lights clusters (India, Europe, East Asia, Americas)
    const cityHubs = [
      { x: 695, y: 210 },
      { x: 705, y: 225 },
      { x: 510, y: 135 },
      { x: 775, y: 175 },
      { x: 225, y: 155 },
    ];
    cityHubs.forEach((hub) => {
      for (let j = 0; j < 28; j++) {
        ctx.fillStyle = 'rgba(253, 224, 71, 0.65)';
        ctx.fillRect(
          hub.x + (Math.random() - 0.5) * 44,
          hub.y + (Math.random() - 0.5) * 32,
          2,
          2
        );
      }
    });

    // Polar ice caps
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, w, 26);
    ctx.fillRect(0, h - 30, w, 30);
  } else if (planetId === 'mars') {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#7c2d12');
    grad.addColorStop(0.3, '#c2410c');
    grad.addColorStop(0.5, '#ea580c');
    grad.addColorStop(0.75, '#b45309');
    grad.addColorStop(1, '#7c2d12');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Basaltic plains, Olympus Mons & Valles Marineris canyon
    for (let i = 0; i < 180; i++) {
      ctx.fillStyle =
        i % 2 === 0 ? 'rgba(67,20,7,0.45)' : 'rgba(251,146,60,0.32)';
      ctx.beginPath();
      ctx.ellipse(
        Math.random() * w,
        Math.random() * h,
        14 + Math.random() * 65,
        6 + Math.random() * 28,
        Math.random(),
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    // Valles Marineris rift scar
    ctx.strokeStyle = 'rgba(67, 20, 7, 0.78)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(380, 250);
    ctx.quadraticCurveTo(490, 262, 610, 248);
    ctx.stroke();

    // Polar CO2 & water-ice caps
    ctx.fillStyle = 'rgba(248,250,252,0.9)';
    ctx.fillRect(0, 0, w, 18);
    ctx.fillRect(0, h - 18, w, 18);
  } else if (planetId === 'jupiter') {
    const bands = [
      '#451a03',
      '#78350f',
      '#d97706',
      '#fef3c7',
      '#b45309',
      '#fde68a',
      '#9a3412',
      '#fed7aa',
      '#c2410c',
      '#fef3c7',
      '#92400e',
      '#f59e0b',
      '#451a03',
    ];
    const bandH = h / bands.length;
    bands.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(0, i * bandH, w, bandH + 2);
    });

    // Turbulent wave festoons between belts
    for (let i = 0; i < 120; i++) {
      ctx.fillStyle =
        i % 2 === 0 ? 'rgba(254,243,199,0.28)' : 'rgba(154,52,18,0.28)';
      ctx.beginPath();
      ctx.ellipse(
        Math.random() * w,
        Math.random() * h,
        24 + Math.random() * 55,
        4 + Math.random() * 8,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Great Red Spot anticyclone
    const grs = ctx.createRadialGradient(620, 310, 8, 620, 310, 68);
    grs.addColorStop(0, '#ef4444');
    grs.addColorStop(0.55, '#dc2626');
    grs.addColorStop(0.85, '#ea580c');
    grs.addColorStop(1, 'rgba(180,83,9,0)');
    ctx.fillStyle = grs;
    ctx.beginPath();
    ctx.ellipse(620, 310, 72, 42, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (planetId === 'saturn') {
    const bands = [
      '#422006',
      '#713f12',
      '#ca8a04',
      '#fef08a',
      '#eab308',
      '#fef9c3',
      '#d97706',
      '#fde047',
      '#a16207',
      '#713f12',
    ];
    const bandH = h / bands.length;
    bands.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(0, i * bandH, w, bandH + 2);
    });
  } else if (planetId === 'uranus') {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0e7490');
    grad.addColorStop(0.35, '#22d3ee');
    grad.addColorStop(0.5, '#a5f3fc');
    grad.addColorStop(0.65, '#06b6d4');
    grad.addColorStop(1, '#155e75');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  } else if (planetId === 'pluto') {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#44403c');
    grad.addColorStop(0.5, '#a8a29e');
    grad.addColorStop(1, '#292524');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    // Tombaugh Regio bright nitrogen heart plain (Sputnik Planitia)
    ctx.fillStyle = 'rgba(245, 245, 244, 0.88)';
    ctx.beginPath();
    ctx.ellipse(490, 260, 84, 64, -0.2, 0, Math.PI * 2);
    ctx.ellipse(570, 260, 76, 60, 0.2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Neptune
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#172554');
    grad.addColorStop(0.3, '#1d4ed8');
    grad.addColorStop(0.5, '#3b82f6');
    grad.addColorStop(0.7, '#1e40af');
    grad.addColorStop(1, '#172554');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // High-altitude supersonic methane cirrus streaks & Great Dark Spot
    ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
    ctx.beginPath();
    ctx.ellipse(460, 280, 56, 32, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(191,219,254,0.55)';
    for (let i = 0; i < 48; i++) {
      ctx.fillRect(
        Math.random() * w,
        Math.random() * h,
        60 + Math.random() * 110,
        4
      );
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
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, w, h);

  const count =
    planetId === 'mercury' || planetId === 'mars' || planetId === 'pluto'
      ? 320
      : 160;
  for (let i = 0; i < count; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r = 2 + Math.random() * 18;
    const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r);
    g.addColorStop(0, '#303030');
    g.addColorStop(0.75, '#d8d8d8');
    g.addColorStop(1, '#808080');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
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
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);
  for (let i = 0; i < 190; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const rx = 22 + Math.random() * 80;
    const ry = 5 + Math.random() * 16;
    const grad = ctx.createRadialGradient(x, y, 2, x, y, rx);
    grad.addColorStop(0, 'rgba(255,255,255,0.62)');
    grad.addColorStop(0.6, 'rgba(241,245,249,0.28)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, (Math.random() - 0.5) * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

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
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  const cx = 256;
  const cy = 256;

  const grad = ctx.createRadialGradient(cx, cy, 110, cx, cy, 250);
  if (isSaturn) {
    grad.addColorStop(0, 'rgba(254, 240, 138, 0.0)');
    grad.addColorStop(0.12, 'rgba(217, 119, 6, 0.45)');
    grad.addColorStop(0.35, 'rgba(254, 240, 138, 0.88)');
    grad.addColorStop(0.55, 'rgba(253, 224, 71, 0.78)');
    grad.addColorStop(0.62, 'rgba(15, 23, 42, 0.06)'); // Cassini Division gap
    grad.addColorStop(0.68, 'rgba(234, 179, 8, 0.68)');
    grad.addColorStop(0.92, 'rgba(202, 138, 4, 0.38)');
    grad.addColorStop(1, 'rgba(202, 138, 4, 0.0)');
  } else {
    grad.addColorStop(0, 'rgba(103, 232, 249, 0.0)');
    grad.addColorStop(0.4, 'rgba(103, 232, 249, 0.42)');
    grad.addColorStop(0.75, 'rgba(34, 211, 238, 0.24)');
    grad.addColorStop(1, 'rgba(34, 211, 238, 0.0)');
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

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
  grad.addColorStop(0.08, 'rgba(255, 255, 255, 0.98)'); // Photon ring
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
