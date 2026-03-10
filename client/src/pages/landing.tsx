import { Button } from "@/components/ui/button";
import { ArrowRight, Radio, HeartHandshake, Users, Shield } from "lucide-react";

export default function LandingPage() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen text-foreground flex flex-col">
      <nav className="border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <span className="text-2xl font-extrabold font-display gradient-text tracking-wide" data-testid="text-app-name">NIGTALK</span>
          <Button onClick={handleLogin} className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-900/30 font-semibold" data-testid="button-login">
            Log In
          </Button>
        </div>
      </nav>

      <main className="flex-1">
        <section className="relative pt-24 pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold font-display tracking-tight mb-4">
              <span className="gradient-text">Tune In.</span>
              <br />
              <span className="text-foreground">Speak Freely.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              The sovereign community platform by Free Soul the Movement. Push-to-talk radio, tribal messaging, video streams, and mutual bestowal.
            </p>

            <Button size="lg" onClick={handleLogin} className="text-lg px-8 py-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-900/40 hover:scale-105 transition-all duration-300 font-semibold" data-testid="button-join-movement">
              Join the Movement <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: Radio, title: "Push-to-Talk", desc: "Bluetooth mesh radio that works without internet. Emergency-ready walkie-talkie communication.", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
                { icon: Shield, title: "Tribes", desc: "Create sovereign communities. Group chat, coordinate movements, build together.", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
                { icon: HeartHandshake, title: "Bestowal", desc: "Attention-based mutual support. Watch content, support creators, earn Free Soul Coin.", color: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
                { icon: Users, title: "Frequencies", desc: "Tune into live broadcasts and community channels. Stay connected to the movement.", color: "text-green-400 bg-green-500/10 border-green-500/20" },
              ].map((f) => (
                <div key={f.title} className="glass-card rounded-2xl p-6 hover:border-purple-500/20 transition-all group">
                  <div className={`w-12 h-12 rounded-xl border ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-6 text-center text-muted-foreground text-sm">
        <p>NigTalk by Free Soul the Movement</p>
        <p className="mt-1">
          <a href="mailto:nigtalksupport@freesoulthemovement" className="text-primary hover:underline" data-testid="link-footer-support">nigtalksupport@freesoulthemovement</a>
        </p>
      </footer>
    </div>
  );
}
