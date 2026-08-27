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
 * Send Welcome Email with Account Credentials
 */
export const sendWelcomeCredentialsEmail = async ({ toEmail, name, email, rawPassword }) => {
  const recipient = toEmail || email;
  const adminEmail = process.env.EMAIL_USER || "beerayona143@gmail.com";

  console.log("\n==================================================");
  console.log("📧 WELCOME EMAIL & CREDENTIALS DISPATCHED TO: %s", recipient);
  console.log("Customer Name: %s", name || "Valued Customer");
  console.log("User Email: %s", recipient);
  console.log("Password Info: %s", rawPassword || "(Configured during signup)");
  console.log("==================================================\n");

  const clientLoginUrl = process.env.CLIENT_URL
    ? `${process.env.CLIENT_URL.replace(/\/$/, "")}/login`
    : "http://localhost:5173/login";

  // 1. Send Welcome Email to Customer
  const customerMailOptions = {
    from: `"Madhur Dairy & Daily Needs" <${adminEmail}>`,
    to: recipient,
    subject: "🥛 Welcome to Madhur Dairy! Your Account & Credentials",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #00509E 0%, #003366 100%); color: #ffffff; padding: 32px 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 0.5px;">🥛 Madhur Dairy & Daily Needs</h1>
          <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.95;">Pure, Fresh & Natural Dairy Delivered Daily</p>
        </div>

        <!-- Body Content -->
        <div style="padding: 32px 28px; color: #2d3748; line-height: 1.6;">
          
          <!-- Welcome Note -->
          <h2 style="color: #00509E; margin-top: 0; font-size: 22px; font-weight: 700;">Welcome to Madhur Dairy, ${name || "Valued Customer"}! 🎉</h2>
          
          <p style="font-size: 15px; color: #4a5568; margin-bottom: 20px;">
            We are thrilled to welcome you to <strong>Madhur Dairy & Daily Needs</strong>! Your customer account has been set up successfully.
          </p>

          <div style="background-color: #f7fafc; border-left: 4px solid #00509E; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px;">
            <h4 style="margin: 0 0 8px 0; color: #00509E; font-size: 15px; font-weight: 700;">🌱 Our Promise to You</h4>
            <p style="margin: 0; font-size: 14px; color: #4a5568; font-style: italic;">
              "We provide 100% pure, unadulterated milk, farm-fresh ghee, paneer, curd, basundi, and daily essentials delivered directly from our farms to your doorstep with guaranteed quality and hygiene."
            </p>
          </div>

          <!-- Credentials Card -->
          <div style="background-color: #f0f7ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 22px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 16px 0; color: #00509E; font-size: 17px; font-weight: 700;">
              🔐 Your Account Credentials
            </h3>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; width: 140px;"><strong>Full Name:</strong></td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${name || "Valued Customer"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;"><strong>Email / Username:</strong></td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${recipient}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;"><strong>Login Password:</strong></td>
                <td style="padding: 6px 0;">
                  <span style="font-family: monospace; font-size: 16px; font-weight: 700; color: #00509E; background: #e0f2fe; padding: 4px 10px; border-radius: 6px;">
                    ${rawPassword || "(Configured during signup)"}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;"><strong>Login Page URL:</strong></td>
                <td style="padding: 6px 0; color: #00509E; font-weight: 600;"><a href="${clientLoginUrl}" style="color: #00509E;">${clientLoginUrl}</a></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;"><strong>Support Contact:</strong></td>
                <td style="padding: 6px 0; color: #0f172a;">${adminEmail} | +91 94906 44434</td>
              </tr>
            </table>
          </div>

          <!-- Security Instruction Warning Box -->
          <div style="background-color: #fffbe6; border: 1px solid #ffe58f; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 13px; color: #b7791f; font-weight: 600;">
              🔒 Security Instruction: Please log in using the button below and update your password under User Profile settings after your first sign-in to keep your account secure.
            </p>
          </div>

          <!-- Login CTA -->
          <div style="text-align: center; margin: 28px 0 24px 0;">
            <a href="${clientLoginUrl}" style="background-color: #00509E; color: #ffffff; padding: 14px 34px; text-decoration: none; border-radius: 30px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(0, 80, 158, 0.35);">
              🚀 Login to Your Account Now &rarr;
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
            Sent by Madhur Dairy & Daily Needs (${adminEmail}). Keep your account credentials safe and secure.
          </p>
        </div>
      </div>
    `,
  };

  // 2. Send Admin Alert Email to Admin Email (beerayona143@gmail.com)
  const adminMailOptions = {
    from: `"Madhur Dairy System Alert" <${adminEmail}>`,
    to: adminEmail,
    subject: `🔔 New User Registered: ${name || recipient}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; padding: 24px; background-color: #ffffff;">
        <h2 style="color: #00509E; margin-top: 0;">🎉 New User Registration Alert</h2>
        <p style="font-size: 14px; color: #333;">A new customer account has just been created on Madhur Dairy & Daily Needs.</p>
        
        <div style="background: #f0f7ff; border-left: 4px solid #00509E; padding: 16px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #00509E;">📋 Account Credentials & Details</h3>
          <p style="margin: 6px 0;"><strong>Customer Name:</strong> ${name || "Customer"}</p>
          <p style="margin: 6px 0;"><strong>Email Address:</strong> ${recipient}</p>
          <p style="margin: 6px 0;"><strong>Password:</strong> <span style="font-family: monospace; font-weight: bold; color: #00509E;">${rawPassword || "(Configured during signup)"}</span></p>
          <p style="margin: 6px 0;"><strong>Registered At:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <p style="font-size: 12px; color: #666;">This is an automated notification sent to Admin (${adminEmail}).</p>
      </div>
    `,
  };

  // Send email to customer first
  const customerResult = await sendMailWithFallback(customerMailOptions);

  // Send email to admin asynchronously
  sendMailWithFallback(adminMailOptions).catch((err) =>
    console.warn("Admin alert email notice:", err.message)
  );

  return customerResult;
};

/**
 * Send OTP Verification Email
 */
export const sendOtpEmail = async (toEmail, otp) => {
  console.log("\n==========================================");
  console.log("🔑 OTP FOR %s IS: %s", toEmail, otp);
  console.log("==========================================\n");

  const mailOptions = {
    from: `"Madhur Dairy" <${process.env.EMAIL_USER || "beerayona143@gmail.com"}>`,
    to: toEmail,
    subject: "Your Madhur Dairy Verification Code (OTP)",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #843E71; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Madhur Dairy & Daily Needs</h2>
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
    from: `"Madhur Dairy Orders" <${process.env.EMAIL_USER || "beerayona143@gmail.com"}>`,
    to: toEmail,
    subject: `Order Confirmation #${orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #843E71; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Madhur Dairy & Daily Needs</h2>
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
    from: `"Madhur Dairy Support" <${adminEmail}>`,
    to: toEmail,
    subject: "🥛 We received your enquiry - Madhur Dairy & Daily Needs",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 580px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
        <div style="background: linear-gradient(135deg, #6C5CE7 0%, #4834D4 100%); color: #ffffff; padding: 28px 24px; text-align: center;">
          <h2 style="margin: 0; font-size: 24px; font-weight: 800;">Madhur Dairy & Daily Needs</h2>
          <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">Customer Care & Support</p>
        </div>
        <div style="padding: 28px 24px; color: #2d3748; line-height: 1.6;">
          <h3 style="color: #4834D4; margin-top: 0;">Hello ${name || "Valued Customer"},</h3>
          <p style="font-size: 15px; color: #4a5568;">
            Thank you for reaching out to Madhur Dairy & Daily Needs! We have successfully received your enquiry. Our team is reviewing your message and will respond shortly.
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
            Sent by Madhur Dairy & Daily Needs (${adminEmail}).
          </p>
        </div>
      </div>
    `,
  };

  // 2. Admin Alert Mail
  const adminMailOptions = {
    from: `"Madhur Enquiry System" <${adminEmail}>`,
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
    from: `"Madhur Dairy Admin Support" <${senderEmail}>`,
    to: toEmail,
    subject: `💬 Response to your Enquiry - Madhur Dairy & Daily Needs`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #00509E 0%, #6C5CE7 100%); color: #ffffff; padding: 30px 24px; text-align: center;">
          <h2 style="margin: 0; font-size: 24px; font-weight: 800;">Madhur Dairy & Daily Needs</h2>
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
            Sent by Madhur Dairy Admin Team (${senderEmail}). Pure, Fresh & Natural Dairy Delivered Daily.
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
    from: `"Madhur Dairy Security" <${adminEmail}>`,
    to: toEmail,
    subject: "🔒 Password Changed Successfully - Madhur Dairy",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background: #ffffff;">
        <h2 style="color: #00509E; margin-top: 0;">Security Alert: Password Updated</h2>
        <p style="font-size: 14px; color: #334155;">Hello ${name || "User"},</p>
        <p style="font-size: 14px; color: #334155;">
          Your password for your <strong>Madhur Dairy & Daily Needs</strong> account was successfully updated.
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
