/**
 * AdsToto Enterprise SaaS Transactional Email Service
 * Supports real outbound delivery via:
 * 1. Brevo REST API v3 (Sendinblue)
 * 2. Resend Cloud API
 * 3. EmailJS Browser SDK (@emailjs/browser)
 * 4. Custom Serverless / Webhook Endpoint
 * 5. In-App Real-Time Fallback & Listener
 */

import emailjs from '@emailjs/browser';

export interface EmailPayload {
  to: string;
  subject: string;
  htmlContent: string;
  previewText: string;
  type: 'welcome_confirmation' | 'password_reset' | 'signup_verification' | 'test_email';
  verificationCode?: string;
  sentAt: string;
  providerUsed?: string;
  deliveryStatus?: 'dispatched' | 'delivered' | 'local_fallback';
}

export interface EmailProviderConfig {
  provider: 'auto' | 'brevo' | 'resend' | 'emailjs' | 'webhook';
  brevoApiKey?: string;
  resendApiKey?: string;
  senderEmail?: string;
  senderName?: string;
  emailjsServiceId?: string;
  emailjsTemplateId?: string;
  emailjsPublicKey?: string;
  customWebhookUrl?: string;
}

const STORAGE_KEY_EMAIL_CONFIG = 'adstoto_email_provider_config_v3';

type EmailListener = (email: EmailPayload) => void;
const emailListeners: EmailListener[] = [];

export function subscribeToEmailDispatches(listener: EmailListener): () => void {
  emailListeners.push(listener);
  return () => {
    const idx = emailListeners.indexOf(listener);
    if (idx !== -1) emailListeners.splice(idx, 1);
  };
}

function notifyEmailListeners(email: EmailPayload) {
  emailListeners.forEach((listener) => {
    try {
      listener(email);
    } catch (e) {
      console.error('Email listener error', e);
    }
  });
}

export function getEmailProviderConfig(): EmailProviderConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EMAIL_CONFIG);
    if (raw) return JSON.parse(raw);
  } catch {
    // Fallback
  }
  return {
    provider: 'auto',
    senderEmail: 'security@adstoto.com',
    senderName: 'AdsToto Security',
  };
}

export function saveEmailProviderConfig(config: EmailProviderConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_EMAIL_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save email config:', err);
  }
}

/**
 * Attempts real outbound HTTP transmission to deliver email to recipient's inbox
 */
export async function sendRealOutboundEmail(params: {
  to: string;
  subject: string;
  code?: string;
  htmlContent: string;
  name?: string;
  type: 'signup_verification' | 'password_reset' | 'welcome_confirmation' | 'test_email';
}): Promise<{ dispatched: boolean; providerUsed: string; error?: string }> {
  const config = getEmailProviderConfig();
  const recipientName = params.name ? params.name.trim() : 'Advertiser';
  const fromEmail = config.senderEmail || 'security@adstoto.com';
  const fromName = config.senderName || 'AdsToto Security';

  // 1. Try Brevo REST API v3
  if (config.brevoApiKey && config.brevoApiKey.trim().length > 10) {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'api-key': config.brevoApiKey.trim(),
        },
        body: JSON.stringify({
          sender: { name: fromName, email: fromEmail },
          to: [{ email: params.to, name: recipientName }],
          subject: params.subject,
          htmlContent: params.htmlContent,
        }),
      });

      if (res.ok) {
        return { dispatched: true, providerUsed: 'Brevo Transactional SMTP' };
      }
    } catch (err: unknown) {
      console.warn('Brevo dispatch attempt failed:', err);
    }
  }

  // 2. Try Resend API
  if (config.resendApiKey && config.resendApiKey.trim().length > 10) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.resendApiKey.trim()}`,
        },
        body: JSON.stringify({
          from: `${fromName} <onboarding@resend.dev>`,
          to: [params.to],
          subject: params.subject,
          html: params.htmlContent,
        }),
      });

      if (res.ok) {
        return { dispatched: true, providerUsed: 'Resend Cloud Delivery' };
      }
    } catch (err: unknown) {
      console.warn('Resend dispatch attempt failed:', err);
    }
  }

  // 3. Try EmailJS Browser Relay
  if (config.emailjsServiceId && config.emailjsTemplateId && config.emailjsPublicKey) {
    try {
      const res = await emailjs.send(
        config.emailjsServiceId.trim(),
        config.emailjsTemplateId.trim(),
        {
          to_email: params.to,
          to_name: recipientName,
          verification_code: params.code || '',
          subject: params.subject,
          html_message: params.htmlContent,
        },
        config.emailjsPublicKey.trim()
      );

      if (res.status === 200) {
        return { dispatched: true, providerUsed: 'EmailJS Browser Relay' };
      }
    } catch (err: unknown) {
      console.warn('EmailJS dispatch attempt failed:', err);
    }
  }

  // 4. Try Custom Webhook
  if (config.customWebhookUrl && config.customWebhookUrl.startsWith('http')) {
    try {
      const res = await fetch(config.customWebhookUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: params.to,
          name: recipientName,
          code: params.code,
          subject: params.subject,
          html: params.htmlContent,
          type: params.type,
          sentAt: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        return { dispatched: true, providerUsed: 'Custom SaaS Webhook' };
      }
    } catch (err: unknown) {
      console.warn('Webhook dispatch attempt failed:', err);
    }
  }

  return { dispatched: false, providerUsed: 'Interactive In-App Dispatcher' };
}

/**
 * Sends a 6-digit email verification code for new advertiser account registration
 */
export async function sendSignupVerificationEmail(
  email: string,
  code: string,
  name?: string
): Promise<{ success: boolean; providerUsed: string; dispatchedReal: boolean }> {
  const recipientName = name ? name.trim() : 'Advertiser';
  const subject = `🛡️ [AdsToto] Your Verification Code: ${code}`;
  const previewText = `Your AdsToto 6-digit confirmation code is ${code}. Valid for 15 minutes.`;

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0b0f17; color: #f1f5f9; padding: 32px; border-radius: 16px; border: 1px solid #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 12px; background: linear-gradient(135deg, #f59e0b, #4f46e5); font-weight: bold; font-size: 20px; color: white;">AT</div>
        <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin-top: 12px; margin-bottom: 4px;">Confirm Your Email</h1>
        <p style="color: #94a3b8; font-size: 13px; margin: 0;">AdsToto Pay-to-Rank Advertising Exchange</p>
      </div>

      <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
        Hello <strong>${recipientName}</strong>,
      </p>

      <p style="color: #94a3b8; font-size: 13px; line-height: 1.6;">
        Thank you for joining AdsToto. To complete your account registration and access your advertiser dashboard, enter this one-time confirmation code:
      </p>

      <div style="text-align: center; margin: 28px 0;">
        <div style="display: inline-block; background: #020617; border: 2px dashed #f59e0b; padding: 16px 36px; border-radius: 14px; font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #f59e0b;">
          ${code}
        </div>
        <p style="color: #64748b; font-size: 11px; margin-top: 8px;">Valid for 15 minutes. Enter this code on the verification screen.</p>
      </div>

      <div style="background: #111827; padding: 14px 18px; border-radius: 10px; border: 1px solid #1f2937; font-size: 12px; color: #94a3b8; line-height: 1.5;">
        🔒 <strong>Security Tip:</strong> AdsToto will never ask for your private keys, seed phrase, or passwords.
      </div>

      <div style="border-top: 1px solid #1e293b; padding-top: 16px; margin-top: 24px; text-align: center; color: #64748b; font-size: 11px;">
        AdsToto · adstoto.com · Real-Time Pay-to-Rank Digital Advertising
      </div>
    </div>
  `;

  // Attempt real outbound delivery first
  const outboundResult = await sendRealOutboundEmail({
    to: email,
    subject,
    code,
    htmlContent,
    name: recipientName,
    type: 'signup_verification',
  });

  const payload: EmailPayload = {
    to: email,
    subject,
    previewText,
    htmlContent,
    type: 'signup_verification',
    verificationCode: code,
    sentAt: new Date().toISOString(),
    providerUsed: outboundResult.providerUsed,
    deliveryStatus: outboundResult.dispatched ? 'dispatched' : 'local_fallback',
  };

  notifyEmailListeners(payload);

  return {
    success: true,
    providerUsed: outboundResult.providerUsed,
    dispatchedReal: outboundResult.dispatched,
  };
}

/**
 * Sends a welcome confirmation email to a newly verified user
 */
export async function sendWelcomeConfirmationEmail(user: {
  name: string;
  email: string;
  brandName: string;
}): Promise<boolean> {
  const subject = `🎉 Welcome to AdsToto — Account Confirmed (${user.brandName})`;
  const previewText = `Your AdsToto advertiser account is active. Start bidding on high-visibility slots.`;

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0b0f17; color: #f1f5f9; padding: 32px; border-radius: 16px; border: 1px solid #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 12px; background: linear-gradient(135deg, #f59e0b, #4f46e5); font-weight: bold; font-size: 20px; color: white;">AT</div>
        <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin-top: 12px; margin-bottom: 4px;">Welcome to AdsToto!</h1>
        <p style="color: #94a3b8; font-size: 13px; margin: 0;">The Transparent Pay-to-Rank Advertising Exchange</p>
      </div>

      <div style="background: #111827; padding: 20px; border-radius: 12px; border: 1px solid #1f2937; margin-bottom: 24px;">
        <h2 style="color: #f59e0b; font-size: 15px; margin: 0 0 10px 0;">Account Details Confirmed</h2>
        <p style="color: #cbd5e1; font-size: 13px; margin: 4px 0;"><strong>Advertiser Name:</strong> ${user.name}</p>
        <p style="color: #cbd5e1; font-size: 13px; margin: 4px 0;"><strong>Brand / Company:</strong> ${user.brandName}</p>
        <p style="color: #cbd5e1; font-size: 13px; margin: 4px 0;"><strong>Email:</strong> ${user.email}</p>
        <p style="color: #10b981; font-size: 13px; margin: 4px 0;"><strong>Status:</strong> ✅ Active & Verified</p>
      </div>

      <p style="color: #94a3b8; font-size: 13px; line-height: 1.6;">
        You can now create campaigns starting at just $15, monitor real-time impressions and clicks, and configure your Auto-Bid Defense Shield to protect your rank on the leaderboard.
      </p>

      <div style="text-align: center; margin: 28px 0;">
        <a href="https://adstoto.com" style="display: inline-block; background: #f59e0b; color: #0b0f17; font-weight: bold; font-size: 13px; padding: 12px 28px; border-radius: 10px; text-decoration: none;">Go to Advertiser Dashboard &rarr;</a>
      </div>

      <div style="border-top: 1px solid #1e293b; padding-top: 16px; text-align: center; color: #64748b; font-size: 11px;">
        AdsToto · adstoto.com · Real-Time Pay-to-Rank Advertising
      </div>
    </div>
  `;

  const outboundResult = await sendRealOutboundEmail({
    to: user.email,
    subject,
    htmlContent,
    name: user.name,
    type: 'welcome_confirmation',
  });

  const payload: EmailPayload = {
    to: user.email,
    subject,
    previewText,
    htmlContent,
    type: 'welcome_confirmation',
    sentAt: new Date().toISOString(),
    providerUsed: outboundResult.providerUsed,
  };

  notifyEmailListeners(payload);
  return true;
}

/**
 * Sends a password reset email with a 6-digit OTP code
 */
export async function sendPasswordResetEmail(email: string, code: string): Promise<boolean> {
  const subject = `🔐 AdsToto Security: Password Reset Verification Code (${code})`;
  const previewText = `Your AdsToto password reset code is ${code}. Valid for 15 minutes.`;

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0b0f17; color: #f1f5f9; padding: 32px; border-radius: 16px; border: 1px solid #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 12px; background: linear-gradient(135deg, #f59e0b, #4f46e5); font-weight: bold; font-size: 20px; color: white;">AT</div>
        <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; margin-top: 12px; margin-bottom: 4px;">Password Reset Request</h1>
        <p style="color: #94a3b8; font-size: 13px; margin: 0;">AdsToto Security Services</p>
      </div>

      <p style="color: #cbd5e1; font-size: 13px; line-height: 1.6;">
        We received a request to reset the password for your AdsToto account (<strong>${email}</strong>). Use the one-time verification code below to set a new password:
      </p>

      <div style="text-align: center; margin: 24px 0;">
        <div style="display: inline-block; background: #020617; border: 2px dashed #f59e0b; padding: 14px 28px; border-radius: 12px; font-family: monospace; font-size: 28px; font-weight: 800; letter-spacing: 6px; color: #f59e0b;">
          ${code}
        </div>
        <p style="color: #64748b; font-size: 11px; margin-top: 8px;">Valid for 15 minutes. Never share this code with anyone.</p>
      </div>

      <div style="background: #111827; padding: 14px; border-radius: 10px; border: 1px solid #1f2937; font-size: 11px; color: #94a3b8;">
        ⚠️ If you did not request this password reset, please ignore this email or review your account security.
      </div>

      <div style="border-top: 1px solid #1e293b; padding-top: 16px; margin-top: 24px; text-align: center; color: #64748b; font-size: 11px;">
        AdsToto Security Operations · adstoto.com
      </div>
    </div>
  `;

  const outboundResult = await sendRealOutboundEmail({
    to: email,
    subject,
    code,
    htmlContent,
    type: 'password_reset',
  });

  const payload: EmailPayload = {
    to: email,
    subject,
    previewText,
    htmlContent,
    type: 'password_reset',
    verificationCode: code,
    sentAt: new Date().toISOString(),
    providerUsed: outboundResult.providerUsed,
  };

  notifyEmailListeners(payload);
  return true;
}

/**
 * Sends a live test email to verify delivery settings
 */
export async function sendTestEmailToAdmin(
  toEmail: string
): Promise<{ success: boolean; message: string; providerUsed: string }> {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const subject = `🧪 [AdsToto Test] Transactional Delivery Verification (${code})`;
  const htmlContent = `
    <div style="font-family: sans-serif; background: #0b0f17; color: white; padding: 24px; border-radius: 12px;">
      <h2 style="color: #f59e0b;">AdsToto Email Delivery Test</h2>
      <p>Your real SaaS transactional email pipeline is configured and active.</p>
      <p>Test Code: <strong>${code}</strong></p>
      <p style="color: #64748b; font-size: 12px;">Sent at: ${new Date().toLocaleString()}</p>
    </div>
  `;

  const result = await sendRealOutboundEmail({
    to: toEmail,
    subject,
    code,
    htmlContent,
    type: 'test_email',
  });

  return {
    success: result.dispatched,
    message: result.dispatched
      ? `Real test email successfully dispatched via ${result.providerUsed} to ${toEmail}!`
      : `Dispatched to in-app real-time dispatcher. Configure a Brevo API key, Resend key, or EmailJS credentials for direct SMTP delivery.`,
    providerUsed: result.providerUsed,
  };
}
