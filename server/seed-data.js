// E-Setu One-Time Database Seed Data
// This is the server-side source of truth used to populate the SQLite database
// the FIRST time it is created. After that, the database (not this file) is authoritative.
//
// No fake people/companies are seeded (kabadiwalas, recyclers, lots, sales history all
// start genuinely empty) — only real reference data (material categories, market rates,
// safety guidance) is pre-loaded, since that represents domain knowledge, not fake entities.
// Real dealers and recyclers only appear here once they register themselves through the app.

const SEED_DATA = {
  validCpcbRegistrations: [],
  predefinedRecyclers: [],
  predefinedKabadiwalas: [],

  materials: [
    {
      id: 'mat-pcb-high', symbol: 'PCB-HI', name: 'High-Grade PCBs (Server / Smartphone / RAM)',
      nameMr: 'उच्च दर्जाचे पीसीबी (सर्व्हर / स्मार्टफोन / रॅम)',
      nameHi: 'उच्च गुणवत्ता पीसीबी (सर्वर / स्मार्टफोन / रैम)',
      nameTa: 'உயர்தர பிசிபி பலகைகள் (சர்வர் / ஸ்மார்ட்போன் / ரேம்)',
      nameTe: 'హై-గ్రేడ్ పిసిబి బోర్డులు (సర్వర్ / స్మార్ట్‌ఫోన్ / ర్యామ్)',
      nameKn: 'ಉನ್ನತ ದರ್ಜೆಯ ಪಿಸಿಬಿ ಬೋರ್ಡ್‌ಗಳು (ಸರ್ವರ್ / ಸ್ಮಾರ್ಟ್‌ಫೋನ್)',
      nameMl: 'ഹൈ-ഗ്രേഡ് പിസിബി ബോർഡുകൾ (സെർവർ / സ്മാർട്ട്ഫോൺ)',
      icon: '💻', customerRate: 950, recyclerRate: 1280, rate6hrAgo: 1220, recyclerRate6hrAgo: 1220, unit: 'kg',
      changePct: '+4.9%', isPositive: true, dayHigh: 1310, dayLow: 1210, volume: '1,420 kg',
      sparkline: [1210, 1225, 1220, 1240, 1255, 1250, 1270, 1265, 1275, 1280],
      description: 'Telecom boards, gold-plated server motherboards, multi-layer circuit boards.',
      metals: 'Gold (0.25g/kg), Silver (1.2g/kg), Copper (18%), Palladium',
      hazardLevel: 'Medium',
      properProcess: 'Hydrometallurgical chemical extraction in closed loop (Never acid leach at home!)'
    },
    {
      id: 'mat-copper-wire', symbol: 'CU-WIRE', name: 'Copper Cables & Insulated Wiring',
      nameMr: 'तांब्याची वायर आणि केबल्स', nameHi: 'तांबे की तार और केबल',
      nameTa: 'தாமிர கம்பிகள் மற்றும் கேபிள்கள்', nameTe: 'రాగి వైర్లు మరియు కేబుల్స్',
      nameKn: 'ತಾಮ್ರದ ತಂತಿಗಳು ಮತ್ತು ಕೇಬಲ್‌ಗಳು', nameMl: 'ചെമ്പ് വയറുകളും കേബിളുകളും',
      icon: '🔌', customerRate: 360, recyclerRate: 485, rate6hrAgo: 460, recyclerRate6hrAgo: 460, unit: 'kg',
      changePct: '+5.4%', isPositive: true, dayHigh: 495, dayLow: 450, volume: '4,800 kg',
      sparkline: [450, 455, 462, 460, 470, 468, 475, 480, 482, 485],
      description: 'Power cables, network cables, appliance wiring with PVC sheath.',
      metals: 'Copper (45-65% by weight), PVC/PE plastic',
      hazardLevel: 'High',
      properProcess: 'Mechanical wire stripping/granulation (Never burn in open air - creates cancer-causing dioxins!)'
    },
    {
      id: 'mat-li-battery', symbol: 'LI-BATT', name: 'Lithium-Ion / EV / Laptop Batteries',
      nameMr: 'लिथियम-आयन / लॅपटॉप बॅटऱ्या', nameHi: 'लिथियम-आयन / लैपटॉप बैटरी',
      nameTa: 'லித்தியம்-அயன் / மடிக்கணினி பேட்டரிகள்', nameTe: 'లిథియం-అయాన్ / ల్యాప్‌టాప్ బ్యాటరీలు',
      nameKn: 'ಲಿಥಿಯಂ-ಐಯಾನ್ / ಲ್ಯಾಪ್‌ಟಾಪ್ ಬ್ಯಾಟರಿಗಳು', nameMl: 'ലിഥിയം-അയൺ / ലാപ്ടോപ്പ് ബാറ്ററികൾ',
      icon: '🔋', customerRate: 160, recyclerRate: 225, rate6hrAgo: 235, recyclerRate6hrAgo: 235, unit: 'kg',
      changePct: '-4.2%', isPositive: false, dayHigh: 240, dayLow: 218, volume: '850 kg',
      sparkline: [238, 235, 232, 230, 226, 224, 228, 222, 224, 225],
      description: 'Mobile phone pouch cells, 18650 laptop cylinders, EV battery packs.',
      metals: 'Cobalt (15%), Lithium (7%), Nickel, Graphite',
      hazardLevel: 'Critical',
      properProcess: 'Inert atmosphere shredding & black mass recovery (Never puncture or throw in water - explosive fire!)'
    },
    {
      id: 'mat-crt-monitors', symbol: 'CRT-GLS', name: 'CRT Televisions & Old Monitor Glass',
      nameMr: 'जुने सीआरटी टीव्ही आणि मॉनिटर', nameHi: 'पुराने सीआरटी टीवी और मॉनिटर',
      nameTa: 'பழைய சிஆர்டி டிவி மற்றும் மானிட்டர் கண்ணாடி', nameTe: 'పాత సిఆర్టి టివి మరియు మానిటర్ గ్లాస్',
      nameKn: 'ಹಳೆಯ ಸಿಆರ್‌ಟಿ ಟಿವಿ ಮತ್ತು ಮಾನಿಟರ್ ಗಾಜು', nameMl: 'പഴയ സിആർടി ടിവി, മോണിറ്റർ ഗ്ലാസ്',
      icon: '📺', customerRate: 15, recyclerRate: 28, rate6hrAgo: 28, recyclerRate6hrAgo: 28, unit: 'kg',
      changePct: '0.0%', isPositive: true, dayHigh: 31, dayLow: 25, volume: '6,200 kg',
      sparkline: [27, 28, 26, 28, 29, 28, 27, 28, 29, 28],
      description: 'Heavy picture tube glass with lead funnel and phosphor faceplate.',
      metals: 'Lead (up to 2 kg per tube), Glass cullet, Copper deflection yoke',
      hazardLevel: 'High',
      properProcess: 'Lead smelting furnace under negative pressure (Implosion hazard if smashed!)'
    },
    {
      id: 'mat-lcd-led', symbol: 'LCD-SCR', name: 'LCD / LED Display Panels & Monitors',
      nameMr: 'एलसीडी / एलईडी डिस्प्ले स्क्रीन', nameHi: 'एलसीडी / एलईडी डिस्प्ले स्क्रीन',
      nameTa: 'எல்சிடி / எல்இடி திரை பேனல்கள்', nameTe: 'ఎల్‌సిడి / ఎల్‌ఇడి డిస్‌ప్లే ప్యానెల్లు',
      nameKn: 'ಎಲ್‌ಸಿಡಿ / ಎಲ್‌ಇಡಿ ಡಿಸ್ಪ್ಲೇ ಪ್ಯಾನೆಲ್‌ಗಳು', nameMl: 'എൽസിഡി / എൽഇഡി ഡിസ്പ്ലേ പാനലുകൾ',
      icon: '🖥️', customerRate: 85, recyclerRate: 120, rate6hrAgo: 112, recyclerRate6hrAgo: 112, unit: 'kg',
      changePct: '+7.1%', isPositive: true, dayHigh: 126, dayLow: 108, volume: '1,950 kg',
      sparkline: [110, 112, 114, 113, 116, 118, 117, 119, 121, 120],
      description: 'Flat screen monitors, TV panels, CCFL or LED backlights.',
      metals: 'Indium Tin Oxide, Aluminum frame, Optical diffusers',
      hazardLevel: 'Medium',
      properProcess: 'Careful demanufacturing to safely isolate mercury backlights (if CCFL).'
    },
    {
      id: 'mat-electric-motors', symbol: 'MOT-MAG', name: 'Electric Motors & Neodymium Magnets',
      nameMr: 'इलेक्ट्रिक मोटर्स आणि चुंबक संच', nameHi: 'इलेक्ट्रिक मोटर और चुंबक असेंबली',
      nameTa: 'மின்சார மோட்டார்கள் மற்றும் காந்தங்கள்', nameTe: 'ఎలక్ట్రిక్ మోటార్లు మరియు అయస్కాంతాలు',
      nameKn: 'ವಿದ್ಯುತ್ ಮೋಟಾರ್‌ಗಳು ಮತ್ತು ಆಯಸ್ಕಾಂತಗಳು', nameMl: 'ഇലക്ട്രിക് മോട്ടോറുകളും കാന്തങ്ങളും',
      icon: '⚙️', customerRate: 110, recyclerRate: 165, rate6hrAgo: 158, recyclerRate6hrAgo: 158, unit: 'kg',
      changePct: '+4.4%', isPositive: true, dayHigh: 172, dayLow: 152, volume: '3,100 kg',
      sparkline: [154, 156, 158, 160, 159, 162, 161, 163, 166, 165],
      description: 'Hard drive voice coil motors, fan motors, compressor stators.',
      metals: 'Neodymium (Rare Earth NdFeB), Pure Copper windings, Steel armature',
      hazardLevel: 'Low',
      properProcess: 'Automated demagnetization & rare earth alloy recycling.'
    },
    {
      id: 'mat-e-plastics', symbol: 'PLAS-MIX', name: 'Flame Retardant E-Waste Plastics',
      nameMr: 'इलेक्ट्रॉनिक प्लास्टिक (ABS/PC)', nameHi: 'इलेक्ट्रॉनिक प्लास्टिक (ABS/PC)',
      nameTa: 'மின்னணு பிளாஸ்டிக் கழிவுகள்', nameTe: 'ఎలక్ట్రానిక్ ప్లాస్టిక్ వ్యర్థాలు',
      nameKn: 'ಎಲೆಕ್ಟ್ರಾನಿಕ್ ಪ್ಲಾಸ್ಟಿಕ್ ತ್ಯಾಜ್ಯ', nameMl: 'ഇലക്ട്രോണിക് പ്ലാസ്റ്റിക് മാലിന്യങ്ങൾ',
      icon: '♻️', customerRate: 22, recyclerRate: 38, rate6hrAgo: 38, recyclerRate6hrAgo: 38, unit: 'kg',
      changePct: '0.0%', isPositive: true, dayHigh: 41, dayLow: 35, volume: '9,400 kg',
      sparkline: [36, 37, 38, 37, 39, 38, 37, 38, 39, 38],
      description: 'Printer bodies, monitor bezels, keyboard keys (ABS, HIPS, PC).',
      metals: 'Engineering polymers for industrial re-granulation',
      hazardLevel: 'Medium',
      properProcess: 'Near-infrared optical sorting (Never melt in cookpots - toxic bromine gases!)'
    }
  ],

  dailyCollectionHistory: [],
  customerSalesHistory: [],
  customerSalesSummary: {
    totalWeightSoldKg: 0, totalCashReceived: 0, totalPickupsCompleted: 0,
    totalTreesEquivalent: 0, totalCo2PreventedKg: 0, toxicHeavyMetalsDivertedKg: 0,
    preferredScrapDealer: ''
  },
  customerMonthlyComparison: [],

  kabadiwalas: [],
  recyclers: [],
  inventory: [],
  lots: [],

  safetyGuides: [
    {
      id: 'safe-01', title: 'Danger: Never Burn Copper Wires in Open Air',
      titleMr: 'धोका: उघड्यावर तांब्याच्या तारा कधीही जाळू नका',
      titleHi: 'खतरा: खुली हवा में तांबे के तारों को कभी न जलाएं',
      icon: '🚫🔥', color: '#dc2626', hazard: 'Toxic Dioxins & Black Furan Fumes',
      healthRisk: 'Permanent lung damage, cancer risk, and lead poisoning for you and your family.',
      safeMethod: 'Use simple manual mechanical wire strippers or sell directly to recyclers with plastic sheath intact. Recyclers pay for the plastic too!',
      audioScriptEn: 'Never burn insulated copper cables in the open. Burning PVC releases deadly dioxin gas causing cancer. Sell unstripped cables directly to authorized recyclers for full cash.',
      audioScriptMr: 'उघड्यावर तारा जाळल्याने कॅन्सर पसरवणारा विषारी धूर निघतो. तारा न जाळता थेट अधिकृत रिसायकलरला विका, ते प्लास्टिकचेही पैसे देतात!',
      audioScriptHi: 'खुली हवा में तारों को कभी न जलाएं! ऐसा करने से कैंसर पैदा करने वाला जहरीला धुआं निकलता है। पूरी केबल रीसायकलर को बेचें, वह सही दाम देगा।'
    },
    {
      id: 'safe-02', title: 'Caution: Acid Leaching on Circuit Boards is Deadly',
      titleMr: 'सावधान: पीसीबी बोर्डवर ॲसिड / तेजाब वापरणे जीवघेणे आहे',
      titleHi: 'सावधान: पीसीबी पर एसिड का उपयोग जानलेवा है',
      icon: '☠️🧪', color: '#b91c1c', hazard: 'Cyanide & Nitric Acid Gas Releases',
      healthRisk: 'Breathing acid fumes causes throat burns, blindness, and kidney failure. Informal acid pits only recover 20% of gold while losing expensive Palladium and Tantalum.',
      safeMethod: 'Store motherboards in dry cartons and sell whole to CPCB units with computerized chemical extraction. You get paid for all 4 metals!',
      audioScriptEn: 'Backyard acid leaching destroys your lungs and recovers only tiny gold. Authorized recyclers extract Gold, Silver, Palladium and Copper cleanly and pay top rates.',
      audioScriptMr: 'तेजाब वापरल्याने डोळे आणि फुफ्फुसे जळतात. अधिकृत रिसायकलर्स आधुनिक मशिनने सोने, तांबे काढून जास्त पैसे देतात.',
      audioScriptHi: 'पीसीबी पर तेजाब डालने से जानलेवा गैस निकलती है। अधिकृत रीसायकलर आधुनिक मशीनों से धातु निकाल कर सबसे ऊंचा दाम देते हैं।'
    },
    {
      id: 'safe-03', title: 'Warning: Handle Lithium Batteries with Extreme Care',
      titleMr: 'चेतावणी: लिथियम बॅटऱ्यांना ठोकू किंवा दाबू नका',
      titleHi: 'चेतावनी: लिथियम बैटरी को कभी न फोड़ें या दबाएं',
      icon: '💥🔋', color: '#ea580c', hazard: 'Thermal Runaway Explosion & Violent Fires',
      healthRisk: 'Punctured or bent mobile batteries spontaneously ignite at 800°C and cannot be extinguished with water.',
      safeMethod: 'Tape the metal terminals with cello tape, store in dry plastic buckets with sand, and keep away from iron scrap.',
      audioScriptEn: 'Do not hammer or puncture lithium batteries. They can explode into violent fires. Tape the terminals and store them in dry buckets.',
      audioScriptMr: 'मोबाईल किंवा लॅपटॉपच्या बॅटऱ्यांना हातोड्याने ठोकू नका. ते अचानक पेट घेऊ शकतात. त्यांना कोरड्या बादलीत वाळूमध्ये ठेवा.',
      audioScriptHi: 'लिथियम बैटरी पर हथौड़ा न चलाएं। इनमें 800 डिग्री का भयानक विस्फोट हो सकता है। इन्हें अलग प्लास्टिक बाल्टी में रखें।'
    },
    {
      id: 'safe-04', title: 'Safety: CRT Monitors Vacuum Implosion Hazard',
      titleMr: 'सुरक्षा: जुन्या सीआरटी टीव्हीवर हातोडा मारू नका',
      titleHi: 'सुरक्षा: पुराने सीआरटी मॉनिटर को पटक कर न तोड़ें',
      icon: '🛡️📺', color: '#d97706', hazard: 'Glass Shrapnel & Leaded Toxic Phosphor Powder',
      healthRisk: 'Smashed CRT tubes implode with huge force, shooting glass shards and toxic barium/lead dust into eyes and lungs.',
      safeMethod: 'Keep the glass tube unbroken. Authorized recyclers have specialized negative-pressure diamond cutters to extract leaded glass safely.',
      audioScriptEn: 'Do not break CRT tubes with hammers. Smashed tubes blast high-speed glass shards and toxic lead dust. Deliver unbroken for full value.',
      audioScriptMr: 'सीआरटी टीव्ही फोडल्याने काचेचे तुकडे उडतात आणि शिशाची विषारी धूळ फुफ्फुसात जाते. काच अखंड ठेवून विका.',
      audioScriptHi: 'सीआरटी टीवी को कभी पत्थर या हथौड़े से न तोड़ें। शीशा फूटने से आंखों में कांच लग सकता है। इसे साबुत ही बेचें।'
    }
  ]
};

module.exports = SEED_DATA;
