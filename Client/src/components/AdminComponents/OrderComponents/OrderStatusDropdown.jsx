import React, { useState } from "react";
import PropTypes from "prop-types";
import { Menu, MenuItem } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import MopedOutlinedIcon from "@mui/icons-material/MopedOutlined";
import VerifiedIcon from "@mui/icons-material/Verified";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

const STATUS_STAGES = {
  Pending: 0,
  Confirmed: 1,
  Processing: 2,
  Shipped: 3,
  "Ready to Deliver": 4,
  "Out for Delivery": 4,
  Delivered: 5,
  Cancelled: 99,
};

const DROPDOWN_OPTIONS = [
  { key: "Pending", label: "1. Order Placed (Pending)", icon: <ShoppingBagOutlinedIcon sx={{ fontSize: "1rem" }} /> },
  { key: "Confirmed", label: "2. Order Confirmed", icon: <CheckCircleOutlineIcon sx={{ fontSize: "1rem" }} /> },
  { key: "Processing", label: "3. Order Packed (Processing)", icon: <Inventory2OutlinedIcon sx={{ fontSize: "1rem" }} /> },
  { key: "Shipped", label: "4. Order Shipped (In Transit)", icon: <LocalShippingOutlinedIcon sx={{ fontSize: "1rem" }} /> },
  { key: "Ready to Deliver", label: "5. Ready to Deliver", icon: <MopedOutlinedIcon sx={{ fontSize: "1rem" }} /> },
  { key: "Delivered", label: "6. Order Delivered", icon: <VerifiedIcon sx={{ fontSize: "1rem" }} /> },
  { key: "Cancelled", label: "7. Reject / Cancel Order", icon: <CancelOutlinedIcon sx={{ fontSize: "1rem" }} /> },
];

const isOptionDisabled = (currentStatus, optionValue) => {
  if (currentStatus === "Delivered" || currentStatus === "Cancelled") return true;
  if (currentStatus === optionValue) return true;

  const currentLevel = STATUS_STAGES[currentStatus] ?? 0;
  const optionLevel = STATUS_STAGES[optionValue] ?? 0;

  if (optionValue === "Cancelled") {
    return currentLevel >= 3;
  }

  return optionLevel < currentLevel;
};

export default function OrderStatusDropdown({ currentStatus, onUpdateStatus, isProcessing, orderId, userId }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const isOpen = Boolean(anchorEl);

  const handleClick = (event) => {
    if (isProcessing || currentStatus === "Delivered" || currentStatus === "Cancelled") return;
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (newStatus) => {
    handleClose();
    if (newStatus && newStatus !== currentStatus) {
      onUpdateStatus(orderId, currentStatus, newStatus, userId);
    }
  };

  const currentOption = DROPDOWN_OPTIONS.find((opt) => opt.key === currentStatus) || DROPDOWN_OPTIONS[0];

  return (
    <div className="relative inline-block">
      {/* Sleek Custom Trigger Button matching App Design */}
      <button
        type="button"
        onClick={handleClick}
        disabled={isProcessing || currentStatus === "Delivered" || currentStatus === "Cancelled"}
        className="flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-extrabold text-xs px-3.5 py-2 rounded-xl border border-blue-200 dark:border-gray-700 shadow-xs hover:border-[#1E88E5] dark:hover:border-blue-500 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
      >
        <span className="text-[#1E88E5] dark:text-blue-400">{currentOption.icon}</span>
        <span>{currentOption.label}</span>
        <KeyboardArrowDownIcon
          className={`transition-transform duration-200 text-gray-400 group-hover:text-[#1E88E5] ${isOpen ? "rotate-180" : ""}`}
          sx={{ fontSize: "1.1rem" }}
        />
      </button>

      {/* Custom MUI Popover Glass Menu */}
      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        slotProps={{
          paper: {
            className: "!bg-white/95 dark:!bg-gray-900/95 !backdrop-blur-2xl !border !border-white/80 dark:!border-gray-700/80 !shadow-2xl !rounded-2xl !p-1.5 !mt-1.5 !min-w-[250px]",
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {DROPDOWN_OPTIONS.map((opt) => {
          const disabled = isOptionDisabled(currentStatus, opt.key);
          const isPassed = (STATUS_STAGES[currentStatus] ?? 0) > (STATUS_STAGES[opt.key] ?? 0) && opt.key !== "Cancelled";
          const isCurrent = currentStatus === opt.key;
          const isCancel = opt.key === "Cancelled";

          return (
            <MenuItem
              key={opt.key}
              onClick={() => handleSelect(opt.key)}
              disabled={disabled}
              className={`!text-xs !font-bold !py-2.5 !px-3 !rounded-xl !my-0.5 !flex !items-center !justify-between !gap-3 !transition-all ${
                isCurrent
                  ? "!bg-blue-50 dark:!bg-blue-950/60 !text-[#1E88E5] dark:!text-blue-300 !font-black"
                  : isCancel
                  ? "!text-rose-600 dark:!text-rose-400 hover:!bg-rose-50 dark:hover:!bg-rose-950/40"
                  : "!text-gray-800 dark:!text-gray-200 hover:!bg-gray-100 dark:hover:!bg-gray-800/60"
              } ${disabled ? "!opacity-50 !cursor-not-allowed !bg-gray-50/50 dark:!bg-gray-800/30" : ""}`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isCancel ? "text-rose-500" : isCurrent ? "text-[#1E88E5]" : "text-gray-400"}>
                  {opt.icon}
                </span>
                <span className={isCurrent ? "font-black" : "font-bold"}>{opt.label}</span>
              </div>

              {isPassed && (
                <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  ✓ Passed
                </span>
              )}

              {isCurrent && (
                <span className="text-[10px] font-black uppercase text-[#1E88E5] dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded-full border border-blue-200">
                  Current
                </span>
              )}
            </MenuItem>
          );
        })}
      </Menu>
    </div>
  );
}

OrderStatusDropdown.propTypes = {
  currentStatus: PropTypes.string.isRequired,
  onUpdateStatus: PropTypes.func.isRequired,
  isProcessing: PropTypes.bool,
  orderId: PropTypes.string,
  userId: PropTypes.string,
};
