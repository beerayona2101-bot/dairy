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
        <p><span className="font-medium">Name:</span> {selectedAddress.name}</p>
        <p><span className="font-medium">Phone:</span> {selectedAddress.phone}</p>
        <p><span className="font-medium">Address:</span> {selectedAddress.streetAddress}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</p>
        <p><span className="font-medium">Type:</span> {selectedAddress.addressType}</p>
      </div>

      <div className="flex justify-between gap-4 px-3 pb-3">
        <button
          disabled={loading}
          className="flex-1 py-2 border border-blue-600 text-blue-600 font-semibold rounded hover:bg-blue-600/10 hover:text-blue-600 dark:hover:text-white transition-all duration-300 disabled:cursor-not-allowed"
          onClick={() => setRemoveModal(false)}
        >
          Cancel
        </button>
        <button
          disabled={loading}
          className="flex-1 py-2 border border-red-600 text-red-600 font-semibold rounded hover:bg-red-600/10 hover:text-red-600 dark:hover:text-white transition-all duration-300 disabled:cursor-not-allowed"
          onClick={() => removeAddress(selectedAddress)}
        >
          {
            loading ? "Removing..." : "Remove"
          }
        </button>
      </div>
    </div>
  );
}

RemoveAddressModel.propTypes = {
  selectedAddress: PropTypes.shape({
    name: PropTypes.string,
    phone: PropTypes.string,
    streetAddress: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    pincode: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    addressType: PropTypes.string,
  }).isRequired,
  setRemoveModal: PropTypes.func.isRequired,
  removeAddress: PropTypes.func.isRequired,
  loading: PropTypes.bool
};
