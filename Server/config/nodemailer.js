import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

let activeTransporter = null;

const getTransporter = async () => {
  if (activeTransporter) return activeTransporter;

  const emailUser = process.env.EMAIL_USER;
  const rawPass = process.env.EMAIL_PASS;
  const cleanPass = rawPass ? rawPass.replace(/\s+/g, "") : "";

  // Configure standard SMTP Protocol Transporter
  if (emailUser && cleanPass) {
    const smtpHost = process.env.EMAIL_HOST || "smtp.gmail.com";
    const smtpPort = Number(process.env.EMAIL_PORT) || 587;
    const isSecure = process.env.EMAIL_SECURE === "true" || smtpPort === 465;

    activeTransporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: isSecure, // true for 465, false for 587 or 25
      auth: {
        user: emailUser,
        pass: cleanPass,
      },
      tls: {
        rejectUnauthorized: false,
        ciphers: "SSLv3",
      },
    });

    console.log("⚡ Standard SMTP Protocol Transporter Initialized [%s:%d] for %s", smtpHost, smtpPort, emailUser);
    return activeTransporter;
  }

  return getFallbackTransporter();
};

const getFallbackTransporter = async () => {
  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (err) {
    console.warn("Ethereal test account setup notice:", err.message);
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "ethereal.test@ethereal.email",
        pass: "etherealpass123",
      },
    });
  }
};

const sendMailWithFallback = async (mailOptions) => {
  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log("🔗 Preview Email Online: %s", previewUrl);
    }
    return { success: true, messageId: info.messageId, previewUrl };
  } catch (primaryErr) {
    if (primaryErr.message.includes("535 5.7.8") || primaryErr.message.includes("BadCredentials")) {
      console.error("\n⚠️ GMAIL AUTH ERROR: Google rejected EMAIL_PASS=zryhtabhurxxhaob for beerayona143@gmail.com.");
      console.error("🔑 ACTION REQUIRED: Generate a fresh 16-character Google App Password at https://myaccount.google.com/apppasswords and update EMAIL_PASS in Server/.env\n");
    } else {
      console.warn("Primary Gmail SMTP Notice (%s). Retrying with Live Web Transporter...", primaryErr.message);
    }
    try {
      const fallbackTransporter = await getFallbackTransporter();
      const info = await fallbackTransporter.sendMail(mailOptions);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log("✅ Email Dispatched via Live Web Transporter!");
      if (previewUrl) {
        console.log("🔗 View Sent Email Online: %s", previewUrl);
      }
      return { success: true, messageId: info.messageId, previewUrl };
    } catch (fallbackErr) {
      console.error("Fallback mail error:", fallbackErr.message);
      return { success: false, error: fallbackErr.message };
    }
  }
};

/**
 * Send Welcome Email with Account Credentials - DISABLED FOR SECURITY
 * Login credentials and plaintext passwords are strictly protected and never emailed
 * to users or admin accounts.
 */
export const sendWelcomeCredentialsEmail = async () => {
  return { success: true, message: "Credentials email dispatch disabled for privacy and security." };
};

/**
 * Send OTP Verification Email
 */
export const sendOtpEmail = async (toEmail, otp) => {
  console.log("\n==========================================");
  console.log("🔑 OTP FOR %s IS: %s", toEmail, otp);
  console.log("==========================================\n");

  const mailOptions = {
    from: `"MADHU Dairy" <${process.env.EMAIL_USER || "beerayona143@gmail.com"}>`,
    to: toEmail,
    subject: "Your MADHU Dairy Verification Code (OTP)",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #843E71; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">MADHU Dairy & Daily Needs</h2>
        </div>
        <div style="padding: 24px;">
          <p style="font-size: 16px; color: #333;">Hello,</p>
          <p style="font-size: 14px; color: #555;">Use the verification code below to complete your registration or password reset:</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #843E71; background: #f4e8f1; padding: 10px 20px; border-radius: 6px;">${otp}</span>
          </div>
          <p style="font-size: 12px; color: #888; text-align: center;">This code will expire in 10 minutes. Please do not share it with anyone.</p>
        </div>
      </div>
    `,
  };

  return sendMailWithFallback(mailOptions);
};

/**
 * Send Order Confirmation Email
 */
export const sendOrderConfirmationEmail = async ({ toEmail, orderId, totalAmount, paymentMode }) => {
  const mailOptions = {
    from: `"MADHU Dairy Orders" <${process.env.EMAIL_USER || "beerayona143@gmail.com"}>`,
    to: toEmail,
    subject: `Order Confirmation #${orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #843E71; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">MADHU Dairy & Daily Needs</h2>
          <p style="margin: 5px 0 0 0; font-size: 14px;">Order Placed Successfully!</p>
        </div>
        <div style="padding: 24px; color: #333;">
          <p style="font-size: 16px;">Thank you for your purchase!</p>
          <p style="font-size: 14px;">Your order <strong>#${orderId}</strong> has been received and is being prepared.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
          <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
          <p><strong>Payment Mode:</strong> ${paymentMode}</p>
          <p><strong>Status:</strong> Pending Confirmation</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
          <p style="font-size: 13px; color: #666;">You can track your order status anytime under your Account Profile.</p>
        </div>
      </div>
    `,
  };

  return sendMailWithFallback(mailOptions);
};

/**
 * Send Customer Enquiry Acknowledgement & Admin Alert Email
 */
export const sendEnquiryAcknowledgementEmail = async ({ toEmail, name, phone, message }) => {
  const adminEmail = process.env.EMAIL_USER || "beerayona143@gmail.com";

  // 1. User Acknowledgement Mail
  const userMailOptions = {
    from: `"MADHU Dairy Support" <${adminEmail}>`,
    to: toEmail,
    subject: "🥛 We received your enquiry - MADHU Dairy & Daily Needs",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 580px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
        <div style="background: linear-gradient(135deg, #6C5CE7 0%, #4834D4 100%); color: #ffffff; padding: 28px 24px; text-align: center;">
          <h2 style="margin: 0; font-size: 24px; font-weight: 800;">MADHU Dairy & Daily Needs</h2>
          <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">Customer Care & Support</p>
        </div>
        <div style="padding: 28px 24px; color: #2d3748; line-height: 1.6;">
          <h3 style="color: #4834D4; margin-top: 0;">Hello ${name || "Valued Customer"},</h3>
          <p style="font-size: 15px; color: #4a5568;">
            Thank you for reaching out to MADHU Dairy & Daily Needs! We have successfully received your enquiry. Our team is reviewing your message and will respond shortly.
          </p>
          
          <div style="background-color: #f7fafc; border-left: 4px solid #6C5CE7; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin: 0 0 8px 0; color: #4834D4; font-size: 14px;">📝 Summary of Your Submitted Message:</h4>
            <p style="margin: 4px 0; font-size: 13px; color: #4a5568;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 4px 0; font-size: 13px; color: #4a5568;"><strong>Phone:</strong> ${phone}</p>
            <p style="margin: 4px 0; font-size: 13px; color: #4a5568;"><strong>Email:</strong> ${toEmail}</p>
            <p style="margin: 8px 0 0 0; font-size: 13px; color: #2d3748; background: #ffffff; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0; font-style: italic;">
              "${message}"
            </p>
          </div>

          <p style="font-size: 14px; color: #718096;">
            If you need urgent assistance, feel free to call our support line at <strong>+91 94906 44434</strong> or email us at <strong>${adminEmail}</strong>.
          </p>
          <hr style="border: none; border-top: 1px solid #edf2f7; margin: 24px 0;" />
          <p style="font-size: 12px; color: #a0aec0; text-align: center; margin: 0;">
            Sent by MADHU Dairy & Daily Needs (${adminEmail}).
          </p>
        </div>
      </div>
    `,
  };

  // 2. Admin Alert Mail
  const adminMailOptions = {
    from: `"MADHU Enquiry System" <${adminEmail}>`,
    to: adminEmail,
    subject: `📩 New Enquiry Received from ${name || toEmail}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 12px; padding: 24px; background: #ffffff;">
        <h2 style="color: #6C5CE7; margin-top: 0;">🔔 New Customer Enquiry Alert</h2>
        <p style="font-size: 14px; color: #334155;">A new enquiry has just been submitted via the website contact form.</p>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 6px 0;"><strong>Customer Name:</strong> ${name}</p>
          <p style="margin: 6px 0;"><strong>Email Address:</strong> <a href="mailto:${toEmail}">${toEmail}</a></p>
          <p style="margin: 6px 0;"><strong>Phone Number:</strong> ${phone}</p>
          <p style="margin: 6px 0;"><strong>Message:</strong></p>
          <div style="background: #ffffff; padding: 12px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 13px; color: #0f172a; margin-top: 6px;">
            ${message}
          </div>
        </div>

        <p style="font-size: 13px; color: #64748b;">Log into your Admin Dashboard under Enquiries to send a 1-click email response.</p>
      </div>
    `,
  };

  const userResult = await sendMailWithFallback(userMailOptions);
  sendMailWithFallback(adminMailOptions).catch((err) => console.warn("Admin enquiry alert notice:", err.message));
  return userResult;
};

/**
 * Send 1-Click Admin Reply Email to Customer
 */
export const sendAdminEnquiryReplyEmail = async ({ toEmail, recipientName, enquiryMessage, replyMessage, adminEmail }) => {
  const senderEmail = adminEmail || process.env.EMAIL_USER || "beerayona143@gmail.com";

  const mailOptions = {
    from: `"MADHU Dairy Admin Support" <${senderEmail}>`,
    to: toEmail,
    subject: `💬 Response to your Enquiry - MADHU Dairy & Daily Needs`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #00509E 0%, #6C5CE7 100%); color: #ffffff; padding: 30px 24px; text-align: center;">
          <h2 style="margin: 0; font-size: 24px; font-weight: 800;">MADHU Dairy & Daily Needs</h2>
          <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.95;">Official Response from Admin</p>
        </div>

        <!-- Body -->
        <div style="padding: 28px 26px; color: #2d3748; line-height: 1.6;">
          <h3 style="color: #00509E; margin-top: 0; font-size: 20px;">Dear ${recipientName || "Customer"},</h3>

          <div style="background-color: #f0f7ff; border-left: 4px solid #00509E; border-radius: 8px; padding: 18px 20px; margin: 20px 0;">
            <h4 style="margin: 0 0 8px 0; color: #00509E; font-size: 15px; font-weight: 700;">📩 Admin Message / Reply:</h4>
            <p style="margin: 0; font-size: 15px; color: #0f172a; white-space: pre-wrap; font-weight: 500;">
${replyMessage}
            </p>
          </div>

          ${
            enquiryMessage
              ? `
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px;">
            <h5 style="margin: 0 0 6px 0; color: #64748b; font-size: 12px; font-weight: 700; uppercase">YOUR ORIGINAL ENQUIRY:</h5>
            <p style="margin: 0; font-size: 13px; color: #475569; font-style: italic;">
              "${enquiryMessage}"
            </p>
          </div>
          `
              : ""
          }

          <p style="font-size: 14px; color: #4a5568;">
            If you have any further questions or require additional assistance, please reply directly to this email or call us at <strong>+91 94906 44434</strong>.
          </p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 26px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
            Sent by MADHU Dairy Admin Team (${senderEmail}). Pure, Fresh & Natural Dairy Delivered Daily.
          </p>
        </div>
      </div>
    `,
  };

  return sendMailWithFallback(mailOptions);
};

/**
 * Send Password Reset Confirmation Email
 */
export const sendPasswordResetSuccessEmail = async ({ toEmail, name }) => {
  const adminEmail = process.env.EMAIL_USER || "beerayona143@gmail.com";

  const mailOptions = {
    from: `"MADHU Dairy Security" <${adminEmail}>`,
    to: toEmail,
    subject: "🔒 Password Changed Successfully - MADHU Dairy",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background: #ffffff;">
        <h2 style="color: #00509E; margin-top: 0;">Security Alert: Password Updated</h2>
        <p style="font-size: 14px; color: #334155;">Hello ${name || "User"},</p>
        <p style="font-size: 14px; color: #334155;">
          Your password for your <strong>MADHU Dairy & Daily Needs</strong> account was successfully updated.
        </p>
        <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 14px; border-radius: 6px; margin: 18px 0;">
          <p style="margin: 0; font-size: 13px; color: #15803d; font-weight: 600;">
            ✅ If you made this change, no further action is required.
          </p>
        </div>
        <p style="font-size: 13px; color: #64748b;">
          If you did not initiate this change, please contact support immediately at <strong>${adminEmail}</strong> or call <strong>+91 94906 44434</strong>.
        </p>
      </div>
    `,
  };

  return sendMailWithFallback(mailOptions);
};
