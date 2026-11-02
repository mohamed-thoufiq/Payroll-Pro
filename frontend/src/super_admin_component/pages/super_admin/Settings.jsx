import { useState, useEffect } from "react";
import api from "../../../utils/api"; 
import { 
  MdSave, MdBusiness, MdShield, MdGroup, 
  MdCheckCircle, MdErrorOutline, MdEdit, MdClose,
  MdLocationOn, MdHome, MdInfoOutline
} from "react-icons/md";

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isEditing, setIsEditing] = useState(false);

  // 1. Company Profile State
  const [companyProfile, setCompanyProfile] = useState({
    companyName: "",
    industry: "",
    financialYearStart: "",
    financialYearEnd: "",
    location: "",
  });

  // 2. Statutory Config State
  const [statutory, setStatutory] = useState({
    pf: { enabled: false, employeeContribution: 0, employerContribution: 0 },
    esi: { enabled: false, employeeContribution: 0, employerContribution: 0, wageLimit: 0 },
    professionalTax: { enabled: false, state: "" },
    hra: { enabled: false, percentageOfBasic: 0, taxExempt: false },
  });

  // 3. Access Levels State
  const [accessLevels, setAccessLevels] = useState({
    payrollAdmin: { canProcessPayroll: false, canApprovePayroll: false },
    hrAdmin: { canManageEmployees: false, canManageSalaryStructure: false },
    finance: { canViewReports: false, canExportData: false },
  });

  // --- FETCH DATA (Logic strictly preserved) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/settings/status");
        const org = res?.data?.organization;
        if (org) {
          setCompanyProfile({
            companyName: org.companyName || "",
            industry: org.industry || "",
            financialYearStart: org.financialYear?.startMonth || "",
            financialYearEnd: org.financialYear?.endMonth || "",
            location: org.location && org.location.length > 0 ? org.location[0] : "",
          });
          setStatutory({
            pf: { 
              enabled: org.statutoryConfig?.pf?.enabled ?? false, 
              employeeContribution: org.statutoryConfig?.pf?.employeeContribution ?? 0,
              employerContribution: org.statutoryConfig?.pf?.employerContribution ?? 0
            },
            esi: {
              enabled: org.statutoryConfig?.esi?.enabled ?? false,
              employeeContribution: org.statutoryConfig?.esi?.employeeContribution ?? 0,
              employerContribution: org.statutoryConfig?.esi?.employerContribution ?? 0,
              wageLimit: org.statutoryConfig?.esi?.wageLimit ?? 0
            },
            professionalTax: {
              enabled: org.statutoryConfig?.professionalTax?.enabled ?? false,
              state: org.statutoryConfig?.professionalTax?.state ?? ""
            },
            hra: {
              enabled: org.statutoryConfig?.hra?.enabled ?? false,
              percentageOfBasic: org.statutoryConfig?.hra?.percentageOfBasic ?? 0,
              taxExempt: org.statutoryConfig?.hra?.taxExempt ?? false
            }
          });
          setAccessLevels({
            payrollAdmin: {
              canProcessPayroll: org.accessLevels?.payrollAdmin?.canProcessPayroll ?? false,
              canApprovePayroll: org.accessLevels?.payrollAdmin?.canApprovePayroll ?? false
            },
            hrAdmin: {
              canManageEmployees: org.accessLevels?.hrAdmin?.canManageEmployees ?? false,
              canManageSalaryStructure: org.accessLevels?.hrAdmin?.canManageSalaryStructure ?? false
            },
            finance: {
              canViewReports: org.accessLevels?.finance?.canViewReports ?? false,
              canExportData: org.accessLevels?.finance?.canExportData ?? false
            }
          });
        }
      } catch (err) {
        console.error("Load failed:", err);
        setMessage({ type: "error", text: "Failed to load settings." });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- SAVE HANDLERS (Logic strictly preserved) ---
  const saveCompanyProfile = async () => {
    try {
      setMessage({ type: "", text: "" });
      const payload = {
        companyName: companyProfile.companyName,
        industry: companyProfile.industry,
        financialYear: { startMonth: companyProfile.financialYearStart, endMonth: companyProfile.financialYearEnd },
        location: [companyProfile.location] 
      };
      await api.post("/settings/company-profile", payload);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false); 
    } catch (err) { setMessage({ type: "error", text: "Failed to update profile." }); }
  };

  const saveStatutory = async () => {
    try {
      setMessage({ type: "", text: "" });
      await api.post("/settings/statutory-setup", statutory);
      setMessage({ type: "success", text: "Statutory configuration saved!" });
      setIsEditing(false);
    } catch (err) { setMessage({ type: "error", text: "Failed to update statutory." }); }
  };

  const saveAccessLevels = async () => {
    try {
      setMessage({ type: "", text: "" });
      await api.post("/settings/access-levels", accessLevels);
      setMessage({ type: "success", text: "Access levels synchronized!" });
      setIsEditing(false);
    } catch (err) { setMessage({ type: "error", text: "Failed to update access." }); }
  };

  const toggleEditMode = () => {
    if (isEditing) setMessage({ type: "", text: "" });
    setIsEditing(!isEditing);
  };

  // UI Variable constants
  const labelClass = "text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1";
  const inputClass = "w-full px-3.5 py-2 rounded-lg text-sm transition-all outline-none border border-gray-200 bg-white text-text-primary focus:border-primary focus:ring-1 focus:ring-primary disabled:bg-gray-50 disabled:text-text-muted disabled:cursor-not-allowed";

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-16 space-y-3">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="text-xs font-medium text-text-muted">Loading Organization Settings...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Organization Settings</h2>
          <p className="text-sm text-text-secondary mt-0.5">Configure company profile, statutory rules, and privilege delegations</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full sm:w-auto">
          {message.text && (
            <div className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium ${message.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
              {message.type === 'error' ? <MdErrorOutline size={16}/> : <MdCheckCircle size={16}/>}
              {message.text}
            </div>
          )}
          <button
            onClick={toggleEditMode}
            className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm ${
              isEditing 
                ? "bg-white border border-gray-200 text-text-secondary hover:bg-gray-50" 
                : "bg-primary hover:bg-primary-hover text-white"
            }`}
          >
            {isEditing ? <><MdClose size={16} /> Cancel</> : <><MdEdit size={16} /> Edit Configurations</>}
          </button>
        </div>
      </div>

      {/* 1. COMPANY PROFILE */}
      <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-primary shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-muted flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-primary rounded-lg border border-blue-100">
            <MdBusiness size={18} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary">Company Profile</h3>
            <p className="text-xs text-text-muted">Core business identity and accounting timeline</p>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Organization Name</label>
            <input disabled={!isEditing} className={inputClass} value={companyProfile.companyName} onChange={(e) => setCompanyProfile({...companyProfile, companyName: e.target.value})}/>
          </div>
          <div>
            <label className={labelClass}>Industry Type</label>
            <input disabled={!isEditing} className={inputClass} value={companyProfile.industry} onChange={(e) => setCompanyProfile({...companyProfile, industry: e.target.value})}/>
          </div>
          <div>
            <label className={labelClass}>Financial Year Start</label>
            <select disabled={!isEditing} className={inputClass} value={companyProfile.financialYearStart} onChange={(e) => setCompanyProfile({...companyProfile, financialYearStart: e.target.value})}>
              <option value="">Select Month</option>
              {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Financial Year End</label>
            <select disabled={!isEditing} className={inputClass} value={companyProfile.financialYearEnd} onChange={(e) => setCompanyProfile({...companyProfile, financialYearEnd: e.target.value})}>
              <option value="">Select Month</option>
              {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Headquarters Location</label>
            <div className="relative">
              <MdLocationOn className="absolute left-3 top-2.5 text-text-muted" size={18} />
              <textarea disabled={!isEditing} rows={2} className={`${inputClass} pl-9 resize-none`} value={companyProfile.location} onChange={(e) => setCompanyProfile({...companyProfile, location: e.target.value})} placeholder="Full registered address..."/>
            </div>
          </div>
        </div>
        {isEditing && (
          <div className="px-6 py-3.5 bg-muted border-t border-gray-200 flex justify-end">
            <button onClick={saveCompanyProfile} className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-lg font-semibold text-xs shadow-sm transition-all">
              <MdSave size={16} /> Save Profile
            </button>
          </div>
        )}
      </div>

      {/* 2. STATUTORY CONFIG */}
      <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-success shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-muted flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-success rounded-lg border border-emerald-100">
            <MdShield size={18} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary">Statutory Compliance Setup</h3>
            <p className="text-xs text-text-muted">Tax rates, Provident Fund, State Insurance, and HRA policies</p>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* PF Section */}
          <div className="bg-muted p-4 rounded-lg border border-gray-200 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
              <span className="font-semibold text-text-primary text-xs uppercase tracking-wider">Provident Fund (PF)</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" disabled={!isEditing} checked={statutory.pf.enabled} onChange={(e) => setStatutory(p => ({...p, pf: {...p.pf, enabled: e.target.checked}}))} className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary disabled:opacity-50"></div>
              </label>
            </div>
            {statutory.pf.enabled && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div><label className={labelClass}>Emp. Contrib (%)</label><input type="number" disabled={!isEditing} className={inputClass} value={statutory.pf.employeeContribution} onChange={(e) => setStatutory(p => ({...p, pf: {...p.pf, employeeContribution: Number(e.target.value)}}))}/></div>
                <div><label className={labelClass}>Org. Contrib (%)</label><input type="number" disabled={!isEditing} className={inputClass} value={statutory.pf.employerContribution} onChange={(e) => setStatutory(p => ({...p, pf: {...p.pf, employerContribution: Number(e.target.value)}}))}/></div>
              </div>
            )}
          </div>

          {/* ESI Section */}
          <div className="bg-muted p-4 rounded-lg border border-gray-200 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
              <span className="font-semibold text-text-primary text-xs uppercase tracking-wider">State Insurance (ESI)</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" disabled={!isEditing} checked={statutory.esi.enabled} onChange={(e) => setStatutory(p => ({...p, esi: {...p.esi, enabled: e.target.checked}}))} className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-success"></div>
              </label>
            </div>
            {statutory.esi.enabled && (
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <div><label className={labelClass}>Emp (%)</label><input type="number" disabled={!isEditing} className={inputClass} value={statutory.esi.employeeContribution} onChange={(e) => setStatutory(p => ({...p, esi: {...p.esi, employeeContribution: Number(e.target.value)}}))}/></div>
                <div><label className={labelClass}>Org (%)</label><input type="number" disabled={!isEditing} className={inputClass} value={statutory.esi.employerContribution} onChange={(e) => setStatutory(p => ({...p, esi: {...p.esi, employerContribution: Number(e.target.value)}}))}/></div>
                <div><label className={labelClass}>Wage Cap</label><input type="number" disabled={!isEditing} className={inputClass} value={statutory.esi.wageLimit} onChange={(e) => setStatutory(p => ({...p, esi: {...p.esi, wageLimit: Number(e.target.value)}}))}/></div>
              </div>
            )}
          </div>

          {/* HRA Section */}
          <div className="bg-muted p-4 rounded-lg border border-gray-200 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
              <div className="flex items-center gap-1.5"><MdHome size={16} className="text-primary"/><span className="font-semibold text-text-primary text-xs uppercase tracking-wider">House Rent (HRA)</span></div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" disabled={!isEditing} checked={statutory.hra.enabled} onChange={(e) => setStatutory(p => ({...p, hra: {...p.hra, enabled: e.target.checked}}))} className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            {statutory.hra.enabled && (
              <div className="flex items-end gap-4 pt-1">
                <div className="flex-1"><label className={labelClass}>Percentage of Basic (%)</label><input type="number" disabled={!isEditing} className={inputClass} value={statutory.hra.percentageOfBasic} onChange={(e) => setStatutory(p => ({...p, hra: {...p.hra, percentageOfBasic: Number(e.target.value)}}))}/></div>
                <label className="flex items-center gap-1.5 pb-2.5 cursor-pointer"><input type="checkbox" disabled={!isEditing} checked={statutory.hra.taxExempt} onChange={(e) => setStatutory(p => ({...p, hra: {...p.hra, taxExempt: e.target.checked}}))} className="w-4 h-4 accent-primary rounded" /><span className="text-xs font-medium text-text-secondary">Tax Exempt</span></label>
              </div>
            )}
          </div>

          {/* Professional Tax */}
          <div className="bg-muted p-4 rounded-lg border border-gray-200 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
              <span className="font-semibold text-text-primary text-xs uppercase tracking-wider">Professional Tax (PT)</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" disabled={!isEditing} checked={statutory.professionalTax.enabled} onChange={(e) => setStatutory(p => ({...p, professionalTax: {...p.professionalTax, enabled: e.target.checked}}))} className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            {statutory.professionalTax.enabled && (
              <div className="pt-1"><label className={labelClass}>Registered State</label><select disabled={!isEditing} className={inputClass} value={statutory.professionalTax.state} onChange={(e) => setStatutory(p => ({...p, professionalTax: {...p.professionalTax, state: e.target.value}}))}><option value="">Select State</option><option value="Tamil Nadu">Tamil Nadu</option><option value="Karnataka">Karnataka</option><option value="Maharashtra">Maharashtra</option></select></div>
            )}
          </div>
        </div>
        {isEditing && (
          <div className="px-6 py-3.5 bg-muted border-t border-gray-200 flex justify-end">
            <button onClick={saveStatutory} className="flex items-center gap-1.5 bg-success hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold text-xs shadow-sm transition-all">
              <MdSave size={16} /> Save Statutory Rules
            </button>
          </div>
        )}
      </div>

      {/* 3. ACCESS CONTROL */}
      <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-warning shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-muted flex items-center gap-3">
          <div className="p-2 bg-yellow-50 text-warning rounded-lg border border-yellow-200">
            <MdGroup size={18} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary">System Role Privileges</h3>
            <p className="text-xs text-text-muted">Module and operation rights assigned to roles</p>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Payroll Admin */}
          <div className="border border-gray-200 rounded-lg p-4 bg-muted space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
              <div className="w-1.5 h-3.5 bg-primary rounded-full" />
              <h4 className="font-semibold text-text-primary text-xs uppercase tracking-wider">Payroll Admin</h4>
            </div>
            <div className="space-y-2.5">
              <AccessCheckbox label="Process Payroll" checked={accessLevels.payrollAdmin.canProcessPayroll} disabled={!isEditing} onChange={(val) => setAccessLevels(p => ({...p, payrollAdmin: {...p.payrollAdmin, canProcessPayroll: val}}))} />
              <AccessCheckbox label="Approve Payroll" checked={accessLevels.payrollAdmin.canApprovePayroll} disabled={!isEditing} onChange={(val) => setAccessLevels(p => ({...p, payrollAdmin: {...p.payrollAdmin, canApprovePayroll: val}}))} />
            </div>
          </div>

          {/* HR Admin */}
          <div className="border border-gray-200 rounded-lg p-4 bg-muted space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
              <div className="w-1.5 h-3.5 bg-success rounded-full" />
              <h4 className="font-semibold text-text-primary text-xs uppercase tracking-wider">HR Admin</h4>
            </div>
            <div className="space-y-2.5">
              <AccessCheckbox label="Manage Workforce" checked={accessLevels.hrAdmin.canManageEmployees} disabled={!isEditing} onChange={(val) => setAccessLevels(p => ({...p, hrAdmin: {...p.hrAdmin, canManageEmployees: val}}))} />
              <AccessCheckbox label="Manage Salaries" checked={accessLevels.hrAdmin.canManageSalaryStructure} disabled={!isEditing} onChange={(val) => setAccessLevels(p => ({...p, hrAdmin: {...p.hrAdmin, canManageSalaryStructure: val}}))} />
            </div>
          </div>

          {/* Finance Team */}
          <div className="border border-gray-200 rounded-lg p-4 bg-muted space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
              <div className="w-1.5 h-3.5 bg-warning rounded-full" />
              <h4 className="font-semibold text-text-primary text-xs uppercase tracking-wider">Finance Operations</h4>
            </div>
            <div className="space-y-2.5">
              <AccessCheckbox label="Analytics Access" checked={accessLevels.finance.canViewReports} disabled={!isEditing} onChange={(val) => setAccessLevels(p => ({...p, finance: {...p.finance, canViewReports: val}}))} />
              <AccessCheckbox label="Data Export" checked={accessLevels.finance.canExportData} disabled={!isEditing} onChange={(val) => setAccessLevels(p => ({...p, finance: {...p.finance, canExportData: val}}))} />
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="px-6 py-3.5 bg-muted border-t border-gray-200 flex justify-end">
            <button onClick={saveAccessLevels} className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-lg font-semibold text-xs shadow-sm transition-all">
              <MdSave size={16} /> Save Privileges
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-component for Access Level Checkboxes to keep code clean
function AccessCheckbox({ label, checked, disabled, onChange }) {
  return (
    <label className={`flex items-center gap-2.5 transition-opacity ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
      <input type="checkbox" disabled={disabled} checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 accent-primary rounded cursor-pointer" />
      <span className="text-xs font-medium text-text-secondary">{label}</span>
    </label>
  );
}