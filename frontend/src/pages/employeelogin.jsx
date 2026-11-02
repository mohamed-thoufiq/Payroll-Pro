import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";
import { API_URL } from "../config/api.js";

const QUICK_ROLES = [
  { role: "Employee", email: "rizwan@gmail.com", isEmployee: true, color: "hover:bg-primary/10 hover:border-primary text-primary bg-primary/5 border-primary/20" },
];

const EmployeeLogin = () => {
  const [email, setEmail] = useState("rizwan@gmail.com");
  const [password, setPassword] = useState("12345678");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signingInRole, setSigningInRole] = useState(null);
  const [isWakingServer, setIsWakingServer] = useState(false);

  const navigate = useNavigate();
  const { employeeLogin } = useContext(AuthContext);

  // 🚀 Pre-warm Render backend on initial visit
  useEffect(() => {
    fetch(`${API_URL}/`).catch(() => {});
  }, []);

  // ⏳ Detect cold-start if request takes longer than 2.5s
  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => setIsWakingServer(true), 2500);
    } else {
      setIsWakingServer(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      await employeeLogin(email, password);
    } catch (err) {
      setError(err.message || "Login failed");
      setLoading(false);
    }
  };

  const handleQuickLogin = async (acc) => {
    setEmail(acc.email);
    setPassword("12345678");
    setError("");
    setLoading(true);
    setSigningInRole(acc.role);

    try {
      await employeeLogin(acc.email, "12345678");
    } catch (err) {
      setError(err.message || "Employee login failed");
      setLoading(false);
      setSigningInRole(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="h-screen max-h-screen overflow-hidden flex w-full relative bg-white"
    >
      {/* LEFT: LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-white px-8 lg:px-16 py-8 h-full overflow-y-auto lg:overflow-hidden relative">
        <button
          onClick={() => navigate("/login")}
          className="absolute top-5 left-6 flex items-center gap-2
                     px-3.5 py-1.5 rounded-full
                     bg-indigo-50 text-indigo-700 font-semibold
                     shadow-sm
                     transition-all duration-300 ease-out
                     hover:bg-indigo-100 hover:-translate-y-0.5 hover:shadow-md
                     active:scale-95 text-xs"
        >
          ← Admin Portal
        </button>

        <div className="w-full max-w-sm space-y-4">
          {/* Header */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <img src={logo} alt="PayrollPro Logo" className="w-12 h-12 object-contain" />
              <span className="text-2xl font-bold tracking-tight text-gray-900">
                PayrollPro
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">
              Employee Portal
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Access your payslips, leave requests, and attendance records.
            </p>
          </div>

          {/* Quick 1-Click Role Login Buttons */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Instant demo access
              </span>
              <span className="text-[11px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200 tabular-nums">
                pw: 12345678
              </span>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin(QUICK_ROLES[0])}
              className={`w-full py-2 px-3 rounded-lg border border-primary/30 text-center font-medium text-xs transition-all active:scale-[0.98] shadow-sm bg-blue-50/70 text-primary hover:bg-blue-100 ${signingInRole === "Employee" ? 'ring-2 ring-primary ring-offset-1 font-semibold' : ''
                }`}
              title="Instant login as Employee"
            >
              {signingInRole === "Employee" ? "Signing in as Employee..." : "1-Click sign in as Employee"}
            </button>
          </div>

          {/* Cold-start Alert */}
          {isWakingServer && (
            <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 text-xs rounded-xl flex items-start gap-2.5 animate-pulse shadow-sm">
              <span className="text-base leading-none">⏳</span>
              <div>
                <span className="font-semibold block">Connecting to cloud server...</span>
                <p className="text-[11px] text-amber-700 mt-0.5">Free-tier backend sleeps when idle. Waking up the container takes ~20–30s.</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-2.5 rounded-r-lg">
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-xs"
                placeholder="employee@payroll.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-xs"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-white bg-primary hover:bg-primary-hover font-bold shadow-md shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70 text-xs"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {signingInRole ? `Signing in as ${signingInRole}...` : 'Signing in...'}
                </span>
              ) : "Sign In to Employee Portal"}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center">
            Want to login with administrative privileges?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-indigo-600 hover:text-indigo-700 font-bold underline"
            >
              Go to Admin Login
            </button>
          </p>
        </div>
      </div>

      {/* RIGHT: IMAGE */}
      <div className="hidden lg:flex w-1/2 bg-indigo-900 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1497215728101-856f4ea42174"
          alt="Office"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900 via-indigo-900/40 to-transparent"></div>

        <div className="relative z-10 flex flex-col justify-end pb-24 px-12">
          <div className="border-l-4 border-yellow-400 pl-6">
            <h3 className="text-4xl font-bold text-white">
              Employee Self-Service
            </h3>
            <p className="text-indigo-100 mt-2">
              Payslips, attendance, leave & profile — all in one place.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EmployeeLogin;
