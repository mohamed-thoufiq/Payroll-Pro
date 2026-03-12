import { useEffect, useState } from "react";
import { X, Eye, Trash2, Search, Filter, ToggleLeft,ToggleRight} from "lucide-react";
import { API_URL } from "../../config/api";
const ITEMS_PER_PAGE = 5;

// Professional Tax Slabs (Logic untouched)
const P_TAX_SLABS = {
  "Tamil Nadu": [
    { limit: 12500, amount: 208 },
    { limit: 10000, amount: 171 },
    { limit: 7500,  amount: 108 },
    { limit: 5000,  amount: 51 },
    { limit: 3500,  amount: 22 },
    { limit: 0,     amount: 0 }
  ],
  "Default": [
    { limit: 10000, amount: 200 },
    { limit: 0, amount: 0 }
  ]
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [orgConfig, setOrgConfig] = useState(null); 
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal State
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [salaryBreakdown, setSalaryBreakdown] = useState(null);

  // UI State
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("All");

  /* ===================== FETCH DATA ===================== */
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not logged in");
      const headers = { Authorization: `Bearer ${token}` };

      const orgRes = await fetch(`${API_URL}/api/organization/settings`, { headers });
      if (orgRes.ok) {
        const orgData = await orgRes.json();
        setOrgConfig(orgData);
      }

      const empRes = await fetch(`${API_URL}/api/users`, { headers });
      if (empRes.ok) {
        const result = await empRes.json();
        setEmployees(Array.isArray(result.data) ? result.data : []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  /* ===================== CALCULATION LOGIC (STRICTLY UNCHANGED) ===================== */
  const calculateSalaryDetails = (employee) => {
    const ctc = employee.employeeDetails?.salary?.ctc || 0;
    const basicPercent = employee.employeeDetails?.salary?.basicPercentage || 50;
    const monthlyGross = ctc / 12;
    const basicSalary = monthlyGross * (basicPercent / 100);
    
    let hra = 0;
    let specialAllowance = 0;

    if (orgConfig?.statutoryConfig?.hra?.enabled) {
      const hraPercent = orgConfig.statutoryConfig.hra.percentageOfBasic || 50;
      hra = basicSalary * (hraPercent / 100);
    }

    specialAllowance = monthlyGross - basicSalary - hra;
    if (specialAllowance < 0) specialAllowance = 0;

    let pf = 0; let esi = 0; let pt = 0;
    let employerPF = 0; let employerESI = 0;

    if (orgConfig?.statutoryConfig) {
      const { pf: pfConfig, esi: esiConfig, professionalTax: ptConfig } = orgConfig.statutoryConfig;
      if (pfConfig?.enabled) {
        pf = basicSalary * ((pfConfig.employeeContribution || 12) / 100);
        employerPF = basicSalary * ((pfConfig.employerContribution || 12) / 100);
      }
      if (esiConfig?.enabled) {
        const wageLimit = esiConfig.wageLimit || 21000;
        if (monthlyGross <= wageLimit) {
          esi = monthlyGross * ((esiConfig.employeeContribution || 0.75) / 100);
          employerESI = monthlyGross * ((esiConfig.employerContribution || 3.25) / 100);
        }
      }
      if (ptConfig?.enabled) {
        const stateName = ptConfig.state || "Default";
        const slabs = P_TAX_SLABS[stateName] || P_TAX_SLABS["Default"];
        const applicableSlab = slabs.find(slab => monthlyGross > slab.limit);
        pt = applicableSlab ? applicableSlab.amount : 0;
      }
    }

    return {
      ctc, monthlyGross,
      earnings: { basic: basicSalary, hra: hra, special: specialAllowance, total: monthlyGross },
      deductions: { pf, esi, pt, total: pf + esi + pt },
      employerContributions: { pf: employerPF, esi: employerESI },
      netPay: monthlyGross - (pf + esi + pt)
    };
  };

  const handleViewSalary = (employee) => {
    const details = calculateSalaryDetails(employee);
    setSalaryBreakdown(details);
    setSelectedEmployee(employee);
  };

  const closeModal = () => {
    setSelectedEmployee(null);
    setSalaryBreakdown(null);
  };

  /* ===================== FILTER LOGIC ===================== */
  useEffect(() => {
    setCurrentPage(1);
    let filtered = employees || [];
    if (activeTab !== "All") {
      filtered = filtered.filter((e) => e.status === activeTab);
    }
    if (searchTerm) {
      filtered = filtered.filter((e) => 
        e.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        e.employeeDetails?.basic?.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredEmployees(filtered);
  }, [activeTab, employees, searchTerm]);

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    setEmployees(prev => prev.map(emp => emp._id === id ? { ...emp, status: newStatus } : emp));
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/api/users/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) { fetchData(); }
  };

  const deleteEmployee = async (id) => {
    if(!window.confirm("Delete employee?")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/api/users/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` }});
      setEmployees(prev => prev.filter(e => e._id !== id));
    } catch (e) { console.error(e); }
  };

  /* ===================== PAGINATION ===================== */
  const totalEmployees = filteredEmployees.length;
  const totalPages = Math.ceil(totalEmployees / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  
  const getPaginationGroup = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 4) return [1, 2, 3, 4, 5, "...", totalPages];
    if (currentPage >= totalPages - 3) return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-slate-50 flex flex-col gap-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Employee Directory</h2>
          <p className="text-sm text-slate-500 font-medium">Manage workforce and statutory payroll components.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search ID or Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex p-1 bg-slate-200/50 rounded-xl w-fit">
          {["All", "Active", "Inactive"].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === tab ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] uppercase tracking-widest font-black text-slate-500">
              <th className="px-6 py-4">Employee Details</th>
              <th className="px-6 py-4">Role & Dept</th>
              <th className="px-6 py-4 text-right">Gross Salary</th>
              <th className="px-6 py-4 text-right">Estimated Net</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {paginatedEmployees.map((emp) => {
              const { monthlyGross, netPay } = calculateSalaryDetails(emp);
              return (
                <tr key={emp._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
                        {emp.name?.[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{emp.name}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{emp.employeeDetails?.basic?.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <div className="font-semibold">{emp.role}</div>
                    <div className="text-xs text-slate-400">{emp.employeeDetails?.basic?.department}</div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-700">{formatCurrency(monthlyGross)}</td>
                  <td className="px-6 py-4 text-right font-black text-indigo-600">{formatCurrency(netPay)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${emp.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleViewSalary(emp)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Eye size={18} /></button>
                      <button onClick={() => toggleStatus(emp._id, emp.status)} title={emp.status === "Active" ? "Deactivate Employee" : "Activate Employee"} className="p-2 rounded-lg transition-all hover:bg-slate-100">
                        {emp.status === "Active" ? (
                          <ToggleRight size={20} className="text-emerald-600" />
                        ) : (
                          <ToggleLeft size={20} className="text-slate-400" />
                        )}
                      </button>
                      <button onClick={() => deleteEmployee(emp._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden flex flex-col gap-4">
        {paginatedEmployees.map((emp) => {
          const { monthlyGross, netPay } = calculateSalaryDetails(emp);
          return (
            <div key={emp._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 relative overflow-hidden">
               <div className="absolute right-0 top-0 h-full w-1.5 bg-indigo-500" />
               <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {emp.name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 truncate">{emp.name}</h3>
                    <p className="text-xs text-slate-500">{emp.role} • {emp.employeeDetails?.basic?.department}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${emp.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                    {emp.status}
                  </span>
               </div>
               <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gross</p>
                    <p className="text-sm font-bold text-slate-700">{formatCurrency(monthlyGross)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Net Pay</p>
                    <p className="text-sm font-black text-indigo-600">{formatCurrency(netPay)}</p>
                  </div>
               </div>
               <div className="flex gap-2 mt-2">
                  <button onClick={() => handleViewSalary(emp)} className="flex-1 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2"><Eye size={16}/> View Breakdown</button>
                  <button onClick={() => deleteEmployee(emp._id)} className="p-2 text-rose-500 bg-rose-50 rounded-xl"><Trash2 size={18}/></button>
                  <button onClick={() => toggleStatus(emp._id, emp.status)} title={emp.status === "Active" ? "Deactivate Employee" : "Activate Employee"}  className="p-2 text-rose-500 bg-rose-50 rounded-xl">
                    {emp.status === "Active" ? 
                        ( <ToggleRight size={20} className="text-emerald-600" /> ) : 
                        ( <ToggleLeft size={20} className="text-slate-400" /> )
                    }
                  </button>
               </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 border-t border-slate-200 mt-auto">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, totalEmployees)} of {totalEmployees} Results
        </p>
        <div className="flex items-center gap-1">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-30">‹</button>
          {getPaginationGroup().map((item, i) => (
            <button 
              key={i} 
              onClick={() => typeof item === "number" && setCurrentPage(item)}
              className={`w-9 h-9 rounded-xl border text-xs font-black transition-all ${currentPage === item ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
            >
              {item}
            </button>
          ))}
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-30">›</button>
        </div>
      </div>

      {/* ===================== SALARY BREAKDOWN MODAL (MOBILE FRIENDLY) ===================== */}
      {selectedEmployee && salaryBreakdown && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300">
            
            {/* Modal Header */}
            <div className="relative p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
               <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white flex items-center justify-center font-black text-xl shadow-lg">
                  {selectedEmployee.name?.[0]}
               </div>
               <div className="flex-1">
                  <h3 className="text-xl font-black text-slate-900 leading-tight">{selectedEmployee.name}</h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{selectedEmployee.role} • {selectedEmployee.employeeDetails?.basic?.department}</p>
               </div>
               <button onClick={closeModal} className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm hover:text-rose-500 transition-colors border border-slate-100"><X size={20} /></button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Earnings */}
                <div className="bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100/50">
                  <div className="flex items-center gap-2 mb-4 border-b border-emerald-100 pb-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">Earnings</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { l: "Basic Salary", v: salaryBreakdown.earnings.basic },
                      { l: "HRA", v: salaryBreakdown.earnings.hra },
                      { l: "Special Allowance", v: salaryBreakdown.earnings.special }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between text-xs font-bold">
                        <span className="text-slate-500">{item.l}</span>
                        <span className="text-slate-800">{formatCurrency(item.v)}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-emerald-100 flex justify-between font-black text-sm text-emerald-700">
                      <span>Gross Total</span>
                      <span>{formatCurrency(salaryBreakdown.earnings.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="bg-rose-50/30 p-4 rounded-2xl border border-rose-100/50">
                  <div className="flex items-center gap-2 mb-4 border-b border-rose-100 pb-2">
                    <div className="h-2 w-2 rounded-full bg-rose-500"></div>
                    <span className="text-xs font-black text-rose-700 uppercase tracking-widest">Deductions</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { l: "PF (Employee)", v: salaryBreakdown.deductions.pf },
                      { l: "ESI (Employee)", v: salaryBreakdown.deductions.esi },
                      { l: "Professional Tax", v: salaryBreakdown.deductions.pt }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between text-xs font-bold">
                        <span className="text-slate-500">{item.l}</span>
                        <span className="text-slate-800">{formatCurrency(item.v)}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-rose-100 flex justify-between font-black text-sm text-rose-700">
                      <span>Total Deductions</span>
                      <span>{formatCurrency(salaryBreakdown.deductions.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Pay Highlight - Matching your Dash Cards */}
              <div className="mt-8 relative overflow-hidden rounded-2xl p-0.5 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-100">
                <div className="bg-white rounded-[14px] p-5 flex flex-col sm:flex-row justify-between items-center gap-4 relative">
                  <div className="absolute right-0 top-1/4 bottom-1/4 w-1.5 rounded-l-full bg-indigo-500" />
                  <div className="text-center sm:text-left">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Final Net Take-home</p>
                    <p className="text-3xl font-black text-slate-900">{formatCurrency(salaryBreakdown.netPay)}</p>
                  </div>
                  <div className="bg-slate-50 px-4 py-2 rounded-xl text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Annual CTC</p>
                    <p className="text-sm font-black text-slate-700">{formatCurrency(salaryBreakdown.ctc)}</p>
                  </div>
                </div>
              </div>

              {/* Statutory Info */}
              <div className="mt-6 flex flex-wrap gap-4 justify-center md:justify-start">
                 <div className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-tighter border border-slate-200">
                   Employer PF: {formatCurrency(salaryBreakdown.employerContributions.pf)}
                 </div>
                 <div className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-tighter border border-slate-200">
                   Employer ESI: {formatCurrency(salaryBreakdown.employerContributions.esi)}
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmployeeList;