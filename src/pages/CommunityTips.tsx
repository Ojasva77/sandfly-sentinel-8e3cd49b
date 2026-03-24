import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, Send, Shield, Leaf, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

type TipCategory = "prevention" | "remedy" | "pattern";

interface Tip {
  id: string;
  author: string;
  category: TipCategory;
  text: string;
  votes: number;
  votedByMe: boolean;
  createdAt: Date;
}

const categoryMeta: Record<TipCategory, { label: string; icon: typeof Shield; color: string }> = {
  prevention: { label: "Prevention", icon: Shield, color: "bg-ocean/20 text-ocean" },
  remedy: { label: "Local Remedy", icon: Leaf, color: "bg-palm/20 text-palm" },
  pattern: { label: "Observed Pattern", icon: Eye, color: "bg-sunset/20 text-sunset" },
};

const initialTips: Tip[] = [
  { id: "1", author: "Maria", category: "prevention", text: "Coconut oil mixed with citronella works great as a natural repellent. I apply it before going near the river in the evening.", votes: 12, votedByMe: false, createdAt: new Date("2026-03-20") },
  { id: "2", author: "Jayden", category: "pattern", text: "Sandflies are worst right after the rain stops, especially near Fond St Jacques. Between 5-7pm is the peak time.", votes: 9, votedByMe: false, createdAt: new Date("2026-03-21") },
  { id: "3", author: "Aunty Rose", category: "remedy", text: "Rub the inside of a lime peel on the bite — the sting goes away fast. Also works with aloe vera straight from the plant.", votes: 15, votedByMe: false, createdAt: new Date("2026-03-19") },
  { id: "4", author: "Keon", category: "prevention", text: "Wearing long pants tucked into socks when hiking near forest areas keeps them off your ankles, where they bite most.", votes: 7, votedByMe: false, createdAt: new Date("2026-03-22") },
  { id: "5", author: "Ms. Charles", category: "pattern", text: "I noticed more bites on humid days with no wind at all. The moment breeze picks up, they seem to disappear.", votes: 11, votedByMe: false, createdAt: new Date("2026-03-18") },
];

export default function CommunityTips() {
  const [tips, setTips] = useState<Tip[]>(initialTips);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<TipCategory | "all">("all");
  const [newTip, setNewTip] = useState({ author: "", text: "", category: "prevention" as TipCategory });

  const handleVote = (id: string) => {
    setTips((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, votes: t.votedByMe ? t.votes - 1 : t.votes + 1, votedByMe: !t.votedByMe }
          : t
      )
    );
  };

  const handleSubmit = () => {
    if (!newTip.text.trim() || !newTip.author.trim()) return;
    setTips((prev) => [
      { id: Date.now().toString(), ...newTip, votes: 0, votedByMe: false, createdAt: new Date() },
      ...prev,
    ]);
    setNewTip({ author: "", text: "", category: "prevention" });
    setShowForm(false);
  };

  const filtered = tips
    .filter((t) => filter === "all" || t.category === filter)
    .sort((a, b) => b.votes - a.votes);

  return (
    <div className="container py-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold mb-1 text-foreground">Community Tips 🌴</h1>
        <p className="text-muted-foreground mb-6">
          Share what you know — prevention tips, local remedies, and patterns you've noticed. Together we can outsmart the sandflies!
        </p>
      </motion.div>

      {/* Filter + Add */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {(["all", "prevention", "remedy", "pattern"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              filter === cat
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {cat === "all" ? "All" : categoryMeta[cat].label}
          </button>
        ))}
        <div className="flex-1" />
        <Button onClick={() => setShowForm(!showForm)} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" /> Share a Tip
        </Button>
      </div>

      {/* New Tip Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="glass-card rounded-xl p-5 space-y-4">
              <h3 className="font-display font-semibold text-foreground">Share Your Knowledge</h3>
              <Input
                placeholder="Your name"
                value={newTip.author}
                onChange={(e) => setNewTip({ ...newTip, author: e.target.value })}
              />
              <div className="flex gap-2">
                {(Object.entries(categoryMeta) as [TipCategory, typeof categoryMeta.prevention][]).map(
                  ([key, meta]) => (
                    <button
                      key={key}
                      onClick={() => setNewTip({ ...newTip, category: key })}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                        newTip.category === key ? "bg-primary text-primary-foreground" : meta.color
                      }`}
                    >
                      <meta.icon className="w-3.5 h-3.5" />
                      {meta.label}
                    </button>
                  )
                )}
              </div>
              <Textarea
                placeholder="What's your tip? e.g. 'Coconut oil works as a natural repellent...'"
                value={newTip.text}
                onChange={(e) => setNewTip({ ...newTip, text: e.target.value })}
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button size="sm" className="gap-1.5" onClick={handleSubmit}>
                  <Send className="w-3.5 h-3.5" /> Post Tip
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((tip) => {
            const meta = categoryMeta[tip.category];
            return (
              <motion.div
                key={tip.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card rounded-xl p-4 flex gap-4"
              >
                {/* Vote */}
                <button
                  onClick={() => handleVote(tip.id)}
                  className={`flex flex-col items-center gap-0.5 pt-1 transition-colors ${
                    tip.votedByMe ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ThumbsUp className={`w-5 h-5 ${tip.votedByMe ? "fill-primary" : ""}`} />
                  <span className="text-sm font-bold">{tip.votes}</span>
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${meta.color}`}>
                      <meta.icon className="w-3 h-3" />
                      {meta.label}
                    </span>
                    <span className="text-xs text-muted-foreground">by <strong className="text-foreground">{tip.author}</strong></span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{tip.text}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-8">
        💡 Tips are stored locally for this demo. In a real deployment, they'd sync across the community.
      </p>
    </div>
  );
}
