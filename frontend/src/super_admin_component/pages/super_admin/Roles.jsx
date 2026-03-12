import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { 
  MdBusinessCenter, MdAccountTree, MdAdd, MdClose, 
  MdShield, MdSave, MdEdit, MdCheckCircle, MdErrorOutline 
} from "react-icons/md";
import { API_URL } from "../../../config/api";

// Permission Constants (Logic preserved)
const PERMISSIONS = {
  ALL_EXCEPT_ORG: "Full Access (No Settings)",
  PAYROLL_ONLY: "Payroll Management",
  USER_MGMT: "User Management",
  VIEW_EXPORT: "View & Export Only"
};

export default function Roles() {
  const { token } = useContext(AuthContext);
  
  // Data State (Unchanged)
  const [data, setData] = useState({ roles: [], departments: [], roleBasedAccess: {} });
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [error, setError] = useState(""); 
  const [successMsg, setSuccessMsg] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newDept, setNewDept] = useState("");
  const [isEditing, setIsEditing] = useState(false); // Permission Edit Toggle
  const [submitting, setSubmitting] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);

  // --- 1. Fetch Data (Logic preserved) ---
  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/organization/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        setData({ 
          ...result, 
          roleBasedAccess: result.roleBasedAccess || {} 
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchSettings();
  }, [token]);

  // --- 2. Handlers (Logic strictly preserved) ---
  const handleAddRole = async (e) => {
    e.preventDefault();
    setError(""); 
    if (!newRole.trim()) return;
    if (newRole.trim().toLowerCase() === "super admin") {
      setError("You cannot add a role named 'Super Admin'.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/organization/add-role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) { setNewRole(""); fetchSettings(); }
    } catch (error) { console.error(error); } finally { setSubmitting(false); }
  };

  const handleAddDept = async (e) => {
    e.preventDefault();
    setError("");
    if (!newDept.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/organization/add-department`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ department: newDept })
      });
      if (res.ok) { setNewDept(""); fetchSettings(); }
    } catch (error) { console.error(error); } finally { setSubmitting(false); }
  };

  const handlePermissionChange = (roleName, permissionValue) => {
    setData(prev => ({
      ...prev,
      roleBasedAccess: { ...prev.roleBasedAccess, [roleName]: permissionValue }
    }));
  };

  const savePermissions = async () => {
    setSavingPermissions(true);
    setSuccessMsg("");
    try {
      const res = await fetch(`${API_URL}/api/organization/update-permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ roleBasedAccess: data.roleBasedAccess })
      });
      if (res.ok) {
        setSuccessMsg("Permissions synchronized successfully.");
        setIsEditing(false);
        setTimeout(() => setSuccessMsg(""), 3000);
      } else { setError("Failed to save permissions."); }
    } catch (err) { setError("Server error while saving."); } finally { setSavingPermissions(false); }
  };
  
  const handleDeleteRole = async (roleToDelete) => {
    if (!window.confirm(`Are you sure you want to delete ${roleToDelete}?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/organization/delete-role`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: roleToDelete })
      });
      if (res.ok) fetchSettings();
    } catch (error) { console.error("Error deleting role:", error); }
  };

  const handleDeleteDept = async (deptToDelete) => {
    if (!window.confirm(`Are you sure you want to delete ${deptToDelete}?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/organization/delete-department`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ department: deptToDelete })
      });
      if (res.ok) fetchSettings();
    } catch (error) { console.error("Error deleting department:", error); }
  };

  const inputClass = "flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all";

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Initialising Matrix...</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-in fade-in duration-500">
      
      {/* Alert Messages */}
      {error && (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl flex items-center gap-3 text-xs font-black border border-rose-100 uppercase tracking-wider">
          <MdErrorOutline size={20} /> {error}
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl flex items-center gap-3 text-xs font-black border border-emerald-100 uppercase tracking-wider">
          <MdCheckCircle size={20} /> {successMsg}
        </div>
      )}

      {/* --- TOP SECTION: ROLES & DEPTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Roles Management */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1.5 bg-indigo-600" />
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><MdBusinessCenter size={24} /></div>
            <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">System Roles</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manage User Designations</p>
            </div>
          </div>

          <div className="flex-1 mb-8 flex flex-wrap gap-2">
            {data.roles.map((role, idx) => (
              <div key={idx} className="pl-3 pr-2 py-1.5 bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 flex items-center gap-2 group hover:bg-white transition-all">
                <span>{role}</span>
                <button onClick={()=>handleDeleteRole(role)} className="text-slate-300 hover:text-rose-500 transition-colors"><MdClose size={14} /></button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddRole} className="flex gap-2 mt-auto">
            <input 
              type="text" placeholder="e.g. Senior Lead" value={newRole}
              onChange={(e) => { setNewRole(e.target.value); setError(""); }}
              className={inputClass}
            />
            <button disabled={submitting || !newRole} className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50">
              <MdAdd size={24} />
            </button>
          </form>
        </div>

        {/* Departments Management */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1.5 bg-emerald-500" />
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><MdAccountTree size={24} /></div>
            <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">Departments</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Organizational Units</p>
            </div>
          </div>

          <div className="flex-1 mb-8 flex flex-wrap gap-2">
            {data.departments.map((dept, idx) => (
              <div key={idx} className="pl-3 pr-2 py-1.5 bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 flex items-center gap-2 hover:bg-white transition-all">
                <span>{dept}</span>
                <button onClick={()=>handleDeleteDept(dept)} className="text-slate-300 hover:text-rose-500 transition-colors"><MdClose size={14} /></button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddDept} className="flex gap-2 mt-auto">
            <input 
              type="text" placeholder="e.g. Finance" value={newDept}
              onChange={(e) => { setNewDept(e.target.value); setError(""); }}
              className={inputClass}
            />
            <button disabled={submitting || !newDept} className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all active:scale-95 disabled:opacity-50">
              <MdAdd size={24} />
            </button>
          </form>
        </div>
      </div>

      {/* --- BOTTOM SECTION: RBAC (The Glass-Slab UI) --- */}
      <div className="relative overflow-hidden rounded-3xl p-0.5 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-100/50">
        <div className="bg-white/95 backdrop-blur-md rounded-[22px] overflow-hidden">
          
          <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white text-orange-600 rounded-xl shadow-sm border border-slate-100"><MdShield size={28} /></div>
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Role Access Control</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Permission Mapping Matrix</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                >
                  <MdEdit size={18} /> Unlock Matrix
                </button>
              ) : (
                <div className="flex gap-2 w-full md:w-auto">
                  <button onClick={() => setIsEditing(false)} className="px-4 py-3 text-xs font-black text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-widest">Discard</button>
                  <button 
                    onClick={savePermissions}
                    disabled={savingPermissions}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {savingPermissions ? "Syncing..." : <><MdSave size={18} /> Save Matrix</>}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/30">
                  <th className="px-8 py-5">Designation</th>
                  <th className="px-8 py-5">Assigned Access Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.roles.map((role) => (
                  <tr key={role} className="group transition-colors hover:bg-slate-50/50">
                    <td className="px-8 py-6">
                      <span className="font-black text-slate-700 text-sm italic tracking-tight">{role}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="max-w-md relative">
                        <select
                          disabled={!isEditing}
                          value={data.roleBasedAccess[role] || ""}
                          onChange={(e) => handlePermissionChange(role, e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl text-xs font-bold transition-all border outline-none appearance-none
                            ${!isEditing 
                              ? "bg-slate-100 border-transparent text-slate-400 cursor-not-allowed" 
                              : "bg-white border-slate-200 text-indigo-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-sm"
                            }`}
                        >
                          <option value="" disabled>Awaiting Assignment...</option>
                          <option value="ALL_EXCEPT_ORG">{PERMISSIONS.ALL_EXCEPT_ORG}</option>
                          <option value="PAYROLL_ONLY">{PERMISSIONS.PAYROLL_ONLY}</option>
                          <option value="USER_MGMT">{PERMISSIONS.USER_MGMT}</option>
                          <option value="VIEW_EXPORT">{PERMISSIONS.VIEW_EXPORT}</option>
                        </select>
                        {isEditing && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400">
                             <MdEdit size={14} />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {data.roles.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
              <MdShield size={64} className="text-slate-100" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No roles detected for permission mapping</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}