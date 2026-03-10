import { useState } from "react";
import { NavBar } from "@/components/nav-bar";
import { useVideos } from "@/hooks/use-videos";
import { VideoCard } from "@/components/video-card";
import { Loader2, Plus, Shield, Radio, Trophy, Globe, Shuffle, FileText, ChevronRight, X, Users } from "lucide-react";
import { Link } from "wouter";
import { useTribes } from "@/hooks/use-tribes";

const streamCategories = [
  { id: "all", label: "All" },
  { id: "tribes", label: "Tribes" },
  { id: "sports", label: "Sports" },
  { id: "events", label: "Events" },
  { id: "nonprofits", label: "Nonprofits" },
];

const frequencies = [
  { name: "Sovereign Tech", members: 1247, color: "border-cyan-500/40 text-cyan-400" },
  { name: "Food Sovereignty", members: 2103, color: "border-green-500/40 text-green-400" },
  { name: "Energy Freedom", members: 1856, color: "border-amber-500/40 text-amber-400" },
];

const sports = [
  { name: "Football", icon: Trophy },
  { name: "Basketball", icon: Trophy },
  { name: "Baseball", icon: Trophy },
];

const events = [
  { title: "Global Climate Summit 2025", tag: "Politics" },
  { title: "Wildfire Relief Efforts", tag: "Disasters" },
];

export default function ExplorePage() {
  const [streamMode, setStreamMode] = useState(false);
  const [streamCategory, setStreamCategory] = useState("all");

  if (streamMode) {
    return <StreamView category={streamCategory} onBack={() => setStreamMode(false)} onCategoryChange={setStreamCategory} />;
  }

  return (
    <div className="flex flex-col min-h-screen pb-24 animate-in-fade">
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="text-4xl font-bold font-display" data-testid="text-explore-title">Explore</h1>
            <p className="text-muted-foreground text-sm mt-1">Tune In. Speak Freely.</p>
          </div>
          <Link href="/upload">
            <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/30" data-testid="button-upload-fab">
              <Plus className="w-6 h-6 text-white" />
            </div>
          </Link>
        </div>
      </div>

      <div className="px-5 space-y-7 flex-1">
        <TribesSection onStream={() => { setStreamCategory("tribes"); setStreamMode(true); }} />

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Radio className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-bold font-display">Frequencies</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {frequencies.map((f) => (
              <div key={f.name} className="shrink-0">
                <div className={`px-4 py-2 rounded-full border ${f.color} bg-white/5 text-sm font-medium whitespace-nowrap`} data-testid={`chip-frequency-${f.name}`}>
                  {f.name}
                </div>
                <p className="text-[11px] text-muted-foreground text-center mt-1.5">{f.members.toLocaleString()} members</p>
              </div>
            ))}
          </div>
        </section>

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
              <Globe className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-bold font-display">Important Events</h2>
            </div>
            <button onClick={() => { setStreamCategory("events"); setStreamMode(true); }} className="text-sm text-primary flex items-center gap-1" data-testid="button-events-stream">
              Stream <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-3">
            {events.map((e) => (
              <div key={e.title} className="flex-1 glass-card rounded-2xl p-4" data-testid={`card-event-${e.tag}`}>
                <h3 className="font-semibold text-sm mb-2">{e.title}</h3>
                <span className="text-xs text-muted-foreground">{e.tag}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-bold font-display">Blueprints</h2>
            </div>
            <Link href="/blueprints">
              <span className="text-sm text-primary flex items-center gap-1" data-testid="link-blueprints">
                See All <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </section>
      </div>

      <NavBar />
    </div>
  );
}

function TribesSection({ onStream }: { onStream: () => void }) {
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
                  <div className="flex items-center gap-1 mt-1">
                    <Users className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">{Math.floor(Math.random() * 15000) + 100}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {(!tribes || tribes.length === 0) && (
            <Link href="/tribes">
              <div className="w-[140px] shrink-0 glass-card rounded-2xl p-4 flex flex-col items-center justify-center h-[130px] cursor-pointer hover:border-purple-500/30">
                <Plus className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground">Create Tribe</span>
              </div>
            </Link>
          )}
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
                cat.id === category
                  ? "bg-primary text-white"
                  : "text-white/70 hover:text-white"
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
            const idx = Math.round(e.currentTarget.scrollTop / e.currentTarget.clientHeight);
            setActiveIndex(idx);
          }}
        >
          {videos.map((video: any, index: number) => (
            <VideoCard key={video.id} video={video} isActive={index === activeIndex} />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-white/50 p-8 text-center">
          <h2 className="text-xl font-bold mb-2">No content yet</h2>
          <p className="text-sm">Be the first to share in this category!</p>
        </div>
      )}
    </div>
  );
}
