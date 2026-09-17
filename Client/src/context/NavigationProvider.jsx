import React, { createContext, useContext, useEffect, useRef } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { AdminAuthContext } from "./AuthProvider";

export const NavigationContext = createContext(null);

const isMainTabPath = (pathname) => {
  if (!pathname) return false;
  const cleanPath = pathname.split("?")[0].replace(/\/$/, "");
  return (
    cleanPath === "" ||
    cleanPath === "/home" ||
    cleanPath === "/products" ||
    cleanPath === "/wishlist" ||
    cleanPath === "/user-profile/wishlist" ||
    cleanPath === "/cart" ||
    cleanPath === "/user-profile"
  );
};

export const NavigationProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const navType = useNavigationType();
  const { authAdmin } = useContext(AdminAuthContext) || {};

  // Stack of visited route objects: { pathname, search, key, isAdmin }
  const historyStackRef = useRef([]);
  const isInternalBackRef = useRef(false);

  useEffect(() => {
    const currentPath = location.pathname + location.search;
    const isAdmin = location.pathname.startsWith("/admin");
    const stack = historyStackRef.current;

    if (isInternalBackRef.current) {
      isInternalBackRef.current = false;
      return;
    }

    if (navType === "PUSH") {
      const top = stack[stack.length - 1];
      if (!top || top.fullPath !== currentPath) {
        stack.push({
          pathname: location.pathname,
          search: location.search,
          fullPath: currentPath,
          isAdmin,
        });
      }
    } else if (navType === "REPLACE") {
      if (stack.length > 0) {
        stack[stack.length - 1] = {
          pathname: location.pathname,
          search: location.search,
          fullPath: currentPath,
          isAdmin,
        };
      } else {
        stack.push({
          pathname: location.pathname,
          search: location.search,
          fullPath: currentPath,
          isAdmin,
        });
      }
    } else if (navType === "POP") {
      // Browser back/forward button or navigate(-1)
      if (stack.length > 1) {
        const top = stack[stack.length - 1];
        if (top && top.fullPath === currentPath) {
          // Already top
        } else {
          // Find matching index in stack if possible
          const matchIdx = stack.findLastIndex((item) => item.fullPath === currentPath);
          if (matchIdx !== -1) {
            historyStackRef.current = stack.slice(0, matchIdx + 1);
          } else {
            // New pop location, reset top
            stack.push({
              pathname: location.pathname,
              search: location.search,
              fullPath: currentPath,
              isAdmin,
            });
          }
        }
      } else {
        stack.length = 0;
        stack.push({
          pathname: location.pathname,
          search: location.search,
          fullPath: currentPath,
          isAdmin,
        });
      }
    }
  }, [location, navType]);

  const clearHistory = () => {
    historyStackRef.current = [];
  };

  const goBack = (fallbackPath) => {
    const currentPath = location.pathname + location.search;
    const cleanCurrentPath = location.pathname.split("?")[0].replace(/\/$/, "");
    const isAdmin = location.pathname.startsWith("/admin");
    const stack = historyStackRef.current;
    const defaultFallback = fallbackPath || (isAdmin ? "/admin/dashboard" : authAdmin ? "/admin/dashboard" : "/home");

    // Fix history loop: going back from /products ALWAYS navigates to /home or fallbackPath
    if (cleanCurrentPath === "/products" || cleanCurrentPath === "/products/") {
      navigate(fallbackPath || "/home");
      return;
    }

    // Fix history loop: going back from /products/:productId ALWAYS navigates to /products
    if (cleanCurrentPath.startsWith("/products/")) {
      navigate(fallbackPath || "/products");
      return;
    }

    // Check if there is a previous entry in our recorded history stack
    const validPrevious = stack.slice(0, -1).findLast((item) => {
      if (!item || !item.fullPath) return false;
      const itemClean = item.pathname.replace(/\/$/, "");
      if (isAdmin) return item.isAdmin && item.fullPath !== currentPath;
      return !item.isAdmin && item.fullPath !== currentPath && itemClean !== cleanCurrentPath;
    });

    const hasBrowserHistory = window.history.length > 1 && window.history.state && window.history.state.idx > 0;

    if (validPrevious && hasBrowserHistory) {
      isInternalBackRef.current = true;
      navigate(-1);
    } else if (validPrevious) {
      isInternalBackRef.current = true;
      navigate(validPrevious.fullPath);
    } else if (hasBrowserHistory) {
      isInternalBackRef.current = true;
      navigate(-1);
    } else {
      navigate(defaultFallback, { replace: true });
    }
  };

  return (
    <NavigationContext.Provider value={{ goBack, clearHistory, historyStack: historyStackRef.current }}>
      {children}
    </NavigationContext.Provider>
  );
};
