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
      <div className="lg:hidden px-5 pt-7 pb-2">
        {/* Top row: Logo + Status dot */}
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="inline-block">
            <img
              src={currentLogo}
              alt={company?.name || "MADHU Dairy"}
              loading="eager"
              decoding="sync"
              className="h-8 w-auto object-contain"
            />
          </Link>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400 bg-[#162032] px-2.5 py-1 rounded-full border border-[#1E3A2F]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span>All Systems Live</span>
          </div>
        </div>

        {/* Links: 3 columns side by side */}
        <div className="grid grid-cols-3 gap-x-4 gap-y-1 mb-5">
          {linkSections.map((section) => (
            <div key={section.heading}>
              <p className="text-[10px] font-black uppercase tracking-wider text-white mb-2">
                {section.heading}
              </p>
              <ul className="space-y-1.5">
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
          <div className="flex items-center gap-2.5 mb-5">
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
        <div className="border-t border-[#1E293B] pt-3 pb-1 text-[10px] text-[#475569] font-medium text-center">
          © {new Date().getFullYear()} {company?.name || "MADHU Dairy"} · Made with ❤️ for pure living
        </div>
      </div>

      {/* ─── DESKTOP FULL LAYOUT (hidden on mobile) ─── */}
      <div className="hidden lg:block max-w-7xl mx-auto px-6 py-12">
        <motion.div
          className="grid grid-cols-4 gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {/* Brand column */}
          <motion.div variants={itemVariants} className="space-y-4">
            <Link to="/" className="inline-block hover:scale-105 transition-transform">
              <img
                src={currentLogo}
                alt={company?.name || "MADHU Dairy"}
                loading="eager"
                decoding="sync"
                className="h-12 w-auto object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.1)]"
              />
            </Link>

            <div className="flex items-center gap-2 text-[11px] font-semibold text-[#94A3B8] bg-[#162032] px-3 py-1 rounded-full border border-[#253248] w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems &amp; Deliveries Operational</span>
            </div>

            <p className="text-xs text-[#94A3B8] leading-relaxed max-w-xs font-medium">
              Farm-fresh, 100% pure &amp; nutritious A2 dairy delivered daily to your doorstep.
            </p>

            <div className="flex gap-3 pt-1">
              {socialIcons.map(({ key, Icon, className }) =>
                company?.socials?.[key] ? (
                  <a
                    key={key}
                    href={company.socials[key]}
                    aria-label={key}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-[#162032] text-slate-300 flex items-center justify-center border border-[#253248] hover:bg-[#22304A] hover:text-white hover:scale-110 transition cursor-pointer"
                  >
                    <Icon className={`${className} transition-colors`} style={{ fontSize: 16 }} />
                  </a>
                ) : null
              )}
            </div>
          </motion.div>

          {/* Link columns */}
          {linkSections.map((section) => (
            <motion.div key={section.heading} variants={itemVariants} className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                {section.heading === "Services" ? "Our Services" : section.heading}
              </h3>
              <ul className="space-y-2.5 text-xs font-semibold">
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
          className="mt-12 border-t border-[#1E293B] pt-6 text-xs text-center font-bold text-[#64748B] flex flex-col sm:flex-row items-center justify-between gap-4"
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
