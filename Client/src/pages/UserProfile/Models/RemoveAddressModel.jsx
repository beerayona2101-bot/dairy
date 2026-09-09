import React from "react";
import PropTypes from "prop-types";
import { X } from "lucide-react";

export default function RemoveAddressModel({ selectedAddress, setRemoveModal, removeAddress, loading }) {
  return (
    <div className="bg-white/70 dark:bg-black/30 backdrop-blur-sm">
      <div className="mb-2 bg-white/60 dark:bg-black/40 backdrop-blur-sm px-3 py-2 flex justify-between items-center">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Do you want to remove this address?
        </h2>

        <button className="text-white hover:text-gray-300" onClick={() => setRemoveModal(false)}>
          <X fontSize="small" />
        </button>
      </div>

      <div className="text-sm sm:text-base p-4 rounded mb-2 text-gray-700 dark:text-gray-200">
        <p className="font-semibold">{selectedAddress?.name}</p>
        <p>{selectedAddress?.streetAddress || selectedAddress?.street}</p>
        <p>{selectedAddress?.city || selectedAddress?.village}, {selectedAddress?.state || selectedAddress?.district} - {selectedAddress?.pincode}</p>
        <p>Mobile: {selectedAddress?.phone || selectedAddress?.mobileNo}</p>
      </div>

      <div className="flex justify-end gap-3 p-3 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setRemoveModal(false)}
          className="px-4 py-2 text-sm rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          Cancel
        </button>
        <button
          onClick={removeAddress}
          disabled={loading}
          className="px-4 py-2 text-sm rounded bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50"
        >
          {loading ? "Removing..." : "Remove"}
        </button>
      </div>
    </div>
  );
}

RemoveAddressModel.propTypes = {
  selectedAddress: PropTypes.object,
  setRemoveModal: PropTypes.func.isRequired,
  removeAddress: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};
