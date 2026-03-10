import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Shield, FileText, BookOpen, Scale, ChevronRight, Search, X, Book } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FreeSoulEmblem } from "@/components/free-soul-emblem";

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
    title: "Free Soul Living Dictionary",
    description: "88 Essential Definitions for Sovereignty — linguistic manual for free souls seeking truth.",
    version: "v1.1.1",
    date: "2025-01-01",
    icon: Book,
    iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    isDictionary: true,
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

const dictionaryEntries = [
  { number: "0", term: "Soul", official: "The spiritual or immaterial part of a human being or animal, often regarded as immortal.", true_def: "The Creator's breath in the living man and woman. The infinite connection to energy itself. It is inalienable and beyond commerce." },
  { number: "1", term: "Sovereignty", official: "Supreme authority of a ruler or state.", true_def: "Inherent authority of the soul, given by Creator, never alienable." },
  { number: "1a", term: "Free Soul The Movement", official: "Not yet found in the Vempire's dictionaries. A private spiritual ecclesiastical Ministry, Trust and Tribe organized under the Creator.", true_def: "A living covenantal movement restoring sovereignty through tribe, hearth, and Creator's law." },
  { number: "2", term: "Law", official: "The system of rules created and enforced by governments, courts, and authorities.", true_def: "Law is the living order of the Creator's balance, written into nature, soul, and conscience." },
  { number: "3", term: "Justice", official: "Giving each person their due, treating individuals fairly, impartially, and reasonably through the application of laws.", true_def: "Justice is balance in truth, equity, where no word or silence may be twisted to ensnare the living. Honor belongs only to the Creator." },
  { number: "4", term: "Freedom", official: "Privileges granted under law.", true_def: "The natural state of being unbound, living in Creator's order. A child of the Creator should not begin life indebted to a system they never consented to." },
  { number: "4a", term: "Liberty", official: "Permission granted by authority. From the Latin Libertas.", true_def: "A lesser freedom; empire's counterfeit of rights, conditioned on obedience and allegiance." },
  { number: "5", term: "Government", official: "The body that governs a community, state, or nation.", true_def: "Self-governance under Creator's law. Any government that denies freedom identifies itself as ungodly and unnatural." },
  { number: "6", term: "Constitution", official: "The fundamental law of a nation or state.", true_def: "A covenant of governance intended to protect the rights of the living, not to bind them to corporate fiction." },
  { number: "7", term: "Right", official: "A legal entitlement recognized by law.", true_def: "An inherent attribute of the living soul bestowed by the Creator — not granted by any man, government, or institution." },
  { number: "8", term: "Person", official: "A human being or an entity recognized by law.", true_def: "A legal fiction, a corporate franchise. The living man or woman is not a 'person' — they are a soul." },
  { number: "9", term: "Citizen", official: "A member of a state or nation.", true_def: "A subject of corporate jurisdiction. Citizenship is a status voluntarily or involuntarily consented to." },
  { number: "10", term: "Money", official: "A medium of exchange.", true_def: "Originally a measure of stored energy or labor. Modern money is debt-based fiction, not true wealth." },
  { number: "11", term: "Currency", official: "A system of money in general use in a particular country.", true_def: "Current-cy: the flow of energy. Real currency is the circulation of life and abundance, not printed paper." },
  { number: "12", term: "Debt", official: "Something that is owed or due.", true_def: "Under Creator's law, no living soul is born in debt. All modern debt is fiction imposed by the dead hand." },
  { number: "13", term: "Tax", official: "A compulsory contribution to state revenue.", true_def: "Tribute extracted through the presumption of jurisdiction over the living. Under Creator's law, only voluntary offerings exist." },
  { number: "14", term: "Bank", official: "A financial institution licensed to receive deposits and make loans.", true_def: "The banks of a river control the flow of current (currency). Banking is the control of energy flow." },
  { number: "15", term: "Trust", official: "A legal arrangement in which one party holds property for the benefit of another.", true_def: "A sacred covenant. The original trust is between Creator and creation — all others derive from this." },
  { number: "16", term: "Tribe", official: "A social division in a traditional society consisting of families linked by social bonds.", true_def: "The natural organizing unit of the living — families bound by covenant, land, and Creator's law." },
  { number: "17", term: "Land", official: "The solid part of the earth's surface.", true_def: "Creator's provision for the living. No man can produce a valid contract with God for it. We are stewards." },
  { number: "18", term: "Temple", official: "A building devoted to the worship of a god or gods.", true_def: "The temple is within each living soul. The body is the true temple of the Creator." },
  { number: "19", term: "Covenant", official: "An agreement or promise.", true_def: "A sacred bond between the Creator and the living, or between living souls. It cannot be broken by paper or decree." },
  { number: "20", term: "Truth", official: "The quality of being in accordance with fact or reality.", true_def: "The foundational substance of all creation. Where truth exists, deception cannot survive." },
  { number: "21", term: "Deception", official: "The action of deceiving someone.", true_def: "The root of all false authority. All warfare arises from deception — the corruption of words, law, and knowledge." },
  { number: "22", term: "Education", official: "The process of receiving or giving systematic instruction.", true_def: "The drawing out (Latin: educere) of wisdom that already exists within. True education liberates." },
  { number: "23", term: "Religion", official: "The belief in and worship of a superhuman controlling power.", true_def: "From Latin 're-ligare' — to re-bind. Religion as institution often binds rather than frees the soul." },
  { number: "24", term: "Church", official: "A building used for public Christian worship.", true_def: "Ekklesia — the assembly of the called-out. Not a building, but the gathered living souls in covenant." },
  { number: "25", term: "War", official: "A state of armed conflict between nations or states.", true_def: "The organized breaking of human beings for profit and control. All warfare is based on deception." },
  { number: "26", term: "Peace", official: "Freedom from disturbance; tranquility.", true_def: "The natural state of alignment with Creator's order. Peace is not the absence of conflict but the presence of truth." },
  { number: "27", term: "Contract", official: "A written or spoken agreement intended to be enforceable by law.", true_def: "An agreement between minds. No contract can bind the living soul without full knowledge and free consent." },
  { number: "28", term: "Consent", official: "Permission for something to happen or agreement to do something.", true_def: "The free will expression of the living soul. Silence or ignorance is not consent — it is fraud by presumption." },
];

export default function LibraryPage() {
  const [showDictionary, setShowDictionary] = useState(false);
  const [dictSearch, setDictSearch] = useState("");

  if (showDictionary) {
    return <DictionaryView search={dictSearch} setSearch={setDictSearch} onBack={() => { setShowDictionary(false); setDictSearch(""); }} />;
  }

  return (
    <div className="flex flex-col min-h-screen animate-in-fade">
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/settings">
            <button className="p-2 rounded-full bg-white/5 border border-white/10" data-testid="button-back-from-library">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <FreeSoulEmblem className="w-6 h-6" />
            <h1 className="text-2xl font-bold font-display" data-testid="text-library-title">Library</h1>
          </div>
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
            <button
              key={doc.title}
              onClick={doc.isDictionary ? () => setShowDictionary(true) : undefined}
              className="w-full glass-card rounded-2xl p-4 flex items-center gap-4 hover:border-purple-500/20 transition-colors text-left"
              data-testid={`card-document-${doc.title}`}
            >
              <div className={`w-12 h-12 rounded-xl border ${doc.iconColor} flex items-center justify-center shrink-0`}>
                <doc.icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm">{doc.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{doc.description}</p>
                <p className="text-[11px] text-primary mt-1">{doc.version} · {doc.date}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DictionaryView({ search, setSearch, onBack }: { search: string; setSearch: (s: string) => void; onBack: () => void }) {
  const filtered = search.length >= 1
    ? dictionaryEntries.filter(e =>
      e.term.toLowerCase().includes(search.toLowerCase()) ||
      e.official.toLowerCase().includes(search.toLowerCase()) ||
      e.true_def.toLowerCase().includes(search.toLowerCase())
    )
    : dictionaryEntries;

  return (
    <div className="flex flex-col min-h-screen animate-in-fade pb-8">
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="p-2 rounded-full bg-white/5 border border-white/10" data-testid="button-back-from-dictionary">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <FreeSoulEmblem className="w-6 h-6" />
            <div>
              <h1 className="text-xl font-bold font-display" data-testid="text-dictionary-title">Free Soul Living Dictionary</h1>
              <p className="text-[11px] text-muted-foreground">88 Essential Definitions for Sovereignty</p>
            </div>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search definitions..."
            className="pl-10 bg-white/5 border-white/10"
            data-testid="input-dictionary-search"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="glass-card rounded-xl p-4 mb-4">
          <p className="text-xs text-muted-foreground italic leading-relaxed">
            "Agreement is not required. Attention is." — Each entry contains layers: official definitions, functional meanings, and the author's discerned truth. Words shape perception, and perception shapes behavior.
          </p>
        </div>
      </div>

      <div className="px-5 flex-1 space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-14 text-muted-foreground text-sm">
            No definitions found for "{search}"
          </div>
        ) : (
          filtered.map((entry) => (
            <div key={entry.number} className="glass-card rounded-2xl p-4 space-y-3" data-testid={`dict-entry-${entry.number}`}>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-primary/20 text-primary text-xs font-bold">{entry.number}</span>
                <h3 className="font-bold text-base">{entry.term}</h3>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Official Definition</p>
                  <p className="text-sm text-foreground/70 leading-relaxed">{entry.official}</p>
                </div>

                <div className="border-t border-white/5 pt-2">
                  <p className="text-[10px] font-bold text-green-400 uppercase tracking-wider mb-1">True Definition</p>
                  <p className="text-sm text-foreground/90 leading-relaxed">{entry.true_def}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
