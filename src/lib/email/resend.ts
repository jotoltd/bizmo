import { envServer } from "@/lib/env-server";

type VerificationEmailInput = {
  to: string;
  verifyUrl: string;
};

export const sendVerificationEmail = async ({
  to,
  verifyUrl,
}: VerificationEmailInput): Promise<{ error?: string }> => {
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
      subject: "Verify your Bizno account",
      html: `<p>Welcome to Bizno.</p><p>Please verify your email to continue:</p><p><a href="${verifyUrl}">Verify email</a></p><p>If you did not create this account, you can ignore this email.</p>`,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("Resend verification email failed", response.status, body);

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
      return { error: `Could not send verification email: ${providerMessage}` };
    }

    return { error: "Could not send verification email." };
  }

  return {};
};
