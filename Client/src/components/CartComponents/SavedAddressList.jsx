import React, { useCallback, useContext, useEffect, useState } from "react";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';
import PropTypes from "prop-types";
import { Edit2, Trash2 } from "lucide-react";
import { addNewAddress, getSavedAddresses, updateAddress, deleteAddress } from "../../services/userProfileService";
import { UserAuthContext, AdminAuthContext } from "../../context/AuthProvider";
import { Close } from "@mui/icons-material";
import { useSnackbar } from 'notistack';
import { formatFullAddress } from "../../utils/dateUtils";
import NewAddressModel from "../../pages/UserProfile/Models/NewAddressModel";
import EditAddressModel from "../../pages/UserProfile/Models/EditAddressModel";
import RemoveAddressModel from "../../pages/UserProfile/Models/RemoveAddressModel";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});


export default function SavedAddressList({ open, handleDialogStatus }) {
  const { enqueueSnackbar } = useSnackbar();

  const { authUser, deliveryAddress, setDeliveryAddress } = useContext(UserAuthContext);
  const { authAdmin } = useContext(AdminAuthContext);

  const activeUser = authUser || authAdmin;
  const currentUserId = activeUser?._id || activeUser?.id;

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editModal, setEditModal] = useState(false);
  const [removeModal, setRemoveModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [newAddress, setNewAddress] = useState({
    addressType: "Home",
    name: "",
    phone: "",
    streetAddress: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [newAddressModel, setNewAddressModel] = useState(false);
  const [newAddressLoading, setNewAddressLoading] = useState(false);


  const handleSelectAddress = (address) => {
    handleDialogStatus(false);
    setDeliveryAddress(address);
  };

  const fetchAddresses = useCallback(async () => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }
    try {
      const data = await getSavedAddresses(currentUserId);
      setAddresses(data?.userAddresses || []);
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || "Failed to fetch addresses", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [currentUserId, enqueueSnackbar]);

  useEffect(() => {
    if (currentUserId) {
      fetchAddresses();
    } else {
      setLoading(false);
    }
  }, [currentUserId, fetchAddresses]);

  const addAddress = async (e) => {
    e.preventDefault();
    if (!currentUserId) {
      enqueueSnackbar("User session missing. Please log in.", { variant: "error" });
      return;
    }
    setNewAddressLoading(true);
    try {
      const data = await addNewAddress(currentUserId, newAddress);
      if (data?.success) {
        setNewAddress({
          addressType: "Home",
          name: "",
          phone: "",
          streetAddress: "",
          city: "",
          state: "",
          pincode: "",
        });
        setAddresses(prev => [...prev, data?.address]);
        setDeliveryAddress(data?.address);
        enqueueSnackbar("New address added successfully", { variant: "success" });
        setNewAddressModel(false);
      } else {
        enqueueSnackbar(data?.message || "Failed to add address", { variant: "error" });
      }
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || "Failed to add address", { variant: "error" });
    } finally {
      setNewAddressLoading(false);
    }
  };

  const handleEditAddressSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAddress?._id) return;
    setActionLoading(true);
    try {
      const data = await updateAddress(selectedAddress._id, selectedAddress);
      if (data?.success) {
        const updated = data?.address || selectedAddress;
        setAddresses((prev) =>
          prev.map((item) => (item._id === selectedAddress._id ? updated : item))
        );
        if (deliveryAddress?._id === selectedAddress._id) {
          setDeliveryAddress(updated);
        }
        enqueueSnackbar("Address updated successfully", { variant: "success" });
        setEditModal(false);
      } else {
        enqueueSnackbar(data?.message || "Failed to update address", { variant: "error" });
      }
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || "Failed to update address", { variant: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveAddressSubmit = async () => {
    if (!selectedAddress?._id) return;
    setActionLoading(true);
    try {
      const data = await deleteAddress(selectedAddress._id, currentUserId);
      if (data?.success) {
        setAddresses((prev) => prev.filter((item) => item._id !== selectedAddress._id));
        if (deliveryAddress?._id === selectedAddress._id) {
          setDeliveryAddress(null);
        }
        enqueueSnackbar("Address removed successfully", { variant: "success" });
        setRemoveModal(false);
      } else {
        enqueueSnackbar(data?.message || "Failed to remove address", { variant: "error" });
      }
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || "Failed to remove address", { variant: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  let addressContent;
  if (loading) {
    addressContent = (
      <div className="flex items-center justify-center h-[50vh] text-gray-600 dark:text-white gap-3 pb-10 pt-6">
        <div className="w-6 h-6 border-4 border-dashed rounded-full animate-spin border-[#1E88E5]"></div>
        <span>Loading addresses...</span>
      </div>
    );
  } else if (addresses.length === 0) {
    addressContent = (
      <p className="text-gray-600 dark:text-gray-300 text-center pb-10 pt-6">No addresses found.</p>
    );
  } else {
    addressContent = (
      <div className="grid gap-3.5 px-3 max-h-[60vh] overflow-y-auto">
        {addresses.map((addr) => {
          const isSelected = deliveryAddress?._id === addr._id;
          const mainTitle = [addr.hno, addr.village || addr.streetAddress].filter(Boolean).join(", ") || addr.streetAddress || "Delivery Address";
          const subText = [addr.streetAddress !== addr.village ? addr.streetAddress : null, addr.city || addr.district, `${addr.state || ""} - ${addr.pincode || ""}`].filter(Boolean).join(", ");

          return (
            <div
              key={addr._id}
              onClick={() => handleSelectAddress(addr)}
              className={`rounded-2xl p-4 flex flex-col justify-between transition-all cursor-pointer border ${
                isSelected
                  ? "bg-purple-50/80 dark:bg-purple-950/40 border-[#6C5CE7] shadow-md ring-1 ring-[#6C5CE7]/30"
                  : "bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <LocationOnIcon sx={{ fontSize: "1.1rem" }} className="text-[#6C5CE7]" />
                  <span className="text-xs font-black uppercase text-[#6C5CE7] tracking-wider px-2 py-0.5 rounded bg-purple-100/70 dark:bg-purple-900/50">
                    {addr.addressType || "Home"}
                  </span>
                </div>
                {isSelected && (
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                    ✓ Delivering Here
                  </span>
                )}
              </div>

              <div className="space-y-1 my-1">
                <h4 className="text-sm font-extrabold text-gray-900 dark:text-white leading-snug">
                  {mainTitle}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                  {subText}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 pt-0.5">
                  <span className="font-bold text-gray-700 dark:text-gray-300">Recipient:</span> {addr.name} ({addr.phone})
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-100 dark:border-gray-700/60 pt-2.5">
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAddress(addr);
                      setEditModal(true);
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-[#6C5CE7] hover:bg-purple-100 dark:hover:bg-purple-950/40 px-2.5 py-1 rounded-full transition cursor-pointer"
                  >
                    <Edit2 size={13} /> Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAddress(addr);
                      setRemoveModal(true);
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 px-2.5 py-1 rounded-full transition cursor-pointer"
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectAddress(addr);
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition cursor-pointer ${
                    isSelected
                      ? "bg-emerald-600 text-white"
                      : "bg-[#6C5CE7] hover:bg-[#5b4cc4] text-white shadow-xs"
                  }`}
                >
                  {isSelected ? "Delivering Here" : "Select Address"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <Dialog
        open={open}
        slots={{
          transition: Transition,
        }}
        keepMounted
        onClose={() => handleDialogStatus(false)}
        fullWidth="Full width"
        maxWidth="sm"
        aria-describedby="alert-dialog-slide-description"
        PaperProps={{
          style: {
            borderRadius: "1rem",
            border: "2px solid #1E88E5",
            boxShadow: "0 20px 25px -5px rgba(0, 80, 158, 0.25)",
            overflow: "hidden",
          },
        }}
      >
        <div className=" dark:bg-black/80 !max-w-5xl">
          <div className="p-3 sticky top-0 left-0 text-gray-800 dark:text-gray-100 mb-4 flex justify-between backdrop-blur-md bg-white/70 dark:bg-black/30 z-10">
            <h2 className="text-xl font-semibold">Saved Addresses</h2>
            <button
              onClick={() => handleDialogStatus(false)}
              className="hover:bg-gray-500/20 dark:hover:bg-gray-500/50 border border-gray-500/50 dark:border-gray-500 h-7 w-7 rounded-full flex justify-center items-center"
            >
              <Close sx={{ fontSize: "1.2rem" }} />
            </button>
          </div>

          {addressContent}

          <div className="w-full flex justify-center mt-4 mb-2">
            <button onClick={() => setNewAddressModel(true)} className="w-fit px-4 py-2 bg-[#1E88E5] text-white rounded text-sm font-medium hover:bg-[#1565C0]">
              + Add New Address
            </button>
          </div>

          <br />
        </div>
      </Dialog>

      <Dialog
        open={newAddressModel}
        slots={{
          transition: Transition,
        }}
        keepMounted
        onClose={() => setNewAddressModel(false)}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: "transparent",
              boxShadow: 24,
              borderRadius: 1,
            },
          },
        }}
        fullWidth="Full width"
        maxWidth="sm"
        aria-describedby="alert-dialog-slide-description"
      >
        <NewAddressModel
          newAddress={newAddress}
          setNewAddress={setNewAddress}
          setNewAddressModel={setNewAddressModel}
          addAddress={addAddress}
          loading={newAddressLoading}
        />
      </Dialog>

      <Dialog
        open={editModal && !!selectedAddress}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            className: "!relative !bg-white dark:!bg-gray-900 !rounded-xl !shadow-xl !w-full !max-w-xl"
          },
          backdrop: {
            className: "!bg-black/40 !backdrop-blur-sm"
          }
        }}
        keepMounted
        onClose={() => setEditModal(false)}
      >
        {selectedAddress && (
          <EditAddressModel
            selectedAddress={selectedAddress}
            setEditModal={setEditModal}
            editAddress={handleEditAddressSubmit}
            setSelectedAddress={setSelectedAddress}
            loading={actionLoading}
          />
        )}
      </Dialog>

      <Dialog
        open={removeModal && !!selectedAddress}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            className: "!relative !bg-white dark:!bg-gray-900 !rounded-xl !shadow-xl !w-full !max-w-xl"
          },
          backdrop: {
            className: "!bg-black/40 !backdrop-blur-sm"
          }
        }}
        keepMounted
        onClose={() => setRemoveModal(false)}
      >
        {selectedAddress && (
          <RemoveAddressModel
            selectedAddress={selectedAddress}
            setRemoveModal={setRemoveModal}
            removeAddress={handleRemoveAddressSubmit}
            loading={actionLoading}
          />
        )}
      </Dialog>
    </>
  );
}

SavedAddressList.propTypes = {
  open: PropTypes.bool.isRequired,
  handleDialogStatus: PropTypes.func.isRequired,
};
