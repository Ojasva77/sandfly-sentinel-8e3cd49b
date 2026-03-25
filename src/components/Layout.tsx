import { Link, useLocation } from "react-router-dom";
import { Bug, Map, Users, Brain, BarChart3, BookOpen, Menu, X, ClipboardList } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import mssLogo from "@/assets/mss-logo.jpg";

const navItems = [
  { path: "/", label: "Home", icon: Bug },
  { path: "/map", label: "Risk Map", icon: Map },
  { path: "/community", label: "Community", icon: Users },
  { path: "/prediction", label: "AI Prediction", icon: Brain },
  { path: "/results", label: "Results", icon: BarChart3 },
  { path: "/about", label: "About", icon: BookOpen },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top nav */}
      <header className="sticky top-0 z-50 glass-card border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={mssLogo} alt="Micoud Secondary School" className="w-9 h-9 rounded-full object-cover border-2 border-primary" />
            <span className="font-display font-bold text-lg text-foreground tracking-wide">Sandfly Tracker</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-border"
            >
              <div className="container py-2 flex flex-col gap-1">
                {navItems.map((item) => {
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border py-6 bg-muted/30">
        <div className="container flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-muted-foreground">
          <img src={mssLogo} alt="MSS" className="w-7 h-7 rounded-full object-cover" />
          <span>Micoud Secondary School · Sandfly Tracker — National Science Fair 2026 · Saint Lucia 🇱🇨</span>
        </div>
      </footer>
    </div>
  );
}
