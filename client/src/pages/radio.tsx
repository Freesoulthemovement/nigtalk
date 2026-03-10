import { useState, useRef, useCallback } from "react";
import { NavBar } from "@/components/nav-bar";
import { useAuth } from "@/hooks/use-auth";
import { Mic, MicOff, Radio as RadioIcon, Circle, Users, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RadioPage() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [isPTTActive, setIsPTTActive] = useState(false);
  const [activeListeners] = useState(Math.floor(Math.random() * 12) + 1);
  const holdTimer = useRef<NodeJS.Timeout | null>(null);

  const handlePTTStart = useCallback(() => {
    setIsPTTActive(true);
  }, []);

  const handlePTTEnd = useCallback(() => {
    setIsPTTActive(false);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm mx-auto text-center space-y-8">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <RadioIcon className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold font-display" data-testid="text-radio-title">Radio / Push-to-Talk</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Hold to broadcast. Release to listen.
            </p>
          </div>

          <div className="relative">
            <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
              isPTTActive
                ? "bg-primary/20 animate-pulse scale-125"
                : isOnline
                ? "bg-green-500/10 scale-110"
                : "bg-muted/20"
            }`} />
            <div className={`absolute inset-4 rounded-full transition-all duration-300 ${
              isPTTActive
                ? "bg-primary/30 animate-pulse scale-110"
                : ""
            }`} />
            <button
              onMouseDown={handlePTTStart}
              onMouseUp={handlePTTEnd}
              onMouseLeave={handlePTTEnd}
              onTouchStart={(e) => { e.preventDefault(); handlePTTStart(); }}
              onTouchEnd={(e) => { e.preventDefault(); handlePTTEnd(); }}
              disabled={!isOnline}
              className={`relative w-48 h-48 mx-auto rounded-full flex flex-col items-center justify-center gap-2 transition-all duration-300 select-none ${
                isPTTActive
                  ? "bg-primary text-white scale-95 shadow-2xl shadow-primary/50"
                  : isOnline
                  ? "bg-card border-2 border-primary/50 text-primary hover:bg-primary/10 shadow-xl shadow-primary/20"
                  : "bg-card border-2 border-border text-muted-foreground"
              }`}
              data-testid="button-push-to-talk"
            >
              {isPTTActive ? (
                <>
                  <Mic className="w-12 h-12" />
                  <span className="text-sm font-bold uppercase tracking-wider">Broadcasting</span>
                </>
              ) : isOnline ? (
                <>
                  <Mic className="w-12 h-12" />
                  <span className="text-sm font-medium">Hold to Talk</span>
                </>
              ) : (
                <>
                  <MicOff className="w-12 h-12" />
                  <span className="text-sm font-medium">Offline</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-sm">
              <Circle className={`w-3 h-3 ${isOnline ? "fill-green-500 text-green-500" : "fill-red-500 text-red-500"}`} />
              <span className={isOnline ? "text-green-500" : "text-red-500"}>
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
            {isOnline && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span data-testid="text-listener-count">{activeListeners} listening</span>
              </div>
            )}
          </div>

          <Button
            onClick={() => setIsOnline(!isOnline)}
            variant={isOnline ? "destructive" : "default"}
            className="w-full h-12 rounded-xl text-base font-semibold"
            data-testid="button-toggle-online"
          >
            {isOnline ? (
              <><WifiOff className="w-5 h-5 mr-2" /> Go Offline</>
            ) : (
              <><Wifi className="w-5 h-5 mr-2" /> Go Online</>
            )}
          </Button>

          <div className="bg-card border border-border rounded-2xl p-6 text-left space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">How It Works</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <p className="text-muted-foreground">Go online to join the tribal frequency</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <p className="text-muted-foreground">Hold the button to broadcast your voice</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <p className="text-muted-foreground">Release to listen to others in your tribe</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <NavBar />
    </div>
  );
}
