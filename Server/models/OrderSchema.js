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
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Confirmed",
      ],
      default: "Pending",
    },

    paymentMode: {
      type: String,
      enum: ["Cash on Delivery", "Online"],
      required: true,
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

OrderSchema.pre("save", function (next) {
  if (!this.orderId) {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    this.orderId = `MD-${randomNum}`;
  }
  next();
});

export default mongoose.model("Order", OrderSchema);
