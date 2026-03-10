import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { ArrowLeft, User, LinkIcon, Building, HandCoins, FileText, LayoutDashboard, SlidersHorizontal, ChevronRight, BookOpen, Shield, Scale } from "lucide-react";
import { FreeSoulEmblem } from "@/components/free-soul-emblem";

interface SettingsItem {
  icon: any;
  label: string;
  desc: string;
  href: string;
  color: string;
  isLink?: boolean;
}

const settingsItems: { section: string; items: SettingsItem[] }[] = [
  {
    section: "Account",
    items: [
      { icon: User, label: "Edit Profile", desc: "Update your name, bio, and profile photo", href: "#edit-profile", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
      { icon: LinkIcon, label: "Add Link", desc: "Add a website, social media, or portfolio link", href: "#add-link", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
      { icon: Building, label: "Add Ministry or Charity", desc: "Register a ministry, church, or nonprofit", href: "#add-ministry", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    ],
  },
  {
    section: "Finance & Donations",
    items: [
      { icon: HandCoins, label: "Donation Tracker", desc: "View and manage your donations and bestowal history", href: "#donation-tracker", color: "text-green-400 bg-green-500/10 border-green-500/20" },
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
      { icon: LayoutDashboard, label: "Change Profile Layout Mode", desc: "Switch between grid, list, or gallery view", href: "#layout-mode", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
      { icon: SlidersHorizontal, label: "Customize Algorithm", desc: "Adjust your feed preferences and content recommendations", href: "#customize-algo", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
    ],
  },
];

export default function SettingsPage() {
  const { user } = useAuth();

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
                return <button key={item.label} className="w-full">{content}</button>;
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
    </div>
  );
}
