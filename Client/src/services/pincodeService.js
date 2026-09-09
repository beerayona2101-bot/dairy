/**
 * Real Indian Postal Pincode Lookup Service
 * Fetches State, District/City, and Post Offices/Localities for a 6-digit Indian PIN code.
 */

const fallbackPincodes = {
  "422010": { city: "Nashik", state: "Maharashtra", localities: ["MIDC Ambad", "Ambad Village", "Xlo Point"] },
  "400001": { city: "Mumbai", state: "Maharashtra", localities: ["Fort", "Stock Exchange", "Horniman Circle"] },
  "400050": { city: "Mumbai", state: "Maharashtra", localities: ["Bandra West", "Pali Hill", "Carter Road"] },
  "411001": { city: "Pune", state: "Maharashtra", localities: ["Pune G.P.O.", "Camp", "Station Area"] },
  "500001": { city: "Hyderabad", state: "Telangana", localities: ["Hyderabad G.P.O.", "Abids", "Nampally"] },
  "560001": { city: "Bengaluru", state: "Karnataka", localities: ["Bangalore G.P.O.", "MG Road", "Cubbon Park"] },
  "110001": { city: "New Delhi", state: "Delhi", localities: ["Connaught Place", "Barakhamba Road", "Janpath"] },
  "600001": { city: "Chennai", state: "Tamil Nadu", localities: ["Chennai G.P.O.", "George Town", "Parrys"] },
  "700001": { city: "Kolkata", state: "West Bengal", localities: ["Kolkata G.P.O.", "BBD Bagh", "Dalhousie"] },
  "380001": { city: "Ahmedabad", state: "Gujarat", localities: ["Bhadra", "Lal Darwaja", "Relief Road"] },
};

export const fetchPincodeDetails = async (pincode) => {
  const cleanPin = String(pincode || "").trim();

  if (!/^\d{6}$/.test(cleanPin)) {
    return { success: false, message: "Pincode must be a 6-digit number." };
  }

  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
    const data = await response.json();

    if (Array.isArray(data) && data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
      const postOffices = data[0].PostOffice;
      const district = postOffices[0].District || postOffices[0].Division || postOffices[0].Block;
      const state = postOffices[0].State;
      const localities = postOffices.map((po) => po.Name).filter(Boolean);

      return {
        success: true,
        pincode: cleanPin,
        city: district,
        district: district,
        state: state,
        localities: Array.from(new Set(localities)),
        villages: Array.from(new Set(localities)),
      };
    }
  } catch (error) {
    console.warn("Pincode API offline or failed, checking fallback data...", error);
  }

  // Fallback check
  if (fallbackPincodes[cleanPin]) {
    const info = fallbackPincodes[cleanPin];
    return {
      success: true,
      pincode: cleanPin,
      city: info.city,
      state: info.state,
      localities: info.localities,
    };
  }

  return {
    success: false,
    message: "No postal records found for this pincode.",
  };
};
