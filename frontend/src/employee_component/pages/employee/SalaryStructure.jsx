import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { 
  MdReceiptLong, MdSecurity, MdAccountBalanceWallet, 
  MdInfoOutline, MdCalculate, MdDownload, MdTrendingUp
} from "react-icons/md";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


export default function SalaryStructure() {
  const { token, user } = useContext(AuthContext);
  const [orgConfig, setOrgConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  // Professional Tax Slab Logic (Strictly preserved)
  const P_TAX_SLABS = {
    "Tamil Nadu": [
      { limit: 5000, amount: 200 } 
    ],
    "Default": [{ limit: 0, amount: 100 } ]
  };

  // --- FETCH ORGANIZATION SETTINGS ---
  useEffect(() => {
    const fetchOrgSettings = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/organization/settings", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();
        console.log(result);
        
        setOrgConfig(result);
      } catch (error) {
        console.error("Error fetching statutory data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchOrgSettings();
  }, [token]);

  /* ===================== CALCULATION ENGINE ===================== */
  const calculateFinalBreakdown = () => {
    if (!user || !orgConfig) return null;
    console.log(user);
    
    const ctc = user.employeeDetails?.salary?.ctc || 0;
    const monthlyGross = ctc / 12;
    
    // 1. Earnings Logic
    const basicSalary = monthlyGross * 0.5; // Standard 50%
    const hraPercent = orgConfig.statutoryConfig?.hra?.percentageOfBasic || 40;
    const hra = basicSalary * (hraPercent / 100);
    const specialAllowance = monthlyGross - basicSalary - hra;

    // 2. Deductions Logic (Org-Dependent)
    let pf = 0; let esi = 0; let pt = 0;
    const { pf: pfC, esi: esiC, professionalTax: ptC } = orgConfig.statutoryConfig;

    if (pfC?.enabled) pf = basicSalary * ((pfC.employeeContribution || 12) / 100);
    
    if (esiC?.enabled && monthlyGross <= (esiC.wageLimit || 21000)) {
      esi = monthlyGross * ((esiC.employeeContribution || 0.75) / 100);
    }

    if (ptC?.enabled) {
      const stateName = ptC.state || "Default";
      const slabs = P_TAX_SLABS[stateName] || P_TAX_SLABS["Default"];
      const applicableSlab = slabs.find(s => monthlyGross > s.limit);
      pt = applicableSlab ? applicableSlab.amount : 0;
    }

    return {
      monthlyGross, basicSalary, hra, specialAllowance,
      pf, esi, pt, totalDeductions: pf + esi + pt, 
      netPay: monthlyGross - (pf + esi + pt), ctc
    };
  };

  const b = calculateFinalBreakdown();

  /* ===================== PDF GENERATION ===================== */
  const downloadSalaryPDF = () => {
    if (!b) return; // safety check

    const doc = new jsPDF();
    const indigo = [99, 102, 241];

    // Header
    doc.setFontSize(22);
    doc.setTextColor(...indigo);
    doc.text("Salary Component Matrix", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`Employee: ${user.employeeDetails?.basic?.firstName} ${user.employeeDetails?.basic?.lastName}`, 14, 30);
    doc.text(`Employee ID: ${user.employeeDetails?.basic?.employeeId}`, 14, 35);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 40);

    // AutoTable
    autoTable(doc, {
      startY: 50,
      head: [['Component', 'Monthly (₹)', 'Annual (₹)']],
      body: [
        ['Basic Salary', b.basicSalary.toFixed(2), (b.basicSalary * 12).toFixed(2)],
        ['HRA', b.hra.toFixed(2), (b.hra * 12).toFixed(2)],
        ['Special Allowance', b.specialAllowance.toFixed(2), (b.specialAllowance * 12).toFixed(2)],
        ['PF Deduction', `-${b.pf.toFixed(2)}`, `-${(b.pf * 12).toFixed(2)}`],
        ['ESI Deduction', `-${b.esi.toFixed(2)}`, `-${(b.esi * 12).toFixed(2)}`],
        ['Professional Tax', `-${b.pt.toFixed(2)}`, `-${(b.pt * 12).toFixed(2)}`],
      ],
      headStyles: { fillColor: indigo },
      foot: [['Net Take Home', b.netPay.toFixed(2), (b.netPay * 12).toFixed(2)]],
      footStyles: {
        fillColor: [238, 242, 255],
        textColor: indigo,
        fontStyle: 'bold',
      },
    });

    doc.save(`Salary_${user.employeeDetails?.basic?.employeeId}.pdf`);
  };

  const format = (val) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  }).format(val || 0);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4 animate-pulse">
       <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
       <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Syncing Org Compliance...</p>
    </div>
  );

  const chartData = [
    { name: 'Basic', value: b.basicSalary, color: '#6366F1' },
    { name: 'HRA', value: b.hra, color: '#8B5CF6' },
    { name: 'Allowance', value: b.specialAllowance, color: '#10B981' },
    { name: 'Deductions', value: b.totalDeductions, color: '#F43F5E' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <MdReceiptLong className="text-indigo-600" /> Salary Breakdown
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest text-[10px]">
            Statutory Period FY 2025-26 • {orgConfig?.statutoryConfig?.professionalTax?.state || "Standard"}
          </p>
        </div>
        <button 
          onClick={downloadSalaryPDF}
          className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs shadow-xl active:scale-95 transition-all hover:bg-slate-800"
        >
          <MdDownload size={20} /> DOWNLOAD DETAILED PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. LEFT: THE GLASS-SLAB DATA TABLE */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden relative group">
            <div className="absolute right-0 top-1/4 bottom-1/4 w-1.5 rounded-l-full bg-indigo-600" />
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center px-8">
               <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest">Monthly Itemized Components</h3>
               <MdAccountBalanceWallet className="text-slate-300" size={24} />
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/30">
                    <th className="px-8 py-5">Earnings & Benefits</th>
                    <th className="px-8 py-5 text-right">Credit (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <BreakdownRow label="Basic Salary" value={b.basicSalary} type="plus" />
                  <BreakdownRow label={`House Rent Allowance (HRA)`} subLabel={`${orgConfig.statutoryConfig.hra.percentageOfBasic}% of Basic`} value={b.hra} type="plus" />
                  <BreakdownRow label="Fixed Special Allowance" value={b.specialAllowance} type="plus" />
                  
                  <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-8 py-5">Statutory Deductions</th>
                    <th className="px-8 py-5 text-right">Debit (₹)</th>
                  </tr>
                  
                  <BreakdownRow label="Provident Fund (PF)" subLabel="Employee Contribution" value={b.pf} type="minus" />
                  <BreakdownRow label="Employee State Insurance (ESI)" value={b.esi} type="minus" />
                  <BreakdownRow label="Professional Tax (PT)" value={b.pt} type="minus" />
                  
                  {/* TOTAL NET TAKE HOME ROW */}
                  <tr className="bg-indigo-600 text-white">
                    <td className="px-8 py-8">
                       <p className="font-black text-xl tracking-tight">Net Take-Home</p>
                       <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest">Estimated Monthly Payout</p>
                    </td>
                    <td className="px-8 py-8 text-right">
                       <span className="text-3xl font-black">{format(b.netPay)}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Compliance Card */}
          <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-3xl flex items-start gap-4">
             <MdSecurity className="text-emerald-600 mt-1" size={26} />
             <div>
                <p className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-1">Compliance Status: Active</p>
                <p className="text-xs text-emerald-700/80 font-medium leading-relaxed">
                  PF ({orgConfig.statutoryConfig.pf.employeeContribution}%) and HRA ({orgConfig.statutoryConfig.hra.percentageOfBasic}%) percentages are currently synced with your Organization's Statutory Setup. Last updated by Admin on {new Date().toLocaleDateString()}.
                </p>
             </div>
          </div>
        </div>

        {/* 3. RIGHT: VISUALIZATION & ANALYTICS */}
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-[2.5rem] p-0.5 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl shadow-indigo-100">
            <div className="bg-white/95 backdrop-blur-md rounded-[2.3rem] p-8 text-center h-full">
              <div className="flex items-center justify-center gap-2 mb-8">
                 <MdTrendingUp className="text-indigo-600" size={22} />
                 <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest">Payout Analytics</h3>
              </div>

              <div className="h-64 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={8} dataKey="value">
                      {chartData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                       contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: '800', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Gross Gross</span>
                  <span className="text-xl font-black text-slate-800 tracking-tighter">{format(b.monthlyGross)}</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="mt-10 space-y-4">
                {chartData.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                      <span className="text-xs font-bold text-slate-500">{item.name}</span>
                    </div>
                    <span className="text-xs font-black text-slate-700 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                      {((item.value / b.monthlyGross) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5 group hover:border-indigo-200 transition-all">
             <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                <MdCalculate size={28} />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Annual CTC</p>
                <p className="text-2xl font-black text-slate-800 tracking-tighter">{format(b.ctc)}</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Table Row Sub-component
function BreakdownRow({ label, subLabel, value, type }) {
  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-8 py-5">
        <p className="font-bold text-slate-700 text-sm">{label}</p>
        {subLabel && <p className="text-[10px] text-slate-400 font-bold uppercase">{subLabel}</p>}
      </td>
      <td className="px-8 py-5 text-right">
        <span className={`text-sm font-black ${type === 'plus' ? 'text-emerald-600' : 'text-rose-500'}`}>
          {type === 'plus' ? '+' : '-'} {value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </span>
      </td>
    </tr>
  );
}