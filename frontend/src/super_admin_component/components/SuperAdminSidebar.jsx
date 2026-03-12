import { useContext, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // For smooth transitions
import { MdEventAvailable } from "react-icons/md";

import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  FileBarChart, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Banknote, 
  X, 
  HandCoins 
} from "lucide-react"; // More attractive, consistent icons
import { AuthContext } from "../../context/AuthContext";

export default function SuperAdminSidebar({ isMobileOpen, setIsMobileOpen }) {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [payrunOpen, setPayrunOpen] = useState(false);

  const activeSection = searchParams.get("section") || "dashboard";
  const roleToPath = (role) => role?.toLowerCase().replace(/\s+/g, "") || "";
  const role = roleToPath(user?.role);

  const getInitials = (name) => {
    if (!name) return "AD";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const baseMenu = [
    { label: "Dashboard", section: "dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "Employees", section: "users", icon: <Users size={20} /> },
    { label: "Reimbursement", section: "reimbursement", icon: <HandCoins size={20} /> },
    { label: "Leave Requests", section: "attendanceapprove", icon: <MdEventAvailable size={20} /> },
    { label: "Roles & Access", section: "roles", icon: <ShieldCheck size={20} /> },
    { label: "Reports", section: "reports", icon: <FileBarChart size={20} /> },
    { label: "Settings", section: "settings", icon: <Settings size={20} /> },
  ];

  const getMenuByRole = () => {
    if (role === "superadmin") return baseMenu;
    if (role === "hradmin") return baseMenu.filter((m) => !["settings", "roles"].includes(m.section));
    if (role === "payrolladmin" || role === "finance") return baseMenu.filter((m) => ["dashboard", "reports"].includes(m.section));
    return [];
  };

  const filteredMenu = getMenuByRole();
  const dashboardItem = filteredMenu.find(m => m.section === "dashboard");
  const employeeItem = filteredMenu.find(m => m.section === "users");
  const otherItems = filteredMenu.filter(m => !["dashboard", "users"].includes(m.section));

  const payrunMenu = [
    { label: "Run Payroll", section: "run-payroll" },
    { label: "Payroll Report", section: "payroll-report" },
    { label: "Payroll History", section: "payroll-history" },
  ];

  const showPayrun = role === "superadmin" || role === "payrolladmin";

  const goTo = (section) => {
    navigate(`/payroll/${roleToPath(user.role)}?section=${section}`);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR ASIDE */}
      <aside className={`
        fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 
        flex flex-col z-50 transition-transform duration-300 ease-in-out
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        
        {/* TOP: USER INFO */}
        <div className="p-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-200">
              {getInitials(user?.name)}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-900 truncate text-sm leading-tight">
                {user?.name || "Admin User"}
              </div>
              <div className="text-[10px] uppercase tracking-widest font-black text-indigo-500 mt-0.5">
                {user?.role}
              </div>
            </div>
          </div>
          <button onClick={() => setIsMobileOpen(false)} className="lg:hidden text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* MENU CONTENT */}
        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
          {dashboardItem && <MenuItem item={dashboardItem} activeSection={activeSection} onClick={() => goTo(dashboardItem.section)} />}
          {employeeItem && <MenuItem item={employeeItem} activeSection={activeSection} onClick={() => goTo(employeeItem.section)} />}

          {showPayrun && (
            <div className="py-1">
              <button
                onClick={() => setPayrunOpen(!payrunOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200
                  ${payrunOpen ? "bg-slate-50 text-slate-900" : "text-slate-600 hover:bg-slate-50"}
                `}
              >
                <div className="flex items-center gap-3">
                  <Banknote size={20} className={payrunOpen ? "text-indigo-600" : "text-slate-400"} />
                  <span className="font-bold text-sm">Payrun</span>
                </div>
                <motion.div
                  animate={{ rotate: payrunOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={16} />
                </motion.div>
              </button>

              <AnimatePresence>
                {payrunOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="ml-9 mt-1 space-y-1 border-l-2 border-slate-100">
                      {payrunMenu.map((sub) => (
                        <div
                          key={sub.section}
                          onClick={() => goTo(sub.section)}
                          className={`pl-4 py-2 text-sm cursor-pointer transition-colors rounded-r-xl
                            ${activeSection === sub.section ? "text-indigo-600 font-black bg-indigo-50/50" : "text-slate-500 hover:text-slate-900"}
                          `}
                        >
                          {sub.label}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {otherItems.map((item) => (
            <MenuItem key={item.section} item={item} activeSection={activeSection} onClick={() => goTo(item.section)} />
          ))}
        </nav>

        {/* LOGOUT */}
        <div className="p-4 bg-white border-t border-slate-50">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all font-bold text-sm"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function MenuItem({ item, activeSection, onClick }) {
  const isActive = activeSection === item.section;
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group
        ${isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-600 hover:bg-slate-50"}
      `}
    >
      <span className={`${isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-500"}`}>
        {item.icon}
      </span>
      <span className={`text-sm font-bold ${isActive ? "text-white" : ""}`}>
        {item.label}
      </span>
    </div>
  );
}