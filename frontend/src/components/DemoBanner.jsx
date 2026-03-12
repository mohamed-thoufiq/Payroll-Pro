import React, { useState } from "react";

// 1. Centralized configuration makes adding new roles effortless
const DEMO_CONFIG = {
  admin: {
    email: "syed@gmail.com",
    password: "12345678",
    positionClass: "right-4 lg:right-6", 
  },
  employee: {
    email: "zeeshan@gmail.com",
    password: "12345678",
    positionClass: "left-4 lg:left-6",
  },
};

export default function DemoBanner({ role = "employee" }) {
  const [isVisible, setIsVisible] = useState(true);
  const [copiedField, setCopiedField] = useState(null);

  // Fallback to employee if an invalid role is passed
  const config = DEMO_CONFIG[role] || DEMO_CONFIG.employee;

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-20 ${config.positionClass} z-50 bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg w-80 transition-all duration-300`}
    >
      {/* Header & Close Button */}
      <div className="flex justify-between items-start mb-2">
        <p className="font-semibold text-blue-800">Demo Access</p>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-blue-400 hover:text-blue-700 transition-colors p-1"
          aria-label="Close banner"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <p className="text-blue-700 text-xs mb-3">
        Server may take <span className="font-semibold">30–40 seconds</span> to spin up on the first request.
      </p>

      {/* Credentials Section */}
      <div className="space-y-2 text-sm text-blue-900 bg-white/50 p-2 rounded border border-blue-100">
        
        {/* Email Row */}
        <div className="flex justify-between items-center">
          <p>
            <span className="font-semibold mr-1">Email:</span> 
            {config.email}
          </p>
          <button
            onClick={() => handleCopy(config.email, 'email')}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded transition-colors"
          >
            {copiedField === 'email' ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* Password Row */}
        <div className="flex justify-between items-center">
          <p>
            <span className="font-semibold mr-1">Password:</span> 
            {config.password}
          </p>
          <button
            onClick={() => handleCopy(config.password, 'password')}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded transition-colors"
          >
             {copiedField === 'password' ? "Copied!" : "Copy"}
          </button>
        </div>

      </div>
    </div>
  );
}