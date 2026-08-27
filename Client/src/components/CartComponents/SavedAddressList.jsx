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
      <div className="grid gap-4 px-3 max-h-[60vh] overflow-y-auto">
        {addresses.map((addr) => {
          const isSelected = deliveryAddress?._id === addr._id;

          return (
            <div
              key={addr._id}
              className={`rounded-md shadow-md p-4 flex flex-col justify-between transition border ${
                isSelected
                  ? "bg-blue-50/70 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400"
                  : "bg-gray-100 dark:bg-gray-500/20 border-transparent"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <LocationOnIcon sx={{ fontSize: "1.2rem" }} className="text-[#1E88E5]" />
                  <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">
                    {addr.addressType}
                  </p>
                </div>
                {isSelected && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#1E88E5] text-white">
                    Selected
                  </span>
                )}
              </div>

              <div className="text-gray-700 dark:text-gray-300 text-sm space-y-1">
                <p><span className="font-semibold">Name:</span> {addr.name}</p>
                <p><span className="font-semibold">Phone:</span> {addr.phone}</p>
                <p>
                  <span className="font-semibold">Full Address:</span>{" "}
                  {formatFullAddress(addr)}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 dark:border-gray-700/60 pt-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAddress(addr);
                      setEditModal(true);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-2.5 py-1.5 rounded transition"
                  >
                    <Edit2 size={13} /> Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAddress(addr);
                      setRemoveModal(true);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 px-2.5 py-1.5 rounded transition"
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectAddress(addr)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isSelected
                      ? "bg-emerald-600 text-white cursor-default"
                      : "bg-[#1E88E5] text-white hover:bg-[#1565C0]"
                  }`}
                >
                  {isSelected ? "Selected" : "Select Address"}
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
