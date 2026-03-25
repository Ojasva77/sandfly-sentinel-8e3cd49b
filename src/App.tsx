import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BiteReportProvider } from "./context/BiteReportContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import RiskMap from "./pages/RiskMap";
import CommunityTips from "./pages/CommunityTips";
import Prediction from "./pages/Prediction";
import Results from "./pages/Results";
import ReportBite from "./pages/ReportBite";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<RiskMap />} />
            <Route path="/community" element={<CommunityTips />} />
            <Route path="/report" element={<ReportBite />} />
            <Route path="/prediction" element={<Prediction />} />
            <Route path="/results" element={<Results />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
