import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { ThemeContext } from "../context/ThemeProvider";
import logoDarkMode from "../assets/logoDarkMode.png";
import logoLightMode from "../assets/logoLightMode.png";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function NotFound() {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  return (
    <div className="h-screen overflow-auto py-10 w-full flex flex-col items-center justify-center px-4 bg-white text-gray-800 dark:bg-[#121212] dark:text-gray-100 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6 flex items-center justify-center"
      >
        <img
          src={theme === "light" ? logoLightMode : logoDarkMode}
          alt="Madhur Dairy & Daily Needs Logo"
          loading="lazy"
          className="h-16"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-row items-center justify-center gap-3 mb-4"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-red-800 dark:text-red-500">404</h1>
        <p className="text-xl md:text-2xl font-semibold">Oops! Page not found.</p>
      </motion.div>

      <p
        className="text-gray-500 dark:text-gray-400 text-sm mb-6 text-center"
      >
        The page you're looking for doesn't exist or has been moved.
      </p>

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mt-4 px-6 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition duration-300 dark:bg-indigo-500 dark:hover:bg-indigo-600"
      >
        <KeyboardBackspaceIcon sx={{ fontSize: "1.2rem" }} />
        <span>Go Back</span>
      </button>
    </div>
  );
}
