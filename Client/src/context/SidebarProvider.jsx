import { createContext, useState, useMemo } from "react";
import PropTypes from "prop-types";

export const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem("admin_sidebar_collapsed") === "true";
  });
  const [navbarInput, setNavbarInput] = useState("");

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("admin_sidebar_collapsed", String(next));
      return next;
    });
  };

  const highlightMatch = (text, term) => {
    if (!term) return text;

    const regex = new RegExp(`(${term})`, "gi");
    const parts = String(text || "")?.split(regex);

    return parts.map((part, i) =>
      part.toLowerCase() === term.toLowerCase() ? (
        <span
          key={i * 0.9}
          className="bg-yellow-300 dark:bg-yellow-600 font-semibold"
        >
          {part}
        </span>
      ) : (
        <span key={i * 0.9}>{part}</span>
      )
    );
  };
  

  const contextValue = useMemo(() => ({
    isSidebarOpen,
    isSidebarCollapsed,
    navbarInput,
    setIsSidebarOpen,
    setIsSidebarCollapsed,
    toggleSidebarCollapse,
    setNavbarInput,
    highlightMatch
  }), [isSidebarOpen, isSidebarCollapsed, navbarInput]);



  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
};

SidebarProvider.propTypes = {
  children: PropTypes.node
};