import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="container py-8 max-w-3xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold mb-2 text-foreground">About This Project</h1>
        <p className="text-muted-foreground mb-10 text-lg">
          Everything you need to know about how Sandfly Tracker works — written for students, teachers, and judges.
        </p>
      </motion.div>

      <div className="space-y-10">
        {/* Data Sources */}
        <section className="glass-card rounded-xl p-8">
          <h2 className="font-display text-xl font-semibold mb-4 text-foreground">📊 Data Used</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li><strong className="text-foreground">Weather Data:</strong> Realistic sample data based on typical Saint Lucia climate — rainfall (mm/month), humidity (%), and wind speed (km/h) for 14 locations.</li>
            <li><strong className="text-foreground">Forest Coverage:</strong> Identified from known forested areas on the island, including rainforest reserves and mountainous regions.</li>
            <li><strong className="text-foreground">Location Coordinates:</strong> Real GPS coordinates for towns and natural landmarks across Saint Lucia.</li>
          </ul>
        </section>

        {/* How risk is calculated */}
        <section className="glass-card rounded-xl p-8">
          <h2 className="font-display text-xl font-semibold mb-4 text-foreground">🧮 How Risk Is Calculated</h2>
          <p className="text-muted-foreground mb-4">
            Each location gets a score from 0 to 100, based on four factors:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-foreground">Factor</th>
                  <th className="text-left py-2 text-foreground">Max Points</th>
                  <th className="text-left py-2 text-foreground">Logic</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border">
                  <td className="py-2">🌧️ Rainfall</td><td>30</td><td>More rain = more points</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2">💧 Humidity</td><td>25</td><td>Higher humidity = more points</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2">💨 Wind Speed</td><td>20</td><td>Less wind = more points (inverse)</td>
                </tr>
                <tr>
                  <td className="py-2">🌳 Forest</td><td>25</td><td>Forest areas get 25 pts; open areas get 5</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-muted-foreground mt-4 text-sm">
            <strong className="text-foreground">Total = Rainfall + Humidity + Wind + Forest</strong> (capped at 100)
          </p>
        </section>

        {/* How simulation works */}
        <section className="glass-card rounded-xl p-8">
          <h2 className="font-display text-xl font-semibold mb-4 text-foreground">🧪 How the Simulation Works</h2>
          <p className="text-muted-foreground mb-3">
            The simulation uses a simple grid system:
          </p>
          <ul className="space-y-2 text-muted-foreground list-disc pl-5">
            <li>A 20×20 grid represents a small area of land</li>
            <li>Each cell has a risk value that changes over time</li>
            <li>Forest cells start with higher risk (30 vs 5)</li>
            <li>Each step: rainfall adds risk, wind spreads risk to neighbors, temperature affects growth rate</li>
            <li>Colors update from green (safe) to red (danger) in real-time</li>
          </ul>
        </section>

        {/* Tools used */}
        <section className="glass-card rounded-xl p-8">
          <h2 className="font-display text-xl font-semibold mb-4 text-foreground">🛠️ Tools & Technologies</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
            <div className="p-3 rounded-lg bg-muted/50"><strong className="text-foreground">React</strong> — User interface framework</div>
            <div className="p-3 rounded-lg bg-muted/50"><strong className="text-foreground">TypeScript</strong> — Type-safe code</div>
            <div className="p-3 rounded-lg bg-muted/50"><strong className="text-foreground">Leaflet</strong> — Interactive maps (free)</div>
            <div className="p-3 rounded-lg bg-muted/50"><strong className="text-foreground">Recharts</strong> — Data charts</div>
            <div className="p-3 rounded-lg bg-muted/50"><strong className="text-foreground">Tailwind CSS</strong> — Styling</div>
            <div className="p-3 rounded-lg bg-muted/50"><strong className="text-foreground">Framer Motion</strong> — Animations</div>
          </div>
        </section>

        {/* Credits */}
        <section className="glass-card rounded-xl p-8">
          <h2 className="font-display text-xl font-semibold mb-4 text-foreground">🎓 Project Info</h2>
          <p className="text-muted-foreground">
            This project was built for the <strong className="text-foreground">National Science Fair 2026</strong> in Saint Lucia.
            It demonstrates how technology and environmental science can work together to predict
            and visualize pest risk zones — helping communities make better decisions.
          </p>
        </section>
      </div>
    </div>
  );
}
