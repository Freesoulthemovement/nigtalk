import { useState, useCallback, useRef, useEffect } from "react";
import { NavBar } from "@/components/nav-bar";
import { Volume2, Wifi, Bluetooth, Mic, Radio as RadioIcon, Clock, ChevronRight, RefreshCw, Bell, BellOff, Video, Calendar, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTribes } from "@/hooks/use-tribes";
import { useToast } from "@/hooks/use-toast";
import { FreeSoulEmblem } from "@/components/free-soul-emblem";

const channels = [
  { name: "NigTalk", icon: "chat", color: "border-purple-500/40 bg-purple-500/10 text-purple-300", active: true },
  { name: "Random", icon: "shuffle", color: "border-pink-500/40 bg-pink-500/10 text-pink-300", active: false },
  { name: "Mental Health", icon: "brain", color: "border-green-500/40 bg-green-500/10 text-green-300", active: false },
];

export default function RadioPage() {
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(true);
  const [meshMode, setMeshMode] = useState(true);
  const [isPTTActive, setIsPTTActive] = useState(false);
  const [activeChannel, setActiveChannel] = useState("NigTalk");
  const [peerCount] = useState(1);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showSwapDialog, setShowSwapDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [videoBroadcast, setVideoBroadcast] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([0, 1, 2]);
  const { data: tribes } = useTribes();

  const myTribes = (tribes || []).slice(0, 5);
  const activeSlotTribes = selectedSlots.map(i => myTribes[i]).filter(Boolean);

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handlePTTStart = useCallback(() => {
    if (!isOnline) return;
    if (longPressTimerRef.current) return;
    const timer = setTimeout(() => {
      setShowScheduleDialog(true);
      setIsPTTActive(false);
      longPressTimerRef.current = null;
    }, 3000);
    longPressTimerRef.current = timer;
    setLongPressTimer(timer);
    setIsPTTActive(true);
  }, [isOnline]);

  const handlePTTEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (longPressTimer) clearTimeout(longPressTimer);
    setLongPressTimer(null);
    setIsPTTActive(false);
  }, [longPressTimer]);

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    };
  }, []);

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    toast({
      title: notificationsEnabled ? "Notifications Muted" : "Notifications Enabled",
      description: notificationsEnabled
        ? "You won't receive broadcast notifications for 1 hour."
        : "You'll receive broadcast notifications again.",
    });
  };

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
          <div className="flex items-center gap-2">
            <button onClick={toggleNotifications} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center" data-testid="button-toggle-notifications">
              {notificationsEnabled ? <Bell className="w-5 h-5 text-green-400" /> : <BellOff className="w-5 h-5 text-muted-foreground" />}
            </button>
            <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center" data-testid="button-radio-volume">
              <Volume2 className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
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

        {!notificationsEnabled && (
          <div className="glass-card rounded-xl p-3 border-amber-500/20 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-medium text-amber-400">Notifications muted for 1 hour</p>
              <p className="text-[10px] text-muted-foreground">Broadcast alerts are paused. Tap the bell to re-enable.</p>
            </div>
          </div>
        )}

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
            <button onClick={() => setShowSwapDialog(true)} className="text-xs text-primary flex items-center gap-1" data-testid="button-swap-tribes">
              <RefreshCw className="w-3 h-3" /> Swap
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground mb-2">3/3 slots · Long press PTT (3s) to schedule/record</p>
          <div className="flex gap-2">
            {activeSlotTribes.length > 0 ? activeSlotTribes.map((tribe: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-sm" data-testid={`tribe-slot-${idx}`}>
                <RadioIcon className="w-4 h-4 text-purple-400" />
                <span className="text-sm truncate max-w-[80px]">{tribe.name}</span>
              </div>
            )) : (
              <>
                <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-amber-500/40 bg-amber-500/10 text-sm" data-testid="tribe-slot-0">
                  <RadioIcon className="w-4 h-4" />
                  <span className="text-sm truncate max-w-[80px]">Food & Ag...</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-green-500/40 bg-green-500/10 text-sm" data-testid="tribe-slot-1">
                  <RadioIcon className="w-4 h-4" />
                  <span className="text-sm truncate max-w-[80px]">Energy Fre...</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 text-sm" data-testid="tribe-slot-2">
                  <RadioIcon className="w-4 h-4" />
                  <span className="text-sm truncate max-w-[80px]">Music</span>
                </div>
              </>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Broadcast Mode</h3>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setVideoBroadcast(false)}
              className={`flex-1 glass-card rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${!videoBroadcast ? "border-purple-500/40 bg-purple-500/10" : ""}`}
              data-testid="button-audio-broadcast"
            >
              <Mic className={`w-6 h-6 ${!videoBroadcast ? "text-purple-400" : "text-muted-foreground"}`} />
              <span className="text-xs font-medium">Audio Only</span>
            </button>
            <button
              onClick={() => setVideoBroadcast(true)}
              className={`flex-1 glass-card rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${videoBroadcast ? "border-cyan-500/40 bg-cyan-500/10" : ""}`}
              data-testid="button-video-broadcast"
            >
              <Video className={`w-6 h-6 ${videoBroadcast ? "text-cyan-400" : "text-muted-foreground"}`} />
              <span className="text-xs font-medium">Video</span>
            </button>
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
                <h4 className="font-bold text-sm">{activeChannel}</h4>
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
            <h4 className="font-bold text-sm">{activeChannel}</h4>
            <p className="text-xs text-muted-foreground">{videoBroadcast ? "Hold to broadcast video" : "Hold to talk"} · 3s long press to schedule</p>
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
            {videoBroadcast ? (
              <Video className={`w-6 h-6 ${isPTTActive ? "text-white" : "text-muted-foreground"}`} />
            ) : (
              <Mic className={`w-6 h-6 ${isPTTActive ? "text-white" : "text-muted-foreground"}`} />
            )}
          </button>
        </div>
      </div>

      <Dialog open={showSwapDialog} onOpenChange={setShowSwapDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><RefreshCw className="w-5 h-5 text-primary" /> Swap Tribe Slots</DialogTitle>
            <DialogDescription>Select up to 3 tribes for your radio slots</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-2 max-h-[300px] overflow-y-auto">
            {myTribes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <p>No tribes joined yet. Create or join a tribe first.</p>
              </div>
            ) : (
              myTribes.map((tribe: any, idx: number) => (
                <button
                  key={tribe.id}
                  onClick={() => {
                    setSelectedSlots(prev => {
                      if (prev.includes(idx)) return prev.filter(i => i !== idx);
                      if (prev.length >= 3) return [...prev.slice(1), idx];
                      return [...prev, idx];
                    });
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedSlots.includes(idx) ? "bg-primary/20 border border-primary/40" : "glass-card"}`}
                  data-testid={`swap-tribe-${tribe.id}`}
                >
                  <RadioIcon className={`w-5 h-5 ${selectedSlots.includes(idx) ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="font-medium text-sm">{tribe.name}</span>
                  {selectedSlots.includes(idx) && (
                    <span className="ml-auto text-xs text-primary font-bold">Slot {selectedSlots.indexOf(idx) + 1}</span>
                  )}
                </button>
              ))
            )}
          </div>
          <Button className="w-full mt-2 bg-gradient-to-r from-purple-600 to-indigo-600" onClick={() => { setShowSwapDialog(false); toast({ title: "Tribe Slots Updated" }); }} data-testid="button-confirm-swap">
            Apply
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" /> Schedule Broadcast</DialogTitle>
            <DialogDescription>Schedule or pre-record a broadcast</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <button className="glass-card rounded-xl p-4 flex flex-col items-center gap-2 hover:border-purple-500/30 transition-colors" data-testid="button-schedule-live">
                <Clock className="w-6 h-6 text-purple-400" />
                <span className="text-sm font-medium">Schedule Live</span>
                <span className="text-[10px] text-muted-foreground">Set a time to go live</span>
              </button>
              <button className="glass-card rounded-xl p-4 flex flex-col items-center gap-2 hover:border-cyan-500/30 transition-colors" data-testid="button-pre-record">
                <Mic className="w-6 h-6 text-cyan-400" />
                <span className="text-sm font-medium">Pre-Record</span>
                <span className="text-[10px] text-muted-foreground">Record now, broadcast later</span>
              </button>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setShowScheduleDialog(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

      <NavBar />
    </div>
  );
}
