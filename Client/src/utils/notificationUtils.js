/**
 * Utility to deduplicate notifications and enforce a single active login notification.
 * 
 * Rules:
 * 1. Drops items with duplicate `_id` / `id`.
 * 2. Only preserves the latest login notification (prunes any older "Login Successful" entries).
 * 3. Deduplicates identical notification content (same title, description, and orderId).
 * 4. Preserves chronological order (newest first).
 */
export const deduplicateNotifications = (list = []) => {
    if (!Array.isArray(list)) return [];
    const seenIds = new Set();
    const seenLogin = new Set();
    const seenKeys = new Set();
    const result = [];

    for (const item of list) {
        if (!item || typeof item !== "object") continue;

        const id = item._id || item.id;
        const normalizedId = id ? String(id).trim() : null;
        if (normalizedId && seenIds.has(normalizedId)) {
            continue;
        }

        const isLogin =
            item.type === "login" ||
            (typeof item.title === "string" && item.title.toLowerCase().includes("login"));

        if (isLogin) {
            // Only keep the single newest login notification
            if (seenLogin.has("login")) {
                continue;
            }
            seenLogin.add("login");
        }

        const title = (item.title || "").trim();
        const desc = (item.description || "").trim();
        const orderId = String(item.orderId || "").trim();
        const contentKey = `${title}|${desc}|${orderId}`;

        if (seenKeys.has(contentKey)) {
            continue;
        }

        if (normalizedId) seenIds.add(normalizedId);
        seenKeys.add(contentKey);
        result.push(item);
    }

    return result;
};
