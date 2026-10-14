import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/UserSchema.js";
import Admin from "../models/AdminSchema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let isFirebaseInitialized = false;

// Attempt to initialize Firebase Admin SDK using Server/config/serviceAccountKey.json
try {
  const serviceAccountPath = path.resolve(__dirname, "../config/serviceAccountKey.json");

  if (fs.existsSync(serviceAccountPath)) {
    const rawKey = fs.readFileSync(serviceAccountPath, "utf-8");
    const serviceAccount = JSON.parse(rawKey);

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    isFirebaseInitialized = true;
    console.log("✅ [FCM] Firebase Admin SDK initialized successfully with serviceAccountKey.json");
  } else {
    console.log(
      "⚠️ [FCM Notice] 'Server/config/serviceAccountKey.json' not found. " +
      "Push notifications will be simulated until you place your Firebase service account key in Server/config/."
    );
  }
} catch (err) {
  console.warn("⚠️ [FCM] Firebase initialization notice:", err?.message || err);
}

/**
 * Send push notification to a list of FCM device registration tokens
 */
export const sendPushNotification = async ({ fcmTokens = [], title, body, data = {} }) => {
  if (!Array.isArray(fcmTokens) || fcmTokens.length === 0) {
    return { success: false, reason: "No device tokens provided" };
  }

  // Filter valid string tokens and deduplicate
  const uniqueTokens = [...new Set(fcmTokens.filter((t) => typeof t === "string" && t.trim().length > 10))];
  if (uniqueTokens.length === 0) {
    return { success: false, reason: "No valid tokens found" };
  }

  if (!isFirebaseInitialized || !admin.apps.length) {
    console.log(`[FCM Mock Push] To ${uniqueTokens.length} device(s) -> Title: "${title}" | Body: "${body}"`);
    return { success: true, mocked: true, message: "Logged (Firebase Service Account Key pending)" };
  }

  try {
    // Stringify all data values for FCM compliance
    const stringifiedData = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        stringifiedData[key] = typeof value === "object" ? JSON.stringify(value) : String(value);
      }
    }

    const payload = {
      notification: {
        title: String(title || "Natural Milk Dairy"),
        body: String(body || ""),
      },
      data: stringifiedData,
      android: {
        priority: "high",
        notification: {
          channelId: "high_importance_channel",
          sound: "default",
          defaultSound: true,
          defaultVibrateTimings: true,
          icon: "ic_launcher",
        },
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: String(title || "Natural Milk Dairy"),
              body: String(body || ""),
            },
            sound: "default",
            badge: 1,
          },
        },
      },
      tokens: uniqueTokens,
    };

    const response = await admin.messaging().sendEachForMulticast(payload);
    console.log(
      `[FCM] Notification sent successfully (${response.successCount}/${uniqueTokens.length} delivered)`
    );

    // Clean up stale or unregistered tokens
    if (response.failureCount > 0) {
      const badTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errCode = resp.error?.code;
          if (
            errCode === "messaging/invalid-registration-token" ||
            errCode === "messaging/registration-token-not-registered"
          ) {
            badTokens.push(uniqueTokens[idx]);
          }
        }
      });

      if (badTokens.length > 0) {
        console.log(`[FCM] Removing ${badTokens.length} unregistered tokens from database`);
        await User.updateMany(
          { fcmTokens: { $in: badTokens } },
          { $pull: { fcmTokens: { $in: badTokens } } }
        ).catch(() => {});
        await Admin.updateMany(
          { fcmTokens: { $in: badTokens } },
          { $pull: { fcmTokens: { $in: badTokens } } }
        ).catch(() => {});
      }
    }

    return { success: true, successCount: response.successCount, failureCount: response.failureCount };
  } catch (err) {
    console.error("[FCM] Error sending multicast message:", err?.message || err);
    return { success: false, error: err?.message };
  }
};

/**
 * Send push notification to a specific User by their MongoDB _id
 */
export const sendNotificationToUser = async (userId, { title, body, data = {}, orderId }) => {
  if (!userId) return { success: false, reason: "Missing userId" };

  try {
    let target = await User.findById(userId).select("fcmTokens");
    if (!target) {
      target = await Admin.findById(userId).select("fcmTokens");
    }

    if (!target || !Array.isArray(target.fcmTokens) || target.fcmTokens.length === 0) {
      return { success: false, reason: "User has no registered mobile FCM tokens" };
    }

    const mergedData = {
      ...data,
      userId: String(userId),
      ...(orderId ? { orderId: String(orderId) } : {}),
      timestamp: new Date().toISOString(),
    };

    return await sendPushNotification({
      fcmTokens: target.fcmTokens,
      title,
      body,
      data: mergedData,
    });
  } catch (err) {
    console.error("[FCM] sendNotificationToUser error:", err?.message);
    return { success: false, error: err?.message };
  }
};

/**
 * Send push notification to all Admin devices
 */
export const sendNotificationToAdmin = async ({ title, body, data = {}, orderId }) => {
  try {
    const admins = await Admin.find({}).select("fcmTokens");
    const allTokens = admins.flatMap((a) => a.fcmTokens || []);

    if (allTokens.length === 0) {
      return { success: false, reason: "No admin tokens registered" };
    }

    const mergedData = {
      ...data,
      role: "admin",
      ...(orderId ? { orderId: String(orderId) } : {}),
      timestamp: new Date().toISOString(),
    };

    return await sendPushNotification({
      fcmTokens: allTokens,
      title,
      body,
      data: mergedData,
    });
  } catch (err) {
    console.error("[FCM] sendNotificationToAdmin error:", err?.message);
    return { success: false, error: err?.message };
  }
};

/**
 * Send push notification to all users
 */
export const sendNotificationToAllUsers = async ({ title, body, data = {}, orderId }) => {
  try {
    const users = await User.find({}).select("fcmTokens");
    const allTokens = users.flatMap((u) => u.fcmTokens || []);

    if (allTokens.length === 0) {
      return { success: false, reason: "No user tokens registered" };
    }

    const mergedData = {
      ...data,
      ...(orderId ? { orderId: String(orderId) } : {}),
      timestamp: new Date().toISOString(),
    };

    return await sendPushNotification({
      fcmTokens: allTokens,
      title,
      body,
      data: mergedData,
    });
  } catch (err) {
    console.error("[FCM] sendNotificationToAllUsers error:", err?.message);
    return { success: false, error: err?.message };
  }
};

export default {
  sendPushNotification,
  sendNotificationToUser,
  sendNotificationToAdmin,
  sendNotificationToAllUsers,
};
