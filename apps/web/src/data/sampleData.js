export const weatherData = {
    temperature: 28.4,
    humidity: 67,
    windSpeed: 12.3,
    rainfall: 2.8,
    temperatureTrend: [
      { time: '00:00', value: 22.1 },
      { time: '04:00', value: 20.5 },
      { time: '08:00', value: 24.8 },
      { time: '12:00', value: 28.4 },
      { time: '16:00', value: 27.2 },
      { time: '20:00', value: 24.6 }
    ],
    rainProbability: [
      { day: 'Mon', probability: 15 },
      { day: 'Tue', probability: 32 },
      { day: 'Wed', probability: 68 },
      { day: 'Thu', probability: 45 },
      { day: 'Fri', probability: 22 },
      { day: 'Sat', probability: 8 },
      { day: 'Sun', probability: 12 }
    ]
  };
  
  export const cropHealthData = {
    overallScore: 87.3,
    healthyArea: 73.2,
    stressedArea: 18.5,
    diseasedArea: 8.3,
    trend: [
      { date: 'Jan 15', score: 82.1 },
      { date: 'Feb 15', score: 84.5 },
      { date: 'Mar 15', score: 87.3 },
      { date: 'Apr 15', score: 85.8 },
      { date: 'May 15', score: 88.2 },
      { date: 'Jun 15', score: 87.3 }
    ],
    diseases: [
      { name: 'Leaf Blight', severity: 'Medium', affectedArea: 4.2, confidence: 89 },
      { name: 'Root Rot', severity: 'Low', affectedArea: 2.1, confidence: 76 },
      { name: 'Powdery Mildew', severity: 'High', affectedArea: 6.8, confidence: 92 }
    ],
    pests: [
      { name: 'Aphids', severity: 'Medium', location: 'North Field', detected: '2 hours ago' },
      { name: 'Whiteflies', severity: 'Low', location: 'East Field', detected: '5 hours ago' }
    ],
    heatmapData: [
      [92, 88, 85, 90, 87, 84, 89, 91],
      [88, 86, 82, 78, 75, 80, 85, 87],
      [85, 83, 79, 72, 68, 74, 82, 84],
      [87, 85, 81, 75, 70, 76, 83, 86],
      [90, 88, 84, 80, 77, 82, 87, 89],
      [91, 89, 86, 83, 80, 85, 88, 90]
    ]
  };
  
  export const pollinationData = {
    beeActivity: 78.5,
    efficiency: 82.3,
    floweringStage: 'Mid Bloom',
    trend: [
      { date: 'Week 1', efficiency: 68.2 },
      { date: 'Week 2', efficiency: 72.5 },
      { date: 'Week 3', efficiency: 78.1 },
      { date: 'Week 4', efficiency: 82.3 }
    ],
    beeCountByHive: [
      { hive: 'Hive A', count: 12400 },
      { hive: 'Hive B', count: 10800 },
      { hive: 'Hive C', count: 11200 },
      { hive: 'Hive D', count: 9600 }
    ]
  };
  
  export const droneData = {
    status: 'Active',
    battery: 78,
    altitude: 45.2,
    speed: 8.5,
    gpsCoordinates: { lat: 28.6139, lng: 77.2090 },
    missionProgress: 67,
    areaCoverage: 142.8,
    totalArea: 200,
    lastImages: [
      { id: 1, url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400', timestamp: '10 mins ago', location: 'North Field' },
      { id: 2, url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400', timestamp: '25 mins ago', location: 'East Field' },
      { id: 3, url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=400', timestamp: '42 mins ago', location: 'South Field' }
    ]
  };
  
  export const yieldPredictionData = {
    estimatedYield: 4.7,
    confidenceScore: 87,
    historicalData: [
      { year: '2022', yield: 3.8 },
      { year: '2023', yield: 4.2 },
      { year: '2024', yield: 4.5 },
      { year: '2025', yield: 4.4 },
      { year: '2026 (Predicted)', yield: 4.7 }
    ],
    factors: [
      { name: 'Weather Conditions', impact: 'Positive', weight: 32 },
      { name: 'Soil Moisture', impact: 'Optimal', weight: 28 },
      { name: 'Crop Health', impact: 'Good', weight: 25 },
      { name: 'Irrigation', impact: 'Adequate', weight: 15 }
    ]
  };
  
  export const governmentSchemes = [
    {
      id: 1,
      name: 'Pradhan Mantri Fasal Bima Yojana',
      type: 'Insurance',
      description: 'Comprehensive crop insurance scheme providing financial support to farmers in case of crop failure.',
      eligibility: ['All farmers growing notified crops', 'Sharecroppers and tenant farmers', 'Landless agricultural laborers'],
      benefits: ['Premium subsidy up to 90%', 'Coverage for natural calamities', 'Quick claim settlement'],
      link: 'https://pmfby.gov.in'
    },
    {
      id: 2,
      name: 'PM-KISAN',
      type: 'Direct Benefit',
      description: 'Direct income support of ₹6,000 per year to all farmer families in three equal installments.',
      eligibility: ['All landholding farmer families', 'Small and marginal farmers', 'Institutional landholders excluded'],
      benefits: ['₹2,000 every 4 months', 'Direct bank transfer', 'No intermediaries'],
      link: 'https://pmkisan.gov.in'
    },
    {
      id: 3,
      name: 'Soil Health Card Scheme',
      type: 'Advisory',
      description: 'Provides soil health cards to farmers with recommendations on nutrient management.',
      eligibility: ['All farmers', 'Free soil testing', 'Available across all states'],
      benefits: ['Free soil testing', 'Customized fertilizer recommendations', 'Improved crop productivity'],
      link: 'https://soilhealth.dac.gov.in'
    },
    {
      id: 4,
      name: 'Kisan Credit Card',
      type: 'Credit',
      description: 'Provides adequate and timely credit support to farmers for agricultural needs.',
      eligibility: ['Farmers owning cultivable land', 'Tenant farmers and sharecroppers', 'Self-help groups'],
      benefits: ['Low interest rates (4% per annum)', 'Flexible repayment', 'Insurance coverage'],
      link: 'https://www.nabard.org/kcc.aspx'
    },
    {
      id: 5,
      name: 'National Agriculture Market',
      type: 'Marketing',
      description: 'Pan-India electronic trading portal for agricultural commodities.',
      eligibility: ['All farmers', 'Traders and commission agents', 'Buyers across India'],
      benefits: ['Better price discovery', 'Transparent auction process', 'Reduced transaction costs'],
      link: 'https://www.enam.gov.in'
    },
    {
      id: 6,
      name: 'Paramparagat Krishi Vikas Yojana',
      type: 'Organic Farming',
      description: 'Promotes organic farming and certification through cluster approach.',
      eligibility: ['Farmers interested in organic farming', 'Minimum 50 farmers per cluster', 'Certified organic farmers'],
      benefits: ['₹50,000 per hectare over 3 years', 'Organic certification support', 'Market linkage assistance'],
      link: 'https://pgsindia-ncof.gov.in'
    }
  ];
  
  export const alertsData = [
    {
      id: 1,
      type: 'pest',
      severity: 'critical',
      title: 'Aphid Infestation Detected',
      description: 'High concentration of aphids detected in North Field Zone 3. Immediate action recommended.',
      timestamp: '15 mins ago',
      read: false,
      location: 'North Field Zone 3'
    },
    {
      id: 2,
      type: 'disease',
      severity: 'warning',
      title: 'Leaf Blight Symptoms',
      description: 'Early signs of leaf blight observed in East Field. Monitor closely and consider preventive measures.',
      timestamp: '1 hour ago',
      read: false,
      location: 'East Field'
    },
    {
      id: 3,
      type: 'water',
      severity: 'warning',
      title: 'Low Soil Moisture',
      description: 'Soil moisture levels below optimal range in South Field Zone 2. Irrigation recommended.',
      timestamp: '2 hours ago',
      read: true,
      location: 'South Field Zone 2'
    },
    {
      id: 4,
      type: 'weather',
      severity: 'critical',
      title: 'Heavy Rainfall Warning',
      description: 'Meteorological department predicts heavy rainfall (80mm+) in next 24 hours. Secure crops and equipment.',
      timestamp: '3 hours ago',
      read: false,
      location: 'All Fields'
    },
    {
      id: 5,
      type: 'drone',
      severity: 'info',
      title: 'Drone Battery Low',
      description: 'Drone battery at 22%. Mission paused. Returning to base for charging.',
      timestamp: '4 hours ago',
      read: true,
      location: 'West Field'
    },
    {
      id: 6,
      type: 'pest',
      severity: 'warning',
      title: 'Whitefly Activity Increased',
      description: 'Moderate increase in whitefly population detected. Continue monitoring.',
      timestamp: '6 hours ago',
      read: true,
      location: 'East Field Zone 1'
    },
    {
      id: 7,
      type: 'weather',
      severity: 'info',
      title: 'Temperature Rise Expected',
      description: 'Temperature expected to reach 34°C tomorrow. Ensure adequate irrigation.',
      timestamp: '8 hours ago',
      read: true,
      location: 'All Fields'
    }
  ];
  
  export const chatMessages = [
    {
      id: 1,
      sender: 'ai',
      text: 'Hello! I\'m your Smart Agriculture AI Assistant. How can I help you today?',
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: 2,
      sender: 'user',
      text: 'What\'s the current health status of my crops?',
      timestamp: new Date(Date.now() - 3500000)
    },
    {
      id: 3,
      sender: 'ai',
      text: 'Your overall crop health score is 87.3%, which is good. However, I\'ve detected some leaf blight in the East Field affecting about 4.2% of the area. I recommend applying fungicide treatment within the next 48 hours.',
      timestamp: new Date(Date.now() - 3400000)
    },
    {
      id: 4,
      sender: 'user',
      text: 'Should I be worried about the weather forecast?',
      timestamp: new Date(Date.now() - 3200000)
    },
    {
      id: 5,
      sender: 'ai',
      text: 'Yes, there\'s a heavy rainfall warning for the next 24 hours with expected precipitation of 80mm+. I suggest: 1) Ensure proper drainage in all fields, 2) Secure any loose equipment, 3) Delay any planned pesticide application until after the rain.',
      timestamp: new Date(Date.now() - 3100000)
    }
  ];
  
  export const farmBoundary = {
    type: 'Feature',
    properties: { name: 'Green Valley Farm' },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [77.2080, 28.6150],
        [77.2100, 28.6150],
        [77.2100, 28.6130],
        [77.2080, 28.6130],
        [77.2080, 28.6150]
      ]]
    }
  };
  
  export const fieldZones = [
    {
      id: 'north',
      name: 'North Field',
      type: 'Feature',
      properties: { health: 'good', color: '#22c55e' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.2080, 28.6145],
          [77.2090, 28.6145],
          [77.2090, 28.6140],
          [77.2080, 28.6140],
          [77.2080, 28.6145]
        ]]
      }
    },
    {
      id: 'east',
      name: 'East Field',
      type: 'Feature',
      properties: { health: 'stressed', color: '#f59e0b' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.2090, 28.6145],
          [77.2100, 28.6145],
          [77.2100, 28.6140],
          [77.2090, 28.6140],
          [77.2090, 28.6145]
        ]]
      }
    },
    {
      id: 'south',
      name: 'South Field',
      type: 'Feature',
      properties: { health: 'good', color: '#22c55e' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.2080, 28.6140],
          [77.2090, 28.6140],
          [77.2090, 28.6135],
          [77.2080, 28.6135],
          [77.2080, 28.6140]
        ]]
      }
    },
    {
      id: 'west',
      name: 'West Field',
      type: 'Feature',
      properties: { health: 'diseased', color: '#ef4444' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.2090, 28.6140],
          [77.2100, 28.6140],
          [77.2100, 28.6135],
          [77.2090, 28.6135],
          [77.2090, 28.6140]
        ]]
      }
    }
  ];
  
  export const droneFlightPath = {
    type: 'Feature',
    properties: { name: 'Current Mission Path' },
    geometry: {
      type: 'LineString',
      coordinates: [
        [77.2082, 28.6148],
        [77.2085, 28.6146],
        [77.2088, 28.6144],
        [77.2091, 28.6142],
        [77.2094, 28.6140],
        [77.2097, 28.6138]
      ]
    }
  };
  
  export const stressMarkers = [
    { id: 1, position: [28.6143, 77.2092], type: 'stress', severity: 'high' },
    { id: 2, position: [28.6141, 77.2095], type: 'stress', severity: 'medium' }
  ];
  
  export const diseaseMarkers = [
    { id: 1, position: [28.6144, 77.2088], type: 'disease', name: 'Leaf Blight' },
    { id: 2, position: [28.6138, 77.2093], type: 'disease', name: 'Root Rot' }
  ];