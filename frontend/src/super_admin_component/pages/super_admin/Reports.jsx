import { useState, useEffect } from "react";
import axios from "axios"; // Ensure axios is installed
import { 
  MdAssessment, MdPayments, MdSecurity, 
  MdPieChart, MdTrendingUp, MdCalendarToday 
} from "react-icons/md";
import { downloadReport } from "../../../utils/downloadReport";
import { API_URL } from "../../../config/api.js";

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
    <div className="space-y-6">
      {/* 1. Header & Month Selection */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Payroll Reports</h2>
          <p className="text-sm text-text-secondary mt-0.5">Select a month to download compliance and accounting files.</p>
        </div>

        <div className="flex items-center gap-2.5 bg-muted px-3.5 py-2 rounded-lg border border-gray-200 self-start sm:self-auto">
          <MdCalendarToday className="text-primary text-base" />
          <input 
            type="month" 
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-transparent border-none outline-none font-medium text-sm text-text-primary cursor-pointer"
          />
        </div>
      </div>

      {/* 2. Lock Warning */}
      {!isLocked && !loading && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-800 text-sm">
          <div className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
          <span>Payroll for <strong>{month}</strong> is not yet finalized/locked. Reports are disabled until payroll is locked.</span>
        </div>
      )}

      {/* 3. Grid of Report Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 transition-opacity duration-300 ${!isLocked ? 'opacity-55' : 'opacity-100'}`}>
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

function ReportActionCard({ title, icon, category, onClick, disabled }) {
  return (
    <div
      onClick={disabled ? null : onClick}
      className={`bg-white border border-gray-200 rounded-xl p-5 shadow-sm transition-all flex flex-col justify-between ${
        disabled 
          ? 'cursor-not-allowed opacity-80' 
          : 'hover:border-primary hover:shadow-md cursor-pointer group'
      }`}
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="p-2.5 rounded-lg bg-blue-50 text-primary border border-blue-100 text-xl group-hover:bg-primary group-hover:text-white transition-colors">
            {icon}
          </div>
          <span className="text-xs font-medium px-2.5 py-1 bg-muted text-text-secondary rounded-full">
            {category}
          </span>
        </div>

        <h3 className="text-base font-semibold text-text-primary mb-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-xs text-text-muted">
          Official statutory and payroll export file
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className={`text-xs font-semibold ${disabled ? 'text-text-muted' : 'text-primary group-hover:underline'}`}>
          {disabled ? "Locked" : "Download Report (XLSX) →"}
        </span>
        <span className="text-[10px] text-text-muted uppercase font-mono">Excel</span>
      </div>
    </div>
  );
}