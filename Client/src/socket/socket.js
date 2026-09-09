import wsManager, { CONNECTION_STATE } from "./WebSocketManager";

// Ensure connection is initialized
wsManager.connect();

// Proxy object for backward compatibility with direct socket.on/socket.emit calls
export const socket = new Proxy(
  {},
  {
    get(target, prop) {
      const activeSocket = wsManager.socket || wsManager.connect();
      if (!activeSocket) return undefined;
      const value = activeSocket[prop];
      if (typeof value === "function") {
        return value.bind(activeSocket);
      }
      return value;
    },
  }
);

export { wsManager, CONNECTION_STATE };
export default socket;
