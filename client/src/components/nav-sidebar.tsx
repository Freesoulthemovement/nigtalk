import { Link, useLocation } from "wouter";
import { Home, Users, User, Video, PlusCircle, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function NavSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { icon: Home, label: "Feed", href: "/" },
    { icon: Users, label: "Tribes", href: "/tribes" },
    { icon: Video, label: "Upload", href: "/upload" },
    { icon: User, label: "Profile", href: "/profile" },
  ];

  if (!user) return null;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r bg-card/50 backdrop-blur-xl z-50">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            NigTalk
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group",
                  location === item.href
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 font-medium"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", location === item.href ? "stroke-[2.5px]" : "")} />
                <span>{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <img
              src={user.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName}`}
              alt={user.firstName || "User"}
              className="w-10 h-10 rounded-full border border-border"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-muted-foreground truncate">@{user.email?.split('@')[0]}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive" onClick={() => logout()}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/90 backdrop-blur-xl border-t border-border z-50 flex items-center justify-around px-4">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className={cn(
                "flex flex-col items-center gap-1 p-2 transition-colors",
                location === item.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("w-6 h-6", location === item.href && "fill-current")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>
    </>
  );
}
