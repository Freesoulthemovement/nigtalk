import { Link, useLocation } from "wouter";
import { Compass, Radio, Plus, HeartHandshake, User, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Compass, label: "Explore", href: "/" },
  { icon: Radio, label: "Radio", href: "/radio" },
  { icon: Plus, label: "Upload", href: "/upload", accent: true },
  { icon: HeartHandshake, label: "Bestowal", href: "/bestowal" },
  { icon: User, label: "Profile", href: "/profile" },
];

export function NavBar() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-card/95 backdrop-blur-xl border-t border-border z-50 flex items-center justify-around px-2 safe-area-bottom" data-testid="nav-bottom-bar">
      {navItems.map((item) => {
        const isActive = location === item.href;
        return (
          <Link key={item.href} href={item.href}>
            <div
              className={cn(
                "flex flex-col items-center gap-1 p-2 transition-all duration-200 min-w-[56px]",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              {item.accent ? (
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center -mt-4 shadow-lg shadow-primary/30">
                  <item.icon className="w-5 h-5 text-white" />
                </div>
              ) : (
                <item.icon className={cn("w-6 h-6", isActive && "stroke-[2.5px]")} />
              )}
              <span className="text-[10px] font-medium">{item.label}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
