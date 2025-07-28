import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import { useAuth } from "../../context/AuthContext";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleAuth = (token, user) => {
    login(token, user);
    // Navigate to dashboard after successful authentication
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Graphics/Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full">
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                <pattern
                  id="grid"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 20 0 L 0 0 0 20"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center h-full w-full p-12 text-white">
          <div className="text-center w-full max-w-lg">
            {/* Minimalist Logo */}
            <div className="mb-16">
              <div className="w-20 h-20 mx-auto bg-white/10 rounded-none flex items-center justify-center backdrop-blur-sm border border-white/20">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>

            {/* Minimalist Title */}
            <div className="mb-12">
              <h1 className="text-5xl font-light text-white mb-6 tracking-tight">
                Peta Talenta
              </h1>
              <div className="w-16 h-px bg-white/30 mx-auto mb-8"></div>
            </div>

            {/* Subtitle */}
            <p className="text-lg text-white/70 mb-20 font-light leading-relaxed">
              AI-Powered Talent Mapping Platform
            </p>

            {/* Minimalist Features */}
            <div className="space-y-6 text-left max-w-sm">
              <div className="flex items-center space-x-4">
                <div className="w-1 h-8 bg-white/30"></div>
                <span className="text-white/80 font-light">Smart Assessment</span>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-1 h-8 bg-white/30"></div>
                <span className="text-white/80 font-light">AI-Powered Insights</span>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-1 h-8 bg-white/30"></div>
                <span className="text-white/80 font-light">Career Mapping</span>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Border Effect */}
        <div className="absolute inset-0 border-r border-white/10"></div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          {/* Mobile Header (visible only on small screens) */}
          <div className="lg:hidden text-center mb-12">
            <h1 className="text-3xl font-light text-gray-900 mb-3 tracking-tight">
              Peta Talenta
            </h1>
            <p className="text-gray-500 font-light">AI-Powered Talent Mapping Platform</p>
          </div>

          {/* Minimalist Tab Navigation */}
          <div className="flex mb-12 border-b border-gray-200">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-4 text-sm font-light transition-colors duration-200 ${
                isLogin
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-4 text-sm font-light transition-colors duration-200 ${
                !isLogin
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form Content */}
          <div>
            {isLogin ? (
              <Login onLogin={handleAuth} />
            ) : (
              <Register onRegister={handleAuth} />
            )}
          </div>

          {/* Minimalist Footer */}
          <div className="text-center mt-12">
            <p className="text-xs text-gray-400 font-light">
              © 2025 Peta Talenta. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
