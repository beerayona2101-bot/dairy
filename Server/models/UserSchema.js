import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      min: 5,
      max: 15,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Invalid email format. Example: user@example.com",
      ],
    },

    isGoogleUser: { type: Boolean, default: false },

    password: {
      type: String,
      required: function () {
        return !this.isGoogleUser;
      },
      validate: {
        validator: function (value) {
          // Allow null for Google users
          if (this.isGoogleUser && !value) return true;
          return /^(?=.*[A-Za-z])(?=.*[\d\W]).{8,}$/.test(value);
        },
        message:
          "Password must be at least 8 characters long and include at least one letter and one number or symbol.",
      },
    },

    fullName: {
      type: String,
    },

    firstName: {
      type: String,
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
    },

    photo: {
      type: String,
      default: "",
    },

    address: {
      streetAddress: { type: String },
      village: { type: String },
      landmark: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
      lat: { type: String },
      lng: { type: String },
    },

    shopName: {
      type: String,
    },

    mobileNo: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true;
          const clean = String(v).trim().replace(/\D/g, "");
          return clean.length >= 10 && clean.length <= 12;
        },
        message: (props) => `${props.value} is not a valid 10-digit mobile number!`,
      },
    },

    savedAddresses: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Address",
      },
    ],

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    wishlistedProducts: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Product",
      },
    ],

    orders: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Order",
      },
    ],
    notifications: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        date: { type: Date, default: Date.now },
        isRead: { type: Boolean, default: false },
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
        type: { type: String, default: "order" },
      },
    ],
    fcmTokens: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

// Enforce strictly unique mobile numbers across all users (ignoring null/empty/undefined)
UserSchema.index(
  { mobileNo: 1 },
  {
    unique: true,
    sparse: true,
  }
);

// Normalization pre-save hook
UserSchema.pre("save", function (next) {
  if (this.email) {
    this.email = this.email.trim().toLowerCase();
  }
  if (this.mobileNo) {
    let clean = String(this.mobileNo).trim().replace(/\D/g, "");
    if (clean.length === 12 && clean.startsWith("91")) {
      clean = clean.slice(2);
    } else if (clean.length === 11 && clean.startsWith("0")) {
      clean = clean.slice(1);
    }
    this.mobileNo = clean || undefined;
  } else if (this.mobileNo === "" || this.mobileNo === null) {
    this.mobileNo = undefined;
  }
  next();
});

export default mongoose.model("User", UserSchema);
