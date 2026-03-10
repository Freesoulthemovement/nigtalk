import { useState, useCallback } from "react";
import { NavBar } from "@/components/nav-bar";
import { Volume2, Wifi, Bluetooth, Mic, Radio as RadioIcon, Clock, ChevronRight, RefreshCw } from "lucide-react";

const channels = [
  { name: "NigTalk", icon: "chat", color: "border-purple-500/40 bg-purple-500/10 text-purple-300", active: true },
  { name: "Random", icon: "shuffle", color: "border-pink-500/40 bg-pink-500/10 text-pink-300", active: false },
  { name: "Mental Health", icon: "brain", color: "border-green-500/40 bg-green-500/10 text-green-300", active: false },
];

const myTribes = [
  { name: "Food Sove...", color: "border-amber-500/40 bg-amber-500/10" },
  { name: "Energy Fre...", color: "border-green-500/40 bg-green-500/10" },
  { name: "Music", color: "border-cyan-500/40 bg-cyan-500/10" },
];

export default function RadioPage() {
  const [isOnline, setIsOnline] = useState(true);
  const [meshMode, setMeshMode] = useState(true);
  const [isPTTActive, setIsPTTActive] = useState(false);
  const [activeChannel, setActiveChannel] = useState("NigTalk");
  const [peerCount] = useState(1);

  const handlePTTStart = useCallback(() => {
    if (isOnline) setIsPTTActive(true);
  }, [isOnline]);

  const handlePTTEnd = useCallback(() => {
    setIsPTTActive(false);
  }, []);

  return (
    <div className="flex flex-col min-h-screen pb-24 animate-in-fade">
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="text-4xl font-bold font-display" data-testid="text-radio-title">Radio</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-400" : "bg-red-400"}`} />
              <span className="text-sm text-muted-foreground">
                {meshMode ? "Mesh" : "Online"} · {peerCount} peers
              </span>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center" data-testid="button-radio-volume">
            <Volume2 className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="px-5 space-y-6 flex-1">
        <div className="flex items-center justify-center gap-1 glass-card rounded-full p-1">
          <button
            onClick={() => { setIsOnline(true); setMeshMode(false); }}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all flex-1 justify-center ${!meshMode ? "bg-white/10 text-white" : "text-muted-foreground"}`}
            data-testid="button-online-mode"
          >
            <Wifi className="w-4 h-4" /> Online
          </button>
          <button
            onClick={() => { setIsOnline(true); setMeshMode(true); }}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all flex-1 justify-center ${meshMode ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-muted-foreground"}`}
            data-testid="button-mesh-mode"
          >
            <Bluetooth className="w-4 h-4" /> Mesh
          </button>
        </div>

        <section>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Channels</h3>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {channels.map((ch) => (
              <button
                key={ch.name}
                onClick={() => setActiveChannel(ch.name)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-all ${
                  activeChannel === ch.name
                    ? "border-purple-500/60 bg-purple-500/20 text-purple-200"
                    : ch.color
                }`}
                data-testid={`channel-${ch.name}`}
              >
                <RadioIcon className="w-4 h-4" />
                {ch.name}
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">My Tribes</h3>
            <button className="text-xs text-primary flex items-center gap-1" data-testid="button-swap-tribes">
              <RefreshCw className="w-3 h-3" /> Swap
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground mb-2">3/3 slots · Long press to schedule</p>
          <div className="flex gap-2">
            {myTribes.map((tribe) => (
              <div key={tribe.name} className={`flex items-center gap-2 px-3 py-2 rounded-full border ${tribe.color} text-sm`} data-testid={`tribe-slot-${tribe.name}`}>
                <RadioIcon className="w-4 h-4" />
                <span className="text-sm truncate max-w-[80px]">{tribe.name}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Now Tuned</h3>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400">12 live</span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                <RadioIcon className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm">NigTalk</h4>
                <p className="text-xs text-muted-foreground">Official NigTalk announcements, updates, and community broadcasts.</p>
              </div>
            </div>

            <div>
              <p className="text-[11px] text-muted-foreground mb-1">Upcoming</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span className="text-sm font-semibold">Weekly Community Update</span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 1/26/2026 · 30m
                </div>
                <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold text-[10px] uppercase">Live</span>
              </div>
            </div>
          </div>
        </section>

        {meshMode && (
          <div className="glass-card rounded-2xl p-4 border-cyan-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Bluetooth className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-cyan-300">Bluetooth Mesh Mode</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Mesh mode uses Bluetooth Low Energy to create a peer-to-peer radio network. Works without internet connection for emergency communication. Range extends as more peers join the mesh. Signal strength improves with proximity.
            </p>
          </div>
        )}
      </div>

      <div className="fixed bottom-20 left-0 right-0 px-5 pb-4 z-40">
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between glow-purple">
          <div>
            <h4 className="font-bold text-sm">NigTalk</h4>
            <p className="text-xs text-muted-foreground">Hold to talk</p>
          </div>
          <button
            onMouseDown={handlePTTStart}
            onMouseUp={handlePTTEnd}
            onMouseLeave={handlePTTEnd}
            onTouchStart={(e) => { e.preventDefault(); handlePTTStart(); }}
            onTouchEnd={(e) => { e.preventDefault(); handlePTTEnd(); }}
            disabled={!isOnline}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isPTTActive
                ? "bg-primary scale-110 shadow-xl shadow-primary/50"
                : isOnline
                ? "bg-white/10 border border-white/20 hover:bg-white/15"
                : "bg-white/5 border border-white/10 opacity-50"
            }`}
            data-testid="button-push-to-talk"
          >
            <Mic className={`w-6 h-6 ${isPTTActive ? "text-white" : "text-muted-foreground"}`} />
          </button>
        </div>
      </div>

      <NavBar />
    </div>
  );
}
