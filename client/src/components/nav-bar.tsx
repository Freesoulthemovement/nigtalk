import { Link, useLocation } from "wouter";
import { Compass, Plus, HeartHandshake, User, Vote } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Compass, label: "Explore", href: "/" },
  { icon: Vote, label: "Govern", href: "/governance" },
  { icon: Plus, label: "", href: "/upload", accent: true },
  { icon: HeartHandshake, label: "Bestowal", href: "/bestowal" },
  { icon: User, label: "Profile", href: "/profile" },
];

export function NavBar() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 z-50 safe-area-bottom" data-testid="nav-bottom-bar">
      <div className="h-full bg-[hsl(222,41%,6%)]/95 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-4">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex flex-col items-center gap-1 p-2 transition-all duration-200 min-w-[50px]",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
                data-testid={`nav-${item.label.toLowerCase() || "upload"}`}
              >
                {item.accent ? (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center -mt-6 shadow-lg shadow-cyan-500/30">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                ) : (
                  <>
                    <item.icon className={cn("w-6 h-6", isActive && "stroke-[2.5px]")} />
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
