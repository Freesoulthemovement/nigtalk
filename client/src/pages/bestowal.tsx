import { useState } from "react";
import { NavBar } from "@/components/nav-bar";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, HeartHandshake, Settings, Coins, Lock, TrendingUp, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function BestowalPage() {
  const { user } = useAuth();
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

  const fscBalance = parseFloat(bestowal?.fscBalance || "0");
  const fscDollarValue = fscBalance * 100;
  const monthlyAmount = parseFloat(bestowal?.monthlyAmount || "0");

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <div className="flex-1 p-4 pt-6 md:p-8">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-display" data-testid="text-bestowal-title">Bestowal</h1>
                <p className="text-sm text-muted-foreground">Mutual support & giving</p>
              </div>
            </div>

            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-xl" data-testid="button-bestowal-settings">
                  <Settings className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adjust Monthly Bestowal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">New Monthly Amount ($)</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      placeholder="e.g. 50.00"
                      data-testid="input-bestowal-amount"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4" /> Confirm with Password
                    </label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password to confirm"
                      data-testid="input-bestowal-password"
                    />
                  </div>
                  <Button
                    className="w-full"
                    disabled={!newAmount || !password || updateMutation.isPending}
                    onClick={() => updateMutation.mutate({ monthlyAmount: newAmount, password })}
                    data-testid="button-confirm-bestowal"
                  >
                    {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Confirm Change
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-br from-primary/20 via-card to-card border border-primary/30 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm text-primary font-medium">
                  <Coins className="w-4 h-4" />
                  <span>Free Soul Coin (FSC) Balance</span>
                </div>
                <div className="space-y-1">
                  <p className="text-4xl font-bold font-display" data-testid="text-fsc-balance">
                    {fscBalance.toFixed(4)} <span className="text-lg text-primary">FSC</span>
                  </p>
                  <p className="text-sm text-muted-foreground" data-testid="text-fsc-dollar-value">
                    ≈ ${fscDollarValue.toFixed(2)} USD (1 FSC = $100)
                  </p>
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Monthly Bestowal</span>
                  <span className="text-lg font-bold" data-testid="text-monthly-amount">${monthlyAmount.toFixed(2)}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">FSC Earned This Cycle</span>
                  <span className="text-sm font-medium text-primary" data-testid="text-fsc-earned">
                    +{(monthlyAmount * 0.01 * 0.2 / 100).toFixed(6)} FSC
                  </span>
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-bold text-sm">How FSC Works</h3>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>Free Soul Coin (FSC) is NigTalk's value token. Each FSC is worth <span className="text-foreground font-semibold">$100</span>.</p>
                  <p>We privately match 1/5 of all needs contributions by converting 1% of platform contributions into FSC.</p>
                  <p className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span>FSC will eventually be land-backed for lasting sovereign value.</span>
                  </p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Need help? <a href="mailto:nigtalksupport@freesoulthemovement" className="text-primary hover:underline" data-testid="link-bestowal-support">nigtalksupport@freesoulthemovement</a>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      <NavBar />
    </div>
  );
}
