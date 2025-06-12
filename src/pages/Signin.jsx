import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase"; 

const Signin = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [focusedField, setFocusedField] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField("");
  };

  const handleSignin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      // Sign in user with Firebase auth
      await signInWithEmailAndPassword(auth, form.email, form.password);
      console.log("Signed in successfully!");
      // Navigate to dashboard after successful signin
      navigate("/dashboard");
    } catch (err) {
      // Handle different Firebase auth errors
      let errorMessage = "Failed to sign in. Please try again.";
      
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = "No account found with this email address.";
          break;
        case 'auth/wrong-password':
          errorMessage = "Incorrect password. Please try again.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Please enter a valid email address.";
          break;
        case 'auth/user-disabled':
          errorMessage = "This account has been disabled.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
        default:
          errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center px-6">
      {/* Floating Elements */}
      <div className="absolute w-96 h-96 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full blur-3xl opacity-30 top-20 right-20 animate-pulse"></div>
      <div className="absolute w-64 h-64 bg-gradient-to-br from-purple-50 to-pink-50 rounded-full blur-3xl opacity-20 bottom-32 left-16"></div>

      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-light text-gray-900 mb-3 tracking-wide">
            Welcome back
          </h1>
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto"></div>
        </div>

        {/* Form Container */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-2xl shadow-gray-900/5 border border-white/20">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50/50 border border-red-100 rounded-2xl">
              <p className="text-red-600 text-sm font-light">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignin} className="space-y-8">
            {/* Email Field */}
            <div className="relative">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onFocus={() => handleFocus("email")}
                onBlur={handleBlur}
                className="w-full px-0 py-4 text-gray-900 bg-transparent border-0 border-b border-gray-200 focus:border-gray-400 focus:outline-none transition-all duration-500 placeholder-transparent peer"
                placeholder="Email address"
                id="email"
                required
              />
              <label 
                htmlFor="email"
                className={`absolute left-0 transition-all duration-300 pointer-events-none ${
                  focusedField === "email" || form.email 
                    ? "-top-6 text-xs text-gray-500" 
                    : "top-4 text-gray-400"
                }`}
              >
                Email address
              </label>
              <div className={`h-px bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ${
                focusedField === "email" ? "w-full" : "w-0"
              }`}></div>
            </div>

            {/* Password Field */}
            <div className="relative">
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                onFocus={() => handleFocus("password")}
                onBlur={handleBlur}
                className="w-full px-0 py-4 text-gray-900 bg-transparent border-0 border-b border-gray-200 focus:border-gray-400 focus:outline-none transition-all duration-500 placeholder-transparent peer"
                placeholder="Password"
                id="password"
                required
              />
              <label 
                htmlFor="password"
                className={`absolute left-0 transition-all duration-300 pointer-events-none ${
                  focusedField === "password" || form.password 
                    ? "-top-6 text-xs text-gray-500" 
                    : "top-4 text-gray-400"
                }`}
              >
                Password
              </label>
              <div className={`h-px bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ${
                focusedField === "password" ? "w-full" : "w-0"
              }`}></div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group w-full py-4 mt-8 bg-gradient-to-r from-gray-900 to-gray-800 text-white font-light rounded-2xl transition-all duration-500 hover:shadow-xl hover:shadow-gray-900/25 hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <>
                  <span className="relative z-10">Continue</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                  <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20">
                    Continue
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 font-light">
              New to Clarity?{" "}
              <Link 
                to="/signup" 
                className="text-gray-900 hover:text-blue-600 transition-colors duration-300 font-normal relative group"
              >
                Create account
                <span className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom Accent */}
        <div className="flex justify-center mt-8">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
            <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;