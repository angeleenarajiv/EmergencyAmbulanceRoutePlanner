import {
  GraphNode,
  GraphEdge,
  IncidentReport,
  AmbulanceUnit,
  DispatchLog,
  DiversionStatus
} from '../types';

export type {
  GraphNode,
  GraphEdge,
  IncidentReport,
  AmbulanceUnit,
  DispatchLog,
  DiversionStatus
};

export const INITIAL_NODES: Record<string, GraphNode> = {
  // --- ACTUAL HOSPITALS IN ERNAKULAM, KERALA ---
  medical_trust: {
    id: 'medical_trust',
    name: 'Medical Trust Hospital, MG Road',
    shortName: 'Medical Trust',
    x: 330,
    y: 440,
    lat: 9.9658,
    lng: 76.2895,
    type: 'hospital',
    beds: { free: 42, total: 750 },
    icuAvailable: 8,
    traumaLevel: 'Level 1 Trauma & Emergency Center',
    emergencyPhone: '+91 484 235-8001',
    diversionStatus: 'operational',
    ventilatorsAvailable: 12,
    oxygenReservePercent: 96,
    lastUpdatedTime: '13:30'
  },
  amrita_hospital: {
    id: 'amrita_hospital',
    name: 'Amrita Hospital (AIMS), Edappally',
    shortName: 'AIMS Hospital',
    x: 380,
    y: 80,
    lat: 10.0332,
    lng: 76.2890,
    type: 'hospital',
    beds: { free: 64, total: 1350 },
    icuAvailable: 14,
    traumaLevel: 'Apex Quaternary Trauma Center',
    emergencyPhone: '+91 484 285-8000',
    diversionStatus: 'operational',
    ventilatorsAvailable: 24,
    oxygenReservePercent: 99,
    lastUpdatedTime: '13:28'
  },
  aster_medcity: {
    id: 'aster_medcity',
    name: 'Aster Medcity, Cheranallur',
    shortName: 'Aster Medcity',
    x: 120,
    y: 70,
    lat: 10.0535,
    lng: 76.2678,
    type: 'hospital',
    beds: { free: 48, total: 670 },
    icuAvailable: 11,
    traumaLevel: 'JCI Accredited Level 1 Trauma Center',
    emergencyPhone: '+91 484 669-9999',
    diversionStatus: 'operational',
    ventilatorsAvailable: 16,
    oxygenReservePercent: 98,
    lastUpdatedTime: '13:25'
  },
  vps_lakeshore: {
    id: 'vps_lakeshore',
    name: 'VPS Lakeshore Hospital, Nettoor/Maradu',
    shortName: 'VPS Lakeshore',
    x: 850,
    y: 500,
    lat: 9.9248,
    lng: 76.3142,
    type: 'hospital',
    beds: { free: 29, total: 600 },
    icuAvailable: 6,
    traumaLevel: 'Level 1 Trauma & Transplant Center',
    emergencyPhone: '+91 484 275-5555',
    diversionStatus: 'operational',
    ventilatorsAvailable: 9,
    oxygenReservePercent: 94,
    lastUpdatedTime: '13:15'
  },
  lisie_hospital: {
    id: 'lisie_hospital',
    name: 'Lisie Hospital, Kaloor',
    shortName: 'Lisie Hospital',
    x: 340,
    y: 180,
    lat: 9.9961,
    lng: 76.2934,
    type: 'hospital',
    beds: { free: 36, total: 800 },
    icuAvailable: 7,
    traumaLevel: 'Level 1 Cardiac & Trauma Center',
    emergencyPhone: '+91 484 240-2044',
    diversionStatus: 'operational',
    ventilatorsAvailable: 14,
    oxygenReservePercent: 97,
    lastUpdatedTime: '13:20'
  },
  ernakulam_general: {
    id: 'ernakulam_general',
    name: 'Ernakulam General Hospital, Marine Drive',
    shortName: 'Ernakulam GH',
    x: 190,
    y: 390,
    lat: 9.9740,
    lng: 76.2818,
    type: 'hospital',
    beds: { free: 52, total: 783 },
    icuAvailable: 9,
    traumaLevel: 'Govt. Apex Multi-Specialty Hospital',
    emergencyPhone: '+91 484 236-1251',
    diversionStatus: 'operational',
    ventilatorsAvailable: 10,
    oxygenReservePercent: 92,
    lastUpdatedTime: '13:05'
  },
  renai_medicity: {
    id: 'renai_medicity',
    name: 'Renai Medicity, Palarivattom',
    shortName: 'Renai Medicity',
    x: 670,
    y: 210,
    lat: 10.0075,
    lng: 76.3072,
    type: 'hospital',
    beds: { free: 22, total: 500 },
    icuAvailable: 5,
    traumaLevel: 'Super Specialty Trauma Center',
    emergencyPhone: '+91 484 288-0000',
    diversionStatus: 'operational',
    ventilatorsAvailable: 8,
    oxygenReservePercent: 95,
    lastUpdatedTime: '13:10'
  },
  gmc_kalamassery: {
    id: 'gmc_kalamassery',
    name: 'Govt. Medical College Hospital, Kalamassery',
    shortName: 'Govt Med College',
    x: 780,
    y: 90,
    lat: 10.0538,
    lng: 76.3536,
    type: 'hospital',
    beds: { free: 75, total: 950 },
    icuAvailable: 12,
    traumaLevel: 'Govt. Tertiary Trauma Care Center',
    emergencyPhone: '+91 484 275-4444',
    diversionStatus: 'operational',
    ventilatorsAvailable: 18,
    oxygenReservePercent: 93,
    lastUpdatedTime: '13:12'
  },
  sunrise_hospital: {
    id: 'sunrise_hospital',
    name: 'Sunrise Hospital, Kakkanad',
    shortName: 'Sunrise Hosp',
    x: 920,
    y: 220,
    lat: 10.0163,
    lng: 76.3421,
    type: 'hospital',
    beds: { free: 19, total: 350 },
    icuAvailable: 4,
    traumaLevel: 'Level 2 Trauma Center',
    emergencyPhone: '+91 484 242-8920',
    diversionStatus: 'operational',
    ventilatorsAvailable: 6,
    oxygenReservePercent: 91,
    lastUpdatedTime: '12:55'
  },
  rajagiri_hospital: {
    id: 'rajagiri_hospital',
    name: 'Rajagiri Hospital, Chunangamvely/Aluva',
    shortName: 'Rajagiri Hosp',
    x: 910,
    y: 70,
    lat: 10.1118,
    lng: 76.3804,
    type: 'hospital',
    beds: { free: 38, total: 550 },
    icuAvailable: 7,
    traumaLevel: 'JCI Accredited Tertiary Trauma Hub',
    emergencyPhone: '+91 484 290-5000',
    diversionStatus: 'operational',
    ventilatorsAvailable: 11,
    oxygenReservePercent: 96,
    lastUpdatedTime: '13:00'
  },
  lourdes_hospital: {
    id: 'lourdes_hospital',
    name: 'Lourdes Hospital, Pachalam',
    shortName: 'Lourdes Hosp',
    x: 210,
    y: 190,
    lat: 10.0090,
    lng: 76.2820,
    type: 'hospital',
    beds: { free: 26, total: 650 },
    icuAvailable: 5,
    traumaLevel: 'NABH Accredited Multi-Specialty',
    emergencyPhone: '+91 484 412-3456',
    diversionStatus: 'divert',
    ventilatorsAvailable: 2,
    oxygenReservePercent: 82,
    lastUpdatedTime: '12:45'
  },
  welcare_hospital: {
    id: 'welcare_hospital',
    name: 'Welcare Hospital, Vytilla',
    shortName: 'Welcare Hosp',
    x: 690,
    y: 340,
    lat: 9.9720,
    lng: 76.3150,
    type: 'hospital',
    beds: { free: 18, total: 250 },
    icuAvailable: 5,
    traumaLevel: 'Acute Trauma & Surgical Center',
    emergencyPhone: '+91 484 230-1011',
    diversionStatus: 'operational',
    ventilatorsAvailable: 3,
    oxygenReservePercent: 92,
    lastUpdatedTime: '13:00'
  },

  // --- EMS AMBULANCE BASES IN ERNAKULAM ---
  station_kaloor: {
    id: 'station_kaloor',
    name: '108 EMS Station 1 - Kaloor Fire Hub',
    shortName: '108 Kaloor Base',
    x: 440,
    y: 270,
    lat: 9.9945,
    lng: 76.2995,
    type: 'ambulance_station'
  },
  station_vytilla: {
    id: 'station_vytilla',
    name: '108 EMS Station 2 - Vytilla Hub Base',
    shortName: '108 Vytilla Base',
    x: 570,
    y: 470,
    lat: 9.9680,
    lng: 76.3185,
    type: 'ambulance_station'
  },
  station_kalamassery: {
    id: 'station_kalamassery',
    name: '108 EMS Station 3 - Kalamassery Industrial Base',
    shortName: '108 Kalamassery Base',
    x: 640,
    y: 35,
    lat: 10.0460,
    lng: 76.3270,
    type: 'ambulance_station'
  },
  station_south: {
    id: 'station_south',
    name: '108 EMS Station 4 - Panampilly Nagar South',
    shortName: '108 South Hub',
    x: 450,
    y: 450,
    lat: 9.9580,
    lng: 76.2970,
    type: 'ambulance_station'
  },

  // --- ACTUAL ROAD JUNCTIONS IN ERNAKULAM ---
  vytilla_junction: {
    id: 'vytilla_junction',
    name: 'Vytilla Mobility Hub Underpass (NH 66)',
    shortName: 'Vytilla Junc',
    x: 570,
    y: 360,
    lat: 9.9685,
    lng: 76.3175,
    type: 'incident' // Location of ACC-2026-EKM01
  },
  edappally_toll: {
    id: 'edappally_toll',
    name: 'Edappally Toll & Lulu Mall Junction (NH 66 / NH 544)',
    shortName: 'Edappally Lulu Junc',
    x: 500,
    y: 130,
    lat: 10.0260,
    lng: 76.3090,
    type: 'incident' // Location of ACC-2026-EKM02
  },
  palarivattom_signal: {
    id: 'palarivattom_signal',
    name: 'Palarivattom Bypass Flyover (NH 66)',
    shortName: 'Palarivattom',
    x: 550,
    y: 220,
    lat: 10.0040,
    lng: 76.3060,
    type: 'junction'
  },
  kaloor_junction: {
    id: 'kaloor_junction',
    name: 'Kaloor Junction (Banerji Road)',
    shortName: 'Kaloor Junc',
    x: 340,
    y: 270,
    lat: 9.9940,
    lng: 76.2980,
    type: 'junction'
  },
  kundannoor_junction: {
    id: 'kundannoor_junction',
    name: 'Kundannoor Bridge & Junction (NH 66 / Maradu)',
    shortName: 'Kundannoor Junc',
    x: 710,
    y: 470,
    lat: 9.9410,
    lng: 76.3210,
    type: 'junction'
  },
  marine_drive_junction: {
    id: 'marine_drive_junction',
    name: 'Marine Drive - High Court Junction',
    shortName: 'Marine Drive',
    x: 190,
    y: 290,
    lat: 9.9820,
    lng: 76.2750,
    type: 'junction'
  },
  kakkanad_civil_station: {
    id: 'kakkanad_civil_station',
    name: 'Kakkanad Civil Station & Infopark Corridor',
    shortName: 'Kakkanad Infopark',
    x: 800,
    y: 230,
    lat: 10.0180,
    lng: 76.3450,
    type: 'junction'
  },
  cheranallur_junction: {
    id: 'cheranallur_junction',
    name: 'Cheranallur Container Road Junction (NH 966A)',
    shortName: 'Cheranallur Junc',
    x: 260,
    y: 90,
    lat: 10.0480,
    lng: 76.2840,
    type: 'junction'
  },
  kalamassery_premier: {
    id: 'kalamassery_premier',
    name: 'Kalamassery Premier Junction (NH 544)',
    shortName: 'Kalamassery',
    x: 640,
    y: 100,
    lat: 10.0490,
    lng: 76.3290,
    type: 'junction'
  }
};

export const INITIAL_AMBULANCES: AmbulanceUnit[] = [
  {
    id: 'amb_1',
    name: 'Kerala 108 Rapid Alpha 1',
    code: 'KL-07-EMS-1081',
    status: 'IDLE',
    currentLocationNodeId: 'station_kaloor',
    lead: 'Paramedic Anoop Varghese',
    driver: 'Suresh Kumar',
    level: 'Advanced Cardiac Trauma ICU',
    fuelPercent: 92
  },
  {
    id: 'amb_2',
    name: 'Kerala 108 Highway Bravo 2',
    code: 'KL-07-EMS-1082',
    status: 'ACTIVE_EN_ROUTE',
    currentLocationNodeId: 'station_vytilla',
    assignedIncidentId: 'ACC-2026-EKM01',
    lead: 'Paramedic Divya Pillai',
    driver: 'Manoj Nair',
    level: 'Mobile Trauma Resuscitation Unit',
    fuelPercent: 88
  },
  {
    id: 'amb_3',
    name: 'Kerala 108 Metro Charlie 3',
    code: 'KL-07-EMS-1083',
    status: 'IDLE',
    currentLocationNodeId: 'station_kalamassery',
    lead: 'Paramedic Rahul Menon',
    driver: 'Pradeep Joseph',
    level: 'Advanced Life Support (ALS)',
    fuelPercent: 95
  },
  {
    id: 'amb_4',
    name: 'Kerala 108 Urban Delta 4',
    code: 'KL-07-EMS-1084',
    status: 'IDLE',
    currentLocationNodeId: 'station_south',
    lead: 'Paramedic Reshma K.',
    driver: 'Abdul Rahim',
    level: 'Mobile ICU Trauma Unit',
    fuelPercent: 84
  },
  {
    id: 'amb_5',
    name: 'Kerala 108 Bypass Echo 5',
    code: 'KL-07-EMS-1085',
    status: 'ACTIVE_EN_ROUTE',
    currentLocationNodeId: 'edappally_toll',
    lead: 'Paramedic Jithin Paul',
    driver: 'Venu G.',
    level: 'Advanced Life Support (ALS)',
    fuelPercent: 78
  },
  {
    id: 'amb_6',
    name: 'Kerala 108 Coastal Foxtrot 6',
    code: 'KL-07-EMS-1086',
    status: 'IDLE',
    currentLocationNodeId: 'marine_drive_junction',
    lead: 'Paramedic Sneha Mohan',
    driver: 'Biju Thomas',
    level: 'Basic Life Support (BLS)',
    fuelPercent: 90
  },
  {
    id: 'amb_7',
    name: 'Kerala 108 Techpark Golf 7',
    code: 'KL-07-EMS-1087',
    status: 'IDLE',
    currentLocationNodeId: 'kakkanad_civil_station',
    lead: 'Paramedic Akhil Raj',
    driver: 'Shaji K.',
    level: 'Advanced Life Support (ALS)',
    fuelPercent: 85
  },
  {
    id: 'amb_8',
    name: 'Kerala 108 Aluva Express 8',
    code: 'KL-07-EMS-1088',
    status: 'IDLE',
    currentLocationNodeId: 'rajagiri_hospital',
    lead: 'Paramedic Deepa N.',
    driver: 'Rajesh V.',
    level: 'Mobile Trauma ICU',
    fuelPercent: 94
  }
];

export const INITIAL_EDGES: GraphEdge[] = [
  // Vytilla & South Corridor
  { id: 'e1', from: 'station_vytilla', to: 'vytilla_junction', distanceKm: 0.6, congestion: 1.0 },
  { id: 'e2', from: 'vytilla_junction', to: 'kundannoor_junction', distanceKm: 3.2, congestion: 1.0 },
  { id: 'e3', from: 'kundannoor_junction', to: 'vps_lakeshore', distanceKm: 2.1, congestion: 1.0 },
  { id: 'e4', from: 'vytilla_junction', to: 'palarivattom_signal', distanceKm: 4.1, congestion: 1.0 },
  { id: 'e5', from: 'vytilla_junction', to: 'medical_trust', distanceKm: 4.5, congestion: 1.0 },
  { id: 'e5b', from: 'vytilla_junction', to: 'welcare_hospital', distanceKm: 0.9, congestion: 1.0 },
  
  // MG Road & Marine Drive
  { id: 'e6', from: 'medical_trust', to: 'station_south', distanceKm: 1.2, congestion: 1.0 },
  { id: 'e7', from: 'medical_trust', to: 'ernakulam_general', distanceKm: 2.3, congestion: 1.0 },
  { id: 'e8', from: 'ernakulam_general', to: 'marine_drive_junction', distanceKm: 1.1, congestion: 1.0 },
  { id: 'e9', from: 'marine_drive_junction', to: 'kaloor_junction', distanceKm: 2.8, congestion: 1.0 },
  { id: 'e9b', from: 'marine_drive_junction', to: 'lourdes_hospital', distanceKm: 2.4, congestion: 1.0 },
  { id: 'e10', from: 'station_south', to: 'kundannoor_junction', distanceKm: 3.5, congestion: 1.0 },

  // Kaloor & Lisie Hospital
  { id: 'e11', from: 'kaloor_junction', to: 'lisie_hospital', distanceKm: 0.5, congestion: 1.0 },
  { id: 'e12', from: 'kaloor_junction', to: 'station_kaloor', distanceKm: 0.4, congestion: 1.0 },
  { id: 'e13', from: 'kaloor_junction', to: 'palarivattom_signal', distanceKm: 2.2, congestion: 1.0 },
  { id: 'e13b', from: 'kaloor_junction', to: 'lourdes_hospital', distanceKm: 1.9, congestion: 1.0 },

  // Palarivattom & Renai Medicity
  { id: 'e14', from: 'palarivattom_signal', to: 'renai_medicity', distanceKm: 0.4, congestion: 1.0 },
  { id: 'e15', from: 'palarivattom_signal', to: 'edappally_toll', distanceKm: 2.5, congestion: 1.0 },
  { id: 'e16', from: 'palarivattom_signal', to: 'kakkanad_civil_station', distanceKm: 4.6, congestion: 1.0 },

  // Kakkanad & Sunrise Hospital
  { id: 'e17', from: 'kakkanad_civil_station', to: 'sunrise_hospital', distanceKm: 0.8, congestion: 1.0 },
  { id: 'e18', from: 'kakkanad_civil_station', to: 'kalamassery_premier', distanceKm: 5.1, congestion: 1.0 },

  // Edappally & Amrita Hospital (AIMS)
  { id: 'e19', from: 'edappally_toll', to: 'amrita_hospital', distanceKm: 2.2, congestion: 1.0 },
  { id: 'e20', from: 'edappally_toll', to: 'cheranallur_junction', distanceKm: 3.4, congestion: 1.0 },
  { id: 'e21', from: 'edappally_toll', to: 'kalamassery_premier', distanceKm: 3.1, congestion: 1.0 },

  // Cheranallur & Aster Medcity
  { id: 'e22', from: 'cheranallur_junction', to: 'aster_medcity', distanceKm: 1.8, congestion: 1.0 },
  { id: 'e23', from: 'cheranallur_junction', to: 'amrita_hospital', distanceKm: 2.1, congestion: 1.0 },

  // Kalamassery & Govt Medical College
  { id: 'e24', from: 'kalamassery_premier', to: 'station_kalamassery', distanceKm: 0.8, congestion: 1.0 },
  { id: 'e25', from: 'kalamassery_premier', to: 'gmc_kalamassery', distanceKm: 3.2, congestion: 1.0 },
  { id: 'e26', from: 'gmc_kalamassery', to: 'rajagiri_hospital', distanceKm: 6.8, congestion: 1.0 }
];

export const INITIAL_INCIDENTS: IncidentReport[] = [
  {
    id: 'ACC-2026-EKM01',
    code: 'ACC-2026-EKM01',
    title: 'Vytilla Mobility Hub Underpass, NH 66 Southbound',
    locationDetails: 'Vytilla Junction near Metro Pillar 842, Ernakulam, Kerala',
    severity: 'Code Red • Critical',
    timestamp: '2026-10-14 13:00',
    nodeId: 'vytilla_junction',
    assignedAmbulanceId: 'amb_2',
    targetHospitalId: 'welcare_hospital',
    casualties: 3,
    vehiclesInvolved: 2,
    tags: ['Trapped Passengers', 'Fuel Spillage / Leak', 'NH 66 Bypass Blocked'],
    isVerifiedByAdmin: true,
    statusStep: 3, // Ambulance En Route
    sceneDocuments: [
      {
        id: 'doc-1',
        name: 'vytilla_underpass_collision_cam.jpg',
        size: '1.4 MB',
        type: 'image',
        url: '/src/assets/images/accident_scene_overview_1792007786071.jpg'
      },
      {
        id: 'doc-2',
        name: 'ernakulam_108_triage_form.pdf',
        size: '340 KB',
        type: 'pdf'
      }
    ],
    logs: [
      {
        id: 'l1',
        time: '01:03 pm',
        title: 'Accident Reported to Kerala 108 CAD',
        description: 'Caller George Mathew reported high-impact multi-car collision at Vytilla NH 66 underpass with 3 casualties.',
        author: 'Citizen George Mathew'
      },
      {
        id: 'l2',
        time: '01:05 pm',
        title: 'Incident Verified by Dispatch Chief',
        description: 'Dispatcher verified Code Red. Dijkstra algorithm calculated shortest arrival route from Station 2 (Vytilla).',
        author: 'Officer Sarah Chen'
      },
      {
        id: 'l3',
        time: '01:07 pm',
        title: 'Ambulance Dispatched from Vytilla Base',
        description: 'Kerala 108 Highway Bravo 2 (KL-07-EMS-1082) en route. Welcare Hospital Trauma Unit alerted via Dijkstra shortest path (0.9 km).',
        author: 'Ernakulam Dispatch Automation'
      },
      {
        id: 'l4',
        time: '01:11 pm',
        title: 'Unit En Route with Sirens Active',
        description: 'Sirens active along SA Road corridor. Estimated arrival at Vytilla underpass in ~2.8 minutes.',
        author: 'Paramedic Divya Pillai'
      }
    ]
  },
  {
    id: 'ACC-2026-EKM02',
    code: 'ACC-2026-EKM02',
    title: 'Edappally Toll Flyover near Lulu Mall Junction',
    locationDetails: 'Intersection of NH 66 & NH 544, Edappally, Ernakulam, Kerala',
    severity: 'Code Yellow • High',
    timestamp: '2026-10-14 13:13',
    nodeId: 'edappally_toll',
    assignedAmbulanceId: '',
    targetHospitalId: '',
    casualties: 1,
    vehiclesInvolved: 1,
    tags: ['Overturned Auto-Rickshaw', 'Traffic Diverted'],
    isVerifiedByAdmin: false, // PENDING ADMIN VERIFICATION!
    statusStep: 1, // Reported
    sceneDocuments: [
      {
        id: 'doc-3',
        name: 'edappally_toll_traffic_cam.jpg',
        size: '890 KB',
        type: 'image',
        url: '/src/assets/images/accident_scene_overview_1792007786071.jpg'
      }
    ],
    logs: [
      {
        id: 'l201',
        time: '01:13 pm',
        title: 'Accident Reported by Metro Commuter',
        description: 'Overturned commercial vehicle near Edappally Metro entrance. Minor passenger concussion reported.',
        author: 'Citizen Maya Lin'
      },
      {
        id: 'l202',
        time: '01:14 pm',
        title: 'Awaiting CAD Dispatcher Verification',
        description: 'Queued in priority queue. Requires Central Dispatcher to verify severity and trigger Dijkstra route solver.',
        author: 'Dispatch Queue'
      }
    ]
  },
  {
    id: 'ACC-2026-EKM03',
    code: 'ACC-2026-EKM03',
    title: 'Kakkanad Infopark Expressway near Rajagiri Valley',
    locationDetails: 'Seaport-Airport Road, Kakkanad, Ernakulam, Kerala',
    severity: 'Code Green • Moderate',
    timestamp: '2026-10-14 12:40',
    nodeId: 'kakkanad_civil_station',
    assignedAmbulanceId: 'amb_3',
    targetHospitalId: 'sunrise_hospital',
    casualties: 1,
    vehiclesInvolved: 2,
    tags: ['Minor Side-Swipe', 'Single Lane Restriction', 'Paramedic First Aid'],
    isVerifiedByAdmin: true,
    statusStep: 5, // Hospital Transit
    sceneDocuments: [],
    logs: [
      {
        id: 'l301',
        time: '12:40 pm',
        title: 'Minor Collision Reported',
        description: 'Two passenger sedans collided at moderate speed. Driver ambulatory with wrist sprain.',
        author: 'Citizen Rahul Nair'
      },
      {
        id: 'l302',
        time: '12:42 pm',
        title: 'Dispatched to Sunrise Hospital',
        description: 'Assigned BLS Unit Delta 4. Sunrise Hospital emergency room notified.',
        author: 'CAD Auto-Router'
      }
    ]
  },
  {
    id: 'ACC-2026-EKM04',
    code: 'ACC-2026-EKM04',
    title: 'Kundannoor Flyover Junction, NH 66 Maradu',
    locationDetails: 'Kundannoor Bridge North Ramp, Ernakulam, Kerala',
    severity: 'Code Red • Critical',
    timestamp: '2026-10-13 18:22',
    nodeId: 'kundannoor_junction',
    assignedAmbulanceId: 'amb_1',
    targetHospitalId: 'medical_trust',
    casualties: 2,
    vehiclesInvolved: 3,
    tags: ['Multiple Injuries', 'Spill Neutralized', 'Golden Hour Critical'],
    isVerifiedByAdmin: true,
    statusStep: 6, // Resolved
    sceneDocuments: [],
    logs: [
      {
        id: 'l401',
        time: '06:22 pm',
        title: 'Multi-Vehicle Collision Reported',
        description: 'Heavy truck and two cars involved. Critical head trauma and limb fracture.',
        author: 'Traffic Patrol Maradu'
      },
      {
        id: 'l402',
        time: '06:24 pm',
        title: 'ALS Ambulance Dispatched',
        description: 'Dijkstra route through MG Road SA Corridor. Arrived on scene in 4.2 minutes.',
        author: 'Officer Sarah Chen'
      },
      {
        id: 'l403',
        time: '06:48 pm',
        title: 'Patients Handed Over to Trauma ICU',
        description: 'Both victims stabilized at Medical Trust Hospital Level 1 Trauma Center.',
        author: 'Paramedic Divya Pillai'
      }
    ]
  },
  {
    id: 'ACC-2026-EKM05',
    code: 'ACC-2026-EKM05',
    title: 'Kaloor Stadium Roundabout (Banerji Road)',
    locationDetails: 'Near Jawaharlal Nehru Stadium Metro Station, Ernakulam, Kerala',
    severity: 'Code Yellow • High',
    timestamp: '2026-10-12 09:15',
    nodeId: 'kaloor_junction',
    assignedAmbulanceId: 'amb_3',
    targetHospitalId: 'lisie_hospital',
    casualties: 1,
    vehiclesInvolved: 1,
    tags: ['Two-Wheeler Skid', 'Lisie Trauma Alert'],
    isVerifiedByAdmin: true,
    statusStep: 6, // Resolved
    sceneDocuments: [],
    logs: [
      {
        id: 'l501',
        time: '09:15 am',
        title: 'Motorcycle Skid Incident',
        description: 'Two-wheeler slipped on wet paint marks near roundabout. Moderate clavicle injury.',
        author: 'Citizen Anita Thomas'
      },
      {
        id: 'l502',
        time: '09:21 am',
        title: 'Arrival at Lisie Hospital',
        description: 'Patient admitted to Lisie Hospital Orthopedic ER within 6.1 minutes.',
        author: 'Paramedic Rajesh V.'
      }
    ]
  }
];

export const PIPELINE_STEPS = [
  { step: 1, title: 'Reported', description: 'Queued for dispatcher triage' },
  { step: 2, title: 'AI Verified', description: 'Auto-verified by Gemini CAD' },
  { step: 3, title: 'Ambulance En Route', description: 'Sirens active, shortest route' },
  { step: 4, title: 'On Scene', description: 'Paramedics treating casualties' },
  { step: 5, title: 'Hospital Transit', description: 'Transferring to trauma center' },
  { step: 6, title: 'Resolved', description: 'Patient safely admitted' }
];

export const FIRST_AID_PROTOCOLS = [
  {
    id: 1,
    title: '1. Protect the Spine',
    description: 'Do NOT move injured victims unless there is immediate threat of fire, explosion, or vehicle submersion.',
    iconName: 'ShieldAlert'
  },
  {
    id: 2,
    title: '2. Control Heavy Bleeding',
    description: 'Apply firm, continuous pressure with a clean cloth or garment directly over the wound. Keep patient warm.',
    iconName: 'HeartPulse'
  },
  {
    id: 3,
    title: '3. Secure the Scene',
    description: 'Turn on vehicle hazard lights. Place safety triangles at least 30 meters back. Do not smoke near leaked fluids.',
    iconName: 'AlertTriangle'
  },
  {
    id: 4,
    title: '4. Keep Airway Open',
    description: 'If unconscious but breathing, check airway. Do not give any food or liquids in case urgent surgical anesthesia is needed.',
    iconName: 'Activity'
  }
];
