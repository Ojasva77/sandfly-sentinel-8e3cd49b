import { motion } from "framer-motion";
import { locations, calculateRiskScore, getRiskLevel, getRiskBgColor, weeklyData } from "@/data/saintLuciaData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

function riskBarColor(score: number) {
  if (score < 30) return "hsl(152,55%,45%)";
  if (score < 55) return "hsl(45,90%,50%)";
  if (score < 75) return "hsl(25,90%,50%)";
  return "hsl(0,72%,51%)";
}

export default function Results() {
  const scored = locations
    .map((loc) => ({
      ...loc,
      risk: calculateRiskScore(loc.rainfall, loc.humidity, loc.windSpeed, loc.forestCoverage),
    }))
    .sort((a, b) => b.risk - a.risk);

  const highRisk = scored.filter((l) => l.risk >= 55);
  const avgRisk = Math.round(scored.reduce((s, l) => s + l.risk, 0) / scored.length);

  const chartData = scored.map((l) => ({ name: l.name, risk: l.risk }));

  return (
    <div className="container py-8 max-w-5xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold mb-2 text-foreground">Results & Findings</h1>
        <p className="text-muted-foreground mb-8">Key insights from sandfly risk analysis across Saint Lucia.</p>
      </motion.div>

      {/* Metrics */}
      <div className="grid sm:grid-cols-3 gap-6 mb-10">
        {[
          { label: "High-Risk Zones", value: highRisk.length, sub: "of 14 locations" },
          { label: "Average Risk Score", value: avgRisk, sub: "across all locations" },
          { label: "Most Dangerous", value: scored[0]?.name, sub: `Score: ${scored[0]?.risk}/100` },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-xl p-6 text-center"
          >
            <p className="text-sm text-muted-foreground mb-1">{m.label}</p>
            <p className="text-3xl font-display font-bold text-primary">{m.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{m.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="glass-card rounded-xl p-6 mb-10">
        <h2 className="font-display text-xl font-semibold mb-4 text-foreground">Risk by Location</h2>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={chartData} margin={{ bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(150,12%,88%)" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" stroke="hsl(160,10%,45%)" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(160,10%,45%)" />
            <Tooltip />
            <Bar dataKey="risk" radius={[4, 4, 0, 0]} name="Risk Score">
              {chartData.map((entry, i) => (
                <Cell key={i} fill={riskBarColor(entry.risk)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Key findings */}
      <div className="glass-card rounded-xl p-8">
        <h2 className="font-display text-xl font-semibold mb-4 text-foreground">Key Findings</h2>
        <ul className="space-y-3 text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-primary font-bold">1.</span>
            <span>Forest areas like <strong className="text-foreground">Pitons, Canaries, and Fond St Jacques</strong> have the highest risk due to organic matter and low wind.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary font-bold">2.</span>
            <span>Windy coastal areas like <strong className="text-foreground">Vieux Fort</strong> have significantly lower risk even with moderate rainfall.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary font-bold">3.</span>
            <span>The combination of <strong className="text-foreground">high rainfall + high humidity + forest + low wind</strong> is the most dangerous condition.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary font-bold">4.</span>
            <span>Tourist areas like <strong className="text-foreground">Rodney Bay</strong> have moderate risk — higher winds provide natural protection.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
