import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import { motion } from "framer-motion";
import { locations, calculateRiskScore, getRiskLevel, getRiskBgColor } from "@/data/saintLuciaData";
import "leaflet/dist/leaflet.css";

// Slider component
function RangeSlider({ label, value, onChange, min, max, unit }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; unit: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );
}

function riskHsl(score: number): string {
  // Green(120) -> Yellow(60) -> Red(0)
  const hue = Math.round(120 - (score / 100) * 120);
  return `hsl(${hue}, 80%, 50%)`;
}

export default function RiskMap() {
  const [rainfallMod, setRainfallMod] = useState(0);
  const [humidityMod, setHumidityMod] = useState(0);

  const adjustedLocations = locations.map((loc) => {
    const adjRain = Math.max(0, loc.rainfall + rainfallMod);
    const adjHum = Math.min(100, Math.max(0, loc.humidity + humidityMod));
    const risk = calculateRiskScore(adjRain, adjHum, loc.windSpeed, loc.forestCoverage);
    return { ...loc, rainfall: adjRain, humidity: adjHum, risk };
  });

  return (
    <div className="container py-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold mb-2 text-foreground">Risk Map Dashboard</h1>
        <p className="text-muted-foreground mb-6">
          Interactive map of Saint Lucia showing sandfly risk zones. Click on a location for details.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Map */}
        <div className="rounded-xl overflow-hidden border border-border shadow-card" style={{ height: 520 }}>
          <MapContainer
            center={[13.9094, -60.9789]}
            zoom={11}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />
            {adjustedLocations.map((loc) => (
              <CircleMarker
                key={loc.id}
                center={[loc.lat, loc.lng]}
                radius={Math.max(10, loc.risk / 4)}
                pathOptions={{
                  fillColor: riskHsl(loc.risk),
                  color: riskHsl(loc.risk),
                  fillOpacity: 0.6,
                  weight: 2,
                }}
              >
                <Tooltip direction="top" sticky>
                  <div className="text-sm">
                    <strong>{loc.name}</strong><br />
                    Risk: <strong>{loc.risk}/100</strong> ({getRiskLevel(loc.risk)})<br />
                    Rain: {loc.rainfall}mm · Humidity: {loc.humidity}%<br />
                    Wind: {loc.windSpeed} km/h<br />
                    Forest: {loc.forestCoverage ? "Yes" : "No"}
                  </div>
                </Tooltip>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        {/* Controls sidebar */}
        <div className="space-y-6">
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-display font-semibold mb-4 text-foreground">Adjust Conditions</h3>
            <div className="space-y-4">
              <RangeSlider
                label="Rainfall Modifier"
                value={rainfallMod}
                onChange={setRainfallMod}
                min={-100}
                max={100}
                unit="mm"
              />
              <RangeSlider
                label="Humidity Modifier"
                value={humidityMod}
                onChange={setHumidityMod}
                min={-20}
                max={20}
                unit="%"
              />
            </div>
          </div>

          {/* Legend */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-display font-semibold mb-3 text-foreground">Risk Legend</h3>
            <div className="risk-gradient-bar mb-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Low (0)</span><span>Medium</span><span>High</span><span>Critical (100)</span>
            </div>
          </div>

          {/* Top risk list */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-display font-semibold mb-3 text-foreground">Highest Risk Areas</h3>
            <div className="space-y-2">
              {[...adjustedLocations]
                .sort((a, b) => b.risk - a.risk)
                .slice(0, 5)
                .map((loc) => (
                  <div key={loc.id} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{loc.name}</span>
                    <span className={`text-sm font-bold px-2 py-0.5 rounded-full text-primary-foreground ${getRiskBgColor(loc.risk)}`}>
                      {loc.risk}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
