import React, { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { AuthForgotPassword } from "../service/api";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [validationMessages, setValidationMessages] = useState([]);

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

  // Function to close a specific validation message
  const closeValidationMessage = (index) => {
    setValidationMessages((prev) => prev.filter((_, i) => i !== index));
  };

  const HandleForgotPassword = async (data) => {
    setLoading(true);
    setValidationMessages([]);
    try {
      const res = await AuthForgotPassword(data);
      setValidationMessages((prev) => [
        ...prev,
        { text: "Password reset email sent successfully", type: "success" },
      ]);
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      const errorMessages = Array.isArray(error.message)
        ? error.message
        : [error.message || "Failed to send password reset email. Please try again."];
      setValidationMessages((prev) => [
        ...prev,
        ...errorMessages.map((msg) => ({ text: msg, type: "error" })),
      ]);
    } finally {
      setLoading(false);
    }
  };

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
                  Forgot Password
                </h1>
                <p className="mb-6 text-gray-500">
                  Enter your email to receive a password reset link
                </p>

                <form
                  onSubmit={handleSubmit((data) => {
                    const errors = [];
                    if (errors.email) {
                      errors.push(errors.email.message);
                    }
                    if (errors.length > 0) {
                      setValidationMessages(
                        errors.map((msg) => ({ text: msg, type: "error" }))
                      );
                      return;
                    }
                    HandleForgotPassword(data);
                  })}
                >
                  <input
                    type="email"
                    placeholder="Email"
                    className={`w-full border ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    } rounded-md p-3 mb-2`}
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: "Invalid email address",
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mb-2">
                      {errors.email.message}
                    </p>
                  )}

                  <button
                    className="w-full bg-black text-white py-3 rounded-full mb-4 hover:opacity-90 transition"
                    type="submit"
                    disabled={loading}
                  >
                    Send Reset Link
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

export default ForgotPassword;