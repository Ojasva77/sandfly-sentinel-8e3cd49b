import { useState } from "react";
import { motion } from "framer-motion";
import { calculateRiskScore, getRiskLevel, getRiskColor, weeklyData } from "@/data/saintLuciaData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Loader2, ShieldAlert, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface BiteResult {
  score: number;
  explanation: string;
  tips: string[];
}

export default function Prediction() {
  const [rain, setRain] = useState(180);
  const [humidity, setHumidity] = useState(78);
  const [wind, setWind] = useState(12);
  const [forest, setForest] = useState(true);

  // Personal bite risk
  const [skinType, setSkinType] = useState("medium");
  const [bodyTemp, setBodyTemp] = useState(37);
  const [bloodType, setBloodType] = useState("O");
  const [timeOfDay, setTimeOfDay] = useState("dusk");
  const [activity, setActivity] = useState("moderate");
  const [sweating, setSweating] = useState("moderate");
  const [biteResult, setBiteResult] = useState<BiteResult | null>(null);
  const [loading, setLoading] = useState(false);

  const score = calculateRiskScore(rain, humidity, wind, forest);
  const level = getRiskLevel(score);

  const predictBiteRisk = async () => {
    setLoading(true);
    setBiteResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("bite-prediction", {
        body: { skinType, bodyTemp, bloodType, timeOfDay, activity, sweating },
      });
      if (error) throw error;
      setBiteResult(data);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to get prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 max-w-5xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold mb-2 text-foreground">AI Prediction 🤖</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          Predict sandfly risk by area <em>and</em> find out your personal bite risk using AI!
        </p>
      </motion.div>

      {/* Personal Bite Risk - AI Powered */}
      <div className="glass-card rounded-2xl p-8 mb-10 border-2 border-primary/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">Personal Bite Risk Predictor</h2>
            <p className="text-sm text-muted-foreground">AI analyzes why sandflies might target YOU</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Skin Type */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">🧴 Skin Type</label>
            <select value={skinType} onChange={(e) => setSkinType(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary">
              <option value="fair">Fair / Light</option>
              <option value="medium">Medium</option>
              <option value="olive">Olive</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          {/* Body Temp */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">🌡️ Body Temperature</label>
            <div className="flex items-center gap-2">
              <input type="range" min={35} max={39} step={0.1} value={bodyTemp}
                onChange={(e) => setBodyTemp(Number(e.target.value))}
                className="flex-1 accent-primary" />
              <span className="text-sm font-bold text-foreground w-14 text-right">{bodyTemp}°C</span>
            </div>
          </div>

          {/* Blood Type */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">🩸 Blood Type</label>
            <select value={bloodType} onChange={(e) => setBloodType(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary">
              <option value="O">Type O</option>
              <option value="A">Type A</option>
              <option value="B">Type B</option>
              <option value="AB">Type AB</option>
            </select>
          </div>

          {/* Time of Day */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">🕐 Time Outdoors</label>
            <select value={timeOfDay} onChange={(e) => setTimeOfDay(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary">
              <option value="morning">Morning (6am-10am)</option>
              <option value="midday">Midday (10am-2pm)</option>
              <option value="afternoon">Afternoon (2pm-5pm)</option>
              <option value="dusk">Dusk (5pm-7pm)</option>
              <option value="night">Night (7pm+)</option>
            </select>
          </div>

          {/* Activity */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">🏃 Activity Level</label>
            <select value={activity} onChange={(e) => setActivity(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary">
              <option value="resting">Resting / Sitting</option>
              <option value="moderate">Moderate (Walking)</option>
              <option value="intense">Intense (Running/Sports)</option>
            </select>
          </div>

          {/* Sweating */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">💦 Sweating Level</label>
            <select value={sweating} onChange={(e) => setSweating(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary">
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="heavy">Heavy</option>
            </select>
          </div>
        </div>

        <button
          onClick={predictBiteRisk}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-card"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
          {loading ? "Analyzing..." : "Predict My Bite Risk"}
        </button>

        {/* AI Result */}
        {biteResult && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl bg-muted/50 border border-border p-6"
          >
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="text-center sm:min-w-[120px]">
                <p className="text-sm text-muted-foreground mb-1">Your Bite Risk</p>
                <p className={`text-5xl font-display font-bold ${getRiskColor(biteResult.score)}`}>{biteResult.score}</p>
                <p className={`text-sm font-bold mt-1 ${getRiskColor(biteResult.score)}`}>{getRiskLevel(biteResult.score)}</p>
              </div>
              <div className="flex-1">
                <p className="text-muted-foreground mb-4 leading-relaxed">{biteResult.explanation}</p>
                <div>
                  <p className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-primary" /> Protection Tips:
                  </p>
                  <ul className="space-y-1.5">
                    {biteResult.tips.map((tip, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-secondary font-bold">{i + 1}.</span> {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Simple explanation */}
      <div className="glass-card rounded-2xl p-8 mb-8">
        <h2 className="font-display text-xl font-semibold mb-4 text-foreground">How Area Prediction Works 🌧️</h2>
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
            <div key={f.label} className="flex gap-3 p-4 rounded-xl bg-muted/50">
              <span className="text-2xl">{f.emoji}</span>
              <div>
                <p className="font-bold text-foreground text-sm">{f.label}</p>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-muted/50 rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground italic">
            "If there is a lot of rain and trees, sandflies like that area more. If it's windy,
            they can't fly well, so the risk goes down."
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Interactive calculator */}
        <div className="glass-card rounded-2xl p-6">
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
                  <span className="font-bold text-foreground">{s.value}</span>
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
              <span className="text-sm text-foreground font-bold">Forest Area</span>
            </label>
          </div>

          {/* Result */}
          <div className="mt-6 p-6 rounded-2xl bg-muted/50 text-center">
            <p className="text-sm text-muted-foreground mb-1">Predicted Area Risk Score</p>
            <p className={`text-5xl font-display font-bold ${getRiskColor(score)}`}>{score}</p>
            <p className={`text-lg font-bold mt-1 ${getRiskColor(score)}`}>{level} Risk</p>
          </div>
        </div>

        {/* Chart */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-display font-semibold mb-5 text-foreground">Risk Over Time (Sample)</h3>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(187, 70%, 38%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(187, 70%, 38%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,18%,86%)" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="hsl(200,10%,42%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(200,10%,42%)" />
              <RechartsTooltip />
              <Area type="monotone" dataKey="avgRisk" stroke="hsl(187,70%,38%)" fill="url(#riskGrad)" strokeWidth={2} name="Avg Risk" />
              <Line type="monotone" dataKey="rainfall" stroke="hsl(35,85%,55%)" strokeWidth={2} dot={false} name="Rainfall (mm)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
