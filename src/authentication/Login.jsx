// import React, { useState, useEffect } from "react";
// import { Eye, EyeOff, Loader } from "lucide-react";
// import { useForm } from "react-hook-form";
// import {
//   AuthLogin,
//   AuthRegister,
//   AuthGoogleLogin,
//   AuthGoogleSignup,
//   baseUrl1,
// } from "../service/api";
// import { useNavigate } from "react-router";
// import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";

// const API_URL = `${baseUrl1}`; 

// const getDaysInMonth = (year, month) => {
//   const date = new Date(year, month, 1);
//   const days = [];
//   while (date.getMonth() === month) {
//     days.push(new Date(date));
//     date.setDate(date.getDate() + 1);
//   }
//   return days;
// };

// const Login = () => {
//   const navigate = useNavigate();
//   const [showSignup, setShowSignup] = useState(false);
//   const [showLoginPassword, setShowLoginPassword] = useState(false);
//   const [showSignupPassword, setShowSignupPassword] = useState(false);
//   const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [validationMessages, setValidationMessages] = useState([]);

//   const today = new Date();
//   const [month, setMonth] = useState(today.getMonth());
//   const [year, setYear] = useState(today.getFullYear());
//   const [signupData, setSignupData] = useState([]);

//   const currentMonthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
//   const days = getDaysInMonth(year, month);
//   const startDay = new Date(year, month, 1).getDay();
//   const todayStr = today.toISOString().split("T")[0];

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await fetch(`${API_URL}/api/signuplimit`);
//         const data = await res.json();
//         setSignupData(data);
//       } catch (err) {
//         console.error("Failed to fetch signup data", err);
//       }
//     };

//     fetchData();
//   }, []);

//   const monthData = signupData.find((m) => m.month === currentMonthKey);
//   const isMonthFull = monthData?.count >= 100;

//   const nextMonth = () => {
//     setMonth((prev) => {
//       if (prev === 11) {
//         setYear((y) => y + 1);
//         return 0;
//       }
//       return prev + 1;
//     });
//   };

//   const prevMonth = () => {
//     setMonth((prev) => {
//       if (prev === 0) {
//         setYear((y) => y - 1);
//         return 11;
//       }
//       return prev - 1;
//     });
//   };

//   const images = [
//     {
//       url: "https://patronslegal.com/blogs/wp-content/uploads/2024/09/Best-Criminal-Lawyers-in-Noida.jpg",
//       text: `<a href="https://storyset.com/job">Job illustrations by Storyset</a>`,
//     },
//     {
//       url: "https://www.jjmccaskill.com/wp-content/uploads/2023/07/Difference-Between-Lawyer-and-Attorney.jpg",
//       text: `<a href="https://example.com/community" target="_blank">Join the LMS community</a>`,
//     },
//   ];

//   const [currentImageIndex, setCurrentImageIndex] = useState(0);

//   const {
//     register: loginRegister,
//     handleSubmit: handleLoginSubmit,
//     formState: { errors: loginErrors },
//   } = useForm({ mode: "onChange" });

//   const {
//     register: signupRegister,
//     handleSubmit: handleSignupSubmit,
//     formState: { errors: signupErrors },
//     watch,
//   } = useForm({ mode: "onChange" });

//   // Watch username for Google signup
//   const username = watch("username");

//   // Image carousel effect
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentImageIndex((prevIndex) =>
//         prevIndex === images.length - 1 ? 0 : prevIndex + 1
//       );
//     }, 3000);
//     return () => clearInterval(interval);
//   }, []);

//   // Auto-dismiss validation messages after 3 seconds
//   useEffect(() => {
//     const timers = validationMessages.map((_, index) =>
//       setTimeout(() => closeValidationMessage(index), 3000)
//     );
//     return () => timers.forEach((timer) => clearTimeout(timer));
//   }, [validationMessages]);

//   // Clear validation messages when switching screens
//   useEffect(() => {
//     setValidationMessages([]);
//   }, [showSignup, showWelcomeScreen]);

//   // Function to close a specific validation message
//   const closeValidationMessage = (index) => {
//     setValidationMessages((prev) => prev.filter((_, i) => i !== index));
//   };

//   const HandleLogin = async (data) => {
//     setLoading(true);
//     setValidationMessages([]);
//     try {
//       const res = await AuthLogin(data);
//       localStorage.setItem("loginData", JSON.stringify(res));
//       setValidationMessages((prev) => [
//         ...prev,
//         { text: "Successfully logged in", type: "success" },
//       ]);
//       setTimeout(() => {
//         if (res.user.role === "Mentor") {
//           navigate("/admin");
//           window.location.reload();
//         } else if (res.user.role === "Student") {
//           navigate("/student");
//           window.location.reload();
//         }
//       }, 1000);
//     } catch (error) {
//       const errorMessages = Array.isArray(error.message)
//         ? error.message
//         : [error.message || "Login failed. Please check your credentials."];
//       setValidationMessages((prev) => [
//         ...prev,
//         ...errorMessages.map((msg) => ({ text: msg, type: "error" })),
//       ]);
//       localStorage.removeItem("loginData");
//       localStorage.clear();
//     } finally {
//       setLoading(false);
//     }
//   };

//   const HandleRegister = async (data) => {
//     setLoading(true);
//     setValidationMessages([]);
//     try {
//       const res = await AuthRegister(data);
//       setValidationMessages((prev) => [
//         ...prev,
//         { text: "Successfully signed up", type: "success" },
//       ]);
//       setTimeout(() => {
//         setShowWelcomeScreen(true);
//         setShowSignup(false);
//       }, 1000);
//     } catch (error) {
//       const errorMessages = Array.isArray(error.message)
//         ? error.message
//         : [error.message || "Signup failed. Please try again."];
//       setValidationMessages((prev) => [
//         ...prev,
//         ...errorMessages.map((msg) => ({ text: msg, type: "error" })),
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle Google Login (auth-code flow)
//   const handleGoogleLogin = useGoogleLogin({
//     flow: "auth-code",
//     redirect_uri: window.location.origin,
//     onSuccess: async (codeResponse) => {
//       setLoading(true);
//       setValidationMessages([]);
//       try {
//         // Try to sign up with the Google code
//         const res = await AuthGoogleSignup({ code: codeResponse.code });

//         // Check if the response contains a user object and the approval status
//         if (res && res.user && !res.user.isApproved) {
//           // If the user is not approved, show a message and redirect them to the login page
//           setValidationMessages((prev) => [
//             ...prev,
//             {
//               text: "Account successfully created. Your account is pending approval.",
//               type: "info",
//             },
//           ]);
//           localStorage.setItem("signupData", JSON.stringify(res)); // Store signup data temporarily
//           navigate("/login"); // Redirect to login page
//         } else {
//           // If the user is approved, log them in
//           localStorage.setItem("loginData", JSON.stringify(res));
//           setValidationMessages((prev) => [
//             ...prev,
//             {
//               text: "Successfully signed up and logged in with Google!",
//               type: "success",
//             },
//           ]);
//           setTimeout(() => {
//             if (res.user.role === "Mentor") {
//               navigate("/admin");
//               window.location.reload();
//             } else if (res.user.role === "Student") {
//               navigate("/student");
//               window.location.reload();
//             }
//           }, 1000);
//         }
//       } catch (error) {
//         const errorMessages = Array.isArray(error.message)
//           ? error.message
//           : [error.message || "Google signup failed. Please try again."];
//         setValidationMessages((prev) => [
//           ...prev,
//           ...errorMessages.map((msg) => ({ text: msg, type: "error" })),
//         ]);
//       } finally {
//         setLoading(false);
//       }
//     },
//     onError: () => {
//       setValidationMessages((prev) => [
//         ...prev,
//         { text: "Google signup failed. Please try again.", type: "error" },
//       ]);
//     },
//   });

//   // Handle Google Signup (auth-code flow)
//   const handleGoogleSignup = useGoogleLogin({
//     flow: "auth-code",
//     redirect_uri: window.location.origin,
//     onSuccess: async (codeResponse) => {
//       setLoading(true);
//       setValidationMessages([]);
//       try {
//         // Try to sign up with the Google code
//         const res = await AuthGoogleSignup({ code: codeResponse.code });

//         // Check if the response contains a user object and the approval status
//         if (res && res.user && !res.user.isApproved) {
//           // If the user is not approved, show a message and redirect them to the login page
//           setValidationMessages((prev) => [
//             ...prev,
//             {
//               text: "Account successfully created. Your account is pending approval.",
//               type: "info",
//             },
//           ]);
//           localStorage.setItem("signupData", JSON.stringify(res)); // Store signup data temporarily
//           navigate("/login"); // Redirect to login page
//         } else {
//           // If the user is approved, log them in
//           localStorage.setItem("loginData", JSON.stringify(res));
//           setValidationMessages((prev) => [
//             ...prev,
//             {
//               text: "Successfully signed up and logged in with Google!",
//               type: "success",
//             },
//           ]);
//           setTimeout(() => {
//             if (res.user.role === "Mentor") {
//               navigate("/admin");
//               window.location.reload();
//             } else if (res.user.role === "Student") {
//               navigate("/student");
//               window.location.reload();
//             }
//           }, 1000);
//         }
//       } catch (error) {
//         const errorMessages = Array.isArray(error.message)
//           ? error.message
//           : [error.message || "Google signup failed. Please try again."];
//         setValidationMessages((prev) => [
//           ...prev,
//           ...errorMessages.map((msg) => ({ text: msg, type: "error" })),
//         ]);
//       } finally {
//         setLoading(false);
//       }
//     },
//     onError: () => {
//       setValidationMessages((prev) => [
//         ...prev,
//         { text: "Google signup failed. Please try again.", type: "error" },
//       ]);
//     },
//   });

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gray-100">
//       {loading && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
//             <Loader className="h-8 w-8 animate-spin text-blue-600" />
//             <p className="mt-2 text-sm font-medium">Authenticating...</p>
//           </div>
//         </div>
//       )}
//       {validationMessages.length > 0 && (
//         <div className="fixed top-4 right-4 space-y-2 z-50" aria-live="polite">
//           {validationMessages.map((message, index) => (
//             <div
//               key={index}
//               className={`border-l-4 p-4 rounded shadow-md flex justify-between items-center ${
//                 message.type === "success"
//                   ? "bg-green-100 border-green-500 text-green-700"
//                   : "bg-red-100 border-red-500 text-red-700"
//               }`}
//               role="alert"
//             >
//               <p>{message.text}</p>
//               <button
//                 onClick={() => closeValidationMessage(index)}
//                 className={`${
//                   message.type === "success"
//                     ? "text-green-700 hover:text-green-900"
//                     : "text-red-700 hover:text-red-900"
//                 }`}
//                 aria-label="Close message"
//               >
//                 ✕
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//       <div className="w-full max-w-6xl min-h-screen md:min-h-0 md:h-5/6 bg-white shadow-2xl rounded-none md:rounded-2xl overflow-hidden">
//         <div className="flex flex-col md:flex-row h-full">
//           {showWelcomeScreen ? (
//             <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 bg-white">
//               <div className="w-full max-w-md text-center md:text-left">
//                 <h1 className="text-4xl md:text-5xl font-bold mb-4">
//                   Welcome to
//                 </h1>
//                 <h2 className="text-3xl md:text-4xl font-bold text-blue-600 mb-6">
//                   LMS Platform
//                 </h2>
//                 <p className="mb-8 text-gray-600 text-lg">
//                   Your all-in-one learning management system. Join our community
//                   of students and mentors today!
//                 </p>
//                 <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start">
//                   <button
//                     onClick={() => {
//                       setShowWelcomeScreen(false);
//                       setShowSignup(false);
//                       setValidationMessages([]);
//                     }}
//                     className="bg-black text-white py-3 px-8 rounded-full hover:opacity-90 transition"
//                   >
//                     Log In
//                   </button>
//                   <button
//                     onClick={() => {
//                       setShowWelcomeScreen(false);
//                       setShowSignup(true);
//                       setValidationMessages([]);
//                     }}
//                     className="border border-black text-black py-3 px-8 rounded-full hover:bg-gray-100 transition"
//                   >
//                     Sign Up
//                   </button>
//                 </div>
//                 <div className="mt-8 text-gray-500">
//                   <p className="text-sm">
//                     By continuing, you agree to our{" "}
//                     <a href="#" className="text-blue-500 hover:underline">
//                       Terms of Service
//                     </a>{" "}
//                     and{" "}
//                     <a href="#" className="text-blue-500 hover:underline">
//                       Privacy Policy
//                     </a>
//                   </p>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <div className="w-full md:w-1/2 flex flex-col relative">
//               <div className="hidden md:flex items-center p-4">
//                 <button
//                   onClick={() => {
//                     setShowWelcomeScreen(true);
//                     setShowSignup(false);
//                     setValidationMessages([]);
//                   }}
//                   className="flex items-center gap-2 text-gray-600 hover:text-black transition"
//                 >
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="20"
//                     height="20"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     className="lucide lucide-arrow-left"
//                   >
//                     <path d="m12 19-7-7 7-7" />
//                     <path d="M19 12H5" />
//                   </svg>
//                   Back to welcome
//                 </button>
//               </div>

//               <div
//                 className={`w-full h-full flex flex-col justify-center items-center p-6 transition-all duration-500 ${
//                   showSignup ? "hidden md:hidden" : "block"
//                 }`}
//               >
//                 <div className="w-full max-w-md">
//                   <h1 className="text-3xl md:text-4xl font-bold mb-2">
//                     Hi there!
//                   </h1>
//                   <p className="mb-6 text-gray-500">Welcome to LMS platform</p>

//                   <button
//                     type="button"
//                     onClick={handleGoogleLogin}
//                     className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md py-3 text-gray-600 mb-4 hover:bg-gray-100 transition"
//                     disabled={loading}
//                   >
//                     <img
//                       src="https://www.svgrepo.com/show/355037/google.svg"
//                       alt="Google Icon"
//                       className="h-5 w-5"
//                     />
//                     Continue with Google
//                   </button>

//                   <div className="flex items-center my-4">
//                     <div className="flex-grow border-t border-gray-300"></div>
//                     <span className="mx-4 text-gray-400">or</span>
//                     <div className="flex-grow border-t border-gray-300"></div>
//                   </div>

//                   <form
//                     onSubmit={handleLoginSubmit((data) => {
//                       const errors = [];
//                       if (loginErrors.identifier) {
//                         errors.push(loginErrors.identifier.message);
//                       }
//                       if (loginErrors.password) {
//                         errors.push(loginErrors.password.message);
//                       }
//                       if (errors.length > 0) {
//                         setValidationMessages(
//                           errors.map((msg) => ({ text: msg, type: "error" }))
//                         );
//                         return;
//                       }
//                       HandleLogin(data);
//                     })}
//                   >
//                     <input
//                       type="text"
//                       placeholder="Username or Email"
//                       className={`w-full border ${
//                         loginErrors.identifier
//                           ? "border-red-500"
//                           : "border-gray-300"
//                       } rounded-md p-3 mb-2`}
//                       {...loginRegister("identifier", {
//                         required: "Username or Email is required",
//                         validate: (value) => {
//                           const usernameRegex = /^[A-Za-z0-9\s]+$/;
//                           const emailRegex =
//                             /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//                           if (
//                             !usernameRegex.test(value) &&
//                             !emailRegex.test(value)
//                           ) {
//                             return "Please enter a valid username (alphanumeric, 3-20 characters) or email";
//                           }
//                           if (
//                             usernameRegex.test(value) &&
//                             (value.length < 3 || value.length > 20)
//                           ) {
//                             return "Username must be between 3 and 20 characters";
//                           }
//                           return true;
//                         },
//                       })}
//                     />
//                     {loginErrors.identifier && (
//                       <p className="text-red-500 text-sm mb-2">
//                         {loginErrors.identifier.message}
//                       </p>
//                     )}

//                     <div className="relative mb-2">
//                       <input
//                         type={showLoginPassword ? "text" : "password"}
//                         placeholder="Password"
//                         className={`w-full border ${
//                           loginErrors.password
//                             ? "border-red-500"
//                             : "border-gray-300"
//                         } rounded-md p-3 pr-10`}
//                         {...loginRegister("password", {
//                           required: "Password is required",
//                           minLength: {
//                             value: 6,
//                             message: "Password must be at least 6 characters",
//                           },
//                         })}
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setShowLoginPassword(!showLoginPassword)}
//                         className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
//                         aria-label={
//                           showLoginPassword ? "Hide password" : "Show password"
//                         }
//                       >
//                         {showLoginPassword ? (
//                           <EyeOff size={20} />
//                         ) : (
//                           <Eye size={20} />
//                         )}
//                       </button>
//                     </div>
//                     {loginErrors.password && (
//                       <p className="text-red-500 text-sm mb-2">
//                         {loginErrors.password.message}
//                       </p>
//                     )}

//                     <div className="text-right text-sm mb-6">
//                       <a
//                         href="/forgotpassword"
//                         className="text-blue-500 hover:underline"
//                       >
//                         Forgot password?
//                       </a>
//                     </div>

//                     <button
//                       className="w-full bg-black text-white py-3 rounded-full mb-4 hover:opacity-90 transition"
//                       type="submit"
//                       disabled={loading}
//                     >
//                       Log In
//                     </button>
//                   </form>

//                   <p className="text-sm text-center mt-2">
//                     Don't have an account?{" "}
//                     <button
//                       className="text-blue-500 hover:underline"
//                       onClick={() => {
//                         setShowSignup(true);
//                         setValidationMessages([]);
//                       }}
//                     >
//                       Sign up
//                     </button>
//                   </p>
//                 </div>
//               </div>

//               <div
//                 className={`w-full h-full flex flex-col justify-center items-center p-6 transition-all duration-500 ${
//                   showSignup ? "block" : "hidden md:hidden"
//                 }`}
//               >
//                 <div className="w-full max-w-md">
//                   <h1 className="text-3xl md:text-4xl font-bold mb-2">
//                     Join Us!
//                   </h1>
//                   <p className="mb-6 text-gray-500">
//                     Create your LMS platform account
//                   </p>

//                   <button
//                     type="button"
//                     onClick={handleGoogleSignup}
//                     className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md py-3 text-gray-600 mb-4 hover:bg-gray-100 transition"
//                     disabled={loading}
//                   >
//                     <img
//                       src="https://www.svgrepo.com/show/355037/google.svg"
//                       alt="Google Icon"
//                       className="h-5 w-5"
//                     />
//                     Continue with Google
//                   </button>

//                   <div className="flex items-center my-4">
//                     <div className="flex-grow border-t border-gray-300"></div>
//                     <span className="mx-4 text-gray-400">or</span>
//                     <div className="flex-grow border-t border-gray-300"></div>
//                   </div>

//                   <form
//                     onSubmit={handleSignupSubmit((data) => {
//                       const errors = [];
//                       if (signupErrors.username) {
//                         errors.push(signupErrors.username.message);
//                       }
//                       if (signupErrors.email) {
//                         errors.push(signupErrors.email.message);
//                       }
//                       if (signupErrors.password) {
//                         errors.push(signupErrors.password.message);
//                       }
//                       if (errors.length > 0) {
//                         setValidationMessages(
//                           errors.map((msg) => ({ text: msg, type: "error" }))
//                         );
//                         return;
//                       }
//                       HandleRegister(data);
//                     })}
//                   >
//                     <input
//                       type="text"
//                       placeholder="User Name"
//                       className={`w-full border ${
//                         signupErrors.username
//                           ? "border-red-500"
//                           : "border-gray-300"
//                       } rounded-md p-3 mb-2`}
//                       {...signupRegister("username", {
//                         required: "Username is required",
//                         minLength: {
//                           value: 3,
//                           message: "Username must be at least 3 characters",
//                         },
//                         maxLength: {
//                           value: 20,
//                           message: "Username must be less than 20 characters",
//                         },
//                         pattern: {
//                           value: /^[A-Za-z0-9\s]+$/,
//                           message:
//                             "Username should not contain special characters",
//                         },
//                       })}
//                     />
//                     {signupErrors.username && (
//                       <p className="text-red-500 text-sm mb-2">
//                         {signupErrors.username.message}
//                       </p>
//                     )}

//                     <input
//                       type="email"
//                       placeholder="Email"
//                       className={`w-full border ${
//                         signupErrors.email
//                           ? "border-red-500"
//                           : "border-gray-300"
//                       } rounded-md p-3 mb-2`}
//                       {...signupRegister("email", {
//                         required: "Email is required",
//                         pattern: {
//                           value:
//                             /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
//                           message: "Invalid email address",
//                         },
//                       })}
//                     />
//                     {signupErrors.email && (
//                       <p className="text-red-500 text-sm mb-2">
//                         {signupErrors.email.message}
//                       </p>
//                     )}

//                     <div className="relative mb-6">
//                       <input
//                         type={showSignupPassword ? "text" : "password"}
//                         placeholder="Password"
//                         className={`w-full border ${
//                           signupErrors.password
//                             ? "border-red-500"
//                             : "border-gray-300"
//                         } rounded-md p-3 pr-10`}
//                         {...signupRegister("password", {
//                           required: "Password is required",
//                           minLength: {
//                             value: 6,
//                             message: "Password must be at least 6 characters",
//                           },
//                         })}
//                       />
//                       <button
//                         type="button"
//                         onClick={() =>
//                           setShowSignupPassword(!showSignupPassword)
//                         }
//                         className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
//                         aria-label={
//                           showSignupPassword ? "Hide password" : "Show password"
//                         }
//                       >
//                         {showSignupPassword ? (
//                           <EyeOff size={20} />
//                         ) : (
//                           <Eye size={20} />
//                         )}
//                       </button>
//                     </div>
//                     {signupErrors.password && (
//                       <p className="text-red-500 text-sm mb-2">
//                         {signupErrors.password.message}
//                       </p>
//                     )}

//                     <button
//                       className="w-full bg-black text-white py-3 rounded-full mb-4 hover:opacity-90 transition"
//                       type="submit"
//                       disabled={loading}
//                     >
//                       Sign Up
//                     </button>
//                   </form>

//                   <p className="text-sm text-center mt-2">
//                     Already have an account?{" "}
//                     <button
//                       className="text-blue-500 hover:underline"
//                       onClick={() => {
//                         setShowSignup(false);
//                         setValidationMessages([]);
//                       }}
//                     >
//                       Log in
//                     </button>
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Right Section */}
//           <div className="hidden md:block md:w-1/2">
//             {showSignup ? (
//               // Calendar for signup
//               <div className="bg-white p-8 flex justify-center items-center border-l h-full">
//                 <div className="rounded-xl w-full max-w-sm">
//                   <div className="flex items-center justify-between mb-4">
//                     <button
//                       onClick={prevMonth}
//                       className="text-lg font-semibold text-gray-600 hover:text-black"
//                     >
//                       &larr;
//                     </button>
//                     <h3 className="text-xl font-bold text-gray-800">
//                       {new Date(year, month).toLocaleString("default", {
//                         month: "long",
//                       })}{" "}
//                       {year}
//                     </h3>
//                     <button
//                       onClick={nextMonth}
//                       className="text-lg font-semibold text-gray-600 hover:text-black"
//                     >
//                       &rarr;
//                     </button>
//                   </div>

//                   {/* Weekdays */}
//                   <div className="grid grid-cols-7 gap-1 text-center text-sm">
//                     {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
//                       <div key={day} className="font-semibold text-gray-500">
//                         {day}
//                       </div>
//                     ))}

//                     {Array(startDay)
//                       .fill("")
//                       .map((_, i) => (
//                         <div key={"empty-" + i}></div>
//                       ))}

//                     {days.map((date) => {
//                       const formatted = date.toISOString().split("T")[0];
//                       const isToday = formatted === todayStr;
//                       const isPast = date < today;

//                       let className =
//                         "w-10 h-10 flex items-center justify-center rounded-md transition";

//                       if (isMonthFull) {
//                         if (isToday) {
//                           className += " bg-gray-300 text-gray-500";
//                         } else {
//                           className += " text-gray-500";
//                         }
//                       } else {
//                         if (isToday) {
//                           className += " bg-green-600 text-white font-semibold";
//                         } else if (isPast) {
//                           className += " text-gray-500";
//                         } else {
//                           className += " text-green-600 font-semibold";
//                         }
//                       }

//                       return (
//                         <div key={formatted} className={className}>
//                           {date.getDate()}
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               // Sliding images for login and welcome
//               <div
//                 className="bg-cover bg-center h-full"
//                 style={{
//                   backgroundImage: `url(${images[currentImageIndex].url})`,
//                 }}
//               >
//                 <div className="flex flex-col justify-between h-full p-6 text-white">
//                   <div className="flex justify-end gap-4">
//                     <button
//                       className="border px-4 py-1 rounded-full text-sm hover:bg-white hover:text-black transition"
//                       onClick={() => {
//                         setShowWelcomeScreen(false);
//                         setShowSignup(true);
//                         setValidationMessages([]);
//                       }}
//                     >
//                       Sign Up
//                     </button>
//                     <button className="px-4 py-1 rounded-full text-sm hover:bg-white hover:text-black transition">
//                       Join Us
//                     </button>
//                   </div>
//                   <div>
//                     <h2
//                       className="text-xl md:text-2xl font-semibold max-w-xs mb-2 transition-opacity duration-700"
//                       dangerouslySetInnerHTML={{
//                         __html: images[currentImageIndex].text,
//                       }}
//                     />
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {!showWelcomeScreen && (
//           <div className="flex justify-between items-center bg-white p-4 shadow-sm md:hidden">
//             <button
//               onClick={() => {
//                 setShowWelcomeScreen(true);
//                 setShowSignup(false);
//                 setValidationMessages([]);
//               }}
//               className="font-bold text-xl flex items-center gap-2"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 width="24"
//                 height="24"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 className="lucide lucide-arrow-left"
//               >
//                 <path d="m12 19-7-7 7-7" />
//                 <path d="M19 12H5" />
//               </svg>
//               LMS Platform
//             </button>
//             <div className="space-x-2">
//               <button
//                 className={`px-4 py-1.5 rounded-full text-sm ${
//                   !showSignup ? "bg-black text-white" : "bg-gray-200"
//                 }`}
//                 onClick={() => {
//                   setShowSignup(false);
//                   setValidationMessages([]);
//                 }}
//               >
//                 Login
//               </button>
//               <button
//                 className={`px-4 py-1.5 rounded-full text-sm ${
//                   showSignup ? "bg-black text-white" : "bg-gray-200"
//                 }`}
//                 onClick={() => {
//                   setShowSignup(true);
//                   setValidationMessages([]);
//                 }}
//               >
//                 Sign Up
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // Wrap the Login component with GoogleOAuthProvider
// export default function LoginWithGoogle() {
//   return (
//     <GoogleOAuthProvider clientId="632232285504-onkj7hor5fqhf54u57re8rcsf119g1ll.apps.googleusercontent.com">
//       <Login />
//     </GoogleOAuthProvider>
//   );
// }

















































import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  AuthLogin,
  AuthRegister,
  AuthGoogleLogin,
  AuthGoogleSignup,
  baseUrl1,
} from "../service/api";
import { useNavigate } from "react-router";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";

const API_URL = `${baseUrl1}`; 

const getDaysInMonth = (year, month) => {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

const Login = () => {
  const navigate = useNavigate();
  const [showSignup, setShowSignup] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [validationMessages, setValidationMessages] = useState([]);

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [signupData, setSignupData] = useState([]);

  const currentMonthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const days = getDaysInMonth(year, month);
  const startDay = new Date(year, month, 1).getDay();
  const todayStr = today.toISOString().split("T")[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/signuplimit`);
        const data = await res.json();
        setSignupData(data);
      } catch (err) {
        console.error("Failed to fetch signup data", err);
      }
    };

    fetchData();
  }, []);

  const monthData = signupData.find((m) => m.month === currentMonthKey);
  const isMonthFull = monthData?.count >= 100;

  const nextMonth = () => {
    setMonth((prev) => {
      if (prev === 11) {
        setYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const prevMonth = () => {
    setMonth((prev) => {
      if (prev === 0) {
        setYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

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
  } = useForm({ mode: "onChange" });

  const {
    register: signupRegister,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
    watch,
  } = useForm({ mode: "onChange" });

  // Watch username for Google signup
  const username = watch("username");

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

  // Clear validation messages when switching screens
  useEffect(() => {
    setValidationMessages([]);
  }, [showSignup, showWelcomeScreen]);

  // Function to close a specific validation message
  const closeValidationMessage = (index) => {
    setValidationMessages((prev) => prev.filter((_, i) => i !== index));
  };

  const HandleLogin = async (data) => {
    setLoading(true);
    setValidationMessages([]);
    try {
      const res = await AuthLogin(data);
      localStorage.setItem("loginData", JSON.stringify(res));
      setValidationMessages((prev) => [
        ...prev,
        { text: "Successfully logged in", type: "success" },
      ]);
      setTimeout(() => {
        if (res.user.role === "Mentor") {
          navigate("/admin");
          window.location.reload();
        } else if (res.user.role === "Student") {
          navigate("/student");
          window.location.reload();
        }
      }, 1000);
    } catch (error) {
      const errorMessages = Array.isArray(error.message)
        ? error.message
        : [error.message || "Login failed. Please check your credentials."];
      setValidationMessages((prev) => [
        ...prev,
        ...errorMessages.map((msg) => ({ text: msg, type: "error" })),
      ]);
      localStorage.removeItem("loginData");
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  };

  const HandleRegister = async (data) => {
    setLoading(true);
    setValidationMessages([]);
    try {
      const res = await AuthRegister(data);
      setValidationMessages((prev) => [
        ...prev,
        { text: "Successfully signed up", type: "success" },
      ]);
      setTimeout(() => {
        setShowWelcomeScreen(true);
        setShowSignup(false);
      }, 1000);
    } catch (error) {
      const errorMessages = Array.isArray(error.message)
        ? error.message
        : [error.message || "Signup failed. Please try again."];
      setValidationMessages((prev) => [
        ...prev,
        ...errorMessages.map((msg) => ({ text: msg, type: "error" })),
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Login (auth-code flow)
  const handleGoogleLogin = useGoogleLogin({
    flow: "auth-code",
    redirect_uri: window.location.origin,
    onSuccess: async (codeResponse) => {
      setLoading(true);
      setValidationMessages([]);
      try {
        // Try to sign up with the Google code
        const res = await AuthGoogleSignup({ code: codeResponse.code });

        // Check if the response contains a user object and the approval status
        if (res && res.user && !res.user.isApproved) {
          // If the user is not approved, show a message and redirect them to the login page
          setValidationMessages((prev) => [
            ...prev,
            {
              text: "Account successfully created. Your account is pending approval.",
              type: "info",
            },
          ]);
          localStorage.setItem("signupData", JSON.stringify(res)); // Store signup data temporarily
          navigate("/login"); // Redirect to login page
        } else {
          // If the user is approved, log them in
          localStorage.setItem("loginData", JSON.stringify(res));
          setValidationMessages((prev) => [
            ...prev,
            {
              text: "Successfully signed up and logged in with Google!",
              type: "success",
            },
          ]);
          setTimeout(() => {
            if (res.user.role === "Mentor") {
              navigate("/admin");
              window.location.reload();
            } else if (res.user.role === "Student") {
              navigate("/student");
              window.location.reload();
            }
          }, 1000);
        }
      } catch (error) {
        const errorMessages = Array.isArray(error.message)
          ? error.message
          : [error.message || "Google signup failed. Please try again."];
        setValidationMessages((prev) => [
          ...prev,
          ...errorMessages.map((msg) => ({ text: msg, type: "error" })),
        ]);
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setValidationMessages((prev) => [
        ...prev,
        { text: "Google signup failed. Please try again.", type: "error" },
      ]);
    },
  });

  // Handle Google Signup (auth-code flow)
  const handleGoogleSignup = useGoogleLogin({
    flow: "auth-code",
    redirect_uri: window.location.origin,
    onSuccess: async (codeResponse) => {
      setLoading(true);
      setValidationMessages([]);
      try {
        // Try to sign up with the Google code
        const res = await AuthGoogleSignup({ code: codeResponse.code });

        // Check if the response contains a user object and the approval status
        if (res && res.user && !res.user.isApproved) {
          // If the user is not approved, show a message and redirect them to the login page
          setValidationMessages((prev) => [
            ...prev,
            {
              text: "Account successfully created. Your account is pending approval.",
              type: "info",
            },
          ]);
          localStorage.setItem("signupData", JSON.stringify(res)); // Store signup data temporarily
          navigate("/login"); // Redirect to login page
        } else {
          // If the user is approved, log them in
          localStorage.setItem("loginData", JSON.stringify(res));
          setValidationMessages((prev) => [
            ...prev,
            {
              text: "Successfully signed up and logged in with Google!",
              type: "success",
            },
          ]);
          setTimeout(() => {
            if (res.user.role === "Mentor") {
              navigate("/admin");
              window.location.reload();
            } else if (res.user.role === "Student") {
              navigate("/student");
              window.location.reload();
            }
          }, 1000);
        }
      } catch (error) {
        const errorMessages = Array.isArray(error.message)
          ? error.message
          : [error.message || "Google signup failed. Please try again."];
        setValidationMessages((prev) => [
          ...prev,
          ...errorMessages.map((msg) => ({ text: msg, type: "error" })),
        ]);
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setValidationMessages((prev) => [
        ...prev,
        { text: "Google signup failed. Please try again.", type: "error" },
      ]);
    },
  });

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {/* Mobile navigation - now fixed at top */}
      {!showWelcomeScreen && (
        <div className="flex justify-between items-center bg-white p-4 shadow-sm md:hidden w-full fixed top-0 left-0 z-40">
          <button
            onClick={() => {
              setShowWelcomeScreen(true);
              setShowSignup(false);
              setValidationMessages([]);
            }}
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
              onClick={() => {
                setShowSignup(false);
                setValidationMessages([]);
              }}
            >
              Login
            </button>
            <button
              className={`px-4 py-1.5 rounded-full text-sm ${
                showSignup ? "bg-black text-white" : "bg-gray-200"
              }`}
              onClick={() => {
                setShowSignup(true);
                setValidationMessages([]);
              }}
            >
              Sign Up
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <Loader className="h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-2 text-sm font-medium">Authenticating...</p>
          </div>
        </div>
      )}
      {validationMessages.length > 0 && (
        <div className="fixed top-16 md:top-4 right-4 space-y-2 z-50" aria-live="polite">
          {validationMessages.map((message, index) => (
            <div
              key={index}
             className={`border-l-4 p-4 rounded shadow-md flex justify-between items-center ${
          message.type === "success"
            ? "bg-green-100 border-green-500 text-green-700"
            : message.type === "info"
            ? "bg-yellow-100 border-yellow-500 text-yellow-700"
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
              : message.type === "info"
              ? "text-yellow-700 hover:text-yellow-900"
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
      
      <div className="w-full max-w-6xl min-h-screen md:min-h-0 md:h-5/6 bg-white shadow-2xl rounded-none md:rounded-2xl overflow-hidden pt-16 md:pt-0">
        <div className="flex flex-col md:flex-row h-full">
          {showWelcomeScreen ? (
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
                      setValidationMessages([]);
                    }}
                    className="bg-black text-white py-3 px-8 rounded-full hover:opacity-90 transition"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      setShowWelcomeScreen(false);
                      setShowSignup(true);
                      setValidationMessages([]);
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
          ) : (
            <div className="w-full md:w-1/2 flex flex-col relative">
              <div className="hidden md:flex items-center p-4">
                <button
                  onClick={() => {
                    setShowWelcomeScreen(true);
                    setShowSignup(false);
                    setValidationMessages([]);
                  }}
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

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md py-3 text-gray-600 mb-4 hover:bg-gray-100 transition"
                    disabled={loading}
                  >
                    <img
                      src="https://www.svgrepo.com/show/355037/google.svg"
                      alt="Google Icon"
                      className="h-5 w-5"
                    />
                    Continue with Google
                  </button>

                  <div className="flex items-center my-4">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="mx-4 text-gray-400">or</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                  </div>

                  <form
                    onSubmit={handleLoginSubmit((data) => {
                      const errors = [];
                      if (loginErrors.identifier) {
                        errors.push(loginErrors.identifier.message);
                      }
                      if (loginErrors.password) {
                        errors.push(loginErrors.password.message);
                      }
                      if (errors.length > 0) {
                        setValidationMessages(
                          errors.map((msg) => ({ text: msg, type: "error" }))
                        );
                        return;
                      }
                      HandleLogin(data);
                    })}
                  >
                    <input
                      type="text"
                      placeholder="Username or Email"
                      className={`w-full border ${
                        loginErrors.identifier
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md p-3 mb-2`}
                      {...loginRegister("identifier", {
                        required: "Username or Email is required",
                        validate: (value) => {
                          const usernameRegex = /^[A-Za-z0-9\s]+$/;
                          const emailRegex =
                            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                          if (
                            !usernameRegex.test(value) &&
                            !emailRegex.test(value)
                          ) {
                            return "Please enter a valid username (alphanumeric, 3-20 characters) or email";
                          }
                          if (
                            usernameRegex.test(value) &&
                            (value.length < 3 || value.length > 20)
                          ) {
                            return "Username must be between 3 and 20 characters";
                          }
                          return true;
                        },
                      })}
                    />
                    {loginErrors.identifier && (
                      <p className="text-red-500 text-sm mb-2">
                        {loginErrors.identifier.message}
                      </p>
                    )}

                    <div className="relative mb-2">
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="Password"
                        className={`w-full border ${
                          loginErrors.password
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md p-3 pr-10`}
                        {...loginRegister("password", {
                          required: "Password is required",
                          minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters",
                          },
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
                        aria-label={
                          showLoginPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showLoginPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                    {loginErrors.password && (
                      <p className="text-red-500 text-sm mb-2">
                        {loginErrors.password.message}
                      </p>
                    )}

                    <div className="text-right text-sm mb-6">
                      <a
                        href="/forgotpassword"
                        className="text-blue-500 hover:underline"
                      >
                        Forgot password?
                      </a>
                    </div>

                    <button
                      className="w-full bg-black text-white py-3 rounded-full mb-4 hover:opacity-90 transition"
                      type="submit"
                      disabled={loading}
                    >
                      Log In
                    </button>
                  </form>

                  <p className="text-sm text-center mt-2">
                    Don't have an account?{" "}
                    <button
                      className="text-blue-500 hover:underline"
                      onClick={() => {
                        setShowSignup(true);
                        setValidationMessages([]);
                      }}
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

                  <button
                    type="button"
                    onClick={handleGoogleSignup}
                    className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md py-3 text-gray-600 mb-4 hover:bg-gray-100 transition"
                    disabled={loading}
                  >
                    <img
                      src="https://www.svgrepo.com/show/355037/google.svg"
                      alt="Google Icon"
                      className="h-5 w-5"
                    />
                    Continue with Google
                  </button>

                  <div className="flex items-center my-4">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="mx-4 text-gray-400">or</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                  </div>

                  <form
                    onSubmit={handleSignupSubmit((data) => {
                      const errors = [];
                      if (signupErrors.username) {
                        errors.push(signupErrors.username.message);
                      }
                      if (signupErrors.email) {
                        errors.push(signupErrors.email.message);
                      }
                      if (signupErrors.password) {
                        errors.push(signupErrors.password.message);
                      }
                      if (errors.length > 0) {
                        setValidationMessages(
                          errors.map((msg) => ({ text: msg, type: "error" }))
                        );
                        return;
                      }
                      HandleRegister(data);
                    })}
                  >
                    <input
                      type="text"
                      placeholder="User Name"
                      className={`w-full border ${
                        signupErrors.username
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md p-3 mb-2`}
                      {...signupRegister("username", {
                        required: "Username is required",
                        minLength: {
                          value: 3,
                          message: "Username must be at least 3 characters",
                        },
                        maxLength: {
                          value: 20,
                          message: "Username must be less than 20 characters",
                        },
                        pattern: {
                          value: /^[A-Za-z0-9\s]+$/,
                          message:
                            "Username should not contain special characters",
                        },
                      })}
                    />
                    {signupErrors.username && (
                      <p className="text-red-500 text-sm mb-2">
                        {signupErrors.username.message}
                      </p>
                    )}

                    <input
                      type="email"
                      placeholder="Email"
                      className={`w-full border ${
                        signupErrors.email
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md p-3 mb-2`}
                      {...signupRegister("email", {
                        required: "Email is required",
                        pattern: {
                          value:
                            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                          message: "Invalid email address",
                        },
                      })}
                    />
                    {signupErrors.email && (
                      <p className="text-red-500 text-sm mb-2">
                        {signupErrors.email.message}
                      </p>
                    )}

                    <div className="relative mb-6">
                      <input
                        type={showSignupPassword ? "text" : "password"}
                        placeholder="Password"
                        className={`w-full border ${
                          signupErrors.password
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md p-3 pr-10`}
                        {...signupRegister("password", {
                          required: "Password is required",
                          minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters",
                          },
                        })}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowSignupPassword(!showSignupPassword)
                        }
                        className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
                        aria-label={
                          showSignupPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showSignupPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                    {signupErrors.password && (
                      <p className="text-red-500 text-sm mb-2">
                        {signupErrors.password.message}
                      </p>
                    )}

                    <button
                      className="w-full bg-black text-white py-3 rounded-full mb-4 hover:opacity-90 transition"
                      type="submit"
                      disabled={loading}
                    >
                      Sign Up
                    </button>
                  </form>

                  <p className="text-sm text-center mt-2">
                    Already have an account?{" "}
                    <button
                      className="text-blue-500 hover:underline"
                      onClick={() => {
                        setShowSignup(false);
                        setValidationMessages([]);
                      }}
                    >
                      Log in
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Right Section */}
          <div className="hidden md:block md:w-1/2">
            {showSignup ? (
              // Calendar for signup
              <div className="bg-white p-8 flex justify-center items-center border-l h-full">
                <div className="rounded-xl w-full max-w-sm">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={prevMonth}
                      className="text-lg font-semibold text-gray-600 hover:text-black"
                    >
                      &larr;
                    </button>
                    <h3 className="text-xl font-bold text-gray-800">
                      {new Date(year, month).toLocaleString("default", {
                        month: "long",
                      })}{" "}
                      {year}
                    </h3>
                    <button
                      onClick={nextMonth}
                      className="text-lg font-semibold text-gray-600 hover:text-black"
                    >
                      &rarr;
                    </button>
                  </div>

                  {/* Weekdays */}
                  <div className="grid grid-cols-7 gap-1 text-center text-sm">
                    {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                      <div key={day} className="font-semibold text-gray-500">
                        {day}
                      </div>
                    ))}

                    {Array(startDay)
                      .fill("")
                      .map((_, i) => (
                        <div key={"empty-" + i}></div>
                      ))}

                    {days.map((date) => {
                      const formatted = date.toISOString().split("T")[0];
                      const isToday = formatted === todayStr;
                      const isPast = date < today;

                      let className =
                        "w-10 h-10 flex items-center justify-center rounded-md transition";

                      if (isMonthFull) {
                        if (isToday) {
                          className += " bg-gray-300 text-gray-500";
                        } else {
                          className += " text-gray-500";
                        }
                      } else {
                        if (isToday) {
                          className += " bg-green-600 text-white font-semibold";
                        } else if (isPast) {
                          className += " text-gray-500";
                        } else {
                          className += " text-green-600 font-semibold";
                        }
                      }

                      return (
                        <div key={formatted} className={className}>
                          {date.getDate()}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              // Sliding images for login and welcome
              <div
                className="bg-cover bg-center h-full"
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
                        setValidationMessages([]);
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrap the Login component with GoogleOAuthProvider
export default function LoginWithGoogle() {
  return (
    <GoogleOAuthProvider clientId="632232285504-onkj7hor5fqhf54u57re8rcsf119g1ll.apps.googleusercontent.com">
      <Login />
    </GoogleOAuthProvider>
  );
}
