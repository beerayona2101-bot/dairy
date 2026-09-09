import mongoose, { Schema } from "mongoose";


const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique : true },
    category: {
      type: String,
      trim: true,
    },
      
    description: { type: String },
    inInventory: {
      type : Boolean
    },

    image: {
      type: [String],
      validate: [(arr) => arr.length <= 3, "Maximum 3 images allowed"],
      default: [],
    },

    minQuantity: { type: Number, default: 1 },

    quantityUnit: {
      type: String,
      required: true,
      enum: ["Litre", "Ml", "Kg", "Gram", "Pack"],
    },

    stock: { type: Number, default: 0, min: 0 },
    manufacturingCost : {type: Number},
    thresholdVal : {type: Number},

    price: { type: Number, required: true, min: 0 },

    type: { type: String },
    totalQuantitySold: {type: Number},
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],

    nutrition: {
      type: Schema.Types.Mixed,
      default: {},
    },

    shelfLife: { type: String },
    expiryDate : {type : Date },
    discount: {type : Number, default : 10},
    pngImage: { type: String, default: "" },
    nutritionMetrics: { type: Schema.Types.Mixed, default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Product", ProductSchema);
