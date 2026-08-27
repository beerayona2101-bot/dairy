import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  MapPin, Locate, Search, X, Check, Loader2, Navigation, Compass
} from "lucide-react";
import Dialog from "@mui/material/Dialog";
import Slide from "@mui/material/Slide";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function LocationPickerModal({ isOpen, onClose, onSelectLocation, initialLocation }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [mapReady, setMapReady] = useState(false);
  const [loadingGeocode, setLoadingGeocode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [locationError, setLocationError] = useState("");

  const [currentCoords, setCurrentCoords] = useState({
    lat: initialLocation?.lat || 20.0, // Default India coordinates (e.g. Nashik / Maharashtra)
    lng: initialLocation?.lng || 73.78,
  });

  const [addressDetails, setAddressDetails] = useState({
    streetAddress: "",
    village: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
    displayName: "Move marker or click on map to select location",
  });

  // Load Leaflet CSS and JS dynamically from CDN
  useEffect(() => {
    if (!isOpen) return;

    if (window.L) {
      setMapReady(true);
      return;
    }

    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(cssLink);

    const jsScript = document.createElement("script");
    jsScript.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    jsScript.onload = () => setMapReady(true);
    document.body.appendChild(jsScript);
  }, [isOpen]);

  // Reverse Geocoding via OpenStreetMap Nominatim API
  const fetchAddressFromCoords = async (lat, lng) => {
    setLoadingGeocode(true);
    setLocationError("");
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
      );
      const data = await response.json();

      if (data && data.address) {
        const addr = data.address;
        const street =
          addr.road || addr.street || addr.suburb || addr.neighbourhood || addr.residential || "";
        const village =
          addr.village || addr.suburb || addr.neighbourhood || addr.quarter || addr.hamlet || "";
        const city =
          addr.city || addr.town || addr.municipality || addr.county || addr.district || "";
        const district = addr.state_district || addr.district || city || "";
        const state = addr.state || "";
        const pincode = addr.postcode || "";

        setAddressDetails({
          streetAddress: street
            ? `${street}${addr.house_number ? `, No. ${addr.house_number}` : ""}`
            : data.display_name.split(",")[0] || "",
          village: village,
          city: city,
          district: district,
          state: state,
          pincode: pincode,
          displayName: data.display_name || "Selected Location",
        });
      } else {
        setLocationError("Could not retrieve detailed street address. You can manually tweak the fields.");
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err);
      setLocationError("Network issue fetching address details.");
    } finally {
      setLoadingGeocode(false);
    }
  };

  // Initialize or update Leaflet Map
  useEffect(() => {
    if (!mapReady || !isOpen || !mapContainerRef.current) return;

    const L = window.L;
    if (!L) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentCoords.lat, currentCoords.lng],
        zoom: 15,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Create Custom Draggable Marker
      const customIcon = L.divIcon({
        className: "custom-map-marker",
        html: `<div style="
          background-color: #1E88E5;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const marker = L.marker([currentCoords.lat, currentCoords.lng], {
        draggable: true,
        icon: customIcon,
      }).addTo(map);

      // Listen for Drag End on Marker
      marker.on("dragend", (e) => {
        const { lat, lng } = e.target.getLatLng();
        setCurrentCoords({ lat, lng });
        fetchAddressFromCoords(lat, lng);
      });

      // Listen for Map Click
      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setCurrentCoords({ lat, lng });
        fetchAddressFromCoords(lat, lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Initial reverse geocode lookup
      fetchAddressFromCoords(currentCoords.lat, currentCoords.lng);
    } else {
      mapInstanceRef.current.setView([currentCoords.lat, currentCoords.lng], 15);
      markerRef.current.setLatLng([currentCoords.lat, currentCoords.lng]);
    }

    return () => {
      if (mapInstanceRef.current && !isOpen) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapReady, isOpen]);

  // GPS Locate Me Handler
  const handleDetectGPS = () => {
    if ("geolocation" in navigator) {
      setLoadingGeocode(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCurrentCoords({ lat, lng });

          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setView([lat, lng], 16);
            markerRef.current.setLatLng([lat, lng]);
          }
          fetchAddressFromCoords(lat, lng);
        },
        (error) => {
          console.warn("GPS Geolocation failed:", error);
          setLocationError("Unable to detect GPS position. Please click or search on map manually.");
          setLoadingGeocode(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  };

  // Search Address/City Input Handler
  const handleSearchLocation = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchResults([]);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          searchQuery.trim()
        )}&format=json&limit=5&countrycodes=in`
      );
      const data = await response.json();
      setSearchResults(data || []);
      if (!data || data.length === 0) {
        setLocationError("No locations found for your search query.");
      }
    } catch (err) {
      console.error("Search location error:", err);
      setLocationError("Search service unavailable.");
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSearchResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setCurrentCoords({ lat, lng });

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lng], 16);
      markerRef.current.setLatLng([lat, lng]);
    }
    setSearchResults([]);
    setSearchQuery("");
    fetchAddressFromCoords(lat, lng);
  };

  const handleConfirmLocation = () => {
    onSelectLocation({
      ...addressDetails,
      latitude: currentCoords.lat,
      longitude: currentCoords.lng,
    });
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      slots={{ transition: Transition }}
      keepMounted
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: {
          className: "rounded-2xl dark:bg-gray-900 overflow-hidden",
        },
      }}
    >
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col h-[82vh] max-h-[700px]">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-[#1E88E5] dark:text-blue-400 rounded-xl">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white">
                Choose Location on Interactive Map
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Click anywhere or drag marker to pinpoint your exact delivery address
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Container & Floating Search Controls */}
        <div className="relative flex-1 bg-gray-100 dark:bg-gray-950 overflow-hidden">
          {/* Map Target Canvas */}
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Floating Search Bar & Detect GPS Button */}
          <div className="absolute top-4 left-4 right-4 z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-xl mx-auto">
            <form
              onSubmit={handleSearchLocation}
              className="flex-1 flex items-center bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5"
            >
              <Search className="w-4 h-4 text-gray-400 shrink-0 mr-2" />
              <input
                type="text"
                placeholder="Search city, area, or pincode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs sm:text-sm font-medium bg-transparent focus:outline-none text-gray-900 dark:text-white placeholder-gray-400"
              />
              {searching ? (
                <Loader2 className="w-4 h-4 text-[#1E88E5] animate-spin shrink-0 ml-2" />
              ) : (
                <button
                  type="submit"
                  className="text-xs font-bold text-[#1E88E5] hover:text-blue-700 px-2 py-1 shrink-0 cursor-pointer"
                >
                  Search
                </button>
              )}
            </form>

            <button
              type="button"
              onClick={handleDetectGPS}
              className="flex items-center justify-center gap-1.5 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 text-[#1E88E5] dark:text-blue-400 text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition cursor-pointer shrink-0"
            >
              <Locate className="w-4 h-4" />
              <span>Use Current GPS</span>
            </button>
          </div>

          {/* Search Dropdown Results */}
          {searchResults.length > 0 && (
            <div className="absolute top-16 left-4 right-4 z-20 max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/50">
              {searchResults.map((result, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSearchResult(result)}
                  className="w-full text-left p-3 text-xs hover:bg-blue-50 dark:hover:bg-gray-700/60 transition flex items-start gap-2 cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-[#1E88E5] shrink-0 mt-0.5" />
                  <span className="font-medium text-gray-800 dark:text-gray-200 line-clamp-2">
                    {result.display_name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Location Preview & Confirm Action Bar */}
        <div className="p-4 sm:p-5 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 space-y-3">
          <div className="flex items-start gap-3 bg-blue-50/70 dark:bg-gray-800/60 p-3 rounded-xl border border-blue-100 dark:border-gray-700">
            <Compass className="w-5 h-5 text-[#1E88E5] dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-[#1E88E5] dark:text-blue-400 tracking-wider">
                  Selected Location Preview
                </span>
                {loadingGeocode && (
                  <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin text-[#1E88E5]" /> Fetching address...
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mt-0.5">
                {addressDetails.displayName}
              </p>

              {(addressDetails.city || addressDetails.pincode) && (
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] font-bold text-gray-600 dark:text-gray-300">
                  {addressDetails.village && (
                    <span className="bg-white dark:bg-gray-700 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600">
                      Area: {addressDetails.village}
                    </span>
                  )}
                  {addressDetails.city && (
                    <span className="bg-white dark:bg-gray-700 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600">
                      City: {addressDetails.city}
                    </span>
                  )}
                  {addressDetails.state && (
                    <span className="bg-white dark:bg-gray-700 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600">
                      State: {addressDetails.state}
                    </span>
                  )}
                  {addressDetails.pincode && (
                    <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-300">
                      PIN: {addressDetails.pincode}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {locationError && (
            <p className="text-xs text-red-500 font-semibold px-1">{locationError}</p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmLocation}
              disabled={loadingGeocode}
              className="flex items-center gap-2 bg-[#1E88E5] hover:bg-[#1565C0] text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              Confirm & Fill Location Fields
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

LocationPickerModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelectLocation: PropTypes.func.isRequired,
  initialLocation: PropTypes.object,
};
