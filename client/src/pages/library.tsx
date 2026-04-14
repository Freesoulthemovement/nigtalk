import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Shield, FileText, BookOpen, Scale, ChevronRight, Search, X, Book, Camera, Send, Clock, Bell, Eye, Award, Gavel, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FreeSoulEmblem } from "@/components/free-soul-emblem";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

const documents = [
  { title: "Free Soul Charter", description: "The founding document establishing the Free Soul Ecclesiastical Movement as a sovereign spiritual body.", version: "v1.0.0", date: "2025-08-16", icon: FileText, iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { title: "Free Soul Living Dictionary", description: "88 Essential Definitions for Sovereignty — linguistic manual for free souls seeking truth.", version: "v1.1.1", date: "2025-10-16", icon: Book, iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", isDictionary: true },
  { title: "Constitution", description: "The constitutional framework governing the Free Soul Movement's internal operations and member rights.", version: "v2.1.0", date: "2025-08-16", icon: BookOpen, iconColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
  { title: "PMA Agreement", description: "Private Membership Association terms, conditions, and ecclesiastical jurisdiction acknowledgment.", version: "v1.2.0", date: "2025-08-16", icon: Shield, iconColor: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  { title: "Trust Indenture", description: "Trust documentation for the Movement's assets, operations, and fiduciary responsibilities.", version: "v1.0.0", date: "2025-08-16", icon: Scale, iconColor: "text-green-400 bg-green-500/10 border-green-500/20" },
];

const dictionaryEntries = [
  { number: "1", term: "Sovereignty", official: "Supreme authority of a ruler or state.", true_def: "Inherent authority of the soul, given by Creator, never alienable. Sovereignty is not granted by constitutions or governments — it pre-exists all human institutions. The sovereign stands above all man-made law by birthright of creation." },
  { number: "2", term: "Law", official: "The system of rules created and enforced by governments, courts, and authorities.", true_def: "Law is the living order of the Creator's balance, written into nature, soul, and conscience. Natural law supersedes all statute, code, and regulation. True law protects; false law enslaves." },
  { number: "3", term: "Justice", official: "Giving each person their due, treating individuals fairly and impartially through application of laws.", true_def: "Justice is balance in truth and equity, where no word or silence may be twisted to ensnare the living. Honor belongs only to the Creator. Justice without truth is tyranny wearing a robe." },
  { number: "4", term: "Freedom", official: "Privileges granted under law.", true_def: "The natural state of being unbound, living in Creator's order. A child of the Creator should not begin life indebted to a system they never consented to. Freedom is inherent; it is not a privilege dispensed by the state." },
  { number: "5", term: "Government", official: "The body that governs a community, state, or nation.", true_def: "Self-governance under Creator's law. Any government that denies freedom identifies itself as ungodly and unnatural. The only legitimate government is one that serves, not one that rules." },
  { number: "6", term: "Constitution", official: "The fundamental law of a nation or state.", true_def: "A covenant of governance intended to protect the rights of the living, not to bind them to corporate fiction. When a constitution is weaponized against the people it was written to protect, it becomes a dead letter." },
  { number: "7", term: "Right", official: "A legal entitlement recognized by law.", true_def: "An inherent attribute of the living soul bestowed by the Creator — not granted by any man, government, or institution. Rights do not come from documents; documents merely acknowledge what already exists." },
  { number: "8", term: "Person", official: "A human being or an entity recognized by law.", true_def: "A legal fiction, a corporate franchise. The living man or woman is not a 'person' — they are a soul. The 'person' is a mask (Latin: persona) created by the state to generate jurisdiction over the living." },
  { number: "9", term: "Citizen", official: "A member of a state or nation.", true_def: "A subject of corporate jurisdiction. Citizenship is a status voluntarily or involuntarily consented to. The citizen trades sovereignty for 'benefits' — a contract most never knowingly signed." },
  { number: "10", term: "Money", official: "A medium of exchange.", true_def: "Originally a measure of stored energy or labor. Modern money is debt-based fiction, not true wealth. Real money is backed by something tangible; fiat currency is backed only by the threat of force." },
  { number: "11", term: "Currency", official: "A system of money in general use in a particular country.", true_def: "Current-cy: the flow of energy. Real currency is the circulation of life and abundance, not printed paper. He who controls the current controls the civilization." },
  { number: "12", term: "Debt", official: "Something that is owed or due.", true_def: "Under Creator's law, no living soul is born in debt. All modern debt is fiction imposed by the dead hand of commercial instruments. The birth certificate created the debt — the living man did not." },
  { number: "13", term: "Tax", official: "A compulsory contribution to state revenue.", true_def: "Tribute extracted through the presumption of jurisdiction over the living. Under Creator's law, only voluntary offerings exist. Taxation without genuine consent is plunder with paperwork." },
  { number: "14", term: "Bank", official: "A financial institution licensed to receive deposits and make loans.", true_def: "The banks of a river control the flow of current (currency). Banking is the control of energy flow. Banks do not lend money — they create it from your signature and charge you interest on what you created." },
  { number: "15", term: "Trust", official: "A legal arrangement in which one party holds property for the benefit of another.", true_def: "A sacred covenant. The original trust is between Creator and creation — all others derive from this. When you understand trusts, you understand how the entire system of control operates." },
  { number: "16", term: "Tribe", official: "A social division in a traditional society consisting of families linked by social bonds.", true_def: "The natural organizing unit of the living — families bound by covenant, land, and Creator's law. The tribe is the antidote to isolation and the foundation of true governance." },
  { number: "17", term: "Land", official: "The solid part of the earth's surface.", true_def: "Creator's provision for the living. No man can produce a valid contract with God for it. We are stewards, not owners. Allodial title — ownership without obligation to a lord — is the natural state." },
  { number: "18", term: "Temple", official: "A building devoted to the worship of a god or gods.", true_def: "The temple is within each living soul. The body is the true temple of the Creator. No building can contain the infinite — the temple walks with you." },
  { number: "19", term: "Covenant", official: "An agreement or promise.", true_def: "A sacred bond between the Creator and the living, or between living souls. It cannot be broken by paper or decree. A covenant is higher than any contract — it is sealed by honor, not by threat." },
  { number: "20", term: "Truth", official: "The quality of being in accordance with fact or reality.", true_def: "The foundational substance of all creation. Where truth exists, deception cannot survive. Truth is not a perspective — it is the bedrock upon which all reality stands. Speak it, live it, become it." },
  { number: "21", term: "Deception", official: "The action of deceiving someone.", true_def: "The root of all false authority. All warfare arises from deception — the corruption of words, law, and knowledge. The system's greatest weapon is convincing you that its fictions are facts." },
  { number: "22", term: "Education", official: "The process of receiving or giving systematic instruction.", true_def: "The drawing out (Latin: educere) of wisdom that already exists within. True education liberates; indoctrination enslaves. Know the difference by the fruit: does it make you free or dependent?" },
  { number: "23", term: "Religion", official: "The belief in and worship of a superhuman controlling power.", true_def: "From Latin 're-ligare' — to re-bind. Religion as institution often binds rather than frees the soul. True spirituality needs no intermediary — you were born connected." },
  { number: "24", term: "Church", official: "A building used for public Christian worship.", true_def: "Ekklesia — the assembly of the called-out. Not a building, but the gathered living souls in covenant. The church is wherever two or more gather in truth." },
  { number: "25", term: "War", official: "A state of armed conflict between nations or states.", true_def: "The organized breaking of human beings for profit and control. All warfare is based on deception. Wars are banker's harvest — the blood of the living pays for the debts of the dead." },
  { number: "26", term: "Peace", official: "Freedom from disturbance; tranquility.", true_def: "The natural state of alignment with Creator's order. Peace is not the absence of conflict but the presence of truth. The King's peace is established when all claims are settled by truth." },
  { number: "27", term: "Contract", official: "A written or spoken agreement intended to be enforceable by law.", true_def: "An agreement between minds. No contract can bind the living soul without full knowledge and free consent. Adhesion contracts — where terms are non-negotiable — are instruments of coercion." },
  { number: "28", term: "Consent", official: "Permission for something to happen or agreement to do something.", true_def: "The free will expression of the living soul. Silence or ignorance is not consent — it is fraud by presumption. Without a meeting of the minds, there is no valid consent." },
  { number: "29", term: "Jurisdiction", official: "The official power to make legal decisions and judgments.", true_def: "Juris (oath/law) + diction (to speak). Jurisdiction is the authority to speak law over you. Without your consent, no court has jurisdiction. Challenge jurisdiction first — it is the foundation of all claims." },
  { number: "30", term: "Trespass", official: "Entry to a person's land without permission.", true_def: "Any violation of the natural rights of a living soul — not merely land. Trespass on the mind through deception, trespass on the body through force, trespass on the estate through fraud. All crimes reduce to trespass." },
  { number: "31", term: "Usury", official: "The illegal action of lending money at unreasonably high rates of interest.", true_def: "The charging of any interest on created-from-nothing currency. Usury is the engine of perpetual debt. Every civilization that permitted usury eventually collapsed under its weight." },
  { number: "32", term: "Fraud", official: "Wrongful deception intended to result in financial or personal gain.", true_def: "The intentional concealment of truth for gain. The entire commercial system rests on a fraud: the presumption that you are a legal fiction rather than a living soul." },
  { number: "33", term: "Fiduciary", official: "Involving trust, especially with regard to the relationship between a trustee and a beneficiary.", true_def: "One who holds a sacred duty to act in the interest of another. Every public servant is a fiduciary of the people. Breach of fiduciary duty is one of the greatest offenses in natural law." },
  { number: "34", term: "Affidavit", official: "A written statement confirmed by oath for use as evidence in court.", true_def: "The highest form of evidence in commerce. An unrebutted affidavit stands as truth in law. When you state your truth under penalty of perjury and no one rebuts it, it becomes established fact." },
  { number: "35", term: "Default", official: "Failure to fulfill an obligation.", true_def: "When a party fails to respond to a lawful claim within the time allotted, they stipulate to the truth of the claim by their silence. Default is acquiescence — the most powerful weapon of the sovereign." },
  { number: "36", term: "Rebuke", official: "An expression of sharp disapproval or criticism.", true_def: "The formal correction of error in law. An Affidavit of Rebuke is the sovereign's notice that an agent has acted outside their authority. It is an act of peace, not aggression — correction, not combat." },
  { number: "37", term: "Agent", official: "A person who acts on behalf of another.", true_def: "One who acts under delegated authority. Every government official, officer, and bureaucrat is an agent — they have no inherent authority. Their power exists only within the scope of their delegation." },
  { number: "38", term: "Notice", official: "Notification or warning of something.", true_def: "In law, notice is everything. Once proper notice is given, ignorance is no defense. Notice creates obligation — the party who receives lawful notice must act or default." },
  { number: "39", term: "Cure", official: "To relieve a problem or remedy a situation.", true_def: "The period given to an offending party to correct their trespass. The 'time to cure' is the grace period before default is established. Typically 10-30 days in commercial processes." },
  { number: "40", term: "Lien", official: "A right to keep possession of property belonging to another person until a debt is paid.", true_def: "A claim against property or assets. A commercial lien, properly filed, creates an obligation that cannot be ignored. It is the financial arm of the affidavit." },
  { number: "41", term: "Fee Schedule", official: "A list of charges for services rendered.", true_def: "The sovereign's published rates for unauthorized use of their name, time, energy, or property. When an agent trespasses, the fee schedule determines the cost of their violation." },
  { number: "42", term: "Cestui Que Vie", official: "A legal term relating to a trust beneficiary.", true_def: "The trust created at birth when your birth certificate was issued. The state presumed you were 'lost at sea' (dead in commerce) and became trustee of your estate. Reclaiming your living status is the act of sovereignty." },
  { number: "43", term: "Strawman", official: "A person regarded as having no substance or integrity.", true_def: "The legal fiction created by your birth certificate — the ALL-CAPS NAME on government documents. It is a corporate entity, not you. Distinguishing between the living man and the strawman is fundamental." },
  { number: "44", term: "UCC", official: "Uniform Commercial Code.", true_def: "The body of law governing all commercial transactions in the United States. Understanding the UCC is understanding the operating system of modern commerce. UCC-1 financing statements are tools of the sovereign." },
  { number: "45", term: "Admiralty", official: "The branch of law relating to the sea and maritime affairs.", true_def: "Maritime/admiralty law has been brought onto the land through legal fiction. The gold-fringed flag in courtrooms signals admiralty jurisdiction. On the land, common law prevails — at sea, the captain is king." },
  { number: "46", term: "Common Law", official: "The part of law derived from custom and judicial precedent.", true_def: "The law of the land, based on the Golden Rule: do no harm, cause no loss, breach no contract. Common law recognizes the living man; statute law recognizes the fiction." },
  { number: "47", term: "Statute", official: "A written law passed by a legislative body.", true_def: "A rule of a society or corporation, applicable only to its members. Statutes apply to 'persons' — legal fictions — not to living men and women unless they consent to the jurisdiction." },
  { number: "48", term: "Code", official: "A systematic collection of laws.", true_def: "From the word 'codex' — a hidden or encrypted message. Legal codes are written in a language designed to appear plain but conceal their true commercial nature." },
  { number: "49", term: "Court", official: "A tribunal presided over by a judge or judges.", true_def: "A place of commerce where accounts are settled. Modern courts are administrative tribunals operating under commercial/admiralty law. The judge is the trustee; the state is the beneficiary — unless you correct the presumption." },
  { number: "50", term: "Judge", official: "A public official appointed to decide cases in a court of law.", true_def: "An administrator of a commercial trust. The judge manages the case as a trustee. When you understand your role as the beneficiary of the public trust, the dynamic in the courtroom shifts entirely." },
  { number: "51", term: "Attorney", official: "A person appointed to act for another in business or legal matters.", true_def: "One who 'turns over' your rights. Attorney-in-fact means they act in your stead — often without your full understanding. To 're-present' means to present again as something else." },
  { number: "52", term: "Bar", official: "The legal profession; the body of attorneys.", true_def: "British Accredited Registry. Bar members owe allegiance to the Crown/Temple Bar — a foreign jurisdiction. This creates a conflict of interest when they 're-present' a sovereign in court." },
  { number: "53", term: "License", official: "A permit from an authority to do something.", true_def: "Permission to do something that would otherwise be illegal. A license implies that without it, you have no right. Under natural law, you need no permission to exercise inherent rights." },
  { number: "54", term: "Registration", official: "The action of registering or being registered.", true_def: "To transfer ownership to the crown/state. When you 'register' anything — a car, a child, a business — you transfer the title to the state and receive a 'certificate' (a receipt, not ownership)." },
  { number: "55", term: "Certificate", official: "An official document attesting a fact.", true_def: "A receipt acknowledging transfer of title. A birth certificate is not proof of life — it is a financial instrument. A certificate of title is proof you do NOT have the title." },
  { number: "56", term: "Title", official: "The name of a book or other composition.", true_def: "True ownership. In law, there is a crucial difference between holding a certificate OF title (the state has the title) and holding the title itself (allodial ownership)." },
  { number: "57", term: "Property", official: "A thing or things belonging to someone.", true_def: "That which is proper to you — your body, your labor, your creations. Governments cannot tax true property, only privileges. Understanding the distinction protects what is yours." },
  { number: "58", term: "Estate", official: "All the money and property owned by a particular person.", true_def: "Your entire body of rights, properties, and assets — both physical and spiritual. The state presumes to manage your estate through the cestui que vie trust. Claiming your estate is an act of sovereignty." },
  { number: "59", term: "Commerce", official: "The activity of buying and selling.", true_def: "The exchange of energy between parties. All interaction is commerce at its root. Understanding that every interaction has a commercial dimension is key to navigating the system." },
  { number: "60", term: "Pledge", official: "A solemn promise or undertaking.", true_def: "To give as security. When you pledge allegiance, you offer yourself as collateral. The Pledge of Allegiance is a commercial contract — spoken by children who cannot legally consent." },
  { number: "61", term: "Allegiance", official: "Loyalty or commitment to a superior or cause.", true_def: "Submission to a sovereign authority. True allegiance is owed only to the Creator. Allegiance to any human institution is voluntary and revocable — a fact the system conceals." },
  { number: "62", term: "Sovereignty of the Soil", official: "Not commonly defined in standard dictionaries.", true_def: "The divine right of the living to stand upon the earth without tribute or permission. The soil belongs to the Creator; we are stewards. No deed from a state can supersede the Creator's grant." },
  { number: "63", term: "Ecclesiastical", official: "Relating to the Christian Church or its clergy.", true_def: "Pertaining to the assembly of the called-out. Ecclesiastical jurisdiction stands above civil jurisdiction. The Free Soul Movement operates under ecclesiastical law — the law of the Creator's assembly." },
  { number: "64", term: "PMA (Private Membership Association)", official: "A voluntary association of private members.", true_def: "A lawful structure that operates outside public regulatory jurisdiction. The First Amendment protects the right of private assembly. A PMA is a shield of sovereignty for collective action." },
  { number: "65", term: "Maxim of Law", official: "A principle or rule of law universally admitted as being just.", true_def: "The foundational truths upon which all law rests. 'He who does not deny, admits.' 'Silence is consent.' 'An unrebutted affidavit stands as truth.' These maxims govern commerce." },
  { number: "66", term: "Golden Rule", official: "Do unto others as you would have them do unto you.", true_def: "The supreme law above all laws. Every legal system, every moral code, every spiritual tradition acknowledges this principle. It is the foundation of the Free Soul Movement's jurisprudence." },
  { number: "67", term: "Steward", official: "A person who manages another's property or affairs.", true_def: "The role of the living in relation to Creator's gifts — land, body, resources. We do not own; we steward. The steward is entrusted with care, not dominion." },
  { number: "68", term: "Witness", official: "A person who sees an event take place.", true_def: "One who stands in truth to verify and support a claim. In common law, a cloud of witnesses makes a claim nearly impossible to ignore. Witnessing is an act of tribal solidarity." },
  { number: "69", term: "Seal", official: "A device or substance used to close or mark a document.", true_def: "The mark of authority and authenticity. A sealed document carries greater weight in law. The sovereign's seal represents their jurisdiction and honor." },
  { number: "70", term: "Heir", official: "A person legally entitled to the property of another on that person's death.", true_def: "You are the heir of your Creator — endowed with all rights, titles, and estates of creation. No probate court can diminish what the Creator has bequeathed to the living." },
  { number: "71", term: "Birth Certificate", official: "An official document recording a person's birth.", true_def: "A financial instrument — a bond — created when you were 'berthed' (docked) into the commercial system. It converted the living child into a corporate franchise. The original is held by the state." },
  { number: "72", term: "Social Security", official: "A government system providing monetary assistance to people with inadequate income.", true_def: "A trust account number assigned to the strawman. Participation implies consent to federal jurisdiction. The number tracks the commercial value of the legal fiction, not the living man." },
  { number: "73", term: "Mortgage", official: "A loan agreement to purchase property.", true_def: "From Latin 'mort' (death) + 'gage' (pledge). A death pledge. You pledge your life energy (labor) unto death. The bank creates the 'money' from your signature, then charges you interest on your own creation." },
  { number: "74", term: "Interest", official: "Money paid for the use of money.", true_def: "The mechanism of usury. Interest on created-from-nothing currency is mathematically impossible to repay in aggregate — the system requires perpetual debt and periodic collapse by design." },
  { number: "75", term: "Inflation", official: "A general increase in prices.", true_def: "The hidden tax — the deliberate devaluation of currency through expansion of the money supply. Inflation is theft in slow motion, extracting wealth from the people to the money creators." },
  { number: "76", term: "Corporation", official: "A company or group authorized to act as a single entity.", true_def: "A 'corpse-oration' — a dead entity given the illusion of life by legal fiction. Governments are corporations. Cities are corporations. You have been made into a corporation through your birth certificate." },
  { number: "77", term: "Bankruptcy", official: "The state of being unable to pay debts.", true_def: "The United States has been bankrupt since 1933. Operating in bankruptcy means operating under emergency war powers — which is why your rights seem negotiable. The 'Math of Default' proves the system's insolvency." },
  { number: "78", term: "Surety", official: "A person who takes responsibility for another's obligations.", true_def: "One who pledges to pay another's debt. Through the birth certificate trust, the living man was made surety for the strawman's debts — without knowledge or consent. This is the foundational fraud." },
  { number: "79", term: "Remedy", official: "A means of legal reparation.", true_def: "Every system of law must provide a remedy. UCC 1-103 preserves all common law remedies. The remedy exists — you must claim it. The system is designed so that those who know the remedy can use it." },
  { number: "80", term: "Restitution", official: "The restoration of something lost or stolen.", true_def: "The making whole of one who has been trespassed against. Under the Free Soul Movement, restitution is prioritized over punishment. The goal is restoration of peace, not retribution." },
  { number: "81", term: "Forgiveness of Debt", official: "The cancellation of a debt by the creditor.", true_def: "Jubilee — the ancient practice of periodic debt cancellation. Every 7 years, debts were released. Every 50 years, all property was returned. This is Creator's economic law, destroyed by the bankers." },
  { number: "82", term: "Kinsman", official: "A blood relative.", true_def: "One bound by tribal covenant — blood or oath. The kinsman-redeemer is one who restores what was lost. In the Free Soul Movement, every member is kin — bound by covenant, not just blood." },
  { number: "83", term: "Elder", official: "An older person, especially one with authority.", true_def: "A keeper of wisdom and tradition. Elders hold the tribal memory and guide governance through experience and discernment. Their counsel is not command — it is light." },
  { number: "84", term: "Council", official: "A group of people elected or chosen to make decisions.", true_def: "The deliberative body of the tribe. The council operates by consensus, guided by elders and the Golden Rule. It exists to serve the tribe, not to rule it." },
  { number: "85", term: "Bestowal", official: "The act of conferring something.", true_def: "The voluntary giving of value based on attention and appreciation. In the Free Soul economy, bestowal replaces extraction. Value flows to where attention goes — this is the reversal of the usury model." },
  { number: "86", term: "Math of Default", official: "Not found in standard dictionaries.", true_def: "The mathematical proof that the debt-based monetary system is insolvent. If all money is created as debt with interest, but the interest was never created, then aggregate debt always exceeds the money supply. Default is inevitable and systemic." },
  { number: "87", term: "Affidavit of Infinite Irrefutable Rebuke", official: "Not found in standard dictionaries.", true_def: "The sovereign's formal instrument of correction — a sworn statement of truth, law, and charge against an agent who has trespassed. When served and unrebutted within the cure period, it becomes established fact in law. It is the shield and sword of the Free Soul." },
  { number: "88", term: "King/Queen", official: "A ruler of an independent state.", true_def: "Every living soul is sovereign — a king or queen in their own right under the Creator. You do not need a crown or a castle. Your kingdom is your body, your family, your tribe, and your covenant with the Creator. Walk in that authority." },
];

type TabType = "documents" | "dictionary" | "shield";

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<TabType>("documents");
  const [dictSearch, setDictSearch] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<typeof dictionaryEntries[0] | null>(null);

  return (
    <div className="flex flex-col min-h-screen animate-in-fade pb-8">
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-4">
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

        <div className="flex gap-1 bg-white/5 rounded-lg p-1 mb-4">
          {([
            { id: "documents" as TabType, label: "Documents" },
            { id: "dictionary" as TabType, label: "Dictionary" },
            { id: "shield" as TabType, label: "Tribal Shield" },
          ]).map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.id ? "bg-primary text-white" : "text-muted-foreground"}`} data-testid={`tab-library-${tab.id}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "documents" && <DocumentsTab />}
      {activeTab === "dictionary" && <DictionaryTab search={dictSearch} setSearch={setDictSearch} onSelectEntry={setSelectedEntry} />}
      {activeTab === "shield" && <TribalShieldTab />}

      <Dialog open={!!selectedEntry} onOpenChange={(o) => !o && setSelectedEntry(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          {selectedEntry && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-primary/20 text-primary text-xs font-bold">{selectedEntry.number}</span>
                  {selectedEntry.term}
                </DialogTitle>
                <DialogDescription>Free Soul Living Dictionary Definition</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Official Definition</p>
                  <p className="text-sm text-foreground/70 leading-relaxed">{selectedEntry.official}</p>
                </div>
                <div className="border-t border-white/5 pt-3">
                  <p className="text-[10px] font-bold text-green-400 uppercase tracking-wider mb-1">True Definition</p>
                  <p className="text-sm text-foreground/90 leading-relaxed">{selectedEntry.true_def}</p>
                </div>
                <div className="glass-card rounded-xl p-3">
                  <p className="text-[10px] text-muted-foreground">
                    This definition is part of the Free Soul Living Dictionary — 88 Essential Definitions for Sovereignty.
                    Tap and hold any term in the dictionary to view its full definition.
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DocumentsTab() {
  return (
    <div className="px-5 flex-1 pb-8">
      <div className="glass-card rounded-xl p-4 flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-purple-400 shrink-0" />
        <div>
          <h3 className="font-bold text-sm">Verified Documents</h3>
          <p className="text-xs text-muted-foreground">All documents are hashed and timestamped for authenticity verification.</p>
        </div>
      </div>

      <h2 className="text-lg font-bold font-display mb-4">Governance Documents</h2>
      <div className="space-y-3">
        {documents.map((doc) => (
          <div key={doc.title} className="w-full glass-card rounded-2xl p-4 flex items-center gap-4 hover:border-purple-500/20 transition-colors text-left" data-testid={`card-document-${doc.title}`}>
            <div className={`w-12 h-12 rounded-xl border ${doc.iconColor} flex items-center justify-center shrink-0`}>
              <doc.icon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm">{doc.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{doc.description}</p>
              <p className="text-[11px] text-primary mt-1">{doc.version} · {doc.date}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

function DictionaryTab({ search, setSearch, onSelectEntry }: { search: string; setSearch: (s: string) => void; onSelectEntry: (e: typeof dictionaryEntries[0]) => void }) {
  const filtered = search.length >= 1
    ? dictionaryEntries.filter(e =>
      e.term.toLowerCase().includes(search.toLowerCase()) ||
      e.official.toLowerCase().includes(search.toLowerCase()) ||
      e.true_def.toLowerCase().includes(search.toLowerCase())
    )
    : dictionaryEntries;

  return (
    <div className="px-5 flex-1 pb-8">
      <div className="flex items-center gap-2 mb-3">
        <FreeSoulEmblem className="w-5 h-5" />
        <div>
          <h2 className="text-lg font-bold font-display">Free Soul Living Dictionary</h2>
          <p className="text-[11px] text-muted-foreground">88 Essential Definitions for Sovereignty</p>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search definitions..." className="pl-10 bg-white/5 border-white/10" data-testid="input-dictionary-search" />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <div className="glass-card rounded-xl p-4 mb-4">
        <p className="text-xs text-muted-foreground italic leading-relaxed">
          "Agreement is not required. Attention is." — Each entry contains layers: official definitions, functional meanings, and the author's discerned truth. Words shape perception, and perception shapes behavior. Tap any entry to view its full definition.
        </p>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-14 text-muted-foreground text-sm">No definitions found for "{search}"</div>
        ) : (
          filtered.map((entry) => (
            <button key={entry.number} onClick={() => onSelectEntry(entry)} className="w-full text-left glass-card rounded-2xl p-4 space-y-2 hover:border-purple-500/20 transition-colors" data-testid={`dict-entry-${entry.number}`}>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-primary/20 text-primary text-xs font-bold">{entry.number}</span>
                <h3 className="font-bold text-base">{entry.term}</h3>
                <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Official</p>
                <p className="text-xs text-foreground/70 leading-relaxed line-clamp-1">{entry.official}</p>
              </div>
              <div className="border-t border-white/5 pt-1.5">
                <p className="text-[10px] font-bold text-green-400 uppercase tracking-wider mb-0.5">True Definition</p>
                <p className="text-xs text-foreground/90 leading-relaxed line-clamp-2">{entry.true_def}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function TribalShieldTab() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showNewCase, setShowNewCase] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [claimAmount, setClaimAmount] = useState("");
  const [charge, setCharge] = useState("");
  const [showVictoryFeed, setShowVictoryFeed] = useState(false);

  const { data: myCases } = useQuery({
    queryKey: ["/api/shield-cases", "mine"],
    queryFn: async () => { const res = await fetch("/api/shield-cases?mine=true", { credentials: "include" }); return res.json(); },
  });

  const { data: allCases } = useQuery({
    queryKey: ["/api/shield-cases", "all"],
    queryFn: async () => { const res = await fetch("/api/shield-cases", { credentials: "include" }); return res.json(); },
    enabled: showVictoryFeed,
  });

  const createCase = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/shield-cases", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), credentials: "include" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shield-cases"] });
      toast({ title: "Tribal Shield Activated", description: "Confirming your tribal Kingship. Generating Affidavit of Rebuke based on the Golden Rule." });
      setShowNewCase(false);
      setAgentName(""); setClaimAmount(""); setCharge("");
    },
  });

  const witnessMutation = useMutation({
    mutationFn: async (caseId: number) => {
      const res = await fetch(`/api/shield-cases/${caseId}/witness`, { method: "POST", credentials: "include" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shield-cases"] });
      toast({ title: "Witnessed", description: "Your witness has been recorded. The weight of the Tribe strengthens this claim." });
    },
  });

  const charges = [
    "Trespass", "Usury", "Fraud", "Breach of Fiduciary Duty", "Extortion Under Color of Law",
    "Violation of Due Process", "Conversion of Property", "Breach of Peace",
    "False Claim Against the Estate", "Practicing Law Without Authority",
  ];

  if (showVictoryFeed) {
    return (
      <div className="px-5 flex-1 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold font-display flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" /> Wall of Truth
          </h2>
          <button onClick={() => setShowVictoryFeed(false)} className="text-sm text-primary">My Cases</button>
        </div>

        <div className="glass-card rounded-xl p-4 mb-4 border-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Charges Issued</p>
              <p className="text-2xl font-bold text-amber-400">{(allCases || []).length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Defaults Confirmed</p>
              <p className="text-2xl font-bold text-green-400">{(allCases || []).filter((c: any) => c.defaultConfirmed).length}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {(allCases || []).filter((c: any) => c.defaultConfirmed || c.status === "served").map((c: any) => (
            <div key={c.id} className="glass-card rounded-2xl p-4 space-y-2" data-testid={`victory-case-${c.id}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {c.defaultConfirmed ? (
                    <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-[10px] font-bold uppercase">Default Confirmed</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase">Pending Cure</span>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm"><span className="text-muted-foreground">Agent:</span> <span className="font-semibold">{c.agentName}</span></p>
              <p className="text-sm"><span className="text-muted-foreground">Charge:</span> <span className="font-semibold text-red-400">{c.charge}</span></p>
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="w-3 h-3" /> {c.witnessCount || 0} Witnesses
                </div>
                <button onClick={() => witnessMutation.mutate(c.id)} className="text-xs text-primary font-medium flex items-center gap-1" data-testid={`button-witness-${c.id}`}>
                  <Eye className="w-3 h-3" /> Witness This
                </button>
              </div>
            </div>
          ))}
          {(allCases || []).filter((c: any) => c.defaultConfirmed || c.status === "served").length === 0 && (
            <div className="text-center py-14 text-muted-foreground glass-card rounded-2xl">
              <Award className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No victories posted yet. Be the first to ring the bell.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 flex-1 pb-8">
      <div className="glass-card rounded-xl p-4 mb-4 border-purple-500/20">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-purple-400" />
          <h3 className="font-bold text-sm">Tribal Shield</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Received a Roman or government notice? A tax bill, fine, or summons? The Tribal Shield generates your Affidavit of Rebuke
          using the Math of Default, attaches your Fee Schedule, and tracks the cure period. Your tribe stands with you.
        </p>
      </div>

      <div className="flex gap-3 mb-4">
        <Button onClick={() => setShowNewCase(true)} className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl" data-testid="button-new-shield-case">
          <Camera className="w-4 h-4 mr-2" /> New Case
        </Button>
        <Button variant="outline" onClick={() => setShowVictoryFeed(true)} className="flex-1 rounded-xl border-amber-500/30 text-amber-400" data-testid="button-victory-feed">
          <Award className="w-4 h-4 mr-2" /> Wall of Truth
        </Button>
      </div>

      <h3 className="text-sm font-bold mb-3">My Cases</h3>
      <div className="space-y-3">
        {(myCases || []).map((c: any) => {
          const deadline = c.cureDeadline ? new Date(c.cureDeadline) : null;
          const daysLeft = deadline ? Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;
          return (
            <div key={c.id} className="glass-card rounded-2xl p-4 space-y-2" data-testid={`shield-case-${c.id}`}>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${c.defaultConfirmed ? "bg-green-500/20 text-green-400" : c.status === "served" ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"}`}>
                  {c.defaultConfirmed ? "Default Confirmed" : c.status === "served" ? "Awaiting Cure" : c.status === "generated" ? "Affidavit Ready" : "Pending"}
                </span>
                {daysLeft !== null && !c.defaultConfirmed && (
                  <span className="flex items-center gap-1 text-xs text-amber-400">
                    <Clock className="w-3 h-3" /> {daysLeft} days left
                  </span>
                )}
              </div>
              <p className="text-sm"><span className="text-muted-foreground">Agent:</span> <span className="font-semibold">{c.agentName}</span></p>
              <p className="text-sm"><span className="text-muted-foreground">Charge:</span> <span className="font-semibold text-red-400">{c.charge}</span></p>
              {c.claimAmount && <p className="text-sm"><span className="text-muted-foreground">Claim:</span> <span className="font-semibold">${c.claimAmount}</span></p>}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="w-3 h-3" /> {c.witnessCount || 0} Witnesses
              </div>
              {c.defaultConfirmed && (
                <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                  <FreeSoulEmblem className="w-6 h-6" />
                  <p className="text-xs text-green-400 font-medium">Default Confirmed. The Agent has stipulated to your Truth by Silence.</p>
                </div>
              )}
            </div>
          );
        })}
        {(myCases || []).length === 0 && (
          <div className="text-center py-14 text-muted-foreground glass-card rounded-2xl">
            <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No active cases. Use the Tribal Shield when you receive any government notice.</p>
          </div>
        )}
      </div>

      <Dialog open={showNewCase} onOpenChange={setShowNewCase}>
        <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-purple-400" /> New Tribal Shield Case</DialogTitle>
            <DialogDescription>Photo-scan or enter the details from the government notice</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-purple-500/30 transition-colors">
              <label className="cursor-pointer">
                <input type="file" accept="image/*" capture="environment" className="hidden" data-testid="input-shield-photo" />
                <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">Scan Document</p>
                <p className="text-[11px] text-muted-foreground">Take a photo of the notice for OCR scanning</p>
              </label>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Agent Name</Label>
              <Input value={agentName} onChange={(e) => setAgentName(e.target.value)} placeholder="Name from the notice" className="bg-white/5 border-white/10" data-testid="input-shield-agent" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Claim Amount</Label>
              <Input value={claimAmount} onChange={(e) => setClaimAmount(e.target.value)} placeholder="Dollar amount (if any)" className="bg-white/5 border-white/10" data-testid="input-shield-amount" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Charge (from Dictionary)</Label>
              <div className="grid grid-cols-2 gap-1.5 max-h-[150px] overflow-y-auto">
                {charges.map((ch) => (
                  <button key={ch} onClick={() => setCharge(ch)} className={`py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all ${charge === ch ? "bg-red-500/20 border border-red-500/40 text-red-400" : "bg-white/5 border border-white/10 text-muted-foreground"}`} data-testid={`button-charge-${ch.toLowerCase().replace(/\s+/g, "-")}`}>
                    {ch}
                  </button>
                ))}
              </div>
            </div>
            <div className="glass-card rounded-xl p-3 border-green-500/20">
              <p className="text-xs text-green-400 font-medium mb-1">What happens next:</p>
              <ul className="text-[11px] text-muted-foreground space-y-1">
                <li>1. Affidavit of Infinite Irrefutable Rebuke generated</li>
                <li>2. Math of Default proof attached</li>
                <li>3. Your Fee Schedule included</li>
                <li>4. 30-day cure period countdown begins</li>
                <li>5. Default confirmation if unrebutted</li>
              </ul>
            </div>
            <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl" disabled={!agentName || !charge || createCase.isPending} onClick={() => {
              const cureDeadline = new Date();
              cureDeadline.setDate(cureDeadline.getDate() + 30);
              createCase.mutate({ agentName, claimAmount: claimAmount || null, charge, status: "generated", affidavitGenerated: true, cureDeadline: cureDeadline.toISOString() });
            }} data-testid="button-generate-affidavit">
              <Gavel className="w-4 h-4 mr-2" /> Generate Affidavit of Rebuke
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
