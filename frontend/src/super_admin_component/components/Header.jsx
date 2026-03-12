import { useContext, useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation} from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import {
  MdMenu,
  MdAdd,
  MdNotificationsNone,
  MdChevronRight,
  MdAccessTime
} from "react-icons/md"; 
import { API_URL } from "../../config/api";

export default function Header({ title, setIsMobileOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, token } = useContext(AuthContext); // Ensure token is available in context

  
  /* -------------------- STATE -------------------- */
  const [currentTime, setCurrentTime] = useState(new Date());
  const [organization, setOrganization] = useState(null);
  const [orgLoading, setOrgLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  /* -------------------- NOTIFICATION COUNT -------------------- */
  useEffect(() => {
    if (!token) return;

    const fetchUnread = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/notification/unread-count`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        const data = await res.json(); 
        
        setUnreadCount(data.unread || 0);
      } catch (err) {
        console.error("Unread count error:", err);
      }
    };

    fetchUnread();
  }, [token]);


  /* -------------------- LIVE CLOCK -------------------- */

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* -------------------- FETCH ORGANIZATION -------------------- */
  useEffect(() => {
    const fetchOrg = async () => {
      if (!user?.organizationId) return;
      
      try {
        // Replace with your actual API endpoint to fetch single org details
        const res = await fetch(`${API_URL}/api/organization/settings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const result = await res.json();
          
          setOrganization(result);
        }
      } catch (error) {
        console.error("Error fetching organization:", error);
      } finally {
        setOrgLoading(false);
      }
    };

    if (token) fetchOrg();
  }, [user?.organizationId, token]);

  /* -------------------- ROUTE STATE -------------------- */
  const operation = searchParams.get("operation") || "view";
  const section = searchParams.get("section") || "dashboard";

  const showAddButton =
    section === "users" && ["list", "view", "default"].includes(operation);

  const roleToPath = (role) =>
    role?.toLowerCase().replace(/\s+/g, "") || "";

  /* -------------------- ROLE BASED ACCESS -------------------- */
  // Now using the fetched 'organization' state instead of user.organization
  const roleAccess = organization?.roleBasedAccess?.[user?.role] || "VIEW_ONLY";
  
  // Logic: Superadmins usually bypass RBAC, or check for specific permission string
  const isSuperAdmin = user?.role === "Super Admin";
  const canManageUsers = isSuperAdmin || ["ALL_EXCEPT_ORG", "USER_MGMT"].includes(roleAccess);

  /* -------------------- ACTIONS -------------------- */
  const goToAdd = () => {
    if (!canManageUsers) {
      alert("❌ Access Denied: You do not have permission to add employees.");
      return;
    }
    navigate(`/payroll/${roleToPath(user?.role)}?section=users&operation=add`);
  };

    const goToBulk = () => {
    if (!canManageUsers) {
      alert("❌ Access Denied: You do not have permission to add employees.");
      return;
    }
    navigate(`/payroll/${roleToPath(user?.role)}?section=bulk`);
  };
  const goToNotification = () => {
   
    navigate(`/payroll/${roleToPath(user?.role)}?section=notification`);
  };

  /* -------------------- UI -------------------- */
  return (
    <header className="h-20 bg-white/70 backdrop-blur-xl saturate-150 border-b border-slate-200/60 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-sm shadow-slate-100">

      {/* LEFT: Menu & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden p-2.5 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl text-slate-500 transition-all active:scale-90"
        >
          <MdMenu size={28} />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-0.5">
            <span>Payroll</span>
            <MdChevronRight size={14} className="text-slate-300" />
            <span className="text-indigo-500">{section}</span>
          </div>

          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-none">
            {title}
          </h1>
        </div>
      </div>

      {/* CENTER: Live Clock */}
      <div className="hidden xl:flex items-center gap-3 px-5 py-2 bg-slate-50/50 border border-slate-100 rounded-2xl">
        <MdAccessTime className="text-indigo-500" size={18} />
        <div className="flex flex-col leading-none">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">
            Current Period
          </span>
          <span className="text-xs font-bold text-slate-700 mt-1">
            {currentTime.toLocaleDateString("en-IN", {
              weekday: "short",
              day: "2-digit",
              month: "short"
            })}{" "}
            •{" "}
            <span className="ml-1 text-indigo-600 uppercase">
              {currentTime.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
              })}
            </span>
          </span>
        </div>
      </div>

      {/* RIGHT: Actions & Profile */}
      <div className="flex items-center gap-3 md:gap-5 ml-auto md:ml-0">

        {showAddButton && (
          <div className="flex items-center gap-2">
            {/* BULK IMPORT BUTTON - Dotted Border Style */}
            <button
              onClick={goToBulk}
              disabled={orgLoading}
              className={`group relative overflow-hidden px-4 py-2 rounded-xl text-[11px] font-black flex items-center gap-2 transition-all active:scale-95 border-2
                ${
                  canManageUsers && !orgLoading
                    ? "border-dashed border-indigo-400 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-600 shadow-sm shadow-indigo-100"
                    : "border-dashed border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                }
              `}
            >
              <MdAdd size={18} className={canManageUsers ? "text-indigo-600" : "text-slate-400"} />
              <span className="hidden sm:inline uppercase tracking-wider">
                {orgLoading ? "..." : "Bulk Import"}
              </span>
            </button>

            {/* ADD EMPLOYEE BUTTON - Compact Solid Style */}
            <button
              onClick={goToAdd}
              disabled={orgLoading}
              className={`group relative overflow-hidden px-4 py-2 rounded-xl text-[11px] font-black flex items-center gap-2 shadow-md transition-all active:scale-95
                ${
                  canManageUsers && !orgLoading
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                }
              `}
            >
              {/* Visual sweep effect */}
              <div className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-[-25deg] -translate-x-full group-hover:animate-[sweep_0.6s_ease-in-out]" />
              <MdAdd size={18} />
              <span className="hidden sm:inline uppercase tracking-wider">
                {orgLoading ? "..." : "Add Employee"}
              </span>
            </button>
          </div>
        )}

        {/* Notifications Hub */}

        <button
          onClick={goToNotification}
          disabled={orgLoading}
          className="relative p-3 bg-white border border-slate-200
            text-slate-500 hover:text-indigo-600 hover:border-indigo-200
            hover:bg-indigo-50/30 rounded-2xl transition-all shadow-sm"
        >
          <MdNotificationsNone size={26} />

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1
              flex items-center justify-center
              rounded-full bg-rose-500 text-white text-[10px] font-black
              border-2 border-white shadow">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>


         
      </div>
    </header>
  );
}