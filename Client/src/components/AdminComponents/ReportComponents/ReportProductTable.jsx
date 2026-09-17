import React, { useState } from "react";
import PropTypes from "prop-types";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import InventoryIcon from "@mui/icons-material/Inventory";
import SearchIcon from "@mui/icons-material/Search";
import { formatNumberWithCommas } from "../../../utils/format";
import { Link } from "react-router-dom";
import { slugify } from "../../../utils/slugify";

export default function ReportProductTable({ productGrowthData = [] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = productGrowthData.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-gray-500/20 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700/60 pb-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <InventoryIcon className="text-[#6C5CE7] dark:text-purple-300" />
            Static Data View: Product Growth & Performance Report
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Detailed tabular view of sales units, total revenue generated, and growth metrics
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search report products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none border border-transparent focus:border-[#6C5CE7] transition"
          />
          <SearchIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 !text-base" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700/60">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 font-bold border-b border-gray-200 dark:border-gray-700 uppercase tracking-wider">
              <th className="py-3 px-4">Product Info</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-center">Units Sold</th>
              <th className="py-3 px-4 text-right">Revenue Earned</th>
              <th className="py-3 px-4 text-center">Growth Rate</th>
              <th className="py-3 px-4 text-center">Stock Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {filteredProducts.map((prod, idx) => (
              <tr
                key={prod.id || prod._id || prod.name || idx}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition text-gray-800 dark:text-gray-200"
              >
                <td className="py-3 px-4 font-semibold flex items-center gap-3">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700 shrink-0"
                  />
                  <Link
                    to={`/product-details/${slugify(prod.name)}`}
                    className="hover:text-[#6C5CE7] dark:hover:text-purple-300 font-semibold line-clamp-1"
                  >
                    {prod.name}
                  </Link>
                </td>

                <td className="py-3 px-4">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 font-medium border border-purple-200">
                    {prod.category}
                  </span>
                </td>

                <td className="py-3 px-4 text-center font-bold text-gray-900 dark:text-white">
                  {prod.sold} pcs
                </td>

                <td className="py-3 px-4 text-right font-extrabold text-[#6C5CE7] dark:text-purple-300">
                  ₹{formatNumberWithCommas(prod.revenue)}
                </td>

                <td className="py-3 px-4 text-center">
                  <span className="inline-flex items-center gap-1 font-bold text-[#6C5CE7] dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md border border-purple-200">
                    <TrendingUpIcon sx={{ fontSize: "0.9rem" }} />
                    +{prod.growth}%
                  </span>
                </td>

                <td className="py-3 px-4 text-center">
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-semibold ${
                      prod.stock > 30
                        ? "bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200"
                        : "bg-zinc-900 text-white dark:bg-zinc-800 dark:text-gray-200 border border-zinc-700"
                    }`}
                  >
                    {prod.stock} in stock
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

ReportProductTable.propTypes = {
  productGrowthData: PropTypes.array.isRequired,
};
