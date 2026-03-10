import { useState } from "react";
import { NavBar } from "@/components/nav-bar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Settings, Heart, TrendingUp, Coins, Users, Clock, Info, ChevronRight, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";

const bestowalLayers = [
  { color: "bg-pink-500", label: "Meaning", desc: "Why we participate" },
  { color: "bg-blue-500", label: "Identity", desc: "Who is in the network" },
  { color: "bg-green-500", label: "Attention", desc: "Where value starts" },
  { color: "bg-amber-500", label: "Contribution", desc: "What earns value" },
  { color: "bg-red-500", label: "Needs", desc: "Why the system matters" },
  { color: "bg-emerald-500", label: "Exchange", desc: "How daily life moves" },
  { color: "bg-fuchsia-500", label: "Governance", desc: "How balance is kept" },
];

export default function BestowalPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newAmount, setNewAmount] = useState("");
  const [password, setPassword] = useState("");

  const { data: bestowal, isLoading } = useQuery({
    queryKey: ["/api/bestowal"],
    queryFn: async () => {
      const res = await fetch("/api/bestowal", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch bestowal");
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ monthlyAmount, password }: { monthlyAmount: string; password: string }) => {
      const res = await fetch("/api/bestowal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthlyAmount, password }),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bestowal"] });
      toast({ title: "Bestowal Updated", description: "Your monthly bestowal has been updated." });
      setSettingsOpen(false);
      setPassword("");
      setNewAmount("");
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const monthlyAmount = parseFloat(bestowal?.monthlyAmount || "0");
  const creatorPool = monthlyAmount * 0.9;
  const fscBalance = parseFloat(bestowal?.fscBalance || "0");

  const now = new Date();
  const periodLabel = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  return (
    <div className="flex flex-col min-h-screen pb-24 animate-in-fade">
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold font-display" data-testid="text-bestowal-title">Bestowal</h1>
            <p className="text-muted-foreground text-sm mt-1">Pay Attention! Creators Blessing.</p>
          </div>
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center" data-testid="button-bestowal-settings">
                <Settings className="w-5 h-5 text-muted-foreground" />
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adjust Monthly Bestowal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Monthly Amount ($)</label>
                  <Input type="number" min="0" step="0.01" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="e.g. 9.99" data-testid="input-bestowal-amount" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2"><Lock className="w-4 h-4" /> Confirm with Password</label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password to confirm" data-testid="input-bestowal-password" />
                </div>
                <Button className="w-full" disabled={!newAmount || !password || updateMutation.isPending} onClick={() => updateMutation.mutate({ monthlyAmount: newAmount, password })} data-testid="button-confirm-bestowal">
                  {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Confirm Change
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
      ) : (
        <div className="px-5 space-y-5 flex-1">
          <div className="glass-card rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="font-bold text-sm">{periodLabel}</span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-400" /> Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="stat-card">
              <Heart className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold" data-testid="text-monthly-contribution">${monthlyAmount.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">Monthly Contribution</p>
            </div>
            <div className="stat-card">
              <TrendingUp className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <p className="text-2xl font-bold" data-testid="text-creator-pool">${creatorPool.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">Creator Pool (90%)</p>
            </div>
            <div className="stat-card">
              <Coins className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-400" data-testid="text-fsc-balance">{fscBalance.toFixed(2)} FSC</p>
              <p className="text-xs text-muted-foreground mt-1">Free Soul Coin</p>
            </div>
            <div className="stat-card">
              <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold" data-testid="text-creators-supported">0</p>
              <p className="text-xs text-muted-foreground mt-1">Creators Supported</p>
            </div>
            <div className="stat-card col-span-1">
              <Clock className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-2xl font-bold">0s</p>
              <p className="text-xs text-muted-foreground mt-1">Time Watched</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm">How Bestowal Works</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-foreground/80">&#8226;</span> Sessions count after 5 seconds</li>
              <li className="flex items-start gap-2"><span className="text-foreground/80">&#8226;</span> Qualifying threshold: 1% of your attention</li>
              <li className="flex items-start gap-2"><span className="text-foreground/80">&#8226;</span> Max 100 creators per month</li>
              <li className="flex items-start gap-2"><span className="text-foreground/80">&#8226;</span> Self-bestowal cap: 5%</li>
              <li className="flex items-start gap-2"><span className="text-foreground/80">&#8226;</span> Platform fee: 5%</li>
              <li className="flex items-start gap-2"><span className="text-foreground/80">&#8226;</span> Needs Fund: 5% (community support pool)</li>
            </ul>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold font-display">Supported Creators</h3>
              <span className="text-sm text-muted-foreground">0 / 100</span>
            </div>
            <div className="glass-card rounded-2xl p-8 text-center">
              <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-semibold mb-1">No creators yet</p>
              <p className="text-sm text-muted-foreground">Watch or listen to content for at least 5 seconds to start supporting creators.</p>
            </div>
          </div>

          <button className="w-full glass-card rounded-2xl p-4 flex items-center justify-between hover:border-purple-500/30 transition-colors" data-testid="button-send-gift">
            <div className="flex items-center gap-3">
              <Gift className="w-5 h-5 text-muted-foreground" />
              <span className="font-semibold text-sm">Send Direct Gift</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          <div className="glass-card rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-center">7 Layers of Mutual Bestowal</h3>
            <div className="space-y-3">
              {bestowalLayers.map((layer) => (
                <div key={layer.label} className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${layer.color} shrink-0`} />
                  <span className="text-sm">
                    <span className="font-medium">{layer.label}</span>
                    <span className="text-muted-foreground"> — {layer.desc}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground pb-4">
            Bestowal reflects voluntary gifts within the Free Soul Movement private association.
          </p>
        </div>
      )}

      <NavBar />
    </div>
  );
}
