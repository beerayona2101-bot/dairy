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
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

const linkSections = [
  {
    heading: "Services",
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
      { label: "T&C", href: "/about" },
    ],
  },
  {
    heading: "Contact",
    links: [
      { label: "Contact Us", href: "/contact-us" },
      { label: "Feedback", href: "/contact-us" },
    ],
  },
];

const socialIcons = [
  { key: "facebook", Icon: FacebookIcon, className: "hover:text-blue-500" },
  { key: "instagram", Icon: InstagramIcon, className: "hover:text-pink-500" },
  { key: "linkedin", Icon: LinkedInIcon, className: "hover:text-blue-400" },
  { key: "twitter", Icon: Twitter, className: "hover:text-sky-400" },
  { key: "youtube", Icon: YouTube, className: "hover:text-red-500" },
];

function Footer() {
  const currentLogo = logoDarkMode;

  return (
    <footer className="relative w-full z-10 bg-[#0B121E] text-slate-300 border-t border-[#1E293B] transition-colors duration-300">

      {/* ─── MOBILE COMPACT LAYOUT (hidden on lg+) ─── */}
      <div 
        className="lg:hidden px-5 pt-5 pb-24"
        style={{ paddingBottom: 'calc(80px + max(env(safe-area-inset-bottom, 0px), 8px))' }}
      >
        {/* Top row: Logo */}
        <div className="flex items-center justify-between mb-3">
          <Link to="/" className="inline-block">
            <img
              src={currentLogo}
              alt={company?.name || "Natural Milk Dairy"}
              loading="eager"
              decoding="sync"
              className="h-9 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Links: 3 columns side by side */}
        <div className="grid grid-cols-3 gap-x-4 gap-y-1 mb-3">
          {linkSections.map((section) => (
            <div key={section.heading}>
              <p className="text-[10px] font-black uppercase tracking-wider text-white mb-1.5">
                {section.heading}
              </p>
              <ul className="space-y-1">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to || link.href}
                      className="text-[11px] font-medium text-[#94A3B8] hover:text-white transition-colors duration-200 leading-tight block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Icons row */}
        {socialIcons.some(({ key }) => company?.socials?.[key]) && (
          <div className="flex items-center gap-2 mb-3">
            {socialIcons.map(({ key, Icon, className }) =>
              company?.socials?.[key] ? (
                <a
                  key={key}
                  href={company.socials[key]}
                  aria-label={key}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-7 h-7 rounded-full bg-[#162032] text-slate-400 flex items-center justify-center border border-[#253248] hover:text-white transition cursor-pointer ${className}`}
                >
                  <Icon style={{ fontSize: 14 }} />
                </a>
              ) : null
            )}
          </div>
        )}

        {/* Copyright */}
        <div className="border-t border-[#1E293B] pt-2 text-[10px] text-[#475569] font-medium text-center">
          © {new Date().getFullYear()} {company?.name || "Natural Milk Dairy"}. All rights reserved.
        </div>
      </div>

      {/* ─── DESKTOP FULL LAYOUT (hidden on mobile) ─── */}
      <div className="hidden lg:block max-w-7xl mx-auto px-6 py-6">
        <motion.div
          className="grid grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {/* Brand column */}
          <motion.div variants={itemVariants} className="space-y-3">
            <Link to="/" className="inline-block hover:scale-105 transition-transform">
              <img
                src={currentLogo}
                alt={company?.name || "Natural Milk Dairy"}
                loading="eager"
                decoding="sync"
                className="h-11 w-auto object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.1)]"
              />
            </Link>

            <p className="text-xs text-[#94A3B8] leading-relaxed max-w-xs font-medium">
              Farm-fresh, 100% pure &amp; nutritious A2 dairy delivered daily to your doorstep.
            </p>

            <div className="flex gap-2.5 pt-0.5">
              {socialIcons.map(({ key, Icon, className }) =>
                company?.socials?.[key] ? (
                  <a
                    key={key}
                    href={company.socials[key]}
                    aria-label={key}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-[#162032] text-slate-300 flex items-center justify-center border border-[#253248] hover:bg-[#22304A] hover:text-white hover:scale-110 transition cursor-pointer"
                  >
                    <Icon className={`${className} transition-colors`} style={{ fontSize: 15 }} />
                  </a>
                ) : null
              )}
            </div>
          </motion.div>

          {/* Link columns */}
          {linkSections.map((section) => (
            <motion.div key={section.heading} variants={itemVariants} className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                {section.heading === "Services" ? "Our Services" : section.heading}
              </h3>
              <ul className="space-y-2 text-xs font-semibold">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to || link.href}
                      className="text-[#94A3B8] hover:text-white transition-colors duration-200"
                    >
                      {link.label === "T&C" ? "Terms & Conditions" : link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Desktop Footer Bottom */}
        <motion.div
          className="mt-6 border-t border-[#1E293B] pt-4 text-xs text-center font-semibold text-[#64748B] flex items-center justify-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p>© {new Date().getFullYear()} {company?.name || "Natural Milk Dairy"}. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
}

export default memo(Footer);
