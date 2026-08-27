import { useContext, memo } from "react";
import { ThemeContext } from "../context/ThemeProvider";

import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import company from "../data/company.json";
import { Twitter, YouTube } from "@mui/icons-material";

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

function Footer() {
  const { theme } = useContext(ThemeContext);

  const currentLogo = theme === "dark"
    ? (company?.logoDaraTheme || logoDarkMode)
    : (company?.logoLightTheme || logoLightMode);

  const socialIcons = [
    { key: "facebook", Icon: FacebookIcon, className: "hover:text-blue-600" },
    { key: "instagram", Icon: InstagramIcon, className: "hover:text-pink-500" },
    { key: "linkedin", Icon: LinkedInIcon, className: "hover:text-blue-500" },
    { key: "twitter", Icon: Twitter, className: "hover:text-blue-500" },
    { key: "youtube", Icon: YouTube, className: "hover:text-red-500" }
  ];


  return (
    <footer className="mt-12 bg-white/90 dark:bg-gray-900/90 text-[#2D3748] dark:text-white backdrop-blur-md border-t border-white/80 dark:border-gray-800/80 rounded-t-[36px] shadow-[0_-15px_40px_rgba(0,0,0,0.03)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants} className="space-y-4">
            <Link to="/" className="inline-block hover:scale-105 transition-transform">
              <img
                src={currentLogo}
                alt={company?.name || "Madhur Dairy"}
                loading="eager"
                decoding="sync"
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-[#718096] dark:text-gray-400 leading-relaxed max-w-xs">
              Farm-fresh, 100% pure & nutritious A2 dairy delivered daily to your doorstep.
            </p>
            <div className="flex gap-4 text-xl pt-2">
              {socialIcons.map(({ key, Icon, className }) =>
                company?.socials?.[key] ? (
                  <a
                    key={key}
                    href={company.socials[key]}
                    aria-label={key}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-[#EFF1F5] dark:bg-gray-800 flex items-center justify-center shadow-xs border border-white dark:border-gray-700 hover:scale-110 transition cursor-pointer"
                  >
                    <Icon className={`${className} transition-colors text-xs`} />
                  </a>
                ) : null
              )}
            </div>
          </motion.div>

          {[
            {
              heading: "Our Services",
              links: [
                { label: "Dairy Products", to: "/products" },
                { label: "Subscriptions", to: "/products" },
                { label: "Home Delivery", to: "/about" },
              ],
            },
            {
              heading: "Support",
              links: [
                { label: "About Us", href: "/about" },
                { label: "FAQ", href: "/about" },
                { label: "Terms & Conditions", href: "/about" },
              ],
            },
            {
              heading: "Contact",
              links: [
                { label: "Contact Us", href: "/contact-us" },
                { label: "Customer Support", href: "/contact-us" },
                { label: "Feedback", href: "/contact-us" },
              ],
            },
          ].map((section) => (
            <motion.div key={section.heading} variants={itemVariants} className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#6C5CE7]">{section.heading}</h3>
              <ul className="space-y-2.5 text-xs font-semibold">
                {section.links.map((link) =>
                  link.to ? (
                    <li key={link.label}>
                      <Link to={link.to} className="text-[#718096] dark:text-gray-300 hover:text-[#6C5CE7] transition-colors duration-200">
                        {link.label}
                      </Link>
                    </li>
                  ) : (
                    <li key={link.label}>
                      <Link to={link.href} className="text-[#718096] dark:text-gray-300 hover:text-[#6C5CE7] transition-colors duration-200">
                        {link.label}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer Bottom */}
        <motion.div
          className="mt-12 border-t border-gray-200/60 dark:border-gray-800 pt-6 text-xs text-center font-bold text-[#718096] dark:text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p>© {new Date().getFullYear()} {company?.name || "Madhur Dairy"}. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span>Crafted with</span>
            <span className="text-red-500">❤️</span>
            <span>for pure healthy living.</span>
          </p>
        </motion.div>
      </div>
    </footer>
  );
}

export default memo(Footer);
