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

      {/* 1. HEADER matching C:\HTML\Payroll-frontend */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
        <div className="absolute left-0 top-0 h-full w-1.5 bg-primary" />
        <div>
          <h1 className="text-xl font-semibold text-text-primary tracking-tight">Run Payroll</h1>
          <p className="text-xs text-text-secondary mt-0.5">Period: {new Date(month).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <input 
            type="month" 
            value={month} 
            onChange={(e) => setMonth(e.target.value)}  
            className="px-3.5 py-2 rounded-lg border border-gray-300 text-sm font-medium text-text-primary outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
          />
          <button
            onClick={handleRun}
            disabled={loading || runData?.status === "LOCKED"}
            className="
              flex items-center gap-2
              bg-primary hover:bg-primary-hover text-white
              px-5 py-2 rounded-lg
              font-semibold text-xs shadow-sm
              transition-all
              active:scale-95
              disabled:bg-gray-300
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard label="Employees" value={runData.totals.totalEmployees} icon={<MdPerson size={20} />} color="indigo" />
            <StatCard label="Gross Total" value={format(runData.totals.gross)} icon={<MdAttachMoney size={20} />} color="emerald" />
            <StatCard label="Deductions" value={format(runData.totals.deductions)} icon={<MdMoneyOff size={20} />} color="rose" />
            <StatCard label="Net Disbursed" value={format(runData.totals.netPay)} icon={<MdCheckCircle size={20} />} color="purple" />
          </div>

          {/* 3. APPROVAL SECTION WITH SEARCH */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 bg-white border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${runData.status === 'LOCKED' ? 'bg-danger' : 'bg-primary'}`} />
                <h3 className="font-semibold text-text-primary text-sm">State: {runData.status}</h3>
              </div>

              {/* CENTER SEARCH BAR */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input 
                  type="text" 
                  placeholder="Search employee by Name..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              
              {runData.status !== "LOCKED" && (
                <button 
                  onClick={() => setIsConfirmingLock(true)} 
                  className="flex items-center gap-1.5 bg-gray-900 hover:bg-black text-white px-4 py-1.5 rounded-lg font-semibold text-xs shadow-sm transition-all active:scale-95"
                >
                  <MdLock size={14} /> Finalize & Lock
                </button>
              )}
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className={`w-full text-left ${runData.status === 'LOCKED' ? 'opacity-60' : ''}`}>
                <thead>
                  <tr className="bg-muted border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    <th className="px-6 py-3.5">Employee</th>
                    <th className="px-6 py-3.5">EMP ID</th>
                    <th className="px-6 py-3.5 text-right">Gross</th>
                    <th className="px-6 py-3.5 text-right">Deduction</th>
                    <th className="px-6 py-3.5 text-right">Net Pay</th>
                    <th className="px-6 py-3.5 text-center">Approval</th> 
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {paginatedEmployees.map(e => (
                    <tr key={e._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-text-primary">{e.employeeSnapshot.name}</p>
                        <p className="text-xs text-text-muted">{e.employeeSnapshot.role}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-text-secondary">{e.employeeId}</p>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-text-secondary">{format(e.earnings.gross)}</td>
                      <td className="px-6 py-4 text-right text-danger font-medium">{"- " + format(e.deductions.total)}</td>
                      <td className="px-6 py-4 text-right font-semibold text-primary">{format(e.netPay)}</td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => toggleApproval(e._id, e.status)} disabled={runData.status === "LOCKED"}
                          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase border transition-all ${
                            e.status === "APPROVED" 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {e.status}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION FOOTER */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-3.5 border-t border-gray-200 text-xs">
              <p className="text-text-muted font-medium">Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredEmployees.length)} of {filteredEmployees.length} records</p>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1} 
                  className="px-2.5 py-1 border border-gray-300 rounded-lg bg-white disabled:opacity-40 hover:bg-gray-50 text-xs font-medium"
                >
                  Prev
                </button>
                {getPaginationGroup().map((item, i) => (
                  <button 
                    key={i} 
                    onClick={() => typeof item === "number" && setCurrentPage(item)}
                    className={`min-w-[28px] h-7 rounded-lg border text-xs font-semibold transition-all ${
                      currentPage === item 
                        ? "bg-primary text-white border-primary" 
                        : "bg-white text-text-secondary border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {item}
                  </button>
                ))}
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                  disabled={currentPage === totalPages} 
                  className="px-2.5 py-1 border border-gray-300 rounded-lg bg-white disabled:opacity-40 hover:bg-gray-50 text-xs font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  const borders = {
    indigo: "border-l-primary text-primary",
    emerald: "border-l-success text-success",
    rose: "border-l-danger text-danger",
    purple: "border-l-warning text-warning"
  };
  const currentBorder = borders[color] || borders.indigo;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className={`flex items-start gap-3 border-l-4 pl-3.5 ${currentBorder.split(' ')[0]}`}>
        <div className={`mt-0.5 ${currentBorder.split(' ')[1]}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-semibold text-text-primary mt-1">{value}</p>
        </div>
      </div>
    </div>
  );
}