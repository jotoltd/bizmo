import { envServer } from "@/lib/env-server";

type VerificationEmailInput = {
  to: string;
  verifyUrl: string;
};

type BusinessInvitationEmailInput = {
  to: string;
  businessName: string;
  inviterEmail: string;
  dashboardUrl: string;
};

type BusinessInvitationResponseEmailInput = {
  to: string;
  businessName: string;
  inviteeEmail: string;
  status: "accepted" | "rejected";
  businessUrl: string;
};

type EmailTemplate = {
  subject: string;
  html: string;
};

const sendEmail = async ({
  to,
  template,
}: {
  to: string;
  template: EmailTemplate;
}): Promise<{ error?: string }> => {
  if (!envServer.resendApiKey || !envServer.resendFromEmail) {
    return { error: "Email provider is not configured." };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${envServer.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: envServer.resendFromEmail,
      to: [to],
      subject: template.subject,
      html: template.html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("Resend email failed", response.status, body);

    let providerMessage = "";
    try {
      const parsed = JSON.parse(body) as {
        error?: { message?: string };
        message?: string;
      };
      providerMessage = parsed.error?.message ?? parsed.message ?? "";
    } catch {
      providerMessage = "";
    }

    if (providerMessage) {
      return { error: `Could not send email: ${providerMessage}` };
    }

    return { error: "Could not send email." };
  }

  return {};
};

export const sendVerificationEmail = async ({
  to,
  verifyUrl,
}: VerificationEmailInput): Promise<{ error?: string }> => {
  return sendEmail({
    to,
    template: {
      subject: "Verify your Bizno account",
      html: `<p>Welcome to Bizno.</p><p>Please verify your email to continue:</p><p><a href="${verifyUrl}">Verify email</a></p><p>If you did not create this account, you can ignore this email.</p>`,
    },
  });
};

export const sendBusinessInvitationResponseEmail = async ({
  to,
  businessName,
  inviteeEmail,
  status,
  businessUrl,
}: BusinessInvitationResponseEmailInput): Promise<{ error?: string }> => {
  const statusLabel = status === "accepted" ? "accepted" : "rejected";

  return sendEmail({
    to,
    template: {
      subject: `${inviteeEmail} ${statusLabel} your Bizno invitation`,
      html: `<p><strong>${inviteeEmail}</strong> has ${statusLabel} your invitation to join <strong>${businessName}</strong>.</p><p><a href="${businessUrl}">Open business</a></p>`,
    },
  });
};

export const sendBusinessInvitationEmail = async ({
  to,
  businessName,
  inviterEmail,
  dashboardUrl,
}: BusinessInvitationEmailInput): Promise<{ error?: string }> => {
  return sendEmail({
    to,
    template: {
      subject: `You're invited to join ${businessName} on Bizno`,
      html: `<p>${inviterEmail} invited you to join <strong>${businessName}</strong> on Bizno.</p><p>Open your dashboard to accept or reject this invitation:</p><p><a href="${dashboardUrl}">Review invitation</a></p>`,
    },
  });
};
