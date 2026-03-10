import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Radio, HeartHandshake, Users } from "lucide-react";

interface OnboardingProps {
  onComplete: () => void;
}

export default function OnboardingPage({ onComplete }: OnboardingProps) {
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);

  const allChecked = check1 && check2;

  return (
    <div className="min-h-screen flex flex-col p-6 pb-10 animate-in-fade">
      <div className="flex-1 max-w-md mx-auto w-full">
        <div className="text-center pt-8 pb-6">
          <h1 className="text-5xl font-extrabold font-display gradient-text tracking-wide mb-2" data-testid="text-nigtalk-title">
            NIGTALK
          </h1>
          <p className="text-muted-foreground text-base" data-testid="text-tagline">Tune In. Speak Freely.</p>
        </div>

        <div className="flex justify-center gap-10 py-6 mb-6">
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-[#1a2540] border border-cyan-500/30 flex items-center justify-center">
              <Radio className="w-6 h-6 text-cyan-400" />
            </div>
            <span className="text-[11px] text-muted-foreground text-center leading-tight">Push-to-Talk<br />Radio</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-[#1a2540] border border-purple-500/30 flex items-center justify-center">
              <HeartHandshake className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-[11px] text-muted-foreground text-center leading-tight">Attention-Based<br />Bestowal</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-[#1a2540] border border-blue-500/30 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-[11px] text-muted-foreground text-center leading-tight">Tribes &<br />Frequencies</span>
          </div>
        </div>

        <div className="space-y-5 mb-8">
          <h2 className="text-2xl font-bold font-display" data-testid="text-tribal-code-title">Tribal Code & Community Standards</h2>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Welcome to NigTalk, a sovereign community platform.
          </p>

          <p className="text-sm text-foreground/90">By joining, you agree to our Tribal Code:</p>

          <div className="space-y-4 text-sm text-foreground/80 leading-relaxed">
            <p>&#8226; Walk in peace, truth, and honor. Keep matters private among members where appropriate.</p>
            <p>&#8226; Respect Elder and Council guidance. Resolve disputes peacefully through internal processes first.</p>
            <p>&#8226; Protect sacred knowledge and creative works. No exploitation, fraud, or coercion.</p>
            <p>&#8226; Care for children, elders, and those in need. Prioritize restitution over punishment.</p>
            <p>&#8226; No harassment, hate, or incitement. Uphold the dignity of all.</p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <label className="flex items-start gap-4 p-4 rounded-xl glass-card cursor-pointer" data-testid="checkbox-tribal-code">
            <Checkbox
              checked={check1}
              onCheckedChange={() => setCheck1(!check1)}
              className="mt-1 border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <span className="text-sm text-foreground/90 leading-relaxed">
              I have read, understood, and agree to abide by the Tribal Code and Community Standards.
            </span>
          </label>

          <label className="flex items-start gap-4 p-4 rounded-xl glass-card cursor-pointer" data-testid="checkbox-pma">
            <Checkbox
              checked={check2}
              onCheckedChange={() => setCheck2(!check2)}
              className="mt-1 border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <span className="text-sm text-foreground/90 leading-relaxed">
              I acknowledge that PMA exchanges are offered as mutual bestowal within a private association under ecclesiastical jurisdiction.
            </span>
          </label>
        </div>

        <Button
          className="w-full h-14 text-lg rounded-2xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-900/30"
          disabled={!allChecked}
          onClick={onComplete}
          data-testid="button-continue"
        >
          Continue to NigTalk
        </Button>
      </div>
    </div>
  );
}
