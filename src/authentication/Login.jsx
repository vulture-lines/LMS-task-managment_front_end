import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import { AuthLogin, AuthRegister } from "../service/api";
import { useNavigate } from "react-router";

export default function Login() {
  const navigate = useNavigate();
  const [showSignup, setShowSignup] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
  const [loading, setLoading] = useState(false);

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
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm();

  const {
    register: signupRegister,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
  } = useForm();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const HandleLogin = async (data) => {
    setLoading(true);
    try {
      const res = await AuthLogin(data);
      localStorage.setItem("loginData", JSON.stringify(res));
      console.log(res);
      if (res.user.role === "Mentor") {
        navigate("/admin");
        window.location.reload();
      } else if (res.user.role === "Student") {
        navigate("/student");
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
      localStorage.removeItem("loginData");
    } finally {
      setLoading(false);
    }
  };

  const HandleRegister = async (data) => {
    setLoading(true);
    try {
      const res = await AuthRegister(data);
      console.log(res);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (showWelcomeScreen) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
              <Loader className="h-8 w-8 animate-spin text-blue-600" />
              <p className="mt-2 text-sm font-medium">Authenticating...</p>
            </div>
          </div>
        )}
        <div className="w-full max-w-6xl min-h-screen md:min-h-0 md:h-5/6 bg-white shadow-2xl rounded-none md:rounded-2xl overflow-hidden">
          <div className="flex flex-col md:flex-row h-full">
            <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 bg-white">
              <div className="w-full max-w-md text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Welcome to
                </h1>
                <h2 className="text-3xl md:text-4xl font-bold text-blue-600 mb-6">
                  LMS Platform
                </h2>
                <p className="mb-8 text-gray-600 text-lg">
                  Your all-in-one learning management system. Join our community
                  of students and mentors today!
                </p>

                <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start">
                  <button
                    onClick={() => {
                      setShowWelcomeScreen(false);
                      setShowSignup(false);
                    }}
                    className="bg-black text-white py-3 px-8 rounded-full hover:opacity-90 transition"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      setShowWelcomeScreen(false);
                      setShowSignup(true);
                    }}
                    className="border border-black text-black py-3 px-8 rounded-full hover:bg-gray-100 transition"
                  >
                    Sign Up
                  </button>
                </div>

                <div className="mt-8 text-gray-500">
                  <p className="text-sm">
                    By continuing, you agree to our{" "}
                    <a href="#" className="text-blue-500 hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-blue-500 hover:underline">
                      Privacy Policy
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div
              className="hidden md:block md:w-1/2 bg-cover bg-center"
              style={{
                backgroundImage: `url(${images[currentImageIndex].url})`,
              }}
            >
              <div className="flex flex-col justify-between h-full p-6 text-white">
                <div className="flex justify-end gap-4">
                  <button
                    className="border px-4 py-1 rounded-full text-sm hover:bg-white hover:text-black transition"
                    onClick={() => {
                      setShowWelcomeScreen(false);
                      setShowSignup(true);
                    }}
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
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <Loader className="h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-2 text-sm font-medium">Authenticating...</p>
          </div>
        </div>
      )}
      <div className="relative w-full max-w-6xl min-h-screen md:min-h-0 md:h-5/6 bg-white shadow-2xl rounded-none md:rounded-2xl overflow-hidden">
        <div className="flex justify-between items-center bg-white p-4 shadow-sm md:hidden">
          <button
            onClick={() => setShowWelcomeScreen(true)}
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
              className={`px-4 py-1.5 rounded-full text-sm ${
                !showSignup ? "bg-black text-white" : "bg-gray-200"
              }`}
              onClick={() => setShowSignup(false)}
            >
              Login
            </button>
            <button
              className={`px-4 py-1.5 rounded-full text-sm ${
                showSignup ? "bg-black text-white" : "bg-gray-200"
              }`}
              onClick={() => setShowSignup(true)}
            >
              Sign Up
            </button>
          </div>
        </div>

        <div className="w-full h-full flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 flex flex-col relative">
            <div className="hidden md:flex items-center p-4">
              <button
                onClick={() => setShowWelcomeScreen(true)}
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
                Back to welcome
              </button>
            </div>

            <div
              className={`w-full h-full flex flex-col justify-center items-center p-6 transition-all duration-500 ${
                showSignup ? "hidden md:hidden" : "block"
              }`}
            >
              <div className="w-full max-w-md">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Hi there!
                </h1>
                <p className="mb-6 text-gray-500">Welcome to LMS platform</p>

                <button className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md py-3 text-gray-600 mb-4 hover:bg-gray-100 transition">
                  <img
                    src="https://www.svgrepo.com/show/355037/google.svg"
                    alt="Google Icon"
                    className="h-5 w-5"
                  />
                  Log in with Google
                </button>

                <div className="flex items-center my-4">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="mx-4 text-gray-400">or</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <form onSubmit={handleLoginSubmit(HandleLogin)}>
                  <input
                    type="text"
                    placeholder="Your username"
                    className="w-full border border-gray-300 rounded-md p-3 mb-4"
                    {...loginRegister("identifier", { required: true })}
                  />

                  <div className="relative mb-2">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="Password"
                      className="w-full border border-gray-300 rounded-md p-3 pr-10"
                      {...loginRegister("password", { required: true })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
                    >
                      {showLoginPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>

                  <div className="text-right text-sm mb-6">
                    <a href="#" className="text-blue-500 hover:underline">
                      Forgot password?
                    </a>
                  </div>

                  <button
                    className="w-full bg-black text-white py-3 rounded-full mb-4 hover:opacity-90 transition"
                    type="submit"
                  >
                    Log In
                  </button>
                </form>

                <p className="text-sm text-center mt-2">
                  Don't have an account?{" "}
                  <button
                    className="text-blue-500 hover:underline"
                    onClick={() => setShowSignup(true)}
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </div>

            <div
              className={`w-full h-full flex flex-col justify-center items-center p-6 transition-all duration-500 ${
                showSignup ? "block" : "hidden md:hidden"
              }`}
            >
              <div className="w-full max-w-md">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Join Us!
                </h1>
                <p className="mb-6 text-gray-500">
                  Create your LMS platform account
                </p>

                <button className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md py-3 text-gray-600 mb-4 hover:bg-gray-100 transition">
                  <img
                    src="https://www.svgrepo.com/show/355037/google.svg"
                    alt="Google Icon"
                    className="h-5 w-5"
                  />
                  Sign up with Google
                </button>

                <div className="flex items-center my-4">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="mx-4 text-gray-400">or</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <form onSubmit={handleSignupSubmit(HandleRegister)}>
                  <input
                    type="text"
                    placeholder="User Name"
                    className="w-full border border-gray-300 rounded-md p-3 mb-4"
                    {...signupRegister("username", { required: true })}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full border border-gray-300 rounded-md p-3 mb-4"
                    {...signupRegister("email", { required: true })}
                  />

                  <div className="relative mb-6">
                    <input
                      type={showSignupPassword ? "text" : "password"}
                      placeholder="Password"
                      className="w-full border border-gray-300 rounded-md p-3 pr-10"
                      {...signupRegister("password", { required: true })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
                    >
                      {showSignupPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>

                  <button
                    className="w-full bg-black text-white py-3 rounded-full mb-4 hover:opacity-90 transition"
                    type="submit"
                  >
                    Sign Up
                  </button>
                </form>

                <p className="text-sm text-center mt-2">
                  Already have an account?{" "}
                  <button
                    className="text-blue-500 hover:underline"
                    onClick={() => setShowSignup(false)}
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
                  onClick={() => setShowSignup(true)}
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
      </div>
    </div>
  );
}