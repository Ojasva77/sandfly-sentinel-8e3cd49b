import { createContext, useContext, useState, ReactNode } from "react";
import { locations } from "@/data/saintLuciaData";

export interface SharedBiteReport {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  timeOfBite: string;
  bodyPart: string;
  conditions: string[];
  allergies: string;
  notes: string;
  date: string;
}

// Seed with demo data mapped to real coordinates
const demoReports: SharedBiteReport[] = [
  { id: "d1", name: "Maria J.", location: "Soufrière", lat: 13.859, lng: -61.059, timeOfBite: "Evening (4pm–7pm)", bodyPart: "Ankles", conditions: ["Humid", "No wind", "Near forest"], allergies: "Mild swelling", notes: "Was near the river, sandflies were very active after rain stopped.", date: "2026-03-20" },
  { id: "d2", name: "Keon B.", location: "Micoud", lat: 13.824, lng: -60.903, timeOfBite: "Afternoon (12pm–4pm)", bodyPart: "Arms", conditions: ["Humid", "Standing water nearby"], allergies: "None", notes: "Playing football near the field with puddles from last night's rain.", date: "2026-03-22" },
  { id: "d3", name: "Aunty Rose", location: "Fond St Jacques", lat: 13.868, lng: -61.039, timeOfBite: "Evening (4pm–7pm)", bodyPart: "Legs", conditions: ["No wind", "Near forest", "Humid"], allergies: "Itchy rash for 2 days", notes: "Sitting outside without repellent. The bites were worst on exposed skin.", date: "2026-03-18" },
  { id: "d4", name: "Jason T.", location: "Castries", lat: 14.012, lng: -60.991, timeOfBite: "Morning (6am–12pm)", bodyPart: "Neck", conditions: ["Rainy", "Humid"], allergies: "", notes: "", date: "2026-03-23" },
  { id: "d5", name: "Ms. Charles", location: "Choiseul", lat: 13.773, lng: -61.048, timeOfBite: "Night (7pm–6am)", bodyPart: "Legs", conditions: ["No wind", "Near forest"], allergies: "Swelling", notes: "", date: "2026-03-21" },
];

interface BiteReportContextType {
  reports: SharedBiteReport[];
  addReport: (report: Omit<SharedBiteReport, "id" | "lat" | "lng">) => void;
}

const BiteReportContext = createContext<BiteReportContextType | null>(null);

export function BiteReportProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<SharedBiteReport[]>(demoReports);

  const addReport = (report: Omit<SharedBiteReport, "id" | "lat" | "lng">) => {
    const loc = locations.find(l => l.name === report.location);
    const lat = loc ? loc.lat + (Math.random() - 0.5) * 0.01 : 13.9 + (Math.random() - 0.5) * 0.05;
    const lng = loc ? loc.lng + (Math.random() - 0.5) * 0.01 : -61.0 + (Math.random() - 0.5) * 0.05;

    setReports(prev => [{
      ...report,
      id: Date.now().toString(),
      lat,
      lng,
    }, ...prev]);
  };

  return (
    <BiteReportContext.Provider value={{ reports, addReport }}>
      {children}
    </BiteReportContext.Provider>
  );
}

export function useBiteReports() {
  const ctx = useContext(BiteReportContext);
  if (!ctx) throw new Error("useBiteReports must be used within BiteReportProvider");
  return ctx;
}
