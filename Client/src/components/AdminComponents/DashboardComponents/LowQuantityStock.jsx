import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import UpdateProductModel from "../InventoryComponents/Models/UpdateProductModel";
import { Plus } from "lucide-react";

import { getProductImage } from "../../../utils/helper";

export default function LowQuantityStock({ fetchedProducts, loading }) {

  const [products, setProducts] = useState([]);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState({})

  useEffect(() => {

    if (fetchedProducts) {
      const lowStock = fetchedProducts?.filter((p) => p.stock < p.thresholdVal)
        .sort((a, b) => (a.stock - a.thresholdVal) - (b.stock - b.thresholdVal));

      const sortedAllProducts = [...lowStock];

      setProducts(sortedAllProducts);
    }

  }, [fetchedProducts]);

  if (products.length === 0 && !loading) {
    return (
      <div className="w-full bg-white dark:bg-gray-500/20 rounded-sm p-3">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Low Quantity Stocks</h2>
        <p className="text-sm text-center text-gray-500 dark:text-gray-300">
          All products are above threshold.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full bg-white dark:bg-gray-500/20 rounded p-3">
      <div className="flex justify-between px-2">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Low Quantity Stocks</h2>
        <button className="text-[#6C5CE7] dark:text-purple-300 hover:underline text-sm font-bold">See all</button>
      </div>

      <div className="space-y-4 mt-5">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index * 0.89}
              className="flex items-center bg-white shadow-md rounded p-3 space-x-4 dark:bg-gray-500/10 animate-pulse"
            >
              <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
              <div className="flex flex-col gap-2 w-full">
                <div className="h-4 w-40 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="h-3 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="h-2 w-28 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            </div>
          ))
          : products.map((product, index) => (
            <div
              key={index * 0.9}
              className="relative flex items-center bg-white shadow-md rounded p-3 space-x-4 dark:bg-gray-500/10"
            >
              <img
                src={getProductImage(product)}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-md"
              />
              <div>
                <h4 className="text-base font-semibold text-gray-800 dark:text-white line-clamp-1">
                  {product.name}
                </h4>
                <h5
                  className={`text-sm ${product.stock < product.thresholdVal
                    ? "text-purple-700 dark:text-purple-300 font-bold animate-pulse"
                    : "text-gray-600 dark:text-gray-300"
                    }`}
                >
                  Remaining Stock: {product.stock} {product.quantityUnit}
                </h5>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Threshold: {product.thresholdVal} {product.quantityUnit}
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedProduct(product)
                  setOpenUpdateModal(true)
                }}
                className="absolute bottom-3 right-3 bg-purple-100 hover:bg-purple-200 dark:bg-purple-950/60 text-[#6C5CE7] dark:text-purple-300 text-xs p-1.5 rounded shadow-md transition"
              >
                <Plus size={16} />
              </button>
            </div>
          ))}

        {openUpdateModal && (
          <UpdateProductModel open={openUpdateModal} onClose={() => setOpenUpdateModal(false)} selectedProduct={selectedProduct} />
        )}
      </div>
    </div>
  );
}

LowQuantityStock.propTypes = {
  fetchedProducts: PropTypes.array,
  loading: PropTypes.bool.isRequired
};
