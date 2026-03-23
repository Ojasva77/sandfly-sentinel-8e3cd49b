import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Map, FlaskConical, Brain, AlertTriangle, Palmtree, Heart } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="hero-gradient text-primary-foreground py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 20% 80%, hsl(152 55% 60%) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(195 70% 60%) 0%, transparent 50%)"
        }} />
        <div className="container relative z-10 text-center max-w-3xl mx-auto">
          <motion.h1
            {...fadeUp}
            className="font-display text-4xl md:text-6xl font-bold mb-6"
          >
            Sandfly Tracker
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-lg md:text-xl opacity-90 mb-10 leading-relaxed"
          >
            An interactive tool that maps sandfly risk zones across Saint Lucia
            using rainfall, humidity, wind, and forest data.
          </motion.p>
          <motion.div {...fadeUp} transition={{ delay: 0.3, duration: 0.5 }} className="flex flex-wrap justify-center gap-4">
            <Link
              to="/map"
              className="inline-flex items-center gap-2 bg-primary-foreground text-primary px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              <Map className="w-5 h-5" /> Explore the Map
            </Link>
            <Link
              to="/simulation"
              className="inline-flex items-center gap-2 border-2 border-primary-foreground/40 px-6 py-3 rounded-lg font-semibold hover:bg-primary-foreground/10 transition-colors"
            >
              <FlaskConical className="w-5 h-5" /> Try Simulation
            </Link>
          </motion.div>
        </div>
      </section>

      {/* What are sandflies */}
      <section className="py-20 bg-background">
        <div className="container max-w-4xl">
          <motion.div {...fadeUp} viewport={{ once: true }} whileInView="animate" initial="initial">
            <h2 className="font-display text-3xl font-bold mb-4 text-foreground">What Are Sandflies?</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Sandflies are tiny biting insects found in tropical regions. In Saint Lucia, they thrive near
              beaches, forests, and areas with standing water. Their bites cause painful welts and can
              spread diseases like <strong className="text-foreground">Leishmaniasis</strong>.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              They breed in moist, organic-rich soil — especially after heavy rain. Understanding where
              they're most likely to appear helps protect communities and visitors.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why it matters */}
      <section className="py-20 bg-muted/50">
        <div className="container max-w-5xl">
          <h2 className="font-display text-3xl font-bold mb-12 text-center text-foreground">Why This Matters</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: "Health Risks",
                desc: "Sandfly bites cause itchy welts and can transmit diseases. Knowing high-risk zones helps people stay safe.",
                color: "text-danger",
              },
              {
                icon: Palmtree,
                title: "Tourism Impact",
                desc: "Saint Lucia's economy relies on tourism. Sandfly outbreaks near resorts can hurt the industry and visitor experience.",
                color: "text-secondary",
              },
              {
                icon: AlertTriangle,
                title: "Climate Change",
                desc: "Rising temperatures and changing rainfall patterns may expand sandfly habitats to new areas across the island.",
                color: "text-warning",
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="glass-card rounded-xl p-8"
              >
                <card.icon className={`w-10 h-10 ${card.color} mb-4`} />
                <h3 className="font-display text-xl font-semibold mb-2 text-foreground">{card.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="py-20 bg-background">
        <div className="container max-w-4xl text-center">
          <h2 className="font-display text-3xl font-bold mb-4 text-foreground">Explore the Project</h2>
          <p className="text-muted-foreground mb-10 text-lg">Dive into each feature of the Sandfly Tracker.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { to: "/map", icon: Map, label: "Risk Map" },
              { to: "/simulation", icon: FlaskConical, label: "Simulation" },
              { to: "/prediction", icon: Brain, label: "AI Prediction" },
              { to: "/about", icon: AlertTriangle, label: "About" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="glass-card rounded-xl p-6 hover:shadow-elevated transition-shadow flex flex-col items-center gap-3"
              >
                <item.icon className="w-8 h-8 text-primary" />
                <span className="font-display font-semibold text-foreground">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
