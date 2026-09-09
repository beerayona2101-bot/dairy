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
import logoDarkMode from "../assets/logoDarkMode.png";
import logoLightMode from "../assets/logoLightMode.png";

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

  const currentLogo = theme === "dark" ? logoDarkMode : logoLightMode;

  const socialIcons = [
    { key: "facebook", Icon: FacebookIcon, className: "hover:text-blue-600" },
    { key: "instagram", Icon: InstagramIcon, className: "hover:text-pink-500" },
    { key: "linkedin", Icon: LinkedInIcon, className: "hover:text-blue-500" },
    { key: "twitter", Icon: Twitter, className: "hover:text-blue-500" },
    { key: "youtube", Icon: YouTube, className: "hover:text-red-500" }
  ];


  return (
    <footer className="mt-12 bg-[#848484] text-white backdrop-blur-md border-t border-gray-400 rounded-t-[36px] shadow-[0_-15px_40px_rgba(0,0,0,0.08)] transition-colors duration-300">
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
                alt={company?.name || "MADHU Dairy"}
                loading="eager"
                decoding="sync"
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-gray-100 leading-relaxed max-w-xs">
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
                    className="w-9 h-9 rounded-full bg-[#6E6E6E] text-white flex items-center justify-center shadow-xs border border-gray-400 hover:scale-110 transition cursor-pointer"
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
              <h3 className="text-sm font-black uppercase tracking-wider text-white drop-shadow-xs">{section.heading}</h3>
              <ul className="space-y-2.5 text-xs font-semibold">
                {section.links.map((link) =>
                  link.to ? (
                    <li key={link.label}>
                      <Link to={link.to} className="text-gray-200 hover:text-white transition-colors duration-200">
                        {link.label}
                      </Link>
                    </li>
                  ) : (
                    <li key={link.label}>
                      <Link to={link.href} className="text-gray-200 hover:text-white transition-colors duration-200">
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
          className="mt-12 border-t border-gray-400/60 pt-6 text-xs text-center font-bold text-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p>© {new Date().getFullYear()} {company?.name || "MADHU Dairy"}. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span>Crafted with</span>
            <span className="text-red-400">❤️</span>
            <span>for pure healthy living.</span>
          </p>
        </motion.div>
      </div>
    </footer>
  );
}

export default memo(Footer);
