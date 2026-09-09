import { Dialog, DialogActions } from "@mui/material";
import { FolderPlus, X, Tag } from "lucide-react";
import { useState } from "react";
import PropTypes from "prop-types";
import { useSnackbar } from "notistack";

export default function AddCategoryModel({ open, onClose, onCategoryCreated }) {
  const [categoryName, setCategoryName] = useState("");
  const { enqueueSnackbar } = useSnackbar();

  const handleCreate = (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      enqueueSnackbar("Please enter a valid category name", { variant: "warning" });
      return;
    }

    const name = categoryName.trim();
    enqueueSnackbar(`Category "${name}" created. Add a product to complete setup.`, { variant: "info" });
    setCategoryName("");
    onClose();
    if (onCategoryCreated) {
      onCategoryCreated(name);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: {
          className: "!bg-white dark:!bg-gray-900 !rounded-2xl !p-6 !shadow-2xl",
        },
        backdrop: {
          className: "!bg-black/50 !backdrop-blur-xs",
        },
      }}
    >
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FolderPlus className="text-[#1E88E5] dark:text-blue-400 w-5 h-5" />
          Add New Category
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleCreate} className="mt-4 space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
            Category Name
          </label>
          <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-800 focus-within:border-[#1E88E5] focus-within:ring-2 focus-within:ring-[#1E88E5]/20 transition">
            <Tag className="text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g. Organic Cheese, Flavored Milk"
              autoFocus
              className="flex-1 bg-transparent focus:outline-none text-gray-900 dark:text-white border-0 focus:ring-0 p-0 text-xs font-medium"
            />
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Enter the category name. You will be prompted to add a product under this new category.
        </p>

        <DialogActions className="!px-0 !pt-2 !pb-0 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1E88E5] hover:bg-[#003e7a] text-white transition cursor-pointer shadow-xs"
          >
            Create Category
          </button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

AddCategoryModel.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCategoryCreated: PropTypes.func,
};
