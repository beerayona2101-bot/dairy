import { Button } from "@mui/material";
import { useSnackbar } from "notistack";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateOtp, verifyUserByEmail } from "../../../services/userService";
import { sendOtpEmail } from "../../../services/sentOtp";

export default function ForgetPassword() {
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar();
  const [email, setEmail] = useState("");
  const [disableInput, setDisableInput] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

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

  const [sentOTP, setSentOTP] = useState("");

  const verifyEmail = async () => {
    if (!isValidEmail(email)) {
      return enqueueSnackbar("Invalid email format", { variant: "warning" });
    }

    const otpGenerated = generateOtp();
    setLoading(true);

    try {
      const res = await verifyUserByEmail(email);
      if (res?.success) {
        setDisableInput(true);

        const response = await sendOtpEmail(res?.email, otpGenerated); 
        if (response?.success) {
          enqueueSnackbar("Otp sent successfully", { variant: "success" });
          setSentOTP(otpGenerated);
          setShowOtpInput(true);
        } else {
          enqueueSnackbar("Failed to send OTP", { variant: "error" });
        }
      }
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || "Something went wrong", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 5) {
      return enqueueSnackbar("Please enter a valid 5-digit OTP", { variant: "error" });
    } else if (enteredOtp !== sentOTP) {
      return enqueueSnackbar("Please enter a correct otp.", { variant: "error" });
    }

    navigate("/login/reset-password", { state: { email: email } });
  };

  return (
    <div className={`flex flex-col md:flex-row min-h-screen transition bg-[#f5f5f5] dark:bg-[#121212] items-center justify-center px-4 py-10`}>
      <div className="w-full md:w-[40%] bg-white dark:bg-gray-500/20 rounded-2xl shadow-2xl p-8 max-w-md transition">
        <button
          className="text-sm text-gray-600 dark:text-gray-300 flex items-center cursor-pointer hover:text-[#1E88E5] transition"
          onClick={() => navigate("/login")}
        >
          <i className="fa-solid fa-arrow-left me-3"></i>Back to Login Page
        </button>

        <h1 className="text-3xl font-semibold mt-6 text-[#1E88E5] dark:text-white">Forgot your password ?</h1>

        <p className="text-sm mt-4 mb-4 text-gray-600 dark:text-gray-300">
          {showOtpInput ? "An authentication code has been sent to your email. Enter the 5-digit OTP below to verify." : "Don’t worry, happens to all of us. Enter your verified email below to recover your password"}
        </p>



        <input
          type="email"
          id="email"
          name="email"
          placeholder="Enter your email address"
          // value={formData?.email}
          disabled={disableInput}
          onChange={(e) => {
            setEmail(e?.target?.value)
          }}
          className={`w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 ${showOtpInput ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-white  text-gray-800 dark:text-gray-200"} dark:bg-gray-800  focus:outline-none focus:ring-2 focus:ring-[#1E88E5]`}
          required
        />

        {showOtpInput ? (
          <div id="otp-input" className="flex justify-between mt-8 space-x-2">
            {otp.map((digit, index) => (
              <input
                key={`forget-otp-${index}`}
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
        ) : null}


        {(() => {
          let buttonText;
          if (showOtpInput) {
            buttonText = loading ? "Verifying..." : "Verify OTP";
          } else {
            buttonText = loading ? "Sending..." : "Send OTP";
          }
          return (
            <Button
              variant="contained"
              onClick={showOtpInput ? () => {
                verifyOtp()
              } : () => {
                verifyEmail()
              }}
              // disabled={loading}
              className="w-full !mt-6 font-semibold !bg-[#1E88E5] hover:!bg-[#6f3260] transition"
            >
              {buttonText}
            </Button>
          );
        })()}
      </div>

      <div className="hidden md:flex w-[50%] h-full justify-center items-center">
        <img
          src="https://img.freepik.com/free-vector/otp-concept-illustration_114360-7882.jpg"
          alt="OTP Illustration"
          className="w-[80%] max-h-[400px] object-contain dark:invert"
        />
      </div>
    </div>
  );
}