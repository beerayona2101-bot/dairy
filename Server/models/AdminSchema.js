import mongoose, { Schema } from "mongoose";

const AdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      min: 2,
      max: 50,
    },

    username: {
      type: String,
      // required: true,
      trim: true,
      unique: true,
      min: 3,
      max: 20,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },

    password: {
      type: String,
      required: true,
      min: 5,
    },

    mobileNo: {
      type: String,
      // required: true,
      match: [/^\d{10}$/, "Mobile number must be 10 digits"],
    },

    factoryAddress: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: {
        type: String,
        match: [/^\d{6}$/, "Pincode must be 6 digits"],
      },
    },

    image: {
      type: String,
      default: "",
    },

    pendingOrders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],

    notifications: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        date: { type: Date, default: Date.now },
        isRead: { type: Boolean, default: false },
        orderId: { type: Schema.Types.ObjectId, ref: "Order" },
        type: { type: String, default: "order" },
      },
    ],

    wishlistedProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Admin", AdminSchema);
