import { useState } from "react";
import { NavBar } from "@/components/nav-bar";
import { useVideos } from "@/hooks/use-videos";
import { VideoCard } from "@/components/video-card";
import { Loader2, ArrowLeft, Compass, Users, Radio, Dumbbell, FileText, Shuffle } from "lucide-react";
import { Link } from "wouter";
import { useTribes } from "@/hooks/use-tribes";

const categories = [
  { id: "tribes", label: "Tribes", icon: Users, color: "from-violet-500 to-purple-600", description: "Community movements & organizations" },
  { id: "frequencies", label: "Frequencies", icon: Radio, color: "from-cyan-500 to-blue-600", description: "Tune into live streams & broadcasts" },
  { id: "sports", label: "Sports", icon: Dumbbell, color: "from-orange-500 to-red-600", description: "Athletic content & competitions" },
  { id: "blueprints", label: "Blueprints", icon: FileText, color: "from-emerald-500 to-green-600", description: "Plans, guides & sovereign knowledge" },
  { id: "random", label: "Random", icon: Shuffle, color: "from-pink-500 to-rose-600", description: "Random chats & giveaways" },
];

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  if (activeCategory) {
    return <StreamView category={activeCategory} onBack={() => setActiveCategory(null)} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <div className="p-4 pt-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Compass className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display" data-testid="text-explore-title">Explore</h1>
              <p className="text-sm text-muted-foreground">Discover content across the movement</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 text-left hover:border-primary/50 hover:-translate-y-1 transition-all duration-300"
                data-testid={`button-category-${cat.id}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <cat.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">{cat.label}</h3>
                  <p className="text-sm text-muted-foreground">{cat.description}</p>
                </div>
              </button>
            ))}
          </div>

          <TribesList />
        </div>
      </div>
      <NavBar />
    </div>
  );
}

function TribesList() {
  const { data: tribes, isLoading } = useTribes();

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold font-display">Active Tribes</h2>
        <Link href="/tribes">
          <span className="text-sm text-primary hover:underline cursor-pointer" data-testid="link-view-all-tribes">View All</span>
        </Link>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {tribes?.slice(0, 5).map((tribe: any) => (
            <Link key={tribe.id} href={`/tribes/${tribe.id}`}>
              <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors cursor-pointer" data-testid={`card-tribe-${tribe.id}`}>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{tribe.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{tribe.description || "A community tribe"}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StreamView({ category, onBack }: { category: string; onBack: () => void }) {
  const { data: videos, isLoading } = useVideos(undefined, category);
  const [activeIndex, setActiveIndex] = useState(0);

  const categoryInfo = categories.find((c) => c.id === category);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center gap-2 p-4 bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={onBack} className="p-2 rounded-full bg-white/10 backdrop-blur-md" data-testid="button-back-from-stream">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                if (cat.id !== category) {
                  onBack();
                  setTimeout(() => {
                    const el = document.querySelector(`[data-testid="button-category-${cat.id}"]`);
                    if (el) (el as HTMLButtonElement).click();
                  }, 100);
                }
              }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                cat.id === category
                  ? "bg-primary text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
              data-testid={`button-stream-tab-${cat.id}`}
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
          {videos.map((video, index) => (
            <VideoCard key={video.id} video={video} isActive={index === activeIndex} />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-white/60 p-8 text-center">
          {categoryInfo && <categoryInfo.icon className="w-16 h-16 mb-4 opacity-30" />}
          <h2 className="text-xl font-bold mb-2">No {categoryInfo?.label} Content Yet</h2>
          <p className="text-sm">Be the first to share content in this category!</p>
        </div>
      )}
    </div>
  );
}
