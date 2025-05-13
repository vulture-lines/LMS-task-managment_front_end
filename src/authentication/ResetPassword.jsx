import React, { useState, useEffect } from "react";
import { Loader, Eye, EyeOff } from "lucide-react"; // Added Eye and EyeOff
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { AuthResetPassword } from "../service/api";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams(); // Extract token from URL
  const [loading, setLoading] = useState(false);
  const [validationMessages, setValidationMessages] = useState([]);
  const [showNewPassword, setShowNewPassword] = useState(false); // State for newPassword visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for confirmPassword visibility

  const images = [
    {
      url: "https://patronslegal.com/blogs/wp-content/uploads/2024/09/Best-Criminal-Lawyers-in-Noida.jpg",
      text: `<a href="https://storyset.com/job">Job illustrations by Storyset</a>`,
    },
    {
      url: "https://www.jjmccaskill.com/wp-content/uploads/2023/07/Difference-Between-Lawyer-and-Attorney.jpg",
      text: `<a href="https://example.com/community" target="_blank">Join the LMS community</a>`,
    },
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({ mode: "onChange" });

  // Image carousel effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Auto-dismiss validation messages after 3 seconds
  useEffect(() => {
    const timers = validationMessages.map((_, index) =>
      setTimeout(() => closeValidationMessage(index), 3000)
    );
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [validationMessages]);

  // Clear validation messages when component mounts
  useEffect(() => {
    setValidationMessages([]);
  }, []);

  // Validate token on mount
  useEffect(() => {
    if (!token || token.length < 20) {
      setValidationMessages([
        { text: "Invalid or missing token. Please request a new reset link.", type: "error" },
      ]);
      setTimeout(() => navigate("/forgotPassword"), 3000);
    }
  }, [token, navigate]);

  // Function to close a specific validation message
  const closeValidationMessage = (index) => {
    setValidationMessages((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle reset password submission
  const HandleResetPassword = async (data) => {
    setLoading(true);
    setValidationMessages([]);
    try {
      const res = await AuthResetPassword({ token, newPassword: data.newPassword });
      setValidationMessages((prev) => [
        ...prev,
        { text: "Password reset successfully", type: "success" },
      ]);
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      const errorMessages = Array.isArray(error.message)
        ? error.message
        : [error.message || "Failed to reset password. Please try again."];
      setValidationMessages((prev) => [
        ...prev,
        ...errorMessages.map((msg) => ({ text: msg, type: "error" })),
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Watch newPassword for confirmPassword validation
  const newPassword = watch("newPassword");

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <Loader className="h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-2 text-sm font-medium">Processing...</p>
          </div>
        </div>
      )}
      {validationMessages.length > 0 && (
        <div className="fixed top-4 right-4 space-y-2 z-50" aria-live="polite">
          {validationMessages.map((message, index) => (
            <div
              key={index}
              className={`border-l-4 p-4 rounded shadow-md flex justify-between items-center ${
                message.type === "success"
                  ? "bg-green-100 border-green-500 text-green-700"
                  : "bg-red-100 border-red-500 text-red-700"
              }`}
              role="alert"
            >
              <p>{message.text}</p>
              <button
                onClick={() => closeValidationMessage(index)}
                className={`${
                  message.type === "success"
                    ? "text-green-700 hover:text-green-900"
                    : "text-red-700 hover:text-red-900"
                }`}
                aria-label="Close message"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="w-full max-w-6xl min-h-screen md:min-h-0 md:h-5/6 bg-white shadow-2xl rounded-none md:rounded-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row h-full">
          <div className="w-full md:w-1/2 flex flex-col relative">
            <div className="hidden md:flex items-center p-4">
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 text-gray-600 hover:text-black transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-arrow-left"
                >
                  <path d="m12 19-7-7 7-7" />
                  <path d="M19 12H5" />
                </svg>
                Back to Login
              </button>
            </div>

            <div className="w-full h-full flex flex-col justify-center items-center p-6">
              <div className="w-full max-w-md">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Reset Password
                </h1>
                <p className="mb-6 text-gray-500">
                  Enter your new password
                </p>

                <form onSubmit={handleSubmit(HandleResetPassword)}>
                  <div className="relative mb-2">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="New Password"
                      className={`w-full border ${
                        errors.newPassword ? "border-red-500" : "border-gray-300"
                      } rounded-md p-3 pr-10`} // Added pr-10 for icon space
                      {...register("newPassword", {
                        required: "New password is required",
                        pattern: {
                          value:
                            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,30}$/,
                          message:
                            "Password must be 6-30 characters, include one uppercase, one lowercase, one number, and one special character",
                        },
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-red-500 text-sm mb-2">
                      {errors.newPassword.message}
                    </p>
                  )}

                  <div className="relative mb-2">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      className={`w-full border ${
                        errors.confirmPassword ? "border-red-500" : "border-gray-300"
                      } rounded-md p-3 pr-10`} // Added pr-10 for icon space
                      {...register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (value) =>
                          value === newPassword || "Passwords do not match",
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mb-2">
                      {errors.confirmPassword.message}
                    </p>
                  )}

                  <button
                    className="w-full bg-black text-white py-3 rounded-full mb-4 hover:opacity-90 transition"
                    type="submit"
                    disabled={loading}
                    aria-disabled={loading}
                  >
                    Reset Password
                  </button>
                </form>

                <p className="text-sm text-center mt-2">
                  Remember your password?{" "}
                  <button
                    className="text-blue-500 hover:underline"
                    onClick={() => navigate("/login")}
                  >
                    Log in
                  </button>
                </p>
              </div>
            </div>
          </div>

          <div
            className="hidden md:block md:w-1/2 bg-cover bg-center"
            style={{ backgroundImage: `url(${images[currentImageIndex].url})` }}
          >
            <div className="flex flex-col justify-between h-full p-6 text-white">
              <div className="flex justify-end gap-4">
                <button
                  className="border px-4 py-1 rounded-full text-sm hover:bg-white hover:text-black transition"
                  onClick={() => navigate("/signup")}
                >
                  Sign Up
                </button>
                <button className="px-4 py-1 rounded-full text-sm hover:bg-white hover:text-black transition">
                  Join Us
                </button>
              </div>
              <div>
                <h2
                  className="text-xl md:text-2xl font-semibold max-w-xs mb-2 transition-opacity duration-700"
                  dangerouslySetInnerHTML={{
                    __html: images[currentImageIndex].text,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center bg-white p-4 shadow-sm md:hidden">
          <button
            onClick={() => navigate("/login")}
            className="font-bold text-xl flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-arrow-left"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            LMS Platform
          </button>
          <div className="space-x-2">
            <button
              className="px-4 py-1.5 rounded-full text-sm bg-black text-white"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
            <button
              className="px-4 py-1.5 rounded-full text-sm bg-gray-200"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;