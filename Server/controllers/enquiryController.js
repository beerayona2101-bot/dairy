import Enquiry from "../models/enquiryModel.js";
import {
  sendEnquiryAcknowledgementEmail,
  sendAdminEnquiryReplyEmail,
} from "../config/nodemailer.js";

/**
 * Submit Enquiry from Contact Form
 */
export const submitEnquiry = async (req, res) => {
  const { fullName, email, phone, message } = req.body;

  if (!fullName || !email || !phone || !message) {
    return res.status(400).json({
      success: false,
      message: "Full name, email, phone, and message are required.",
    });
  }

  const enquiry = await Enquiry.create({
    fullName,
    email,
    phone,
    message,
    status: "Pending",
  });

  // Dispatch acknowledgement email asynchronously
  sendEnquiryAcknowledgementEmail({
    toEmail: email,
    name: fullName,
    phone,
    message,
  }).catch((err) =>
    console.warn("⚠️ [ENQUIRY_MAIL_WARN] Could not dispatch user acknowledgement email:", err.message)
  );

  return res.status(201).json({
    success: true,
    message: "Your enquiry has been submitted successfully! We sent a confirmation email to your inbox.",
    enquiry,
  });
};

/**
 * Get All Enquiries for Admin Dashboard
 */
export const getEnquiries = async (req, res) => {
  const enquiries = await Enquiry.find({}).sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    count: enquiries.length,
    enquiries,
  });
};

/**
 * Send 1-Click Email Reply to Customer Enquiry
 */
export const sendAdminEnquiryReply = async (req, res) => {
  const { enquiryId, recipientEmail, recipientName, enquiryMessage, replyMessage } = req.body;

  if (!replyMessage || !replyMessage.trim()) {
    return res.status(400).json({
      success: false,
      message: "Reply message cannot be empty.",
    });
  }

  let targetEnquiry = null;
  let targetEmail = recipientEmail;
  let targetName = recipientName;
  let originalMsg = enquiryMessage;

  if (enquiryId) {
    targetEnquiry = await Enquiry.findById(enquiryId);
    if (targetEnquiry) {
      targetEmail = targetEnquiry.email;
      targetName = targetEnquiry.fullName;
      originalMsg = targetEnquiry.message;
    }
  }

  if (!targetEmail) {
    return res.status(400).json({
      success: false,
      message: "Recipient email is required.",
    });
  }

  // Dispatch email via SMTP from beerayona143@gmail.com
  const emailResult = await sendAdminEnquiryReplyEmail({
    toEmail: targetEmail,
    recipientName: targetName,
    enquiryMessage: originalMsg,
    replyMessage,
    adminEmail: process.env.EMAIL_USER || "beerayona143@gmail.com",
  });

  if (targetEnquiry) {
    targetEnquiry.status = "Replied";
    targetEnquiry.replies.push({
      replyMessage,
      repliedAt: new Date(),
      adminEmail: process.env.EMAIL_USER || "beerayona143@gmail.com",
    });
    await targetEnquiry.save();
  }

  return res.status(200).json({
    success: true,
    message: `Email message sent successfully to ${targetEmail}!`,
    emailResult,
    enquiry: targetEnquiry,
  });
};
