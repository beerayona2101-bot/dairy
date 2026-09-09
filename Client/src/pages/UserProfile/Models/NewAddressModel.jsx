import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  User, Phone, Building2, Mail,
  Home, MapPin, Locate, Plus,
  X, CheckCircle, Loader2, Navigation,
} from "lucide-react";
import { fetchPincodeDetails } from "../../../services/pincodeService";
import LocationPickerModal from "../../../components/LocationPickerModal";

export default function NewAddressModel({ setNewAddressModel, addAddress, newAddress, setNewAddress, loading }) {
  const [pinLoading, setPinLoading] = useState(false);
  const [pinStatusMsg, setPinStatusMsg] = useState("");
  const [localities, setLocalities] = useState([]);
  const [showMapModal, setShowMapModal] = useState(false);

  const handleLocationPicked = (loc) => {
    setNewAddress((prev) => ({
      ...prev,
      streetAddress: loc.streetAddress || prev.streetAddress || "",
      village: loc.village || prev.village || "",
      city: loc.city || prev.city || "",
      district: loc.district || prev.district || "",
      state: loc.state || prev.state || "",
      pincode: loc.pincode || prev.pincode || "",
      latitude: loc.latitude,
      longitude: loc.longitude,
    }));
    setPinStatusMsg(`Map location set: ${loc.city || loc.state}`);
  };

  const handlePincodeChange = async (val) => {
    setNewAddress((prev) => ({ ...prev, pincode: val }));
    setPinStatusMsg("");

    if (/^\d{6}$/.test(val.trim())) {
      setPinLoading(true);
      const res = await fetchPincodeDetails(val.trim());
      setPinLoading(false);

      if (res?.success) {
        setPinStatusMsg(`Auto-filled: ${res.city}, ${res.state}`);
        const villageList = res.localities || res.villages || [];
        setLocalities(villageList);

        setNewAddress((prev) => ({
          ...prev,
          city: res.city || prev.city || "",
          district: res.district || res.city || prev.district || "",
          state: res.state || prev.state || "",
          village: prev.village || (villageList.length > 0 ? villageList[0] : ""),
        }));
      } else {
        setPinStatusMsg(res.message || "Pincode lookup unsuccessful");
      }
    } else {
      setLocalities([]);
    }
  };

  const handleSelectLocality = (locality) => {
    if (!locality) return;
    setNewAddress((prev) => ({
      ...prev,
      village: locality,
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl p-5 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto">
      <LocationPickerModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        onSelectLocation={handleLocationPicked}
        initialLocation={
          newAddress?.latitude && newAddress?.longitude
            ? { lat: newAddress.latitude, lng: newAddress.longitude }
            : null
        }
      />

      <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
          <MapPin className="w-5 h-5 text-[#1E88E5]" /> Add New Delivery Address
        </h2>
        <button
          type="button"
          className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition cursor-pointer"
          onClick={() => setNewAddressModel(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={addAddress} className="space-y-3.5 text-xs sm:text-sm">
        {/* Choose Location on Map Action Button */}
        <button
          type="button"
          onClick={() => setShowMapModal(true)}
          className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 to-[#1E88E5] hover:from-blue-700 hover:to-[#1565C0] text-white py-3 px-4 rounded-xl shadow-md font-extrabold text-xs sm:text-sm transition-all duration-200 hover:shadow-lg hover:scale-[1.01] cursor-pointer"
        >
          <Navigation className="w-4.5 h-4.5 animate-bounce" />
          Choose / Pin Location on Interactive Map
        </button>
        {/* Address Type */}
        <div>
          <label className="block mb-1 font-bold text-gray-700 dark:text-gray-200">Address Type</label>
          <select
            value={newAddress?.addressType || "Home"}
            className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setNewAddress({ ...newAddress, addressType: e.target.value })}
          >
            <option value="Home">Home</option>
            <option value="Work">Work</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Full Name & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block mb-1 font-bold text-gray-700 dark:text-gray-200">Full Name *</label>
            <input
              type="text"
              value={newAddress?.name || ""}
              placeholder="e.g. Ujjwal Patil"
              className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-bold text-gray-700 dark:text-gray-200">Phone Number *</label>
            <input
              type="tel"
              value={newAddress?.phone || ""}
              placeholder="e.g. 9876543210"
              className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Pincode Input */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block font-bold text-gray-700 dark:text-gray-200">Pincode *</label>
            {pinLoading && (
              <span className="text-xs text-[#1E88E5] font-semibold animate-pulse">
                Auto-detecting City & State...
              </span>
            )}
            {pinStatusMsg && !pinLoading && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                ✓ {pinStatusMsg}
              </span>
            )}
          </div>
          <input
            type="text"
            maxLength={6}
            value={newAddress?.pincode || ""}
            placeholder="Enter 6-digit Pincode (e.g. 534004 or 422010)"
            className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => handlePincodeChange(e.target.value)}
            required
          />
        </div>

        {/* State & City/District */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block mb-1 font-bold text-gray-700 dark:text-gray-200">State *</label>
            <input
              type="text"
              value={newAddress?.state || ""}
              placeholder="State (Auto-filled)"
              className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-bold text-gray-700 dark:text-gray-200">City / District *</label>
            <input
              type="text"
              value={newAddress?.city || newAddress?.district || ""}
              placeholder="City / District (Auto-filled)"
              className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value, district: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Village / Area / Locality */}
        <div>
          <label className="block mb-1 font-bold text-gray-700 dark:text-gray-200">Village / Locality</label>
          <input
            type="text"
            value={newAddress?.village || ""}
            placeholder="Enter Village or Locality (e.g. Chataparru or Ambad)"
            className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setNewAddress({ ...newAddress, village: e.target.value })}
          />

          {localities.length > 0 && (
            <div className="mt-2">
              <span className="block mb-1 text-xs font-semibold text-[#1E88E5] dark:text-blue-400">
                Select Village / Post Office:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {localities.slice(0, 8).map((loc, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => handleSelectLocality(loc)}
                    className={`px-2.5 py-1 text-xs rounded-full border font-medium transition cursor-pointer ${
                      newAddress?.village === loc
                        ? "bg-[#1E88E5] text-white border-[#1E88E5]"
                        : "bg-blue-50 hover:bg-blue-100 text-[#1E88E5] border-blue-200"
                    }`}
                  >
                    + {loc}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* House No / Flat No */}
        <div>
          <label className="block mb-1 font-bold text-gray-700 dark:text-gray-200">
            House No. / Door No. / Building Name
          </label>
          <input
            type="text"
            value={newAddress?.hno || ""}
            placeholder="e.g. 8-137 or Flat 101"
            className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setNewAddress({ ...newAddress, hno: e.target.value })}
          />
        </div>

        {/* Street Address */}
        <div>
          <label className="block mb-1 font-bold text-gray-700 dark:text-gray-200">Street Address / Landmark *</label>
          <input
            type="text"
            value={newAddress?.streetAddress || ""}
            placeholder="e.g. Near Milk Dairy, Main Road"
            className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setNewAddress({ ...newAddress, streetAddress: e.target.value })}
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={() => setNewAddressModel(false)}
            className="px-5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-xl bg-[#1E88E5] hover:bg-[#1565C0] text-white font-bold transition shadow-md disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Address"}
          </button>
        </div>
      </form>
    </div>
  );
}

NewAddressModel.propTypes = {
  newAddress: PropTypes.shape({
    name: PropTypes.string,
    phone: PropTypes.string,
    hno: PropTypes.string,
    streetAddress: PropTypes.string,
    village: PropTypes.string,
    city: PropTypes.string,
    district: PropTypes.string,
    state: PropTypes.string,
    pincode: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    addressType: PropTypes.string,
  }).isRequired,
  setNewAddressModel: PropTypes.func.isRequired,
  addAddress: PropTypes.func.isRequired,
  setNewAddress: PropTypes.func.isRequired,
  loading: PropTypes.bool
};
