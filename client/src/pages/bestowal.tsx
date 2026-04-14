import { useState } from "react";
import { NavBar } from "@/components/nav-bar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Settings, Heart, TrendingUp, Coins, Users, Clock, Info, ChevronRight, Gift, Ban, Shield, Lightbulb, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FreeSoulEmblem } from "@/components/free-soul-emblem";
import type { User } from "@shared/schema";

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
  const [giftOpen, setGiftOpen] = useState(false);
  const [banOpen, setBanOpen] = useState(false);
  const [newAmount, setNewAmount] = useState("");
  const [password, setPassword] = useState("");
  const [giftSearch, setGiftSearch] = useState("");
  const [selectedGiftUser, setSelectedGiftUser] = useState<User | null>(null);
  const [giftAmount, setGiftAmount] = useState("");

  const { data: bestowal, isLoading } = useQuery({
    queryKey: ["/api/bestowal"],
    queryFn: async () => {
      const res = await fetch("/api/bestowal", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch bestowal");
      return res.json();
    },
  });

  const { data: allUsers } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: async () => { const res = await fetch("/api/users", { credentials: "include" }); return res.json(); },
    enabled: giftOpen || banOpen,
  });

  const { data: blockedUsers } = useQuery<string[]>({
    queryKey: ["/api/blocked-users"],
    queryFn: async () => { const res = await fetch("/api/blocked-users", { credentials: "include" }); return res.json(); },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ monthlyAmount, password }: { monthlyAmount: string; password: string }) => {
      const res = await fetch("/api/bestowal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthlyAmount, password }),
        credentials: "include",
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || "Failed to update"); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bestowal"] });
      toast({ title: "Bestowal Updated", description: "Your monthly bestowal has been updated." });
      setSettingsOpen(false);
      setPassword(""); setNewAmount("");
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const blockMutation = useMutation({
    mutationFn: async (blockedUserId: string) => {
      const res = await fetch("/api/blocked-users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ blockedUserId }), credentials: "include" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blocked-users"] });
      toast({ title: "User Blocked", description: "This user will no longer receive your bestowal." });
    },
  });

  const unblockMutation = useMutation({
    mutationFn: async (blockedUserId: string) => {
      const res = await fetch(`/api/blocked-users/${blockedUserId}`, { method: "DELETE", credentials: "include" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blocked-users"] });
      toast({ title: "User Unblocked" });
    },
  });

  const monthlyAmount = parseFloat(bestowal?.monthlyAmount || "0");
  const creatorPool = monthlyAmount * 0.9;
  const platformSustenance = monthlyAmount * 0.05;
  const needsFund = monthlyAmount * 0.05;
  const fscBalance = parseFloat(bestowal?.fscBalance || "0");

  const now = new Date();
  const periodLabel = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const filteredGiftUsers = giftSearch.length >= 2
    ? (allUsers || []).filter(u =>
      (u.firstName?.toLowerCase().includes(giftSearch.toLowerCase()) ||
        u.lastName?.toLowerCase().includes(giftSearch.toLowerCase()))
    ).slice(0, 10)
    : [];

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
            <div className="stat-card">
              <Clock className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-2xl font-bold">0s</p>
              <p className="text-xs text-muted-foreground mt-1">Time Watched</p>
            </div>
            <div className="stat-card">
              <Lightbulb className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <p className="text-2xl font-bold" data-testid="text-blueprint-pow">0</p>
              <p className="text-xs text-muted-foreground mt-1">Blueprint PoW</p>
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
              <li className="flex items-start gap-2"><span className="text-foreground/80">&#8226;</span> <strong>Platform sustenance:</strong> 5%</li>
              <li className="flex items-start gap-2"><span className="text-foreground/80">&#8226;</span> Needs Fund: 5% (community support pool)</li>
            </ul>
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-xs text-muted-foreground">Platform Sustenance</span>
              <span className="text-xs font-bold">${platformSustenance.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Needs Fund</span>
              <span className="text-xs font-bold">${needsFund.toFixed(2)}</span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-amber-400">FSC Blueprint Proof-of-Work</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Earn Free Soul Coin through blueprint engagement. When your blueprints are viewed, used, or referenced
              by other creators, you earn FSC based on the deflationary proof-of-work model. The more your designs
              contribute to the community, the more FSC you accumulate.
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Blueprint Views → FSC</span>
              <span className="text-green-400 font-bold">{fscBalance.toFixed(4)} FSC earned</span>
            </div>
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

          <div className="flex gap-3">
            <button onClick={() => setGiftOpen(true)} className="flex-1 glass-card rounded-2xl p-4 flex items-center justify-between hover:border-purple-500/30 transition-colors" data-testid="button-send-gift">
              <div className="flex items-center gap-3">
                <Gift className="w-5 h-5 text-purple-400" />
                <span className="font-semibold text-sm">Send Direct Gift</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <button onClick={() => setBanOpen(true)} className="glass-card rounded-2xl p-4 flex items-center gap-2 hover:border-red-500/30 transition-colors" data-testid="button-ban-users">
              <Ban className="w-5 h-5 text-red-400" />
              <span className="font-semibold text-sm">Block</span>
            </button>
          </div>

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

      <Dialog open={giftOpen} onOpenChange={setGiftOpen}>
        <DialogContent className="max-w-sm max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Gift className="w-5 h-5 text-purple-400" /> Send Direct Gift</DialogTitle>
            <DialogDescription>Select a creator from your most watched or search for someone</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Input value={giftSearch} onChange={(e) => setGiftSearch(e.target.value)} placeholder="Search creators..." className="bg-white/5 border-white/10" data-testid="input-gift-search" />

            {selectedGiftUser ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-xl border border-primary/20">
                  <img src={selectedGiftUser.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedGiftUser.firstName}`} alt="" className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{selectedGiftUser.firstName} {selectedGiftUser.lastName}</p>
                  </div>
                  <button onClick={() => setSelectedGiftUser(null)} className="text-xs text-muted-foreground">Change</button>
                </div>
                <Input type="number" value={giftAmount} onChange={(e) => setGiftAmount(e.target.value)} placeholder="Gift amount ($)" className="bg-white/5 border-white/10" data-testid="input-gift-amount" />
                <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600" disabled={!giftAmount} onClick={() => { toast({ title: "Gift Sent!", description: `$${giftAmount} gift sent to ${selectedGiftUser.firstName}.` }); setGiftOpen(false); setSelectedGiftUser(null); setGiftAmount(""); setGiftSearch(""); }} data-testid="button-confirm-gift">
                  <Gift className="w-4 h-4 mr-2" /> Send Gift
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredGiftUsers.length > 0 ? filteredGiftUsers.map(u => (
                  <button key={u.id} onClick={() => setSelectedGiftUser(u)} className="w-full flex items-center gap-3 p-3 glass-card rounded-xl hover:border-purple-500/20 transition-colors" data-testid={`gift-user-${u.id}`}>
                    <img src={u.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${u.firstName}`} alt="" className="w-9 h-9 rounded-full" />
                    <div className="text-left">
                      <p className="font-semibold text-sm">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-muted-foreground">@{u.email?.split("@")[0] || u.id.slice(0, 8)}</p>
                    </div>
                  </button>
                )) : giftSearch.length >= 2 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No creators found</p>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Search for a creator to send a gift</p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={banOpen} onOpenChange={setBanOpen}>
        <DialogContent className="max-w-sm max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Ban className="w-5 h-5 text-red-400" /> Block Users from Bestowal</DialogTitle>
            <DialogDescription>Blocked users will not receive any of your bestowal allocation</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {(blockedUsers || []).length > 0 && (
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Currently Blocked</p>
                <div className="space-y-2">
                  {(blockedUsers || []).map(id => {
                    const u = (allUsers || []).find(u => u.id === id);
                    return (
                      <div key={id} className="flex items-center justify-between p-3 glass-card rounded-xl">
                        <span className="text-sm font-medium">{u ? `${u.firstName} ${u.lastName}` : id.slice(0, 8)}</span>
                        <Button variant="ghost" size="sm" onClick={() => unblockMutation.mutate(id)} className="text-xs text-green-400" data-testid={`button-unblock-${id}`}>Unblock</Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Block a User</p>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {(allUsers || []).filter(u => !(blockedUsers || []).includes(u.id)).slice(0, 20).map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 glass-card rounded-xl" data-testid={`ban-user-${u.id}`}>
                  <div className="flex items-center gap-2">
                    <img src={u.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${u.firstName}`} alt="" className="w-7 h-7 rounded-full" />
                    <span className="text-sm font-medium">{u.firstName} {u.lastName}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => blockMutation.mutate(u.id)} className="text-xs text-red-400" data-testid={`button-block-${u.id}`}>Block</Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <NavBar />
    </div>
  );
}
