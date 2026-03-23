import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";

const GRID_SIZE = 20;
const CELL_SIZE = 24;

// Generate initial grid with some forest cells
function createInitialGrid(): number[][] {
  const grid: number[][] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    const row: number[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      // Create forest patches (higher base risk)
      const isForest =
        (x > 3 && x < 8 && y > 2 && y < 7) ||
        (x > 12 && x < 17 && y > 10 && y < 16) ||
        (x > 6 && x < 11 && y > 13 && y < 18);
      row.push(isForest ? 30 : 5);
    }
    grid.push(row);
  }
  return grid;
}

function cellColor(value: number): string {
  if (value < 20) return "hsl(140, 60%, 45%)";
  if (value < 40) return "hsl(80, 60%, 50%)";
  if (value < 60) return "hsl(50, 80%, 50%)";
  if (value < 80) return "hsl(25, 85%, 50%)";
  return "hsl(0, 70%, 50%)";
}

export default function Simulation() {
  const [rainfall, setRainfall] = useState(50);
  const [windSpeed, setWindSpeed] = useState(10);
  const [temperature, setTemperature] = useState(28);
  const [grid, setGrid] = useState(createInitialGrid);
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const simulate = useCallback(() => {
    setGrid((prev) => {
      const next = prev.map((row) => [...row]);
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          let val = prev[y][x];

          // Rainfall increases risk
          const rainFactor = (rainfall / 100) * 3;
          val += rainFactor;

          // Temperature: optimal around 28-32
          const tempFactor = temperature >= 26 && temperature <= 34 ? 1.5 : 0.5;
          val *= tempFactor > 1 ? 1.02 : 0.98;

          // Wind spreads risk from neighbors
          const windDir = windSpeed > 15 ? 1 : 0;
          if (x > 0) val += prev[y][x - 1] * 0.02 * (1 + windDir);
          if (x < GRID_SIZE - 1) val += prev[y][x + 1] * 0.02;
          if (y > 0) val += prev[y - 1][x] * 0.02;
          if (y < GRID_SIZE - 1) val += prev[y + 1][x] * 0.02 * (1 + windDir);

          // High wind reduces local concentration
          if (windSpeed > 20) val *= 0.95;

          next[y][x] = Math.min(100, Math.max(0, val));
        }
      }
      return next;
    });
    setStep((s) => s + 1);
  }, [rainfall, windSpeed, temperature]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(simulate, 200);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, simulate]);

  const reset = () => {
    setRunning(false);
    setGrid(createInitialGrid());
    setStep(0);
  };

  return (
    <div className="container py-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold mb-2 text-foreground">Digital Twin Simulation</h1>
        <p className="text-muted-foreground mb-6">
          Watch how sandflies spread across a grid based on environmental conditions. Adjust the sliders and hit Play.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        {/* Grid */}
        <div className="glass-card rounded-xl p-6 overflow-auto">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setRunning(!running)}
              className="px-5 py-2 rounded-lg font-semibold text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              {running ? "Pause" : "Play"}
            </button>
            <button
              onClick={reset}
              className="px-5 py-2 rounded-lg font-semibold text-sm bg-muted text-foreground hover:bg-muted/80 transition-colors"
            >
              Reset
            </button>
            <span className="text-sm text-muted-foreground">Step: {step}</span>
          </div>

          <div
            className="inline-grid gap-px bg-border rounded-lg overflow-hidden"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
            }}
          >
            {grid.flat().map((val, i) => (
              <div
                key={i}
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  backgroundColor: cellColor(val),
                  transition: "background-color 0.15s",
                }}
                title={`Risk: ${Math.round(val)}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(140,60%,45%)" }} />
              <span className="text-xs text-muted-foreground">Low</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(50,80%,50%)" }} />
              <span className="text-xs text-muted-foreground">Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(0,70%,50%)" }} />
              <span className="text-xs text-muted-foreground">High</span>
            </div>
            <span className="text-xs text-muted-foreground ml-2">Dark green patches = forest areas (higher base risk)</span>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-display font-semibold mb-4 text-foreground">Environment Controls</h3>
            <div className="space-y-5">
              {[
                { label: "Rainfall", value: rainfall, set: setRainfall, min: 0, max: 100, unit: "mm" },
                { label: "Wind Speed", value: windSpeed, set: setWindSpeed, min: 0, max: 30, unit: "km/h" },
                { label: "Temperature", value: temperature, set: setTemperature, min: 20, max: 38, unit: "°C" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-medium text-foreground">{s.value}{s.unit}</span>
                  </div>
                  <input
                    type="range"
                    min={s.min}
                    max={s.max}
                    value={s.value}
                    onChange={(e) => s.set(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-xl p-5">
            <h3 className="font-display font-semibold mb-2 text-foreground">How It Works</h3>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
              <li>More <strong className="text-foreground">rainfall</strong> = more breeding sites → risk grows</li>
              <li><strong className="text-foreground">Forest</strong> areas (dark patches) start with higher risk</li>
              <li><strong className="text-foreground">Wind</strong> spreads risk to neighboring cells</li>
              <li>Optimal <strong className="text-foreground">temperature</strong> (26–34°C) accelerates growth</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
