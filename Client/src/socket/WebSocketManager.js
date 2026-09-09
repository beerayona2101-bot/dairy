import { io } from "socket.io-client";

export const CONNECTION_STATE = Object.freeze({
  CONNECTING: "CONNECTING",
  CONNECTED: "CONNECTED",
  DISCONNECTED: "DISCONNECTED",
  RECONNECTING: "RECONNECTING",
  ERROR: "ERROR",
});

class WebSocketManager {
  constructor() {
    this.socket = null;
    this.connectionState = CONNECTION_STATE.DISCONNECTED;
    this.listeners = new Map(); // eventType -> Set of callbacks
    this.stateListeners = new Set(); // callbacks receiving connection state changes
    this.processedEventIds = new Set(); // Deduplication cache
    this.maxDeduplicationCacheSize = 300;

    this.reconnectAttempts = 0;
    this.maxBackoffDelay = 16000;
    this.baseDelay = 1000;
    this.heartbeatTimer = null;
    this.userAuth = null;
  }

  getSocketUrl() {
    if (typeof window !== "undefined" && window.location && window.location.hostname) {
      const protocol = window.location.protocol === "https:" ? "https:" : "http:";
      return `${protocol}//${window.location.hostname}:9000`;
    }
    return "http://localhost:9000";
  }

  setConnectionState(newState) {
    if (this.connectionState !== newState) {
      console.log(`[WebSocketManager] State transition: ${this.connectionState} ➔ ${newState}`);
      this.connectionState = newState;
      this.stateListeners.forEach((cb) => {
        try {
          cb(newState);
        } catch (err) {
          console.warn("[WebSocketManager] State listener error:", err);
        }
      });
    }
  }

  onStateChange(callback) {
    this.stateListeners.add(callback);
    callback(this.connectionState);
    return () => this.stateListeners.delete(callback);
  }

  connect(authData = {}) {
    if (authData && Object.keys(authData).length > 0) {
      this.userAuth = authData;
    }

    if (this.socket && (this.socket.connected || this.connectionState === CONNECTION_STATE.CONNECTING)) {
      return this.socket;
    }

    this.setConnectionState(CONNECTION_STATE.CONNECTING);

    const adminToken = sessionStorage.getItem("adminToken");
    const userToken = sessionStorage.getItem("userToken");
    const token = this.userAuth?.token || adminToken || userToken || "";
    const userId = (this.userAuth?.userId || this.userAuth?._id) ? String(this.userAuth?.userId || this.userAuth?._id) : undefined;
    const role = this.userAuth?.role || (adminToken ? "admin" : "user");

    const payload = { token, role };
    if (userId) payload.userId = userId;

    this.socket = io(this.getSocketUrl(), {
      transports: ["polling", "websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: this.baseDelay,
      auth: payload,
      query: payload,
    });

    this.attachSocketListeners();
    return this.socket;
  }

  attachSocketListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      this.reconnectAttempts = 0;
      this.setConnectionState(CONNECTION_STATE.CONNECTED);
      this.startHeartbeat();

      // Register session identity
      const userId = this.userAuth?.userId || this.userAuth?._id;
      if (userId && this.userAuth?.role !== "admin") {
        this.socket.emit("user:register", { userId });
      }

      if (this.userAuth?.role === "admin" || sessionStorage.getItem("adminToken")) {
        const adminId = this.userAuth?.adminId || this.userAuth?._id;
        if (adminId) {
          this.socket.emit("admin:register", { adminId });
        }
        this.socket.emit("room:join", { room: "admin_room" });
      }

      // Re-bind all dynamic subscriptions
      this.listeners.forEach((_, eventType) => {
        this.bindSocketEvent(eventType);
      });
    });

    this.socket.on("disconnect", (reason) => {
      this.stopHeartbeat();
      console.warn(`[WebSocketManager] Disconnected: ${reason}`);
      if (reason === "io server disconnect") {
        // Server initiated disconnect, attempt manual reconnect
        this.setConnectionState(CONNECTION_STATE.DISCONNECTED);
      } else {
        this.setConnectionState(CONNECTION_STATE.RECONNECTING);
      }
    });

    this.socket.on("connect_error", (error) => {
      console.warn(`[WebSocketManager] Connection error:`, error?.message || error);
      this.reconnectAttempts += 1;
      this.setConnectionState(CONNECTION_STATE.RECONNECTING);
    });

    this.socket.on("pong", () => {
      // Heartbeat response verified
    });
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.socket && this.socket.connected) {
        this.socket.emit("ping");
      }
    }, 20000);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  bindSocketEvent(eventType) {
    if (!this.socket) return;

    this.socket.off(eventType);
    this.socket.on(eventType, (data) => {
      // Event Deduplication logic
      const eventId = data?.id;
      if (eventId) {
        if (this.processedEventIds.has(eventId)) {
          return; // Ignore duplicate event
        }
        this.processedEventIds.add(eventId);
        if (this.processedEventIds.size > this.maxDeduplicationCacheSize) {
          const firstKey = this.processedEventIds.values().next().value;
          this.processedEventIds.delete(firstKey);
        }
      }

      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        const payload = data?.data !== undefined ? data.data : data;
        callbacks.forEach((cb) => {
          try {
            cb(payload, data);
          } catch (err) {
            console.error(`[WebSocketManager] Error executing handler for ${eventType}:`, err);
          }
        });
      }
    });
  }

  subscribe(eventType, callback) {
    if (!eventType || typeof callback !== "function") return () => {};

    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
      this.bindSocketEvent(eventType);
    }

    this.listeners.get(eventType).add(callback);

    // Return cleanup unsubscribe function to prevent memory leaks
    return () => {
      this.unsubscribe(eventType, callback);
    };
  }

  unsubscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) return;

    const callbacks = this.listeners.get(eventType);
    callbacks.delete(callback);

    if (callbacks.size === 0) {
      this.listeners.delete(eventType);
      if (this.socket) {
        this.socket.off(eventType);
      }
    }
  }

  emit(event, data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn(`[WebSocketManager] Cannot emit '${event}': socket is disconnected.`);
    }
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.setConnectionState(CONNECTION_STATE.DISCONNECTED);
  }
}

export const wsManager = new WebSocketManager();
export default wsManager;
