import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { Calendar } from "lucide-react";
import { 
  MdPeople,                // Total Employees
  MdAccountBalanceWallet,  // Monthly Payroll
  MdAssignmentReturn,      // Total Deductions
  MdTrendingUp,            // Avg. Salary
 
} from "react-icons/md";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function Dashboard() {
  const { token } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllLegend, setShowAllLegend] = useState(false); // <-- NEW STATE

  const COLORS = ['#2A9D8F', '#264653', '#E9C46A', '#F4A261', '#E76F51'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/superadmin/dashboardsummary`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();
        setData(result);
        console.log(result);
        
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
  
  if (!data) return <div className="p-10 text-red-500">Failed to load data</div>;

  const formatFullCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  // Limit department legend to first 5 if showAllLegend is false
  const legendToShow = showAllLegend ? data.departmentStats : data.departmentStats.slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* 1. Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Employees - Indigo/Violet (Stability & Growth) */}
        <StatCard 
          label="Total Employees"
          value={data.overview.totalEmployees}
          subtext="Active on payroll(Latest)" 
          icon={<MdPeople />}
          colorGradient="from-indigo-500 to-purple-600"
        />

        {/* Monthly Payroll - Emerald/Teal (Wealth & Success) */}
        <StatCard 
          label="Monthly Payroll(Gross)"
          value={formatFullCurrency(data.overview.gross)}
          subtext="Current month total" 
          icon={<MdAccountBalanceWallet />}
          colorGradient="from-emerald-400 to-teal-600"
        />

        {/* Total Deductions - Orange/Rose (Caution & Precision) */}
        <StatCard 
          label="Total Deductions"
          value={formatFullCurrency(data.overview.deductions)}
          subtext="Statutory deductions" 
          icon={<MdAssignmentReturn />}
          colorGradient="from-orange-400 to-rose-500"
        />

        {/* Avg. Salary - Blue/Cyan (Clarity & Benchmark) */}
        <StatCard 
          label="Net Payable"
          value={formatFullCurrency(data.overview.netPay)}
          subtext="After Deductions" 
          icon={<MdTrendingUp />}
          colorGradient="from-blue-500 to-cyan-500"
        />
      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- REAL PAYROLL TREND CHART --- */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl p-0.5 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
          <div className="bg-white/95 backdrop-blur-md rounded-[14px] p-4 md:p-6 h-full flex flex-col relative">
            
            {/* Right-side Accent Bar */}
            <div className="absolute right-0 top-1/4 bottom-1/4 w-1.5 rounded-l-full bg-gradient-to-b from-indigo-500 to-purple-600" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-content-primary tracking-tight">Payroll Trend</h2>
                <p className="text-[10px] font-bold text-content-muted uppercase tracking-widest">Last 6 months overview</p>
              </div>
              <button className="flex items-center gap-2 px-3 py-2 border border-surface-200 rounded-xl text-[11px] font-bold text-content-secondary hover:bg-surface-50 transition shadow-sm bg-white">
                <Calendar size={14} className="text-indigo-600" />
                FY 2024-25
              </button>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.payrollTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPay" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }} 
                    dy={15}
                  />
                  
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }}
                    tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
                    width={70}
                  />
                  
                  <Tooltip 
                    cursor={{ stroke: '#6366F1', strokeWidth: 2 }}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                      padding: '12px'
                    }}
                  />
                  
                  <Area 
                    type="monotone" 
                    dataKey="payroll" 
                    stroke="#6366F1" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorPay)" 
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#4F46E5' }} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* --- DEPARTMENT PIE CHART --- */}
        <div className="relative overflow-hidden rounded-2xl p-0.5 bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg">
          <div className="bg-white/95 backdrop-blur-md rounded-[14px] p-5 md:p-6 h-full flex flex-col relative">
            
            {/* Right-side Accent Bar */}
            <div className="absolute right-0 top-1/4 bottom-1/4 w-1.5 rounded-l-full bg-gradient-to-b from-emerald-400 to-teal-600" />

            <div className="mb-6">
              <h2 className="text-lg font-extrabold text-content-primary tracking-tight">By Department</h2>
              <p className="text-[10px] font-bold text-content-muted uppercase tracking-widest">Headcount distribution</p>
            </div>

            <div className="h-52 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.departmentStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {data.departmentStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Total Centered Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-content-primary leading-none">{data.overview.totalEmployees}</span>
                <span className="text-[9px] font-bold text-content-muted uppercase">Total</span>
              </div>
            </div>

            {/* Custom Legend */}
            <div className="space-y-2 mt-4 flex-1">
              {legendToShow.map((dept, idx) => (
                <div key={idx} className="flex justify-between items-center group/item transition-colors">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="text-xs font-bold text-content-secondary truncate max-w-[120px] group-hover/item:text-content-primary transition-colors">
                      {dept.name}
                    </span>
                  </div>
                  <span className="text-xs font-black text-content-primary bg-surface-100 px-2 py-0.5 rounded-md">
                    {dept.value}
                  </span>
                </div>
              ))}

              {data.departmentStats.length > 5 && (
                <button
                  onClick={() => setShowAllLegend(!showAllLegend)}
                  className="w-full text-center mt-3 text-[10px] font-black text-indigo-600 hover:text-indigo-800 transition uppercase tracking-widest"
                >
                  {showAllLegend ? "Show Less" : "Show More"}
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Reusable Card Component
 function StatCard({ label, value, subtext, trend, icon, colorGradient }) {
  // colorGradient example: "from-blue-500 to-indigo-600"
  
  return (
    <div className={`relative overflow-hidden rounded-2xl p-0.5 bg-gradient-to-br ${colorGradient} shadow-lg transition-transform hover:scale-[1.02] duration-300`}>
      
      {/* The main white glass card */}
      <div className="bg-white/95 backdrop-blur-md rounded-[14px] p-5 h-full flex flex-col justify-between relative">
        
        {/* Right-side Accent Bar */}
        <div className={`absolute right-0 top-1/4 bottom-1/4 w-1.5 rounded-l-full bg-gradient-to-b ${colorGradient}`} />

        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-content-muted uppercase tracking-widest truncate">
              {label}
            </p>
            
            {/* Dynamic Value: Adjusts size based on length */}
            <h3 className={`font-extrabold text-content-primary mt-1 leading-none break-all
              ${value.length > 10 ? 'text-lg' : 'text-2xl'}
            `}>
              {value}
            </h3>
          </div>

          {/* Icon with soft glass effect */}
          <div className={`flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br ${colorGradient} text-white shadow-sm`}>
            <span className="text-xl">{icon}</span>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-1">
          {subtext && (
            <p className="text-[11px] text-content-subtle font-medium truncate">
              {subtext}
            </p>
          )}
          
          {trend && (
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md 
                ${trend.startsWith('+') ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                {trend}
              </span>
              <span className="text-[10px] text-content-muted font-medium">vs last month</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}