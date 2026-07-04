import { useRoute } from "wouter";
import { useTribe, useTribeMessages, useSendMessage, useJoinTribe } from "@/hooks/use-tribes";
import { Loader2, Send, Users, UserPlus, ArrowLeft, Radio, ThumbsUp, ThumbsDown, Lightbulb, DollarSign, Globe, Shield, AlertTriangle, Plus, ChevronDown, ChevronUp, MessageCircle, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FreeSoulEmblem } from "@/components/free-soul-emblem";

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

function TribeProposalCard({ proposal, onRefresh }: { proposal: any; onRefresh: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestType, setSuggestType] = useState<"add" | "remove">("add");
  const [suggestContent, setSuggestContent] = useState("");
  const [suggestEffect, setSuggestEffect] = useState("");

  const catInfo = getCatInfo(proposal.category);
  const isNullified = proposal.status === "nullified";
  const isExpired = proposal.status === "expired";
  const votingLocked = isNullified || isExpired;
  const myVote = proposal.myVote;
  const nullifyPct = proposal.nullifyPct ?? 0;
  const supportPct = 100 - Math.min(nullifyPct, 100);

  const voteMutation = useMutation({
    mutationFn: async (voteType: string) => {
      if (myVote === voteType) {
        return apiRequest("DELETE", `/api/proposals/${proposal.id}/vote`);
      }
      return apiRequest("POST", `/api/proposals/${proposal.id}/vote`, { voteType });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/proposals", proposal.tribeId] }); onRefresh(); },
    onError: () => toast({ title: "Error", description: "Could not record vote", variant: "destructive" }),
  });

  const suggestMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", `/api/proposals/${proposal.id}/suggest`, data),
    onSuccess: () => {
      toast({ title: "Suggestion Added" });
      setShowSuggest(false);
      setSuggestContent("");
      setSuggestEffect("");
      qc.invalidateQueries({ queryKey: ["/api/proposals", proposal.tribeId] });
    },
    onError: () => toast({ title: "Error", description: "Could not add suggestion", variant: "destructive" }),
  });

  return (
    <div className={`glass-card rounded-2xl p-4 ${isNullified ? "border-red-500/20" : ""}`} data-testid={`card-tribe-proposal-${proposal.id}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catInfo.color}`}>{catInfo.label}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${STATUS_BADGE[proposal.status] || STATUS_BADGE.active}`}>
              {isNullified ? "Community Nullified" : proposal.status}
            </span>
          </div>
          <h3 className="font-bold text-sm leading-snug">{proposal.title}</h3>
          {proposal.requestedFunding && (
            <p className="text-xs text-amber-400 mt-0.5">Requesting ${parseFloat(proposal.requestedFunding).toLocaleString()}</p>
          )}
        </div>
        {isNullified && <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{proposal.description}</p>

      <div className="mt-2">
        <div className="flex rounded-full overflow-hidden h-2 bg-white/5">
          <div className="bg-green-500 transition-all" style={{ width: `${supportPct}%` }} />
          <div className="bg-red-500 transition-all" style={{ width: `${Math.min(nullifyPct, 100)}%` }} />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
          <span>{proposal.supportCount ?? 0} Support</span>
          <span>{nullifyPct.toFixed(0)}% Nullify · {proposal.nullifyCount ?? 0}</span>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={() => voteMutation.mutate("support")}
          disabled={voteMutation.isPending || votingLocked}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-colors border ${votingLocked ? "opacity-40 cursor-not-allowed bg-white/3 border-white/5 text-muted-foreground" : myVote === "support" ? "bg-green-500/20 border-green-500/40 text-green-400" : "bg-white/5 border-white/10 text-muted-foreground hover:border-green-500/30"}`}
          data-testid={`button-tribe-support-${proposal.id}`}
        >
          <ThumbsUp className="w-3.5 h-3.5" /> Support
        </button>
        <button
          onClick={() => voteMutation.mutate("nullify")}
          disabled={voteMutation.isPending || votingLocked}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-colors border ${votingLocked ? "opacity-40 cursor-not-allowed bg-white/3 border-white/5 text-muted-foreground" : myVote === "nullify" ? "bg-red-500/20 border-red-500/40 text-red-400" : "bg-white/5 border-white/10 text-muted-foreground hover:border-red-500/30"}`}
          data-testid={`button-tribe-nullify-${proposal.id}`}
        >
          <ThumbsDown className="w-3.5 h-3.5" /> Nullify
        </button>
        <button
          onClick={() => setShowSuggest(true)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-colors border bg-white/5 border-white/10 text-muted-foreground hover:border-cyan-500/30"
          data-testid={`button-tribe-suggest-${proposal.id}`}
        >
          <Lightbulb className="w-3.5 h-3.5" /> Suggest
        </button>
      </div>

      {proposal.suggestions?.length > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-3 flex items-center justify-center gap-1 text-xs text-muted-foreground py-1"
          data-testid={`button-tribe-expand-suggestions-${proposal.id}`}
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
                <button key={t} onClick={() => setSuggestType(t)} className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all ${suggestType === t ? "bg-primary text-white" : "bg-white/5 text-muted-foreground border border-white/10"}`} data-testid={`button-tribe-suggest-type-${t}`}>{t}</button>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Suggestion</Label>
              <Textarea value={suggestContent} onChange={e => setSuggestContent(e.target.value)} placeholder="What should be added or removed?" className="bg-white/5 border-white/10 min-h-[70px] text-sm" data-testid="input-tribe-suggest-content" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Effect Analysis</Label>
              <Textarea value={suggestEffect} onChange={e => setSuggestEffect(e.target.value)} placeholder="How does this impact individuals and communities?" className="bg-white/5 border-white/10 min-h-[60px] text-sm" data-testid="input-tribe-suggest-effect" />
            </div>
            <Button
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500"
              disabled={!suggestContent || suggestMutation.isPending}
              onClick={() => suggestMutation.mutate({ suggestionType: suggestType, content: suggestContent, effectAnalysis: suggestEffect })}
              data-testid="button-tribe-submit-suggestion"
            >
              {suggestMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Suggestion"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NewTribeProposalDialog({ open, onOpenChange, tribeId, tribeName }: { open: boolean; onOpenChange: (o: boolean) => void; tribeId: number; tribeName: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [requestedFunding, setRequestedFunding] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const mutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/proposals", data),
    onSuccess: () => {
      toast({ title: "Proposal Submitted" });
      qc.invalidateQueries({ queryKey: ["/api/proposals", tribeId] });
      onOpenChange(false);
      setTitle(""); setDescription(""); setCategory("other"); setRequestedFunding(""); setExpiresAt("");
    },
    onError: () => toast({ title: "Error", description: "Could not submit proposal", variant: "destructive" }),
  });

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) return;
    const data: any = { title, description, category, tribeId };
    if (requestedFunding) data.requestedFunding = parseFloat(requestedFunding).toFixed(2);
    if (expiresAt) data.expiresAt = new Date(expiresAt).toISOString();
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><FreeSoulEmblem className="w-5 h-5" /> New Proposal</DialogTitle>
          <DialogDescription>Submit a governance proposal for <span className="text-purple-400 font-medium">{tribeName}</span></DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Brief, clear proposal title" className="bg-white/5 border-white/10" data-testid="input-tribe-proposal-title" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your proposal in detail..." className="bg-white/5 border-white/10 min-h-[90px] text-sm" data-testid="input-tribe-proposal-description" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Category</Label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/10 text-sm px-3 py-2 text-foreground"
              data-testid="select-tribe-proposal-category"
            >
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Requested Funding (optional, $)</Label>
            <Input value={requestedFunding} onChange={e => setRequestedFunding(e.target.value)} type="number" min="0" placeholder="Leave blank if no funding needed" className="bg-white/5 border-white/10" data-testid="input-tribe-proposal-funding" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Expiry Date (optional)</Label>
            <Input value={expiresAt} onChange={e => setExpiresAt(e.target.value)} type="date" className="bg-white/5 border-white/10" data-testid="input-tribe-proposal-expires" />
          </div>
          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600"
            disabled={!title.trim() || !description.trim() || mutation.isPending}
            onClick={handleSubmit}
            data-testid="button-tribe-submit-proposal"
          >
            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Submit Proposal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function TribeDetailPage() {
  const [, params] = useRoute("/tribes/:id");
  const tribeId = parseInt(params?.id || "0");
  const { data: tribe, isLoading: isTribeLoading } = useTribe(tribeId);
  const { data: messages, isLoading: isMessagesLoading } = useTribeMessages(tribeId);
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();
  const { mutate: joinTribe, isPending: isJoining } = useJoinTribe();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"chat" | "governance">("chat");
  const [msgInput, setMsgInput] = useState("");
  const [showNewProposal, setShowNewProposal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isMember = tribe?.members?.some((m: any) => m.user.id === user?.id);

  const { data: proposals = [], isLoading: isProposalsLoading, refetch: refetchProposals } = useQuery<any[]>({
    queryKey: ["/api/proposals", tribeId],
    queryFn: async () => {
      const res = await fetch(`/api/proposals?tribeId=${tribeId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: activeTab === "governance" && isMember === true,
  });

  useEffect(() => {
    if (scrollRef.current && activeTab === "chat") scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, activeTab]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim()) return;
    sendMessage({ tribeId, content: msgInput });
    setMsgInput("");
  };

  if (isTribeLoading) {
    return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  }

  if (!tribe) return <div className="p-8">Tribe not found</div>;

  return (
    <div className="flex flex-col h-screen">
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 bg-[hsl(222,41%,6%)]/90 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/tribes">
            <button className="p-2 rounded-full bg-white/5" data-testid="button-back-to-tribes">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="w-9 h-9 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-none" data-testid="text-tribe-name">{tribe.name}</h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">{tribe.members?.length || 0} members</p>
          </div>
        </div>
        {!isMember && (
          <Button size="sm" onClick={() => joinTribe(tribeId)} disabled={isJoining} className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-xs" data-testid="button-join-tribe">
            {isJoining ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4 mr-1" />}
            Join
          </Button>
        )}
      </header>

      <div className="flex gap-1 bg-white/5 mx-4 mt-3 rounded-xl p-1 shrink-0">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === "chat" ? "bg-primary text-white" : "text-muted-foreground"}`}
          data-testid="tab-tribe-chat"
        >
          <MessageCircle className="w-3.5 h-3.5" /> Chat
        </button>
        <button
          onClick={() => setActiveTab("governance")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === "governance" ? "bg-primary text-white" : "text-muted-foreground"}`}
          data-testid="tab-tribe-governance"
        >
          <Vote className="w-3.5 h-3.5" /> Governance
        </button>
      </div>

      {activeTab === "chat" ? (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {!isMember ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                <Users className="w-14 h-14 text-muted-foreground mb-4" />
                <h2 className="text-lg font-bold mb-1">Join to Chat</h2>
                <p className="text-sm text-muted-foreground max-w-xs">Join this tribe to see and send messages.</p>
              </div>
            ) : isMessagesLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
            ) : messages?.length === 0 ? (
              <div className="text-center text-muted-foreground py-10 text-sm">No messages yet. Start the conversation!</div>
            ) : (
              messages?.map((msg: any) => {
                const isMe = msg.user?.id === user?.id || msg.senderId === user?.id;
                return (
                  <div key={msg.id} className={`flex gap-2.5 ${isMe ? "justify-end" : "justify-start"}`}>
                    {!isMe && (
                      <img src={msg.user?.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${msg.user?.firstName || "?"}`} className="w-7 h-7 rounded-full mt-1 border border-white/10 shrink-0" alt="" />
                    )}
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${isMe ? "bg-primary text-primary-foreground rounded-tr-sm" : "glass-card rounded-tl-sm"}`}>
                      {!isMe && <div className="text-[10px] text-muted-foreground mb-0.5">{msg.user?.firstName}</div>}
                      {msg.isRadio && (
                        <div className="flex items-center gap-1 text-[10px] text-cyan-400 mb-0.5"><Radio className="w-3 h-3" /> Radio</div>
                      )}
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {isMember && (
            <div className="p-4 border-t border-white/5 shrink-0 bg-[hsl(222,41%,6%)]">
              <form onSubmit={handleSend} className="flex gap-2">
                <Input value={msgInput} onChange={(e) => setMsgInput(e.target.value)} placeholder={`Message #${tribe.name}...`} className="flex-1 rounded-xl bg-white/5 border-white/10" data-testid="input-tribe-message" />
                <Button type="submit" size="icon" disabled={isSending || !msgInput.trim()} className="rounded-xl h-10 w-10 shrink-0 bg-primary" data-testid="button-send-tribe-message">
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </form>
            </div>
          )}
        </>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          {!isMember ? (
            <div className="flex flex-col items-center justify-center text-center p-8 opacity-60 h-full">
              <Users className="w-14 h-14 text-muted-foreground mb-4" />
              <h2 className="text-lg font-bold mb-1">Join to View Governance</h2>
              <p className="text-sm text-muted-foreground max-w-xs">Join this tribe to see and create governance proposals.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-sm" data-testid="text-tribe-governance-heading">Tribe Governance</h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Proposals scoped to {tribe.name}</p>
                </div>
                <button
                  onClick={() => setShowNewProposal(true)}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30"
                  data-testid="button-tribe-new-proposal"
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </div>

              {isProposalsLoading ? (
                <div className="flex justify-center py-14"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
              ) : proposals.length === 0 ? (
                <div className="text-center py-14">
                  <Vote className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-muted-foreground text-sm">No governance proposals yet</p>
                  <button onClick={() => setShowNewProposal(true)} className="mt-3 text-primary text-sm underline" data-testid="button-tribe-create-first-proposal">
                    Submit the first proposal
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {proposals.map((p: any) => (
                    <TribeProposalCard key={p.id} proposal={p} onRefresh={refetchProposals} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      <NewTribeProposalDialog
        open={showNewProposal}
        onOpenChange={setShowNewProposal}
        tribeId={tribeId}
        tribeName={tribe.name}
      />
    </div>
  );
}
