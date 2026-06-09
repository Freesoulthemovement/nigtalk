import { useState } from "react";
import { NavBar } from "@/components/nav-bar";
import { useVideos } from "@/hooks/use-videos";
import { VideoCard } from "@/components/video-card";
import { Loader2, Plus, Shield, Radio, Trophy, Globe, FileText, ChevronRight, X, Users, Search, Camera, Image, Film, Headphones, Lightbulb, Swords, Music, Laugh, Flame, Vote, AlertTriangle } from "lucide-react";
import { FaHandFist } from "react-icons/fa6";
import { Link, useLocation } from "wouter";
import { useTribes, useCreateTribe } from "@/hooks/use-tribes";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FreeSoulEmblem } from "@/components/free-soul-emblem";
import type { User } from "@shared/schema";

const streamCategories = [
  { id: "all", label: "All" },
  { id: "tribes", label: "Tribes" },
  { id: "sports", label: "Sports" },
  { id: "mbs-training", label: "Mind Body Soul" },
  { id: "hearth-builders", label: "Hearth Builders" },
  { id: "frequencies", label: "Frequencies" },
  { id: "music", label: "Music & Dance" },
  { id: "comedy", label: "Comedy" },
  { id: "events", label: "Events" },
  { id: "nonprofits", label: "Nonprofits" },
];

const frequencies = [
  { name: "Sovereign Tech", members: 1247, color: "border-cyan-500/40 text-cyan-400" },
  { name: "Food & Agriculture", members: 2103, color: "border-green-500/40 text-green-400" },
  { name: "Energy Freedom", members: 1856, color: "border-amber-500/40 text-amber-400" },
  { name: "Music & Dance", members: 3412, color: "border-pink-500/40 text-pink-400" },
  { name: "Comedy", members: 2890, color: "border-orange-500/40 text-orange-400" },
];

const sports = [
  { name: "Football", icon: Trophy },
  { name: "Basketball", icon: Trophy },
  { name: "Baseball", icon: Trophy },
];

const PROPOSAL_CAT_COLORS: Record<string, string> = {
  "emergency": "text-red-400",
  "hearth-building": "text-orange-400",
  "seeds-crops": "text-green-400",
  "blueprint-materials": "text-amber-400",
  "platform-change": "text-cyan-400",
  "other": "text-purple-400",
};

export default function ExplorePage() {
  const [streamMode, setStreamMode] = useState(false);
  const [streamCategory, setStreamCategory] = useState("all");
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateTribeFreq, setShowCreateTribeFreq] = useState(false);
  const [, setLocation] = useLocation();

  if (streamMode) {
    return <StreamView category={streamCategory} onBack={() => setStreamMode(false)} onCategoryChange={setStreamCategory} />;
  }

  if (showSearch) {
    return <SearchView query={searchQuery} setQuery={setSearchQuery} onBack={() => { setShowSearch(false); setSearchQuery(""); }} />;
  }

  return (
    <div className="flex flex-col min-h-screen pb-24 animate-in-fade">
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="text-4xl font-bold font-display" data-testid="text-explore-title">Explore</h1>
            <p className="text-muted-foreground text-sm mt-1">Tune In. Speak Freely.</p>
          </div>
          <button
            onClick={() => setShowCreateMenu(true)}
            className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/30"
            data-testid="button-upload-fab"
          >
            <Plus className="w-6 h-6 text-white" />
          </button>
        </div>

        <button
          onClick={() => setShowSearch(true)}
          className="w-full mt-4 flex items-center gap-3 px-4 py-3 glass-card rounded-xl text-muted-foreground text-sm"
          data-testid="button-open-search"
        >
          <Search className="w-4 h-4" />
          Search creators, tribes, frequencies...
        </button>
      </div>
      <div className="px-5 space-y-7 flex-1">
        <TribesSection
          onStream={() => { setStreamCategory("tribes"); setStreamMode(true); }}
          onCreateTribe={() => setShowCreateTribeFreq(true)}
        />

        <FrequenciesSection onStream={(cat: string) => { setStreamCategory(cat); setStreamMode(true); }} onCreateFrequency={() => setShowCreateTribeFreq(true)} />

        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold font-display">Sports</h2>
            </div>
            <button onClick={() => { setStreamCategory("sports"); setStreamMode(true); }} className="text-sm text-primary flex items-center gap-1" data-testid="button-sports-stream">
              Stream <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-3">
            {sports.map((s) => (
              <button
                key={s.name}
                onClick={() => { setStreamCategory("sports"); setStreamMode(true); }}
                className="flex-1 glass-card rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-cyan-500/30 transition-colors"
                data-testid={`card-sport-${s.name}`}
              >
                <s.icon className="w-8 h-8 text-cyan-400" />
                <span className="text-sm font-medium">{s.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FaHandFist className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold font-display">Mind Body Soul </h2>
            </div>
            <button onClick={() => { setStreamCategory("mbs-training"); setStreamMode(true); }} className="text-sm text-primary flex items-center gap-1" data-testid="button-mbs-training-stream">
              Stream <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
              <FaHandFist className="w-7 h-7 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm">MBS Training</h3>
              <p className="text-xs text-muted-foreground mt-0.5">The daily path of strengthening the Mind, Body, and Soul.</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <h2 className="text-lg font-bold font-display">Hearth Builders</h2>
            </div>
            <button onClick={() => { setStreamCategory("hearth-builders"); setStreamMode(true); }} className="text-sm text-primary flex items-center gap-1" data-testid="button-hearth-builders-stream">
              Stream <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shrink-0">
              <Flame className="w-7 h-7 text-orange-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm">Sovereign Hearths</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Rebuilding communities with freedom and purpose.</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
          </div>
        </section>

        <ImportantEventsSection />

        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold font-display">Blueprints</h2>
            </div>
            <Link href="/blueprints">
              <span className="text-sm text-primary flex items-center gap-1" data-testid="link-blueprints">
                See All <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Share designs, tutorials, PDFs and educational content with the community.</p>
          <div className="flex gap-3">
            <Link href="/blueprints" className="flex-1">
              <div className="glass-card rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-amber-500/30 transition-colors cursor-pointer" data-testid="card-blueprint-browse">
                <FileText className="w-8 h-8 text-amber-400" />
                <span className="text-sm font-medium">Browse</span>
                <span className="text-[11px] text-muted-foreground">Community designs</span>
              </div>
            </Link>
            <Link href="/upload?type=blueprint" className="flex-1">
              <div className="glass-card rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-green-500/30 transition-colors cursor-pointer" data-testid="card-blueprint-upload">
                <Plus className="w-8 h-8 text-green-400" />
                <span className="text-sm font-medium">Upload</span>
                <span className="text-[11px] text-muted-foreground">Share your blueprint</span>
              </div>
            </Link>
          </div>
        </section>
      </div>
      <Dialog open={showCreateMenu} onOpenChange={setShowCreateMenu}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FreeSoulEmblem className="w-6 h-6" /> Create Content
            </DialogTitle>
            <DialogDescription>Choose what type of content to create</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              { type: "camera", icon: Camera, label: "Record Video", color: "cyan" },
              { type: "photo", icon: Image, label: "Upload Photo", color: "pink" },
              { type: "video", icon: Film, label: "Upload Video", color: "purple" },
              { type: "audio", icon: Headphones, label: "Upload Audio", color: "green" },
            ].map((item) => (
              <button
                key={item.type}
                onClick={() => { setShowCreateMenu(false); setLocation(`/upload?type=${item.type}`); }}
                className={`glass-card rounded-xl p-4 flex flex-col items-center gap-2 hover:border-${item.color}-500/30 transition-colors`}
                data-testid={`button-create-${item.type}`}
              >
                <item.icon className={`w-8 h-8 text-${item.color}-400`} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <CreateTribeFrequencyDialog open={showCreateTribeFreq} onOpenChange={setShowCreateTribeFreq} />
      <NavBar />
    </div>
  );
}

function SearchView({ query, setQuery, onBack }: { query: string; setQuery: (q: string) => void; onBack: () => void }) {
  const { data: allUsers } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: async () => { const res = await fetch("/api/users", { credentials: "include" }); if (!res.ok) throw new Error("err"); return res.json(); },
  });
  const { data: tribes } = useTribes();

  const filteredUsers = query.length >= 2
    ? (allUsers || []).filter(u =>
      (u.firstName?.toLowerCase().includes(query.toLowerCase()) ||
        u.lastName?.toLowerCase().includes(query.toLowerCase()) ||
        u.email?.toLowerCase().includes(query.toLowerCase()))
    )
    : [];

  const filteredTribes = query.length >= 2
    ? (tribes || []).filter((t: any) =>
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.description?.toLowerCase().includes(query.toLowerCase())
    )
    : [];

  const filteredFreqs = query.length >= 2
    ? frequencies.filter(f => f.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="flex flex-col min-h-screen pb-24 animate-in-fade">
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="p-2 rounded-full bg-white/5 border border-white/10" data-testid="button-close-search">
            <X className="w-5 h-5" />
          </button>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search creators, tribes, frequencies..."
            className="flex-1 bg-white/5 border-white/10"
            autoFocus
            data-testid="input-search-explore"
          />
        </div>
      </div>

      <div className="px-5 flex-1 space-y-5">
        {query.length < 2 ? (
          <div className="text-center text-muted-foreground py-14 text-sm">
            Type at least 2 characters to search
          </div>
        ) : (
          <>
            {filteredUsers.length > 0 && (
              <section>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Creators</h3>
                <div className="space-y-2">
                  {filteredUsers.slice(0, 10).map(u => (
                    <Link key={u.id} href="/profile">
                      <div className="flex items-center gap-3 p-3 glass-card rounded-xl" data-testid={`search-user-${u.id}`}>
                        <img src={u.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${u.firstName}`} alt="" className="w-9 h-9 rounded-full border border-white/10" />
                        <div>
                          <p className="font-semibold text-sm">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-muted-foreground">@{u.email?.split("@")[0] || u.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {filteredTribes.length > 0 && (
              <section>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Tribes</h3>
                <div className="space-y-2">
                  {filteredTribes.map((t: any) => (
                    <Link key={t.id} href={`/tribes/${t.id}`}>
                      <div className="flex items-center gap-3 p-3 glass-card rounded-xl" data-testid={`search-tribe-${t.id}`}>
                        <div className="w-9 h-9 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                          <Shield className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.description || "Sovereign tribe"}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {filteredFreqs.length > 0 && (
              <section>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Frequencies</h3>
                <div className="flex gap-2 flex-wrap">
                  {filteredFreqs.map(f => (
                    <div key={f.name} className={`px-4 py-2 rounded-full border ${f.color} bg-white/5 text-sm font-medium`}>
                      {f.name} · {f.members.toLocaleString()}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {filteredUsers.length === 0 && filteredTribes.length === 0 && filteredFreqs.length === 0 && (
              <div className="text-center text-muted-foreground py-14 text-sm">
                No results found for "{query}"
              </div>
            )}
          </>
        )}
      </div>

      <NavBar />
    </div>
  );
}

function TribesSection({ onStream, onCreateTribe }: { onStream: () => void; onCreateTribe: () => void }) {
  const { data: tribes, isLoading } = useTribes();

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-bold font-display">Tribes</h2>
        </div>
        <button onClick={onStream} className="text-sm text-primary flex items-center gap-1" data-testid="button-tribes-stream">
          Stream <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
      ) : (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {(tribes || []).map((tribe: any) => (
            <Link key={tribe.id} href={`/tribes/${tribe.id}`}>
              <div className="w-[140px] shrink-0 glass-card rounded-2xl overflow-hidden cursor-pointer hover:border-purple-500/30 transition-colors" data-testid={`card-tribe-${tribe.id}`}>
                <div className="h-20 bg-gradient-to-br from-purple-900/60 to-indigo-900/40 flex items-center justify-center">
                  <Shield className="w-10 h-10 text-purple-400/50" />
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm truncate">{tribe.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">{Math.floor(Math.random() * 15000) + 100}</span>
                    </div>
                    {tribe.joinType === "approval" && (
                      <span className="text-[9px] text-amber-400 font-medium">Approval</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
          <button
            onClick={onCreateTribe}
            className="w-[140px] shrink-0 glass-card rounded-2xl p-4 flex flex-col items-center justify-center h-[130px] cursor-pointer hover:border-purple-500/30"
            data-testid="button-create-tribe-explore"
          >
            <Plus className="w-8 h-8 text-muted-foreground mb-2" />
            <span className="text-xs text-muted-foreground">Create Tribe</span>
          </button>
        </div>
      )}
    </section>
  );
}

function FrequenciesSection({ onStream, onCreateFrequency }: { onStream: (cat: string) => void; onCreateFrequency: () => void }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-bold font-display">Frequencies</h2>
        </div>
        <button onClick={onCreateFrequency} className="text-xs text-primary flex items-center gap-1" data-testid="button-create-frequency">
          <Plus className="w-3 h-3" /> Create
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {frequencies.map((f) => (
          <button key={f.name} onClick={() => onStream(f.name.toLowerCase().includes("music") ? "music" : f.name.toLowerCase().includes("comedy") ? "comedy" : "frequencies")} className="shrink-0">
            <div className={`px-4 py-2 rounded-full border ${f.color} bg-white/5 text-sm font-medium whitespace-nowrap`} data-testid={`chip-frequency-${f.name}`}>
              {f.name}
            </div>
            <p className="text-[11px] text-muted-foreground text-center mt-1.5">{f.members.toLocaleString()} members</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function CreateTribeFrequencyDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [tab, setTab] = useState<"tribe" | "frequency">("tribe");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [joinType, setJoinType] = useState("open");
  const { mutate: createTribe, isPending } = useCreateTribe();

  const handleCreate = () => {
    if (!name.trim()) return;
    if (tab === "tribe") {
      createTribe({ name, description, joinType } as any, {
        onSuccess: () => { setName(""); setDescription(""); setJoinType("open"); onOpenChange(false); }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FreeSoulEmblem className="w-6 h-6" /> Create
          </DialogTitle>
          <DialogDescription>Create a new tribe or frequency (max 8 each per account)</DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 bg-white/5 rounded-lg p-1 mb-4">
          <button
            onClick={() => setTab("tribe")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${tab === "tribe" ? "bg-primary text-white" : "text-muted-foreground"}`}
            data-testid="tab-create-tribe"
          >
            Tribe
          </button>
          <button
            onClick={() => setTab("frequency")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${tab === "frequency" ? "bg-primary text-white" : "text-muted-foreground"}`}
            data-testid="tab-create-frequency"
          >
            Frequency
          </button>
        </div>

        <p className="text-xs text-muted-foreground mb-3">
          You can create up to 8 {tab === "tribe" ? "tribes" : "frequencies"} per account.
        </p>

        <div className="space-y-3">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={tab === "tribe" ? "Tribe name" : "Frequency name"}
            className="bg-white/5 border-white/10"
            data-testid="input-create-name"
          />
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="bg-white/5 border-white/10"
            data-testid="input-create-description"
          />

          {tab === "tribe" && (
            <div className="space-y-2">
              <Label className="text-sm">Join Type</Label>
              <Select value={joinType} onValueChange={setJoinType}>
                <SelectTrigger className="bg-white/5 border-white/10" data-testid="select-join-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open — Anyone can join</SelectItem>
                  <SelectItem value="approval">Approval — Requires approval to join</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            onClick={handleCreate}
            disabled={!name.trim() || isPending}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600"
            data-testid="button-submit-create"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Create {tab === "tribe" ? "Tribe" : "Frequency"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ImportantEventsSection() {
  const [, setLocation] = useLocation();

  const { data: proposals = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/proposals", "explore"],
    queryFn: async () => {
      const res = await fetch("/api/proposals?status=active", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const active = (proposals as any[]).slice(0, 4);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-bold font-display">Important Events</h2>
        </div>
        <Link href="/governance">
          <span className="text-sm text-primary flex items-center gap-1" data-testid="link-governance-propose">
            Propose <Vote className="w-4 h-4" />
          </span>
        </Link>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 text-primary animate-spin" /></div>
      ) : active.length === 0 ? (
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-sm text-muted-foreground">No active proposals.</p>
          <Link href="/governance">
            <span className="text-xs text-primary mt-1 block underline">Be the first to propose</span>
          </Link>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {active.map((p: any) => {
            const catColor = PROPOSAL_CAT_COLORS[p.category] || "text-purple-400";
            const isNullified = p.status === "nullified";
            const total = p.supportCount + p.nullifyCount;
            const nullifyPct = total > 0 ? (p.nullifyCount / total) * 100 : 0;
            return (
              <button
                key={p.id}
                onClick={() => setLocation(`/governance?id=${p.id}`)}
                className={`w-[165px] shrink-0 glass-card rounded-2xl p-4 text-left ${isNullified ? "border-red-500/20" : ""}`}
                data-testid={`card-event-proposal-${p.id}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-semibold uppercase tracking-wide ${catColor}`}>
                    {p.category.replace(/-/g, " ")}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border capitalize ${
                    p.status === "nullified" ? "text-red-400 bg-red-500/10 border-red-500/30" :
                    p.status === "funded" ? "text-amber-400 bg-amber-500/10 border-amber-500/30" :
                    p.status === "expired" ? "text-gray-400 bg-gray-500/10 border-gray-500/30" :
                    "text-green-400 bg-green-500/10 border-green-500/30"
                  }`}>{p.status}</span>
                </div>
                <h3 className="font-semibold text-xs mb-2 line-clamp-2 leading-snug">{p.title}</h3>
                {isNullified && (
                  <div className="flex items-center gap-1 mb-1.5">
                    <AlertTriangle className="w-3 h-3 text-red-400" />
                    <span className="text-[10px] text-red-400 font-medium">Nullified</span>
                  </div>
                )}
                <div className="flex rounded-full overflow-hidden h-1.5 bg-white/5">
                  <div className="bg-green-500" style={{ width: `${100 - Math.min(nullifyPct, 100)}%` }} />
                  <div className="bg-red-500" style={{ width: `${Math.min(nullifyPct, 100)}%` }} />
                </div>
                <div className="flex justify-between mt-1 text-[9px] text-muted-foreground">
                  <span>{p.supportCount} ✓</span>
                  <span>{p.nullifyCount} ✗</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

function StreamView({ category, onBack, onCategoryChange }: { category: string; onBack: () => void; onCategoryChange: (c: string) => void }) {
  const { data: videos, isLoading } = useVideos(undefined, category === "all" ? undefined : category);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="absolute top-0 left-0 right-0 z-30 p-4 space-y-3">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center" data-testid="button-close-stream">
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="flex gap-1 bg-black/40 backdrop-blur-md rounded-full p-1 overflow-x-auto scrollbar-hide">
          {streamCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                cat.id === category ? "bg-primary text-white" : "text-white/70 hover:text-white"
              }`}
              data-testid={`stream-tab-${cat.id}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      ) : videos && videos.length > 0 ? (
        <div
          className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
          onScroll={(e) => {
            const target = e.currentTarget;
            const idx = Math.round(target.scrollTop / target.clientHeight);
            setActiveIndex(idx);
          }}
        >
          {videos.map((video: any, idx: number) => (
            <VideoCard key={video.id} video={video} isActive={idx === activeIndex} />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <Film className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h3 className="font-bold text-lg mb-2">No content yet</h3>
          <p className="text-sm text-muted-foreground">Be the first to share content in this category.</p>
        </div>
      )}
    </div>
  );
}
