/**
 * Centralized Event Publisher Module for Server-Side WebSockets
 * Standardizes event structure, target routing, and event deduplication.
 */

export const createStandardEvent = (type, data) => {
  return {
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    type,
    timestamp: new Date().toISOString(),
    data,
  };
};

/**
 * Publishes a standardized WebSocket event to specific rooms, target users, or globally.
 * Must only be invoked AFTER database operations succeed.
 *
 * @param {import("socket.io").Server} io - Socket.IO Server Instance
 * @param {string} eventType - Standardized event name (e.g., 'order.created', 'order.updated')
 * @param {object} payload - Event data payload
 * @param {object} [options] - Target options (rooms, userId)
 */
export const publishEvent = (io, eventType, payload, options = {}) => {
  if (!io) {
    console.warn(`[EventPublisher] Cannot publish event '${eventType}': io instance missing.`);
    return null;
  }

  const event = createStandardEvent(eventType, payload);
  const { rooms = [], userId = null } = options;

  console.log(`[EventPublisher] Broadcasting '${event.type}' (ID: ${event.id})`);

  // Target specific user room if provided
  if (userId) {
    io.to(`user:${String(userId)}`).emit(event.type, event);
  }

  // Target specific custom rooms
  if (Array.isArray(rooms) && rooms.length > 0) {
    rooms.forEach((room) => {
      io.to(room).emit(event.type, event);
    });
  }

  // Broadcast to all connected clients
  io.emit(event.type, event);

  // Broadcast to legacy event listeners for backward compatibility
  io.emit("order:global-status-update", {
    orderId: payload?.orderId || payload?._id,
    status: payload?.status,
    userId: userId || payload?.userId,
  });

  return event;
};
