import { useState } from "react";
import { NavBar } from "@/components/nav-bar";
import { Link } from "wouter";
import { ArrowLeft, Lightbulb, Plus, FileText, Film, Upload, ChevronRight, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FreeSoulEmblem } from "@/components/free-soul-emblem";

const sampleBlueprints = [
  { id: 1, title: "Vertical Hydroponic Garden System", author: "Sage Garden", type: "PDF + Video", category: "Food Sovereignty", likes: 342 },
  { id: 2, title: "Off-Grid Solar Power Setup Guide", author: "Energy Collective", type: "PDF", category: "Energy Freedom", likes: 218 },
  { id: 3, title: "Community Land Trust Framework", author: "Sovereign Builders", type: "Video", category: "Land Stewardship", likes: 156 },
  { id: 4, title: "Natural Building: Cob & Earthbag", author: "Earth Makers", type: "PDF + Video", category: "Housing", likes: 289 },
  { id: 5, title: "Rainwater Harvesting for Tribes", author: "Water Keepers", type: "PDF", category: "Water Sovereignty", likes: 194 },
  { id: 6, title: "Mesh Network Communication Setup", author: "Tech Tribe", type: "Video", category: "Sovereign Tech", likes: 167 },
];

export default function BlueprintsPage() {
  const [search, setSearch] = useState("");

  const filtered = search.length >= 2
    ? sampleBlueprints.filter(b =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase())
    )
    : sampleBlueprints;

  return (
    <div className="flex flex-col min-h-screen pb-24 animate-in-fade">
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <button className="p-2 rounded-full bg-white/5 border border-white/10" data-testid="button-back-from-blueprints">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <h1 className="text-2xl font-bold font-display" data-testid="text-blueprints-title">Blueprints</h1>
            </div>
          </div>
          <Link href="/upload?type=blueprint">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-sm font-medium" data-testid="button-upload-blueprint">
              <Plus className="w-4 h-4" /> Share
            </button>
          </Link>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Community designs, tutorials, and educational content. Upload PDFs or videos of your blueprints to share knowledge.
        </p>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search blueprints..."
            className="pl-10 bg-white/5 border-white/10"
            data-testid="input-search-blueprints"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      <div className="px-5 flex-1 space-y-3">
        {filtered.map((bp) => (
          <div key={bp.id} className="glass-card rounded-2xl p-4 flex items-center gap-4 hover:border-amber-500/20 transition-colors" data-testid={`card-blueprint-${bp.id}`}>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              {bp.type.includes("Video") ? <Film className="w-6 h-6 text-amber-400" /> : <FileText className="w-6 h-6 text-amber-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm">{bp.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">by {bp.author}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground">{bp.type}</span>
                <span className="text-[10px] text-muted-foreground">{bp.category}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-14 text-muted-foreground glass-card rounded-2xl">
            <p className="text-sm">No blueprints found for "{search}"</p>
          </div>
        )}

        <div className="glass-card rounded-2xl p-6 text-center border-dashed border-amber-500/20">
          <Upload className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h3 className="font-bold text-sm mb-1">Share Your Blueprint</h3>
          <p className="text-xs text-muted-foreground mb-3">Upload PDFs or videos of your designs to educate the community.</p>
          <Link href="/upload?type=blueprint">
            <button className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-sm font-semibold text-white" data-testid="button-share-blueprint-cta">
              Upload Blueprint
            </button>
          </Link>
        </div>
      </div>

      <NavBar />
    </div>
  );
}
