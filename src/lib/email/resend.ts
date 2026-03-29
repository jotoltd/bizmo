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

// Base email template with Bizno branding
const baseEmailTemplate = (content: string, title: string): string => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 20px !important; }
      .content { padding: 24px !important; }
      .button { width: 100% !important; display: block !important; text-align: center !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" class="container" style="width: 600px; border-collapse: collapse; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px; text-align: center; background: rgba(0,212,255,0.1); border-bottom: 1px solid rgba(0,212,255,0.2);">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #00d4ff; letter-spacing: -0.5px;">Bizno</h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255,255,255,0.6);">Digital Readiness Platform</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td class="content" style="padding: 40px; color: #ffffff;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; text-align: center; background: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.05);">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: rgba(255,255,255,0.5);">
                Need help? Contact us at <a href="mailto:support@bizno.co.uk" style="color: #00d4ff; text-decoration: none;">support@bizno.co.uk</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.4);">
                © ${new Date().getFullYear()} Bizno. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

// Button component for emails
const emailButton = (href: string, text: string, variant: "primary" | "secondary" = "primary"): string => {
  const primaryStyles = "background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); color: #000000;";
  const secondaryStyles = "background: rgba(255,255,255,0.1); color: #ffffff; border: 1px solid rgba(255,255,255,0.2);";
  
  return `<a href="${href}" class="button" style="display: inline-block; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; ${variant === "primary" ? primaryStyles : secondaryStyles};">${text}</a>`;
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
  const content = `
    <h2 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: #ffffff;">Welcome to Bizno!</h2>
    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.8);">
      Thanks for signing up. Please verify your email address to activate your account and start managing your business setup.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      ${emailButton(verifyUrl, "Verify Email Address", "primary")}
    </div>
    <p style="margin: 24px 0 0 0; font-size: 14px; line-height: 1.5; color: rgba(255,255,255,0.6);">
      Or copy and paste this link into your browser:<br>
      <a href="${verifyUrl}" style="color: #00d4ff; word-break: break-all;">${verifyUrl}</a>
    </p>
    <p style="margin: 24px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.5);">
      If you didn't create this account, you can safely ignore this email.
    </p>
  `;

  return sendEmail({
    to,
    template: {
      subject: "Welcome to Bizno - Verify Your Email",
      html: baseEmailTemplate(content, "Verify Your Email"),
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
  const isAccepted = status === "accepted";
  const statusLabel = isAccepted ? "accepted" : "declined";
  const statusColor = isAccepted ? "#00d4ff" : "#ff6b6b";
  
  const content = `
    <h2 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: #ffffff;">Invitation ${statusLabel}</h2>
    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.8);">
      <strong style="color: ${statusColor};">${inviteeEmail}</strong> has ${statusLabel} your invitation to join <strong style="color: #ffffff;">${businessName}</strong>.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      ${emailButton(businessUrl, "View Business", "primary")}
    </div>
  `;

  return sendEmail({
    to,
    template: {
      subject: `Invitation ${statusLabel} - ${businessName}`,
      html: baseEmailTemplate(content, `Invitation ${statusLabel}`),
    },
  });
};

export const sendBusinessInvitationEmail = async ({
  to,
  businessName,
  inviterEmail,
  dashboardUrl,
}: BusinessInvitationEmailInput): Promise<{ error?: string }> => {
  const content = `
    <h2 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: #ffffff;">You've Been Invited!</h2>
    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.8);">
      <strong style="color: #00d4ff;">${inviterEmail}</strong> has invited you to join <strong style="color: #ffffff;">${businessName}</strong> on Bizno.
    </p>
    <div style="background: rgba(0,212,255,0.05); border: 1px solid rgba(0,212,255,0.2); border-radius: 12px; padding: 24px; margin: 24px 0;">
      <p style="margin: 0 0 16px 0; font-size: 14px; color: rgba(255,255,255,0.7);">
        As a team member, you'll be able to:
      </p>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: rgba(255,255,255,0.7);">
        <li style="margin-bottom: 8px;">Track business setup progress</li>
        <li style="margin-bottom: 8px;">Collaborate on tasks</li>
        <li>Stay updated on deadlines</li>
      </ul>
    </div>
    <div style="text-align: center; margin: 32px 0;">
      ${emailButton(dashboardUrl, "Accept Invitation", "primary")}
    </div>
    <p style="margin: 24px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.5);">
      This invitation will expire in 7 days. If you don't want to join, you can ignore this email.
    </p>
  `;

  return sendEmail({
    to,
    template: {
      subject: `You're invited to join ${businessName} on Bizno`,
      html: baseEmailTemplate(content, "Business Invitation"),
    },
  });
};

// New: Password reset email
export const sendPasswordResetEmail = async ({
  to,
  resetUrl,
}: {
  to: string;
  resetUrl: string;
}): Promise<{ error?: string }> => {
  const content = `
    <h2 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: #ffffff;">Reset Your Password</h2>
    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.8);">
      We received a request to reset your password. Click the button below to set a new password for your account.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      ${emailButton(resetUrl, "Reset Password", "primary")}
    </div>
    <p style="margin: 24px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.5);">
      This link will expire in 1 hour. If you didn't request this reset, you can safely ignore this email.
    </p>
  `;

  return sendEmail({
    to,
    template: {
      subject: "Reset Your Bizno Password",
      html: baseEmailTemplate(content, "Password Reset"),
    },
  });
};

// New: Deadline reminder email
export const sendDeadlineReminderEmail = async ({
  to,
  taskTitle,
  businessName,
  deadline,
  daysRemaining,
  taskUrl,
}: {
  to: string;
  taskTitle: string;
  businessName: string;
  deadline: string;
  daysRemaining: number;
  taskUrl: string;
}): Promise<{ error?: string }> => {
  const isUrgent = daysRemaining <= 1;
  const urgencyColor = isUrgent ? "#ff6b6b" : "#00d4ff";
  const urgencyText = isUrgent ? "Due tomorrow" : `${daysRemaining} days remaining`;
  
  const content = `
    <h2 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: #ffffff;">⏰ Task Reminder</h2>
    <div style="background: ${isUrgent ? 'rgba(255,107,107,0.1)' : 'rgba(0,212,255,0.05)'}; border: 1px solid ${urgencyColor}40; border-radius: 12px; padding: 24px; margin: 24px 0;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: ${urgencyColor}; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
        ${urgencyText}
      </p>
      <h3 style="margin: 0 0 12px 0; font-size: 20px; color: #ffffff;">${taskTitle}</h3>
      <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.7);">
        Business: <strong style="color: #ffffff;">${businessName}</strong><br>
        Due: <strong style="color: #ffffff;">${deadline}</strong>
      </p>
    </div>
    <div style="text-align: center; margin: 32px 0;">
      ${emailButton(taskUrl, "View Task", "primary")}
    </div>
  `;

  return sendEmail({
    to,
    template: {
      subject: `${isUrgent ? '🚨' : '⏰'} Task due ${daysRemaining === 1 ? 'tomorrow' : `in ${daysRemaining} days`} - ${taskTitle}`,
      html: baseEmailTemplate(content, "Task Reminder"),
    },
  });
};
