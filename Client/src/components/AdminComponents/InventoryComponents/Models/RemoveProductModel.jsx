import React, { useState, useEffect } from "react";
import PropTypes from "prop-types"
import { socket } from "../../../../socket/socket";
import { useSnackbar } from 'notistack';
import { Button, Dialog, DialogActions } from "@mui/material";

export default function RemoveProductModel({ open, onClose, selectedProduct }) {
  const { enqueueSnackbar } = useSnackbar();
  const [isRemoving, setIsRemoving] = useState(false)

  useEffect(() => {
    socket.on("remove-product:failed", (data) => {
      enqueueSnackbar(data?.message, { variant: "error" });
      setIsRemoving(false);
    })

    socket.on("remove-product:from-inventory", (data) => {
      enqueueSnackbar(data?.message, { variant: "success" });
      onClose();
      setIsRemoving(false)
    })

    return () => {
      socket.off("remove-product:failed")
      socket.off("remove-product:from-inventory")
    }
  }, [onClose, enqueueSnackbar])

  const handleRemoveProduct = async () => {
    if (!selectedProduct?._id) {
      enqueueSnackbar("No product selected", { variant: "warning" });
      setIsRemoving(false);
      return;
    }

    setIsRemoving(true);
    socket.emit("remove-product", { productId: selectedProduct._id });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      slotProps={{
        ...{
          paper: {
            className: "!relative !bg-white dark:!bg-gray-500/20 !rounded !shadow-xl !w-full !max-w-lg !scrollbar-hide"
          },
          backdrop: {
            className: "!bg-black/40 !backdrop-blur-sm"
          }
        }
      }}
    >

      <div className="sticky top-0 z-10 bg-white dark:bg-gray-500/20 px-6 pt-6 pb-4 rounded-t backdrop-blur-md">
        <h2 className="text-xl sm:text-2xl font-semibold text-center mb-4 text-gray-800 dark:text-gray-100">
          Do you want to remove this product?
        </h2>
      </div>

      <div className="bg-gray-100 dark:bg-gray-500/20 p-4 text-gray-800 dark:text-gray-200 shadow-sm space-y-2">
        {[
          { label: "Name", value: selectedProduct?.name },
          { label: "Category", value: selectedProduct?.category },
          { label: "Stock", value: selectedProduct?.stock },
          { label: "Price", value: `₹${selectedProduct?.price}` },
        ].map(({ label, value }, idx) => (
          <div
            key={idx * 0.9}
            className="flex items-start justify-between border-b border-gray-300/50 dark:border-gray-600/30 pb-1 last:border-none"
          >
            <span className="font-medium min-w-[90px]">{label}:</span>
            <span className="text-right break-words max-w-[60%]">
              {value || "--"}
            </span>
          </div>
        ))}
      </div>



      <DialogActions className="sticky bottom-0 z-10 bg-white dark:bg-gray-500/20 !px-4 !py-5 rounded-b backdrop-blur-md">
        <button
          onClick={onClose}
          disabled={isRemoving}
          className=" bg-gray-200 text-black dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white px-3 py-1 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
        <button onClick={handleRemoveProduct} disabled={isRemoving} className=" bg-red-200 text-black dark:bg-red-800/40 dark:hover:bg-red-800/50 dark:text-white px-3 py-1 rounded hover:bg-red-300/80"
        >
          {isRemoving ? "Removing..." : "Remove"}
        </button>
      </DialogActions>
    </Dialog>
  );
}

RemoveProductModel.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedProduct: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    category: PropTypes.string,
    stock: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
};
