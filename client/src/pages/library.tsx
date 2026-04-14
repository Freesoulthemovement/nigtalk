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

const dictionaryPdfUrl = "/attached_assets/88_Essential_definitions_for_sovereignty_-_How_to_kill_a_Vempi_1776206956992.pdf";
const HOLD_MS = 450;

const documents = [
  { title: "Free Soul Charter", description: "The founding document establishing the Free Soul Ecclesiastical Movement as a sovereign spiritual body.", version: "v1.0.0", date: "2025-08-16", icon: FileText, iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { title: "Free Soul Living Dictionary", description: "88 Essential Definitions for Sovereignty — linguistic manual for free souls seeking truth.", version: "v1.1.1", date: "2025-10-16", icon: Book, iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", isDictionary: true },
  { title: "Constitution", description: "The constitutional framework governing the Free Soul Movement's internal operations and member rights.", version: "v2.1.0", date: "2025-08-16", icon: BookOpen, iconColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
  { title: "PMA Agreement", description: "Private Membership Association terms, conditions, and ecclesiastical jurisdiction acknowledgment.", version: "v1.2.0", date: "2025-08-16", icon: Shield, iconColor: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  { title: "Trust Indenture", description: "Trust documentation for the Movement's assets, operations, and fiduciary responsibilities.", version: "v1.0.0", date: "2025-08-16", icon: Scale, iconColor: "text-green-400 bg-green-500/10 border-green-500/20" },
];

const dictionaryEntries = [
  { number: "0", term: "Soul", official: "The spiritual or immaterial part of a human being.", true_def: "The eternal essence of a living being — the breath of the Creator made manifest. The soul is not owned by any church, state, or institution. It is the sovereign core of who you are." },
  { number: "0a", term: "Rebuke", official: "An expression of sharp disapproval or criticism.", true_def: "The formal correction of error in law and spirit. A rebuke is an act of peace, not aggression — it is notice that an agent or institution has overstepped their authority." },
  { number: "1", term: "Sovereignty", official: "Supreme authority within a territory.", true_def: "The inherent, God-given authority of the living soul over their own body, mind, and spirit. Sovereignty is not granted by any state, constitution, or institution — it is a birthright of creation itself." },
  { number: "1a", term: "Sovereign", official: "A supreme ruler, especially a monarch.", true_def: "A living man or woman who stands in their Creator-given authority, not subject to any fiction, corporation, or dead-hand institution without their explicit, knowing consent." },
  { number: "2", term: "Law", official: "The system of rules created and enforced by governments.", true_def: "The living order of the Creator's balance, written into nature, soul, and conscience. Natural law supersedes all statute, code, and regulation. True law protects; false law enslaves." },
  { number: "3", term: "Justice", official: "Just behavior or treatment.", true_def: "Balance in truth and equity, where no word or silence may be twisted to ensnare the living. Honor belongs only to the Creator. Justice without truth is tyranny wearing a robe." },
  { number: "3a", term: "Equity", official: "The quality of being fair and impartial.", true_def: "True fairness rooted in natural law — not the 'equity' of courts which operate in admiralty. Real equity recognizes the living soul above the legal fiction." },
  { number: "4", term: "Freedom", official: "The power or right to act, speak, or think as one wants.", true_def: "The natural state of being, unbound by fictions. Not a privilege granted by government but the default condition of every soul born under the Creator's order." },
  { number: "4a", term: "Liberty", official: "The state of being free within society.", true_def: "A lesser form of freedom — liberty implies permission granted within a system. True freedom needs no permission. Liberty is the empire's substitute for the real thing." },
  { number: "5", term: "Rebuke (Formal)", official: "To express sharp disapproval.", true_def: "The sovereign's formal notice of correction — a lawful instrument that places agents, officers, and institutions on notice that they have trespassed. When unrebutted, it stands as truth." },
  { number: "6", term: "Authority", official: "The power to give orders, make decisions, and enforce obedience.", true_def: "True authority flows only from the Creator to the living. All delegated authority (government, courts, agencies) is borrowed and conditional. When authority is abused, it is void." },
  { number: "6a", term: "Politics", official: "Management of public affairs.", true_def: "Rule by parasites ('poly-ticks') feeding on the people's work and energy. Politics is the theater of the Vempire — where decisions are pre-made and 'choice' is an illusion." },
  { number: "6b", term: "Kleptocrat", official: "A ruler who uses political power to steal resources and wealth.", true_def: "Most politicians — cloaking theft as governance. Kleptocrats loot land, gold, oil, and public funds, funneling it into private accounts while the people remain in debt and poverty. Theft and rape disguised as leadership." },
  { number: "6c", term: "Cancer", official: "A disease caused by uncontrolled cell growth and division of abnormal cells.", true_def: "Not merely a medical condition but a consuming parasitic manifestation of deception. The body rebelling under the internalization of misalignment from lies, toxins, and prolonged imbalance. Its power is maintained by concealment of truth and suppression of natural healing." },
  { number: "6d", term: "Tyranny", official: "Cruel, unreasonable, or arbitrary use of power or control.", true_def: "A condition where authority continues to demand obedience, labor, or resources while no longer benefiting the population. When reciprocity ends but extraction continues, governance becomes tyranny. Tyranny is the societal form of a parasitic bond." },
  { number: "7", term: "Government", official: "The governing body of a nation, state, or community.", true_def: "Self-governance under Creator's law is the only true government. Any external government that denies freedom identifies itself as ungodly and unnatural." },
  { number: "7a", term: "Govern-ment", official: "System of control.", true_def: "Govern (Latin gubernare: to control) + ment (Latin mentis: mind). Government literally means 'mind control.' The first act of government is always to control what people think and believe." },
  { number: "8", term: "State", official: "A nation or territory considered as an organized political community.", true_def: "A legal fiction — a corporate entity operating under charter. The 'state' is not the land or the people; it is the administrative apparatus imposed upon them." },
  { number: "8a", term: "State of Being", official: "One's condition or status.", true_def: "The living condition of the soul — not to be confused with the political 'state.' Your state of being is sovereign, natural, and beyond jurisdiction." },
  { number: "9", term: "Nation", official: "A large body of people united by common descent, history, culture.", true_def: "From Latin natio: birth, origin, people. A nation is born from the people, not imposed upon them. True nations arise from tribes, not from colonial borders drawn by empires." },
  { number: "9a", term: "Nationality", official: "The status of belonging to a particular nation.", true_def: "A presumed status — often assigned at birth without consent. True nationality is tribal, not political. It flows from bloodline, covenant, and Creator — not from paperwork." },
  { number: "9b", term: "Indigenous", official: "Originating naturally in a particular place.", true_def: "The original stewards of the land — those whose covenant with the earth predates all colonial claims. Indigenous rights are not granted by treaties; they are inherent and eternal." },
  { number: "9c", term: "Moor / Moorish", official: "Historical term for North African Muslims.", true_def: "The Moors were among the greatest civilizers in history — builders of universities, libraries, and advanced societies in Spain, Africa, and beyond. Their legacy was deliberately erased by European empire." },
  { number: "10", term: "Corporation", official: "A company authorized to act as a single entity.", true_def: "A 'corpse-oration' — a dead entity animated by legal fiction. Governments, cities, and courts are corporations. Through your birth certificate, you too were incorporated without consent." },
  { number: "10a", term: "Corpse", official: "A dead body.", true_def: "The root of 'corporation.' Every corporation is a dead body given the illusion of life through charter and statute. The living should never be governed by the dead." },
  { number: "11", term: "Citizen", official: "A legally recognized subject of a state.", true_def: "A status of subjection — the citizen trades sovereignty for 'benefits' under a contract most never knowingly signed. Citizenship is voluntary, though the empire never tells you that." },
  { number: "11a", term: "Civilian", official: "A non-military member of society under protection of the state.", true_def: "A label designed to separate the 'ruled' from the 'armed.' By declaring the people 'civilians,' the Vempire stripped them of their inherent role as the true militia — the keepers of their own defense. Sovereign people are the militia." },
  { number: "11b", term: "Membership", official: "Enrollment or belonging to an organization, group, or state.", true_def: "A contract of allegiance. From Latin membrum = 'limb, part of a body.' To be a member is to be absorbed into another body. True membership is covenant, not contract — voluntary, rooted in Creator's law." },
  { number: "11c", term: "COINTELPRO", official: "A covert FBI program (1956–1971) to investigate and disrupt domestic political organizations.", true_def: "A Vempire tool of psychological and political warfare against sovereignty movements — especially Black liberation, Indigenous rights, and anti-war groups. It assassinated leaders (Fred Hampton, MLK, Malcolm X), fractured movements, and led directly into the War on Drugs." },
  { number: "12", term: "Tribe", official: "A social division in a traditional society.", true_def: "The natural organizing unit of the living — families bound by covenant, land, and Creator's law. The tribe is the antidote to isolation and the foundation of true self-governance." },
  { number: "12a", term: "Hearth", official: "The floor of a fireplace; home.", true_def: "The sovereign household — the foundational unit of the tribe. A hearth of 88–150+ living souls, self-sufficient in food, water, energy, and defense. The hearth is heaven on earth, built by hand and covenant." },
  { number: "13a", term: "Economy", official: "The system of production, distribution, and consumption.", true_def: "From Greek oikonomia: household management. True economy is care, stewardship, and reciprocity — not extraction. The empire perverted economy into a system of harvesting human energy." },
  { number: "13b", term: "Capitalism", official: "An economic system based on private ownership.", true_def: "Capital = head (Latin caput). Capitalism is the counting of heads — human capital. The system values people as commodities, not as living souls." },
  { number: "13c", term: "Communism", official: "A political theory derived from Karl Marx.", true_def: "The other side of the same coin as capitalism — both concentrate power in the hands of the few. Communism promises equality but delivers state control. The tribe is the true third way." },
  { number: "13d", term: "Socialism", official: "A political and economic theory of social ownership.", true_def: "Another empire construct that promises community but delivers bureaucracy. True social harmony comes from tribe and covenant, not from state redistribution." },
  { number: "14", term: "Money", official: "A current medium of exchange in the form of coins and banknotes.", true_def: "Originally a store of energy and labor. Real money is backed by something tangible. Modern money is debt-based fiction — created from nothing, backed by nothing, designed to enslave." },
  { number: "14a", term: "Currency", official: "A system of money in general use.", true_def: "Current-cy: the flow of energy. Real currency is the circulation of life and abundance. He who controls the current controls the civilization." },
  { number: "14b", term: "Dollar", official: "The basic monetary unit of the United States.", true_def: "Originally a silver coin (the Thaler). Today's dollar is a Federal Reserve note — a debt instrument, not money. It says 'In God We Trust' while operating on usury, the opposite of God's law." },
  { number: "15", term: "Debt", official: "Something that is owed.", true_def: "Under Creator's law, no living soul is born in debt. All modern debt is fiction imposed through commercial instruments. The system creates money as debt, making repayment mathematically impossible." },
  { number: "16", term: "Credit", official: "The ability of a customer to obtain goods before payment.", true_def: "From Latin credere: to believe. Credit is faith monetized. The system runs on your belief — your credit creates the 'money' they lend back to you at interest." },
  { number: "16a", term: "Creditor", official: "A person or company to whom money is owed.", true_def: "The living man is the original creditor — your signature creates the credit. The banks reversed the roles, making the creator of credit into the debtor. This is the foundational inversion." },
  { number: "17", term: "Fiat", official: "A formal authorization or proposition; a decree.", true_def: "Money created by decree, backed by nothing but force and belief. Fiat currency is the empire's counterfeit — it steals value from the living through inflation and artificial scarcity." },
  { number: "18", term: "Gold", official: "A yellow precious metal, the chemical element of atomic number 79.", true_def: "The Creator's money — incorruptible, unchanging, and finite. Gold has been deliberately suppressed in value to maintain the fiat illusion. Honest parity reveals the world is not in scarcity but in theft." },
  { number: "19", term: "Taxation", official: "The levying of tax.", true_def: "Tribute extracted through presumed jurisdiction. Under Creator's law, only voluntary offerings exist. Taxation without genuine consent is plunder with paperwork." },
  { number: "20", term: "Inflation", official: "A general increase in prices and fall in value of money.", true_def: "The hidden tax — deliberate devaluation of currency through expansion of money supply. Inflation is theft in slow motion, extracting wealth from the people to the money creators." },
  { number: "21", term: "Birth Certificate", official: "An official document recording a person's birth.", true_def: "A financial instrument — a bond — created when you were 'berthed' (docked) into the commercial system. It converted the living child into a corporate franchise, a surety for the national debt." },
  { number: "22", term: "Registration", official: "The action of registering.", true_def: "To transfer ownership to the crown/state. When you 'register' anything — a car, a child, a business — you transfer the title to the state and receive a 'certificate' (a receipt, not ownership)." },
  { number: "23", term: "Marriage", official: "The legally recognized union of two people.", true_def: "Originally a sacred covenant between two souls before the Creator. The state inserted itself through marriage licenses — making government a third party to your union and claiming jurisdiction over your family." },
  { number: "23a", term: "Marriage License", official: "A document authorizing a couple to marry.", true_def: "Permission from the state to do what you already have the right to do. The license makes the state a party to your union, giving it jurisdiction over your children and property." },
  { number: "23b", term: "Misogyny", official: "Dislike of, contempt for, or prejudice against women.", true_def: "A cowardly disorder of imbalance — arising from false identity, inflated ego, fear, and unhealed trauma. Misogyny is not strength; it is weakness disguised as dominance. Man and woman are equal parts of a whole. There would be no history without her story." },
  { number: "24", term: "Family", official: "A household recognized by the state.", true_def: "A bond of blood and/or spirit, sacred beyond paperwork. The family is the first tribe — the Creator's design for love, protection, and continuity." },
  { number: "25", term: "Education", official: "Instruction by schools.", true_def: "Learning applicable knowledge to life. Most education in the current system is indoctrination into the Vempire's worldview, replacing wisdom with compliance." },
  { number: "26", term: "Health", official: "Absence of disease.", true_def: "Balance of body, mind, and spirit with nature's order. True health flows from clean food, water, air, movement, and alignment with the Creator." },
  { number: "27", term: "Medicine", official: "The science or practice of diagnosis, treatment, and prevention of disease.", true_def: "Originally plants, food, and the Creator's remedies — corrupted for profit by pharma. True medicine heals the whole being, not just symptoms." },
  { number: "28", term: "Vaccination", official: "Immunization from disease.", true_def: "Insertion into the body of abnormal substances tied to the empire's profit and control. Became a ritual of the Vempire: not just medicine, but obedience." },
  { number: "29", term: "Death Certificate", official: "Record of passing.", true_def: "Final accounting document, closing the corporate fiction of the birth certificate. When a living soul dies, the Vempire doesn't mourn — it balances books. Birth opens the bond, death closes it." },
  { number: "30", term: "Religion", official: "A particular system of faith and worship.", true_def: "'Re-ligare' = 'to bind again'; often used to bind souls to Vempire, not the Creator. Religion, when tribal and Creator-rooted, is faith. When institutionalized, it becomes a cage." },
  { number: "31", term: "Church", official: "Building or institution of worship.", true_def: "In original Greek, ekklesia = 'assembly of people'; empire turned it into a building and hierarchy. True church = assembly of sovereign souls aligned with Creator." },
  { number: "32", term: "Priest", official: "Mediator between God and people.", true_def: "Interposed authority figure; often false gatekeeper between Creator and soul. Through the Tsela we understand there can be no mediator between man and God. Modern priesthoods include lawyers, doctors, politicians, and media anchors." },
  { number: "33", term: "Vatican", official: "Seat of the Roman Catholic Church.", true_def: "From Latin Vaticanus — rooted in vates (seer) + canus (serpent). Built on Mons Vaticanus, an ancient necropolis. Holds one of the world's largest hidden libraries. Through papal bulls, it became the legal + spiritual empire claiming ownership of land, commerce, and souls." },
  { number: "33a", term: "Pope", official: "Bishop of Rome; head of the Catholic Church.", true_def: "The self-styled 'Vicar of Christ,' claiming authority over kings and nations. In papal bulls, the Pope declared dominion over all human souls — living and unborn." },
  { number: "33b", term: "Vicar", official: "From Latin vicarius — a substitute, deputy, or representative.", true_def: "No human office may lawfully stand in the place of the Divine. Where an office claims vicariate as the necessary mediator for salvation, it functions as institutional fraud, converting spiritual authority into legal and economic leverage." },
  { number: "33c", term: "Vempire", official: "No official definition exists.", true_def: "Vampire + Empire = a parasitic system that feeds on the lifeblood and energy of the people. The Vempire's trinity of power: Vatican (spiritual authority), Crown (earthly dominion), Bankers (financial alchemy turning life into debt)." },
  { number: "34", term: "Unam Sanctam", official: "Papal bull asserting church supremacy (1302).", true_def: "Document claiming ownership over every soul, land, and authority on Earth. 'Every human creature be subject to the Roman Pontiff.' The root document of global spiritual enslavement." },
  { number: "34a", term: "Doctrine of Discovery", official: "Papal Bulls beginning with Dum Diversas (1452).", true_def: "The spiritual and legal foundation for nearly five centuries of European colonization. Used as divine authorization to seize any lands not ruled by Christians. If the origin is now disowned by its source, then the chain of title is corrupted." },
  { number: "35", term: "Papal Bull", official: "Formal decree issued by the Pope.", true_def: "Vatican's 'magic scrolls' — contracts of empire that legalized conquest, slavery, and colonization. Edicts claiming dominion over all lands, peoples, and souls." },
  { number: "36", term: "Basilica", official: "A public hall of judgment, commerce, and imperial administration in ancient Rome.", true_def: "Rome's hidden ecclesiastical court. From Greek basileus meaning 'king.' The same structure that housed imperial courts now hosts ecclesiastical ones — a continuation of the empire under sacred language." },
  { number: "37", term: "Sacrament", official: "Sacred ritual of grace.", true_def: "Institutional rituals used to bind people under church control. The empire converted genuine spiritual practices into mechanisms of jurisdiction." },
  { number: "38", term: "Eucharist", official: "Commemoration of Christ's sacrifice.", true_def: "Continuation of ancient seduction rites; homage to empire through vicarship, not necessarily resurrection." },
  { number: "39", term: "Crusade", official: "Holy war sanctioned by church.", true_def: "Centuries of theft, murder, and enslavement under the guise of faith. 1095–1291. The Vatican blessed the war, blessed the banks, blessed the blood money." },
  { number: "40", term: "Colony", official: "Territory settled by another nation.", true_def: "Stolen land turned into profit centers for the Vempire. Colonization is not 'discovery' — it is invasion, genocide, and enslavement dressed in the language of civilization." },
  { number: "41", term: "War", official: "A state of armed conflict between nations or states.", true_def: "The systemic reduction of sovereign souls into servitude through violence, law, and debt. War is not found in nature — it is a product of deception. War is the Vempire's reset button." },
  { number: "41a", term: "Tribal Combat", official: "Structured, rule-bound physical contests to settle disputes.", true_def: "A controlled and consensual form of embodied conflict designed to release tension, restore clarity, strengthen tribal kin, and prevent larger cycles of retaliation. Unlike war, tribal combat operates within agreed limits and communal oversight." },
  { number: "42", term: "Genocide", official: "The deliberate killing of a large number of people from a particular nation or ethnic group.", true_def: "The systematic destruction of a people — not only through murder but through cultural erasure, forced assimilation, stolen children, and broken treaties. Genocide is the empire's most extreme tool." },
  { number: "43", term: "Propaganda", official: "Information used to promote a political cause or point of view.", true_def: "The weaponization of information to control perception. Propaganda is the Vempire's first weapon — it rewrites history, manufactures consent, and turns truth into treason." },
  { number: "43a", term: "Legalese", official: "The formal and technical language of legal documents.", true_def: "The dead tongue — a language designed to confuse, bind, and entrap the living. Legalese makes ordinary people doubt their own senses while courts operate in hidden commercial meanings." },
  { number: "43b", term: "Disenfranchisement", official: "The state of being deprived of a right or privilege.", true_def: "The systematic removal of voice, vote, and power from targeted populations. The Vempire disenfranchises through debt, incarceration, propaganda, and legal fiction." },
  { number: "44", term: "Treaty", official: "A formally concluded agreement between states.", true_def: "Empire's paper promise — honored only when convenient. Every major treaty with Indigenous nations has been violated. Treaties are tools of deception when backed by bad faith." },
  { number: "45", term: "Banking", official: "The business conducted by a bank.", true_def: "The banks of a river control the flow of current (currency). Banking is the control of energy flow. Banks do not lend money — they create it from your signature and charge you interest on what you created." },
  { number: "46", term: "Central Bank", official: "A national bank that provides financial services to its government.", true_def: "The control center of economic slavery. Central banks create money from nothing, charge interest on the creation, and use inflation to silently steal from every living soul." },
  { number: "47", term: "Federal Reserve", official: "The central banking system of the United States.", true_def: "Neither federal nor a reserve. A private banking cartel created in 1913 to control America's money supply. It creates currency from nothing, lends it at interest, and enslaves the nation through perpetual debt." },
  { number: "48", term: "Bretton Woods", official: "The 1944 international monetary agreement.", true_def: "The agreement that made the U.S. dollar the world reserve currency, backed by gold. When Nixon broke the gold peg in 1971, the whole world was trapped in fiat — debt without substance." },
  { number: "49", term: "Nixon Shock", official: "The 1971 decision to end dollar-gold convertibility.", true_def: "The moment the empire removed the last restraint on money creation. After 1971, dollars became pure fiction — infinite debt backed by nothing but force and belief." },
  { number: "49a", term: "War on Drugs", official: "U.S. government campaign against illegal drug use.", true_def: "Never against substances but against people. The CIA ran drug pipelines while the DEA imprisoned millions. Hip-hop contracts were weaponized to promote poison while private prisons reaped profit." },
  { number: "50", term: "IMF / World Bank", official: "International financial institutions.", true_def: "The Vempire's global lending arms — they trap developing nations in debt, force structural adjustments that privatize public resources, and ensure economic dependency on the empire." },
  { number: "51", term: "CBDC", official: "Central Bank Digital Currency.", true_def: "The next evolution of fiat control — moving from paper fiction to digital leash. Where paper allows private exchange, CBDCs can be tracked, restricted, and switched off by decree. Digital slavery." },
  { number: "51a", term: "False Priorities of Vempire", official: "Not found in standard dictionaries.", true_def: "The empire prioritizes profit over people, control over freedom, extraction over stewardship. Its 'priorities' — defense spending, surveillance, corporate bailouts — reveal its true nature." },
  { number: "51b", term: "Artificial Scarcity", official: "Not found in standard dictionaries.", true_def: "The deliberate withholding of abundance to maintain control. The Earth provides more than enough — scarcity is manufactured through debt, monopoly, and policy." },
  { number: "51c", term: "UN & WHO", official: "United Nations and World Health Organization.", true_def: "Global governance bodies that present themselves as neutral arbiters but serve the Vempire's agenda of centralized control over nations, health, and resources." },
  { number: "52", term: "Corporate Personhood", official: "The legal concept that a corporation has rights similar to a person.", true_def: "The legal fiction that gives dead entities (corporations) the same rights as living souls. A corpse-oration animated by statute, shielded from accountability, and empowered to consume without conscience." },
  { number: "53", term: "Land Patent", official: "A government grant of land rights.", true_def: "The highest form of land title — a patent from the sovereign. Land patents predate and supersede all subsequent deeds and mortgages. Reclaiming the patent is reclaiming the land." },
  { number: "54", term: "Deed", official: "A legal document transferring property.", true_def: "A lesser form of title — the deed is not ownership, it is permission. True ownership (allodial title) comes from the Creator through the patent. Deeds keep you in the system." },
  { number: "55", term: "Eminent Domain", official: "The right of government to take private property for public use.", true_def: "The state's claim that it can seize your land whenever it decides the 'public good' requires it. Under natural law, no government can take what the Creator gave to the living." },
  { number: "56", term: "Frequency (Vibration)", official: "The rate at which a vibration occurs.", true_def: "Everything is vibration. The Creator spoke the world into existence through frequency. Sound, light, thought, and emotion all carry frequency. Control the frequency, control the reality." },
  { number: "56a", term: "Global Vibe War", official: "Not found in standard dictionaries.", true_def: "The deliberate manipulation of music, media, and frequency to destabilize communities. The same bloodlines that dictated world finance also dictated what you heard on the radio — because controlling the vibe meant deeper control of the soul." },
  { number: "57", term: "Consent", official: "Permission for something to happen.", true_def: "Empire's trick — silence or failure to object is treated as consent. True consent requires full knowledge, free will, and explicit agreement. Without a meeting of minds, there is no valid consent." },
  { number: "58", term: "Subject", official: "A citizen under a monarch.", true_def: "The reality of all citizenship — one who is subjected to higher power. To be a 'subject' is to be ruled. The living soul is not a subject unless they consent to be." },
  { number: "58a", term: "Slave", official: "A person legally owned by another, deprived of personal freedom.", true_def: "Any living being whose natural rights, labor, or person are treated as the asset of another power — whether by force, law, debt, contract, or registration. Modern slavery appears as debt slavery, wage slavery, and birth-registration-based surety slavery." },
  { number: "58b", term: "Webster", official: "A person who weaves cloth.", true_def: "One who constructs the web — the matrix of definitions, concepts, and meanings through which people perceive reality and are bound in law. Dictionaries are webs; the webster frames the world others live in." },
  { number: "58c", term: "Weaver", official: "One who interlaces threads to produce cloth.", true_def: "One who, through faith and deliberate action, takes the web of meaning and manifests it into the fabric of reality — designing either cages or coverings, traps or temples, snares or sanctuaries." },
  { number: "58d", term: "Chokmah (Wisdom)", official: "Hebrew: Wisdom, Skill, Design, Creative Intelligence.", true_def: "Divine Feminine Wisdom — the inner side, the pattern, and the hidden architecture of the Creator. She is the blueprint of creation, the master craftswoman beside the Creator before the cosmos existed." },
  { number: "58e", term: "Tsela (Inner Side)", official: "The inner side, rib, sacred chamber.", true_def: "Tsela does not mean 'rib' — it means the inner sacred chamber where life, breath, and identity reside. Woman was formed from the same type of place where the Divine Presence dwells." },
  { number: "58f", term: "Logos (Word)", official: "The Word of God; divine reason.", true_def: "The creative command of the Creator — the seed of all manifestation. 'In the beginning was the Word.' The Logos is the decree that sets all creation into motion." },
  { number: "58g", term: "Ruach (Spirit/Breath)", official: "Hebrew: wind, breath, spirit.", true_def: "The living breath and life-force that animates every being — the energetic signature behind all creation. Ruach is emotion, intention, courage, and prophetic intuition. Institutions cannot generate Ruach; they can only redirect human life-energy." },
  { number: "59", term: "Person", official: "Any human or legal entity recognized by law.", true_def: "A mask (persona). In law, 'persons' are often corporations, not living souls. The 'person' is a fiction created to generate jurisdiction over the living." },
  { number: "60", term: "Natural Person", official: "A human being as recognized by law.", true_def: "Still a fiction — a downgraded soul placed under statutes. Even 'natural person' is a legal category, not the living man or woman." },
  { number: "61", term: "Legal Fiction", official: "An assumed entity created for convenience of law.", true_def: "The shadow constructs (corporations, trusts, 'persons') used to rule over living beings. The entire legal system operates through fictions imposed upon the living." },
  { number: "62", term: "Trust", official: "Legal arrangement of one person holding property for another's benefit.", true_def: "One of the oldest chains of empire (Vatican, Crown) — but also a tool that can be flipped into sovereignty if rooted in the ways of the Creator." },
  { number: "63", term: "Bond", official: "A debt security or guarantee.", true_def: "A bond is either a natural connection or a financial chain. Birth certificates, court cases, and even prisoners are 'bonded.' Understanding bonds is understanding the commerce of control." },
  { number: "63a", term: "Surety Bond", official: "A three-party guarantee of obligations.", true_def: "Empire's sleight of hand — unless you claim sovereignty, you are made the surety (liable) for the legal fiction's debts." },
  { number: "64", term: "Indenture", official: "Contract binding someone as apprentice or worker.", true_def: "Root of indentured servitude — hidden slavery through paper contracts. The modern employment contract carries the same DNA." },
  { number: "65", term: "Beneficiary", official: "One who receives benefit from a trust.", true_def: "In the Vempire's trusts, the Vatican/Crown claim themselves as beneficiaries while the people produce all the wealth. The living man should be the beneficiary, not the surety." },
  { number: "66", term: "Deception", official: "The act of misleading.", true_def: "Confusing what is wrong with what is right and justifying evil. A spell of the Vempire. From false calendars and rewritten history to staged wars and fiat money, deception is the soil in which all chains grow." },
  { number: "66a", term: "Human", official: "A member of Homo sapiens.", true_def: "In law, hu-man = color/shadow of man. A fiction under color of law, not a living soul. By calling us 'human,' the Vempire downgrades divine beings into corporate property." },
  { number: "66b", term: "Jurisdiction", official: "The authority of a court to make legal decisions.", true_def: "A claim of control — but only if you step into it. No court can rule you if you question their jurisdiction. By oaths, contracts, or silence, souls are lured into accepting jurisdiction." },
  { number: "66c", term: "Mark", official: "A sign or identifier.", true_def: "The 'mark of the beast' = registration and numbering: Social Security, IDs, passports, barcodes. These are brands on the fiction, not the soul — unless you consent." },
  { number: "66d", term: "Chain", official: "Links of metal binding objects.", true_def: "A physical or spiritual symbol of bondage: contracts, laws, and codes binding the fiction — and through ignorance, binding the living soul." },
  { number: "66e", term: "Beast", official: "Animal, brute.", true_def: "The Vempire matrix itself: church, bank, state, their devices, and agents, when their actions create an oppressive force that feeds on humanity. 666 = perfected control through deception, false identity, and chains." },
  { number: "67", term: "Executor", official: "One who carries out a will or trust.", true_def: "In court, you're tricked into acting as executor for your NAME (the dead estate), binding you to debt. You should be the beneficiary receiving benefit." },
  { number: "68", term: "Administrator", official: "Manages an estate or trust.", true_def: "Another mask empire tries to force you into — managing their fiction while thinking it's your identity." },
  { number: "69", term: "Bailment", official: "Transfer of goods into custody for safekeeping.", true_def: "Every deposit (money in banks, even your body in hospitals) is a bailment — you give possession, they claim control." },
  { number: "70", term: "Surety", official: "Person responsible for another's obligation.", true_def: "The crown jewel of enslavement — making sovereign souls stand in for debts of fictions. Through the birth certificate, the living were made surety without knowledge or consent." },
  { number: "71", term: "Necromancy", official: "Magic involving the dead.", true_def: "Ritual use of death and ancestor energy — empire weaponized this through relics, tombs, and certificates. The Vatican's claim through Peter's bones is necromancy by definition." },
  { number: "72", term: "Occult", official: "Hidden supernatural practices.", true_def: "Simply 'hidden knowledge.' Corrupted into dark ritual, but once meant wisdom of nature and spirit. The empire hid knowledge to maintain control." },
  { number: "72a", term: "Alchemy", official: "Medieval practice of attempting to turn base metals into gold.", true_def: "The sacred art of transformation — not only of metals, but of the self. Turning ignorance into wisdom, fear into love, lead into gold. Empire reduced it to greed, obscuring its role as spiritual liberation." },
  { number: "72b", term: "Pharma", official: "Short for pharmaceuticals.", true_def: "From Greek pharmakon = both 'remedy' and 'poison.' Pharma is empire's counterfeit alchemy — borrowing the language of healing but practicing the science of control. Where alchemy sought wholeness, pharma seeks fragments." },
  { number: "73", term: "Saturnalia", official: "Roman festival honoring Saturn.", true_def: "Ritual inversion — later repackaged as Christmas. Like most holidays currently celebrated, the origin is twisted, distorting the celebration of something people think is good when the origin was against the Creator's natural order." },
  { number: "74", term: "Sacrifice", official: "An act of slaughtering as an offering to God.", true_def: "An act of giving up something valued for the sake of something regarded as more important or worthy. The empire twisted sacrifice into blood ritual; the Creator asks for truth and love, not death." },
  { number: "75", term: "Admiralty Law (Maritime Law)", official: "Laws governing seas and ships.", true_def: "The hidden system applied to all commerce and 'persons'; why births are tied to ports ('docks') and people presumed lost at sea. Admiralty law was brought onto the land through legal fiction." },
  { number: "75a", term: "CIA", official: "Central Intelligence Agency, founded 1947.", true_def: "Designed not to protect freedom but to ensure U.S. corporate and banking dominance abroad. Covert operations, propaganda, coups, drug pipelines, and regime change — the empire's global enforcement arm." },
  { number: "75b", term: "FBI", official: "Federal Bureau of Investigation.", true_def: "Empire's internal eyes. Through COINTELPRO, the FBI infiltrated and destroyed civil rights, Native, labor, and antiwar groups. MLK, Malcolm X, Black Panthers, AIM — all targeted. Protecting the empire from the people." },
  { number: "75c", term: "FDA", official: "Food and Drug Administration.", true_def: "A captured agency controlled by the industries it regulates. Legalized GMOs, approved opioids, suppressed natural cures. Food and Drug in one agency — nourishment and poison under one roof." },
  { number: "75d", term: "DEA", official: "Drug Enforcement Administration, created 1973.", true_def: "The 'War on Drugs' was always war on the people. Imprisoned millions for non-violent offenses while allowing CIA drug pipelines. Criminalized healing plants while Big Pharma's synthetic killers flow freely." },
  { number: "75e", term: "ICE", official: "Immigration and Customs Enforcement, created 2003.", true_def: "Operates within a framework that classifies human beings as 'legal' or 'illegal,' reducing lives to paperwork status. No human being is 'illegal' in their existence — law may regulate movement but does not determine human worth." },
  { number: "75f", term: "CPS", official: "Child Protective Services.", true_def: "Disproportionately targets Indigenous and poor families. Funnels children into foster systems rife with abuse. Weaponized against sovereignty — another form of Unam Sanctam: all souls belong to the state." },
  { number: "76", term: "Dock / Document", official: "A dock is a pier for ships; a document is a written record.", true_def: "Both connected in word-magic. The dock is where cargo is offloaded; the document is the paper proving ownership. Births are treated as dockings, certificates as cargo papers transferring you into the empire's registry." },
  { number: "76a", term: "Swear (Oath)", official: "To solemnly declare or promise, often invoking God.", true_def: "A surrender of sovereignty. To swear is to bind your soul to an external authority. The Bible says never to swear (Matthew 5:34–37). Your word alone is enough — a simple 'yes' or 'no' carries the authority of the Creator." },
  { number: "77", term: "Heaven", official: "A place of eternal paradise after death.", true_def: "The state of harmony, love, equity and justice when soul, land, tribe, and Creator are aligned. Heaven is not only after death — it can be cultivated here, in how we live and care for each other." },
  { number: "77a", term: "The 144,000 Myth", official: "Revelation 7 & 14 speak of 144,000 sealed with God's name.", true_def: "A literal headcount is a distortion — it transforms divine abundance into artificial scarcity. 144,000 = 12 tribes × 12 elders × 1,000 (completion). Christ said: 'In my Father's house are many mansions.' Heaven is not capped." },
  { number: "78", term: "Bestowal", official: "Act of giving.", true_def: "Mutual offering from soul to soul, without debt or demand. The foundation of sovereign exchange — value given freely, received with honor." },
  { number: "79", term: "Dominion", official: "Sovereignty or control.", true_def: "The authority and stewardship bestowed unto living men and women by the Creator, to care for land, water, air, fire and life — not to exploit it." },
  { number: "80", term: "Blessing", official: "Ritual words of approval, consecration.", true_def: "In sovereignty, blessing is the flow of Creator's life-force — a covering of light, love, and truth. The Vempire kept the word, stripped the truth." },
  { number: "81", term: "Holy", official: "Sacred, set apart for God.", true_def: "From Old English hālig = 'whole, unbroken, healthy.' To be holy is to be whole, healed, and aligned with the Creator. Not obedience to a church, but living in completeness." },
  { number: "82", term: "Prayer", official: "Set words recited to deity.", true_def: "Direct personal communication between living soul and the Creator — no priest or script is required. Prayer is the sovereign's direct line to the Source." },
  { number: "83", term: "Movement", official: "A change or development.", true_def: "The living current of spirit and people in motion; this is how tribes rise and grow in truth. The natural state of energy — stagnation is death, movement is life." },
  { number: "84", term: "Soul Mate", official: "A person ideally suited to another as a close friend or romantic partner.", true_def: "One of the most luminary connections one can make. Not necessarily romantic — a vibrational resonance that leaves a permeating imprint. Soul mates are made from the same Tsela (inner sacred structure). The impact is lasting; it shapes part of your soul." },
  { number: "85", term: "Harmony", official: "Agreement without conflict.", true_def: "Resonance of souls, land, and energy in balance. True law expressed musically in the enjoyment of life. Harmony is the Creator's design — equilibrium in motion." },
  { number: "86", term: "Love", official: "Intense affection or attachment between individuals.", true_def: "Not mere emotion, but the eternal current of Creator moving through all creation. Love is the sovereign law of life — binding tribe, hearth, and spirit in harmony. Five forms: Agápe (divine), Philia (tribal), Storgē (familial), Éros (creative), and Wavphilez (energetic — the love of energy, freedom, truth, and covenant with Creator)." },
  { number: "87", term: "Christ", official: "Title from Greek Christos, 'anointed one,' used as a name for Jesus.", true_def: "Christ is not a surname but a title: the Anointed. To be 'Christ' is to choose alignment with the Creator's spirit. Yeshua lived Christ fully, but every soul who stands in truth and love against deception carries the Christ spirit. Christ is universal." },
  { number: "87a", term: "Truth", official: "The body of real things, facts, or actuality.", true_def: "Truth is not merely fact — it is the alignment of word, thought, and action with the Creator's order. It is eternal, written into the fabric of creation. Truth is the antidote to deception and the hearthstone of sovereignty." },
  { number: "88", term: "Creator (∞)", official: "The supreme being, God, the origin of all.", true_def: "The Source from which all life flows — before church, state, crown, or empire. Whether you honor Allah, Buddha, Christ, Yahuah, or Great Spirit, the essence is one: the breath of life, the origin of soul, the eternal flame. The Creator is beyond ownership, taxation, or jurisdiction." },
  { number: "88a", term: "God-Fearing", official: "A devout believer showing reverence through fear of God's judgment.", true_def: "A deception in language. The Creator does not command fear, but discernment, love, awe, and reverence. 'Perfect love casts out fear' (1 John 4:18). Fear is the root of empire's control; love is the root of Creator's covenant." },
  { number: "88b", term: "Halea", official: "No official dictionary definition exists.", true_def: "The living Seal & Shout of sovereignty — the call of the Free Soul Tribe. Ha (breath, spirit, life-force) + Lea (to guide, to flow). Together: 'the breath that flows from Creator.' Halea is the reminder that the Creator's presence is alive in our living breath." },
  { number: "88c", term: "Charges", official: "An accusation brought by the state carrying penalty.", true_def: "The weight of trespass, fraud, or harm attached to one's oath, bond, or institution. Charges are not 'fees' but spiritual and lawful restitution owed for violation against the living soul. Our tribunal restores balance." },
  { number: "88d", term: "Equilibrium", official: "A state of balance between opposing forces.", true_def: "The natural law of harmony governing all living systems. The Creator's design for life, where energy flows without obstruction and relationships function through mutual balance rather than domination." },
  { number: "88e", term: "The Lion (Right of Defense)", official: "Defense is only what the state allows.", true_def: "Defense is not granted by men but bestowed by the Creator. The right to guard life, kin, and earth is sacred, unalienable, and beyond contract. The Lion roars not for conquest, but to end tyranny and trespass." },
  { number: "88f", term: "Enforcement of Charges", official: "Carrying out legal penalties.", true_def: "A charge issued by the Free Soul Ecclesiastical Tribunal binds in commerce, spirit, and record. Threefold enforcement: Spiritual (before Creator), Commercial (lien/claim), and Earthly (suit/damages). Dishonor remains recorded and collectible." },
  { number: "88g", term: "Energy", official: "The capacity to do work; force or power.", true_def: "The living current of the Creator flowing through all things. Energy cannot be created or destroyed, only transformed. Energy is also attention, will, and intent: what the soul focuses on expands." },
  { number: "88h", term: "Infinity (∞)", official: "Without end; boundless; not finite.", true_def: "Infinity is not theory — it is reality. The Creator's signature: the eternal wellspring without beginning or end. Each soul carries infinity within. If energy is eternal, and we are living energy from Creator, then our connection is likewise eternal and inalienable." },
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
      {activeTab === "dictionary" && <DictionaryTab search={dictSearch} setSearch={setDictSearch} onSelectEntry={setSelectedEntry} onOpenPdf={() => window.open(dictionaryPdfUrl, "_blank", "noopener,noreferrer")} />}
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
                    Tap any term to view its definition. Hold any term to open the full PDF dictionary.
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

function DictionaryTab({ search, setSearch, onSelectEntry, onOpenPdf }: { search: string; setSearch: (s: string) => void; onSelectEntry: (e: typeof dictionaryEntries[0]) => void; onOpenPdf: () => void }) {
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
            <DictionaryEntryCard key={entry.number} entry={entry} onSelectEntry={onSelectEntry} onOpenPdf={onOpenPdf} />
          ))
        )}
      </div>
    </div>
  );
}

function DictionaryEntryCard({ entry, onSelectEntry, onOpenPdf }: { entry: typeof dictionaryEntries[0]; onSelectEntry: (e: typeof dictionaryEntries[0]) => void; onOpenPdf: () => void }) {
  const [holdTimer, setHoldTimer] = useState<number | null>(null);

  const clearHold = () => {
    if (holdTimer) window.clearTimeout(holdTimer);
    setHoldTimer(null);
  };

  const startHold = () => {
    const timer = window.setTimeout(() => {
      onOpenPdf();
      setHoldTimer(null);
    }, HOLD_MS);
    setHoldTimer(timer);
  };

  return (
    <button
      type="button"
      onClick={() => onSelectEntry(entry)}
      onMouseDown={startHold}
      onMouseUp={clearHold}
      onMouseLeave={clearHold}
      onTouchStart={startHold}
      onTouchEnd={clearHold}
      className="w-full text-left glass-card rounded-2xl p-4 space-y-2 hover:border-purple-500/20 transition-colors"
      data-testid={`dict-entry-${entry.number}`}
    >
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
