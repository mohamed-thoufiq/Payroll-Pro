import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { 
  MdReceiptLong, MdSecurity, MdAccountBalanceWallet, 
  MdInfoOutline, MdCalculate, MdDownload, MdTrendingUp
} from "react-icons/md";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { API_URL } from "../../../config/api.js";


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
        const res = await fetch(`${API_URL}/api/organization/settings`, {
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
    <div className="flex flex-col items-center justify-center p-16 space-y-3">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="text-xs font-medium text-text-muted">Loading Salary Structure...</p>
    </div>
  );

  const chartData = [
    { name: 'Basic', value: b.basicSalary, color: '#2563EB' },
    { name: 'HRA', value: b.hra, color: '#FACC15' },
    { name: 'Allowance', value: b.specialAllowance, color: '#16A34A' },
    { name: 'Deductions', value: b.totalDeductions, color: '#DC2626' },
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
            <MdReceiptLong className="text-primary text-2xl" /> Salary Structure
          </h2>
          <p className="text-sm text-text-secondary mt-0.5">
            Statutory Period FY 2025-26 • {orgConfig?.statutoryConfig?.professionalTax?.state || "Standard"}
          </p>
        </div>
        <button 
          onClick={downloadSalaryPDF}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg font-semibold text-xs shadow-sm transition-colors"
        >
          <MdDownload size={18} /> Download Detailed PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. LEFT: DATA TABLE */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-primary shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-muted border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-text-primary text-sm">Monthly Itemized Components</h3>
                <p className="text-xs text-text-muted">Standard earnings and statutory deduction items</p>
              </div>
              <MdAccountBalanceWallet className="text-primary" size={22} />
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs font-semibold text-text-secondary uppercase tracking-wider bg-muted/60 border-b border-gray-200">
                    <th className="px-6 py-3">Earnings & Benefits</th>
                    <th className="px-6 py-3 text-right">Credit (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <BreakdownRow label="Basic Salary" value={b.basicSalary} type="plus" />
                  <BreakdownRow label={`House Rent Allowance (HRA)`} subLabel={`${orgConfig?.statutoryConfig?.hra?.percentageOfBasic || 40}% of Basic`} value={b.hra} type="plus" />
                  <BreakdownRow label="Fixed Special Allowance" value={b.specialAllowance} type="plus" />
                  
                  <tr className="bg-muted/60 text-xs font-semibold text-text-secondary uppercase tracking-wider border-y border-gray-200">
                    <th className="px-6 py-3">Statutory Deductions</th>
                    <th className="px-6 py-3 text-right">Debit (₹)</th>
                  </tr>
                  
                  <BreakdownRow label="Provident Fund (PF)" subLabel="Employee Contribution" value={b.pf} type="minus" />
                  <BreakdownRow label="Employee State Insurance (ESI)" value={b.esi} type="minus" />
                  <BreakdownRow label="Professional Tax (PT)" value={b.pt} type="minus" />
                  
                  {/* TOTAL NET TAKE HOME ROW */}
                  <tr className="bg-primary text-white">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-base text-white">Net Take-Home</p>
                      <p className="text-xs text-yellow-300 font-medium">Estimated Monthly Payout</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-2xl font-bold text-yellow-400">{format(b.netPay)}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Compliance Card */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
            <MdSecurity className="text-success mt-0.5 shrink-0" size={22} />
            <div>
              <p className="text-xs font-semibold text-emerald-900 uppercase tracking-wider mb-0.5">Compliance Status: Active</p>
              <p className="text-xs text-emerald-800 leading-relaxed">
                PF ({orgConfig?.statutoryConfig?.pf?.employeeContribution || 12}%) and HRA ({orgConfig?.statutoryConfig?.hra?.percentageOfBasic || 40}%) rates are currently synced with your Organization's Statutory Rules.
              </p>
            </div>
          </div>
        </div>

        {/* 3. RIGHT: VISUALIZATION & ANALYTICS */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <MdTrendingUp className="text-primary" size={20} />
              <h3 className="font-semibold text-text-primary text-sm uppercase tracking-wider">Payout Analytics</h3>
            </div>

            <div className="h-60 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={4} dataKey="value">
                    {chartData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontWeight: '600', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[11px] font-medium text-text-muted uppercase">Gross Pay</span>
                <span className="text-lg font-bold text-text-primary">{format(b.monthlyGross)}</span>
              </div>
            </div>

            {/* Legend List */}
            <div className="mt-6 space-y-2.5">
              {chartData.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-text-secondary">{item.name}</span>
                  </div>
                  <span className="font-semibold text-text-primary bg-muted px-2 py-0.5 rounded border border-gray-200">
                    {((item.value / b.monthlyGross) * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 border-l-4 border-l-success shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-success rounded-lg border border-emerald-100">
              <MdCalculate size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Annual CTC</p>
              <p className="text-xl font-bold text-text-primary">{format(b.ctc)}</p>
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
    <tr className="hover:bg-gray-50/80 transition-colors">
      <td className="px-6 py-3.5">
        <p className="font-medium text-text-primary text-sm">{label}</p>
        {subLabel && <p className="text-xs text-text-muted">{subLabel}</p>}
      </td>
      <td className="px-6 py-3.5 text-right">
        <span className={`text-sm font-semibold ${type === 'plus' ? 'text-success' : 'text-danger'}`}>
          {type === 'plus' ? '+' : '-'} ₹{Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </span>
      </td>
    </tr>
  );
}