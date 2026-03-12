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
  const labelClass = "text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1";
  const inputClass = "w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all outline-none border border-slate-200 bg-slate-50 text-slate-700 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60 disabled:cursor-not-allowed";

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Initialising Settings...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-10 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-200">
        <div>
           <h1 className="text-3xl font-black text-slate-800 tracking-tight">Organization Settings</h1>
           <p className="text-sm font-medium text-slate-500">Configure your global business rules and compliance.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full md:w-auto">
            {message.text && (
              <div className={`px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-widest animate-in slide-in-from-top-2 ${message.type === 'error' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                  {message.type === 'error' ? <MdErrorOutline size={18}/> : <MdCheckCircle size={18}/>}
                  {message.text}
              </div>
            )}
            <button
                onClick={toggleEditMode}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all shadow-lg active:scale-95 w-full sm:w-auto ${
                  isEditing ? "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-none" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
                }`}
            >
                {isEditing ? <><MdClose size={20} /> Cancel Editing</> : <><MdEdit size={20} /> Edit Configurations</>}
            </button>
        </div>
      </div>

      {/* 1. COMPANY PROFILE - Glass-Slab Style */}
      <div className="relative overflow-hidden rounded-3xl p-0.5 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-100/50">
        <div className="bg-white/95 backdrop-blur-md rounded-[22px] overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
            <MdBusiness className="text-indigo-600" size={24} />
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Company Profile</h2>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className={labelClass}>Organization Name</label>
              <input disabled={!isEditing} className={inputClass} value={companyProfile.companyName} onChange={(e) => setCompanyProfile({...companyProfile, companyName: e.target.value})}/>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Industry Type</label>
              <input disabled={!isEditing} className={inputClass} value={companyProfile.industry} onChange={(e) => setCompanyProfile({...companyProfile, industry: e.target.value})}/>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Financial Year Start</label>
              <select disabled={!isEditing} className={inputClass} value={companyProfile.financialYearStart} onChange={(e) => setCompanyProfile({...companyProfile, financialYearStart: e.target.value})}>
                <option value="">Select Month</option>
                {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Financial Year End</label>
              <select disabled={!isEditing} className={inputClass} value={companyProfile.financialYearEnd} onChange={(e) => setCompanyProfile({...companyProfile, financialYearEnd: e.target.value})}>
                <option value="">Select Month</option>
                {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className={labelClass}>Headquarters Location</label>
              <div className="relative">
                <MdLocationOn className="absolute left-4 top-3 text-slate-400" size={20} />
                <textarea disabled={!isEditing} rows={2} className={`${inputClass} pl-12 resize-none`} value={companyProfile.location} onChange={(e) => setCompanyProfile({...companyProfile, location: e.target.value})} placeholder="Full registered address..."/>
              </div>
            </div>
          </div>
          {isEditing && (
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button onClick={saveCompanyProfile} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-black text-sm shadow-lg shadow-indigo-100 active:scale-95 transition-all">
                <MdSave size={20} /> Save Profile Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. STATUTORY CONFIG */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
        <div className="absolute right-0 top-0 h-full w-1.5 bg-emerald-500" />
        <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
          <MdShield className="text-emerald-600" size={24} />
          <h2 className="text-lg font-black text-slate-800 tracking-tight tracking-tight">Statutory Compliance Setup</h2>
        </div>
        
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PF Section */}
          <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
               <h3 className="font-black text-slate-700 text-xs uppercase tracking-widest">Provident Fund (PF)</h3>
               <label className="relative inline-flex items-center cursor-pointer">
                 <input type="checkbox" disabled={!isEditing} checked={statutory.pf.enabled} onChange={(e) => setStatutory(p => ({...p, pf: {...p.pf, enabled: e.target.checked}}))} className="sr-only peer" />
                 <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 disabled:opacity-50"></div>
               </label>
            </div>
            {statutory.pf.enabled && (
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                <div><label className={labelClass}>Emp. Contrib (%)</label><input type="number" disabled={!isEditing} className={inputClass} value={statutory.pf.employeeContribution} onChange={(e) => setStatutory(p => ({...p, pf: {...p.pf, employeeContribution: Number(e.target.value)}}))}/></div>
                <div><label className={labelClass}>Org. Contrib (%)</label><input type="number" disabled={!isEditing} className={inputClass} value={statutory.pf.employerContribution} onChange={(e) => setStatutory(p => ({...p, pf: {...p.pf, employerContribution: Number(e.target.value)}}))}/></div>
              </div>
            )}
          </div>

          {/* ESI Section */}
          <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
               <h3 className="font-black text-slate-700 text-xs uppercase tracking-widest">State Insurance (ESI)</h3>
               <label className="relative inline-flex items-center cursor-pointer">
                 <input type="checkbox" disabled={!isEditing} checked={statutory.esi.enabled} onChange={(e) => setStatutory(p => ({...p, esi: {...p.esi, enabled: e.target.checked}}))} className="sr-only peer" />
                 <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
               </label>
            </div>
            {statutory.esi.enabled && (
              <div className="grid grid-cols-3 gap-3 animate-in slide-in-from-top-2">
                <div><label className={labelClass}>Emp (%)</label><input type="number" disabled={!isEditing} className={inputClass} value={statutory.esi.employeeContribution} onChange={(e) => setStatutory(p => ({...p, esi: {...p.esi, employeeContribution: Number(e.target.value)}}))}/></div>
                <div><label className={labelClass}>Org (%)</label><input type="number" disabled={!isEditing} className={inputClass} value={statutory.esi.employerContribution} onChange={(e) => setStatutory(p => ({...p, esi: {...p.esi, employerContribution: Number(e.target.value)}}))}/></div>
                <div><label className={labelClass}>Wage Cap</label><input type="number" disabled={!isEditing} className={inputClass} value={statutory.esi.wageLimit} onChange={(e) => setStatutory(p => ({...p, esi: {...p.esi, wageLimit: Number(e.target.value)}}))}/></div>
              </div>
            )}
          </div>

          {/* HRA Section */}
          <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
               <div className="flex items-center gap-2 text-indigo-600"><MdHome size={20}/><h3 className="font-black text-slate-700 text-xs uppercase tracking-widest">House Rent (HRA)</h3></div>
               <label className="relative inline-flex items-center cursor-pointer">
                 <input type="checkbox" disabled={!isEditing} checked={statutory.hra.enabled} onChange={(e) => setStatutory(p => ({...p, hra: {...p.hra, enabled: e.target.checked}}))} className="sr-only peer" />
                 <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
               </label>
            </div>
            {statutory.hra.enabled && (
              <div className="flex items-end gap-6 animate-in slide-in-from-top-2">
                <div className="flex-1"><label className={labelClass}>Percentage of Basic (%)</label><input type="number" disabled={!isEditing} className={inputClass} value={statutory.hra.percentageOfBasic} onChange={(e) => setStatutory(p => ({...p, hra: {...p.hra, percentageOfBasic: Number(e.target.value)}}))}/></div>
                <label className="flex items-center gap-2 pb-3 cursor-pointer"><input type="checkbox" disabled={!isEditing} checked={statutory.hra.taxExempt} onChange={(e) => setStatutory(p => ({...p, hra: {...p.hra, taxExempt: e.target.checked}}))} className="w-5 h-5 accent-indigo-600 rounded" /><span className="text-xs font-black text-slate-600 uppercase">Exempt</span></label>
              </div>
            )}
          </div>

          {/* Professional Tax */}
          <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
               <h3 className="font-black text-slate-700 text-xs uppercase tracking-widest">Prof. Tax (PT)</h3>
               <label className="relative inline-flex items-center cursor-pointer">
                 <input type="checkbox" disabled={!isEditing} checked={statutory.professionalTax.enabled} onChange={(e) => setStatutory(p => ({...p, professionalTax: {...p.professionalTax, enabled: e.target.checked}}))} className="sr-only peer" />
                 <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
               </label>
            </div>
            {statutory.professionalTax.enabled && (
              <div className="animate-in slide-in-from-top-2"><label className={labelClass}>Registered State</label><select disabled={!isEditing} className={inputClass} value={statutory.professionalTax.state} onChange={(e) => setStatutory(p => ({...p, professionalTax: {...p.professionalTax, state: e.target.value}}))}><option value="">Select State</option><option value="Tamil Nadu">Tamil Nadu</option><option value="Karnataka">Karnataka</option><option value="Maharashtra">Maharashtra</option></select></div>
            )}
          </div>
        </div>
        {isEditing && (
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button onClick={saveStatutory} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 rounded-xl font-black text-sm shadow-lg shadow-emerald-100 active:scale-95 transition-all">
              <MdSave size={20} /> Update Statutory Settings
            </button>
          </div>
        )}
      </div>

      {/* 3. ACCESS CONTROL */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
        <div className="absolute right-0 top-0 h-full w-1.5 bg-purple-600" />
        <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
          <MdGroup className="text-purple-600" size={24} />
          <h2 className="text-lg font-black text-slate-800 tracking-tight">System Role Privileges</h2>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Payroll Admin */}
          <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/30">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2"><div className="w-1.5 h-4 bg-purple-500 rounded-full" /><h3 className="font-black text-slate-700 text-[10px] uppercase tracking-widest">Payroll Admin</h3></div>
            <div className="space-y-4">
              <AccessCheckbox label="Process Payroll" checked={accessLevels.payrollAdmin.canProcessPayroll} disabled={!isEditing} onChange={(val) => setAccessLevels(p => ({...p, payrollAdmin: {...p.payrollAdmin, canProcessPayroll: val}}))} />
              <AccessCheckbox label="Approve Payroll" checked={accessLevels.payrollAdmin.canApprovePayroll} disabled={!isEditing} onChange={(val) => setAccessLevels(p => ({...p, payrollAdmin: {...p.payrollAdmin, canApprovePayroll: val}}))} />
            </div>
          </div>

          {/* HR Admin */}
          <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/30">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2"><div className="w-1.5 h-4 bg-indigo-500 rounded-full" /><h3 className="font-black text-slate-700 text-[10px] uppercase tracking-widest">HR Admin</h3></div>
            <div className="space-y-4">
              <AccessCheckbox label="Manage Workforce" checked={accessLevels.hrAdmin.canManageEmployees} disabled={!isEditing} onChange={(val) => setAccessLevels(p => ({...p, hrAdmin: {...p.hrAdmin, canManageEmployees: val}}))} />
              <AccessCheckbox label="Manage Salaries" checked={accessLevels.hrAdmin.canManageSalaryStructure} disabled={!isEditing} onChange={(val) => setAccessLevels(p => ({...p, hrAdmin: {...p.hrAdmin, canManageSalaryStructure: val}}))} />
            </div>
          </div>

           {/* Finance Team */}
           <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/30">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2"><div className="w-1.5 h-4 bg-blue-500 rounded-full" /><h3 className="font-black text-slate-700 text-[10px] uppercase tracking-widest">Finance Operations</h3></div>
            <div className="space-y-4">
              <AccessCheckbox label="Analytics Access" checked={accessLevels.finance.canViewReports} disabled={!isEditing} onChange={(val) => setAccessLevels(p => ({...p, finance: {...p.finance, canViewReports: val}}))} />
              <AccessCheckbox label="Data Export" checked={accessLevels.finance.canExportData} disabled={!isEditing} onChange={(val) => setAccessLevels(p => ({...p, finance: {...p.finance, canExportData: val}}))} />
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button onClick={saveAccessLevels} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-2.5 rounded-xl font-black text-sm shadow-lg shadow-purple-100 active:scale-95 transition-all">
              <MdSave size={20} /> Synchronize Access
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
    <label className={`flex items-center gap-3 transition-opacity ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:translate-x-1 transition-transform'}`}>
      <input type="checkbox" disabled={disabled} checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-5 h-5 accent-indigo-600 rounded cursor-pointer" />
      <span className="text-sm font-bold text-slate-600">{label}</span>
    </label>
  );
}