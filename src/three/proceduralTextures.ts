import * as THREE from 'three';

export function createPlanetTexture(
  planetId: string,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const w = canvas.width;
  const h = canvas.height;

  if (planetId === 'sun') {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#f59e0b');
    grad.addColorStop(0.5, '#fef08a');
    grad.addColorStop(1, '#ea580c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Solar granulation & plasma filaments
    for (let i = 0; i < 280; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = 4 + Math.random() * 22;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, i % 3 === 0 ? 'rgba(255,255,255,0.65)' : 'rgba(234,88,12,0.55)');
      g.addColorStop(1, 'rgba(245,158,11,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (planetId === 'mercury') {
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = 2 + Math.random() * 16;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(51,65,85,0.55)' : 'rgba(148,163,184,0.4)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(203,213,225,0.28)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  } else if (planetId === 'venus') {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#b45309');
    grad.addColorStop(0.3, '#f59e0b');
    grad.addColorStop(0.5, '#fde68a');
    grad.addColorStop(0.75, '#d97706');
    grad.addColorStop(1, '#92400e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Swirling sulfuric bands
    for (let y = 0; y < h; y += 6) {
      ctx.fillStyle = y % 12 === 0 ? 'rgba(254,243,199,0.2)' : 'rgba(146,64,14,0.2)';
      ctx.beginPath();
      for (let x = 0; x <= w; x += 16) {
        const dy = Math.sin((x / w) * Math.PI * 4 + y * 0.05) * 5;
        if (x === 0) ctx.moveTo(x, y + dy);
        else ctx.lineTo(x, y + dy);
      }
      ctx.lineTo(w, y + 6);
      ctx.lineTo(0, y + 6);
      ctx.closePath();
      ctx.fill();
    }
  } else if (planetId === 'earth') {
    // Deep ocean base
    const ocean = ctx.createLinearGradient(0, 0, 0, h);
    ocean.addColorStop(0, '#1e3a8a');
    ocean.addColorStop(0.5, '#0284c7');
    ocean.addColorStop(1, '#1e3a8a');
    ctx.fillStyle = ocean;
    ctx.fillRect(0, 0, w, h);

    // Continents
    const continents = [
      { x: 95, y: 75, rx: 52, ry: 35, c: '#15803d' },
      { x: 130, y: 155, rx: 32, ry: 48, c: '#166534' },
      { x: 255, y: 70, rx: 68, ry: 36, c: '#15803d' },
      { x: 270, y: 145, rx: 38, ry: 44, c: '#ca8a04' },
      { x: 375, y: 85, rx: 65, ry: 40, c: '#166534' },
      { x: 425, y: 185, rx: 34, ry: 24, c: '#b45309' },
    ];
    continents.forEach((cont) => {
      ctx.fillStyle = cont.c;
      ctx.beginPath();
      ctx.ellipse(cont.x, cont.y, cont.rx, cont.ry, 0.25, 0, Math.PI * 2);
      ctx.fill();
    });

    // Polar ice caps
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, w, 16);
    ctx.fillRect(0, h - 18, w, 18);

    // Atmospheric cloud wisps
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    for (let i = 0; i < 45; i++) {
      ctx.beginPath();
      ctx.ellipse(
        Math.random() * w,
        Math.random() * h,
        18 + Math.random() * 45,
        3 + Math.random() * 6,
        0.1,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  } else if (planetId === 'mars') {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#991b1b');
    grad.addColorStop(0.5, '#ea580c');
    grad.addColorStop(1, '#7c2d12');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Dark basaltic plains & Valles Marineris scar
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(124,45,18,0.45)' : 'rgba(251,146,60,0.3)';
      ctx.beginPath();
      ctx.ellipse(
        Math.random() * w,
        Math.random() * h,
        10 + Math.random() * 40,
        5 + Math.random() * 18,
        Math.random(),
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    // Polar ice caps
    ctx.fillStyle = 'rgba(248,250,252,0.85)';
    ctx.fillRect(0, 0, w, 10);
    ctx.fillRect(0, h - 10, w, 10);
  } else if (planetId === 'jupiter') {
    const bands = [
      '#78350f',
      '#d97706',
      '#fef3c7',
      '#b45309',
      '#fde68a',
      '#c2410c',
      '#fed7aa',
      '#92400e',
      '#f59e0b',
      '#78350f',
    ];
    const bandH = h / bands.length;
    bands.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(0, i * bandH, w, bandH + 2);
    });

    // Great Red Spot
    const grs = ctx.createRadialGradient(310, 155, 4, 310, 155, 34);
    grs.addColorStop(0, '#dc2626');
    grs.addColorStop(0.7, '#ea580c');
    grs.addColorStop(1, 'rgba(180,83,9,0)');
    ctx.fillStyle = grs;
    ctx.beginPath();
    ctx.ellipse(310, 155, 36, 20, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (planetId === 'saturn') {
    const bands = [
      '#713f12',
      '#ca8a04',
      '#fef08a',
      '#eab308',
      '#fef9c3',
      '#d97706',
      '#fde047',
      '#854d0e',
    ];
    const bandH = h / bands.length;
    bands.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(0, i * bandH, w, bandH + 1);
    });
  } else if (planetId === 'uranus') {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0891b2');
    grad.addColorStop(0.5, '#67e8f9');
    grad.addColorStop(1, '#0e7490');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  } else if (planetId === 'pluto') {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#57534e');
    grad.addColorStop(0.5, '#a8a29e');
    grad.addColorStop(1, '#44403c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    // Tombaugh Regio bright nitrogen heart plain
    ctx.fillStyle = 'rgba(245, 245, 244, 0.85)';
    ctx.beginPath();
    ctx.ellipse(245, 130, 42, 32, -0.2, 0, Math.PI * 2);
    ctx.ellipse(285, 130, 38, 30, 0.2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Neptune
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#1e3a8a');
    grad.addColorStop(0.5, '#2563eb');
    grad.addColorStop(1, '#172554');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // High-altitude methane cirrus streaks
    ctx.fillStyle = 'rgba(147,197,253,0.45)';
    for (let i = 0; i < 24; i++) {
      ctx.fillRect(Math.random() * w, Math.random() * h, 45 + Math.random() * 60, 3);
    }
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
    grad.addColorStop(0.35, 'rgba(254, 240, 138, 0.85)');
    grad.addColorStop(0.55, 'rgba(253, 224, 71, 0.75)');
    grad.addColorStop(0.62, 'rgba(15, 23, 42, 0.08)'); // Cassini Division gap
    grad.addColorStop(0.68, 'rgba(234, 179, 8, 0.65)');
    grad.addColorStop(0.92, 'rgba(202, 138, 4, 0.35)');
    grad.addColorStop(1, 'rgba(202, 138, 4, 0.0)');
  } else {
    grad.addColorStop(0, 'rgba(103, 232, 249, 0.0)');
    grad.addColorStop(0.4, 'rgba(103, 232, 249, 0.38)');
    grad.addColorStop(0.75, 'rgba(34, 211, 238, 0.22)');
    grad.addColorStop(1, 'rgba(34, 211, 238, 0.0)');
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
}
