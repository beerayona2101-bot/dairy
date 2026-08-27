import express from "express";
import wrapAsync from "../utils/wrapAsync.js";
import { getProducts, likeProduct } from "../controllers/productController.js";

const router = express.Router();

router.get("/get-products", wrapAsync(getProducts))

router.put("/like/:productId", wrapAsync(likeProduct));

export default router;
