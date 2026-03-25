import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bug, MapPin, Clock, Cloud, AlertTriangle, Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { locations } from "@/data/saintLuciaData";
import { useBiteReports } from "@/context/BiteReportContext";

const timeOptions = ["Morning (6am–12pm)", "Afternoon (12pm–4pm)", "Evening (4pm–7pm)", "Night (7pm–6am)"];
const conditionOptions = ["Humid", "Rainy", "No wind", "Near forest", "Standing water nearby", "Cloudy"];
const bodyParts = ["Ankles", "Legs", "Arms", "Hands", "Face", "Neck", "Back", "Other"];

export default function ReportBite() {
  const { reports: records, addReport } = useBiteReports();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", location: "", timeOfBite: timeOptions[0], date: new Date().toISOString().split("T")[0],
    bodyPart: "", conditions: [] as string[], allergies: "", notes: "",
  });

  const toggleCondition = (c: string) => {
    setForm(prev => ({
      ...prev,
      conditions: prev.conditions.includes(c) ? prev.conditions.filter(x => x !== c) : [...prev.conditions, c],
    }));
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.location) return;
    addReport(form);
    setForm({ name: "", location: "", timeOfBite: timeOptions[0], date: new Date().toISOString().split("T")[0], bodyPart: "", conditions: [], allergies: "", notes: "" });
    setShowForm(false);
  };

  return (
    <div className="container py-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold mb-1 text-foreground">Report a Bite 🦟</h1>
        <p className="text-muted-foreground mb-2">
          Help the community by sharing where and when you were bitten. Every report improves our risk predictions!
        </p>
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent-foreground px-4 py-2 rounded-full text-sm font-semibold mb-6">
          <AlertTriangle className="w-4 h-4 text-accent" />
          Community reports help improve risk predictions
        </div>
      </motion.div>

      {/* Add Report Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-lg font-semibold text-foreground">
          {records.length} Report{records.length !== 1 ? "s" : ""} Submitted
        </h2>
        <Button onClick={() => setShowForm(!showForm)} className="gap-1.5">
          <Plus className="w-4 h-4" /> {showForm ? "Cancel" : "Report a Bite"}
        </Button>
      </div>

      {/* Report Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="glass-card rounded-xl p-6 space-y-5">
              <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                <Bug className="w-5 h-5 text-destructive" /> New Bite Report
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Your Name</label>
                  <Input placeholder="e.g. Maria" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>

                {/* Date */}
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Date of Bite</label>
                  <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>

                {/* Location */}
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    <MapPin className="w-3.5 h-3.5 inline mr-1" /> Location / Area
                  </label>
                  <div className="relative">
                    <select
                      value={form.location}
                      onChange={e => setForm({ ...form, location: e.target.value })}
                      className="w-full text-sm rounded-md border border-input bg-background px-3 py-2 text-foreground appearance-none"
                    >
                      <option value="">Select area...</option>
                      {locations.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Body Part */}
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Where on Body?</label>
                  <div className="flex flex-wrap gap-1.5">
                    {bodyParts.map(bp => (
                      <button
                        key={bp}
                        onClick={() => setForm({ ...form, bodyPart: bp })}
                        className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors ${
                          form.bodyPart === bp
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {bp}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Time of Bite */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  <Clock className="w-3.5 h-3.5 inline mr-1" /> Time of Bite
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {timeOptions.map(t => (
                    <button
                      key={t}
                      onClick={() => setForm({ ...form, timeOfBite: t })}
                      className={`text-xs py-2 rounded-lg border transition-colors ${
                        form.timeOfBite === t
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditions */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  <Cloud className="w-3.5 h-3.5 inline mr-1" /> Conditions at the Time
                </label>
                <div className="flex flex-wrap gap-2">
                  {conditionOptions.map(c => (
                    <button
                      key={c}
                      onClick={() => toggleCondition(c)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        form.conditions.includes(c)
                          ? "bg-accent text-accent-foreground border-accent"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Allergies */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Any Allergic Reactions?</label>
                <Input
                  placeholder="e.g. Mild swelling, itchy rash, none"
                  value={form.allergies}
                  onChange={e => setForm({ ...form, allergies: e.target.value })}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Additional Notes</label>
                <Textarea
                  placeholder="Anything else? e.g. 'Was near standing water, no repellent applied...'"
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={!form.name.trim() || !form.location} className="gap-1.5">
                  <Bug className="w-4 h-4" /> Submit Report
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Records */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {records.map((rec) => (
            <motion.div
              key={rec.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card rounded-xl p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                    <Bug className="w-4 h-4 text-destructive" />
                    {rec.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(rec.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <span className="text-xs bg-destructive/10 text-destructive px-3 py-1 rounded-full font-semibold">
                  🦟 Bite Report
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span className="text-muted-foreground">Area:</span>
                  <span className="font-semibold text-foreground">{rec.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-semibold text-foreground">{rec.timeOfBite}</span>
                </div>
                {rec.bodyPart && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">🦵 Body part:</span>
                    <span className="font-semibold text-foreground">{rec.bodyPart}</span>
                  </div>
                )}
                {rec.allergies && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-sunset" />
                    <span className="text-muted-foreground">Reaction:</span>
                    <span className="font-semibold text-foreground">{rec.allergies}</span>
                  </div>
                )}
              </div>

              {rec.conditions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {rec.conditions.map(c => (
                    <span key={c} className="text-xs bg-ocean/10 text-ocean px-2.5 py-1 rounded-full font-semibold">
                      {c}
                    </span>
                  ))}
                </div>
              )}

              {rec.notes && (
                <p className="text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3">
                  "{rec.notes}"
                </p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-8">
        💡 Reports are stored locally for this demo. In a real deployment, they'd sync to improve community predictions.
      </p>
    </div>
  );
}
