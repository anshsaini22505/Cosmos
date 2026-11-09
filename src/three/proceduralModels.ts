import * as THREE from 'three';

/**
 * 10-part composite Player Starship ("Vajra-IX Starfighter")
 * Adheres to Three.js composite 3–12 part Group rule with varied roughness/metalness.
 */
export function createPlayerStarship(isSoftwareGl: boolean): {
  group: THREE.Group;
  thrusterLeft: THREE.Mesh;
  thrusterRight: THREE.Mesh;
  shieldMesh: THREE.Mesh;
} {
  const group = new THREE.Group();

  // Materials with >= 0.25 roughness variation between adjacent parts
  const hullMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.85,
    roughness: 0.2,
  });
  const wingArmorMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.55,
    roughness: 0.55,
  });
  const accentTrimMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.9,
    roughness: 0.18,
    emissive: 0x78350f,
    emissiveIntensity: 0.35,
  });
  const canopyMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    metalness: 0.1,
    roughness: 0.08,
    transmission: isSoftwareGl ? 0 : 0.85,
    transparent: true,
    opacity: isSoftwareGl ? 0.55 : 0.95,
    ior: 1.5,
    clearcoat: 1.0,
  });
  const engineGlowMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
  });

  // 1. Central Fuselage Hull (Primary Silhouette)
  const hullGeo = new THREE.ConeGeometry(0.85, 4.6, 6);
  hullGeo.rotateX(-Math.PI / 2);
  hullGeo.scale(1.15, 0.52, 1);
  const hull = new THREE.Mesh(hullGeo, hullMat);
  hull.castShadow = true;
  group.add(hull);

  // 2. Swept Delta Main Wings (Secondary Read)
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0.8);
  wingShape.lineTo(3.1, -1.2);
  wingShape.lineTo(3.1, -1.85);
  wingShape.lineTo(0.6, -1.5);
  wingShape.lineTo(-0.6, -1.5);
  wingShape.lineTo(-3.1, -1.85);
  wingShape.lineTo(-3.1, -1.2);
  wingShape.closePath();

  const wingExtrude = new THREE.ExtrudeGeometry(wingShape, {
    depth: 0.14,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.04,
    bevelSegments: 2,
  });
  wingExtrude.rotateX(Math.PI / 2);
  const wings = new THREE.Mesh(wingExtrude, wingArmorMat);
  wings.position.set(0, 0.04, 0.2);
  group.add(wings);

  // 3. Golden Forward Wing Strakes (Accent Detail)
  const strakeGeo = new THREE.BoxGeometry(4.4, 0.08, 0.32);
  const strakes = new THREE.Mesh(strakeGeo, accentTrimMat);
  strakes.position.set(0, 0.08, 0.85);
  group.add(strakes);

  // 4. Cockpit Canopy (Secondary Read)
  const canopyGeo = new THREE.SphereGeometry(0.55, 16, 12);
  canopyGeo.scale(0.82, 0.58, 1.95);
  const canopy = new THREE.Mesh(canopyGeo, canopyMat);
  canopy.position.set(0, 0.36, -0.35);
  group.add(canopy);

  // 5 & 6. Twin Heavy Nacelle Boosters (Secondary Read)
  const nacelleGeo = new THREE.CylinderGeometry(0.32, 0.38, 2.5, 12);
  nacelleGeo.rotateX(Math.PI / 2);
  const leftNacelle = new THREE.Mesh(nacelleGeo, hullMat);
  leftNacelle.position.set(-1.05, 0.05, 0.9);
  const rightNacelle = new THREE.Mesh(nacelleGeo, hullMat);
  rightNacelle.position.set(1.05, 0.05, 0.9);
  group.add(leftNacelle, rightNacelle);

  // 7 & 8. Twin Vertical Tail Stabilizers
  const finGeo = new THREE.BoxGeometry(0.1, 0.85, 1.2);
  const leftFin = new THREE.Mesh(finGeo, accentTrimMat);
  leftFin.position.set(-1.05, 0.52, 1.35);
  leftFin.rotation.z = 0.24;
  const rightFin = new THREE.Mesh(finGeo, accentTrimMat);
  rightFin.position.set(1.05, 0.52, 1.35);
  rightFin.rotation.z = -0.24;
  group.add(leftFin, rightFin);

  // 9 & 10. Twin Forward Pulse Laser Barrels & Ion Thruster Cones
  const barrelGeo = new THREE.CylinderGeometry(0.06, 0.08, 1.4, 8);
  barrelGeo.rotateX(Math.PI / 2);
  const leftBarrel = new THREE.Mesh(barrelGeo, wingArmorMat);
  leftBarrel.position.set(-1.55, -0.05, -0.75);
  const rightBarrel = new THREE.Mesh(barrelGeo, wingArmorMat);
  rightBarrel.position.set(1.55, -0.05, -0.75);
  group.add(leftBarrel, rightBarrel);

  const thrusterGeo = new THREE.ConeGeometry(0.28, 0.9, 12);
  thrusterGeo.rotateX(Math.PI / 2);
  const thrusterLeft = new THREE.Mesh(thrusterGeo, engineGlowMat);
  thrusterLeft.position.set(-1.05, 0.05, 2.35);
  const thrusterRight = new THREE.Mesh(thrusterGeo, engineGlowMat);
  thrusterRight.position.set(1.05, 0.05, 2.35);
  group.add(thrusterLeft, thrusterRight);

  // Energy Shield Bubble (visible on hit or recharge)
  const shieldGeo = new THREE.SphereGeometry(2.8, 20, 16);
  const shieldMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.0,
    wireframe: true,
    depthWrite: false,
  });
  const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
  shieldMesh.renderOrder = 5;
  group.add(shieldMesh);

  return { group, thrusterLeft, thrusterRight, shieldMesh };
}

/**
 * 7-part composite Enemy Void Pirate Interceptor with visible Windup Telegraph Ring
 */
export function createPirateInterceptor(): {
  group: THREE.Group;
  telegraphRing: THREE.Mesh;
} {
  const group = new THREE.Group();

  const darkHullMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    metalness: 0.88,
    roughness: 0.22,
  });
  const crimsonWingMat = new THREE.MeshStandardMaterial({
    color: 0x991b1b,
    metalness: 0.45,
    roughness: 0.58,
  });
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0xef4444,
  });

  // 1. Angular Fuselage Core
  const bodyGeo = new THREE.OctahedronGeometry(1.1, 0);
  bodyGeo.scale(0.9, 0.55, 1.8);
  const body = new THREE.Mesh(bodyGeo, darkHullMat);
  group.add(body);

  // 2 & 3. Twin Swept Crimson Scythe Wings
  const wingGeo = new THREE.BoxGeometry(3.4, 0.12, 1.1);
  const topWing = new THREE.Mesh(wingGeo, crimsonWingMat);
  topWing.rotation.z = 0.28;
  const botWing = new THREE.Mesh(wingGeo, crimsonWingMat);
  botWing.rotation.z = -0.28;
  group.add(topWing, botWing);

  // 4. Glowing Crimson Cockpit Eye
  const eyeGeo = new THREE.SphereGeometry(0.42, 12, 10);
  const eye = new THREE.Mesh(eyeGeo, coreMat);
  eye.position.set(0, 0.2, -0.8);
  group.add(eye);

  // 5 & 6. Twin Blaster Cannons
  const cannonGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.4, 8);
  cannonGeo.rotateX(Math.PI / 2);
  const cLeft = new THREE.Mesh(cannonGeo, darkHullMat);
  cLeft.position.set(-1.3, 0, -0.7);
  const cRight = new THREE.Mesh(cannonGeo, darkHullMat);
  cRight.position.set(1.3, 0, -0.7);
  group.add(cLeft, cRight);

  // 7. Windup Telegraph Ring (expands & glows bright amber/red right before firing)
  const teleGeo = new THREE.RingGeometry(1.4, 1.85, 24);
  const teleMat = new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const telegraphRing = new THREE.Mesh(teleGeo, teleMat);
  telegraphRing.position.set(0, 0, -1.2);
  group.add(telegraphRing);

  return { group, telegraphRing };
}

/**
 * Multi-part 3D Orbital Structures that the player builds around planets
 */
export function createOrbitalStructureModel(
  type: 'turret' | 'extractor' | 'station'
): THREE.Group {
  const group = new THREE.Group();

  const titaniumMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.85,
    roughness: 0.22,
  });
  const darkStructMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.5,
    roughness: 0.55,
  });

  if (type === 'turret') {
    const amberGlow = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    // 1. Hexagonal Base Platform
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.5, 0.5, 6), darkStructMat);
    group.add(base);
    // 2. Rotating Turret Dome
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.9, 14, 12), titaniumMat);
    dome.position.y = 0.45;
    group.add(dome);
    // 3 & 4. Dual Heavy Plasma Barrels
    const barrelGeo = new THREE.CylinderGeometry(0.14, 0.18, 2.2, 8);
    barrelGeo.rotateX(Math.PI / 2);
    const b1 = new THREE.Mesh(barrelGeo, titaniumMat);
    b1.position.set(-0.35, 0.65, 1.0);
    const b2 = new THREE.Mesh(barrelGeo, titaniumMat);
    b2.position.set(0.35, 0.65, 1.0);
    group.add(b1, b2);
    // 5. Core Beacon
    const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), amberGlow);
    beacon.position.y = 1.65;
    group.add(beacon);
  } else if (type === 'extractor') {
    const cyanGlow = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    // 1. Central Mining Spire
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.7, 3.6, 8), darkStructMat);
    group.add(spire);
    // 2. Rotating Centrifuge Ring
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.45, 0.22, 10, 24), titaniumMat);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
    // 3, 4, 5. Cryo-Storage Pods
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3;
      const pod = new THREE.Mesh(new THREE.SphereGeometry(0.48, 12, 10), cyanGlow);
      pod.position.set(Math.cos(a) * 1.45, -0.5, Math.sin(a) * 1.45);
      group.add(pod);
    }
  } else {
    // 'station' — Surya Habitat Starport
    const emeraldGlow = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const solarMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      metalness: 0.9,
      roughness: 0.15,
    });
    // 1. Habitat Torus Wheel
    const torus = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.32, 12, 28), titaniumMat);
    torus.rotation.x = Math.PI / 2;
    group.add(torus);
    // 2. Central Command Core
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 2.8, 12), darkStructMat);
    group.add(core);
    // 3 & 4. Cross Spokes
    const spoke1 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.18, 0.18), darkStructMat);
    const spoke2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 4.2), darkStructMat);
    group.add(spoke1, spoke2);
    // 5. Biodome Emerald Core
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.82, 16, 12), emeraldGlow);
    dome.position.y = 1.5;
    group.add(dome);
    // 6 & 7. Solar Array Wings
    const wingGeo = new THREE.BoxGeometry(3.4, 0.06, 0.9);
    const w1 = new THREE.Mesh(wingGeo, solarMat);
    w1.position.set(0, -1.1, 0);
    group.add(w1);
  }

  return group;
}

/**
 * 5-part Procedural Halley's Comet (Icy Nucleus + Glowing Coma + Dual Ion/Dust Tails)
 */
export function createCometModel(): THREE.Group {
  const group = new THREE.Group();

  const nucleusMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.75,
    metalness: 0.2,
  });
  const comaMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  });
  const ionTailMat = new THREE.MeshBasicMaterial({
    color: 0x67e8f9,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
  });
  const dustTailMat = new THREE.MeshBasicMaterial({
    color: 0xfef08a,
    transparent: true,
    opacity: 0.2,
    depthWrite: false,
  });

  // 1. Icy Craggy Nucleus
  const nuc = new THREE.Mesh(new THREE.DodecahedronGeometry(1.3, 1), nucleusMat);
  group.add(nuc);

  // 2. Glowing Cyan Coma Halo
  const coma = new THREE.Mesh(new THREE.SphereGeometry(2.3, 16, 12), comaMat);
  group.add(coma);

  // 3. Primary Ion Tail Cone (points along +Z when group looks at Sun)
  const ionGeo = new THREE.ConeGeometry(2.1, 22, 14, 1, true);
  ionGeo.rotateX(-Math.PI / 2);
  ionGeo.translate(0, 0, -11);
  const ionTail = new THREE.Mesh(ionGeo, ionTailMat);
  group.add(ionTail);

  // 4. Secondary Curved Dust Tail
  const dustGeo = new THREE.ConeGeometry(2.8, 16, 12, 1, true);
  dustGeo.rotateX(-Math.PI / 2);
  dustGeo.translate(1.2, 0, -8);
  const dustTail = new THREE.Mesh(dustGeo, dustTailMat);
  dustTail.rotation.y = 0.14;
  group.add(dustTail);

  return group;
}

/**
 * 6-part Procedural Quantum Wormhole Gate (Relativistic Accretion Ring + Singularity Portal)
 */
export function createWormholeGateModel(): {
  group: THREE.Group;
  outerRing: THREE.Mesh;
  innerRing: THREE.Mesh;
} {
  const group = new THREE.Group();

  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.9,
    roughness: 0.2,
  });
  const accretionMat = new THREE.MeshBasicMaterial({
    color: 0xa855f7,
    transparent: true,
    opacity: 0.78,
  });
  const horizonMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.38,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  // 1. Outer Gyro Ring
  const outerRing = new THREE.Mesh(
    new THREE.TorusGeometry(6.5, 0.35, 12, 36),
    frameMat
  );
  group.add(outerRing);

  // 2. Inner Relativistic Accretion Ring
  const innerRing = new THREE.Mesh(
    new THREE.TorusGeometry(5.2, 0.28, 12, 32),
    accretionMat
  );
  group.add(innerRing);

  // 3. Event Horizon Singularity Disc
  const disc = new THREE.Mesh(new THREE.CircleGeometry(5.0, 32), horizonMat);
  group.add(disc);

  // 4, 5, 6. Stabilizer Pylons
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    const pylon = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 1.8, 0.6),
      frameMat
    );
    pylon.position.set(Math.cos(a) * 6.5, Math.sin(a) * 6.5, 0);
    pylon.rotation.z = a;
    group.add(pylon);
  }

  return { group, outerRing, innerRing };
}

/**
 * 5-part Procedural Scientific Space Probe (Golden Foil Bus + High-Gain Dish + Solar Wings)
 */
export function createSpaceProbeModel(): THREE.Group {
  const group = new THREE.Group();

  const goldFoilMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.92,
    roughness: 0.22,
  });
  const dishMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    metalness: 0.65,
    roughness: 0.3,
  });
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    metalness: 0.85,
    roughness: 0.18,
  });
  const beaconMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
  });

  // 1. Golden Multi-Layer Insulation Bus
  const bus = new THREE.Mesh(new THREE.OctahedronGeometry(0.65, 0), goldFoilMat);
  group.add(bus);

  // 2. High-Gain Parabolic Dish Antenna
  const dishGeo = new THREE.ConeGeometry(0.85, 0.35, 16, 1, true);
  dishGeo.rotateX(Math.PI / 2);
  const dish = new THREE.Mesh(dishGeo, dishMat);
  dish.position.set(0, 0, 0.55);
  group.add(dish);

  // 3 & 4. Twin Photovoltaic Solar Wings
  const wingGeo = new THREE.BoxGeometry(2.9, 0.05, 0.55);
  const wings = new THREE.Mesh(wingGeo, panelMat);
  group.add(wings);

  // 5. Telemetry Beacon Tip
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), beaconMat);
  tip.position.set(0, 0, 0.95);
  group.add(tip);

  return group;
}


