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

app.use(compression({ level: 6 }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    maxAge: "7d",
    etag: true,
    lastModified: true,
  })
);
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "x-admin-token", "x-user-token", "Accept"],
  })
);
app.options("*", cors());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

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
  console.error("Global Server Error:", err?.message || err);

  const isDbTimeoutOrTechnical =
    err?.name === "MongooseError" ||
    err?.name === "MongoNetworkError" ||
    err?.name === "MongoServerSelectionError" ||
    err?.message?.includes("buffering timed out") ||
    err?.message?.includes("findOne") ||
    err?.message?.includes("ECONN") ||
    err?.message?.includes("connect ETIMEDOUT");

  if (isDbTimeoutOrTechnical) {
    return res.status(503).json({
      success: false,
      statusCode: 503,
      message: "503 Error: Server not responding. Please try again shortly.",
    });
  }

  const status = err.status || err.statusCode || 500;
  const message =
    status === 500
      ? "500 Error: Server error occurred. Please try again later."
      : (err.message || `${status} Error: Request failed.`);

  return res.status(status).json({
    success: false,
    statusCode: status,
    message,
  });
});

const startServer = async (currentPort) => {
  await connectDB();

  server.listen(currentPort, "0.0.0.0", () => {
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
