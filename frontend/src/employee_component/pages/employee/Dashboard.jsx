import { useContext, useEffect, useState } from 'react';
import { AuthContext } from "../../../context/AuthContext";
import { FiTrendingUp, FiPieChart, FiArrowDownRight, FiFileText, FiActivity, FiArrowRight } from "react-icons/fi";
import axios from "axios";
import KpiCard from '../../../components/kpiCard.jsx';
import { API_URL } from "../../../config/api";

export default function Dashboard() {
  const { user, token } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [latestPayslip, setLatestPayslip] = useState(null);
  const [stats, setStats] = useState({
    netPay: 0,
    gross: 0,
    deductions: 0,
    count: 0,
    monthName: ""
  });

  useEffect(() => {
    if (!token) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/payslips/my-payslips`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const payslips = res.data;
        
        if (payslips && payslips.length > 0) {
          const latest = payslips[0];
          setLatestPayslip(latest); // Store the full object for the breakdown
          setStats({
            netPay: latest.netPay,
            gross: latest.gross,
            deductions: latest.deductions?.total || 0,
            count: payslips.length,
            monthName: latest.month
          });
        }
      } catch (err) {
        console.error('Dashboard fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Good day, {user?.name?.split(' ')[0] || 'Employee'}! 👋
          </h2>
          <p className="text-slate-500 font-medium">
            Summary for <span className="text-blue-600 font-bold">{stats.monthName || 'this period'}</span>
          </p>
        </div>
        <div className="hidden md:block text-right">
           <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Today</div>
           <div className="text-lg font-bold text-slate-700">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Net Pay" value={money(stats.netPay)} subtitle="Take-home" accent="green" />
        <KpiCard title="Gross Salary" value={money(stats.gross)} subtitle="Before Tax" accent="primary" />
        <KpiCard title="Deductions" value={money(stats.deductions)} subtitle="PF & Taxes" accent="red" />
        <KpiCard title="Payslips" value={stats.count} subtitle="Total Records" accent="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Monthly Breakdown (Same Pinch Style) */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
             <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                   <FiActivity className="text-blue-600" /> {stats.monthName} Breakdown
                </h3>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full uppercase tracking-tighter">Live Data</span>
             </div>
             
             <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Earnings Column */}
                <div className="space-y-4">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Earnings</p>
                   <BreakdownRow label="Basic Salary" value={latestPayslip?.earnings?.basic} />
                   <BreakdownRow label="HRA" value={latestPayslip?.earnings?.hra} />
                   <BreakdownRow label="Special Allowance" value={latestPayslip?.earnings?.specialAllowance} />
                   <BreakdownRow label="Total Reimbursement" value={latestPayslip?.reimbursements?.total} />
                   <div className="pt-4 border-t border-dashed flex justify-between font-bold text-slate-900">
                      <span>Total Gross</span>
                      <span>{money(latestPayslip?.gross)}</span>
                   </div>
                </div>

                {/* Deductions Column */}
                <div className="space-y-4">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Deductions</p>
                   <BreakdownRow label="Provident Fund" value={latestPayslip?.deductions?.pf} isRed />
                   <BreakdownRow label="Professional Tax" value={latestPayslip?.deductions?.pt} isRed />
                   <BreakdownRow label="ESI" value={latestPayslip?.deductions?.esi} isRed />
                   <BreakdownRow label="LOP" value={latestPayslip?.deductions?.lop} isRed />
                   <div className="pt-4 border-t border-dashed flex justify-between font-bold text-rose-600">
                      <span>Total Deductions</span>
                      <span>-{money(latestPayslip?.deductions?.total)}</span>
                   </div>
                </div>
             </div>
            
          </div>
          
          
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function BreakdownRow({ label, value, isRed }) {
    return (
        <div className="flex justify-between items-center group">
            <span className="text-sm text-slate-500 group-hover:text-slate-800 transition-colors">{label}</span>
            <span className={`text-sm font-bold ${isRed ? 'text-rose-500' : 'text-slate-700'}`}>
                {isRed && value > 0 ? '-' : ''}{money(value)}
            </span>
        </div>
    )
}

function LegendRow({ color, label, value }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`}></div>
            <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase leading-none tracking-tighter">{label}</span>
                <span className="text-sm font-black text-slate-700">{value}</span>
            </div>
        </div>
    )
}

function money(v) {
  return v ? `₹${Number(v).toLocaleString("en-IN")}` : "₹0";
}