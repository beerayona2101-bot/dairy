import React, { useContext } from "react";
import PropTypes from "prop-types";
import { GoogleLogin } from "@react-oauth/google";
import { loginWithGoogle } from "../../../services/userService";
import { useSnackbar } from "notistack";
import { AdminAuthContext, UserAuthContext } from "../../../context/AuthProvider";
import { useNavigate } from "react-router-dom";


export default function GoogleLoginComponent( {setOpenLoginDialog, setGoogleLoginLoading} ) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { handleAdminLogout } = useContext(AdminAuthContext);
  const { fetchUserData } = useContext(UserAuthContext);

  return (

    <GoogleLogin
      onSuccess={async (credentialResponse) => {
        try {
          setGoogleLoginLoading(true);
          const res = await loginWithGoogle(credentialResponse.credential);
          if (res?.success) {

            if (!res?.filledBasicInfo) {
              navigate("/signup/info-input", {
                state: { user: res?.user, viaLogin: true },
              });
              
            } else {
              localStorage.setItem("User", JSON.stringify({
                email: res?.user?.email,
                _id: res?.user?._id
              }));
              await fetchUserData(res?.user?._id);
              handleAdminLogout();
              enqueueSnackbar("Login Successful!", { variant: "success" });
            }
            
          } else {
            enqueueSnackbar("Login failed, please try again.", { variant: "error" });
          }
        } catch (err) {
          const message =
            err.response?.data?.message || "Error logging in with Google.";
          enqueueSnackbar(message, { variant: "error" });
        }finally{
          setOpenLoginDialog(false);
          setGoogleLoginLoading(false);
        }
      }}

      onError={() => {
        enqueueSnackbar("Google Login Failed", { variant: "error" });
      }}
    />
  );
}

GoogleLoginComponent.propTypes = {
  setOpenLoginDialog: PropTypes.func.isRequired,
  setGoogleLoginLoading: PropTypes.func.isRequired,
};