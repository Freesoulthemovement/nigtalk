import { ReplitConnectors } from "@replit/connectors-sdk";

/**
 * SendGrid connector for NigTalk.
 *
 * Handles all transactional email for the platform:
 * - Welcome email on first login
 * - Governance proposal alerts (new proposal, vote result, expiry)
 * - Tribal Shield case notifications (filed, witnessed, defaulted)
 *
 * IMPORTANT: Do not cache the connectors instance — tokens expire.
 * Always call getUncachableSendGridClient() fresh per request.
 *
 * IMPORTANT: POST /v3/mail/send returns 202 with an EMPTY body.
 * Never call .json() on a send response — it will throw.
 * Check response.ok / response.status only.
 */

export function getUncachableSendGridClient() {
  return new ReplitConnectors();
}

interface EmailAddress {
  email: string;
  name?: string;
}

interface SendEmailOptions {
  to: EmailAddress | EmailAddress[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  from?: EmailAddress;
}

const DEFAULT_FROM: EmailAddress = {
  email: "nigtalksupport@freesoulthemovement.com",
  name: "NigTalk — Free Soul The Movement",
};

export async function sendEmail(opts: SendEmailOptions): Promise<boolean> {
  const connectors = getUncachableSendGridClient();

  const toArray = Array.isArray(opts.to) ? opts.to : [opts.to];

  const body = {
    personalizations: [{ to: toArray }],
    from: opts.from ?? DEFAULT_FROM,
    subject: opts.subject,
    content: [
      ...(opts.textContent
        ? [{ type: "text/plain", value: opts.textContent }]
        : []),
      { type: "text/html", value: opts.htmlContent },
    ],
  };

  // 202 Accepted returns an EMPTY body — do NOT call .json()
  const response = await connectors.proxy("sendgrid", "/v3/mail/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return response.ok;
}

// ── Pre-built email helpers ───────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, firstName: string) {
  return sendEmail({
    to: { email: to, name: firstName },
    subject: "Welcome to NigTalk — Free Soul The Movement",
    htmlContent: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0d0f1a;color:#e2e8f0;padding:32px;border-radius:16px;">
        <h1 style="background:linear-gradient(135deg,#7c3aed,#4f46e5);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:28px;">NIGTALK</h1>
        <p style="font-size:18px;">Welcome, ${firstName} 🌸</p>
        <p>You've joined a sovereign community built on Free Soul principles. Tune In. Speak Freely.</p>
        <p style="color:#94a3b8;font-size:13px;">Questions? Reply to this email or visit nigtalksupport@freesoulthemovement.com</p>
      </div>
    `,
    textContent: `Welcome to NigTalk, ${firstName}! Tune In. Speak Freely.\n\nQuestions? nigtalksupport@freesoulthemovement.com`,
  });
}

export async function sendProposalAlertEmail(
  to: string,
  firstName: string,
  proposalTitle: string,
  alertType: "new" | "voted" | "nullified" | "funded" | "expiring"
) {
  const subjects: Record<string, string> = {
    new: `New Governance Proposal: ${proposalTitle}`,
    voted: `Vote recorded on: ${proposalTitle}`,
    nullified: `Proposal Nullified: ${proposalTitle}`,
    funded: `Proposal Funded: ${proposalTitle}`,
    expiring: `Proposal closing soon: ${proposalTitle}`,
  };

  const messages: Record<string, string> = {
    new: `A new governance proposal has been submitted to your tribe: <strong>${proposalTitle}</strong>. Log in to vote.`,
    voted: `Your vote on <strong>${proposalTitle}</strong> has been recorded.`,
    nullified: `<strong>${proposalTitle}</strong> has been nullified by community vote.`,
    funded: `<strong>${proposalTitle}</strong> has reached its funding goal.`,
    expiring: `<strong>${proposalTitle}</strong> is closing within 24 hours. Cast your vote now.`,
  };

  return sendEmail({
    to: { email: to, name: firstName },
    subject: subjects[alertType],
    htmlContent: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0d0f1a;color:#e2e8f0;padding:32px;border-radius:16px;">
        <h2 style="color:#a78bfa;">Governance Alert</h2>
        <p>${messages[alertType]}</p>
        <p style="color:#94a3b8;font-size:13px;">NigTalk — Free Soul The Movement</p>
      </div>
    `,
    textContent: `${messages[alertType].replace(/<[^>]+>/g, "")}\n\nNigTalk — Free Soul The Movement`,
  });
}

export async function sendShieldCaseEmail(
  to: string,
  firstName: string,
  agentName: string,
  eventType: "filed" | "witnessed" | "defaulted"
) {
  const subjects: Record<string, string> = {
    filed: `Tribal Shield Case Filed Against ${agentName}`,
    witnessed: `Your Shield Case has a new witness`,
    defaulted: `Default Confirmed — ${agentName}`,
  };

  const messages: Record<string, string> = {
    filed: `Your Tribal Shield case against <strong>${agentName}</strong> has been filed. The 30-day cure period has begun.`,
    witnessed: `A community member has witnessed your Tribal Shield case.`,
    defaulted: `<strong>${agentName}</strong> has failed to cure within 30 days. Default has been confirmed on your Tribal Shield case.`,
  };

  return sendEmail({
    to: { email: to, name: firstName },
    subject: subjects[eventType],
    htmlContent: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0d0f1a;color:#e2e8f0;padding:32px;border-radius:16px;">
        <h2 style="color:#a78bfa;">Tribal Shield Update</h2>
        <p>${messages[eventType]}</p>
        <p style="color:#94a3b8;font-size:13px;">NigTalk — Free Soul The Movement</p>
      </div>
    `,
    textContent: `${messages[eventType].replace(/<[^>]+>/g, "")}\n\nNigTalk — Free Soul The Movement`,
  });
}
