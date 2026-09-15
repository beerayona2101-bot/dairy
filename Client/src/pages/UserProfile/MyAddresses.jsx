import React, { useState, useEffect, useContext, useCallback } from "react";
import { HiPlus } from "react-icons/hi";
import {
  MapPin, Plus, Trash2, Edit2
} from "lucide-react";

import { UserAuthContext } from "../../context/AuthProvider";
import { getSavedAddresses, addNewAddress, deleteAddress, updateAddress } from "../../services/userProfileService";
import BuffaloLoader from "../../components/BuffaloLoader";
import RemoveAddressModel from "./Models/RemoveAddressModel";
import EditAddressModel from "./Models/EditAddressModel";
import NewAddressModel from "./Models/NewAddressModel";
import { useSnackbar } from "notistack";

import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function MyAddresses() {

  const { enqueueSnackbar } = useSnackbar();
  const { authUser, authUserLoading, deliveryAddress, setDeliveryAddress } = useContext(UserAuthContext);

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [removeModal, setRemoveModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState({})
  const [newAddressModel, setNewAddressModel] = useState(false);

  const [newAddress, setNewAddress] = useState({
    addressType: "Home",
    name: "",
    phone: "",
    streetAddress: "",
    city: "",
    state: "",
    pincode: "",
  });

  const getAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSavedAddresses(authUser?._id);
      if (data?.success) {
        setAddresses(data.userAddresses);
      } else {
        enqueueSnackbar("Failed to fetch addresses", { variant: "error" });
      }
    } catch {
      enqueueSnackbar("Error fetching addresses", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [authUser, enqueueSnackbar]);

  useEffect(() => {
    if (authUser) getAddresses();
  }, [authUser, getAddresses]);

  const addAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await addNewAddress(authUser?._id, newAddress);
      if (data?.success) {
        getAddresses();
        setNewAddress({
          addressType: "Home",
          name: "",
          phone: "",
          streetAddress: "",
          city: "",
          state: "",
          pincode: "",
        });
        enqueueSnackbar("New address added successfully", { variant: "success" });
      }
    } catch {
      enqueueSnackbar("Failed to add address", { variant: "error" });
    } finally {
      setNewAddressModel(false);
      setLoading(false);
    }
  };

  const removeAddress = async (address) => {
    setLoading(true);
    try {
      const data = await deleteAddress(address._id, address.owner);
      if (data?.success) {
        getAddresses();
        enqueueSnackbar("Address removed successfully", { variant: "success" });

        if(address?._id === deliveryAddress?._id) {
          setDeliveryAddress(null);
        }
      }
    } catch {
      enqueueSnackbar("Failed to remove address", { variant: "error" });
    } finally {
      setRemoveModal(false);
      setLoading(false);
    }
  };

  const editAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await updateAddress(selectedAddress._id, selectedAddress);
      if (data?.success) {
        enqueueSnackbar("Address updated successfully", { variant: "success" });
        getAddresses();
      } else {
        enqueueSnackbar("Failed to update address", { variant: "error" });
      }
    } catch {
      enqueueSnackbar("Error updating address", { variant: "error" });
    } finally {
      setEditModal(false);
      setLoading(false);
    }
  };

  let content;
  if (authUserLoading || loading) {
    content = <BuffaloLoader variant="inline" text="Loading addresses..." />;
  } else if (addresses?.length === 0) {
    content = (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <MapPin className="text-gray-400 dark:text-gray-300 h-12 w-12" />
        </div>
        <h4 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
          No addresses saved yet
        </h4>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Add your first address to get started
        </p>
        <button
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium border border-blue-600 dark:border-blue-400 px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200"
          onClick={() => setNewAddressModel(true)}
        >
          <Plus size={16} /> Add Address
        </button>
      </div>

    )
  } else {
    content = (
      <div className="space-y-3.5 pb-24 sm:pb-6">
        {addresses.map((item) => {
          const isSelected = deliveryAddress?._id === item._id;

          return (
            <div
              key={item._id}
              className={`rounded-2xl p-3.5 sm:p-5 shadow-xs transition-all duration-200 border ${
                isSelected
                  ? "bg-purple-50/90 dark:bg-purple-950/40 border-[#6C5CE7] dark:border-purple-400"
                  : "bg-white dark:bg-slate-800/90 border-gray-200/90 dark:border-gray-700/80"
              }`}
            >
              <div className="w-full flex items-center justify-between gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-black tracking-wide bg-purple-100 dark:bg-purple-900/60 text-[#6C5CE7] dark:text-purple-300">
                  {item.addressType || "Home"}
                </span>
                {isSelected ? (
                  <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-emerald-600 text-white shadow-xs flex items-center gap-1">
                    ✓ Active Address
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryAddress(item);
                      enqueueSnackbar("Selected as active delivery address", { variant: "success" });
                    }}
                    className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1E88E5] dark:text-blue-300 hover:bg-blue-100 transition cursor-pointer border border-blue-200/60 dark:border-blue-800/60"
                  >
                    Set Active
                  </button>
                )}
              </div>

              <div className="w-full mt-2.5">
                <p className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white flex items-center justify-between gap-2">
                  <span>{item.name}</span>
                  <span className="text-xs font-bold text-[#1E88E5] dark:text-blue-400 shrink-0">{item.phone}</span>
                </p>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                  {[
                    item?.hno ? `House No. ${item.hno}` : null,
                    item?.streetAddress,
                    item?.village ? `Village: ${item.village}` : null,
                    item?.landmark ? `Landmark: ${item.landmark}` : null,
                    item?.city,
                    item?.district ? `Dist: ${item.district}` : null,
                    item?.state ? `${item.state}${item.pincode ? ` - ${item.pincode}` : ""}` : item?.pincode
                  ].filter(Boolean).join(", ")}
                </p>
              </div>

              <hr className="border-gray-100 dark:border-gray-700/60 w-full my-3" />

              <div className="flex items-center justify-end gap-2">
                <button
                  className="flex items-center gap-1.5 py-1.5 px-3 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition cursor-pointer"
                  onClick={() => {
                    setEditModal(true);
                    setSelectedAddress(item);
                  }}
                  aria-label={`Edit address for ${item.name}`}
                >
                  <Edit2 size={13} /> Edit
                </button>

                <button
                  className="flex items-center gap-1.5 py-1.5 px-3 text-xs bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 rounded-xl font-bold hover:bg-red-100 transition cursor-pointer border border-red-100 dark:border-red-900/40"
                  onClick={() => {
                    setRemoveModal(true);
                    setSelectedAddress(item);
                  }}
                  aria-label={`Remove address for ${item.name}`}
                >
                  <Trash2 size={13} /> Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 pb-3 mb-3 border-b border-gray-200/80 dark:border-gray-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#1E88E5]" /> Saved Delivery Addresses
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Manage home, work, & default delivery locations.
          </p>
        </div>

        <button
          className="w-full sm:w-auto flex items-center justify-center text-xs gap-1.5 bg-[#1E88E5] hover:bg-[#1565C0] text-white font-extrabold py-2 px-4 rounded-xl shadow-xs transition cursor-pointer active:scale-98"
          onClick={() => setNewAddressModel(true)}
        >
          <HiPlus className="text-base" />
          <span>ADD NEW ADDRESS</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide pr-1">
        {content}
      </div>

      <Dialog
        open={removeModal && !!selectedAddress}
        fullWidth
        maxWidth="md"
        slotProps={{
          ...{
            paper: {
              className: "!relative !bg-white dark:!bg-gray-500/20 !rounded-xl !shadow-xl !w-full !max-w-xl !scrollbar-hide"
            },
            backdrop: {
              className: "!bg-black/40 !backdrop-blur-sm"
            }
          }
        }}
        keepMounted
        onClose={() => setRemoveModal(false)}
        aria-describedby="alert-dialog-slide-description"
      >
        <RemoveAddressModel
          selectedAddress={selectedAddress}
          setRemoveModal={setRemoveModal}
          removeAddress={removeAddress}
          loading={loading}
        />
      </Dialog>

      <Dialog
        open={editModal && !!selectedAddress}
        fullWidth
        maxWidth="md"
        slotProps={{
          ...{
            paper: {
              className: "!relative !bg-white dark:!bg-gray-500/20 !rounded-xl !shadow-xl !w-full !max-w-xl !scrollbar-hide"
            },
            backdrop: {
              className: "!bg-black/40 !backdrop-blur-sm"
            }
          }
        }}
        keepMounted
        onClose={() => setEditModal(false)}
        aria-describedby="alert-dialog-slide-description"
      >
        <EditAddressModel
          selectedAddress={selectedAddress}
          setEditModal={setEditModal}
          editAddress={editAddress}
          setSelectedAddress={setSelectedAddress}
          loading={loading}
        />
      </Dialog>

      <Dialog
        open={newAddressModel}
        fullWidth
        maxWidth="md"
        slotProps={{
          ...{
            paper: {
              className: "!relative !bg-white dark:!bg-gray-500/20 !rounded-xl !shadow-xl !w-full !max-w-xl !scrollbar-hide"
            },
            backdrop: {
              className: "!bg-black/40 !backdrop-blur-sm"
            }
          }
        }}
        keepMounted
        onClose={() => setNewAddressModel(false)}
        aria-describedby="alert-dialog-slide-description"
      >
        <NewAddressModel
          newAddress={newAddress}
          setNewAddress={setNewAddress}
          setNewAddressModel={setNewAddressModel}
          addAddress={addAddress}
        />
      </Dialog>
    </div>
  );
}
