import { Button } from "@/components/ui/button";
import { ArrowRight, Globe2, Users, HeartHandshake } from "lucide-react";

export default function LandingPage() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe2 className="w-6 h-6 text-primary" />
            <span className="text-2xl font-bold font-display tracking-tight">NigTalk</span>
          </div>
          <Button onClick={handleLogin} variant="default" className="font-semibold shadow-lg shadow-primary/20">
            Log In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/50 animate-in-fade">
              Connect Your Tribe.
              <br />
              <span className="text-primary">Amplify Your Voice.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              The social platform for non-profits and movements. Share short-form video stories and build deep community connections with real-time chat.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" onClick={handleLogin} className="text-lg px-8 py-6 rounded-2xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/25 hover:scale-105 transition-all duration-300">
                Join the Movement <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-card/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 rounded-3xl bg-card border border-border hover:border-primary/50 transition-colors group">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Globe2 className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Global Reach</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Share your message with the world through engaging short-form videos designed for virality and impact.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-card border border-border hover:border-primary/50 transition-colors group">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Tribe Communities</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Create private or public tribes. Chat in real-time, organize events, and coordinate mutual bestowal.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-card border border-border hover:border-primary/50 transition-colors group">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <HeartHandshake className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Mutual Bestowal</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Built for non-profits and ecclesiastical movements. Tools designed to foster generosity and support.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-8 text-center text-muted-foreground">
        <p>&copy; 2024 NigTalk. All rights reserved.</p>
      </footer>
    </div>
  );
}
