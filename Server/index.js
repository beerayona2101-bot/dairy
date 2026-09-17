import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import compression from "compression";
import http from "http";

import AuthAdminRoute from "./routes/AuthRoutes/authAdminRoute.mjs";
import AuthUserRoute from "./routes/AuthRoutes/authUserRoute.js";
import ProfileEditRoute from "./routes/profileEditRoutes.mjs";
import AdminProfileRoute from "./routes/adminProfileRoutes.js";
import ProductsRoutes from "./routes/productRoutes.mjs"
import OrderRoute from "./routes/orderRoutes.js";
import PaymentRoute from "./routes/paymentRoutes.js";
import StoreRoute from "./routes/storeRoutes.js";
import PDFRoute from "./routes/pdfRoutes.js";
import PageContentRoute from "./routes/pageContentRoutes.js";
import EnquiryRoute from "./routes/enquiryRoute.js";
import NotificationRoute from "./routes/notificationRoutes.js";
import { connectToSocket } from "./socket/socket.js";

import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./config/db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 9000;

app.use(compression());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

const server = http.createServer(app);
const io = connectToSocket(server);
app.set("io", io);

app.use("/admin", AuthAdminRoute);

app.use("/u", AuthUserRoute);

app.use("/user-profile", ProfileEditRoute);

app.use("/admin-profile", AdminProfileRoute);

app.use("/products", ProductsRoutes);

app.use("/order", OrderRoute);

app.use("/payment", PaymentRoute);

app.use("/store", StoreRoute);

app.use("/pdf", PDFRoute);

app.use("/page-content", PageContentRoute);

app.use("/api/enquiry", EnquiryRoute);
app.use("/enquiry", EnquiryRoute);

app.use("/api/notifications", NotificationRoute);
app.use("/notifications", NotificationRoute);

app.get("*", (req, res) => {
  res.send({ result: "Hey, you are looking for a page that doesn't exist!" });
});

app.use((err, req, res, next) => {
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const startServer = async (currentPort) => {
  await connectDB();

  server.listen(currentPort, () => {
    console.log(`Server is running on port ${currentPort}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${currentPort} is already in use, trying port ${Number(currentPort) + 1}...`);
      startServer(Number(currentPort) + 1);
    } else {
      console.error('Server startup error:', err);
    }
  });
};

startServer(port);
