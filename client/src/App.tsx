import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import OnboardingPage from "@/pages/onboarding";
import ExplorePage from "@/pages/explore";
import TribesPage from "@/pages/tribes";
import TribeDetailPage from "@/pages/tribe-detail";
import UploadPage from "@/pages/upload";
import ProfilePage from "@/pages/profile";
import SettingsPage from "@/pages/settings";
import RadioPage from "@/pages/radio";
import BestowalPage from "@/pages/bestowal";
import MessagingPage from "@/pages/messaging";
import LibraryPage from "@/pages/library";
import BlueprintsPage from "@/pages/blueprints";

function Router() {
  const { user, isLoading } = useAuth();
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

  useEffect(() => {
    if (user) {
      const accepted = localStorage.getItem(`nigtalk_terms_${user.id}`);
      setHasAcceptedTerms(accepted === "true");
    } else {
      setHasAcceptedTerms(false);
    }
  }, [user]);

  const handleAcceptTerms = () => {
    if (user) {
      localStorage.setItem(`nigtalk_terms_${user.id}`, "true");
      setHasAcceptedTerms(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-primary">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route>{() => { window.location.replace("/"); return null; }}</Route>
      </Switch>
    );
  }

  if (!hasAcceptedTerms) {
    return <OnboardingPage onComplete={handleAcceptTerms} />;
  }

  return (
    <Switch>
      <Route path="/" component={ExplorePage} />
      <Route path="/tribes" component={TribesPage} />
      <Route path="/tribes/:id" component={TribeDetailPage} />
      <Route path="/upload" component={UploadPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/radio" component={RadioPage} />
      <Route path="/bestowal" component={BestowalPage} />
      <Route path="/messages" component={MessagingPage} />
      <Route path="/library" component={LibraryPage} />
      <Route path="/blueprints" component={BlueprintsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
