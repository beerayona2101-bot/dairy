import express from "express";
import wrapAsync from "../utils/wrapAsync.js";
import { 
  createOrder,
  getAllOrders, 
  getAllUserOrders, 
  getAdminOrders, 
  getRecentOrders,
  updateOrderStatus,
  cancelOrder
} from "../controllers/orderController.js";

const router = express.Router();

// CREATE
router.post("/create-order", wrapAsync(createOrder));

// READ
router.post("/get-user-orders", wrapAsync(getAllUserOrders));
router.post("/get-all-orders", wrapAsync(getAllOrders));
router.post("/get-admin-orders", wrapAsync(getAdminOrders));
router.get("/recent-20", wrapAsync(getRecentOrders));

// UPDATE
router.put("/update-status", wrapAsync(updateOrderStatus));

// DELETE / CANCEL
router.post("/cancel-order", wrapAsync(cancelOrder));

export default router;