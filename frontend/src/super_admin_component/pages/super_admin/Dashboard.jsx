import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { Calendar } from "lucide-react";
import { 
  MdPeople,
  MdAccountBalanceWallet,
  MdAssignmentReturn,
  MdTrendingUp,
} from "react-icons/md";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { API_URL } from "../../../config/api.js";

export default function Dashboard() {
  const { token, user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllLegend, setShowAllLegend] = useState(false);

  const role = user?.role?.toLowerCase().replace(/\s+/g, '') || 'superadmin';
  const isFinance = role === 'finance';
  const isPayrollAdmin = role === 'payrolladmin';
  const isHrAdmin = role === 'hradmin';

  const dashboardTitle = isFinance 
    ? "Finance Dashboard" 
    : isPayrollAdmin 
    ? "Payroll Admin Dashboard" 
    : isHrAdmin 
    ? "HR Admin Dashboard" 
    : "Super Admin Dashboard";

  const dashboardSubtitle = isFinance
    ? "Overview of finalized payroll disbursements, audit logs, and operational spend"
    : isPayrollAdmin
    ? "Overview of payroll processing and employee salary status"
    : isHrAdmin
    ? "Overview of employee headcount, compensation distribution, and department allocations"
    : "Overview of company payroll processing, employee headcount, and expenditure";

  const chartThemeColor = isFinance
    ? "#059669" // Emerald Green for Finance
    : isPayrollAdmin
    ? "#DC2626" // Red for Payroll Admin
    : "#EAB308"; // Golden Yellow for Super Admin & HR Admin

  const COLORS = isFinance 
    ? ['#059669', '#10B981', '#34D399', '#047857', '#6EE7B7', '#065F46']
    : isPayrollAdmin 
    ? ['#DC2626', '#EF4444', '#F87171', '#B91C1C', '#64748B', '#475569']
    : ['#EAB308', '#F59E0B', '#FBBF24', '#71717A', '#3F3F46', '#D97706'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/superadmin/dashboardsummary`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!data) return <div className="p-8 text-danger font-medium">Failed to load dashboard data</div>;

  const formatFullCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

  const formatMonthLabel = (str) => {
    if (!str) return '';
    try {
      const parts = str.split('-');
      if (parts.length === 2) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        if (!isNaN(year) && !isNaN(month)) {
          const d = new Date(year, month - 1, 1);
          return d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
        }
      }
    } catch {
      // fallback
    }
    return str;
  };

  const trendList = (data?.payrollTrend || []).map((p) => ({
    month: p.month,
    formattedMonth: formatMonthLabel(p.month),
    total: Number(p.total ?? p.payroll ?? 0),
    payroll: Number(p.payroll ?? p.total ?? 0),
    gross: Number(p.gross ?? 0)
  }));

  const deptList = (data?.departmentStats || [])
    .map((d) => ({
      department: d.department || d.name || "General",
      name: d.name || d.department || "General",
      totalSalary: Number(d.totalSalary ?? d.value ?? 0),
      count: d.count || 1
    }))
    .filter((d) => d.totalSalary > 0);

  const legendToShow = showAllLegend ? deptList : deptList.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary">
          {dashboardTitle}
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          {dashboardSubtitle}
        </p>
      </div>
      
      {/* 1. KPI Cards Grid with Left-Border Accents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Kpi
          label="Total Employees"
          value={data.overview.totalEmployees}
          subtext="Active on payroll"
          icon={<MdPeople size={22} />}
          accent={isFinance ? "green" : isPayrollAdmin ? "red" : "orange"}
        />

        <Kpi
          label="Monthly Payroll (Gross)"
          value={formatFullCurrency(data.overview.gross)}
          subtext="Current period total"
          icon={<MdAccountBalanceWallet size={22} />}
          accent="green"
        />

        <Kpi
          label="Total Deductions"
          value={formatFullCurrency(data.overview.deductions)}
          subtext="Statutory PF & taxes"
          icon={<MdAssignmentReturn size={22} />}
          accent="red"
        />

        <Kpi
          label="Net Payable"
          value={formatFullCurrency(data.overview.netPay)}
          subtext="Disbursement amount"
          icon={<MdTrendingUp size={22} />}
          accent="orange"
        />
      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- PAYROLL TREND CHART --- */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
            <div>
              <h3 className="text-base font-semibold text-text-primary">Payroll Trend</h3>
              <p className="text-xs text-text-muted mt-0.5">Last 6 months expenditure overview</p>
            </div>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-muted border border-gray-200 rounded-lg text-xs font-medium text-text-secondary">
              <Calendar size={13} style={{ color: chartThemeColor }} />
              FY 2024-25
            </span>
          </div>

          <div className="h-72 w-full">
            {trendList.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-text-muted">
                No payroll trend history available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendList} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPay" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartThemeColor} stopOpacity={0.25}/>
                      <stop offset="95%" stopColor={chartThemeColor} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  
                  <XAxis 
                    dataKey="formattedMonth" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }} 
                    dy={10}
                  />
                  
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }}
                    tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
                    width={70}
                  />
                  
                  <Tooltip 
                    cursor={{ stroke: chartThemeColor, strokeWidth: 1.5 }}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: '1px solid #E2E8F0', 
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                      padding: '10px 14px',
                      fontSize: '12px'
                    }}
                    formatter={(value) => [formatFullCurrency(value), "Disbursed Payroll"]}
                    labelFormatter={(label, payload) => {
                      const item = payload?.[0]?.payload;
                      return item?.month ? `Period: ${item.month}` : label;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke={chartThemeColor} 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorPay)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* --- DEPARTMENT DISTRIBUTION --- */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-text-primary">Department Spend</h3>
            <p className="text-xs text-text-muted mt-0.5">Allocation by operational team</p>
          </div>

          <div className="h-56 w-full my-3 flex items-center justify-center">
            {deptList.length === 0 ? (
              <div className="text-xs text-text-muted text-center py-8">
                No department spend data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptList}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="totalSalary"
                    nameKey="department"
                  >
                    {deptList.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [formatFullCurrency(value), "Net Spend"]}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: '1px solid #E2E8F0', 
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Department Legend */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            {deptList.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-2">No departments to display</p>
            ) : (
              legendToShow.map((dept, index) => (
                <div key={`${dept.department}-${index}`} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span 
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></span>
                    <span className="text-text-secondary font-medium truncate max-w-[120px]" title={dept.department}>
                      {dept.department}
                    </span>
                    {dept.count && (
                      <span className="text-[10px] text-text-muted tabular-nums">({dept.count})</span>
                    )}
                  </div>
                  <span className="font-semibold text-text-primary flex-shrink-0 tabular-nums">
                    {formatFullCurrency(dept.totalSalary)}
                  </span>
                </div>
              ))
            )}

            {deptList.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAllLegend(!showAllLegend)}
                className="text-xs text-primary font-medium hover:underline pt-1 block"
              >
                {showAllLegend ? "Show Less" : `+${deptList.length - 5} More`}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

/* ===== KPI CARD COMPONENT WITH LEFT BORDER ACCENT ===== */
function Kpi({ label, value, subtext, icon, accent = "primary" }) {
  const accentStyles = {
    green: "border-l-success text-success",
    red: "border-l-danger text-danger",
    primary: "border-l-primary text-primary",
    orange: "border-l-warning text-warning",
  };

  const currentAccent = accentStyles[accent] || accentStyles.primary;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className={`flex items-start gap-4 border-l-4 pl-4 ${currentAccent.split(' ')[0]}`}>
        <div className={`mt-0.5 ${currentAccent.split(' ')[1]}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium text-text-secondary">{label}</p>
          <p className="text-2xl font-semibold text-text-primary mt-1 tabular-nums tracking-tight">{value}</p>
          {subtext && (
            <p className="text-xs text-text-muted mt-1">{subtext}</p>
          )}
        </div>
      </div>
    </div>
  );
}