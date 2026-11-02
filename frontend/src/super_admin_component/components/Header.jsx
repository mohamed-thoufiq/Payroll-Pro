import { useContext, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import {
  MdMenu,
  MdAdd,
  MdNotificationsNone,
  MdChevronRight,
  MdAccessTime
} from "react-icons/md"; 
import { API_URL } from "../../config/api.js"; 

export default function Header({ title, setIsMobileOpen }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, token } = useContext(AuthContext);

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
  const roleAccess = organization?.roleBasedAccess?.[user?.role] || "VIEW_ONLY";
  const isSuperAdmin = user?.role === "Super Admin";
  const canManageUsers = isSuperAdmin || ["ALL_EXCEPT_ORG", "USER_MGMT"].includes(roleAccess);

  /* -------------------- ACTIONS -------------------- */
  const goToAdd = () => {
    if (!canManageUsers) {
      alert("Access denied: You do not have permission to add employees.");
      return;
    }
    navigate(`/payroll/${roleToPath(user?.role)}?section=users&operation=add`);
  };

  const goToBulk = () => {
    if (!canManageUsers) {
      alert("Access denied: You do not have permission to add employees.");
      return;
    }
    navigate(`/payroll/${roleToPath(user?.role)}?section=bulk`);
  };

  const goToNotification = () => {
    navigate(`/payroll/${roleToPath(user?.role)}?section=notification`);
  };

  /* -------------------- THEME ACCENTS BY ROLE -------------------- */
  const role = roleToPath(user?.role);
  const isFinance = role === "finance";
  const isPayrollAdmin = role === "payrolladmin";

  const headerAccent = isFinance 
    ? "text-emerald-700" 
    : isPayrollAdmin 
    ? "text-red-700" 
    : "text-amber-600";

  const btnAccent = isFinance
    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
    : isPayrollAdmin
    ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20 font-semibold"
    : "bg-yellow-400 hover:bg-yellow-500 text-gray-900 shadow-sm font-bold";

  const clockIconAccent = isFinance 
    ? "text-emerald-600" 
    : isPayrollAdmin 
    ? "text-red-500" 
    : "text-yellow-500";

  /* -------------------- UI -------------------- */
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">

      {/* LEFT: Menu & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-all"
        >
          <MdMenu size={24} />
        </button>

        <div className="flex flex-col">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-text-secondary font-medium capitalize">
            <span>Payroll</span>
            <MdChevronRight size={14} className="text-gray-400" />
            <span className={headerAccent}>{section}</span>
          </div>

          <h1 className={`text-lg md:text-xl font-semibold ${headerAccent} flex items-center gap-2`}>
            {title}
          </h1>
        </div>
      </div>

      {/* CENTER: Live Clock */}
      <div className="hidden xl:flex items-center gap-2.5 px-4 py-1.5 bg-muted border border-gray-200 rounded-lg text-xs">
        <MdAccessTime className={clockIconAccent} size={16} />
        <span className="text-text-secondary font-medium">
          {currentTime.toLocaleDateString("en-IN", {
            weekday: "short",
            day: "2-digit",
            month: "short"
          })}{" "}
          •{" "}
          <span className="font-semibold text-text-primary">
            {currentTime.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true
            })}
          </span>
        </span>
      </div>

      {/* RIGHT: Actions & Notifications */}
      <div className="flex items-center gap-3">
        {showAddButton && (
          <div className="flex items-center gap-2">
            <button
              onClick={goToBulk}
              disabled={orgLoading}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                canManageUsers && !orgLoading
                  ? "border-gray-300 text-text-secondary bg-white hover:bg-gray-50"
                  : "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
              }`}
            >
              <MdAdd size={16} />
              <span className="hidden sm:inline">Bulk Import</span>
            </button>

            <button
              onClick={goToAdd}
              disabled={orgLoading}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all ${
                canManageUsers && !orgLoading
                  ? btnAccent
                  : "bg-gray-300 text-white cursor-not-allowed"
              }`}
            >
              <MdAdd size={16} />
              <span className="hidden sm:inline">Add Employee</span>
            </button>
          </div>
        )}

        {/* Notifications Hub */}
        <button
          onClick={goToNotification}
          disabled={orgLoading}
          className="relative p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-all"
          title="Notifications"
        >
          <MdNotificationsNone size={22} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-danger text-white text-[10px] font-bold border-2 border-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}