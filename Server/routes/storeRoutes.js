import express from "express";
import { 
  getAllStores, 
  getStoreOrderHistory,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from "../controllers/storeController.js";
import wrapAsync from "../utils/wrapAsync.js";
import { verifyAdminAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// READ
router.get("/get-stores", verifyAdminAuth, wrapAsync(getAllStores));
router.post("/store-order-history", verifyAdminAuth, wrapAsync(getStoreOrderHistory));

// CREATE
router.post("/create-customer", verifyAdminAuth, wrapAsync(createCustomer));

// UPDATE
router.put("/update-customer/:userId", verifyAdminAuth, wrapAsync(updateCustomer));

// DELETE
router.delete("/delete-customer/:userId", verifyAdminAuth, wrapAsync(deleteCustomer));

export default router;
