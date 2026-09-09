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
import { verifyAdminAuth, verifyUserAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// CREATE (User only)
router.post("/create-order", verifyUserAuth, wrapAsync(createOrder));

// READ
router.post("/get-user-orders", verifyUserAuth, wrapAsync(getAllUserOrders));
router.post("/get-all-orders", verifyAdminAuth, wrapAsync(getAllOrders));
router.post("/get-admin-orders", verifyAdminAuth, wrapAsync(getAdminOrders));
router.get("/recent-20", verifyAdminAuth, wrapAsync(getRecentOrders));

// UPDATE (Admin only)
router.put("/update-status", verifyAdminAuth, wrapAsync(updateOrderStatus));

// DELETE / CANCEL (User only)
router.post("/cancel-order", verifyUserAuth, wrapAsync(cancelOrder));

export default router;
