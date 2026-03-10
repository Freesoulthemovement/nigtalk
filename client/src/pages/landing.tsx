import { Button } from "@/components/ui/button";
import { ArrowRight, Globe2, Users, HeartHandshake, Radio, Shield } from "lucide-react";

export default function LandingPage() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <nav className="border-b border-border/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe2 className="w-6 h-6 text-primary" />
            <span className="text-2xl font-bold font-display tracking-tight" data-testid="text-app-name">NigTalk</span>
          </div>
          <Button onClick={handleLogin} variant="default" className="font-semibold shadow-lg shadow-primary/20 rounded-xl" data-testid="button-login">
            Log In
          </Button>
        </div>
      </nav>

      <main className="flex-1">
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/50">
              Connect Your Tribe.
              <br />
              <span className="text-primary">Amplify Your Voice.</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              The social platform for the Free Soul Movement. Short-form video, tribal messaging, push-to-talk radio, and mutual bestowal — all in one sovereign community.
            </p>

            <Button size="lg" onClick={handleLogin} className="text-lg px-8 py-6 rounded-2xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/25 hover:scale-105 transition-all duration-300" data-testid="button-join-movement">
              Join the Movement <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </section>

        <section className="py-24 bg-card/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Globe2, title: "Stream Mode", desc: "TikTok-style vertical video feeds across tribes, sports, frequencies & blueprints." },
                { icon: Users, title: "Tribes", desc: "Create or join tribes. Chat in real-time, organize, and build community." },
                { icon: Radio, title: "Push-to-Talk", desc: "Go online and broadcast live. Walkie-talkie-style tribal communication." },
                { icon: HeartHandshake, title: "Bestowal", desc: "Support creators with Free Soul Coin. 1 FSC = $100. Sovereign value exchange." },
              ].map((feature) => (
                <div key={feature.title} className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-6 text-center text-muted-foreground text-sm">
        <p>&copy; 2026 NigTalk — Free Soul The Movement</p>
        <p className="mt-1">
          <a href="mailto:nigtalksupport@freesoulthemovement" className="text-primary hover:underline" data-testid="link-footer-support">nigtalksupport@freesoulthemovement</a>
        </p>
      </footer>
    </div>
  );
}
