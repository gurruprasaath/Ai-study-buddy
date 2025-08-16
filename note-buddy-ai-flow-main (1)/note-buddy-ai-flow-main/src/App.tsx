
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { FileProvider } from "@/contexts/FileProvider";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import Roadmap from "./pages/Roadmap";
import Summarize from "./pages/Summarize";
import TestGenerator from "./pages/TestGenerator";
import TestResults from "./pages/TestResults";
import Resources from "./pages/Resources";
import StudyPlan from "./pages/StudyPlan";
import PomodoroTimer from "./pages/PomodoroTimer";
import EduTube from "./pages/EduTube";
import CodingPractice from "./pages/CodingPractice";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <FileProvider>
      <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/roadmap" element={<Roadmap />} />
                  <Route path="/summarize" element={<Summarize />} />
                  <Route path="/test-generator" element={<TestGenerator />} />
                  <Route path="/test-results" element={<TestResults />} />
                  <Route path="/resources" element={<Resources />} />
                  <Route path="/study-plan" element={<StudyPlan />} />
                  <Route path="/pomodoro" element={<PomodoroTimer />} />
                  <Route path="/edutube" element={<EduTube />} />
                  <Route path="/coding-practice" element={<CodingPractice />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    </FileProvider>
  </ThemeProvider>
);

export default App;
