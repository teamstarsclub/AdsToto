/**
 * AdsToto Transactional Email Service
 * Handles Account Confirmation and Password Reset emails.
 */

export interface EmailPayload {
  to: string;
  subject: string;
  htmlContent: string;
  previewText: string;
  type: 'welcome_confirmation' | 'password_reset';
  verificationCode?: string;
  sentAt: string;
}

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

/**
 * Sends a welcome confirmation email to a newly registered user
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

  const payload: EmailPayload = {
    to: user.email,
    subject,
    previewText,
    htmlContent,
    type: 'welcome_confirmation',
    sentAt: new Date().toISOString(),
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

  const payload: EmailPayload = {
    to: email,
    subject,
    previewText,
    htmlContent,
    type: 'password_reset',
    verificationCode: code,
    sentAt: new Date().toISOString(),
  };

  notifyEmailListeners(payload);
  return true;
}
