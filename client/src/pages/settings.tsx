import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { ArrowLeft, User, LinkIcon, Building, HandCoins, FileText, LayoutDashboard, SlidersHorizontal, ChevronRight, X, Camera, Save } from "lucide-react";
import { FreeSoulEmblem } from "@/components/free-soul-emblem";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface SettingsItem {
  icon: any;
  label: string;
  desc: string;
  href: string;
  color: string;
  isLink?: boolean;
  action?: string;
}

const settingsItems: { section: string; items: SettingsItem[] }[] = [
  {
    section: "Account",
    items: [
      { icon: User, label: "Edit Profile", desc: "Update your name, bio, and profile photo", href: "#", color: "text-purple-400 bg-purple-500/10 border-purple-500/20", action: "edit-profile" },
      { icon: LinkIcon, label: "Add Link", desc: "Add a website, social media, or portfolio link", href: "#", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20", action: "add-link" },
      { icon: Building, label: "Add Ministry or Charity", desc: "Register a ministry, church, or nonprofit", href: "#", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", action: "add-ministry" },
    ],
  },
  {
    section: "Finance & Donations",
    items: [
      { icon: HandCoins, label: "Donation Tracker", desc: "View and manage your donations and bestowal history", href: "/bestowal", color: "text-green-400 bg-green-500/10 border-green-500/20", isLink: true },
    ],
  },
  {
    section: "Documents & Resources",
    items: [
      { icon: FileText, label: "Official PMA Documents", desc: "Free Soul Charter, Living Dictionary, Constitution, PMA Agreement, Trust Indenture", href: "/library", color: "text-pink-400 bg-pink-500/10 border-pink-500/20", isLink: true },
    ],
  },
  {
    section: "Customization",
    items: [
      { icon: LayoutDashboard, label: "Change Profile Layout Mode", desc: "Switch between grid, list, or gallery view", href: "#", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20", action: "layout-mode" },
      { icon: SlidersHorizontal, label: "Customize Algorithm", desc: "Adjust your feed preferences and content recommendations", href: "#", color: "text-rose-400 bg-rose-500/10 border-rose-500/20", action: "customize-algo" },
    ],
  },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  const [editFirstName, setEditFirstName] = useState(user?.firstName || "");
  const [editLastName, setEditLastName] = useState(user?.lastName || "");
  const [editBio, setEditBio] = useState("");

  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");

  const [ministryName, setMinistryName] = useState("");
  const [ministryDesc, setMinistryDesc] = useState("");
  const [ministryType, setMinistryType] = useState("ministry");

  const [layoutMode, setLayoutMode] = useState("grid");

  const [algoNonprofits, setAlgoNonprofits] = useState([20]);
  const [algoNewCreators, setAlgoNewCreators] = useState([20]);
  const [algoFavorites, setAlgoFavorites] = useState([20]);
  const [algoSameTribes, setAlgoSameTribes] = useState([10]);
  const [algoBoosted, setAlgoBoosted] = useState([10]);
  const [algoRandom, setAlgoRandom] = useState([20]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/users/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Profile Updated" });
      setActiveDialog(null);
    },
  });

  const handleItemClick = (item: SettingsItem) => {
    if (item.action) {
      if (item.action === "edit-profile") {
        setEditFirstName(user?.firstName || "");
        setEditLastName(user?.lastName || "");
      }
      setActiveDialog(item.action);
    }
  };

  return (
    <div className="flex flex-col min-h-screen animate-in-fade pb-8">
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/profile">
            <button className="p-2 rounded-full bg-white/5 border border-white/10" data-testid="button-back-from-settings">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <FreeSoulEmblem className="w-6 h-6" />
            <h1 className="text-2xl font-bold font-display" data-testid="text-settings-title">Settings</h1>
          </div>
        </div>

        {user && (
          <div className="glass-card rounded-2xl p-4 flex items-center gap-4 mb-6">
            <img
              src={user.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName}`}
              alt="Profile"
              className="w-14 h-14 rounded-full border-2 border-purple-500/30"
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm" data-testid="text-settings-user-name">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-muted-foreground">@{user.email?.split("@")[0] || user.id.slice(0, 8)}</p>
            </div>
          </div>
        )}
      </div>

      <div className="px-5 flex-1 space-y-6">
        {settingsItems.map((group) => (
          <section key={group.section}>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">{group.section}</h3>
            <div className="space-y-2">
              {group.items.map((item) => {
                const content = (
                  <div className="w-full glass-card rounded-xl p-4 flex items-center gap-4 hover:border-purple-500/20 transition-colors text-left" data-testid={`settings-item-${item.label.toLowerCase().replace(/\s+/g, "-")}`}>
                    <div className={`w-10 h-10 rounded-xl border ${item.color} flex items-center justify-center shrink-0`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{item.label}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </div>
                );

                if (item.isLink) {
                  return <Link key={item.label} href={item.href}>{content}</Link>;
                }
                return <button key={item.label} className="w-full" onClick={() => handleItemClick(item)}>{content}</button>;
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="text-center pt-6 pb-4">
        <div className="flex items-center justify-center gap-2">
          <FreeSoulEmblem className="w-5 h-5" />
          <p className="text-xs text-muted-foreground">NigTalk by Free Soul the Movement</p>
        </div>
        <p className="text-xs mt-1">
          <a href="mailto:nigtalksupport@freesoulthemovement" className="text-primary hover:underline" data-testid="link-settings-support">nigtalksupport@freesoulthemovement</a>
        </p>
      </div>

      <Dialog open={activeDialog === "edit-profile"} onOpenChange={(o) => !o && setActiveDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your name and bio</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="flex items-center justify-center">
              <div className="relative">
                <img src={user?.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.firstName}`} alt="" className="w-20 h-20 rounded-full border-2 border-purple-500/30" />
                <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center border-2 border-background">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">First Name</Label>
              <Input value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} className="bg-white/5 border-white/10" data-testid="input-edit-firstname" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Last Name</Label>
              <Input value={editLastName} onChange={(e) => setEditLastName(e.target.value)} className="bg-white/5 border-white/10" data-testid="input-edit-lastname" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Bio</Label>
              <Textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="Tell the tribe about yourself..." className="bg-white/5 border-white/10 min-h-[80px]" data-testid="input-edit-bio" />
            </div>
            <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600" onClick={() => updateProfileMutation.mutate({ firstName: editFirstName, lastName: editLastName })} disabled={updateProfileMutation.isPending} data-testid="button-save-profile">
              <Save className="w-4 h-4 mr-2" /> Save Profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === "add-link"} onOpenChange={(o) => !o && setActiveDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
            <DialogDescription>Add a website, social media, or portfolio link to your profile</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-sm">Link Title</Label>
              <Input value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} placeholder="e.g. My Website" className="bg-white/5 border-white/10" data-testid="input-link-title" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">URL</Label>
              <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." className="bg-white/5 border-white/10" data-testid="input-link-url" />
            </div>
            <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500" onClick={() => { toast({ title: "Link Added", description: `${linkTitle} has been added to your profile.` }); setActiveDialog(null); setLinkUrl(""); setLinkTitle(""); }} disabled={!linkTitle || !linkUrl} data-testid="button-save-link">
              <Save className="w-4 h-4 mr-2" /> Save Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === "add-ministry"} onOpenChange={(o) => !o && setActiveDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Ministry or Charity</DialogTitle>
            <DialogDescription>Register a ministry, church, or nonprofit organization</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="flex gap-2">
              {["ministry", "church", "nonprofit"].map((t) => (
                <button key={t} onClick={() => setMinistryType(t)} className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all ${ministryType === t ? "bg-primary text-white" : "bg-white/5 text-muted-foreground border border-white/10"}`} data-testid={`button-ministry-type-${t}`}>{t}</button>
              ))}
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Organization Name</Label>
              <Input value={ministryName} onChange={(e) => setMinistryName(e.target.value)} placeholder="Name of your organization" className="bg-white/5 border-white/10" data-testid="input-ministry-name" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Description</Label>
              <Textarea value={ministryDesc} onChange={(e) => setMinistryDesc(e.target.value)} placeholder="What does your organization do?" className="bg-white/5 border-white/10 min-h-[80px]" data-testid="input-ministry-desc" />
            </div>
            <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500" onClick={() => { toast({ title: "Organization Registered", description: `${ministryName} has been registered.` }); setActiveDialog(null); setMinistryName(""); setMinistryDesc(""); }} disabled={!ministryName} data-testid="button-save-ministry">
              <Save className="w-4 h-4 mr-2" /> Register
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === "layout-mode"} onOpenChange={(o) => !o && setActiveDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Profile Layout Mode</DialogTitle>
            <DialogDescription>Choose how your content is displayed on your profile</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 mt-2">
            {[
              { value: "grid", label: "Grid", desc: "3-column grid" },
              { value: "list", label: "List", desc: "Full-width cards" },
              { value: "gallery", label: "Gallery", desc: "Large previews" },
            ].map((m) => (
              <button key={m.value} onClick={() => setLayoutMode(m.value)} className={`p-4 rounded-xl text-center transition-all ${layoutMode === m.value ? "bg-primary/20 border border-primary/40 text-primary" : "glass-card hover:border-white/20"}`} data-testid={`button-layout-${m.value}`}>
                <p className="font-semibold text-sm">{m.label}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{m.desc}</p>
              </button>
            ))}
          </div>
          <Button className="w-full mt-3 bg-gradient-to-r from-indigo-500 to-purple-500" onClick={() => { toast({ title: "Layout Updated", description: `Profile layout set to ${layoutMode}.` }); setActiveDialog(null); }} data-testid="button-save-layout">
            <Save className="w-4 h-4 mr-2" /> Apply Layout
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === "customize-algo"} onOpenChange={(o) => !o && setActiveDialog(null)}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customize Algorithm</DialogTitle>
            <DialogDescription>Adjust category weights to optimize your Explore feed</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 mt-3">
            {[
              { label: "Nonprofits", value: algoNonprofits, set: setAlgoNonprofits, min: 10, color: "text-green-400" },
              { label: "New Creators", value: algoNewCreators, set: setAlgoNewCreators, min: 5, color: "text-cyan-400" },
              { label: "Favorite / Most Interacted Creators", value: algoFavorites, set: setAlgoFavorites, min: 5, color: "text-purple-400" },
              { label: "Users From Same Tribes", value: algoSameTribes, set: setAlgoSameTribes, min: 5, color: "text-amber-400" },
              { label: "Boosted / Promoted Content", value: algoBoosted, set: setAlgoBoosted, min: 5, color: "text-pink-400" },
              { label: "Random / Discovery", value: algoRandom, set: setAlgoRandom, min: 5, color: "text-blue-400" },
            ].map((s) => (
              <div key={s.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className={`text-sm font-medium ${s.color}`}>{s.label}</Label>
                  <span className="text-sm font-bold">{s.value[0]}%</span>
                </div>
                <Slider value={s.value} onValueChange={s.set} min={s.min} max={50} step={1} className="w-full" data-testid={`slider-algo-${s.label.toLowerCase().replace(/\s+/g, "-")}`} />
                <p className="text-[10px] text-muted-foreground">Min: {s.min}%</p>
              </div>
            ))}
            <div className="glass-card rounded-xl p-3 mt-2">
              <p className="text-xs text-muted-foreground text-center">
                Total allocation: <span className="font-bold text-foreground">{algoNonprofits[0] + algoNewCreators[0] + algoFavorites[0] + algoSameTribes[0] + algoBoosted[0] + algoRandom[0]}%</span>
              </p>
            </div>
            <Button className="w-full bg-gradient-to-r from-rose-500 to-pink-500" onClick={() => { toast({ title: "Algorithm Updated", description: "Your feed preferences have been saved." }); setActiveDialog(null); }} data-testid="button-save-algo">
              <Save className="w-4 h-4 mr-2" /> Save Preferences
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
