import jwt from "jsonwebtoken";
import Admin from "../models/AdminSchema.js";
import User from "../models/UserSchema.js";

const JWT_SECRET = process.env.JWT_SECRET || "MADHU_dairy_jwt_secret_key_2026";

export const verifyAdminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers["x-admin-token"];
    let token = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (typeof authHeader === "string") {
      token = authHeader;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Admin authentication token required.",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded || decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden. Admin authorization required.",
      });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin session. Account not found.",
      });
    }

    req.admin = admin;
    req.userRole = "admin";
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired admin session token.",
      error: error.message,
    });
  }
};

export const verifyUserAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers["x-user-token"];
    let token = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (typeof authHeader === "string") {
      token = authHeader;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. User authentication token required.",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded || decoded.role !== "user") {
      return res.status(403).json({
        success: false,
        message: "Forbidden. User authorization required.",
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid user session. Account not found.",
      });
    }

    req.user = user;
    req.userRole = "user";
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired user session token.",
      error: error.message,
    });
  }
};

export { JWT_SECRET };
