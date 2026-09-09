import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import wsManager, { CONNECTION_STATE } from "../socket/WebSocketManager";
import { UserAuthContext, AdminAuthContext } from "./AuthProvider";

export const WebSocketContext = createContext({
  connectionState: CONNECTION_STATE.DISCONNECTED,
  wsManager,
  subscribe: () => () => {},
  emit: () => {},
});

export const WebSocketProvider = ({ children }) => {
  const { authUser } = useContext(UserAuthContext);
  const { authAdmin } = useContext(AdminAuthContext);

  const activeAccount = authUser || authAdmin;
  const [connectionState, setConnectionState] = useState(wsManager.connectionState);

  useEffect(() => {
    // Listen for WebSocket state changes
    const unsubscribeState = wsManager.onStateChange((state) => {
      setConnectionState(state);
    });

    // Establish authenticated connection
    if (activeAccount?._id) {
      wsManager.connect({
        userId: activeAccount._id,
        role: authAdmin?._id ? "admin" : "user",
      });
    } else {
      wsManager.connect();
    }

    return () => {
      unsubscribeState();
    };
  }, [activeAccount?._id, authAdmin?._id]);

  const value = useMemo(
    () => ({
      connectionState,
      wsManager,
      subscribe: (event, cb) => wsManager.subscribe(event, cb),
      emit: (event, data) => wsManager.emit(event, data),
    }),
    [connectionState]
  );

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};

WebSocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useWebSocketStatus = () => useContext(WebSocketContext);
export default WebSocketProvider;
