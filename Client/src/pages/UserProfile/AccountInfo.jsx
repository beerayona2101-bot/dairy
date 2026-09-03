import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser, FaPhone, FaVenusMars, FaMapMarkerAlt, FaEdit,
  FaRoad, FaCity, FaMapPin, FaEnvelope, FaTrashAlt,
} from "react-icons/fa";
import { Close } from "@mui/icons-material";
import { Navigation } from "lucide-react";
import BuffaloLoader from "../../components/BuffaloLoader";
import { UserAuthContext } from "../../context/AuthProvider";
import { getUserProfile, updateUserProfile, deleteUserAccount } from "../../services/userProfileService";
import { useSnackbar } from "notistack";
import { formatFullAddress } from "../../utils/dateUtils";
import { fetchPincodeDetails } from "../../services/pincodeService";
import LocationPickerModal from "../../components/LocationPickerModal";

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Slide from '@mui/material/Slide';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AccountInfo() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { authUser, handleUserLogout } = useContext(UserAuthContext);

  const [edit, setEdit] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [pinLoading, setPinLoading] = useState(false);
  const [pinStatusMsg, setPinStatusMsg] = useState("");
  const [localities, setLocalities] = useState([]);

  const [editData, setEditData] = useState({
    _id: authUser?._id,
    firstName: "",
    lastName: "",
    email: "",
    address: {
      houseNo: "",
      streetAddress: "",
      village: "",
      landmark: "",
      city: "",
      district: "",
      state: "",
      pincode: "",
    },
    gender: "",
    mobileNo: "",
    photo: "",
    username: "",
  });

  const handleLocationPicked = (loc) => {
    setEditData((prev) => ({
      ...prev,
      address: {
        ...(prev.address || {}),
        streetAddress: loc.streetAddress || prev.address?.streetAddress || "",
        village: loc.village || prev.address?.village || "",
        city: loc.city || prev.address?.city || "",
        district: loc.district || prev.address?.district || "",
        state: loc.state || prev.address?.state || "",
        pincode: loc.pincode || prev.address?.pincode || "",
        latitude: loc.latitude,
        longitude: loc.longitude,
      },
    }));
    setPinStatusMsg(`Map location set: ${loc.city || loc.state}`);
  };

  const handlePincodeAutoFill = async (val) => {
    setEditData((prev) => ({
      ...prev,
      address: { ...(prev.address || {}), pincode: val },
    }));
    setPinStatusMsg("");

    if (/^\d{6}$/.test(val.trim())) {
      setPinLoading(true);
      const res = await fetchPincodeDetails(val.trim());
      setPinLoading(false);

      if (res?.success) {
        setPinStatusMsg(`Auto-filled: ${res.city}, ${res.state}`);
        const villageList = res.localities || res.villages || [];
        setLocalities(villageList);

        setEditData((prev) => ({
          ...prev,
          address: {
            ...(prev.address || {}),
            city: res.city || prev.address?.city || "",
            district: res.district || res.city || prev.address?.district || "",
            state: res.state || prev.address?.state || "",
            village: prev.address?.village || (villageList.length > 0 ? villageList[0] : ""),
          },
        }));
      } else {
        setPinStatusMsg(res.message || "Pincode lookup unsuccessful");
      }
    } else {
      setLocalities([]);
    }
  };

  const [dbData, setDbData] = useState({});

  const handleUserProfileData = useCallback(async () => {
    try {
      setDataLoading(true);
      const data = await getUserProfile(authUser?._id);
      if (data?.success) {
        setDbData(data?.userData);
      }
    } catch (error) {
      enqueueSnackbar(error?.message || "Error fetching user data", { variant: "error" });
    } finally {
      setDataLoading(false);
    }
  }, [authUser?._id, enqueueSnackbar]);

  useEffect(() => {
    if (authUser?._id) {
      handleUserProfileData();
    }
  }, [authUser?._id, handleUserProfileData]);

  useEffect(() => {
    if (dbData) {
      setEditData({
        firstName: dbData?.firstName || "",
        lastName: dbData?.lastName || "",
        email: dbData?.email || "",
        address: dbData?.address || {},
        gender: dbData?.gender || "",
        mobileNo: dbData?.mobileNo || "",
        photo: dbData?.photo || "",
        username: dbData?.username || "",
      });
    }
  }, [dbData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({ ...prevData, [name]: value }));
  };

  const validateInputs = () => {
    const { firstName, lastName, email, gender, mobileNo, username, address } = editData;
    return (
      !!firstName &&
      !!lastName &&
      !!email &&
      !!gender &&
      !!mobileNo &&
      !!username &&
      !!address?.streetAddress &&
      !!address?.city &&
      !!address?.pincode
    );
  };

  const handleSave = async () => {
    if (!validateInputs()) {
      enqueueSnackbar("Please fill out all required fields", { variant: "warning" });
      return;
    }

    try {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(editData.mobileNo)) {
        enqueueSnackbar("Enter a valid 10-digit phone number", { variant: "error" });
        return;
      }

      setIsLoading(true);
      const res = await updateUserProfile(editData, authUser?._id);
      if (res?.success) {
        await handleUserProfileData();
        setEdit(false);
        enqueueSnackbar("Profile edited successfully", { variant: "success" });
      } else {
        enqueueSnackbar("Update failed", { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || "Something went wrong.", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const targetUserId = authUser?._id || dbData?._id;
    const targetEmail = authUser?.email || dbData?.email;

    if (!targetUserId && !targetEmail) {
      enqueueSnackbar("User information missing. Please refresh and try again.", { variant: "error" });
      return;
    }

    try {
      setIsDeleting(true);
      const res = await deleteUserAccount(targetUserId, targetEmail);
      if (res?.success) {
        enqueueSnackbar("Your account has been deleted successfully.", { variant: "info" });
        handleUserLogout();
        localStorage.removeItem("User");
        localStorage.removeItem("deliveryAddress");
        localStorage.removeItem("tempUserData");
        navigate("/login");
      } else {
        enqueueSnackbar(res?.message || "Failed to delete account.", { variant: "error" });
      }
    } catch (err) {
      console.error(err);
      enqueueSnackbar(err?.response?.data?.message || "Error deleting account.", { variant: "error" });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  let content;

  if (dataLoading) {
    content = <BuffaloLoader variant="inline" text="Loading account info..." />;
  } else {
    content = (
      <>
        <form className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "First Name", name: "firstName", value: editData?.firstName, display: dbData?.firstName },
              { label: "Last Name", name: "lastName", value: editData?.lastName, display: dbData?.lastName },
              { label: "Email Address", name: "email", value: editData?.email, display: dbData?.email, icon: <FaEnvelope /> },
              { label: "Username", name: "username", value: editData?.username, display: dbData?.username, icon: <FaUser /> },
              {
                label: "Phone Number",
                name: "mobileNo",
                value: editData?.mobileNo,
                display: dbData?.mobileNo,
                icon: <FaPhone />,
                inputProps: {
                  type: "tel",
                  onChange: (e) => {
                    const val = e.target.value;
                    if (/^\d{0,10}$/.test(val)) handleInputChange(e);
                  },
                },
              },
            ].map((field, index) => (
              <div key={index * 0.5}>
                <label className="mb-1 font-medium flex items-center gap-1">
                  {field?.icon} {field?.label}
                </label>
                {edit ? (
                  <input
                    type="text"
                    className="w-full p-2 border rounded transition focus:ring-2 focus:ring-blue-300 dark:bg-gray-500/50 dark:border-gray-600 text-gray-900 dark:text-white"
                    name={field?.name}
                    value={field?.value}
                    {...(field?.inputProps || { onChange: handleInputChange })}
                    required
                  />
                ) : (
                  <p className="p-2 border border-gray-400 rounded bg-gray-100 dark:bg-gray-500/50 hover:cursor-not-allowed">{field.display}</p>
                )}
              </div>
            ))}

            <div className="sm:col-span-2">
              <label className="mb-1 font-medium flex items-center gap-1">
                <FaVenusMars /> Gender
              </label>
              {edit ? (
                <select
                  className="w-full p-2 border rounded transition dark:bg-gray-500/50 dark:border-gray-600 text-gray-900 dark:text-white"
                  name="gender"
                  value={editData?.gender}
                  onChange={handleInputChange}
                >
                  <option value="">Select</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p className="p-2 border border-gray-400 rounded bg-gray-100 dark:bg-gray-500/50 hover:cursor-not-allowed">{dbData?.gender}</p>
              )}
            </div>

            <div>
              <label className="mb-1 font-medium flex items-center gap-1">
                <FaMapMarkerAlt /> Address
              </label>
              {edit ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(true)}
                    className="px-3 py-2 bg-[#1E88E5] hover:bg-[#1565C0] text-white rounded transition"
                  >
                    Edit Address
                  </button>
                  <p className="text-sm mt-2 text-gray-500/50 dark:text-gray-300">
                    {editData?.address?.streetAddress}, <br />
                    {editData?.address?.city}, {editData?.address?.pincode}
                  </p>
                </>
              ) : (
                <p className="p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                  {formatFullAddress(dbData?.address)}
                </p>
              )}
            </div>
          </div>

          {edit && (
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              className={`mt-4 px-6 py-2 text-white rounded transition ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#1E88E5] hover:bg-[#1565C0]"}`}
            >
              {isLoading ? "Saving..." : "Save Account Info"}
            </button>
          )}
        </form>

        {/* Danger Zone: Delete Account */}
        <div className="mt-10 pt-6 border-t border-red-200 dark:border-red-900/40">
          <div className="p-4 bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="text-base font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                <FaTrashAlt /> Danger Zone: Delete Account
              </h4>
              <p className="text-xs text-red-600/80 dark:text-red-300/80 mt-1">
                Once deleted, all your address details and preferences will be permanently wiped out.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg transition shadow-sm whitespace-nowrap cursor-pointer"
            >
              Delete Account
            </button>
          </div>
        </div>

        {/* Edit Address Modal */}
        {showAddressModal && (
          <Dialog
            open={showAddressModal}
            slots={{ transition: Transition }}
            keepMounted
            onClose={() => setShowAddressModal(false)}
            fullWidth
            maxWidth="sm"
          >
            <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-2xl relative space-y-4 max-h-[85vh] overflow-y-auto">
              <button
                onClick={() => setShowAddressModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 dark:hover:text-red-400 text-xl font-bold transition cursor-pointer"
              >
                <Close />
              </button>

              <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-gray-800">
                <FaMapMarkerAlt className="text-[#1E88E5]" /> Edit Delivery Address
              </h2>

              <form className="space-y-3.5 text-xs sm:text-sm">
                <LocationPickerModal
                  isOpen={showMapModal}
                  onClose={() => setShowMapModal(false)}
                  onSelectLocation={handleLocationPicked}
                  initialLocation={
                    editData?.address?.latitude && editData?.address?.longitude
                      ? { lat: editData.address.latitude, lng: editData.address.longitude }
                      : null
                  }
                />

                {/* Choose Location on Map Action Button */}
                <button
                  type="button"
                  onClick={() => setShowMapModal(true)}
                  className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 to-[#1E88E5] hover:from-blue-700 hover:to-[#1565C0] text-white py-3 px-4 rounded-xl shadow-md font-extrabold text-xs sm:text-sm transition-all duration-200 hover:shadow-lg hover:scale-[1.01] cursor-pointer mb-2"
                >
                  <Navigation className="w-4.5 h-4.5 animate-bounce" />
                  Choose / Pin Location on Interactive Map
                </button>

                {/* Pincode & Auto Fill Notification */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-gray-700 dark:text-gray-200">Pincode *</label>
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
                    placeholder="Enter 6-digit Pincode (e.g. 534004 or 422010)"
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editData?.address?.pincode || ""}
                    onChange={(e) => handlePincodeAutoFill(e.target.value)}
                  />
                </div>

                {/* Auto-filled State & City / District */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 dark:text-gray-200 block mb-1">State *</label>
                    <input
                      type="text"
                      placeholder="State (Auto-filled)"
                      className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editData?.address?.state || ""}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          address: { ...(prev.address || {}), state: e.target.value },
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 dark:text-gray-200 block mb-1">City / District *</label>
                    <input
                      type="text"
                      placeholder="City / District (Auto-filled)"
                      className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editData?.address?.city || editData?.address?.district || ""}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          address: {
                            ...(prev.address || {}),
                            city: e.target.value,
                            district: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Village / Area / Locality */}
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-200 block mb-1">Village / Locality</label>
                  <input
                    type="text"
                    placeholder="Enter Village or Locality (e.g. Chataparru or Ambad)"
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editData?.address?.village || ""}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        address: { ...(prev.address || {}), village: e.target.value },
                      }))
                    }
                  />

                  {localities.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs font-semibold text-[#1E88E5] dark:text-blue-400 block mb-1">
                        Select Village / Post Office:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {localities.slice(0, 8).map((loc, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              setEditData((prev) => ({
                                ...prev,
                                address: { ...(prev.address || {}), village: loc },
                              }))
                            }
                            className={`px-2.5 py-1 text-xs rounded-full border font-medium transition cursor-pointer ${
                              editData?.address?.village === loc
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

                {/* House No / Building Name */}
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-200 block mb-1">
                    House No. / Door No. / Building Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 8-137 or Flat 101"
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editData?.address?.hno || ""}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        address: { ...(prev.address || {}), hno: e.target.value },
                      }))
                    }
                  />
                </div>

                {/* Street Address */}
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-200 block mb-1">Street Address / Landmark *</label>
                  <input
                    type="text"
                    placeholder="e.g. Near Milk Dairy, Main Road"
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editData?.address?.streetAddress || ""}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        address: { ...(prev.address || {}), streetAddress: e.target.value },
                      }))
                    }
                  />
                </div>

                {/* Address Type */}
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-200 block mb-1">Address Type</label>
                  <select
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editData?.address?.addressType || "Home"}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        address: { ...(prev.address || {}), addressType: e.target.value },
                      }))
                    }
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    className="px-5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    onClick={() => setShowAddressModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-6 py-2 rounded-xl bg-[#1E88E5] hover:bg-[#1565C0] text-white font-bold transition shadow-md"
                    onClick={() => {
                      const { streetAddress, city, pincode } = editData?.address || {};
                      if (!streetAddress || !city || !pincode) {
                        enqueueSnackbar("Please fill out street address, city, and pincode.", { variant: "error" });
                        return;
                      }
                      setShowAddressModal(false);
                    }}
                  >
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          </Dialog>
        )}

        {/* Delete Account Modal */}
        <Dialog
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            style: {
              borderRadius: "1rem",
              border: "2px solid #ef4444",
              boxShadow: "0 20px 25px -5px rgba(239, 68, 68, 0.25), 0 8px 10px -6px rgba(239, 68, 68, 0.2)",
            },
          }}
        >
          <DialogTitle className="font-bold text-red-600 flex items-center gap-2 border-b border-red-100 dark:border-red-900/50">
            ⚠️ Delete Account Confirmation
          </DialogTitle>
          <DialogContent dividers className="space-y-3 text-sm">
            <p className="text-gray-800 dark:text-gray-200 font-medium">
              Are you sure you want to permanently delete your account (<span className="font-bold">{dbData?.email}</span>)?
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              This action cannot be undone. All your profile data, saved delivery addresses, and account details will be permanently removed from Madhur Dairy.
            </p>
          </DialogContent>
          <DialogActions className="p-3 border-t border-red-100 dark:border-red-900/50">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-md transition disabled:opacity-50"
            >
              {isDeleting ? "Deleting Account..." : "Yes, Delete My Account"}
            </button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  if (!dbData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">Unable to fetch user data, please try again.</div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 pb-4 mb-4 border-b border-gray-200/80 dark:border-gray-700/80 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FaUser className="hidden sm:flex text-blue-600 dark:text-blue-400" /> Account Information
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Manage your personal profile and account details.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setEdit(!edit)}
          className="px-3 py-1.5 text-xs bg-[#1E88E5] hover:bg-[#1565C0] text-white font-bold rounded-lg transition duration-300 flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <FaEdit className="hidden sm:flex" />
          {edit ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide pr-1">
        {content}
      </div>
    </div>
  );
}