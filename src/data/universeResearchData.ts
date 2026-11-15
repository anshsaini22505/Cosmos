import solarHeroImg from '../assets/images/solar_system_hero_1794754539947.jpg';
import blackHoleImg from '../assets/images/black_hole_gargantua_1794754540686.jpg';
import jwstNebulaImg from '../assets/images/jwst_pillars_nebula_1794754543705.jpg';
import isroLunarImg from '../assets/images/isro_lunar_research_1794754544927.jpg';
import milkyWayImg from '../assets/images/milky_way_andromeda_1794754569293.jpg';
import exoplanetImg from '../assets/images/exoplanet_trappist_1794754570472.jpg';

export const HIGH_RES_SPACE_IMAGES = {
  solarSystem: solarHeroImg,
  blackHole: blackHoleImg,
  jwstNebula: jwstNebulaImg,
  isroLunar: isroLunarImg,
  milkyWay: milkyWayImg,
  exoplanet: exoplanetImg,
};

export interface PlanetCoreLayer {
  nameHi: string;
  nameEn: string;
  depthKm: string;
  temp: string;
  color: string;
  compositionHi: string;
  compositionEn: string;
}

export const PLANET_INTERNAL_LAYERS: Record<string, PlanetCoreLayer[]> = {
  sun: [
    {
      nameHi: 'सौर कोरोना एवं फोटोस्फीयर (Photosphere)',
      nameEn: 'Photosphere & Corona',
      depthKm: '0 – 2,000 km',
      temp: '5,500°C – 2,000,000°C',
      color: '#f59e0b',
      compositionHi: 'आयनित हाइड्रोजन और हीलियम प्लाज्मा, चुंबकीय लूप',
      compositionEn: 'Ionized hydrogen-helium plasma & magnetic flux loops',
    },
    {
      nameHi: 'संवहन क्षेत्र (Convective Zone)',
      nameEn: 'Convective Zone',
      depthKm: '200,000 km',
      temp: '2,000,000°C',
      color: '#ea580c',
      compositionHi: 'उबलते हुए विशाल प्लाज्मा सेल (Granulation)',
      compositionEn: 'Boiling thermal plasma convection columns',
    },
    {
      nameHi: 'विकिरण क्षेत्र (Radiative Zone)',
      nameEn: 'Radiative Zone',
      depthKm: '300,000 km',
      temp: '7,000,000°C',
      color: '#fbbf24',
      compositionHi: 'सघन फोटॉन विकिरण मार्ग (फोटॉन को बाहर आने में 1 लाख वर्ष लगते हैं)',
      compositionEn: 'Dense photon diffusion zone',
    },
    {
      nameHi: 'नाभिकीय संलयन केंद्र (Thermonuclear Core)',
      nameEn: 'Thermonuclear Core',
      depthKm: '150,000 km radius',
      temp: '15,000,000°C',
      color: '#fef08a',
      compositionHi: 'प्रति सेकंड 60 करोड़ टन हाइड्रोजन का हीलियम में संलयन',
      compositionEn: '600M tons/sec hydrogen-to-helium nuclear fusion',
    },
  ],
  mercury: [
    {
      nameHi: 'सिलिकेट भूपर्पटी (Silicate Crust)',
      nameEn: 'Silicate Crust',
      depthKm: '35 km',
      temp: '-180°C to 430°C',
      color: '#94a3b8',
      compositionHi: 'क्रेटर युक्त बेसाल्ट और ग्रेफाइट-समृद्ध चट्टानें',
      compositionEn: 'Heavily cratered basaltic & graphite-rich rock',
    },
    {
      nameHi: 'चट्टानी मेंटल (Rocky Mantle)',
      nameEn: 'Rocky Mantle',
      depthKm: '400 km',
      temp: '1,100°C',
      color: '#64748b',
      compositionHi: 'मैग्नीशियम और आयरन सिलिकेट',
      compositionEn: 'Compressed magnesium & iron silicates',
    },
    {
      nameHi: 'विशाल लौह कोर (Giant Iron Core - 85% Radius)',
      nameEn: 'Massive Metallic Core',
      depthKm: '2,020 km radius',
      temp: '2,200°C',
      color: '#f59e0b',
      compositionHi: 'तरल और ठोस लोहा-निकल (सौर मंडल का सबसे बड़ा अनुपातिक कोर)',
      compositionEn: 'Molten & solid iron-nickel alloy (85% of planet radius)',
    },
  ],
  venus: [
    {
      nameHi: 'सल्फ्यूरिक एसिड वायुमंडल (Super-Rotating Atmosphere)',
      nameEn: 'Sulfuric Cloud Deck',
      depthKm: '250 km',
      temp: '465°C (92 bar pressure)',
      color: '#fde68a',
      compositionHi: '96.5% कार्बन डाइऑक्साइड और सल्फ्यूरिक एसिड के बादल',
      compositionEn: '96.5% CO2 supercritical greenhouse atmosphere',
    },
    {
      nameHi: 'ज्वालामुखीय बेसाल्ट क्रस्ट (Volcanic Crust)',
      nameEn: 'Basaltic Crust',
      depthKm: '50 km',
      temp: '475°C',
      color: '#d97706',
      compositionHi: 'सक्रिय ज्वालामुखी मैदान (Maat Mons)',
      compositionEn: 'Active volcanic plains & coronae structures',
    },
    {
      nameHi: 'गर्म सिलिकेट मेंटल (Silicate Mantle)',
      nameEn: 'Silicate Mantle',
      depthKm: '2,800 km',
      temp: '2,500°C',
      color: '#ea580c',
      compositionHi: 'पिघली हुई चट्टानें और संवहन धाराएँ',
      compositionEn: 'Convecting rocky silicate mantle',
    },
    {
      nameHi: 'लौह-निकल कोर (Iron-Nickel Core)',
      nameEn: 'Metallic Core',
      depthKm: '3,200 km radius',
      temp: '4,800°C',
      color: '#fef08a',
      compositionHi: 'आंशिक रूप से तरल लोहा और निकल',
      compositionEn: 'Partially liquid iron-nickel core',
    },
  ],
  earth: [
    {
      nameHi: 'महासागर एवं भूपर्पटी (Continental & Oceanic Crust)',
      nameEn: 'Crust & Hydrosphere',
      depthKm: '5 – 70 km',
      temp: '15°C avg',
      color: '#38bdf8',
      compositionHi: '71% तरल जल महासागर, ग्रेनाइट और बेसाल्ट टेक्टोनिक प्लेट्स',
      compositionEn: '71% liquid water oceans, granite & basalt tectonic plates',
    },
    {
      nameHi: 'सिलिकेट मेंटल (Upper & Lower Mantle)',
      nameEn: 'Silicate Mantle',
      depthKm: '2,890 km',
      temp: '1,000°C – 3,700°C',
      color: '#ea580c',
      compositionHi: 'पेरिडोटाइट और ब्रिजमेनाइट चट्टानें (टेक्टोनिक गति का स्रोत)',
      compositionEn: 'Viscous magnesium-iron silicate rock driving plate tectonics',
    },
    {
      nameHi: 'तरल बाहरी कोर (Liquid Outer Core)',
      nameEn: 'Liquid Outer Core',
      depthKm: '2,260 km thick',
      temp: '4,500°C – 5,500°C',
      color: '#f59e0b',
      compositionHi: 'घूमता हुआ तरल लोहा और निकल (पृथ्वी के चुंबकीय कवच का जनक)',
      compositionEn: 'Convecting liquid iron-nickel generating Earth’s magnetosphere',
    },
    {
      nameHi: 'ठोस आंतरिक कोर (Solid Inner Core)',
      nameEn: 'Solid Inner Core',
      depthKm: '1,220 km radius',
      temp: '5,700°C (सूर्य की सतह जितना गर्म)',
      color: '#fef08a',
      compositionHi: 'अत्यधिक दबाव में ठोस क्रिस्टलीय लोहा-निकल',
      compositionEn: 'Super-compressed solid crystalline iron-nickel sphere',
    },
  ],
  mars: [
    {
      nameHi: 'लौह-ऑक्साइड क्रस्ट (Iron-Oxide Regolith Crust)',
      nameEn: 'Iron-Oxide Crust',
      depthKm: '50 km',
      temp: '-65°C avg',
      color: '#ef4444',
      compositionHi: 'हेमेटाइट (जंग लगा लोहा), ध्रुवीय जल-बर्फ और विशाल ज्वालामुखी',
      compositionEn: 'Iron-oxide dust, subsurface water-ice & volcanic shield basalt',
    },
    {
      nameHi: 'सिलिकेट मेंटल (Dormant Silicate Mantle)',
      nameEn: 'Silicate Mantle',
      depthKm: '1,500 km',
      temp: '1,500°C',
      color: '#c2410c',
      compositionHi: 'लोहा-समृद्ध चट्टानी मेंटल (NASA InSight भूकंपीय डेटा)',
      compositionEn: 'Iron-rich rocky mantle mapped by NASA InSight seismometer',
    },
    {
      nameHi: 'तरल लौह-सल्फर कोर (Liquid Iron-Sulfur Core)',
      nameEn: 'Liquid Alloy Core',
      depthKm: '1,830 km radius',
      temp: '2,000°C',
      color: '#fbbf24',
      compositionHi: 'लोहा, निकल और हल्के तत्व (सल्फर, ऑक्सीजन)',
      compositionEn: 'Liquid iron-nickel alloy enriched with sulfur and oxygen',
    },
  ],
  jupiter: [
    {
      nameHi: 'अमोनिया और हाइड्रोजन बादल (Cloud Layer & Great Red Spot)',
      nameEn: 'Ammonia Cloud Deck',
      depthKm: '1,000 km',
      temp: '-110°C',
      color: '#f59e0b',
      compositionHi: 'हाइड्रोजन, हीलियम और अमोनिया क्रिस्टल के तूफानी बैंड',
      compositionEn: 'Turbulent hydrogen-helium & ammonia crystal jet streams',
    },
    {
      nameHi: 'तरल धात्विक हाइड्रोजन (Liquid Metallic Hydrogen)',
      nameEn: 'Metallic Hydrogen Ocean',
      depthKm: '45,000 km',
      temp: '10,000°C',
      color: '#38bdf8',
      compositionHi: 'अत्यधिक दबाव में बिजली की तरह प्रवाहित होने वाला तरल हाइड्रोजन',
      compositionEn: 'Super-pressurized electrically conductive metallic hydrogen',
    },
    {
      nameHi: 'धुंधला भारी कोर (Dilute Fuzzy Core - Juno Discovery)',
      nameEn: 'Dilute Rocky-Ice Core',
      depthKm: '20,000 km radius',
      temp: '24,000°C',
      color: '#fef08a',
      compositionHi: 'चट्टान, धातु और हाइड्रोजन का मिश्रित विशाल केंद्र (NASA Juno खोज)',
      compositionEn: 'Partially dissolved heavy-element core discovered by NASA Juno',
    },
  ],
  saturn: [
    {
      nameHi: 'बर्फीले वलय एवं बाहरी वायुमंडल (Icy Rings & Upper Clouds)',
      nameEn: 'Rings & Ammonia Haze',
      depthKm: '282,000 km ring span',
      temp: '-140°C',
      color: '#fde047',
      compositionHi: '99% शुद्ध जल-बर्फ के छल्ले और षट्कोणीय (Hexagon) ध्रुवीय तूफान',
      compositionEn: '99% pure water-ice ring particles & north polar hexagon jet',
    },
    {
      nameHi: 'धात्विक हाइड्रोजन एवं हीलियम वर्षा (Helium Rain Layer)',
      nameEn: 'Metallic Hydrogen & Helium Rain',
      depthKm: '30,000 km',
      temp: '6,000°C',
      color: '#ca8a04',
      compositionHi: 'तरल धात्विक हाइड्रोजन जिसमें हीलियम की बूंदें बरसती हैं',
      compositionEn: 'Metallic hydrogen layer with condensing liquid helium droplets',
    },
    {
      nameHi: 'चट्टानी-बर्फीला कोर (Rocky & Icy Core)',
      nameEn: 'Dense Core',
      depthKm: '15,000 km radius',
      temp: '11,700°C',
      color: '#fef9c3',
      compositionHi: 'पृथ्वी से 15 गुना अधिक द्रव्यमान वाला सघन केंद्र',
      compositionEn: '15-Earth-mass core of iron, nickel, and compressed ices',
    },
  ],
  uranus: [
    {
      nameHi: 'मीथेन वायुमंडल (Methane Cyan Atmosphere)',
      nameEn: 'Methane-Hydrogen Atmosphere',
      depthKm: '5,000 km',
      temp: '-224°C',
      color: '#67e8f9',
      compositionHi: 'हाइड्रोजन, हीलियम और नीला रंग देने वाली मीथेन गैस',
      compositionEn: 'Hydrogen, helium, and red-light-absorbing methane gas',
    },
    {
      nameHi: 'सुपरआयनिक जल एवं हीरों की बारिश (Diamond Rain Ice Mantle)',
      nameEn: 'Superionic Ice Mantle',
      depthKm: '15,000 km',
      temp: '4,700°C',
      color: '#06b6d4',
      compositionHi: 'गर्म संपीड़ित जल, अमोनिया और उच्च दबाव में बनने वाले असली हीरों की वर्षा',
      compositionEn: 'Hot dense fluid of water, ammonia & crystallized diamond rain',
    },
    {
      nameHi: 'सिलिकेट-लौह कोर (Rocky Silicate Core)',
      nameEn: 'Silicate-Iron Core',
      depthKm: '5,000 km radius',
      temp: '5,000°C',
      color: '#cbd5e1',
      compositionHi: 'ठोस चट्टान और धातु का केंद्र',
      compositionEn: 'Compact silicate rock and iron-nickel core',
    },
  ],
  neptune: [
    {
      nameHi: 'सुपरसोनिक मीथेन वायुमंडल (Supersonic Storm Deck)',
      nameEn: 'Supersonic Methane Clouds',
      depthKm: '4,500 km',
      temp: '-214°C',
      color: '#3b82f6',
      compositionHi: '2,100 किमी/घंटा की रफ़्तार से चलने वाली सौर मंडल की सबसे तेज़ हवाएँ',
      compositionEn: '2,100 km/h supersonic methane jet streams',
    },
    {
      nameHi: 'सुपरआयनिक जल-अमोनिया महासागर (Ionic Ice Mantle)',
      nameEn: 'Ionic Water-Ammonia Mantle',
      depthKm: '14,000 km',
      temp: '5,100°C',
      color: '#1d4ed8',
      compositionHi: 'अत्यधिक दबाव में विद्युत चालक जल-अमोनिया और कार्बन हीरे',
      compositionEn: 'Electrically conductive water-ammonia fluid & carbon diamonds',
    },
    {
      nameHi: 'चट्टानी केंद्र (Rocky Core)',
      nameEn: 'Rocky Core',
      depthKm: '5,500 km radius',
      temp: '5,400°C',
      color: '#e2e8f0',
      compositionHi: 'लोहा, निकल और सिलिकेट चट्टान',
      compositionEn: 'Earth-sized iron, nickel, and silicate core',
    },
  ],
  pluto: [
    {
      nameHi: 'नाइट्रोजन बर्फ़ का दिल (Sputnik Planitia Nitrogen Ice)',
      nameEn: 'Nitrogen-Methane Ice Crust',
      depthKm: '300 km',
      temp: '-229°C',
      color: '#e7e5e4',
      compositionHi: 'जमी हुई नाइट्रोजन, मीथेन और जल-बर्फ के पहाड़',
      compositionEn: 'Frozen nitrogen glaciers & water-ice mountain ranges',
    },
    {
      nameHi: 'भूमिगत तरल महासागर (Subsurface Ammonia-Water Ocean)',
      nameEn: 'Subsurface Liquid Ocean',
      depthKm: '100 km thick',
      temp: '-30°C (Ammonia antifreeze)',
      color: '#38bdf8',
      compositionHi: 'अमोनिया युक्त संभावित भूमिगत तरल महासागर (New Horizons शोध)',
      compositionEn: 'Suspected subsurface liquid water-ammonia ocean',
    },
    {
      nameHi: 'प्राचीन सिलिकेट कोर (Ancient Silicate Core)',
      nameEn: 'Rocky Core',
      depthKm: '850 km radius',
      temp: '800°C',
      color: '#78716c',
      compositionHi: 'रेडियोधर्मी तत्वों से गर्म चट्टानी केंद्र (70% द्रव्यमान)',
      compositionEn: 'Radiogenically heated rocky core (70% of Pluto’s mass)',
    },
  ],
};

export interface UniverseResearchArticle {
  id: string;
  category: 'isro_nasa' | 'black_holes' | 'jwst_nebula' | 'exoplanets' | 'cosmology' | 'solar_system';
  badge: string;
  titleHi: string;
  titleEn: string;
  subtitleHi: string;
  subtitleEn: string;
  image: string;
  targetPlanetId?: string;
   warpPosition?: [number, number, number];
  keyMetrics: { labelHi: string; labelEn: string; value: string }[];
  summaryHi: string;
  summaryEn: string;
  discoveriesHi: string[];
  discoveriesEn: string[];
}

export const UNIVERSE_RESEARCH_ARTICLES: UniverseResearchArticle[] = [
  {
    id: 'isro-chandrayaan-aditya',
    category: 'isro_nasa',
    badge: 'ISRO · CHANDRAYAAN-3 & ADITYA-L1',
    titleHi: 'चंद्रयान-3 (शिव शक्ति पॉइंट) एवं आदित्य-L1: भारत की ऐतिहासिक अंतरिक्ष खोजें',
    titleEn: 'Chandrayaan-3 & Aditya-L1: Landmark Lunar South Pole & Solar Discoveries',
    subtitleHi: 'चंद्रमा के दक्षिणी ध्रुव पर जल-बर्फ, सल्फर और सूर्य के लैग्रेंज पॉइंट-1 से कोरोना का सीधा अध्ययन',
    subtitleEn: 'First soft-landing near the Lunar South Pole & continuous solar corona monitoring from L1',
    image: isroLunarImg,
    targetPlanetId: 'earth',
    keyMetrics: [
      { labelHi: 'लैंडिंग स्थल', labelEn: 'Landing Site', value: '69.37°S, 32.32°E (Shiv Shakti Point)' },
      { labelHi: 'सतह तापमान अंतर', labelEn: 'Thermal Gradient', value: '+70°C surface to -10°C at 8cm depth' },
      { labelHi: 'आदित्य-L1 दूरी', labelEn: 'Aditya-L1 Orbit', value: '1.5 Million km (Halo Orbit L1)' },
    ],
    summaryHi:
      'भारतीय अंतरिक्ष अनुसंधान संगठन (ISRO) के चंद्रयान-3 (विक्रम लैंडर और प्रज्ञान रोवर) ने चंद्रमा के दक्षिणी ध्रुव के पास सफलतापूर्वक उतरने वाला विश्व का पहला अभियान बनकर इतिहास रच दिया। इसके ChaSTE पेलोड ने दिखाया कि चंद्रमा की ऊपरी मिट्टी (Regolith) एक शक्तिशाली ताप-रोधी (Thermal Insulator) है, जिसके मात्र 8 सेमी नीचे तापमान अचानक 60°C गिर जाता है—जो भविष्य के मानव मून बेस (Moon Base) और जल-बर्फ संरक्षण के लिए सबसे बड़ी खोज है।',
    summaryEn:
      'ISRO’s Chandrayaan-3 Vikram Lander and Pragyan Rover achieved humanity’s first soft landing in the Lunar South Polar region. Its ChaSTE thermal probe revealed a steep 60°C temperature drop just 8 cm beneath the lunar regolith, proving that lunar soil acts as a natural thermal shield for subterranean water-ice and future human habitats.',
    discoveriesHi: [
      'LIBS और APXS उपकरणों द्वारा दक्षिणी ध्रुव की मिट्टी में सल्फर (गंधक), एल्युमिनियम, कैल्शियम, आयरन, क्रोमियम और टाइटेनियम की प्रत्यक्ष पुष्टि।',
      'RAMBHA-LP द्वारा चंद्रमा की सतह के पास विरल प्लाज्मा और आयनमंडल का पहला सटीक मापन।',
      'आदित्य-L1 के VELC और SUIT टेलीस्कोप द्वारा पृथ्वी से 15 लाख किमी दूर L1 बिंदु से कोरोनल मास इजेक्शन (CME) और सौर तूफानों की 24×7 निगरानी।',
    ],
    discoveriesEn: [
      'Direct in-situ confirmation of sulfur, aluminum, calcium, iron, chromium, and titanium via LIBS and APXS spectroscopes.',
      'First near-surface lunar plasma density measurements across lunar day via RAMBHA-LP.',
      'Continuous 24/7 solar coronal mass ejection (CME) warning and UV imaging by Aditya-L1 from Lagrange Point 1.',
    ],
  },
  {
    id: 'black-holes-event-horizon',
    category: 'black_holes',
    badge: 'EVENT HORIZON TELESCOPE · SAGITTARIUS A* & M87*',
    titleHi: 'सुपरमैसिव ब्लैक होल (Sagittarius A*): समय का धीमा होना और इवेंट होराइजन भौतिकी',
    titleEn: 'Supermassive Black Holes: Sagittarius A*, Photon Rings & Relativistic Spacetime',
    subtitleHi: 'आकाशगंगा के केंद्र में 40 लाख सूर्यों के बराबर द्रव्यमान वाला ब्लैक होल और गुरुत्वाकर्षण लेंसिंग',
    subtitleEn: '4.15 million solar masses warping spacetime at the heart of the Milky Way',
    image: blackHoleImg,
    warpPosition: [-260, 0, -240],
    keyMetrics: [
      { labelHi: 'द्रव्यमान (Sgr A*)', labelEn: 'Mass (Sgr A*)', value: '4.15 Million Suns' },
      { labelHi: 'पृथ्वी से दूरी', labelEn: 'Distance', value: '26,670 Light-Years' },
      { labelHi: 'फोटॉन रिंग वेग', labelEn: 'Accretion Velocity', value: '~99.9% Speed of Light (c)' },
    ],
    summaryHi:
      'Event Horizon Telescope (EHT) और James Webb के नवीनतम शोध ने हमारी आकाशगंगा (Milky Way) के केंद्र में स्थित सुपरमैसिव ब्लैक होल Sagittarius A* और M87* की चुंबकीय संरचना का खुलासा किया है। ब्लैक होल के चारों ओर घूमने वाली "Accretion Disk" में पदार्थ प्रकाश की गति के करीब घूमता है, जिससे आइंस्टीन के सापेक्षता सिद्धांत (General Relativity) के अनुसार वहाँ समय पृथ्वी की तुलना में बहुत धीमा चलता है (Gravitational Time Dilation)।',
    summaryEn:
      'Observations from the Event Horizon Telescope (EHT) and JWST have mapped polarized spiral magnetic fields around Sagittarius A* and M87*. Matter in the relativistic accretion disk orbits near the speed of light, bending background starlight into a luminous photon ring and inducing extreme gravitational time dilation.',
    discoveriesHi: [
      'इवेंट होराइजन के ठीक बाहर शक्तिशाली सर्पिल चुंबकीय क्षेत्र (Spiral Magnetic Fields) पाए गए जो रिलेटिविस्टिक जेट्स को अंतरिक्ष में हजारों प्रकाश-वर्ष दूर फेंकते हैं।',
      'हॉकिंग विकिरण (Hawking Radiation) और क्वांटम सूचना विरोधाभास पर आधुनिक खगोल-भौतिकी शोध।',
      'इस 3D गेम में आप सीधे आउटर सेक्टर के ब्लैक होल (Gargantua / Sgr A*) के पास उड़ान भरकर उसकी फोटॉन रिंग देख सकते हैं!',
    ],
    discoveriesEn: [
      'Polarized light imaging revealed ordered, strong spiral magnetic fields threading the event horizon.',
      'JWST infrared monitoring detected rapid magnetic reconnection flares near Sagittarius A*’s innermost stable circular orbit (ISCO).',
      'Fly directly to the 3D Supermassive Black Hole in the outer sector of this simulator to inspect its relativistic accretion disk!',
    ],
  },
  {
    id: 'jwst-nebulae-first-galaxies',
    category: 'jwst_nebula',
    badge: 'JAMES WEBB SPACE TELESCOPE (JWST)',
    titleHi: 'जेम्स वेब टेलीस्कोप: "पिलर्स ऑफ क्रिएशन" और ब्रह्मांड की सबसे पहली आकाशगंगाएँ',
    titleEn: 'James Webb Space Telescope: Pillars of Creation & Dawn of the Universe',
    subtitleHi: 'बिग बैंग के मात्र 29 करोड़ वर्ष बाद बनी आकाशगंगा JADES-GS-z14-0 और नए तारों का जन्म',
    subtitleEn: 'Infrared views inside star-forming nurseries and galaxies just 290M years after the Big Bang',
    image: jwstNebulaImg,
    keyMetrics: [
      { labelHi: 'सबसे प्राचीन आकाशगंगा', labelEn: 'Farthest Galaxy', value: 'JADES-GS-z14-0 (Redshift z=14.32)' },
      { labelHi: 'अवरक्त दर्पण व्यास', labelEn: 'Gold Mirror Span', value: '6.5 Meters (18 Beryllium-Gold Segments)' },
      { labelHi: 'ऑपरेटिंग तापमान', labelEn: 'Cryo Temperature', value: '-266°C (7 Kelvin via MIRI Cooler)' },
    ],
    summaryHi:
      'NASA/ESA/CSA के James Webb Space Telescope (JWST) ने अपनी इन्फ्रारेड (NIRCam और MIRI) आँखों से अंतरिक्ष के धूल भरे बादलों के आर-पार देखकर खगोल विज्ञान को बदल दिया है। ईगल नेबुला के "Pillars of Creation" और कैरिना नेबुला के "Cosmic Cliffs" में सैकड़ों नए तारों (Protostars) और ग्रह प्रणालियों (Protoplanetary Disks) को जन्म लेते हुए देखा गया है।',
    summaryEn:
      'Equipped with a 6.5-meter gold-coated beryllium mirror, JWST pierces cosmic dust in near- and mid-infrared wavelengths. It has revealed supersonic jets erupting from newborn protostars inside the Pillars of Creation and discovered unexpectedly bright, massive galaxies like JADES-GS-z14-0 existing just 290 million years after the Big Bang.',
    discoveriesHi: [
      'JADES-GS-z14-0 की खोज: बिग बैंग के मात्र 29 करोड़ साल बाद अस्तित्व में आई अब तक की सबसे दूरस्थ और चमकीली आकाशगंगा, जिसमें ऑक्सीजन और धूल की उपस्थिति मिली।',
      'ओरायन नेबुला और पिलर्स ऑफ क्रिएशन में नए तारों के चारों ओर पानी, कार्बनिक अणुओं (CH3+) और जीवन के मूल तत्वों की पहचान।',
      'हबल टेंशन (Hubble Tension): ब्रह्मांड के फैलने की दर (Expansion Rate) की अब तक की सबसे सटीक जांच।',
    ],
    discoveriesEn: [
      'Spectroscopic confirmation of JADES-GS-z14-0 at redshift z=14.32, containing ionized oxygen less than 300M years after the Big Bang.',
      'First detection of methyl cation (CH3+), a cornerstone of interstellar organic chemistry, in a protoplanetary disk in the Orion Nebula.',
      'High-precision Cepheid and Tip of the Red Giant Branch (TRGB) cross-checks on the Hubble Constant.',
    ],
  },
  {
    id: 'exoplanets-trappist-hycean',
    category: 'exoplanets',
    badge: 'EXOPLANETS · TRAPPIST-1 & K2-18b',
    titleHi: 'एक्सोप्लैनेट्स और एलियन महासागर: K2-18b एवं TRAPPIST-1 के रहने योग्य ग्रह',
    titleEn: 'Habitable Exoplanets & Hycean Worlds: K2-18b & the TRAPPIST-1 System',
    subtitleHi: '5,600+ खोजे गए बाह्य-ग्रहों में तरल महासागर, मीथेन और संभावित जैविक संकेतों (Biosignatures) की खोज',
    subtitleEn: 'Transmission spectroscopy of ocean worlds and Earth-sized planets in the habitable zone',
    image: exoplanetImg,
    keyMetrics: [
      { labelHi: 'कुल ज्ञात एक्सोप्लैनेट', labelEn: 'Confirmed Exoplanets', value: '5,600+ Worlds' },
      { labelHi: 'TRAPPIST-1 दूरी', labelEn: 'TRAPPIST-1 Distance', value: '39.46 Light-Years' },
      { labelHi: 'K2-18b श्रेणी', labelEn: 'K2-18b Class', value: 'Hycean World (Hydrogen + Ocean)' },
    ],
    summaryHi:
      'सौर मंडल के बाहर अब तक 5,600 से अधिक एक्सोप्लैनेट्स (Exoplanets) खोजे जा चुके हैं। इनमें सबसे रोमांचक K2-18b (पृथ्वी से 120 प्रकाश-वर्ष दूर) है, जिसके वायुमंडल में JWST ने कार्बन डाइऑक्साइड और मीथेन की प्रचुर मात्रा पकड़ी है—जो यह दर्शाती है कि वहाँ हाइड्रोजन वायुमंडल के नीचे एक विशाल तरल जल महासागर (Hycean Ocean) मौजूद हो सकता है।',
    summaryEn:
      'Over 5,600 exoplanets have been confirmed beyond our Solar System. JWST transmission spectroscopy of sub-Neptune K2-18b detected abundant methane (CH4) and carbon dioxide (CO2) with a scarcity of ammonia—strong evidence for a Hycean world featuring a global liquid water ocean beneath a hydrogen-rich atmosphere.',
    discoveriesHi: [
      'K2-18b के वायुमंडल में मीथेन (CH4) और CO2 की पुष्टि, साथ ही संभावित बायोसिग्नेचर गैस डाइमिथाइल सल्फाइड (DMS) की जांच जारी।',
      'TRAPPIST-1 प्रणाली: एक ही लाल बौने तारे (Ultra-cool Red Dwarf) की परिक्रमा करते पृथ्वी के आकार के 7 चट्टानी ग्रह, जिनमें से 3 (e, f, g) गोल्डीलॉक्स ज़ोन (Habitable Zone) में हैं।',
      'सौर मंडल के भीतर बृहस्पति के चंद्रमा यूरोपा (Europa) और शनि के चंद्रमा एन्सेलेडस (Enceladus) के बर्फीले महासागरों में फॉस्फोरस और जीवन के सभी 6 मूल तत्वों की पुष्टि।',
    ],
    discoveriesEn: [
      'Abundant CH4 and CO2 confirmed in K2-18b’s atmosphere alongside ongoing investigations into dimethyl sulfide (DMS) biosignatures.',
      'Characterization of the 7 Earth-sized rocky planets of TRAPPIST-1, with TRAPPIST-1e in the prime liquid-water habitable zone.',
      'Confirmation of bio-essential phosphorus in the subsurface ocean plumes of Saturn’s moon Enceladus.',
    ],
  },
  {
    id: 'parker-solar-system-frontier',
    category: 'solar_system',
    badge: 'SOLAR SYSTEM · PARKER SOLAR PROBE & EUROPA CLIPPER',
    titleHi: 'सूर्य को छूने वाला मिशन (Parker Solar Probe) और सौर मंडल के महासागरीय चंद्रमा',
    titleEn: 'Touching the Sun: Parker Solar Probe, Solar Wind & Ocean Moons of Jupiter',
    subtitleHi: '6,90,000 किमी/घंटा की रफ़्तार से सूर्य के कोरोना में गोता और बृहस्पति के चंद्रमा यूरोपा का महासागर',
    subtitleEn: 'Humanity’s fastest spacecraft diving through the Alfvén surface at 690,000 km/h',
    image: solarHeroImg,
    targetPlanetId: 'sun',
    keyMetrics: [
      { labelHi: 'अधिकतम रफ़्तार', labelEn: 'Peak Velocity', value: '692,000 km/h (192 km/s)' },
      { labelHi: 'हीट शील्ड सहनशक्ति', labelEn: 'Carbon Shield Rating', value: '1,377°C (Keep-Cool Payload at 30°C)' },
      { labelHi: 'यूरोपा महासागर जल', labelEn: 'Europa Ocean Volume', value: '2× All Earth Oceans Combined' },
    ],
    summaryHi:
      'NASA के Parker Solar Probe ने मानव इतिहास की सबसे तेज़ वस्तु (6,92,000 किमी/घंटा) बनकर सूर्य के चुंबकीय वातावरण (Alfvén Critical Surface) के भीतर प्रवेश किया है। इसने दशकों पुराने रहस्य को सुलझाया कि कैसे चुंबकीय "Switchbacks" (ज़िग-ज़ैग चुंबकीय तरंगें) सौर हवाओं को सुपरसोनिक गति देती हैं और सूर्य के कोरोना को उसकी सतह से 300 गुना अधिक गर्म (20 लाख डिग्री) बनाती हैं।',
    summaryEn:
      'NASA’s Parker Solar Probe became the fastest human-made object in history, diving inside the Sun’s Alfvén critical surface at 692,000 km/h. It discovered magnetic "switchbacks" generated by photospheric granulation funnels that accelerate the solar wind and heat the corona to millions of degrees.',
    discoveriesHi: [
      'सूर्य के कोरोना में चुंबकीय रीकनेक्शन और "Switchbacks" की खोज, जो पृथ्वी पर आने वाले भू-चुंबकीय तूफानों (Auroras) का मूल कारण हैं।',
      'बृहस्पति के चंद्रमा यूरोपा (Europa) के बर्फीले कवच के नीचे पृथ्वी के कुल समुद्रों से दोगुने पानी वाले खारे महासागर का अध्ययन करने के लिए Europa Clipper मिशन।',
      'शनि के सबसे बड़े चंद्रमा टाइटन (Titan) पर मीथेन की नदियों और झीलों में उड़ने वाले परमाणु ड्रोन Dragonfly मिशन की तैयारी।',
    ],
    discoveriesEn: [
      'Identification of magnetic reconnection funnels driving solar wind acceleration inside the corona.',
      'Europa Clipper’s ice-penetrating radar and mass spectrometers targeting Europa’s 100-km-deep global saltwater ocean.',
      'Preparation for Dragonfly rotorcraft exploration across the organic hydrocarbon dunes and liquid methane seas of Saturn’s moon Titan.',
    ],
  },
  {
    id: 'observable-universe-cosmic-web',
    category: 'cosmology',
    badge: 'OBSERVABLE UNIVERSE · 93 BILLION LIGHT-YEARS',
    titleHi: 'संपूर्ण दृश्यमान ब्रह्मांड (Observable Universe): कॉस्मिक वेब, डार्क एनर्जी और 2 लाख करोड़ आकाशगंगाएँ',
    titleEn: 'The Observable Universe: Cosmic Web, Laniakea Supercluster & Dark Energy',
    subtitleHi: '93 अरब प्रकाश-वर्ष में फैला ब्रह्मांड का जाल, Euclid और DESI टेलीस्कोप का 3D ब्रह्मांडीय मानचित्र',
    subtitleEn: '93-billion-light-year horizon mapped by Euclid, DESI, and Planck CMB observations',
    image: milkyWayImg,
    keyMetrics: [
      { labelHi: 'ब्रह्मांड का व्यास', labelEn: 'Observable Diameter', value: '93 Billion Light-Years' },
      { labelHi: 'ब्रह्मांड की आयु', labelEn: 'Age of Universe', value: '13.787 Billion Years' },
      { labelHi: 'संघटन (Composition)', labelEn: 'Cosmic Budget', value: '68.3% Dark Energy · 26.8% Dark Matter · 4.9% Atoms' },
    ],
    summaryHi:
      'हमारा सौर मंडल "Milky Way" आकाशगंगा के ओरायन आर्म में स्थित है, जिसमें 20,000 करोड़ से अधिक तारे हैं। हमारी आकाशगंगा स्वयं "Laniakea Supercluster" का एक छोटा सा बिंदु है, जिसमें 1 लाख आकाशगंगाएँ शामिल हैं। यूरोपीय अंतरिक्ष एजेंसी के Euclid टेलीस्कोप और DESI (Dark Energy Spectroscopic Instrument) ने करोड़ों आकाशगंगाओं का अब तक का सबसे बड़ा 3D नक्शा (Cosmic Web) तैयार किया है।',
    summaryEn:
      'Our Solar System resides in the Orion Arm of the Milky Way, one of over 100,000 galaxies bound within the 520-million-light-year Laniakea Supercluster. ESA’s Euclid space telescope and the DESI survey have constructed the largest 3D map of the Cosmic Web, tracing filaments of dark matter and testing whether Dark Energy evolves over cosmic time.',
    discoveriesHi: [
      'DESI के 3D ब्रह्मांडीय मानचित्र से संकेत मिला है कि ब्रह्मांड को फैलाने वाली "डार्क एनर्जी" (Dark Energy) समय के साथ स्थिर न रहकर धीरे-धीरे बदल सकती है।',
      'कॉस्मिक माइक्रोवेव बैकग्राउंड (CMB): बिग बैंग के 3,80,000 वर्ष बाद की पहली रोशनी जो आज भी पूरे अंतरिक्ष में 2.725 केल्विन (-270.4°C) पर गूंज रही है।',
      'लगभग 4.5 अरब वर्षों बाद हमारी Milky Way और पड़ोसी Andromeda (M31) आकाशगंगा मिलकर एक विशाल दीर्घवृत्ताकार आकाशगंगा ("Milkomeda") बनाएंगी।',
    ],
    discoveriesEn: [
      'DESI Baryon Acoustic Oscillation (BAO) measurements across 11 billion years of cosmic history suggest dark energy density may dynamically evolve.',
      'High-resolution mapping of the Cosmic Web filaments where galaxies form along intersecting strands of dark matter.',
      'Precision trajectory confirmation of the Milky Way–Andromeda galactic merger in ~4.5 billion years.',
    ],
  },
];
