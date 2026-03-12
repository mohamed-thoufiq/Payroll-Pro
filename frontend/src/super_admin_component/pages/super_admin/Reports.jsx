import { useState, useEffect } from "react";
import axios from "axios"; // Ensure axios is installed
import { 
  MdAssessment, MdPayments, MdSecurity, 
  MdPieChart, MdTrendingUp, MdCalendarToday 
} from "react-icons/md";
import { downloadReport } from "../../../utils/downloadReport";

export default function Reports() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if payroll is locked whenever month changes
  useEffect(() => {
    const checkStatus = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        // We call a simple endpoint to get the status of the payroll run
        const res = await axios.get(`${API_URL}/api/payroll/payroll-status?month=${month}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // If status is COMPLETED, we enable reports
        setIsLocked(res.data.status === "LOCKED");
      } catch (err) {
        setIsLocked(false);
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, [month]);

  const reportCards = [
    {
      title: "Monthly Salary Register",
      category: "Payroll",
      icon: <MdPayments />,
      gradient: "from-indigo-500 to-purple-600",
      url: `/api/reports/salary-register?month=${month}`,
      filename: `Salary_Register_${month}.xlsx`
    },
    {
      title: "Statutory PF & ESI",
      category: "Statutory",
      icon: <MdSecurity />,
      gradient: "from-emerald-400 to-teal-600",
      url: `/api/reports/statutory?month=${month}`,
      filename: `PF_ESI_Report_${month}.xlsx`
    },
    {
      title: "Departmental Cost Analysis",
      category: "Organization",
      icon: <MdPieChart />,
      gradient: "from-blue-500 to-cyan-500",
      url: `/api/reports/department-cost?month=${month}`,
      filename: `Department_Cost_${month}.xlsx`
    },
    {
      title: "Professional Tax (PT) Summary",
      category: "Statutory",
      icon: <MdAssessment />,
      gradient: "from-orange-400 to-rose-500",
      url: `/api/reports/professional-tax?month=${month}`,
      filename: `Professional_Tax_${month}.xlsx`
    },
    {
      title: "Bank Disbursement Advice",
      category: "Payroll",
      icon: <MdTrendingUp />,
      gradient: "from-violet-500 to-fuchsia-600",
      url: `/api/reports/bank-advice?month=${month}`,
      filename: `Bank_Advice_${month}.xlsx`
    }
  ];

  return (
    <div className="p-6">
      {/* 1. Month Selection Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-black text-slate-800">Payroll Reports</h2>
          <p className="text-sm text-slate-500">Select a month to download compliance and accounting files.</p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
          <MdCalendarToday className="text-indigo-600 ml-2" />
          <input 
            type="month" 
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-transparent border-none outline-none font-bold text-slate-700 cursor-pointer"
          />
        </div>
      </div>

      {/* 2. Lock Warning */}
      {!isLocked && !loading && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-700">
          <div className="animate-pulse h-2 w-2 rounded-full bg-amber-500" />
          <span className="text-sm font-medium">Payroll for {month} is not yet finalized/locked. Reports are currently disabled.</span>
        </div>
      )}

      {/* 3. Grid of Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${!isLocked ? 'opacity-50 grayscale-[0.5]' : 'opacity-100'}`}>
        {reportCards.map((r, i) => (
          <ReportActionCard 
            key={i} 
            {...r} 
            disabled={!isLocked} 
            onClick={() => isLocked && downloadReport(r.url, r.filename)} 
          />
        ))}
      </div>
    </div>
  );
}

function ReportActionCard({ title, icon, category, gradient, onClick, disabled }) {
  return (
    <div
      onClick={disabled ? null : onClick}
      className={`group relative overflow-hidden rounded-2xl p-0.5 bg-gradient-to-br ${gradient}
      shadow-md transition-all ${disabled ? 'cursor-not-allowed' : 'hover:scale-[1.02] cursor-pointer'}`}
    >
      <div className="bg-white/95 backdrop-blur-md rounded-[14px] p-6 h-full flex flex-col relative">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
            {icon}
          </div>
          <span className="text-[9px] font-black px-2 py-1 bg-slate-100 text-slate-500 rounded-md uppercase">
            {category}
          </span>
        </div>

        <h3 className="text-base font-black text-slate-800 mb-2">{title}</h3>

        <div className={`mt-6 flex items-center gap-2 ${disabled ? 'text-slate-400' : 'text-indigo-600'}`}>
          <span className="text-[10px] font-black uppercase">
            {disabled ? "Locked" : "Generate Report"}
          </span>
        </div>
      </div>
    </div>
  );
}