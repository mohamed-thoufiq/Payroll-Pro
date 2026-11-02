import { useContext, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

const ROLE_THEMES = {
  superadmin: {
    brandName: "Super Admin",
    subTitle: "Executive Management",
    brandColor: "text-yellow-400",
    activeClass: "bg-yellow-400 text-gray-900 font-bold shadow-sm",
    activeIconColor: "text-gray-900",
    inactiveIconColor: "text-gray-400",
    hoverClass: "text-gray-300 hover:bg-white/10 hover:text-white hover:translate-x-0.5",
    asideBg: "bg-gray-900 text-white border-r border-gray-800",
    headerBorder: "border-gray-700",
    footerBorder: "border-gray-700",
    accentColor: "text-yellow-400",
    subActive: "text-yellow-400 font-bold bg-white/5 border-l-2 border-yellow-400",
  },
  hradmin: {
    brandName: "HR Admin",
    subTitle: "Human Resources",
    brandColor: "text-yellow-400",
    activeClass: "bg-yellow-400 text-gray-900 font-bold shadow-sm",
    activeIconColor: "text-gray-900",
    inactiveIconColor: "text-gray-400",
    hoverClass: "text-gray-300 hover:bg-white/10 hover:text-white hover:translate-x-0.5",
    asideBg: "bg-gray-900 text-white border-r border-gray-800",
    headerBorder: "border-gray-700",
    footerBorder: "border-gray-700",
    accentColor: "text-yellow-400",
    subActive: "text-yellow-400 font-bold bg-white/5 border-l-2 border-yellow-400",
  },
  payrolladmin: {
    brandName: "Payroll Admin",
    subTitle: "Management Console",
    brandColor: "text-red-400",
    activeClass: "bg-red-600 text-white font-semibold shadow-md shadow-red-600/25",
    activeIconColor: "text-white",
    inactiveIconColor: "text-zinc-400",
    hoverClass: "text-zinc-300 hover:bg-zinc-800 hover:text-white hover:translate-x-0.5",
    asideBg: "bg-zinc-900 text-white border-r border-zinc-800",
    headerBorder: "border-zinc-800",
    footerBorder: "border-zinc-800",
    accentColor: "text-red-400",
    subActive: "text-red-400 font-bold bg-white/5 border-l-2 border-red-500",
  },
  finance: {
    brandName: "Finance Console",
    subTitle: "Financial Audit & Disbursement",
    brandColor: "text-emerald-400",
    activeClass: "bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-500/25",
    activeIconColor: "text-white",
    inactiveIconColor: "text-emerald-300/70",
    hoverClass: "text-emerald-100 hover:bg-emerald-900/40 hover:text-white hover:translate-x-0.5",
    asideBg: "bg-[#06281e] text-white border-r border-emerald-900/50",
    headerBorder: "border-emerald-900/50",
    footerBorder: "border-emerald-900/50",
    accentColor: "text-emerald-400",
    subActive: "text-emerald-400 font-bold bg-white/5 border-l-2 border-emerald-400",
  }
};

export default function SuperAdminSidebar({ isMobileOpen, setIsMobileOpen }) {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [payrunOpen, setPayrunOpen] = useState(false);

  const activeSection = searchParams.get("section") || "dashboard";
  const roleToPath = (role) => role?.toLowerCase().replace(/\s+/g, "") || "";
  const role = roleToPath(user?.role);
  const theme = ROLE_THEMES[role] || ROLE_THEMES.superadmin;

  const baseMenu = [
    { label: "Dashboard", section: "dashboard", icon: <LayoutDashboard size={18} /> },
    { label: "Employees", section: "users", icon: <Users size={18} /> },
    { label: "Reimbursement", section: "reimbursement", icon: <HandCoins size={18} /> },
    { label: "Leave Requests", section: "attendanceapprove", icon: <MdEventAvailable size={18} /> },
    { label: "Roles & Access", section: "roles", icon: <ShieldCheck size={18} /> },
    { label: "Reports", section: "reports", icon: <FileBarChart size={18} /> },
    { label: "Settings", section: "settings", icon: <Settings size={18} /> },
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR ASIDE - Role Themed */}
      <aside className={`
        fixed left-0 top-0 h-screen w-64 ${theme.asideBg}
        flex flex-col z-50 transition-transform duration-300 ease-in-out shadow-xl
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        
        {/* BRAND HEADER */}
        <div className={`px-6 py-5 border-b ${theme.headerBorder} flex items-center justify-between flex-shrink-0`}>
          <div>
            <h2 className={`text-lg font-semibold ${theme.brandColor} tracking-tight`}>
              {theme.brandName}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {theme.subTitle}
            </p>
          </div>
          <button onClick={() => setIsMobileOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* MENU CONTENT */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1 text-sm custom-scrollbar">
          {dashboardItem && (
            <MenuItem 
              item={dashboardItem} 
              activeSection={activeSection} 
              onClick={() => goTo(dashboardItem.section)}
              theme={theme} 
            />
          )}

          {employeeItem && (
            <MenuItem 
              item={employeeItem} 
              activeSection={activeSection} 
              onClick={() => goTo(employeeItem.section)} 
              theme={theme}
            />
          )}

          {showPayrun && (
            <div className="py-0.5">
              <button
                onClick={() => setPayrunOpen(!payrunOpen)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium
                  ${payrunOpen ? "bg-white/10 text-white" : "text-gray-300 hover:bg-white/10 hover:text-white"}
                `}
              >
                <div className="flex items-center gap-3">
                  <Banknote size={18} className={payrunOpen ? theme.accentColor : "text-gray-400"} />
                  <span>Payrun</span>
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
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="ml-8 mt-1 space-y-1 border-l border-gray-700">
                      {payrunMenu.map((sub) => {
                        const isSubActive = activeSection === sub.section;
                        return (
                          <div
                            key={sub.section}
                            onClick={() => goTo(sub.section)}
                            className={`pl-4 py-2 text-xs cursor-pointer transition-colors rounded-r-lg font-medium
                              ${isSubActive 
                                ? theme.subActive 
                                : "text-gray-400 hover:text-white hover:bg-white/5"}
                            `}
                          >
                            {sub.label}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {otherItems.map((item) => (
            <MenuItem 
              key={item.section} 
              item={item} 
              activeSection={activeSection} 
              onClick={() => goTo(item.section)} 
              theme={theme}
            />
          ))}
        </nav>

        {/* LOGOUT & FOOTER */}
        <div className={`px-6 py-4 border-t ${theme.footerBorder} flex flex-col gap-2`}>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-gray-300 hover:text-rose-400 hover:bg-white/5 transition-all"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
          <div className="text-[10px] text-gray-500">
            © 2026 Payroll System
          </div>
        </div>
      </aside>
    </>
  );
}

function MenuItem({ item, activeSection, onClick, theme }) {
  const isActive = activeSection === item.section;
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all duration-200 text-sm font-medium
        ${isActive 
          ? theme.activeClass 
          : theme.hoverClass}
      `}
    >
      <span className={isActive ? theme.activeIconColor : theme.inactiveIconColor}>
        {item.icon}
      </span>
      <span>
        {item.label}
      </span>
    </div>
  );
}