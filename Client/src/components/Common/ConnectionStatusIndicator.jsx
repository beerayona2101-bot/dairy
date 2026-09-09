import React from "react";
import { useWebSocketStatus } from "../../context/WebSocketProvider";
import { CONNECTION_STATE } from "../../socket/WebSocketManager";

export default function ConnectionStatusIndicator() {
  const { connectionState } = useWebSocketStatus();

  if (connectionState === CONNECTION_STATE.CONNECTED) {
    return null; // Hidden during normal connected operation
  }

  const getStatusConfig = () => {
    switch (connectionState) {
      case CONNECTION_STATE.CONNECTING:
        return {
          bg: "bg-blue-600/90 text-white",
          text: "Connecting to real-time server...",
          spin: true,
        };
      case CONNECTION_STATE.RECONNECTING:
        return {
          bg: "bg-amber-600/90 text-white",
          text: "Reconnecting real-time stream...",
          spin: true,
        };
      case CONNECTION_STATE.DISCONNECTED:
      case CONNECTION_STATE.ERROR:
        return {
          bg: "bg-gray-700/90 text-white",
          text: "Offline mode — updates will fetch via API",
          spin: false,
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 transition-all duration-300">
      <div
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-lg backdrop-blur-md border border-white/20 ${config.bg}`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            config.spin ? "bg-white animate-ping" : "bg-red-400"
          }`}
        />
        <span>{config.text}</span>
      </div>
    </div>
  );
}
