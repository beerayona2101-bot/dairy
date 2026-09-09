/**
 * Formats ISO date string or Date object to localized Indian format
 * Example: "21 Aug 2026, 11:50 AM"
 */
export const formatOrderDate = (dateInput) => {
  if (!dateInput) return "-";
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "-";
  }
};

/**
 * Formats relative time (e.g. "Just now", "5 mins ago", "Today at 7:00 AM")
 */
export const formatRelativeTime = (dateInput) => {
  if (!dateInput) return "Just now";
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "Just now";

    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 30) return "Just now";
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return "Just now";
  }
};

/**
 * Formats complete address details (House No, Street, Village, City, District, State, Pincode)
 */
export const formatFullAddress = (addr) => {
  if (!addr) return "Address details not available";
  if (typeof addr === "string") {
    // If it's a 24-character hex ObjectId string that was not populated
    if (/^[0-9a-fA-F]{24}$/.test(addr)) {
      return "Address details not available";
    }
    return addr;
  }

  const parts = [
    addr.hno ? `House No. ${addr.hno}` : null,
    addr.streetAddress || addr.address,
    addr.village ? `Village: ${addr.village}` : null,
    addr.landmark ? `Landmark: ${addr.landmark}` : null,
    addr.city,
    addr.district ? `Dist: ${addr.district}` : null,
    addr.state ? `${addr.state}${addr.pincode ? ` - ${addr.pincode}` : ""}` : addr.pincode,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "Address details not available";
};
