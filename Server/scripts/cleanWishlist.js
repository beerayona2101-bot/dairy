import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "../models/UserSchema.js";
import Admin from "../models/AdminSchema.js";
import Product from "../models/ProductSchema.js";

async function cleanStaleWishlists() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Connected to MongoDB Atlas.");

    const users = await User.find({});
    for (const u of users) {
      if (u.wishlistedProducts && u.wishlistedProducts.length > 0) {
        const validProducts = await Product.find({ _id: { $in: u.wishlistedProducts } }).select("_id");
        const validIds = validProducts.map((p) => p._id);
        if (validIds.length !== u.wishlistedProducts.length) {
          const oldLen = u.wishlistedProducts.length;
          u.wishlistedProducts = validIds;
          await u.save();
          console.log(`Cleaned user ${u.email}: WAS ${oldLen} NOW ${validIds.length}`);
        } else {
          console.log(`Verified user ${u.email}: Count ${validIds.length}`);
        }
      }
    }

    const admins = await Admin.find({});
    for (const a of admins) {
      if (a.wishlistedProducts && a.wishlistedProducts.length > 0) {
        const validProducts = await Product.find({ _id: { $in: a.wishlistedProducts } }).select("_id");
        const validIds = validProducts.map((p) => p._id);
        if (validIds.length !== a.wishlistedProducts.length) {
          const oldLen = a.wishlistedProducts.length;
          a.wishlistedProducts = validIds;
          await a.save();
          console.log(`Cleaned admin ${a.email}: WAS ${oldLen} NOW ${validIds.length}`);
        } else {
          console.log(`Verified admin ${a.email}: Count ${validIds.length}`);
        }
      }
    }

    console.log("Wishlist cleanup finished successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Cleanup error:", err);
    process.exit(1);
  }
}

cleanStaleWishlists();
