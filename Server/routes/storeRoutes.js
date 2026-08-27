import express from "express";
import { 
  getAllStores, 
  getStoreOrderHistory,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from "../controllers/storeController.js";
import wrapAsync from "../utils/wrapAsync.js";

const router = express.Router();

// READ
router.get("/get-stores", wrapAsync(getAllStores));
router.post("/store-order-history", wrapAsync(getStoreOrderHistory));

// CREATE
router.post("/create-customer", wrapAsync(createCustomer));

// UPDATE
router.put("/update-customer/:userId", wrapAsync(updateCustomer));

// DELETE
router.delete("/delete-customer/:userId", wrapAsync(deleteCustomer));

export default router;