import { useState } from "react";
import { motion } from "framer-motion";
import { calculateRiskScore, getRiskLevel, getRiskColor, weeklyData } from "@/data/saintLuciaData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

export default function Prediction() {
  const [rain, setRain] = useState(180);
  const [humidity, setHumidity] = useState(78);
  const [wind, setWind] = useState(12);
  const [forest, setForest] = useState(true);

  const score = calculateRiskScore(rain, humidity, wind, forest);
  const level = getRiskLevel(score);

  return (
    <div className="container py-8 max-w-5xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold mb-2 text-foreground">AI / Prediction Explained</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          How does the app predict where sandflies will be? It's simpler than you think!
        </p>
      </motion.div>

      {/* Simple explanation */}
      <div className="glass-card rounded-xl p-8 mb-8">
        <h2 className="font-display text-xl font-semibold mb-4 text-foreground">How the Prediction Works</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          The app looks at <strong className="text-foreground">four things</strong> to decide how likely
          sandflies are in an area:
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {[
            { emoji: "🌧️", label: "Rainfall", desc: "More rain → more puddles → more breeding spots" },
            { emoji: "💧", label: "Humidity", desc: "Moist air helps sandflies survive longer" },
            { emoji: "💨", label: "Wind Speed", desc: "Less wind → easier for sandflies to fly" },
            { emoji: "🌳", label: "Forest Coverage", desc: "Forests have organic matter where larvae grow" },
          ].map((f) => (
            <div key={f.label} className="flex gap-3 p-4 rounded-lg bg-muted/50">
              <span className="text-2xl">{f.emoji}</span>
              <div>
                <p className="font-semibold text-foreground text-sm">{f.label}</p>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground italic">
            "If there is a lot of rain and trees, sandflies like that area more. If it's windy,
            they can't fly well, so the risk goes down."
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Interactive calculator */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="font-display font-semibold mb-5 text-foreground">Try It Yourself</h3>
          <div className="space-y-5">
            {[
              { label: "Rainfall (mm)", value: rain, set: setRain, min: 0, max: 300 },
              { label: "Humidity (%)", value: humidity, set: setHumidity, min: 50, max: 100 },
              { label: "Wind Speed (km/h)", value: wind, set: setWind, min: 0, max: 30 },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-medium text-foreground">{s.value}</span>
                </div>
                <input
                  type="range" min={s.min} max={s.max} value={s.value}
                  onChange={(e) => s.set(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            ))}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={forest}
                onChange={(e) => setForest(e.target.checked)}
                className="w-5 h-5 accent-primary rounded"
              />
              <span className="text-sm text-foreground font-medium">Forest Area</span>
            </label>
          </div>

          {/* Result */}
          <div className="mt-6 p-6 rounded-xl bg-muted/50 text-center">
            <p className="text-sm text-muted-foreground mb-1">Predicted Risk Score</p>
            <p className={`text-5xl font-display font-bold ${getRiskColor(score)}`}>{score}</p>
            <p className={`text-lg font-semibold mt-1 ${getRiskColor(score)}`}>{level} Risk</p>
          </div>
        </div>

        {/* Chart */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="font-display font-semibold mb-5 text-foreground">Risk Over Time (Sample)</h3>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(152, 55%, 28%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(152, 55%, 28%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(150,12%,88%)" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="hsl(160,10%,45%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(160,10%,45%)" />
              <RechartsTooltip />
              <Area type="monotone" dataKey="avgRisk" stroke="hsl(152,55%,28%)" fill="url(#riskGrad)" strokeWidth={2} name="Avg Risk" />
              <Line type="monotone" dataKey="rainfall" stroke="hsl(195,70%,42%)" strokeWidth={2} dot={false} name="Rainfall (mm)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
