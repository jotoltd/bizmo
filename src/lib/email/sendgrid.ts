import { envServer } from "@/lib/env-server";

type VerificationEmailInput = {
  to: string;
  verifyUrl: string;
};

export const sendVerificationEmail = async ({
  to,
  verifyUrl,
}: VerificationEmailInput): Promise<{ error?: string }> => {
  if (!envServer.sendgridApiKey || !envServer.sendgridFromEmail) {
    return { error: "Email provider is not configured." };
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${envServer.sendgridApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: to }],
          subject: "Verify your Bizno account",
        },
      ],
      from: {
        email: envServer.sendgridFromEmail,
        name: "Bizno",
      },
      content: [
        {
          type: "text/html",
          value: `<p>Welcome to Bizno.</p><p>Please verify your email to continue:</p><p><a href="${verifyUrl}">Verify email</a></p><p>If you did not create this account, you can ignore this email.</p>`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("SendGrid verification email failed", response.status, body);
    return { error: "Could not send verification email." };
  }

  return {};
};
