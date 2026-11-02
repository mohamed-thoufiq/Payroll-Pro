import { useContext, useEffect, useState } from 'react';
import { AuthContext } from "../../../context/AuthContext";
import { FiFileText, FiCalendar } from "react-icons/fi";
import axios from "axios";
import KpiCard from '../../../components/kpiCard.jsx';
import { API_URL } from "../../../config/api.js";

export default function Dashboard() {
  const { user, token } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [isWakingServer, setIsWakingServer] = useState(false);
  const [latestPayslip, setLatestPayslip] = useState(null);
  const [stats, setStats] = useState({
    netPay: 0,
    gross: 0,
    deductions: 0,
    count: 0,
    monthName: ""
  });

  // ⏳ Detect cold-start on employee dashboard fetch
  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => setIsWakingServer(true), 2500);
    } else {
      setIsWakingServer(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

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
          setLatestPayslip(latest);
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

  // ⚡ Instant App Shell / Skeleton Dashboard
  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-text-primary tracking-tight">
            Payroll Overview
          </h2>
          <p className="text-sm text-text-secondary">
            Synchronizing latest payslip records for {user?.name || 'Employee'}...
          </p>
        </div>

        {isWakingServer && (
          <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-start sm:items-center gap-3 text-amber-900 text-xs shadow-sm animate-pulse">
            <span className="text-lg leading-none">⏳</span>
            <div>
              <span className="font-semibold block">Connecting to cloud server...</span>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Free-tier server is spinning up (~20–30s). Your employee dashboard will appear automatically.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {["Net Pay", "Gross Salary", "Total Deductions", "Payslips Available"].map((label, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-7 w-28 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-2.5 w-16 bg-gray-100 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="h-4 w-36 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-32 bg-gray-50 rounded-lg border border-dashed border-gray-200 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-text-primary tracking-tight">
          Payroll Overview
        </h2>
        <p className="text-sm text-text-secondary">
          Current period earnings and salary distribution for {user?.name || 'Employee'}
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Net Pay (This Month)"
          value={money(stats.netPay)}
          subtitle={stats.monthName ? `${stats.monthName} Salary` : "Latest Period"}
          accent="green"
        />
        <KpiCard
          title="Gross Salary"
          value={money(stats.gross)}
          subtitle="Before deductions"
          accent="primary"
        />
        <KpiCard
          title="Total Deductions"
          value={money(stats.deductions)}
          subtitle="PF, PT & Taxes"
          accent="red"
        />
        <KpiCard
          title="Payslips Available"
          value={stats.count}
          subtitle="Total Records"
          accent="orange"
        />
      </div>

      {/* Main Grid: Breakdown & Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Monthly Breakdown */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
            <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <FiFileText className="text-primary" />
              {stats.monthName ? `${stats.monthName} Salary Breakdown` : "Monthly Breakdown"}
            </h3>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-primary border border-blue-100">
              Active
            </span>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Earnings Column */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-text-secondary">
                Earnings breakdown
              </p>
              <BreakdownRow label="Basic Salary" value={latestPayslip?.earnings?.basic} />
              <BreakdownRow label="HRA" value={latestPayslip?.earnings?.hra} />
              <BreakdownRow label="Special Allowance" value={latestPayslip?.earnings?.specialAllowance} />
              <BreakdownRow label="Reimbursements" value={latestPayslip?.reimbursements?.total} />
              <div className="pt-3 border-t border-dashed flex justify-between font-semibold text-text-primary text-sm tabular-nums">
                <span>Total Gross</span>
                <span>{money(latestPayslip?.gross)}</span>
              </div>
            </div>

            {/* Deductions Column */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-text-secondary">
                Deductions breakdown
              </p>
              <BreakdownRow label="Provident Fund (PF)" value={latestPayslip?.deductions?.pf} isRed />
              <BreakdownRow label="Professional Tax (PT)" value={latestPayslip?.deductions?.pt} isRed />
              <BreakdownRow label="ESI" value={latestPayslip?.deductions?.esi} isRed />
              <BreakdownRow label="Loss of Pay (LOP)" value={latestPayslip?.deductions?.lop} isRed />
              <div className="pt-3 border-t border-dashed flex justify-between font-semibold text-danger text-sm tabular-nums">
                <span>Total Deductions</span>
                <span>-{money(latestPayslip?.deductions?.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Attendance Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <FiCalendar className="text-primary" size={18} />
              <h3 className="font-semibold text-text-primary text-base">Attendance Summary</h3>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-1">
                <span className="text-text-secondary">Payable Days</span>
                <span className="font-semibold text-text-primary tabular-nums">{latestPayslip?.attendance?.payableDays || 30}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-text-secondary">Present Days</span>
                <span className="font-semibold text-text-primary tabular-nums">{latestPayslip?.attendance?.presentDays || 28}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-text-secondary">Loss of Pay (LOP)</span>
                <span className={`font-semibold tabular-nums ${latestPayslip?.attendance?.lopDays > 0 ? 'text-danger' : 'text-text-primary'}`}>
                  {latestPayslip?.attendance?.lopDays || 0}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-text-muted pt-3 border-t border-gray-100">
            Attendance impacts payable days and automatic monthly salary calculation.
          </p>
        </div>
      </div>
    </div>
  );
}

function BreakdownRow({ label, value, isRed }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-text-secondary">{label}</span>
      <span className={`font-medium tabular-nums ${isRed ? 'text-danger' : 'text-text-primary'}`}>
        {isRed && value > 0 ? '-' : ''}{money(value)}
      </span>
    </div>
  );
}

function money(v) {
  return v ? `₹${Number(v).toLocaleString("en-IN")}` : "₹0";
}