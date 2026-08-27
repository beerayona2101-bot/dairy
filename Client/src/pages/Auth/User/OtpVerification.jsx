import React, { useState, useRef, useEffect } from "react";
import { Button, CircularProgress } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { generateOtp, verifyUserOTP } from "../../../services/userService";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { sendOtpEmail } from "../../../services/sentOtp";

export default function OtpVerification() {

  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  const formData = location?.state?.formData;
  let sentOtp = location?.state?.otp;

  useEffect(() => {
    const otpStatus = JSON.parse(localStorage.getItem("otp-status"));
    if (otpStatus?.email === formData?.email && otpStatus?.isOtpEntered) {
      enqueueSnackbar("You already entered OTP ! Proceed to next page ->", { variant: "info" })
      navigate("/signup/info-input", { state: { formData } });
    }
  }, [formData, navigate, enqueueSnackbar]);

  useEffect(() => {
    if (!formData) {
      navigate("/signup");
    }
  }, [formData, navigate]);

  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds

  useEffect(() => {
    let timer;

    if (resendDisabled && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    }

    if (timeLeft === 0) {
      setResendDisabled(false);
    }

    return () => clearTimeout(timer);
  }, [resendDisabled, timeLeft]);

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


  const handleChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 4) inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const resendOtp = async (email, otp) => {
    try {
      const res = await sendOtpEmail(email, otp);
      if (res?.success) {
        enqueueSnackbar("OTP resent successfully", { variant: "success" });
        sentOtp = res?.otp;

        setTimeLeft(120);
        setResendDisabled(true);
      }
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Failed to resend OTP", { variant: "error" });
    }
  };


  const handleVerify = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 5) {
      enqueueSnackbar("Please enter a valid 5-digit OTP", { variant: "error" });
      return;
    } else if (enteredOtp !== sentOtp) {
      enqueueSnackbar("Please enter a correct otp.", { variant: "error" })
      return;
    }

    setLoading(true);
    try {
      const data = await verifyUserOTP(formData);

      if (data?.success) {

        localStorage.setItem("otp-status", JSON.stringify({
          email: formData.email,
          isOtpEntered: true
        }));

        enqueueSnackbar("User signed up successfully. Please fill basic details to proceed !", { variant: "info" });
        navigate("/signup/info-input", { state: { formData: data?.user } });
      } else {
        enqueueSnackbar("Something went wrong", { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || "User already exists or server error.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col md:flex-row min-h-screen transition bg-[#f5f5f5] dark:bg-[#121212] items-center justify-center px-4 py-10 gap-10`}>
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="w-full md:w-[40%] bg-white dark:bg-gray-900 rounded-2xl border-2 border-[#1E88E5] shadow-2xl p-8 max-w-md transition"
      >
        <button
          className="text-sm text-gray-600 dark:text-gray-300 flex items-center cursor-pointer hover:text-[#1E88E5] transition"
          onClick={() => navigate("/signup")}
        >
          <i className="fa-solid fa-arrow-left me-3"></i>Back to Signup Page
        </button>

        <h1 className="text-3xl font-semibold mt-6 text-[#1E88E5] dark:text-white">Verify OTP</h1>
        <p className="text-sm mt-4 text-gray-600 dark:text-gray-300">
          An authentication code has been sent to {formData?.email} email. Enter the 5-digit OTP below to verify.
        </p>

        <div className="mt-4 text-center bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 dark:bg-yellow-300/10 dark:text-yellow-300 px-4 py-2 rounded-md text-sm font-medium">
          ⚠️ Please do not refresh the page or go back. Your OTP session might get interrupted.
        </div>


        <div
          id="otp-input"
          className="flex justify-between mt-8 space-x-2"
        >          {otp.map((digit, index) => (
          <input
            key={`verify-otp-${index}`}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            ref={(el) => (inputRefs.current[index] = el)}
            className={`${loading ? "cursor-not-allowed" : "cursor-text"} h-14 w-12 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-center text-xl focus:outline-none focus:ring-2 focus:ring-[#1E88E5] transition`}
          />
        ))}
        </div>

        <div className="mt-5 text-sm flex justify-center text-gray-600 dark:text-gray-400">
          {resendDisabled ? (
            <p>
              Resend OTP in{" "}
              <span className="text-[#1E88E5] font-semibold">
                {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
                {String(timeLeft % 60).padStart(2, "0")}
              </span>
            </p>
          ) : (
            <>
              <p>Didn't receive OTP?&nbsp;</p>
              <button
                onClick={() => resendOtp(formData?.email, generateOtp())}
                className="text-[#FF8682] font-semibold hover:underline hover:text-[#e2595b]"
              >
                Resend OTP
              </button>
            </>
          )}
        </div>


        <Button
          variant="contained"
          onClick={handleVerify}
          disabled={loading}
          className="w-full !mt-6 font-semibold !bg-[#1E88E5] hover:!bg-[#6f3260] transition"
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Verify OTP"}
        </Button>
      </motion.div>

      <motion.div
        className="hidden md:flex w-[40%] h-full justify-center items-center"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >        <img
          src="https://useme.in/web/assets/images/what-now/your-privacy.png"
          alt="OTP Illustration"
          className="w-[80%] max-h-[400px] object-contain "
        />
      </motion.div>
    </div>
  );
}