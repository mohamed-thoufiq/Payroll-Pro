import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { 
  MdBusinessCenter, MdAccountTree, MdAdd, MdClose, 
  MdShield, MdSave, MdEdit, MdCheckCircle, MdErrorOutline 
} from "react-icons/md";
import { API_URL } from "../../../config/api.js";

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

  const inputClass = "flex-1 px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all";

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-16 space-y-3">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="text-xs font-medium text-text-muted">Loading Organization Matrix...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary">Roles & Organization Setup</h2>
        <p className="text-sm text-text-secondary mt-0.5">Manage job designations, organizational units, and permission matrices</p>
      </div>
      
      {/* Alert Messages */}
      {error && (
        <div className="bg-rose-50 text-rose-700 p-3.5 rounded-xl flex items-center gap-3 text-xs font-semibold border border-rose-200">
          <MdErrorOutline size={18} /> {error}
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-50 text-emerald-700 p-3.5 rounded-xl flex items-center gap-3 text-xs font-semibold border border-emerald-200">
          <MdCheckCircle size={18} /> {successMsg}
        </div>
      )}

      {/* --- TOP SECTION: ROLES & DEPTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Roles Management */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 border-l-4 border-l-primary shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-50 text-primary rounded-lg border border-blue-100">
                <MdBusinessCenter size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-text-primary">System Roles</h3>
                <p className="text-xs text-text-muted">Manage employee job designations</p>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-2 min-h-[48px]">
              {data.roles.map((role, idx) => (
                <div key={idx} className="pl-3 pr-2 py-1 bg-muted text-text-primary text-xs font-medium rounded-lg border border-gray-200 flex items-center gap-2 hover:bg-gray-100 transition-colors">
                  <span>{role}</span>
                  <button onClick={()=>handleDeleteRole(role)} className="text-text-muted hover:text-danger transition-colors">
                    <MdClose size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleAddRole} className="flex gap-2 pt-2 border-t border-gray-100">
            <input 
              type="text" placeholder="e.g. Senior Lead" value={newRole}
              onChange={(e) => { setNewRole(e.target.value); setError(""); }}
              className={inputClass}
            />
            <button disabled={submitting || !newRole} className="bg-primary hover:bg-primary-hover text-white px-3.5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1 shadow-sm">
              <MdAdd size={20} /> Add
            </button>
          </form>
        </div>

        {/* Departments Management */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 border-l-4 border-l-success shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-emerald-50 text-success rounded-lg border border-emerald-100">
                <MdAccountTree size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-text-primary">Departments</h3>
                <p className="text-xs text-text-muted">Organizational and cost center units</p>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-2 min-h-[48px]">
              {data.departments.map((dept, idx) => (
                <div key={idx} className="pl-3 pr-2 py-1 bg-muted text-text-primary text-xs font-medium rounded-lg border border-gray-200 flex items-center gap-2 hover:bg-gray-100 transition-colors">
                  <span>{dept}</span>
                  <button onClick={()=>handleDeleteDept(dept)} className="text-text-muted hover:text-danger transition-colors">
                    <MdClose size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleAddDept} className="flex gap-2 pt-2 border-t border-gray-100">
            <input 
              type="text" placeholder="e.g. Finance" value={newDept}
              onChange={(e) => { setNewDept(e.target.value); setError(""); }}
              className={inputClass}
            />
            <button disabled={submitting || !newDept} className="bg-primary hover:bg-primary-hover text-white px-3.5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1 shadow-sm">
              <MdAdd size={20} /> Add
            </button>
          </form>
        </div>
      </div>

      {/* --- BOTTOM SECTION: RBAC Matrix --- */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-muted flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-primary rounded-lg border border-blue-100">
              <MdShield size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-primary">Role Access Control</h3>
              <p className="text-xs text-text-secondary">Permission mapping and module accessibility matrix</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-gray-50 transition-colors shadow-sm"
              >
                <MdEdit size={16} /> Unlock & Edit Matrix
              </button>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button onClick={() => setIsEditing(false)} className="px-3 py-2 text-xs font-medium text-text-muted hover:text-danger transition-colors">
                  Discard
                </button>
                <button 
                  onClick={savePermissions}
                  disabled={savingPermissions}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                >
                  {savingPermissions ? "Saving..." : <><MdSave size={16} /> Save Matrix</>}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-text-secondary border-b border-gray-200 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Designation</th>
                <th className="px-6 py-3.5">Assigned Access Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.roles.map((role) => (
                <tr key={role} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-text-primary text-sm">{role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-md">
                      <select
                        disabled={!isEditing}
                        value={data.roleBasedAccess[role] || ""}
                        onChange={(e) => handlePermissionChange(role, e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition-all border outline-none
                          ${!isEditing 
                            ? "bg-gray-50 border-gray-200 text-text-muted cursor-not-allowed" 
                            : "bg-white border-primary text-text-primary focus:ring-1 focus:ring-primary shadow-sm"
                          }`}
                      >
                        <option value="" disabled>Awaiting Assignment...</option>
                        <option value="ALL_EXCEPT_ORG">{PERMISSIONS.ALL_EXCEPT_ORG}</option>
                        <option value="PAYROLL_ONLY">{PERMISSIONS.PAYROLL_ONLY}</option>
                        <option value="USER_MGMT">{PERMISSIONS.USER_MGMT}</option>
                        <option value="VIEW_EXPORT">{PERMISSIONS.VIEW_EXPORT}</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {data.roles.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-center text-text-muted">
            <MdShield size={36} className="text-gray-300" />
            <p className="text-xs font-medium">No roles registered for permission mapping</p>
          </div>
        )}
      </div>
    </div>
  );
}