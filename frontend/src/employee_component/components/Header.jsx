import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext"; 
import { MdMenu } from "react-icons/md";
import { FiHome } from "react-icons/fi";

export default function Header({ title, onMenuClick }) {
  const { user } = useContext(AuthContext);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
      
      <div className="flex items-center gap-3">
        {/* HAMBURGER BUTTON for mobile */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-all active:scale-95"
        >
          <MdMenu size={24} />
        </button>
        
        <div className="flex items-center gap-2">
          <FiHome size={18} className="text-primary hidden sm:inline" />
          <h1 className="text-lg font-semibold text-primary">
            {title || "Employee Dashboard"}
          </h1>
        </div>
      </div>

      {/* RIGHT SIDE: Time and User Info */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-xs text-text-secondary bg-muted px-3 py-1.5 rounded-lg border border-gray-200">
          <span className="font-medium">
            {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </span>
        </div>

        <div className="text-right">
          <p className="text-xs font-semibold text-text-primary">{user?.name?.split(' ')[0] || 'Employee'}</p>
          <p className="text-[10px] text-text-secondary">{user?.role || 'User'}</p>
        </div>
      </div>
    </header>
  );
}