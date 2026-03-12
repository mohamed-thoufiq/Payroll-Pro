import React from 'react';
import { Link } from 'react-router-dom';
import { MdSecurity, MdArrowBack, MdLockPerson } from 'react-icons/md';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      
      {/* Main Glass-Slab Container */}
      <div className="relative overflow-hidden max-w-md w-full rounded-3xl p-0.5 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl">
        
        <div className="bg-white/95 backdrop-blur-md rounded-[22px] p-8 md:p-12 text-center relative">
          
          {/* Right-side Accent Bar */}
          <div className="absolute right-0 top-1/4 bottom-1/4 w-1.5 rounded-l-full bg-gradient-to-b from-indigo-500 to-purple-600" />

          {/* Icon with Soft Glow */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-indigo-50 text-indigo-600 mb-6 shadow-inner animate-pulse">
            <MdLockPerson size={48} />
          </div>

          <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">
            Access Denied
          </h1>
          
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">
            Error 403: Unauthorized
          </p>

          <div className="space-y-4 mb-10">
            <p className="text-slate-600 text-sm leading-relaxed">
              Your current account role does not have the necessary permissions to view this resource. 
              Please contact your <span className="text-indigo-600 font-bold">Super Admin</span> if you believe this is a mistake.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3.5 rounded-xl font-black text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
            >
              <MdArrowBack size={18} />
              Return to Login
            </Link>
            
            <Link
              to="/employeeLogin"
              className="text-slate-500 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors"
            >
              Go to Employee Login
            </Link>
          </div>

        </div>
      </div>

      {/* Subtle Background Decoration */}
      <div className="fixed bottom-10 opacity-10 pointer-events-none">
        <MdSecurity size={200} className="text-indigo-900" />
      </div>

    </div>
  );
};

export default Unauthorized;