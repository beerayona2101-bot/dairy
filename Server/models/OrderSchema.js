import mongoose, { Schema } from "mongoose";

const OrderSchema = new Schema(
  {
    orderId: {
      type: String,
      unique: true,
      sparse: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    address: {
      type: Schema.Types.Mixed,
      required: true,
    },
    productsData: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productQuantity: {
          type: Number,
          required: true,
          min: 1,
        },
        productPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        unitManufacturingCost: {
          type: Number,
          min: 0,
        },
      },
    ],

    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Processing",
        "Shipped",
        "Ready to Deliver",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    paymentMode: {
      type: String,
      enum: ["Cash on Delivery", "Online", "Online (Test Mode)"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },

    razorpay: {
      orderId: String,
      paymentId: String,
      signature: String,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    deliveryInstructions: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ orderId: 1 });

OrderSchema.pre("save", async function (next) {
  if (!this.orderId) {
    try {
      const dateObj = this.createdAt ? new Date(this.createdAt) : new Date();
      const yy = String(dateObj.getFullYear()).slice(-2);
      const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
      const dd = String(dateObj.getDate()).padStart(2, "0");
      const datePrefix = `MD-ORD-${yy}${mm}${dd}`;

      const latestOrder = await this.constructor
        .findOne({ orderId: new RegExp(`^${datePrefix}-`) })
        .sort({ orderId: -1 })
        .select("orderId")
        .lean();

      let maxSeq = 0;
      if (latestOrder && latestOrder.orderId) {
        const parts = latestOrder.orderId.split("-");
        const seq = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(seq)) {
          maxSeq = seq;
        }
      }

      const nextSeq = String(maxSeq + 1).padStart(4, "0");
      this.orderId = `${datePrefix}-${nextSeq}`;
    } catch (err) {
      console.error("Order ID generation error:", err);
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      this.orderId = `MD-ORD-260907-${randomNum}`;
    }
  }
  next();
});

export default mongoose.model("Order", OrderSchema);
