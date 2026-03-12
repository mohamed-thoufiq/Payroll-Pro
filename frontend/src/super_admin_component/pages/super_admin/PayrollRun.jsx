import { useEffect, useState, useContext } from "react";
import { 
  MdPlayArrow, MdLock, MdCheckCircle, MdRefresh, 
  MdPerson, MdAttachMoney, MdMoneyOff, MdWarning 
} from "react-icons/md";
import { Eye, Search, X } from "lucide-react"; // Matching EmployeeList icons
import { AuthContext } from "../../../context/AuthContext";
import api from "../../../utils/api"; 

const ITEMS_PER_PAGE = 5;

export default function PayrollRun() {
  const { token } = useContext(AuthContext);
  
  // State
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(false);
  const [runData, setRunData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [msg, setMsg] = useState(null);

  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1); 
  const [isConfirmingLock, setIsConfirmingLock] = useState(false);

  /* ===================== FETCH DATA ===================== */
  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/payroll/details?month=${month}`);
      if (res.data.status === "NOT_STARTED") {
        setRunData(null);
        setEmployees([]);
      } else {
        setRunData(res.data.run);
        setEmployees(res.data.employees);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayroll(); }, [month]);

  /* ===================== SEARCH & FILTER ===================== */
/* ===================== SEARCH & FILTER ===================== */
useEffect(() => {
  const term = searchTerm.toLowerCase();

  const filtered = employees.filter(e =>
    e.employeeSnapshot?.name?.toLowerCase().includes(term) ||
    e.employeeId?.toLowerCase().includes(term)
  );

  setFilteredEmployees(filtered);
}, [searchTerm, employees]); // Keep employees here to update the list...

// Separate effect to reset page ONLY on search
useEffect(() => {
  setCurrentPage(1);
}, [searchTerm]); // ...but only reset page 1 when the user types a search
  /* ===================== PAGINATION LOGIC ===================== */
  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getPaginationGroup = () => {
    let pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) pages = [1, 2, 3, 4, 5, "...", totalPages];
      else if (currentPage >= totalPages - 3) pages = [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      else pages = [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
    }
    return pages;
  };

  /* ===================== ACTIONS ===================== */
  const handleRun = async () => {
    try {
      setLoading(true);
      const res = await api.post("/payroll/run", { month });
      setMsg({ type: "success", text: res.data.message });
      await fetchPayroll();
    } catch (err) {
      setMsg({ type: "error", text: "Run failed" });
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const toggleApproval = async (empId, currentStatus) => {
    if (runData?.status === "LOCKED") return; 
    const newStatus = currentStatus === "APPROVED" ? "DRAFT" : "APPROVED";
    setEmployees(prev => prev.map(e => e._id === empId ? { ...e, status: newStatus } : e));
    try {
      await api.post("/payroll/toggle-approval", { payrollEmployeeId: empId, status: newStatus });
    } catch (err) {
      fetchPayroll();
    }
  };

  const handleLock = async () => {
    setIsConfirmingLock(false);
    try {
      setLoading(true);
      await api.post("/payroll/lock", { payrollRunId: runData._id });
      setMsg({ type: "success", text: "Locked Successfully" });
      fetchPayroll();
    } catch (err) {
      setMsg({ type: "error", text: "Locking failed" });
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const format = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      
      {/* 0. LOCK CONFIRMATION DIALOG */}
      {isConfirmingLock && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6">
              <MdLock size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Finalize Payroll?</h2>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-2">Action is permanent and cannot be undone.</p>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setIsConfirmingLock(false)} className="flex-1 px-6 py-3 rounded-xl font-black text-[10px] text-slate-400">CANCEL</button>
              <button onClick={handleLock} className="flex-1 bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px]">CONFIRM LOCK</button>
            </div>
          </div>
        </div>
      )}

      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute left-0 top-0 h-full w-1.5 bg-indigo-600" />
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Run Payroll</h1>
          <p className="text-xs font-bold text-slate-400 uppercase mt-1">Period: {new Date(month).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none" />
          <button
            onClick={handleRun}
            disabled={loading || runData?.status === "LOCKED"}
            className="
              flex items-center gap-2
              bg-indigo-600 text-white
              px-6 py-2.5 rounded-xl
              font-black text-xs shadow-lg
              transition-all

              active:scale-95

              disabled:bg-indigo-300
              disabled:text-white/70
              disabled:shadow-none
              disabled:cursor-not-allowed
              disabled:active:scale-100
            "
          >
            {loading ? (
              <MdRefresh className="animate-spin" size={18} />
            ) : (
              <MdPlayArrow size={18} />
            )}
            {runData ? "RE-CALCULATE" : "INITIATE RUN"}
          </button>

        </div>
      </div>

      {runData && (
        <>
          {/* 2. STATS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard label="Employees" value={runData.totals.totalEmployees} icon={<MdPerson/>} color="indigo" />
            <StatCard label="Gross" value={format(runData.totals.gross)} icon={<MdAttachMoney/>} color="emerald" />
            <StatCard label="Deductions" value={format(runData.totals.deductions)} icon={<MdMoneyOff/>} color="rose" />
            <StatCard label="Net Payable" value={format(runData.totals.netPay)} icon={<MdCheckCircle/>} color="purple" />
          </div>

          {/* 3. APPROVAL SECTION WITH SEARCH */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden relative">
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${runData.status === 'LOCKED' ? 'bg-rose-500' : 'bg-indigo-500'}`} />
                <h3 className="font-black text-slate-800 text-[10px] uppercase tracking-widest">State: {runData.status}</h3>
              </div>

              {/* CENTER SEARCH BAR */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" placeholder="Search employee by Name ..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                />
              </div>
              
              {runData.status !== "LOCKED" && (
                <button onClick={() => setIsConfirmingLock(true)} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[10px] shadow-lg">
                  <MdLock size={14} /> FINALIZE & LOCK
                </button>
              )}
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className={`w-full text-left ${runData.status === 'LOCKED' ? 'opacity-60' : ''}`}>
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/30 border-b">
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">EMP ID</th>
                    <th className="px-6 py-4 text-right">Gross</th>
                    <th className="px-6 py-4 text-right">Deduction</th>
                    <th className="px-6 py-4 text-right">Net Pay</th>
                    <th className="px-6 py-4 text-center">Approval</th> 
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedEmployees.map(e => (
                    <tr key={e._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-700 text-sm">{e.employeeSnapshot.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{e.employeeSnapshot.role}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-700 text-sm">{e.employeeId}</p>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-black text-sm">{format(e.earnings.gross)}</td>
                      <td className="px-6 py-4 text-right font-black text-red-700 text-sm">{"- "+format(e.deductions.total)}</td>
                      <td className="px-6 py-4 text-right font-black text-indigo-700 text-sm">{format(e.netPay)}</td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => toggleApproval(e._id, e.status)} disabled={runData.status === "LOCKED"}
                          className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase w-24 mx-auto border transition-all
                            ${e.status === "APPROVED" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}
                        >
                          {e.status}
                        </button>
                      </td>
                       
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION FOOTER - Matching EmployeeList */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredEmployees.length)} of {filteredEmployees.length}</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border rounded-xl bg-white disabled:opacity-30">‹</button>
                {getPaginationGroup().map((item, i) => (
                  <button key={i} onClick={() => typeof item === "number" && setCurrentPage(item)}
                    className={`w-8 h-8 rounded-xl border text-[10px] font-black transition-all ${currentPage === item ? "bg-indigo-600 text-white" : "bg-white text-slate-500"}`}
                  >{item}</button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border rounded-xl bg-white disabled:opacity-30">›</button>
              </div>
            </div>
          </div>
        </>
      )}
 
      
    </div>
  );
}
 

function StatCard({ label, value, icon, color }) {
  const colors = { indigo: "from-indigo-500 to-purple-600", emerald: "from-emerald-400 to-teal-600", rose: "from-rose-400 to-red-500", purple: "from-violet-500 to-fuchsia-600" };
  return (
    <div className={`relative overflow-hidden rounded-2xl p-0.5 bg-gradient-to-br ${colors[color]} shadow-md`}>
      <div className="bg-white/95 backdrop-blur-md rounded-[14px] p-5 h-full relative">
        <div className="flex justify-between items-start mb-3">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
           <div className="opacity-80 p-1.5 rounded-lg">{icon}</div>
        </div>
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h3>
      </div>
    </div>
  );
}