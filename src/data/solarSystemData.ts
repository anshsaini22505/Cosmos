export interface MoonInfo {
  name: string;
  radius: number;
  distance: number;
  speed: number;
  color: string;
}

export interface PlanetData {
  id: string;
  name: string;
  hindiName: string;
  subtitle: string;
  type: string;
  orbitRadius: number;
  radius: number;
  orbitSpeed: number;
  rotationSpeed: number;
  tilt: number;
  color: string;
  accentColor: string;
  distanceFromSunKm: string;
  dayLength: string;
  yearLength: string;
  temperature: string;
  gravity: string;
  moonsCount: number;
  atmosphere: string;
  descriptionEn: string;
  descriptionHi: string;
  funFact: string;
  resources: string;
  hasRings?: boolean;
  ringInnerRadius?: number;
  ringOuterRadius?: number;
  moons?: MoonInfo[];
}

export interface BuildableStructureSpec {
  id: 'turret' | 'extractor' | 'station';
  name: string;
  hindiName: string;
  costCrystals: number;
  costTitanium: number;
  summary: string;
  benefit: string;
  color: string;
}

export interface StarshipUpgradeSpec {
  id: 'laser' | 'engine' | 'hull' | 'shield' | 'tractor';
  name: string;
  hindiName: string;
  baseCostCrystals: number;
  baseCostTitanium: number;
  maxLevel: number;
  benefitPerLevel: string;
}

export interface SpaceMissionSpec {
  id: string;
  titleEn: string;
  titleHi: string;
  targetText: string;
  rewardCrystals: number;
  rewardScore: number;
}

export const STARSHIP_UPGRADES: StarshipUpgradeSpec[] = [
  {
    id: 'laser',
    name: 'Plasma Pulse Cannons',
    hindiName: 'प्लाज़्मा लेज़र तोप',
    baseCostCrystals: 35,
    baseCostTitanium: 20,
    maxLevel: 5,
    benefitPerLevel: '+35% Laser Damage & Faster Fire Rate',
  },
  {
    id: 'engine',
    name: 'Ion Afterburner Drive',
    hindiName: 'आयन थ्रस्टर इंजन',
    baseCostCrystals: 30,
    baseCostTitanium: 25,
    maxLevel: 5,
    benefitPerLevel: '+18% Top Flight & Warp Boost Speed',
  },
  {
    id: 'hull',
    name: 'Graphene Hull Armor',
    hindiName: 'मजबूत यान कवच',
    baseCostCrystals: 25,
    baseCostTitanium: 35,
    maxLevel: 5,
    benefitPerLevel: '+30 Max Hull Integrity & Full Hull Repair',
  },
  {
    id: 'shield',
    name: 'Deflector Shield Matrix',
    hindiName: 'ऊर्जा सुरक्षा चक्र',
    baseCostCrystals: 40,
    baseCostTitanium: 25,
    maxLevel: 5,
    benefitPerLevel: '+30 Max Shield & +40% Recharge Speed',
  },
  {
    id: 'tractor',
    name: 'Graviton Tractor Beam',
    hindiName: 'गुरुत्वाकर्षण ट्रैक्टर बीम',
    baseCostCrystals: 45,
    baseCostTitanium: 20,
    maxLevel: 5,
    benefitPerLevel: 'Pulls Starlight Crystals automatically from wider range',
  },
];

export const SPACE_MISSIONS: SpaceMissionSpec[] = [
  {
    id: 'scan_inner',
    titleEn: 'Inner Solar Recon: Scan 3 Worlds',
    titleHi: 'आंतरिक सौर मिशन: 3 ग्रहों को स्कैन करें',
    targetText: 'Fly close to or click 3 celestial bodies to scan them',
    rewardCrystals: 60,
    rewardScore: 300,
  },
  {
    id: 'mine_belt',
    titleEn: 'Asteroid Belt Miner: Blast 5 Asteroids',
    titleHi: 'उल्कापिंड खनन: 5 एस्टेरॉयड तोड़ें',
    targetText: 'Destroy 5 asteroids with lasers to harvest Titanium',
    rewardCrystals: 75,
    rewardScore: 400,
  },
  {
    id: 'build_first',
    titleEn: 'Space Architect: Build 2 Orbital Outposts',
    titleHi: 'अंतरिक्ष निर्माता: ग्रहों के पास 2 स्टेशन बनाएँ',
    targetText: 'Use the Build tab (or keys 1/2/3) to construct 2 outposts',
    rewardCrystals: 90,
    rewardScore: 500,
  },
  {
    id: 'pirate_hunter',
    titleEn: 'Sector Guardian: Defeat 4 Void Pirates',
    titleHi: 'अंतरिक्ष रक्षक: 4 दुश्मन यानों को नष्ट करें',
    targetText: 'Shoot down 4 crimson Void Pirate interceptors',
    rewardCrystals: 110,
    rewardScore: 650,
  },
  {
    id: 'grand_tour',
    titleEn: 'Grand Odyssey: Scan All 10 Solar Worlds',
    titleHi: 'संपूर्ण सौर मंडल यात्रा: सभी 10 लोक स्कैन करें',
    targetText: 'Explore from the Sun all the way to Pluto in the Kuiper Belt',
    rewardCrystals: 200,
    rewardScore: 1200,
  },
];

export const BUILDABLE_STRUCTURES: BuildableStructureSpec[] = [
  {
    id: 'turret',
    name: 'Aegis Defense Turret',
    hindiName: 'रक्षा लेज़र टावर',
    costCrystals: 40,
    costTitanium: 25,
    summary: 'Automated orbital plasma cannon that locks onto and destroys pirate interceptors.',
    benefit: 'Auto-fires heavy plasma bolts at enemies within 95u range',
    color: '#f59e0b',
  },
  {
    id: 'extractor',
    name: 'Helios Resource Extractor',
    hindiName: 'अंतरिक्ष खनिज संयंत्र',
    costCrystals: 50,
    costTitanium: 35,
    summary: 'Deep-orbit centrifuge refinery that harvests Starlight Shards and Titanium.',
    benefit: 'Generates +6 Crystals & +4 Titanium every 5 seconds',
    color: '#06b6d4',
  },
  {
    id: 'station',
    name: 'Surya Habitat Starport',
    hindiName: 'सौर स्पेस स्टेशन',
    costCrystals: 80,
    costTitanium: 55,
    summary: 'Rotating biodome command station that repairs starship hull and recharges shields.',
    benefit: 'Restores +15 Hull/sec when docked nearby & +500 Colony Score',
    color: '#10b981',
  },
];

export const SOLAR_SYSTEM_DATA: PlanetData[] = [
  {
    id: 'sun',
    name: 'The Sun',
    hindiName: 'सूर्य (Surya)',
    subtitle: 'G-Type Main-Sequence Yellow Dwarf Star',
    type: 'Star · Solar Core',
    orbitRadius: 0,
    radius: 18,
    orbitSpeed: 0,
    rotationSpeed: 0.15,
    tilt: 0.12,
    color: '#fbbf24',
    accentColor: '#f59e0b',
    distanceFromSunKm: '0 km (Solar Center)',
    dayLength: '25 Earth Days (Equator)',
    yearLength: '230 Million Earth Years (Galactic)',
    temperature: '5,500°C Surface · 15,000,000°C Core',
    gravity: '274 m/s² (28× Earth)',
    moonsCount: 0,
    atmosphere: '73% Hydrogen · 25% Helium · Ionized Plasma Corona',
    descriptionEn:
      'The gravitational heart of our Solar System, containing 99.86% of its total mass. Nuclear fusion in its core converts 600 million tons of hydrogen into helium every second.',
    descriptionHi:
      'सौर मंडल का केंद्र और ऊर्जा का मुख्य स्रोत। इसके केंद्र में हाइड्रोजन से हीलियम बनने की नाभिकीय संलयन (Nuclear Fusion) प्रक्रिया से पूरे अंतरिक्ष को प्रकाश और ताप मिलता है।',
    funFact: 'About 1.3 million Earths could fit inside the Sun.',
    resources: 'Solar Plasma · Helium-3 · Photonic Energy',
  },
  {
    id: 'mercury',
    name: 'Mercury',
    hindiName: 'बुध (Budh)',
    subtitle: 'Swift Iron-Core Terrestrial World',
    type: 'Terrestrial Planet',
    orbitRadius: 38,
    radius: 2.4,
    orbitSpeed: 0.42,
    rotationSpeed: 0.08,
    tilt: 0.03,
    color: '#94a3b8',
    accentColor: '#cbd5e1',
    distanceFromSunKm: '57.9 Million km',
    dayLength: '58.6 Earth Days',
    yearLength: '88 Earth Days',
    temperature: '-180°C to +430°C',
    gravity: '3.7 m/s² (0.38× Earth)',
    moonsCount: 0,
    atmosphere: 'Ultra-thin Exosphere (Oxygen, Sodium, Hydrogen)',
    descriptionEn:
      'The smallest and innermost planet in the Solar System. Scarred by ancient impact basins like the Caloris Basin, Mercury boasts a massive iron core making up 85% of its radius.',
    descriptionHi:
      'सूर्य के सबसे निकट और सौर मंडल का सबसे छोटा ग्रह। यह केवल 88 दिनों में सूर्य की परिक्रमा पूरी कर लेता है और इसकी सतह पर विशाल क्रेटर मौजूद हैं।',
    funFact: 'Despite being closest to the Sun, Venus is hotter because Mercury lacks a heat-trapping atmosphere.',
    resources: 'Heavy Iron Ore · Titanium Silicates · Solar Crystals',
  },
  {
    id: 'venus',
    name: 'Venus',
    hindiName: 'शुक्र (Shukra)',
    subtitle: 'Super-Greenhouse Morning & Evening Star',
    type: 'Terrestrial Planet',
    orbitRadius: 58,
    radius: 3.6,
    orbitSpeed: 0.31,
    rotationSpeed: -0.04,
    tilt: 3.09,
    color: '#f59e0b',
    accentColor: '#fde68a',
    distanceFromSunKm: '108.2 Million km',
    dayLength: '243 Earth Days (Retrograde)',
    yearLength: '225 Earth Days',
    temperature: '+475°C (Hottest Planet)',
    gravity: '8.87 m/s² (0.90× Earth)',
    moonsCount: 0,
    atmosphere: '96.5% Carbon Dioxide · Dense Sulfuric Acid Clouds',
    descriptionEn:
      'Shrouded in thick golden clouds of sulfuric acid, Venus spins backward (retrograde) compared to most planets. Its runaway greenhouse effect makes its surface hotter than molten lead.',
    descriptionHi:
      'पृथ्वी की जुड़वां बहन कहलाने वाला यह ग्रह सौर मंडल का सबसे गर्म और चमकीला ग्रह है। यह पूर्व से पश्चिम की ओर उल्टी दिशा में घूमता है।',
    funFact: 'A single sidereal day on Venus (243 Earth days) is longer than its entire year (225 Earth days).',
    resources: 'Sulfuric Condensates · Atmospheric Deuterium · Basalt',
  },
  {
    id: 'earth',
    name: 'Earth',
    hindiName: 'पृथ्वी (Prithvi)',
    subtitle: 'Cradle of Humanity & Blue Ocean World',
    type: 'Terrestrial Planet · Homeworld',
    orbitRadius: 84,
    radius: 4.1,
    orbitSpeed: 0.24,
    rotationSpeed: 0.55,
    tilt: 0.41,
    color: '#3b82f6',
    accentColor: '#38bdf8',
    distanceFromSunKm: '149.6 Million km (1 AU)',
    dayLength: '23h 56m 4s',
    yearLength: '365.25 Days',
    temperature: '15°C Average (-89°C to +56°C)',
    gravity: '9.81 m/s² (1.00g)',
    moonsCount: 1,
    atmosphere: '78% Nitrogen · 21% Oxygen · 1% Argon & Water Vapor',
    descriptionEn:
      'The only astronomical world known to harbor liquid surface oceans and life. Protected by a powerful magnetosphere generated by its liquid outer iron core and stabilized by the Moon.',
    descriptionHi:
      'हमारा नीला ग्रह, जहाँ जल, ऑक्सीजन और जीवन मौजूद है। इसका चुंबकीय क्षेत्र (Magnetosphere) हमें खतरनाक सौर तूफानों से बचाता है और चंद्रमा इसके मौसम को संतुलित रखता है।',
    funFact: 'Earth is the densest planet in the entire Solar System at 5.51 g/cm³.',
    resources: 'Liquid Water · Biosphere Data · Orbital Command Relay',
    moons: [
      {
        name: 'Moon (Chandra)',
        radius: 1.05,
        distance: 8.5,
        speed: 1.4,
        color: '#e2e8f0',
      },
    ],
  },
  {
    id: 'mars',
    name: 'Mars',
    hindiName: 'मंगल (Mangal)',
    subtitle: 'The Red Frontier & Olympus Mons World',
    type: 'Terrestrial Planet',
    orbitRadius: 112,
    radius: 3.1,
    orbitSpeed: 0.19,
    rotationSpeed: 0.52,
    tilt: 0.44,
    color: '#ef4444',
    accentColor: '#f87171',
    distanceFromSunKm: '227.9 Million km',
    dayLength: '24h 37m (1 Sol)',
    yearLength: '687 Earth Days',
    temperature: '-65°C Average (-140°C to +20°C)',
    gravity: '3.72 m/s² (0.38× Earth)',
    moonsCount: 2,
    atmosphere: '95% Carbon Dioxide · 2.6% Nitrogen · 1.9% Argon',
    descriptionEn:
      'Colored rust-red by iron oxide dust, Mars features Olympus Mons—the tallest volcano in the Solar System (21.9 km high)—and Valles Marineris, a canyon system spanning 4,000 km.',
    descriptionHi:
      'आयरन ऑक्साइड (जंग) के कारण लाल दिखने वाला मंगल ग्रह मानव बस्ती बसाने के लिए सबसे प्रमुख लक्ष्य है। यहाँ सौर मंडल का सबसे ऊँचा ज्वालामुखी ओलंपस मॉन्स स्थित है।',
    funFact: 'Sunsets on Mars appear bluish-white because fine red dust scatters warm light and lets blue rays pass.',
    resources: 'Iron Oxide · Subsurface Water Ice · Perchlorate Propellant',
    moons: [
      { name: 'Phobos', radius: 0.55, distance: 5.8, speed: 2.2, color: '#cbd5e1' },
      { name: 'Deimos', radius: 0.42, distance: 7.5, speed: 1.5, color: '#94a3b8' },
    ],
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    hindiName: 'बृहस्पति (Brihaspati)',
    subtitle: 'Colossal Gas Giant & Great Red Spot',
    type: 'Gas Giant',
    orbitRadius: 168,
    radius: 8.8,
    orbitSpeed: 0.11,
    rotationSpeed: 0.95,
    tilt: 0.05,
    color: '#d97706',
    accentColor: '#fbbf24',
    distanceFromSunKm: '778.5 Million km',
    dayLength: '9h 55m (Fastest Spin)',
    yearLength: '11.86 Earth Years',
    temperature: '-110°C Cloud Tops',
    gravity: '24.79 m/s² (2.53× Earth)',
    moonsCount: 95,
    atmosphere: '90% Hydrogen · 10% Helium · Ammonia Storm Bands',
    descriptionEn:
      'Twice as massive as all other planets combined. Jupiter’s rapid 10-hour rotation whips its ammonia clouds into turbulent jet streams and powers the Great Red Spot, a storm larger than Earth.',
    descriptionHi:
      'सौर मंडल का सबसे विशाल ग्रह। इसका गुरुत्वाकर्षण इतना शक्तिशाली है कि यह धूमकेतुओं और उल्कापिंडों को अपनी ओर खींचकर पृथ्वी की रक्षा एक ढाल की तरह करता है।',
    funFact: 'Jupiter has the shortest day of all planets, completing a full rotation in under 10 hours.',
    resources: 'Metallic Hydrogen · Helium-3 · Galilean Cryo-Minerals',
    moons: [
      { name: 'Io', radius: 0.85, distance: 12.5, speed: 2.1, color: '#facc15' },
      { name: 'Europa', radius: 0.8, distance: 14.8, speed: 1.6, color: '#bae6fd' },
      { name: 'Ganymede', radius: 1.15, distance: 17.5, speed: 1.2, color: '#cbd5e1' },
    ],
  },
  {
    id: 'saturn',
    name: 'Saturn',
    hindiName: 'शनि (Shani)',
    subtitle: 'Jewel of the Solar System & Ringed Giant',
    type: 'Gas Giant',
    orbitRadius: 224,
    radius: 7.4,
    orbitSpeed: 0.08,
    rotationSpeed: 0.85,
    tilt: 0.47,
    color: '#eab308',
    accentColor: '#fde047',
    distanceFromSunKm: '1.43 Billion km',
    dayLength: '10h 33m',
    yearLength: '29.45 Earth Years',
    temperature: '-140°C Cloud Tops',
    gravity: '10.44 m/s² (1.06× Earth)',
    moonsCount: 146,
    atmosphere: '96% Hydrogen · 3% Helium · Golden Haze',
    descriptionEn:
      'Adorned with a dazzling system of icy rings extending 282,000 km across yet averaging only 10 meters thick. Saturn has the lowest density of any planet—less dense than liquid water.',
    descriptionHi:
      'अपने भव्य बर्फ और चट्टानों के छल्लों (Rings) के लिए प्रसिद्ध शनि ग्रह के पास सौर मंडल में सबसे अधिक (146) चंद्रमा हैं, जिनमें टाइटन प्रमुख है।',
    funFact: 'Saturn’s average density is 0.687 g/cm³—meaning it would float in a cosmic ocean of water.',
    resources: 'Ring Water Ice · Titan Hydrocarbons · Cryo-Crystals',
    hasRings: true,
    ringInnerRadius: 9.5,
    ringOuterRadius: 17.5,
    moons: [
      { name: 'Titan', radius: 1.2, distance: 20.2, speed: 1.1, color: '#f59e0b' },
      { name: 'Enceladus', radius: 0.65, distance: 18.2, speed: 1.7, color: '#f8fafc' },
    ],
  },
  {
    id: 'uranus',
    name: 'Uranus',
    hindiName: 'अरुण (Arun)',
    subtitle: 'Sideways-Spinning Cyan Ice Giant',
    type: 'Ice Giant',
    orbitRadius: 276,
    radius: 5.2,
    orbitSpeed: 0.055,
    rotationSpeed: -0.65,
    tilt: 1.71,
    color: '#06b6d4',
    accentColor: '#67e8f9',
    distanceFromSunKm: '2.87 Billion km',
    dayLength: '17h 14m',
    yearLength: '84 Earth Years',
    temperature: '-224°C (Coldest Planetary Atmosphere)',
    gravity: '8.69 m/s² (0.89× Earth)',
    moonsCount: 28,
    atmosphere: '83% Hydrogen · 15% Helium · 2% Methane Ice Haze',
    descriptionEn:
      'Knocked onto its side by a primordial cataclysm with an axial tilt of 97.77 degrees, Uranus rolls around the Sun like a sphere. Methane in its upper atmosphere absorbs red light, giving it a serene aquamarine hue.',
    descriptionHi:
      'यह बर्फ का दानव (Ice Giant) अपनी धुरी पर 98 डिग्री झुका हुआ है, जिससे ऐसा लगता है मानो यह सूर्य के चारों ओर लुढ़कते हुए परिक्रमा कर रहा हो।',
    funFact: 'Extreme pressure deep inside Uranus and Neptune compresses carbon into literal diamond rain.',
    resources: 'Methane Clathrates · Compressed Diamond Dust · Deuterium',
    hasRings: true,
    ringInnerRadius: 6.6,
    ringOuterRadius: 8.8,
  },
  {
    id: 'neptune',
    name: 'Neptune',
    hindiName: 'वरुण (Varun)',
    subtitle: 'Supersonic Cobalt Storm Ice Giant',
    type: 'Ice Giant',
    orbitRadius: 325,
    radius: 5.0,
    orbitSpeed: 0.04,
    rotationSpeed: 0.7,
    tilt: 0.49,
    color: '#2563eb',
    accentColor: '#60a5fa',
    distanceFromSunKm: '4.50 Billion km (30 AU)',
    dayLength: '16h 6m',
    yearLength: '164.8 Earth Years',
    temperature: '-214°C Average',
    gravity: '11.15 m/s² (1.14× Earth)',
    moonsCount: 16,
    atmosphere: '80% Hydrogen · 19% Helium · 1.5% Methane',
    descriptionEn:
      'The outermost major planet, whipped by the fastest supersonic winds in the Solar System reaching 2,100 km/h. It was the first planet discovered through mathematical prediction before being seen by telescope.',
    descriptionHi:
      'सूर्य से सबसे दूर स्थित गहरा नीला ग्रह, जहाँ सौर मंडल की सबसे तेज़ बर्फीली हवाएँ (2,100 किमी/घंटा) चलती हैं। इसका प्रमुख चंद्रमा ट्राइटन है।',
    funFact: 'Since its discovery in 1846, Neptune has completed only one full 165-year orbit around the Sun (in 2011).',
    resources: 'Cryo-Nitrogen · Antimatter Isotopes · Deep Space Telemetry',
    moons: [
      { name: 'Triton', radius: 0.95, distance: 9.2, speed: -1.3, color: '#93c5fd' },
    ],
  },
  {
    id: 'pluto',
    name: 'Pluto',
    hindiName: 'यम / प्लूटो (Yama)',
    subtitle: 'Kuiper Belt Ice Dwarf & Tombaugh Regio Heart',
    type: 'Dwarf Planet · Kuiper Belt',
    orbitRadius: 362,
    radius: 2.3,
    orbitSpeed: 0.028,
    rotationSpeed: -0.18,
    tilt: 2.1,
    color: '#a8a29e',
    accentColor: '#f5d0fe',
    distanceFromSunKm: '5.9 Billion km (39.5 AU)',
    dayLength: '6.39 Earth Days',
    yearLength: '248 Earth Years',
    temperature: '-229°C Nitrogen Ice Glaciers',
    gravity: '0.62 m/s² (0.06× Earth)',
    moonsCount: 5,
    atmosphere: 'Thin Nitrogen, Methane & Carbon Monoxide Haze',
    descriptionEn:
      'King of the Kuiper Belt, featuring the vast heart-shaped nitrogen glacier Sputnik Planitia (Tombaugh Regio) and locked in a mutual tidal dance with its giant moon Charon.',
    descriptionHi:
      'कुइपर बेल्ट का सबसे प्रसिद्ध बौना ग्रह, जिसकी सतह पर नाइट्रोजन बर्फ से बना विशाल दिल के आकार का ग्लेशियर (Tombaugh Regio) मौजूद है।',
    funFact: 'Pluto and its moon Charon always show the exact same face to each other in a double tidal lock.',
    resources: 'Nitrogen Glaciers · Kuiper Quantum Shards · Charon Ore',
    moons: [
      { name: 'Charon', radius: 0.95, distance: 5.2, speed: 0.9, color: '#d6d3d1' },
    ],
  },
];

export const ANDROID_COMPATIBILITY_LIST = [
  { version: 'Android 7.0 – 7.1 (Nougat)', api: 'API 24–25', status: 'Supported (minSdk 24 · WebGL Fallback Pacing)' },
  { version: 'Android 8.0 – 8.1 (Oreo)', api: 'API 26–27', status: 'Supported (Maskable Icons & Web Audio Synth)' },
  { version: 'Android 9.0 (Pie)', api: 'API 28', status: 'Supported (Full-Viewport Cutout & Touch Stick)' },
  { version: 'Android 10 (Q)', api: 'API 29', status: 'Supported (Gesture Nav Safe Zones & Dark Theme)' },
  { version: 'Android 11 (R)', api: 'API 30', status: 'Supported (Low-Latency Touch & Haptic Pulse)' },
  { version: 'Android 12 – 12L (S)', api: 'API 31–32', status: 'Supported (Splash Screen API & WebAPK)' },
  { version: 'Android 13 (Tiramisu)', api: 'API 33', status: 'Supported (Themed Icons & 60/120fps Damping)' },
  { version: 'Android 14 (Upside Down Cake)', api: 'API 34', status: 'Supported (Ultra HDR Tone Mapping & Offline Cache)' },
  { version: 'Android 15 (Vanilla Ice Cream)', api: 'API 35', status: 'Supported (Edge-to-Edge Fullscreen Canvas)' },
  { version: 'Android 16 (Baklava)', api: 'API 36', status: 'Supported (High-Performance WebGL2 Pipeline)' },
  { version: 'Android 17 (Next-Gen Target)', api: 'API 37', status: 'Supported (targetSdk 37 & compileSdk 37 Ready)' },
];

export interface SpaceProbeInfo {
  id: string;
  name: string;
  hindiName: string;
  agency: string;
  hostPlanetId: string;
  orbitOffset: number;
  summaryEn: string;
  summaryHi: string;
}

export const SPACE_PROBES: SpaceProbeInfo[] = [
  {
    id: 'aditya_l1',
    name: 'Aditya-L1 Solar Probe',
    hindiName: 'इसरो आदित्य-L1 सौर यान',
    agency: 'ISRO (India)',
    hostPlanetId: 'sun',
    orbitOffset: 25,
    summaryEn: 'India’s first dedicated solar coronagraphy spacecraft stationed at Lagrange Point L1 to study solar flares and coronal mass ejections.',
    summaryHi: 'सूर्य के कोरोना और सौर तूफानों का अध्ययन करने के लिए भारत (ISRO) द्वारा भेजा गया पहला सौर अंतरिक्ष वेधशाला मिशन।',
  },
  {
    id: 'chandrayaan_iss',
    name: 'Chandrayaan-3 & Orbital Relay',
    hindiName: 'चंद्रयान-3 एवं अंतरिक्ष रिले',
    agency: 'ISRO / International',
    hostPlanetId: 'earth',
    orbitOffset: 7.2,
    summaryEn: 'Commemorating the historic first soft landing near the Lunar South Pole (Shiv Shakti Point) and continuous low-Earth orbital research.',
    summaryHi: 'चंद्रमा के दक्षिणी ध्रुव (शिव शक्ति पॉइंट) पर ऐतिहासिक सफल लैंडिंग करने वाला भारत का गौरवशाली चंद्रयान-3 मिशन।',
  },
  {
    id: 'mangalyaan',
    name: 'Mangalyaan (Mars Orbiter Mission)',
    hindiName: 'मंगलयान (MOM)',
    agency: 'ISRO (India)',
    hostPlanetId: 'mars',
    orbitOffset: 6.4,
    summaryEn: 'Made India the first nation in the world to reach Mars orbit on its maiden attempt, imaging Martian dust storms and Phobos.',
    summaryHi: 'अपने पहले ही प्रयास में मंगल की कक्षा में पहुँचकर विश्व रिकॉर्ड बनाने वाला भारतीय अंतरिक्ष मिशन।',
  },
  {
    id: 'voyager_1',
    name: 'Voyager-1 Interstellar Probe',
    hindiName: 'वॉयेजर-1 अंतरतारकीय यान',
    agency: 'NASA',
    hostPlanetId: 'neptune',
    orbitOffset: 9.5,
    summaryEn: 'Carrying the Golden Record with greetings in 55 languages (including Hindi), Voyager-1 is humanity’s farthest spacecraft.',
    summaryHi: 'सोने के रिकॉर्ड (Golden Record) पर हिंदी सहित 55 भाषाओं में पृथ्वी का संदेश लेकर अनंत अंतरिक्ष में जाने वाला सबसे दूरस्थ यान।',
  },
];

