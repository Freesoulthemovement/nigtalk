import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Plus, ThumbsUp, ThumbsDown, Lightbulb, DollarSign, ChevronDown, ChevronUp, Globe, Shield, Loader2, AlertTriangle, Users } from "lucide-react";
import { FreeSoulEmblem } from "@/components/free-soul-emblem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { NavBar } from "@/components/nav-bar";

const CATEGORIES = [
  { value: "emergency", label: "Emergency", color: "text-red-400 bg-red-500/10 border-red-500/30" },
  { value: "hearth-building", label: "Hearth Building", color: "text-orange-400 bg-orange-500/10 border-orange-500/30" },
  { value: "seeds-crops", label: "Seeds & Crops", color: "text-green-400 bg-green-500/10 border-green-500/30" },
  { value: "blueprint-materials", label: "Blueprint Materials", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  { value: "platform-change", label: "Platform Change", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
  { value: "other", label: "Other", color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
];

const STATUS_BADGE: Record<string, string> = {
  active: "text-green-400 bg-green-500/10 border-green-500/30",
  nullified: "text-red-400 bg-red-500/10 border-red-500/30",
  funded: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  expired: "text-gray-400 bg-gray-500/10 border-gray-500/30",
};

function getCatInfo(value: string) {
  return CATEGORIES.find(c => c.value === value) || CATEGORIES[CATEGORIES.length - 1];
}

function NullifyBar({ supportCount, nullifyCount, nullifyPct }: { supportCount: number; nullifyCount: number; nullifyPct: number }) {
  const supportPct = 100 - Math.min(nullifyPct, 100);
  return (
    <div className="mt-2">
      <div className="flex rounded-full overflow-hidden h-2 bg-white/5">
        <div className="bg-green-500 transition-all" style={{ width: `${supportPct}%` }} />
        <div className="bg-red-500 transition-all" style={{ width: `${Math.min(nullifyPct, 100)}%` }} />
      </div>
      <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
        <span>{supportCount} Support</span>
        <span>{nullifyPct.toFixed(0)}% Nullify · {nullifyCount}</span>
      </div>
    </div>
  );
}

function ProposalCard({ proposal, onRefresh }: { proposal: any; onRefresh: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);
  const [showFund, setShowFund] = useState(false);
  const [suggestType, setSuggestType] = useState<"add" | "remove">("add");
  const [suggestContent, setSuggestContent] = useState("");
  const [suggestEffect, setSuggestEffect] = useState("");
  const [fundAmount, setFundAmount] = useState("");

  const catInfo = getCatInfo(proposal.category);
  const isNullified = proposal.status === "nullified";
  const isExpired = proposal.status === "expired";
  const votingLocked = isNullified || isExpired;
  const myVote = proposal.myVote;

  const voteMutation = useMutation({
    mutationFn: async (voteType: string) => {
      if (myVote === voteType) {
        return apiRequest("DELETE", `/api/proposals/${proposal.id}/vote`);
      }
      return apiRequest("POST", `/api/proposals/${proposal.id}/vote`, { voteType });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/proposals"] }); onRefresh(); },
    onError: () => toast({ title: "Error", description: "Could not record vote", variant: "destructive" }),
  });

  const suggestMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", `/api/proposals/${proposal.id}/suggest`, data),
    onSuccess: () => {
      toast({ title: "Suggestion Added" });
      setShowSuggest(false);
      setSuggestContent("");
      setSuggestEffect("");
      qc.invalidateQueries({ queryKey: ["/api/proposals"] });
    },
    onError: () => toast({ title: "Error", description: "Could not add suggestion", variant: "destructive" }),
  });

  const fundMutation = useMutation({
    mutationFn: (amount: string) => apiRequest("POST", `/api/proposals/${proposal.id}/fund`, { amount }),
    onSuccess: () => {
      toast({ title: "Funding Pledged", description: `$${fundAmount} committed to this proposal.` });
      setShowFund(false);
      setFundAmount("");
    },
    onError: (err: any) => toast({ title: "Cannot Fund", description: err.message || "Error", variant: "destructive" }),
  });

  return (
    <div className={`glass-card rounded-2xl p-4 ${isNullified ? "border-red-500/20" : ""}`} data-testid={`card-proposal-${proposal.id}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catInfo.color}`}>{catInfo.label}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${STATUS_BADGE[proposal.status] || STATUS_BADGE.active}`}>
              {isNullified ? "Community Nullified" : proposal.status}
            </span>
            {proposal.tribe ? (
              <Link href={`/tribes/${proposal.tribe.id}`}>
                <span className="text-[10px] px-2 py-0.5 rounded-full border border-purple-500/30 text-purple-400 bg-purple-500/10 flex items-center gap-1 hover:bg-purple-500/20 transition-colors cursor-pointer" data-testid={`link-tribe-badge-${proposal.tribe.id}`}>
                  <Shield className="w-2.5 h-2.5" /> {proposal.tribe.name}
                </span>
              </Link>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-blue-500/30 text-blue-400 bg-blue-500/10 flex items-center gap-1">
                <Globe className="w-2.5 h-2.5" /> Platform-wide
              </span>
            )}
          </div>
          <h3 className="font-bold text-sm leading-snug">{proposal.title}</h3>
          {proposal.requestedFunding && (
            <p className="text-xs text-amber-400 mt-0.5">Requesting ${parseFloat(proposal.requestedFunding).toLocaleString()}</p>
          )}
        </div>
        {isNullified && <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{proposal.description}</p>

      <NullifyBar supportCount={proposal.supportCount} nullifyCount={proposal.nullifyCount} nullifyPct={proposal.nullifyPct} />

      <div className="flex gap-2 mt-3">
        <button
          onClick={() => voteMutation.mutate("support")}
          disabled={voteMutation.isPending || votingLocked}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-colors border ${votingLocked ? "opacity-40 cursor-not-allowed bg-white/3 border-white/5 text-muted-foreground" : myVote === "support" ? "bg-green-500/20 border-green-500/40 text-green-400" : "bg-white/5 border-white/10 text-muted-foreground hover:border-green-500/30"}`}
          data-testid={`button-support-${proposal.id}`}
        >
          <ThumbsUp className="w-3.5 h-3.5" /> Support
        </button>
        <button
          onClick={() => voteMutation.mutate("nullify")}
          disabled={voteMutation.isPending || votingLocked}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-colors border ${votingLocked ? "opacity-40 cursor-not-allowed bg-white/3 border-white/5 text-muted-foreground" : myVote === "nullify" ? "bg-red-500/20 border-red-500/40 text-red-400" : "bg-white/5 border-white/10 text-muted-foreground hover:border-red-500/30"}`}
          data-testid={`button-nullify-${proposal.id}`}
        >
          <ThumbsDown className="w-3.5 h-3.5" /> Nullify
        </button>
        <button
          onClick={() => setShowSuggest(true)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-colors border bg-white/5 border-white/10 text-muted-foreground hover:border-cyan-500/30"
          data-testid={`button-suggest-${proposal.id}`}
        >
          <Lightbulb className="w-3.5 h-3.5" /> Suggest
        </button>
        {!votingLocked && (
          <button
            onClick={() => setShowFund(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-colors border bg-white/5 border-white/10 text-amber-400 hover:border-amber-500/30"
            data-testid={`button-fund-${proposal.id}`}
          >
            <DollarSign className="w-3.5 h-3.5" /> Fund
          </button>
        )}
      </div>

      {proposal.suggestions?.length > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-3 flex items-center justify-center gap-1 text-xs text-muted-foreground py-1"
          data-testid={`button-expand-suggestions-${proposal.id}`}
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {proposal.suggestions.length} suggestion{proposal.suggestions.length !== 1 ? "s" : ""}
        </button>
      )}

      {expanded && proposal.suggestions?.length > 0 && (
        <div className="mt-2 space-y-2">
          {proposal.suggestions.map((s: any) => (
            <div key={s.id} className="rounded-xl bg-white/3 border border-white/5 p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${s.suggestionType === "add" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                  {s.suggestionType}
                </span>
                <span className="text-[10px] text-muted-foreground">{s.user?.firstName || "Member"}</span>
              </div>
              <p className="text-xs">{s.content}</p>
              {s.effectAnalysis && <p className="text-[11px] text-muted-foreground mt-1 italic">{s.effectAnalysis}</p>}
            </div>
          ))}
        </div>
      )}

      <Dialog open={showSuggest} onOpenChange={setShowSuggest}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Suggestion</DialogTitle>
            <DialogDescription>Suggest an addition or removal to this proposal with an effect analysis</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="flex gap-2">
              {(["add", "remove"] as const).map(t => (
                <button key={t} onClick={() => setSuggestType(t)} className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all ${suggestType === t ? "bg-primary text-white" : "bg-white/5 text-muted-foreground border border-white/10"}`} data-testid={`button-suggest-type-${t}`}>{t}</button>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Suggestion</Label>
              <Textarea value={suggestContent} onChange={e => setSuggestContent(e.target.value)} placeholder="What should be added or removed?" className="bg-white/5 border-white/10 min-h-[70px] text-sm" data-testid="input-suggest-content" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Effect Analysis</Label>
              <Textarea value={suggestEffect} onChange={e => setSuggestEffect(e.target.value)} placeholder="How does this impact individuals and communities?" className="bg-white/5 border-white/10 min-h-[60px] text-sm" data-testid="input-suggest-effect" />
            </div>
            <Button
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500"
              disabled={!suggestContent || suggestMutation.isPending}
              onClick={() => suggestMutation.mutate({ suggestionType: suggestType, content: suggestContent, effectAnalysis: suggestEffect })}
              data-testid="button-submit-suggestion"
            >
              {suggestMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Suggestion"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFund} onOpenChange={setShowFund}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Fund Proposal</DialogTitle>
            <DialogDescription>Allocate from your bestowal commitment — this is a pledge of intent, not a live transfer</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Amount ($)</Label>
              <Input value={fundAmount} onChange={e => setFundAmount(e.target.value)} type="number" min="0.01" step="0.01" placeholder="0.00" className="bg-white/5 border-white/10" data-testid="input-fund-amount" />
            </div>
            <Button
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500"
              disabled={!fundAmount || parseFloat(fundAmount) <= 0 || fundMutation.isPending}
              onClick={() => fundMutation.mutate(parseFloat(fundAmount).toFixed(2))}
              data-testid="button-submit-fund"
            >
              {fundMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Pledge Funding"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NewProposalDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [requestedFunding, setRequestedFunding] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [scope, setScope] = useState<"platform" | "tribe">("platform");
  const [tribeId, setTribeId] = useState<string>("");

  const { data: userTribes = [] } = useQuery<any[]>({
    queryKey: ["/api/tribes/mine"],
    queryFn: async () => {
      const res = await fetch("/api/tribes/mine", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/proposals", data),
    onSuccess: () => {
      toast({ title: "Proposal Submitted" });
      qc.invalidateQueries({ queryKey: ["/api/proposals"] });
      onOpenChange(false);
      setTitle(""); setDescription(""); setCategory("other"); setRequestedFunding(""); setExpiresAt(""); setScope("platform"); setTribeId("");
    },
    onError: () => toast({ title: "Error", description: "Could not submit proposal", variant: "destructive" }),
  });

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) return;
    if (scope === "tribe" && !tribeId) {
      toast({ title: "Select a tribe", description: "Choose which tribe this proposal is for", variant: "destructive" });
      return;
    }
    const data: any = { title, description, category };
    if (requestedFunding) data.requestedFunding = parseFloat(requestedFunding).toFixed(2);
    if (expiresAt) data.expiresAt = new Date(expiresAt).toISOString();
    if (scope === "tribe" && tribeId) data.tribeId = Number(tribeId);
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><FreeSoulEmblem className="w-5 h-5" /> New Proposal</DialogTitle>
          <DialogDescription>Submit a community proposal for support, funding, or governance action</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Scope</Label>
            <div className="flex gap-2">
              {(["platform", "tribe"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => { setScope(s); setTribeId(""); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition-all ${scope === s ? "bg-primary/20 border-primary/40 text-primary" : "bg-white/5 border-white/10 text-muted-foreground"}`}
                  data-testid={`button-scope-${s}`}
                >
                  {s === "platform" ? <><Globe className="w-3.5 h-3.5" /> Platform-wide</> : <><Shield className="w-3.5 h-3.5" /> Tribe-specific</>}
                </button>
              ))}
            </div>
          </div>

          {scope === "tribe" && (
            <div className="space-y-1.5">
              <Label className="text-xs">Tribe</Label>
              <Select value={tribeId} onValueChange={setTribeId}>
                <SelectTrigger className="bg-white/5 border-white/10" data-testid="select-proposal-tribe">
                  <SelectValue placeholder="Choose a tribe…" />
                </SelectTrigger>
                <SelectContent>
                  {userTribes.length === 0 ? (
                    <SelectItem value="_none" disabled>Join a tribe first</SelectItem>
                  ) : (
                    userTribes.map((t: any) => (
                      <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs">Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Brief, clear proposal title" className="bg-white/5 border-white/10" data-testid="input-proposal-title" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your proposal in detail..." className="bg-white/5 border-white/10 min-h-[90px] text-sm" data-testid="input-proposal-description" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-white/5 border-white/10" data-testid="select-proposal-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Requested Funding (optional, $)</Label>
            <Input value={requestedFunding} onChange={e => setRequestedFunding(e.target.value)} type="number" min="0" placeholder="Leave blank if no funding needed" className="bg-white/5 border-white/10" data-testid="input-proposal-funding" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Expiry Date (optional)</Label>
            <Input value={expiresAt} onChange={e => setExpiresAt(e.target.value)} type="date" className="bg-white/5 border-white/10" data-testid="input-proposal-expires" />
          </div>
          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600"
            disabled={!title.trim() || !description.trim() || (scope === "tribe" && !tribeId) || mutation.isPending}
            onClick={handleSubmit}
            data-testid="button-submit-proposal"
          >
            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Submit Proposal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function GovernancePage() {
  const { user } = useAuth();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const highlightId = params.get("id") ? Number(params.get("id")) : null;

  const [tab, setTab] = useState<"all" | "mine">("all");
  const [filterCat, setFilterCat] = useState("all");
  const [filterStatus, setFilterStatus] = useState(highlightId ? "all" : "active");
  const [filterScope, setFilterScope] = useState<"all" | "platform" | "tribe">("all");
  const [showNew, setShowNew] = useState(false);

  // Ref map to scroll the highlighted card into view
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const { data: proposals = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ["/api/proposals"],
    queryFn: async () => {
      const res = await fetch("/api/proposals", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  // Auto-scroll to highlighted proposal once loaded
  useEffect(() => {
    if (!highlightId || isLoading) return;
    const el = cardRefs.current[highlightId];
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "center" }), 200);
    }
  }, [highlightId, isLoading, proposals]);

  const filtered = proposals.filter((p: any) => {
    if (tab === "mine" && p.proposer?.id !== user?.id) return false;
    if (filterCat !== "all" && p.category !== filterCat) return false;
    if (filterStatus !== "all" && p.status !== filterStatus) return false;
    if (filterScope === "platform" && p.tribeId != null) return false;
    if (filterScope === "tribe" && p.tribeId == null) return false;
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen pb-24 animate-in-fade">
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/settings">
            <button className="p-2 rounded-full bg-white/5 border border-white/10" data-testid="button-back-from-governance">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex items-center gap-2 flex-1">
            <FreeSoulEmblem className="w-6 h-6" />
            <h1 className="text-2xl font-bold font-display" data-testid="text-governance-title">Governance</h1>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30"
            data-testid="button-new-proposal-fab"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-4">
          <button onClick={() => setTab("all")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === "all" ? "bg-primary text-white" : "text-muted-foreground"}`} data-testid="tab-all-proposals">All Proposals</button>
          <button onClick={() => setTab("mine")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === "mine" ? "bg-primary text-white" : "text-muted-foreground"}`} data-testid="tab-my-proposals">My Proposals</button>
        </div>

        <div className="flex gap-1.5 mb-3">
          {([
            { value: "all", label: "All", icon: null },
            { value: "platform", label: "Platform-wide", icon: <Globe className="w-3 h-3" /> },
            { value: "tribe", label: "My Tribes", icon: <Users className="w-3 h-3" /> },
          ] as const).map(s => (
            <button
              key={s.value}
              onClick={() => setFilterScope(s.value)}
              className={`flex items-center gap-1 shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${filterScope === s.value ? "bg-primary/20 border-primary/40 text-primary" : "bg-white/5 border-white/10 text-muted-foreground"}`}
              data-testid={`filter-scope-${s.value}`}
            >
              {s.icon}{s.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {["all", "active", "nullified", "funded", "expired"].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all capitalize ${filterStatus === s ? "bg-primary/20 border-primary/40 text-primary" : "bg-white/5 border-white/10 text-muted-foreground"}`}
              data-testid={`filter-status-${s}`}
            >
              {s === "all" ? "All Status" : s === "nullified" ? "Nullified" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mt-2">
          <button
            onClick={() => setFilterCat("all")}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${filterCat === "all" ? "bg-primary/20 border-primary/40 text-primary" : "bg-white/5 border-white/10 text-muted-foreground"}`}
            data-testid="filter-cat-all"
          >
            All Categories
          </button>
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => setFilterCat(c.value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${filterCat === c.value ? `${c.color}` : "bg-white/5 border-white/10 text-muted-foreground"}`}
              data-testid={`filter-cat-${c.value}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 flex-1 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-14"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14">
            <p className="text-muted-foreground text-sm">No proposals found</p>
            <button onClick={() => setShowNew(true)} className="mt-3 text-primary text-sm underline" data-testid="button-create-first-proposal">Submit the first proposal</button>
          </div>
        ) : (
          filtered.map((p: any) => (
            <div key={p.id} ref={el => { cardRefs.current[p.id] = el; }} className={highlightId === p.id ? "ring-2 ring-primary/60 rounded-2xl" : ""}>
              <ProposalCard proposal={p} onRefresh={refetch} />
            </div>
          ))
        )}
      </div>

      <NewProposalDialog open={showNew} onOpenChange={setShowNew} />
      <NavBar />
    </div>
  );
}
