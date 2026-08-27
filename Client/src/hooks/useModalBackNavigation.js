import { useEffect, useRef } from "react";

/**
 * Hook to handle browser back button (or Backspace / Alt+Left) when a modal is open.
 * Instead of navigating away from the page, pressing back closes the modal window first.
 */
export function useModalBackNavigation(isOpen, onClose) {
  const isPushedRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      window.history.pushState({ modalOpen: true }, "");
      isPushedRef.current = true;

      const handlePopState = () => {
        if (isPushedRef.current) {
          isPushedRef.current = false;
          if (onClose) {
            onClose();
          }
        }
      };

      window.addEventListener("popstate", handlePopState);

      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [isOpen, onClose]);
}
