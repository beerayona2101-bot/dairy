import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { NavigationContext } from "../context/NavigationProvider";

export const useAppBack = (defaultFallbackPath = "/home") => {
  const navContext = useContext(NavigationContext);
  const navigate = useNavigate();

  const handleBack = (customFallback) => {
    const fallback = customFallback || defaultFallbackPath;
    if (navContext && typeof navContext.goBack === "function") {
      navContext.goBack(fallback);
    } else {
      if (window.history.length > 1 && window.history.state?.idx > 0) {
        navigate(-1);
      } else {
        navigate(fallback, { replace: true });
      }
    }
  };

  return handleBack;
};
