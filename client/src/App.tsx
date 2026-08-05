import { useState, useEffect, useCallback } from "react";
import { Switch, Route, Redirect } from "wouter";
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
import BestowalPage from "@/pages/bestowal";
import MessagingPage from "@/pages/messaging";
import LibraryPage from "@/pages/library";
import BlueprintsPage from "@/pages/blueprints";
import GovernancePage from "@/pages/governance";

const LS_KEY = (id: string) => `nigtalk_terms_${id}`;

function Router() {
  const { user, isLoading } = useAuth();
  // null = unknown (checking), true = accepted, false = not accepted
  const [termsState, setTermsState] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) { setTermsState(false); return; }

    // Fast-path: localStorage already confirmed acceptance
    if (localStorage.getItem(LS_KEY(user.id)) === "true") {
      setTermsState(true);
      return;
    }

    // Fallback: check server (covers cleared storage / new devices)
    fetch("/api/onboarding/status", { credentials: "include" })
      .then(r => r.json())
      .then(({ accepted }: { accepted: boolean }) => {
        if (accepted) localStorage.setItem(LS_KEY(user.id), "true");
        setTermsState(accepted);
      })
      .catch(() => setTermsState(false));
  }, [user]);

  const [acceptError, setAcceptError] = useState<string | null>(null);

  const handleAcceptTerms = useCallback(async () => {
    if (!user) return;
    setAcceptError(null);
    try {
      const res = await fetch("/api/onboarding/accept", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        // Server rejected the write — keep the onboarding screen visible
        setAcceptError("Something went wrong saving your acceptance. Please try again.");
        return;
      }
    } catch {
      // Network failure — keep the onboarding screen visible so the user can retry
      setAcceptError("Network error. Please check your connection and try again.");
      return;
    }
    // Only cache and unlock after confirmed server persistence
    localStorage.setItem(LS_KEY(user.id), "true");
    setTermsState(true);
  }, [user]);

  if (isLoading || (user && termsState === null)) {
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

  if (!termsState) {
    return <OnboardingPage onComplete={handleAcceptTerms} error={acceptError} />;
  }

  return (
    <Switch>
      <Route path="/" component={ExplorePage} />
      <Route path="/tribes" component={TribesPage} />
      <Route path="/tribes/:id" component={TribeDetailPage} />
      <Route path="/upload" component={UploadPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/radio">{() => <Redirect to="/" />}</Route>
      <Route path="/bestowal" component={BestowalPage} />
      <Route path="/messages" component={MessagingPage} />
      <Route path="/library" component={LibraryPage} />
      <Route path="/blueprints" component={BlueprintsPage} />
      <Route path="/governance" component={GovernancePage} />
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
