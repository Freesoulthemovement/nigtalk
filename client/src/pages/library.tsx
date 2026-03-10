import { Link } from "wouter";
import { ArrowLeft, Shield, FileText, BookOpen, Scale, ChevronRight } from "lucide-react";

const documents = [
  {
    title: "Free Soul Charter",
    description: "The founding document establishing the Free Soul Ecclesiastical Movement.",
    version: "v1.0.0",
    date: "2024-01-15",
    icon: FileText,
    iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  {
    title: "Constitution",
    description: "The constitutional framework governing NigTalk operations.",
    version: "v2.1.0",
    date: "2024-06-20",
    icon: BookOpen,
    iconColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  },
  {
    title: "PMA Agreement",
    description: "Private Membership Association terms and conditions.",
    version: "v1.2.0",
    date: "2024-09-01",
    icon: Shield,
    iconColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  },
  {
    title: "Trust Indenture",
    description: "Trust documentation for the Movement's assets and operations.",
    version: "v1.0.0",
    date: "2024-03-10",
    icon: Scale,
    iconColor: "text-green-400 bg-green-500/10 border-green-500/20",
  },
];

export default function LibraryPage() {
  return (
    <div className="flex flex-col min-h-screen animate-in-fade">
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/">
            <button className="p-2 rounded-full bg-white/5 border border-white/10" data-testid="button-back-from-library">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <h1 className="text-2xl font-bold font-display" data-testid="text-library-title">Library</h1>
        </div>

        <p className="text-sm text-muted-foreground text-center mb-6">
          Governance documents, legal frameworks, and community agreements
        </p>

        <div className="glass-card rounded-xl p-4 flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-purple-400 shrink-0" />
          <div>
            <h3 className="font-bold text-sm">Verified Documents</h3>
            <p className="text-xs text-muted-foreground">All documents are hashed and timestamped for authenticity verification.</p>
          </div>
        </div>
      </div>

      <div className="px-5 flex-1 pb-8">
        <h2 className="text-lg font-bold font-display mb-4">Governance Documents</h2>

        <div className="space-y-3">
          {documents.map((doc) => (
            <button key={doc.title} className="w-full glass-card rounded-2xl p-4 flex items-center gap-4 hover:border-purple-500/20 transition-colors text-left" data-testid={`card-document-${doc.title}`}>
              <div className={`w-12 h-12 rounded-xl border ${doc.iconColor} flex items-center justify-center shrink-0`}>
                <doc.icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm">{doc.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{doc.description}</p>
                <p className="text-[11px] text-primary mt-1">{doc.version} · 📅 {doc.date}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
