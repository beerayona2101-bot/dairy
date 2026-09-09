// ProfileInfoInput.jsx
import React, { useContext, useEffect, useRef, useState } from "react";
import { TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { ThemeContext } from "../../../context/ThemeProvider";
import { AdminAuthContext, UserAuthContext } from "../../../context/AuthProvider";
import { useSnackbar } from "notistack";
import { submitSignupForm } from "../../../services/userProfileService";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import MyLocationIcon from '@mui/icons-material/MyLocation';
import MapIcon from '@mui/icons-material/Map';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import BuffaloLoader from "../../../components/BuffaloLoader";

function ProfilePhotoUpload({ photo, isLoading, handlePhotoChange }) {
  return (
    <div className="relative w-24 h-24 rounded-full mx-auto mb-6">
      <img
        src={photo || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJu-PalNLype77rVV-6AeFIeoDPm22_ruvpA&s"}
        alt="Profile Preview"
        className={`w-24 h-24 rounded-full object-cover border-2 border-[#1E88E5] shadow-md transition-opacity duration-300 ${isLoading ? "opacity-50" : "opacity-100"}`}
      />
      <label
        htmlFor="photoInput"
        className={`absolute bottom-0 right-0 bg-white dark:bg-gray-200 rounded-full p-1.5 cursor-pointer border shadow transition-opacity duration-300 ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <i className="fas fa-edit text-[#1E88E5]" />
      </label>
      <input
        type="file"
        accept="image/*"
        id="photoInput"
        onChange={handlePhotoChange}
        className="hidden"
      />
    </div>
  );
}

function MapPickerModal({ open, onClose, onConfirmLocation, defaultCoords }) {
  const [coords, setCoords] = useState(defaultCoords || { lat: 17.3850, lng: 78.4867 });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [addressDetails, setAddressDetails] = useState(null);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);

  useEffect(() => {
    if (defaultCoords?.lat && defaultCoords?.lng) {
      setCoords(defaultCoords);
    }
  }, [defaultCoords]);

  useEffect(() => {
    if (!open) return;

    const loadLeaflet = async () => {
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      if (!window.L) {
        const script = document.createElement("script");
        script.id = "leaflet-js";
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => initLeafletMap();
        document.body.appendChild(script);
      } else {
        setTimeout(initLeafletMap, 150);
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [open]);

  const fetchReverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
      const data = await res.json();
      setAddressDetails(data);
    } catch (e) {
      console.error("Reverse geocoding failed", e);
    }
  };

  const initLeafletMap = () => {
    if (!mapContainerRef.current || !window.L || mapInstanceRef.current) return;

    const L = window.L;
    const initialLat = coords.lat || 17.3850;
    const initialLng = coords.lng || 78.4867;

    const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);

    marker.on('dragend', (e) => {
      const newPos = e.target.getLatLng();
      setCoords({ lat: newPos.lat, lng: newPos.lng });
      fetchReverseGeocode(newPos.lat, newPos.lng);
    });

    map.on('click', (e) => {
      marker.setLatLng(e.latlng);
      setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
      fetchReverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    mapInstanceRef.current = map;
    markerInstanceRef.current = marker;
    fetchReverseGeocode(initialLat, initialLng);
  };

  const handleSearchLocation = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=in&limit=1`);
      const data = await res.json();

      if (data && data.length > 0) {
        const targetLat = parseFloat(data[0].lat);
        const targetLng = parseFloat(data[0].lon);
        setCoords({ lat: targetLat, lng: targetLng });

        if (mapInstanceRef.current && markerInstanceRef.current) {
          mapInstanceRef.current.setView([targetLat, targetLng], 14);
          markerInstanceRef.current.setLatLng([targetLat, targetLng]);
        }
        fetchReverseGeocode(targetLat, targetLng);
      }
    } catch (err) {
      console.error("Map search error:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleConfirm = () => {
    onConfirmLocation(coords, addressDetails);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: "1rem",
          border: "2px solid #1E88E5",
          boxShadow: "0 20px 25px -5px rgba(0, 80, 158, 0.25), 0 8px 10px -6px rgba(0, 80, 158, 0.2)",
        },
      }}
    >
      <DialogTitle className="font-bold text-[#1E88E5] flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
        <span>🗺️ Pick Location on Interactive Map</span>
        <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-lg font-bold cursor-pointer">✕</button>
      </DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSearchLocation} className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Search place, city, village or area in India..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border-2 border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20"
          />
          <Button type="submit" disabled={searchLoading} variant="contained" className="!bg-[#1E88E5]">
            {searchLoading ? "Searching..." : "Search"}
          </Button>
        </form>

        <p className="text-xs text-gray-500 mb-2">💡 Click anywhere on the map or drag the marker to select your exact location.</p>

        <div ref={mapContainerRef} className="w-full h-72 rounded-xl overflow-hidden border-2 border-[#1E88E5]/40 shadow-inner mb-3" />

        {addressDetails && (
          <div className="bg-blue-50/70 dark:bg-gray-800 p-3 rounded-lg text-sm border-2 border-[#1E88E5]/30">
            <p className="font-semibold text-[#1E88E5] dark:text-blue-300">Selected Location:</p>
            <p className="text-gray-700 dark:text-gray-200 text-xs mt-1 leading-relaxed">{addressDetails.display_name}</p>
          </div>
        )}
      </DialogContent>
      <DialogActions className="p-3 border-t border-gray-200 dark:border-gray-700">
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleConfirm} variant="contained" className="!bg-[#1E88E5]">Confirm Location</Button>
      </DialogActions>
    </Dialog>
  );
}

function ProfileFormFields({
  profileInfo,
  isLoading,
  theme,
  handleInputChange,
  getTextFieldStyles,
  pincodeLoading,
  pincodeStatus,
  villageOptions,
  gpsLoading,
  handleDetectGpsLocation,
  setShowMapModal,
}) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <TextField label="First Name *" name="firstName" value={profileInfo?.firstName} onChange={handleInputChange} fullWidth required sx={{ ...getTextFieldStyles(theme), ...(isLoading && { pointerEvents: "none", opacity: 0.7 }) }} />
        <TextField label="Last Name *" name="lastName" value={profileInfo?.lastName} onChange={handleInputChange} fullWidth required sx={{ ...getTextFieldStyles(theme), ...(isLoading && { pointerEvents: "none", opacity: 0.7 }) }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <TextField label="Phone Number *" name="mobileNo" value={profileInfo.mobileNo} onChange={handleInputChange} fullWidth required sx={{ ...getTextFieldStyles(theme), ...(isLoading && { pointerEvents: "none", opacity: 0.7 }) }} />
        <select
          name="gender"
          required
          value={profileInfo.gender}
          onChange={handleInputChange}
          className={`border-2 border-gray-300 dark:border-gray-600 rounded-lg p-3 w-full text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 font-medium focus:outline-none focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20 hover:border-[#1E88E5] transition-all duration-200 shadow-sm ${isLoading ? "cursor-not-allowed opacity-70" : ""}`}
        >
          <option value="" className="text-black dark:text-white bg-white dark:bg-gray-500">Select Gender *</option>
          <option value="Female" className="text-black dark:text-white bg-white dark:bg-gray-500">Female</option>
          <option value="Male" className="text-black dark:text-white bg-white dark:bg-gray-500">Male</option>
          <option value="Other" className="text-black dark:text-white bg-white dark:bg-gray-500">Other</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <TextField label="Username *" name="username" value={profileInfo?.username} onChange={handleInputChange} fullWidth required sx={{ ...getTextFieldStyles(theme), ...(isLoading && { pointerEvents: "none", opacity: 0.7 }) }} />
        <TextField label="Shop Name (Optional)" name="shopName" value={profileInfo?.shopName} onChange={handleInputChange} fullWidth sx={{ ...getTextFieldStyles(theme), ...(isLoading && { pointerEvents: "none", opacity: 0.7 }) }} />
      </div>

      {/* Location & Map Action Header */}
      <div className="p-4 bg-purple-50 dark:bg-gray-800/60 rounded-xl border border-purple-100 dark:border-gray-700/80 my-4 space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <span className="text-sm font-bold text-[#1E88E5] dark:text-pink-300 flex items-center gap-1.5">
            📍 Address & Live Location Selection
          </span>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleDetectGpsLocation}
              disabled={gpsLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1E88E5] hover:bg-[#6c2e5b] rounded-lg transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              {gpsLoading ? <CircularProgress size={14} color="inherit" /> : <MyLocationIcon sx={{ fontSize: "1rem" }} />}
              <span>{gpsLoading ? "Detecting GPS..." : "Detect Live Location"}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowMapModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1E88E5] bg-white border border-[#1E88E5] hover:bg-purple-100 rounded-lg transition shadow-sm cursor-pointer"
            >
              <MapIcon sx={{ fontSize: "1rem" }} />
              <span>Pick on Map</span>
            </button>
          </div>
        </div>

        {/* Pincode & City Verification */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <div className="relative">
              <TextField
                label="Pincode (6 digits) *"
                name="pincode"
                value={profileInfo?.address?.pincode}
                onChange={handleInputChange}
                fullWidth
                required
                inputProps={{ maxLength: 6 }}
                sx={{ ...getTextFieldStyles(theme), ...(isLoading && { pointerEvents: "none", opacity: 0.7 }) }}
              />
              {pincodeLoading && (
                <div className="absolute right-3 top-4">
                  <CircularProgress size={18} sx={{ color: "#1E88E5" }} />
                </div>
              )}
            </div>

            {pincodeStatus && (
              <div className={`mt-1.5 text-xs flex items-center gap-1 font-medium ${pincodeStatus.success ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                {pincodeStatus.success ? <CheckCircleIcon sx={{ fontSize: "0.9rem" }} /> : <ErrorIcon sx={{ fontSize: "0.9rem" }} />}
                <span>{pincodeStatus.message}</span>
              </div>
            )}
          </div>

          <TextField
            label="City / District *"
            name="city"
            value={profileInfo?.address?.city}
            onChange={handleInputChange}
            fullWidth
            required
            sx={{ ...getTextFieldStyles(theme), ...(isLoading && { pointerEvents: "none", opacity: 0.7 }) }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="State *"
            name="state"
            value={profileInfo?.address?.state}
            onChange={handleInputChange}
            fullWidth
            required
            sx={{ ...getTextFieldStyles(theme), ...(isLoading && { pointerEvents: "none", opacity: 0.7 }) }}
          />

          {villageOptions?.length > 0 ? (
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 dark:text-gray-300 mb-1">Village / Locality</label>
              <select
                name="village"
                value={profileInfo?.address?.village}
                onChange={handleInputChange}
                className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-3 w-full text-sm font-medium dark:bg-gray-800 dark:text-white focus:outline-none focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20 hover:border-[#1E88E5] transition-all duration-200 shadow-sm"
              >
                <option value="">Select Village / Locality</option>
                {villageOptions.map((v, i) => (
                  <option key={i} value={v}>{v}</option>
                ))}
              </select>
            </div>
          ) : (
            <TextField
              label="Village / Area / Locality"
              name="village"
              value={profileInfo?.address?.village}
              onChange={handleInputChange}
              fullWidth
              sx={{ ...getTextFieldStyles(theme), ...(isLoading && { pointerEvents: "none", opacity: 0.7 }) }}
            />
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          <TextField
            label="Landmark (e.g. Near Temple / School)"
            name="landmark"
            value={profileInfo?.address?.landmark}
            onChange={handleInputChange}
            fullWidth
            sx={{ ...getTextFieldStyles(theme), ...(isLoading && { pointerEvents: "none", opacity: 0.7 }) }}
          />

          <TextField
            label="Street Address / House No. / Flat *"
            name="streetAddress"
            value={profileInfo?.address?.streetAddress}
            onChange={handleInputChange}
            fullWidth
            required
            multiline
            rows={2}
            sx={{ ...getTextFieldStyles(theme), ...(isLoading && { pointerEvents: "none", opacity: 0.7 }) }}
          />
        </div>
      </div>
    </>
  );
}


export default function ProfileInfoInput() {
  const navigate = useNavigate();
  const location = useLocation();
  const userData = location?.state?.formData;

  const { enqueueSnackbar } = useSnackbar();
  const { fetchUserData } = useContext(UserAuthContext);
  const { handleAdminLogout } = useContext(AdminAuthContext);
  const { theme } = useContext(ThemeContext);

  const viaLogin = location?.state?.viaLogin;
  const hasShownSnackbar = useRef(false);

  useEffect(() => {
    if (!viaLogin && !userData) {
      enqueueSnackbar("User not logged in, please login!", { variant: "error" });
      navigate("/login");
    }
  }, [viaLogin, userData, enqueueSnackbar, navigate]);

  useEffect(() => {
    if (viaLogin && !hasShownSnackbar.current) {
      enqueueSnackbar("Fill the basic info before proceeding", { variant: "info" });
      hasShownSnackbar.current = true;
    }
  }, [enqueueSnackbar, viaLogin]);

  useEffect(() => {
    if (viaLogin) {
      const userDataViaLogin = location?.state?.user;
      localStorage.setItem("tempUserData", JSON.stringify(userDataViaLogin));
    } else if (userData) {
      localStorage.setItem("tempUserData", JSON.stringify(userData));
    }
  }, [viaLogin, userData, location?.state?.user]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const getTextFieldStyles = (theme) => ({
    input: {
      color: theme === "dark" ? "#fff" : "#000",
    },
    "& label": {
      color: theme === "dark" ? "#ccc" : "#555",
      "&.Mui-focused": {
        color: "#1E88E5",
      },
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: theme === "dark" ? "#999" : "#ccc",
      },
      "&:hover fieldset": {
        borderColor: "#1E88E5",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#1E88E5",
      },
    },
  });

  const userInfo = JSON.parse(localStorage?.getItem("tempUserData"));

  const [profileInfo, setProfileInfo] = useState({
    firstName: userInfo?.firstName || "",
    lastName: userInfo?.lastName || "",
    mobileNo: userInfo?.mobileNo || "",
    gender: userInfo?.gender || "",
    photo: userInfo?.photo || "",
    username: userInfo?.username || "",
    address: {
      streetAddress: userInfo?.address?.streetAddress || "",
      village: userInfo?.address?.village || "",
      landmark: userInfo?.address?.landmark || "",
      city: userInfo?.address?.city || "",
      state: userInfo?.address?.state || "",
      pincode: userInfo?.address?.pincode || "",
      lat: userInfo?.address?.lat || "",
      lng: userInfo?.address?.lng || "",
    },
    shopName: userInfo?.shopName || "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState(null);
  const [villageOptions, setVillageOptions] = useState([]);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  const checkPincode = async (code) => {
    if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
      setPincodeStatus(null);
      setVillageOptions([]);
      return;
    }

    setPincodeLoading(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${code}`);
      const data = await res.json();

      if (data && data[0] && data[0].Status === "Success") {
        const postOffices = data[0].PostOffice || [];
        const district = postOffices[0]?.District || postOffices[0]?.Circle || "";
        const state = postOffices[0]?.State || "";
        const villages = postOffices.map((po) => po.Name).filter(Boolean);

        setPincodeStatus({
          success: true,
          message: `Verified: ${district}, ${state}`,
          district,
          state,
          postOffices: villages,
        });

        setVillageOptions(villages);

        setProfileInfo((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            city: prev.address.city || district,
            state: prev.address.state || state,
          },
        }));
      } else {
        setPincodeStatus({
          success: false,
          message: "Invalid Pincode. Please check your 6-digit pincode.",
        });
        setVillageOptions([]);
      }
    } catch (error) {
      console.error("Pincode API error:", error);
      setPincodeStatus({
        success: false,
        message: "Unable to reach Pincode Verification Service.",
      });
    } finally {
      setPincodeLoading(false);
    }
  };

  const handleDetectGpsLocation = () => {
    if (!navigator.geolocation) {
      enqueueSnackbar("Geolocation is not supported by your browser", { variant: "error" });
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          const data = await res.json();
          const addr = data?.address || {};

          const foundPincode = addr.postcode ? addr.postcode.replace(/\s+/g, "").slice(0, 6) : "";
          const foundCity = addr.city || addr.town || addr.district || addr.county || addr.state_district || "";
          const foundState = addr.state || "";
          const foundVillage = addr.suburb || addr.village || addr.neighbourhood || addr.residential || addr.hamlet || "";
          const foundStreet = [addr.road, addr.house_number, addr.building].filter(Boolean).join(", ") || data.display_name?.split(",")[0] || "";

          setProfileInfo((prev) => ({
            ...prev,
            address: {
              ...prev.address,
              pincode: foundPincode || prev.address.pincode,
              city: foundCity || prev.address.city,
              state: foundState || prev.address.state,
              village: foundVillage || prev.address.village,
              streetAddress: foundStreet || prev.address.streetAddress,
              lat: String(latitude),
              lng: String(longitude),
            },
          }));

          if (foundPincode && /^\d{6}$/.test(foundPincode)) {
            checkPincode(foundPincode);
          }

          enqueueSnackbar(`Location detected: ${foundCity || "Current GPS Location"}`, { variant: "success" });
        } catch (err) {
          console.error("Reverse geocoding failed:", err);
          enqueueSnackbar("GPS location detected!", { variant: "info" });
        } finally {
          setGpsLoading(false);
        }
      },
      (error) => {
        console.error("GPS error:", error);
        enqueueSnackbar("Unable to retrieve GPS location. Please allow browser location access.", { variant: "error" });
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleConfirmMapLocation = (coords, addressDetails) => {
    const addr = addressDetails?.address || {};
    const foundPincode = addr.postcode ? addr.postcode.replace(/\s+/g, "").slice(0, 6) : "";
    const foundCity = addr.city || addr.town || addr.district || addr.county || addr.state_district || "";
    const foundState = addr.state || "";
    const foundVillage = addr.suburb || addr.village || addr.neighbourhood || addr.residential || addr.hamlet || "";
    const foundStreet = [addr.road, addr.house_number, addr.building].filter(Boolean).join(", ") || addressDetails?.display_name?.split(",")[0] || "";

    setProfileInfo((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        pincode: foundPincode || prev.address.pincode,
        city: foundCity || prev.address.city,
        state: foundState || prev.address.state,
        village: foundVillage || prev.address.village,
        streetAddress: foundStreet || prev.address.streetAddress,
        lat: String(coords.lat),
        lng: String(coords.lng),
      },
    }));

    if (foundPincode && /^\d{6}$/.test(foundPincode)) {
      checkPincode(foundPincode);
    }

    enqueueSnackbar("Location confirmed from map!", { variant: "success" });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const imageUrl = URL.createObjectURL(file);
      setProfileInfo((prev) => ({ ...prev, photo: imageUrl }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (["streetAddress", "city", "pincode", "village", "landmark", "state"].includes(name)) {
      setProfileInfo((prevData) => {
        const updatedAddr = {
          ...prevData.address,
          [name]: value,
        };

        if (name === "pincode" && value.length === 6 && /^\d{6}$/.test(value)) {
          checkPincode(value);
        }

        return {
          ...prevData,
          address: updatedAddr,
        };
      });
    } else {
      setProfileInfo((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("tempUserData"));
      const formData = new FormData();
      formData.append("id", user?._id);
      formData.append("profileInfo", JSON.stringify(profileInfo));
      if (selectedFile) formData.append("photo", selectedFile);

      const data = await submitSignupForm(formData);

      if (data?.success) {
        localStorage.removeItem("otp-status");
        localStorage.removeItem("tempUserData");
        await fetchUserData(data?.user?._id);
        handleAdminLogout();
        enqueueSnackbar(
          viaLogin ? "Basic details submitted!" : "Profile created successfully!",
          { variant: "success" }
        );
        navigate("/home");
      } else {
        enqueueSnackbar("Something went wrong!", { variant: "error" });
      }
    } catch (err) {
      console.log(err);
      enqueueSnackbar(err?.response?.data?.message || "Server error occurred!", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center px-4 py-10 overflow-auto min-h-screen bg-[#F0F1F3] dark:bg-[#121212] text-black dark:text-white transition-colors duration-300"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800/90 rounded-2xl shadow-2xl px-4 md:px-8 py-8 w-full max-w-3xl border border-gray-100 dark:border-gray-700"
        >
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-3xl font-bold text-center text-[#1E88E5] mb-6 dark:text-blue-300"
          >
            Complete Your Profile
          </motion.h1>

          <motion.form
            className="space-y-5"
            onSubmit={handleFormSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <ProfilePhotoUpload photo={profileInfo.photo} isLoading={isLoading} handlePhotoChange={handlePhotoChange} />
            <ProfileFormFields
              profileInfo={profileInfo}
              isLoading={isLoading}
              theme={theme}
              handleInputChange={handleInputChange}
              getTextFieldStyles={getTextFieldStyles}
              pincodeLoading={pincodeLoading}
              pincodeStatus={pincodeStatus}
              villageOptions={villageOptions}
              gpsLoading={gpsLoading}
              handleDetectGpsLocation={handleDetectGpsLocation}
              setShowMapModal={setShowMapModal}
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col gap-2 mt-4 text-sm font-medium whitespace-break-spaces"
            >
              <label className={`flex items-center gap-2 ${isLoading ? "cursor-not-allowed opacity-70" : ""}`}>
                <input type="checkbox" className="accent-[#1E88E5]" required />
                I agree to all
                <span className="text-[#00ACC1] whitespace-nowrap"> Terms </span> and
                <span className="text-[#00ACC1] whitespace-break-spaces"> Privacy Policies</span>
              </label>
              <label className={`flex items-center gap-2 ${isLoading ? "cursor-not-allowed opacity-70" : ""}`}>
                <input type="checkbox" className="accent-[#1E88E5]" />
                Subscribe to all offers and updates
              </label>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isLoading}
                className="!mt-6 !py-3 !text-lg !bg-[#1E88E5] hover:!bg-[#1565C0]"
              >
                {isLoading ? <BuffaloLoader variant="button" text="Creating Account..." /> : "Submit"}
              </Button>
            </motion.div>
          </motion.form>
        </motion.div>
      </motion.div>

      <MapPickerModal
        open={showMapModal}
        onClose={() => setShowMapModal(false)}
        onConfirmLocation={handleConfirmMapLocation}
        defaultCoords={{
          lat: profileInfo?.address?.lat ? parseFloat(profileInfo.address.lat) : 17.3850,
          lng: profileInfo?.address?.lng ? parseFloat(profileInfo.address.lng) : 78.4867,
        }}
      />
    </>
  );
}
