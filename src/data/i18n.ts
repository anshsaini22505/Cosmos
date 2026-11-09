export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  dir?: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hinglish', name: 'Hinglish', nativeName: 'Hinglish (हिंदी-Eng)' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', dir: 'rtl' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'zh', name: 'Chinese', nativeName: '中文 (简体)' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', dir: 'rtl' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
];

export interface UIStrings {
  appSubtitle: string;
  heroTitle: string;
  heroDesc: string;
  startBtn: string;
  autoPlayBtn: string;
  encyclopediaBtn: string;
  hull: string;
  shield: string;
  boost: string;
  torpedo: string;
  crystals: string;
  titanium: string;
  score: string;
  nearestWorld: string;
  autoPilotOn: string;
  autoPilotOff: string;
  inspectBtn: string;
  scanned: string;
  pause: string;
  resume: string;
  restart: string;
  titleScreen: string;
  tabWarp: string;
  tabBuild: string;
  tabHangar: string;
  tabMissions: string;
  tabSettings: string;
  hideControls: string;
  showControls: string;
  touchPad: string;
  camera: string;
  orbitSpeed: string;
  audioActive: string;
  audioMuted: string;
  warpHere: string;
  close: string;
  distanceFromSun: string;
  orbitalPeriod: string;
  dayLength: string;
  temperature: string;
  gravity: string;
  moons: string;
  planetNames: Record<string, string>;
}

const BASE_EN: UIStrings = {
  appSubtitle: '3D Solar System & Space Exploration',
  heroTitle: 'Explore the Solar System & Deep Space',
  heroDesc:
    'Fly across all 10 worlds from the blazing Sun to Pluto and Halley’s Comet. Let the AI Auto-Pilot fly, fight, and explore automatically, or take manual command anytime.',
  startBtn: 'Start Space Flight',
  autoPlayBtn: 'Auto-Play Solar Tour',
  encyclopediaBtn: 'Solar Encyclopedia',
  hull: 'Hull',
  shield: 'Shield',
  boost: 'Boost',
  torpedo: 'Missile',
  crystals: 'Crystals',
  titanium: 'Titanium',
  score: 'Score',
  nearestWorld: 'Nearest World',
  autoPilotOn: 'Auto-Play: ON',
  autoPilotOff: 'Auto-Play: OFF',
  inspectBtn: 'Info',
  scanned: 'Scanned',
  pause: 'Pause',
  resume: 'Resume Flight',
  restart: 'Restart Mission',
  titleScreen: 'Title Screen',
  tabWarp: 'Solar System Warp',
  tabBuild: 'Build Space Base',
  tabHangar: 'Ship Upgrades',
  tabMissions: 'Missions',
  tabSettings: 'Camera & Controls',
  hideControls: 'Hide Dock',
  showControls: 'Show Dock',
  touchPad: 'Touch Controls',
  camera: 'Camera',
  orbitSpeed: 'Orbit Speed',
  audioActive: 'Sound: ON',
  audioMuted: 'Sound: OFF',
  warpHere: 'Fly Here Now',
  close: 'Close',
  distanceFromSun: 'Distance from Sun',
  orbitalPeriod: 'Orbital Period (Year)',
  dayLength: 'Rotation (Day)',
  temperature: 'Temperature',
  gravity: 'Gravity',
  moons: 'Moons',
  planetNames: {
    sun: 'The Sun',
    mercury: 'Mercury',
    venus: 'Venus',
    earth: 'Earth',
    mars: 'Mars',
    jupiter: 'Jupiter',
    saturn: 'Saturn',
    uranus: 'Uranus',
    neptune: 'Neptune',
    pluto: 'Pluto',
  },
};

const TRANSLATIONS: Record<string, Partial<UIStrings>> = {
  hi: {
    appSubtitle: '3D सौर मंडल और अंतरिक्ष यात्रा',
    heroTitle: 'पूरे सौर मंडल और अंतरिक्ष की सैर करें',
    heroDesc:
      'सूर्य से लेकर पृथ्वी, शनि और प्लूटो तक पूरे अंतरिक्ष में उड़ान भरें। ऑटो-पायलट (Auto-Play) चालू करें जिससे यान अपने आप खुद चलेगा, लड़ेगा और ग्रहों की सैर कराएगा, या खुद कंट्रोल करें।',
    startBtn: 'अंतरिक्ष यात्रा शुरू करें',
    autoPlayBtn: 'ऑटो-प्ले सौर यात्रा (खुद चलेगा)',
    encyclopediaBtn: 'सौर मंडल ज्ञानकोश',
    hull: 'कवच',
    shield: 'सुरक्षा चक्र',
    boost: 'बूस्ट',
    torpedo: 'मिसाइल',
    crystals: 'क्रिस्टल',
    titanium: 'टाइटेनियम',
    score: 'स्कोर',
    nearestWorld: 'निकटतम ग्रह',
    autoPilotOn: 'ऑटो-प्ले: चालू',
    autoPilotOff: 'ऑटो-प्ले: बंद',
    inspectBtn: 'जानकारी',
    scanned: 'स्कैन किए',
    pause: 'रोकें',
    resume: 'आगे खेलें',
    restart: 'फिर से शुरू करें',
    titleScreen: 'मुख्य स्क्रीन',
    tabWarp: 'ग्रह यात्रा (Warp)',
    tabBuild: 'स्पेस स्टेशन बनाएँ',
    tabHangar: 'यान अपग्रेड',
    tabMissions: 'मिशन',
    tabSettings: 'कैमरा और सेटिंग',
    hideControls: 'कंट्रोल छुपाएँ',
    showControls: 'कंट्रोल दिखाएँ',
    touchPad: 'टच कंट्रोल',
    camera: 'कैमरा',
    orbitSpeed: 'ग्रह गति',
    audioActive: 'आवाज़: चालू',
    audioMuted: 'आवाज़: बंद',
    warpHere: 'यहाँ उड़ान भरें',
    close: 'बंद करें',
    distanceFromSun: 'सूर्य से दूरी',
    orbitalPeriod: 'परिक्रमा समय (वर्ष)',
    dayLength: 'घूर्णन (दिन)',
    temperature: 'तापमान',
    gravity: 'गुरुत्वाकर्षण',
    moons: 'चंद्रमा',
    planetNames: {
      sun: 'सूर्य',
      mercury: 'बुध',
      venus: 'शुक्र',
      earth: 'पृथ्वी',
      mars: 'मंगल',
      jupiter: 'बृहस्पति',
      saturn: 'शनि',
      uranus: 'अरुण',
      neptune: 'वरुण',
      pluto: 'प्लूटो (यम)',
    },
  },
  hinglish: {
    appSubtitle: '3D Solar System & Space Exploration Game',
    heroTitle: 'Poore Solar System Aur Space Ki Sair Karein',
    heroDesc:
      'Sun se lekar Earth, Saturn aur Pluto tak poore Space mein udan bharein. Auto-Play mode mein spaceship apne aap khud chalega, fight karega aur planets dikhayega!',
    startBtn: 'Game Shuru Karein',
    autoPlayBtn: 'Auto-Play Mode (Apne Aap Chalega)',
    encyclopediaBtn: 'Space Encyclopedia',
    nearestWorld: 'Paas Wala Planet',
    autoPilotOn: 'Auto-Play: ON (Khud Chal Raha Hai)',
    autoPilotOff: 'Auto-Play: OFF',
    inspectBtn: 'Dekhein',
    tabWarp: 'Planets Par Jayein',
    tabBuild: 'Space Base Banayein',
    tabHangar: 'Ship Upgrade',
    tabMissions: 'Missions',
    tabSettings: 'Camera & Controls',
  },
  bn: {
    appSubtitle: '৩ডি সৌরজগৎ এবং মহাকাশ অভিযান',
    heroTitle: 'সৌরজগৎ ও মহাকাশ অন্বেষণ করুন',
    heroDesc:
      'সূর্য থেকে প্লুটো পর্যন্ত সমস্ত গ্রহে উড়ে যান। অটো-প্লে মোডে মহাকাশযান নিজে থেকেই চলবে অথবা আপনি নিজেও চালাতে পারবেন।',
    startBtn: 'মহাকাশ যাত্রা শুরু করুন',
    autoPlayBtn: 'অটো-প্লে সৌর ভ্রমণ',
    encyclopediaBtn: 'সৌর বিশ্বকোষ',
    hull: 'হাল',
    shield: 'বর্ম',
    boost: 'বুস্ট',
    torpedo: 'ক্ষেপণাস্ত্র',
    crystals: 'ক্রিস্টাল',
    titanium: 'টাইটানিয়াম',
    score: 'স্কোর',
    nearestWorld: 'নিকটতম গ্রহ',
    autoPilotOn: 'অটো-প্লে: চালু',
    autoPilotOff: 'অটো-প্লে: বন্ধ',
    inspectBtn: 'তথ্য',
    planetNames: {
      sun: 'সূর্য',
      mercury: 'বুধ',
      venus: 'শুক্র',
      earth: 'পৃথিবী',
      mars: 'মঙ্গল',
      jupiter: 'বৃহস্পতি',
      saturn: 'শনি',
      uranus: 'ইউরেনাস',
      neptune: 'নেপচুন',
      pluto: 'প্লুটো',
    },
  },
  te: {
    appSubtitle: '3D సౌర కుటుంబం & అంతరిక్ష యాత్ర',
    heroTitle: 'సౌర కుటుంబం మరియు అంతరిక్షాన్ని అన్వేషించండి',
    heroDesc:
      'సూర్యుడి నుండి ప్లూటో వరకు అన్ని గ్రహాలను చుట్టిరండి. ఆటో-ప్లే మోడ్‌లో స్పేస్‌షిప్ దానంతట అదే నడుస్తుంది.',
    startBtn: 'ప్రయాణం ప్రారంభించండి',
    autoPlayBtn: 'ఆటో-ప్లే టూర్',
    encyclopediaBtn: 'సౌర విజ్ఞాన సర్వస్వం',
    nearestWorld: 'సమీప గ్రహం',
    autoPilotOn: 'ఆటో-ప్లే: ఆన్',
    autoPilotOff: 'ఆటో-ప్లే: ఆఫ్',
    planetNames: {
      sun: 'సూర్యుడు',
      mercury: 'బుధుడు',
      venus: 'శుక్రుడు',
      earth: 'భూమి',
      mars: 'అంగారకుడు',
      jupiter: 'బృహస్పతి',
      saturn: 'శని',
      uranus: 'యురేనస్',
      neptune: 'నెప్ట్యూన్',
      pluto: 'ప్లూటో',
    },
  },
  mr: {
    appSubtitle: '3D सूर्यमाला आणि अंतराळ सफर',
    heroTitle: 'संपूर्ण सूर्यमाला आणि अंतराळाची सफर करा',
    heroDesc:
      'सूर्यापासून प्लूटोपर्यंत सर्व ग्रहांवर उड्डाण करा. ऑटो-प्ले मोडमध्ये यान स्वतःहून प्रवास करेल आणि लढेल.',
    startBtn: 'अंतराळ प्रवास सुरू करा',
    autoPlayBtn: 'ऑटो-प्ले सूर्यमाला सफर',
    encyclopediaBtn: 'सूर्यमाला ज्ञानकोश',
    nearestWorld: 'जवळचा ग्रह',
    autoPilotOn: 'ऑटो-प्ले: चालू',
    autoPilotOff: 'ऑटो-प्ले: बंद',
    planetNames: {
      sun: 'सूर्य',
      mercury: 'बुध',
      venus: 'शुक्र',
      earth: 'पृथ्वी',
      mars: 'मंगळ',
      jupiter: 'गुरू',
      saturn: 'शनि',
      uranus: 'युरेनस',
      neptune: 'नेपच्यून',
      pluto: 'प्लूटो',
    },
  },
  ta: {
    appSubtitle: '3D சூரிய குடும்பம் & விண்வெளி பயணம்',
    heroTitle: 'சூரிய குடும்பம் மற்றும் விண்வெளியை ஆராயுங்கள்',
    heroDesc:
      'சூரியன் முதல் புளூட்டோ வரை அனைத்து கோள்களுக்கும் செல்லுங்கள். ஆட்டோ-பிளே மூலம் விண்கலம் தானாகவே இயங்கும்.',
    startBtn: 'பயணத்தைத் தொடங்கு',
    autoPlayBtn: 'தானியங்கி பயணம் (Auto-Play)',
    encyclopediaBtn: 'விண்வெளி களஞ்சியம்',
    nearestWorld: 'அருகிலுள்ள கோள்',
    autoPilotOn: 'ஆட்டோ-பிளே: ஆன்',
    autoPilotOff: 'ஆட்டோ-பிளே: ஆஃப்',
    planetNames: {
      sun: 'சூரியன்',
      mercury: 'புதன்',
      venus: 'வெள்ளி',
      earth: 'பூமி',
      mars: 'செவ்வாய்',
      jupiter: 'வியாழன்',
      saturn: 'சனி',
      uranus: 'யுரேனஸ்',
      neptune: 'நெப்டியூன்',
      pluto: 'புளூட்டோ',
    },
  },
  ur: {
    appSubtitle: '3D نظام شمسی اور خلائی سفر',
    heroTitle: 'نظام شمسی اور گہرے خلا کی سیر کریں',
    heroDesc:
      'سورج سے لے کر پلوٹو تک تمام سیاروں کا سفر کریں۔ آٹو پلے موڈ میں خلائی جہاز خودکار طور پر چلے گا۔',
    startBtn: 'خلائی سفر شروع کریں',
    autoPlayBtn: 'آٹو پلے ٹور',
    encyclopediaBtn: 'فلکیاتی انسائیکلوپیڈیا',
    nearestWorld: 'قریبی سیارہ',
    autoPilotOn: 'آٹو پلے: فعال',
    autoPilotOff: 'آٹو پلے: بند',
    planetNames: {
      sun: 'سورج',
      mercury: 'عطارد',
      venus: 'زہرہ',
      earth: 'زمین',
      mars: 'مریخ',
      jupiter: 'مشتری',
      saturn: 'زحل',
      uranus: 'یورینس',
      neptune: 'نیپچون',
      pluto: 'پلوٹو',
    },
  },
  gu: {
    appSubtitle: '3D સૌરમંડળ અને અવકાશ યાત્રા',
    heroTitle: 'સમગ્ર સૌરમંડળ અને અવકાશની મુસાફરી કરો',
    heroDesc:
      'સૂર્યથી પ્લુટો સુધીના તમામ ગ્રહોની મુલાકાત લો. ઓટો-પ્લે મોડમાં અવકાશયાન આપમેળે ચાલશે.',
    startBtn: 'યાત્રા શરૂ કરો',
    autoPlayBtn: 'ઓટો-પ્લે ટૂર',
    encyclopediaBtn: 'સૌર જ્ઞાનકોશ',
    nearestWorld: 'નજીકનો ગ્રહ',
    autoPilotOn: 'ઓટો-પ્લે: ચાલુ',
    autoPilotOff: 'ઓટો-પ્લે: બંધ',
    planetNames: {
      sun: 'સૂર્ય',
      mercury: 'બુધ',
      venus: 'શુક્ર',
      earth: 'પૃથ્વી',
      mars: 'મંગળ',
      jupiter: 'ગુરુ',
      saturn: 'શનિ',
      uranus: 'યુરેનસ',
      neptune: 'નેપ્ચ્યુન',
      pluto: 'પ્લુટો',
    },
  },
  kn: {
    appSubtitle: '3D ಸೌರವ್ಯೂಹ ಮತ್ತು ಬಾಹ್ಯಾಕಾಶ ಯಾನ',
    heroTitle: 'ಸೌರವ್ಯೂಹ ಮತ್ತು ಬಾಹ್ಯಾಕಾಶವನ್ನು ಅನ್ವೇಷಿಸಿ',
    heroDesc:
      'ಸೂರ್ಯನಿಂದ ಪ್ಲೂಟೋವರೆಗೆ ಎಲ್ಲಾ ಗ್ರಹಗಳಿಗೆ ಹಾರಿರಿ. ಆಟೋ-ಪ್ಲೇ ಮೋಡ್‌ನಲ್ಲಿ ನೌಕೆ ತಾನಾಗಿಯೇ ಚಲಿಸುತ್ತದೆ.',
    startBtn: 'ಹಾರಾಟ ಪ್ರಾರಂಭಿಸಿ',
    autoPlayBtn: 'ಆಟೋ-ಪ್ಲೇ ಪ್ರವಾಸ',
    encyclopediaBtn: 'ಸೌರ ವಿಶ್ವಕೋಶ',
    nearestWorld: 'ಹತ್ತಿರದ ಗ್ರಹ',
    autoPilotOn: 'ಆಟೋ-ಪ್ಲೇ: ಆನ್',
    autoPilotOff: 'ಆಟೋ-ಪ್ಲೇ: ಆಫ್',
  },
  ml: {
    appSubtitle: '3D സൗരയൂഥവും ബഹിരാകാശ യാത്രയും',
    heroTitle: 'സൗരയൂഥവും ബഹിരാകാശവും പര്യവേക്ഷണം ചെയ്യുക',
    heroDesc:
      'സൂര്യൻ മുതൽ പ്ലൂട്ടോ വരെയുള്ള എല്ലാ ഗ്രഹങ്ങളിലേക്കും പറക്കുക. ഓട്ടോ-പ്ലേ മോഡിൽ പേടകം സ്വയം സഞ്ചരിക്കും.',
    startBtn: 'യാത്ര തുടങ്ങുക',
    autoPlayBtn: 'ഓട്ടോ-പ്ലേ ടൂർ',
    encyclopediaBtn: 'സൗര വിജ്ഞാനകോശം',
    nearestWorld: 'അടുത്തുള്ള ഗ്രഹം',
    autoPilotOn: 'ഓട്ടോ-പ്ലേ: ഓൺ',
    autoPilotOff: 'ഓട്ടോ-പ്ലേ: ഓഫ്',
  },
  or: {
    appSubtitle: '3D ସୌରজଗତ ଏବଂ ମହାକାଶ ଯାତ୍ରା',
    heroTitle: 'ସୌରଜଗତ ଏବଂ ମହାକାଶ ভ୍ରମଣ କରନ୍ତୁ',
    startBtn: 'ଯାତ୍ରା ଆରମ୍ଭ କରନ୍ତୁ',
    autoPlayBtn: 'ଅଟୋ-ପ୍ଲେ ଯାତ୍ରା',
    encyclopediaBtn: 'ସୌର ଜ୍ଞାନକୋଷ',
  },
  pa: {
    appSubtitle: '3D ਸੌਰ ਮੰਡਲ ਅਤੇ ਪੁਲਾੜ ਯਾਤਰਾ',
    heroTitle: 'ਪੂਰੇ ਸੌਰ ਮੰਡਲ ਅਤੇ ਪੁਲਾੜ ਦੀ ਸੈਰ ਕਰੋ',
    heroDesc:
      'ਸੂਰਜ ਤੋਂ ਪਲੂਟੋ ਤੱਕ ਸਾਰੇ ਗ੍ਰਹਿਆਂ ਦੀ ਯਾਤਰਾ ਕਰੋ। ਆਟੋ-ਪਲੇ ਮੋਡ ਵਿੱਚ ਪੁਲਾੜ ਯਾਨ ਆਪਣੇ ਆਪ ਚੱਲੇਗਾ।',
    startBtn: 'ਉਡਾਣ ਸ਼ੁਰੂ ਕਰੋ',
    autoPlayBtn: 'ਆਟੋ-ਪਲੇ ਟੂਰ',
    encyclopediaBtn: 'ਸੌਰ ਗਿਆਨਕੋਸ਼',
    nearestWorld: 'ਨੇੜਲਾ ਗ੍ਰਹਿ',
    autoPilotOn: 'ਆਟੋ-ਪਲੇ: ਚਾਲੂ',
    autoPilotOff: 'ਆਟੋ-ਪਲੇ: ਬੰਦ',
  },
  as: {
    appSubtitle: '3D সৌৰজগত আৰু মহাকাশ যাত্ৰা',
    heroTitle: 'সৌৰজগত আৰু মহাকাশ অন্বেষণ কৰক',
    startBtn: 'যাত্ৰা আৰম্ভ কৰক',
    autoPlayBtn: 'অটো-প্লে ভ্ৰমণ',
    encyclopediaBtn: 'সৌৰ জ্ঞানকোষ',
  },
  sa: {
    appSubtitle: 'त्रि-आयामी सौरमण्डलम् अन्तरिक्षयात्रा च',
    heroTitle: 'संपूर्णं सौरमण्डलम् अन्तरिक्षं च अन्विष्यताम्',
    startBtn: 'यात्राम् आरभत',
    autoPlayBtn: 'स्वचालित-सौरयात्रा',
    encyclopediaBtn: 'सौर-ज्ञानकोशः',
  },
  ne: {
    appSubtitle: '3D सौर्यमण्डल र अन्तरिक्ष यात्रा',
    heroTitle: 'सौर्यमण्डल र अन्तरिक्षको अन्वेषण गर्नुहोस्',
    startBtn: 'उडान सुरु गर्नुहोस्',
    autoPlayBtn: 'अटो-प्ले भ्रमण',
    encyclopediaBtn: 'सौर्य ज्ञानकोश',
  },
  si: {
    appSubtitle: '3D සෞරග්‍රහ මණ්ඩලය සහ අභ්‍යවකාශ චාරිකාව',
    heroTitle: 'සෞරග්‍රහ මණ්ඩලය ගවේෂණය කරන්න',
    startBtn: 'ගමන අරඹන්න',
    autoPlayBtn: 'ස්වයංක්‍රීය චාරිකාව',
    encyclopediaBtn: 'විශ්වකෝෂය',
  },
  es: {
    appSubtitle: 'Sistema Solar 3D y Exploración Espacial',
    heroTitle: 'Explora Todo el Sistema Solar y el Espacio',
    heroDesc:
      'Vuela desde el Sol hasta Plutón y el Cometa Halley. Activa el Piloto Automático para que la nave vuele, combata y explore sola, o toma el control.',
    startBtn: 'Iniciar Vuelo Espacial',
    autoPlayBtn: 'Modo Auto-Juego (Piloto Automático)',
    encyclopediaBtn: 'Enciclopedia Solar',
    nearestWorld: 'Planeta Más Cercano',
    autoPilotOn: 'Auto-Juego: ACTIVO',
    autoPilotOff: 'Auto-Juego: APAGADO',
    tabWarp: 'Viaje Planetario',
    tabBuild: 'Construir Base',
    tabHangar: 'Mejorar Nave',
    tabMissions: 'Misiones',
    tabSettings: 'Cámara y Controles',
    planetNames: {
      sun: 'El Sol',
      mercury: 'Mercurio',
      venus: 'Venus',
      earth: 'Tierra',
      mars: 'Marte',
      jupiter: 'Júpiter',
      saturn: 'Saturno',
      uranus: 'Urano',
      neptune: 'Neptuno',
      pluto: 'Plutón',
    },
  },
  fr: {
    appSubtitle: 'Système Solaire 3D et Exploration Spatiale',
    heroTitle: 'Explorez le Système Solaire et l’Espace Profond',
    heroDesc:
      'Volez du Soleil jusqu’à Pluton. Activez le Mode Auto pour que le vaisseau navigue, combatte et explore automatiquement.',
    startBtn: 'Lancer la Mission',
    autoPlayBtn: 'Visite Automatique',
    encyclopediaBtn: 'Encyclopédie Solaire',
    nearestWorld: 'Monde le Plus Proche',
    autoPilotOn: 'Pilote Auto : OUI',
    autoPilotOff: 'Pilote Auto : NON',
    planetNames: {
      sun: 'Le Soleil',
      mercury: 'Mercure',
      venus: 'Vénus',
      earth: 'Terre',
      mars: 'Mars',
      jupiter: 'Jupiter',
      saturn: 'Saturne',
      uranus: 'Uranus',
      neptune: 'Neptune',
      pluto: 'Pluton',
    },
  },
  de: {
    appSubtitle: '3D-Sonnensystem & Weltraumerkundung',
    heroTitle: 'Erkunde das gesamte Sonnensystem',
    heroDesc:
      'Fliege von der Sonne bis nach Pluto. Im Auto-Play-Modus steuert, kämpft und erkundet das Raumschiff völlig selbstständig.',
    startBtn: 'Weltraumflug Starten',
    autoPlayBtn: 'Auto-Play-Tour',
    encyclopediaBtn: 'Sonnensystem-Lexikon',
    nearestWorld: 'Nächster Planet',
    autoPilotOn: 'Auto-Play: EIN',
    autoPilotOff: 'Auto-Play: AUS',
    planetNames: {
      sun: 'Sonne',
      mercury: 'Merkur',
      venus: 'Venus',
      earth: 'Erde',
      mars: 'Mars',
      jupiter: 'Jupiter',
      saturn: 'Saturn',
      uranus: 'Uranus',
      neptune: 'Neptun',
      pluto: 'Pluto',
    },
  },
  ru: {
    appSubtitle: '3D Солнечная система и Космос',
    heroTitle: 'Исследуйте Солнечную систему и глубокий космос',
    heroDesc:
      'Летайте от Солнца до Плутона. Включите Автопилот, чтобы корабль летал, сражался и исследовал планеты самостоятельно.',
    startBtn: 'Начать полет',
    autoPlayBtn: 'Авто-игра (Тур по планетам)',
    encyclopediaBtn: 'Энциклопедия',
    nearestWorld: 'Ближайший мир',
    autoPilotOn: 'Автопилот: ВКЛ',
    autoPilotOff: 'Автопилот: ВЫКЛ',
    planetNames: {
      sun: 'Солнце',
      mercury: 'Меркурий',
      venus: 'Венера',
      earth: 'Земля',
      mars: 'Марс',
      jupiter: 'Юпитер',
      saturn: 'Сатурн',
      uranus: 'Уран',
      neptune: 'Нептун',
      pluto: 'Плутон',
    },
  },
  ja: {
    appSubtitle: '3D 太陽系＆宇宙探査ゲーム',
    heroTitle: '太陽系と深宇宙を自由に探検しよう',
    heroDesc:
      '太陽から冥王星まで全10天体を飛行。オートプレイモードでは宇宙船が自動で航行・戦闘・探査を行います。',
    startBtn: 'フライト開始',
    autoPlayBtn: 'オートプレイ太陽系ツアー',
    encyclopediaBtn: '太陽系図鑑',
    nearestWorld: '最寄りの天体',
    autoPilotOn: '自動操縦: ON',
    autoPilotOff: '自動操縦: OFF',
    planetNames: {
      sun: '太陽',
      mercury: '水星',
      venus: '金星',
      earth: '地球',
      mars: '火星',
      jupiter: '木星',
      saturn: '土星',
      uranus: '天王星',
      neptune: '海王星',
      pluto: '冥王星',
    },
  },
  ko: {
    appSubtitle: '3D 태양계 및 우주 탐험',
    heroTitle: '태양계와 깊은 우주를 탐험하세요',
    heroDesc:
      '태양부터 명왕성까지 비행하세요. 자동 플레이 모드를 켜면 우주선이 스스로 비행하고 전투하며 행성을 탐사합니다.',
    startBtn: '우주 비행 시작',
    autoPlayBtn: '자동 플레이 투어',
    encyclopediaBtn: '태양계 백과사전',
    nearestWorld: '가장 가까운 행성',
    autoPilotOn: '자동 비행: 켜짐',
    autoPilotOff: '자동 비행: 꺼짐',
    planetNames: {
      sun: '태양',
      mercury: '수성',
      venus: '금성',
      earth: '지구',
      mars: '화성',
      jupiter: '목星',
      saturn: '토성',
      uranus: '천왕성',
      neptune: '해왕성',
      pluto: '명왕성',
    },
  },
  zh: {
    appSubtitle: '3D 太阳系与深空探索',
    heroTitle: '探索整个太阳系与浩瀚宇宙',
    heroDesc:
      '从太阳一路飞往冥王星与哈雷彗星。开启自动巡航模式，飞船将自动飞行、战斗并探索所有行星。',
    startBtn: '开始太空飞行',
    autoPlayBtn: '自动巡航模式',
    encyclopediaBtn: '太阳系百科',
    nearestWorld: '最近星球',
    autoPilotOn: '自动巡航：开启',
    autoPilotOff: '自动巡航：关闭',
    planetNames: {
      sun: '太阳',
      mercury: '水星',
      venus: '金星',
      earth: '地球',
      mars: '火星',
      jupiter: '木星',
      saturn: '土星',
      uranus: '天王星',
      neptune: '海王星',
      pluto: '冥王星',
    },
  },
  ar: {
    appSubtitle: 'النظام الشمسي ثلاثي الأبعاد واستكشاف الفضاء',
    heroTitle: 'استكشف النظام الشمسي والفضاء العميق',
    heroDesc:
      'حلّق من الشمس إلى بلوتو. قم بتشغيل الوضع التلقائي لتطير المركبة وتستكشف الكواكب تلقائياً.',
    startBtn: 'ابدأ رحلة الفضاء',
    autoPlayBtn: 'جولة تلقائية',
    encyclopediaBtn: 'موسوعة الفضاء',
    nearestWorld: 'أقرب كوكب',
    autoPilotOn: 'طيران تلقائي: مفعل',
    autoPilotOff: 'طيران تلقائي: متوقف',
    planetNames: {
      sun: 'الشمس',
      mercury: 'عطارد',
      venus: 'الزهرة',
      earth: 'الأرض',
      mars: 'المريخ',
      jupiter: 'المشتري',
      saturn: 'زحل',
      uranus: 'أورانوس',
      neptune: 'نبتون',
      pluto: 'بلوتو',
    },
  },
  pt: {
    appSubtitle: 'Sistema Solar 3D e Exploração Espacial',
    heroTitle: 'Explore Todo o Sistema Solar e o Espaço',
    startBtn: 'Iniciar Voo',
    autoPlayBtn: 'Tour Automático',
    encyclopediaBtn: 'Enciclopédia Solar',
  },
  it: {
    appSubtitle: 'Sistema Solare 3D ed Esplorazione Spaziale',
    heroTitle: 'Esplora il Sistema Solare e lo Spazio Profondo',
    startBtn: 'Inizia Volo',
    autoPlayBtn: 'Guida Automatica',
    encyclopediaBtn: 'Enciclopedia Solare',
  },
  tr: {
    appSubtitle: '3D Güneş Sistemi ve Uzay Keşfi',
    heroTitle: 'Güneş Sistemini ve Derin Uzayı Keşfedin',
    startBtn: 'Uçuşu Başlat',
    autoPlayBtn: 'Otomatik Sürüş Turu',
    encyclopediaBtn: 'Uzay Ansiklopedisi',
  },
  vi: {
    appSubtitle: 'Hệ Mặt Trời 3D & Khám Phá Không Gian',
    heroTitle: 'Khám Phá Toàn Bộ Hệ Mặt Trời',
    startBtn: 'Bắt Đầu Bay',
    autoPlayBtn: 'Tự Động Bay (Auto-Play)',
    encyclopediaBtn: 'Bách Khoa Toàn Thư',
  },
  th: {
    appSubtitle: 'ระบบสุริยะ 3 มิติ และการสำรวจอวกาศ',
    heroTitle: 'สำรวจระบบสุริยะและอวกาศอันกว้างใหญ่',
    startBtn: 'เริ่มการบินอวกาศ',
    autoPlayBtn: 'โหมดบินอัตโนมัติ',
    encyclopediaBtn: 'สารานุกรมระบบสุริยะ',
  },
  id: {
    appSubtitle: 'Tata Surya 3D & Eksplorasi Luar Angkasa',
    heroTitle: 'Jelajahi Seluruh Tata Surya & Luar Angkasa',
    startBtn: 'Mulai Terbang',
    autoPlayBtn: 'Mode Jalan Otomatis',
    encyclopediaBtn: 'Ensiklopedia Surya',
  },
  nl: {
    appSubtitle: '3D Zonnestelsel & Ruimteverkenning',
    heroTitle: 'Verken het Zonnestelsel en de Ruimte',
    startBtn: 'Start Vlucht',
    autoPlayBtn: 'Automatische Tour',
    encyclopediaBtn: 'Zonnestelsel Gids',
  },
  pl: {
    appSubtitle: 'Układ Słoneczny 3D i Eksploracja Kosmosu',
    heroTitle: 'Odkryj Cały Układ Słoneczny',
    startBtn: 'Rozpocznij Lot',
    autoPlayBtn: 'Tryb Automatyczny',
    encyclopediaBtn: 'Encyklopedia Kosmosu',
  },
  fa: {
    appSubtitle: 'منظومه شمسی سه‌بعدی و کاوش فضا',
    heroTitle: 'منظومه شمسی و اعماق فضا را کاوش کنید',
    startBtn: 'شروع پرواز فضایی',
    autoPlayBtn: 'پرواز خودکار',
    encyclopediaBtn: 'دانشنامه خورشیدی',
  },
  sw: {
    appSubtitle: 'Mfumo wa Jua wa 3D na Safari ya Angani',
    heroTitle: 'Gundua Mfumo wa Jua na Anga za Mbali',
    startBtn: 'Anza Safari',
    autoPlayBtn: 'Safari ya Moja kwa Moja',
    encyclopediaBtn: 'Kamusi ya Anga',
  },
  uk: {
    appSubtitle: '3D Сонячна система та Космос',
    heroTitle: 'Досліджуйте Сонячну систему та Космос',
    startBtn: 'Почати політ',
    autoPlayBtn: 'Автопілот-тур',
    encyclopediaBtn: 'Енциклопедія',
  },
};

export function detectInitialLanguage(): string {
  try {
    const saved = localStorage.getItem('astral_odyssey_lang');
    if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
      return saved;
    }
    if (typeof navigator !== 'undefined') {
      const langs = navigator.languages || [navigator.language];
      for (const raw of langs) {
        if (!raw) continue;
        const short = raw.toLowerCase().split('-')[0];
        if (SUPPORTED_LANGUAGES.some((l) => l.code === short)) {
          return short;
        }
      }
    }
  } catch {
    // Ignore
  }
  return 'hi'; // Default to Hindi as requested by user context, with 1-click switch to any of 36 languages
}

export function getUIStrings(langCode: string): UIStrings {
  const override = TRANSLATIONS[langCode] || {};
  return {
    ...BASE_EN,
    ...override,
    planetNames: {
      ...BASE_EN.planetNames,
      ...(override.planetNames || {}),
    },
  };
}
