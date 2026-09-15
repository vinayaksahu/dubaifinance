import nodemailer from "nodemailer";
import { db } from "@/lib/db";

// Create reusable Gmail SMTP transporter
function getGmailTransporter() {
  const user = process.env.GMAIL_USER || "dubaifinance.support@gmail.com";
  const pass = (process.env.GMAIL_APP_PASSWORD || "afod ydtb adop milg").replace(/\s+/g, "");

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Generate cryptographically random 6-digit OTP
 */
export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * HTML Email Template for Dubai Finance OTP
 */
function getOtpHtmlTemplate(otp: string, purpose: string = "REGISTRATION"): string {
  const isRegistration = purpose === "REGISTRATION";
  const title = isRegistration ? "Verify Your Email Address" : "Dubai Finance Security Code";
  const message = isRegistration
    ? "Thank you for joining Dubai Finance. Use the 6-digit verification code below to complete your registration."
    : "Use the following 6-digit verification code to complete your verification request.";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #030712;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #f3f4f6;
    }
    .container {
      max-width: 540px;
      margin: 40px auto;
      background: #0f172a;
      border: 1px solid rgba(245, 158, 11, 0.25);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    }
    .header {
      background: linear-gradient(135deg, #1e1b4b 0%, #090d16 100%);
      padding: 32px 24px;
      text-align: center;
      border-bottom: 1px solid rgba(245, 158, 11, 0.2);
    }
    .brand-title {
      color: #fbbf24;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin: 0;
      text-transform: uppercase;
    }
    .brand-subtitle {
      color: #94a3b8;
      font-size: 13px;
      margin-top: 4px;
    }
    .content {
      padding: 36px 28px;
      text-align: center;
    }
    .heading {
      color: #ffffff;
      font-size: 20px;
      font-weight: 700;
      margin: 0 0 12px 0;
    }
    .text {
      color: #94a3b8;
      font-size: 14px;
      line-height: 1.6;
      margin: 0 0 28px 0;
    }
    .otp-box {
      display: inline-block;
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%);
      border: 2px dashed #f59e0b;
      border-radius: 14px;
      padding: 16px 36px;
      margin: 8px 0 28px 0;
    }
    .otp-code {
      font-size: 36px;
      font-weight: 900;
      letter-spacing: 8px;
      color: #fbbf24;
      font-family: 'Courier New', Courier, monospace;
      margin-left: 8px;
    }
    .expiry {
      font-size: 12px;
      color: #e2e8f0;
      margin-top: 8px;
      font-weight: 600;
    }
    .warning {
      background: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 10px;
      padding: 12px 16px;
      color: #fca5a5;
      font-size: 12px;
      line-height: 1.5;
      text-align: left;
      margin-bottom: 24px;
    }
    .footer {
      background: #090d16;
      padding: 20px 24px;
      text-align: center;
      border-top: 1px solid #1e293b;
      font-size: 11px;
      color: #64748b;
    }
    .footer a {
      color: #f59e0b;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand-title">Dubai Finance</div>
      <div class="brand-subtitle">Smart Wealth & Asset Management</div>
    </div>
    <div class="content">
      <h2 class="heading">${title}</h2>
      <p class="text">${message}</p>
      
      <div class="otp-box">
        <div class="otp-code">${otp}</div>
        <div class="expiry">Valid for 10 minutes only</div>
      </div>
      
      <div class="warning">
        <strong>Security Notice:</strong> Never share this verification code with anyone, including Dubai Finance support representatives. Our team will never ask for your OTP.
      </div>
      
      <p class="text" style="margin-bottom: 0; font-size: 12px; color: #64748b;">
        If you did not request this verification code, please ignore this email or contact security support.
      </p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Dubai Finance. All rights reserved. <br>
      This is an automated system notification.
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Send OTP via Gmail SMTP and save to database
 */
export async function sendOtpEmail(email: string, purpose: string = "REGISTRATION") {
  const normalizedEmail = email.toLowerCase().trim();
  const otp = generateOtpCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Delete previous active OTPs for this email and purpose
  try {
    await (db as any).otpVerification.deleteMany({
      where: {
        email: normalizedEmail,
        purpose,
      },
    });
  } catch (err) {
    console.warn("[OTP Service] Could not clear old OTPs:", err);
  }

  // Save new OTP in database
  await (db as any).otpVerification.create({
    data: {
      email: normalizedEmail,
      otp,
      purpose,
      expiresAt,
    },
  });

  const transporter = getGmailTransporter();
  const fromName = process.env.SMTP_FROM_NAME || "Dubai Finance Security";
  const fromEmail = process.env.GMAIL_USER || "dubaifinance.support@gmail.com";

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to: normalizedEmail,
    subject: `Your Dubai Finance Verification Code: ${otp}`,
    text: `Your Dubai Finance verification code is ${otp}. It will expire in 10 minutes. Do not share this code with anyone.`,
    html: getOtpHtmlTemplate(otp, purpose),
  };

  const info = await transporter.sendMail(mailOptions);
  return { success: true, messageId: info.messageId };
}

/**
 * Verify OTP from database
 */
export async function verifyOtp(email: string, otp: string, purpose: string = "REGISTRATION"): Promise<boolean> {
  const normalizedEmail = email.toLowerCase().trim();
  const cleanOtp = otp.trim();

  const record = await (db as any).otpVerification.findFirst({
    where: {
      email: normalizedEmail,
      otp: cleanOtp,
      purpose,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!record) {
    return false;
  }

  // Cleanup used OTP
  try {
    await (db as any).otpVerification.delete({
      where: { id: record.id },
    });
  } catch (err) {
    console.warn("[OTP Service] Cleanup error:", err);
  }

  return true;
}
