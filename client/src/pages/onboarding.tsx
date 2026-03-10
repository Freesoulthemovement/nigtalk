import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, ChevronDown, ChevronUp } from "lucide-react";

const communityStandards = [
  { id: "age", label: "I confirm that I am at least 18 years old" },
  { id: "voluntary", label: "I am joining NigTalk voluntarily as a member of this private community" },
  { id: "respect", label: "I agree to interact respectfully with other members and uphold community dignity" },
  { id: "no-harass", label: "I will NOT harass, threaten, intimidate, or bully others" },
  { id: "no-violence", label: "I will NOT promote violence, illegal activity, or exploitation" },
  { id: "no-hate", label: "I will NOT post hateful, abusive, or exploitative content" },
  { id: "no-impersonate", label: "I will NOT impersonate other members or manipulate platform systems" },
  { id: "bestowal", label: "I understand contributions are voluntary support, not investments, with no expectation of profit" },
  { id: "content", label: "I retain ownership of my content and grant NigTalk a non-exclusive display license" },
  { id: "terms", label: "I have read and agree to the NigTalk Terms of Service and Privacy Policy" },
];

interface OnboardingProps {
  onComplete: () => void;
}

export default function OnboardingPage({ onComplete }: OnboardingProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const allChecked = communityStandards.every((s) => checked[s.id]);

  const toggleCheck = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold font-display mb-2" data-testid="text-onboarding-title">
            Tribal Code & Community Standards
          </h1>
          <p className="text-muted-foreground text-sm">
            NigTalk is a private membership-association community. Please review and accept our standards before entering.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-4 mb-6">
          {communityStandards.map((standard) => (
            <label
              key={standard.id}
              className="flex items-start gap-3 cursor-pointer group"
              data-testid={`checkbox-${standard.id}`}
            >
              <Checkbox
                checked={checked[standard.id] || false}
                onCheckedChange={() => toggleCheck(standard.id)}
                className="mt-0.5 border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <span className="text-sm text-foreground/90 group-hover:text-foreground leading-relaxed">
                {standard.label}
              </span>
            </label>
          ))}
        </div>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => setShowTerms(!showTerms)}
            className="w-full flex items-center justify-between p-4 bg-card border border-border rounded-xl text-sm font-medium hover:border-primary/50 transition-colors"
            data-testid="button-toggle-terms"
          >
            <span>Terms of Service</span>
            {showTerms ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showTerms && (
            <ScrollArea className="h-48 bg-card/50 border border-border rounded-xl p-4">
              <div className="text-xs text-muted-foreground space-y-3 pr-4">
                <p className="font-semibold text-foreground">NigTalk Terms of Service — Effective Date: 1/26/26</p>
                <p>Welcome to NigTalk, a community platform operated by Free Soul The Movement. By accessing or using this platform, you agree to the following Terms of Service.</p>
                <p className="font-semibold text-foreground">1. Nature of the Platform</p>
                <p>NigTalk is a community-based media and mutual support platform. It operates as a private membership-association based community focused on creative expression, cultural dialogue, mutual support among members, and fair value exchange between audiences and creators. NigTalk is not a bank, investment vehicle, or financial institution.</p>
                <p className="font-semibold text-foreground">2. Membership & Eligibility</p>
                <p>You must be at least 18 years old, joining voluntarily, agreeing to interact respectfully, and understanding this is a private platform with community standards.</p>
                <p className="font-semibold text-foreground">3. Community Conduct</p>
                <p>Members agree NOT to harass, threaten, promote violence, post exploitative content, impersonate others, or manipulate platform systems.</p>
                <p className="font-semibold text-foreground">4. Creator Support & Contributions</p>
                <p>Contributions are voluntary support, not investments. There is no expectation of profit. Payout formulas may evolve.</p>
                <p className="font-semibold text-foreground">5. Content Ownership</p>
                <p>Creators retain ownership. You grant NigTalk a non-exclusive license to display and share previews for promotion.</p>
                <p className="font-semibold text-foreground">6–10. Platform Availability, No Advice, Suspension, Liability, Changes</p>
                <p>We aim for reliable service but cannot guarantee uptime. Nothing on this platform constitutes financial, legal, or medical advice. We may suspend accounts that violate terms. Use at your own discretion.</p>
              </div>
            </ScrollArea>
          )}

          <button
            onClick={() => setShowPrivacy(!showPrivacy)}
            className="w-full flex items-center justify-between p-4 bg-card border border-border rounded-xl text-sm font-medium hover:border-primary/50 transition-colors"
            data-testid="button-toggle-privacy"
          >
            <span>Privacy Policy</span>
            {showPrivacy ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showPrivacy && (
            <ScrollArea className="h-48 bg-card/50 border border-border rounded-xl p-4">
              <div className="text-xs text-muted-foreground space-y-3 pr-4">
                <p className="font-semibold text-foreground">NigTalk Privacy Policy — Effective Date: 1/26/26</p>
                <p>Your privacy matters. We collect account info (username, email, profile details), usage data (content watched, time spent, interactions), and payment info handled by third-party processors.</p>
                <p>We use your data to operate the platform, calculate creator support, improve features, and prevent fraud. We do not sell your personal data.</p>
                <p>Attention tracking is used only to power the mutual support system and is not sold to advertisers.</p>
                <p>You can update your profile, delete your account, and request content removal. NigTalk is not intended for users under 18.</p>
                <p className="font-semibold text-foreground">NigTalk exists to empower creators and communities — not to exploit personal data.</p>
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="space-y-3">
          <Button
            className="w-full h-14 text-lg rounded-2xl shadow-xl shadow-primary/25"
            disabled={!allChecked}
            onClick={onComplete}
            data-testid="button-accept-standards"
          >
            Enter NigTalk
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Contact: <a href="mailto:nigtalksupport@freesoulthemovement" className="text-primary hover:underline" data-testid="link-support-email">nigtalksupport@freesoulthemovement</a>
          </p>
        </div>
      </div>
    </div>
  );
}
