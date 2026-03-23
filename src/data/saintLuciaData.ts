// Sample environmental and geographic data for Saint Lucia
// Used for sandfly risk calculations

export interface LocationData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  rainfall: number;       // mm per month (average)
  humidity: number;        // percentage
  windSpeed: number;       // km/h average
  forestCoverage: boolean; // whether area has significant forest
  elevation: number;       // meters
  population: number;      // approximate
}

// Key locations across Saint Lucia with sample environmental data
export const locations: LocationData[] = [
  { id: "castries", name: "Castries", lat: 14.0101, lng: -60.9875, rainfall: 180, humidity: 78, windSpeed: 14, forestCoverage: false, elevation: 5, population: 22000 },
  { id: "soufriere", name: "Soufrière", lat: 13.8566, lng: -61.0564, rainfall: 240, humidity: 85, windSpeed: 8, forestCoverage: true, elevation: 15, population: 8000 },
  { id: "vieux-fort", name: "Vieux Fort", lat: 13.7246, lng: -60.9490, rainfall: 150, humidity: 72, windSpeed: 22, forestCoverage: false, elevation: 3, population: 4500 },
  { id: "gros-islet", name: "Gros Islet", lat: 14.0833, lng: -60.9500, rainfall: 160, humidity: 76, windSpeed: 16, forestCoverage: false, elevation: 8, population: 25000 },
  { id: "dennery", name: "Dennery", lat: 13.9167, lng: -60.8833, rainfall: 220, humidity: 82, windSpeed: 12, forestCoverage: true, elevation: 20, population: 5000 },
  { id: "micoud", name: "Micoud", lat: 13.8167, lng: -60.9000, rainfall: 200, humidity: 80, windSpeed: 10, forestCoverage: true, elevation: 25, population: 3500 },
  { id: "choiseul", name: "Choiseul", lat: 13.7667, lng: -61.0500, rainfall: 210, humidity: 83, windSpeed: 9, forestCoverage: true, elevation: 30, population: 6000 },
  { id: "laborie", name: "Laborie", lat: 13.7500, lng: -61.0000, rainfall: 190, humidity: 79, windSpeed: 11, forestCoverage: false, elevation: 10, population: 2500 },
  { id: "canaries", name: "Canaries", lat: 13.9000, lng: -61.0667, rainfall: 250, humidity: 87, windSpeed: 7, forestCoverage: true, elevation: 45, population: 2000 },
  { id: "anse-la-raye", name: "Anse La Raye", lat: 13.9500, lng: -61.0333, rainfall: 230, humidity: 84, windSpeed: 9, forestCoverage: true, elevation: 12, population: 3800 },
  { id: "piton-area", name: "Pitons Area", lat: 13.8100, lng: -61.0700, rainfall: 270, humidity: 90, windSpeed: 6, forestCoverage: true, elevation: 60, population: 500 },
  { id: "marigot-bay", name: "Marigot Bay", lat: 13.9600, lng: -61.0233, rainfall: 210, humidity: 82, windSpeed: 10, forestCoverage: true, elevation: 5, population: 1000 },
  { id: "rodney-bay", name: "Rodney Bay", lat: 14.0800, lng: -60.9550, rainfall: 155, humidity: 75, windSpeed: 18, forestCoverage: false, elevation: 4, population: 12000 },
  { id: "fond-st-jacques", name: "Fond St Jacques", lat: 13.8700, lng: -61.0400, rainfall: 260, humidity: 88, windSpeed: 5, forestCoverage: true, elevation: 120, population: 800 },
];

// Calculate sandfly risk score (0-100) based on environmental factors
export function calculateRiskScore(
  rainfall: number,
  humidity: number,
  windSpeed: number,
  hasForest: boolean
): number {
  // Rainfall factor: more rain = more breeding sites (0-30 points)
  const rainfallScore = Math.min(30, (rainfall / 300) * 30);

  // Humidity factor: higher humidity = better for sandflies (0-25 points)
  const humidityScore = Math.min(25, ((humidity - 50) / 50) * 25);

  // Wind factor: less wind = easier for sandflies to fly (0-20 points, inverse)
  const windScore = Math.max(0, 20 - (windSpeed / 25) * 20);

  // Forest factor: forest areas have more organic matter for larvae (0-25 points)
  const forestScore = hasForest ? 25 : 5;

  const total = rainfallScore + humidityScore + windScore + forestScore;
  return Math.round(Math.min(100, Math.max(0, total)));
}

// Get risk level label from score
export function getRiskLevel(score: number): "Low" | "Medium" | "High" | "Critical" {
  if (score < 30) return "Low";
  if (score < 55) return "Medium";
  if (score < 75) return "High";
  return "Critical";
}

// Get risk color class
export function getRiskColor(score: number): string {
  if (score < 30) return "text-risk-low";
  if (score < 55) return "text-risk-medium";
  if (score < 75) return "text-risk-high";
  return "text-risk-critical";
}

export function getRiskBgColor(score: number): string {
  if (score < 30) return "bg-risk-low";
  if (score < 55) return "bg-risk-medium";
  if (score < 75) return "bg-risk-high";
  return "bg-risk-critical";
}

// Weekly sample data for time-series
export const weeklyData = [
  { week: "Week 1", rainfall: 45, humidity: 76, avgRisk: 42 },
  { week: "Week 2", rainfall: 60, humidity: 80, avgRisk: 55 },
  { week: "Week 3", rainfall: 35, humidity: 74, avgRisk: 38 },
  { week: "Week 4", rainfall: 80, humidity: 85, avgRisk: 68 },
  { week: "Week 5", rainfall: 55, humidity: 78, avgRisk: 50 },
  { week: "Week 6", rainfall: 90, humidity: 88, avgRisk: 74 },
  { week: "Week 7", rainfall: 70, humidity: 82, avgRisk: 60 },
  { week: "Week 8", rainfall: 40, humidity: 75, avgRisk: 40 },
];
