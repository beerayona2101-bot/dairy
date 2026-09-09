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

            if (res?.userToken) {
              sessionStorage.setItem("userToken", res.userToken);
              sessionStorage.setItem("userRole", "user");
            }
            if (!res?.filledBasicInfo) {
              navigate("/signup/info-input", {
                state: { user: res?.user, viaLogin: true },
              });
              
            } else {
              await fetchUserData(res?.user);
              handleAdminLogout();
              enqueueSnackbar("Login Successful!", { variant: "success" });
              
              const storedRedirect = sessionStorage.getItem("redirectAfterLogin");
              sessionStorage.removeItem("redirectAfterLogin");

              const isAuthPath = (path) => {
                if (!path || typeof path !== "string") return true;
                const clean = path.toLowerCase();
                return (
                  clean === "/login" ||
                  clean === "/signup" ||
                  clean === "/admin/login" ||
                  clean.startsWith("/login/") ||
                  clean.startsWith("/signup/")
                );
              };

              const userDest = (!isAuthPath(storedRedirect) && storedRedirect) || "/user-profile/dashboard";
              navigate(userDest, { replace: true });
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
