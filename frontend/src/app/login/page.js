"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const validateInputs = () => {
    const newErrors = {};

    // Email validation
    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();

    // Validate inputs before proceeding
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate login process
      setTimeout(() => {
        setIsLoading(false);
        router.push("/profile-setup/welcome");
      }, 1500);
    } catch (error) {
      console.error("Login failed:", error);
      setErrors({ general: "An unexpected error occurred. Please try again." });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-black bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
      <div className="absolute top-40 right-32 w-1 h-1 bg-cyan-400 rounded-full animate-bounce animation-delay-1000"></div>
      <div className="absolute bottom-32 left-40 w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce animation-delay-2000"></div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="flex items-center justify-center">
                {/* Left Book */}
                <div className="relative">
                  <div className="w-12 h-16 bg-gradient-to-r from-blue-600 to-blue-700 transform -skew-y-3 rounded-tl-lg rounded-bl-lg shadow-lg"></div>
                  <div className="absolute top-0 left-0 w-12 h-3 bg-gradient-to-r from-cyan-300 to-cyan-400 rounded-tl-lg"></div>
                  <div className="absolute top-3 left-0 w-12 h-1 bg-gradient-to-r from-cyan-200 to-cyan-300 opacity-80"></div>
                  <div className="absolute top-5 left-0 w-12 h-1 bg-gradient-to-r from-cyan-200 to-cyan-300 opacity-60"></div>
                </div>

                {/* Right Book */}
                <div className="relative -ml-1">
                  <div className="w-12 h-16 bg-gradient-to-l from-blue-600 to-blue-700 transform skew-y-3 rounded-tr-lg rounded-br-lg shadow-lg"></div>
                  <div className="absolute top-0 right-0 w-12 h-3 bg-gradient-to-l from-cyan-300 to-cyan-400 rounded-tr-lg"></div>
                  <div className="absolute top-3 right-0 w-12 h-1 bg-gradient-to-l from-cyan-200 to-cyan-300 opacity-80"></div>
                  <div className="absolute top-5 right-0 w-12 h-1 bg-gradient-to-l from-cyan-200 to-cyan-300 opacity-60"></div>
                </div>

                {/* Light Bulb */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="w-6 h-8 bg-white rounded-full shadow-lg border-2 border-gray-200"></div>
                  <div className="w-4 h-2 bg-gradient-to-b from-cyan-300 to-cyan-400 mx-auto rounded-b-full"></div>
                  <div className="w-3 h-1 bg-cyan-400 mx-auto"></div>
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-800 mb-2 tracking-tight">
            EDGUARD
          </h1>
        </div>

        {/* Login Form */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 animate-slide-up">
          <div className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="text-red-500 text-sm text-center">
                {errors.general}
              </div>
            )}

            {/* Email Input */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 border ${
                    errors.email ? "border-red-500" : "border-gray-200"
                  } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white hover:border-gray-300`}
                  placeholder="your.email@university.edu"
                  required
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-12 pr-12 py-3 border ${
                    errors.password ? "border-red-500" : "border-gray-200"
                  } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white hover:border-gray-300`}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Login to EDGUARD</span>
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}