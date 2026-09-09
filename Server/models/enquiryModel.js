import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Enquiry message is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Replied", "Closed"],
      default: "Pending",
    },
    replies: [
      {
        replyMessage: { type: String, required: true },
        repliedAt: { type: Date, default: Date.now },
        adminEmail: { type: String, default: "beerayona143@gmail.com" },
      },
    ],
  },
  { timestamps: true }
);

const Enquiry = mongoose.models.Enquiry || mongoose.model("Enquiry", enquirySchema);

export default Enquiry;
