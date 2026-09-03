import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  owner : {type : mongoose.Types.ObjectId , ref : "User"},
  addressType: {
    type: String,
    default: "Home",
  },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  hno: { type: String },
  streetAddress: { type: String, required: true },
  village: { type: String },
  city: { type: String, required: true },
  district: { type: String },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
});


export default mongoose.model("Address", AddressSchema);