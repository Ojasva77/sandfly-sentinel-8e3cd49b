import { useState, useCallback } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMapEvents, Marker, Popup } from "react-leaflet";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";
import { locations, calculateRiskScore, getRiskLevel, getRiskBgColor } from "@/data/saintLuciaData";
import { useBiteReports } from "@/context/BiteReportContext";
import { TreePine, MapPin, Bug, Droplets, Wind, CloudRain, Trees } from "lucide-react";
import "leaflet/dist/leaflet.css";

// (BiteReport type and demo data now live in BiteReportContext)

// ── Slider ─────────────────────────────────────────────────────────
function RangeSlider({ label, value, onChange, min, max, unit, icon: Icon, color }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; unit: string; icon?: React.ElementType; color?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1 items-center gap-2">
        <span className="text-muted-foreground flex items-center gap-1.5">
          {Icon && <Icon className={`w-4 h-4 ${color || "text-primary"}`} />}
          {label}
        </span>
        <span className="font-bold text-foreground">{value}{unit}</span>
      </div>
      <div className="relative">
        <input
          type="range" min={min} max={max} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-primary h-2"
        />
        {/* Animated fill bar */}
        <motion.div
          className="absolute left-0 top-0 h-2 rounded-full pointer-events-none"
          style={{ background: `hsl(var(--primary))`, opacity: 0.25 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>
    </div>
  );
}

// ── Risk colour ────────────────────────────────────────────────────
function riskHsl(score: number): string {
  const hue = Math.round(120 - (score / 100) * 120);
  return `hsl(${hue}, 80%, 50%)`;
}

// ── Forest polygon data (mock) ─────────────────────────────────────
const forestZones = [
  { lat: 13.87, lng: -61.05, r: 0.035, name: "Soufrière Rainforest" },
  { lat: 13.81, lng: -61.07, r: 0.025, name: "Pitons Reserve" },
  { lat: 13.90, lng: -61.06, r: 0.02, name: "Canaries Forest" },
  { lat: 13.95, lng: -61.03, r: 0.02, name: "Anse La Raye Forest" },
  { lat: 13.82, lng: -60.90, r: 0.025, name: "Micoud Highlands" },
  { lat: 13.77, lng: -61.05, r: 0.018, name: "Choiseul Forest" },
  { lat: 13.87, lng: -61.04, r: 0.022, name: "Fond St Jacques Reserve" },
  { lat: 14.01, lng: -60.95, r: 0.015, name: "Castries Watershed" },
];

// ── Tap-anywhere risk calculation ──────────────────────────────────
function estimatePointRisk(lat: number, lng: number, rainfallMod: number, humidityMod: number) {
  // Find nearest location for base values
  let nearest = locations[0];
  let minDist = Infinity;
  locations.forEach(loc => {
    const d = Math.sqrt((loc.lat - lat) ** 2 + (loc.lng - lng) ** 2);
    if (d < minDist) { minDist = d; nearest = loc; }
  });

  // Check if in forest zone
  const inForest = forestZones.some(z => Math.sqrt((z.lat - lat) ** 2 + (z.lng - lng) ** 2) < z.r);

  // Interpolate values with distance decay
  const decay = Math.max(0, 1 - minDist * 15);
  const rain = Math.max(0, nearest.rainfall * decay + (1 - decay) * 170 + rainfallMod);
  const hum = Math.min(100, Math.max(0, nearest.humidity * decay + (1 - decay) * 75 + humidityMod));
  const wind = nearest.windSpeed * decay + (1 - decay) * 12;

  const risk = calculateRiskScore(rain, hum, wind, inForest);

  const reasons: string[] = [];
  if (hum > 78) reasons.push("🌡️ High humidity helps sandflies survive longer");
  if (wind < 10) reasons.push("💨 Low wind allows sandflies to move easily");
  if (inForest) reasons.push("🌳 Nearby forest provides natural habitat");
  if (rain > 200) reasons.push("🌧️ Heavy rainfall creates more breeding sites");
  if (hum <= 78) reasons.push("💧 Moderate humidity in this area");
  if (wind >= 10 && reasons.length < 3) reasons.push("💨 Some wind helps reduce sandfly activity");

  return { risk, reasons: reasons.slice(0, 3), rain: Math.round(rain), hum: Math.round(hum), wind: Math.round(wind), inForest, nearestName: nearest.name };
}

// ── Red dot icon for bite reports ──────────────────────────────────
const biteIcon = L.divIcon({
  className: "",
  html: `<div style="width:14px;height:14px;background:hsl(0,72%,51%);border:2px solid white;border-radius:50%;box-shadow:0 0 6px rgba(220,38,38,.5)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

// ── Map click handler ──────────────────────────────────────────────
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng.lat, e.latlng.lng) });
  return null;
}

// ── Factor bar ─────────────────────────────────────────────────────
function FactorBar({ label, value, max, icon: Icon, color, isTop }: {
  label: string; value: number; max: number; icon: React.ElementType; color: string; isTop: boolean;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <Icon className={`w-5 h-5 shrink-0 ${color}`} />
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-0.5">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-bold text-foreground">{Math.round(value)}</span>
        </div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${isTop ? "ring-2 ring-offset-1 ring-secondary" : ""}`}
            style={{ background: `hsl(var(${color.replace("text-", "--")}))` }}
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────
export default function RiskMap() {
  const { reports: biteReports, addReport } = useBiteReports();
  const [rainfallMod, setRainfallMod] = useState(0);
  const [humidityMod, setHumidityMod] = useState(0);
  const [showForest, setShowForest] = useState(false);
  const [showBiteForm, setShowBiteForm] = useState(false);
  const [tapResult, setTapResult] = useState<{ lat: number; lng: number; data: ReturnType<typeof estimatePointRisk> } | null>(null);

  // Bite form state
  const [biteLocation, setBiteLocation] = useState("");
  const [biteTime, setBiteTime] = useState("Morning");
  const [biteConditions, setBiteConditions] = useState<string[]>([]);

  const adjustedLocations = locations.map((loc) => {
    const adjRain = Math.max(0, loc.rainfall + rainfallMod);
    const adjHum = Math.min(100, Math.max(0, loc.humidity + humidityMod));
    const risk = calculateRiskScore(adjRain, adjHum, loc.windSpeed, loc.forestCoverage);
    return { ...loc, rainfall: adjRain, humidity: adjHum, risk };
  });

  // Top contributing factor
  const avgRain = adjustedLocations.reduce((s, l) => s + l.rainfall, 0) / adjustedLocations.length;
  const avgHum = adjustedLocations.reduce((s, l) => s + l.humidity, 0) / adjustedLocations.length;
  const avgWind = adjustedLocations.reduce((s, l) => s + l.windSpeed, 0) / adjustedLocations.length;
  const forestCount = adjustedLocations.filter(l => l.forestCoverage).length;

  const factors = [
    { label: "Rainfall", value: (avgRain / 300) * 30, max: 30, icon: CloudRain, color: "text-primary" },
    { label: "Humidity", value: ((avgHum - 50) / 50) * 25, max: 25, icon: Droplets, color: "text-ocean" },
    { label: "Wind (inv)", value: Math.max(0, 20 - (avgWind / 25) * 20), max: 20, icon: Wind, color: "text-secondary" },
    { label: "Forest", value: (forestCount / adjustedLocations.length) * 25, max: 25, icon: Trees, color: "text-accent" },
  ];
  const topFactor = factors.reduce((a, b) => (a.value / a.max > b.value / b.max ? a : b));

  const handleMapClick = useCallback((lat: number, lng: number) => {
    const data = estimatePointRisk(lat, lng, rainfallMod, humidityMod);
    setTapResult({ lat, lng, data });
  }, [rainfallMod, humidityMod]);

  const handleBiteSubmit = () => {
    const loc = locations.find(l => l.id === biteLocation);
    addReport({
      name: "Anonymous",
      location: loc?.name || "Unknown",
      timeOfBite: biteTime,
      bodyPart: "",
      conditions: biteConditions,
      allergies: "",
      notes: "",
      date: new Date().toISOString().split("T")[0],
    });
    setShowBiteForm(false);
    setBiteConditions([]);
  };

  const toggleCondition = (c: string) => {
    setBiteConditions(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  return (
    <div className="container py-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold mb-2 text-foreground">Risk Map Dashboard 🗺️</h1>
        <p className="text-muted-foreground mb-6">
          Click anywhere on the map to check risk. Toggle forest overlay to see habitat zones.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        {/* Map */}
        <div className="rounded-xl overflow-hidden border border-border shadow-card" style={{ height: 540 }}>
          <MapContainer center={[13.9094, -60.9789]} zoom={11} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
            <MapClickHandler onMapClick={handleMapClick} />

            {/* Forest overlay */}
            {showForest && forestZones.map((z, i) => (
              <CircleMarker
                key={`forest-${i}`}
                center={[z.lat, z.lng]}
                radius={z.r * 800}
                pathOptions={{ fillColor: "hsl(145, 55%, 35%)", color: "hsl(145, 55%, 35%)", fillOpacity: 0.3, weight: 1, dashArray: "5,5" }}
              >
                <Tooltip direction="top"><span className="text-xs font-semibold">🌳 {z.name}</span></Tooltip>
              </CircleMarker>
            ))}

            {/* Location risk circles */}
            {adjustedLocations.map((loc) => (
              <CircleMarker
                key={loc.id}
                center={[loc.lat, loc.lng]}
                radius={Math.max(10, loc.risk / 4)}
                pathOptions={{ fillColor: riskHsl(loc.risk), color: riskHsl(loc.risk), fillOpacity: 0.6, weight: 2 }}
              >
                <Tooltip direction="top" sticky>
                  <div className="text-sm">
                    <strong>{loc.name}</strong><br />
                    Risk: <strong>{loc.risk}/100</strong> ({getRiskLevel(loc.risk)})<br />
                    Rain: {loc.rainfall}mm · Humidity: {loc.humidity}%<br />
                    Wind: {loc.windSpeed} km/h · Forest: {loc.forestCoverage ? "Yes" : "No"}
                  </div>
                </Tooltip>
              </CircleMarker>
            ))}

            {/* Bite report markers */}
            {biteReports.map((r) => (
              <Marker key={r.id} position={[r.lat, r.lng]} icon={biteIcon}>
                <Popup>
                  <div className="text-xs min-w-[160px]">
                    <strong className="text-sm">🦟 {r.name || "Anonymous"}</strong>
                    <div style={{ marginTop: 4 }}>
                      {r.bodyPart && <div>🦵 Bitten on: <strong>{r.bodyPart}</strong></div>}
                      <div>🕐 Time: <strong>{r.time}</strong></div>
                      {r.allergies && r.allergies !== "None" && <div>⚠️ Reaction: <strong>{r.allergies}</strong></div>}
                      {r.conditions.length > 0 && <div style={{ marginTop: 3 }}>Conditions: {r.conditions.join(", ")}</div>}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Tap-anywhere marker */}
            {tapResult && (
              <Marker
                position={[tapResult.lat, tapResult.lng]}
                icon={L.divIcon({
                  className: "",
                  html: `<div style="width:18px;height:18px;background:${riskHsl(tapResult.data.risk)};border:3px solid white;border-radius:50%;box-shadow:0 0 10px rgba(0,0,0,.3)"></div>`,
                  iconSize: [18, 18],
                  iconAnchor: [9, 9],
                })}
              >
                <Popup autoPan>
                  <div className="text-sm min-w-[180px]">
                    <div className="font-bold text-base mb-1" style={{ color: riskHsl(tapResult.data.risk) }}>
                      Risk: {tapResult.data.risk}%
                    </div>
                    <div className="text-xs text-gray-500 mb-2">Near {tapResult.data.nearestName}</div>
                    {tapResult.data.reasons.map((r, i) => (
                      <div key={i} className="text-xs mb-0.5">{r}</div>
                    ))}
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        {/* Controls sidebar */}
        <div className="space-y-4">
          {/* Forest toggle */}
          <motion.div layout className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                <TreePine className="w-5 h-5 text-accent" /> Forest Overlay
              </h3>
              <button
                onClick={() => setShowForest(!showForest)}
                className={`relative w-12 h-6 rounded-full transition-colors ${showForest ? "bg-accent" : "bg-muted"}`}
              >
                <motion.div
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-card shadow"
                  animate={{ left: showForest ? 26 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">🌳 Forested areas increase sandfly habitat and risk</p>
          </motion.div>

          {/* Condition sliders */}
          <div className="glass-card rounded-xl p-4">
            <h3 className="font-display font-semibold mb-3 text-foreground">Adjust Conditions</h3>
            <div className="space-y-4">
              <RangeSlider label="Rainfall" value={rainfallMod} onChange={setRainfallMod} min={-100} max={100} unit="mm" icon={CloudRain} color="text-primary" />
              <RangeSlider label="Humidity" value={humidityMod} onChange={setHumidityMod} min={-20} max={20} unit="%" icon={Droplets} color="text-ocean" />
            </div>
          </div>

          {/* Animated factor bars */}
          <div className="glass-card rounded-xl p-4">
            <h3 className="font-display font-semibold mb-3 text-foreground">Factor Breakdown 📊</h3>
            <div className="space-y-3">
              {factors.map(f => (
                <FactorBar key={f.label} {...f} isTop={f.label === topFactor.label} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              ⭐ <strong className="text-foreground">{topFactor.label}</strong> is contributing the most right now
            </p>
          </div>

          {/* Report a Bite */}
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                <Bug className="w-5 h-5 text-destructive" /> Report a Bite
              </h3>
              <button
                onClick={() => setShowBiteForm(!showBiteForm)}
                className="text-xs bg-destructive/10 text-destructive px-3 py-1 rounded-full font-semibold hover:bg-destructive/20 transition-colors"
              >
                {showBiteForm ? "Cancel" : "+ Report"}
              </button>
            </div>

            <AnimatePresence>
              {showBiteForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 pt-2">
                    {/* Location */}
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Location</label>
                      <select
                        value={biteLocation}
                        onChange={e => setBiteLocation(e.target.value)}
                        className="w-full text-sm rounded-lg border border-border bg-card px-3 py-2 text-foreground"
                      >
                        <option value="">Select area...</option>
                        {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                      </select>
                    </div>

                    {/* Time */}
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Time of Bite</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {["Morning", "Afternoon", "Evening", "Night"].map(t => (
                          <button
                            key={t}
                            onClick={() => setBiteTime(t)}
                            className={`text-xs py-1.5 rounded-lg border transition-colors ${biteTime === t ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Conditions */}
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Conditions</label>
                      <div className="flex flex-wrap gap-1.5">
                        {["Humid", "Rainy", "No wind", "Near forest"].map(c => (
                          <button
                            key={c}
                            onClick={() => toggleCondition(c)}
                            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${biteConditions.includes(c) ? "bg-accent text-accent-foreground border-accent" : "border-border text-muted-foreground hover:bg-muted"}`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleBiteSubmit}
                      disabled={!biteLocation}
                      className="w-full text-sm bg-destructive text-destructive-foreground py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
                    >
                      Submit Report 🦟
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-xs text-muted-foreground mt-2">
              {biteReports.length > 0 ? `${biteReports.length} report(s) submitted` : "Community reports help improve risk predictions"}
            </p>
          </div>

          {/* Legend */}
          <div className="glass-card rounded-xl p-4">
            <h3 className="font-display font-semibold mb-2 text-foreground">Risk Legend</h3>
            <div className="risk-gradient-bar mb-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Low (0)</span><span>Medium</span><span>High</span><span>Critical (100)</span>
            </div>
          </div>

          {/* Top risk areas */}
          <div className="glass-card rounded-xl p-4">
            <h3 className="font-display font-semibold mb-2 text-foreground">Highest Risk 🔥</h3>
            <div className="space-y-1.5">
              {[...adjustedLocations].sort((a, b) => b.risk - a.risk).slice(0, 5).map((loc) => (
                <div key={loc.id} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{loc.name}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-primary-foreground ${getRiskBgColor(loc.risk)}`}>
                    {loc.risk}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How Our Risk Model Works */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-12"
      >
        <h2 className="font-display text-2xl font-bold mb-6 text-foreground text-center">
          How Our Risk Model Works 🧠
        </h2>
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { emoji: "🌧️", title: "Rainfall", desc: "More rain creates puddles where sandflies lay eggs", color: "border-primary/30 bg-primary/5" },
            { emoji: "💨", title: "Low Wind", desc: "Sandflies are tiny — calm air lets them fly easily", color: "border-secondary/30 bg-secondary/5" },
            { emoji: "💧", title: "Humidity", desc: "Moist air helps sandflies survive and stay active", color: "border-ocean/30 bg-ocean/5" },
            { emoji: "🌳", title: "Forest", desc: "Trees provide shade, moisture, and organic matter", color: "border-accent/30 bg-accent/5" },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-xl border-2 ${f.color} p-5 text-center`}
            >
              <div className="text-3xl mb-2">{f.emoji}</div>
              <h3 className="font-display font-semibold text-foreground mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Formula card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl p-8 max-w-lg mx-auto text-center"
        >
          <h3 className="font-display text-lg font-semibold mb-4 text-foreground">📊 The Risk Formula</h3>
          <div className="bg-muted/60 rounded-xl p-5 font-mono text-sm leading-loose text-foreground">
            <div className="font-bold text-base mb-2">Risk Score =</div>
            <div><span className="text-primary font-bold">(0.30 × Rainfall)</span></div>
            <div>+ <span className="text-ocean font-bold">(0.25 × Humidity)</span></div>
            <div>− <span className="text-secondary font-bold">(0.20 × Wind Speed)</span></div>
            <div>+ <span className="text-accent font-bold">(0.25 × Forest Proximity)</span></div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Each factor is scored from 0 to its maximum, then all are added up (max 100).
          </p>
        </motion.div>
      </motion.section>
    </div>
  );
}
