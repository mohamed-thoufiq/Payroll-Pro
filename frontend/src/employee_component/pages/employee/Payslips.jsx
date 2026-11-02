import { useEffect, useState } from "react";
import { FiFileText, FiEye, FiX, FiDownload, FiInfo } from "react-icons/fi";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { API_URL } from "../../../config/api.js";

export default function Payslips() {
  const [payslips, setPayslips] = useState([]);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API_URL}/api/payslips/my-payslips`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPayslips(res.data);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayslips();
  }, []);

  const viewPayslip = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_URL}/api/payslips/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedPayslip(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-10">
      {/* Header Area matching C:\HTML\Payroll-frontend */}
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold text-text-primary">
          <FiFileText size={20} className="text-primary" />
          My Payslips
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Securely access and download your monthly salary statements
        </p>
      </div>

      {/* Modern Table Container */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-muted text-text-secondary border-b border-gray-200">
            <tr>
              <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">Month</th>
              <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-right">Gross Amount</th>
              <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-right">Deductions</th>
              <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-right">Reimbursements</th>
              <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-right">Net Pay</th>
              <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-center">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-sm">
            {!loading &&
              payslips.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 font-semibold text-text-primary">{p.month}</td>
                  <td className="px-6 py-4 text-right font-medium text-text-secondary">{money(p.gross)}</td>
                  <td className="px-6 py-4 text-right text-danger font-medium">
                    -{money(p.deductions?.total)}
                  </td>
                  <td className="px-6 py-4 text-right text-success font-medium">
                    +{money(p.reimbursements?.total || 0)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-semibold text-text-primary">
                      {money(p.netPay)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => viewPayslip(p._id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-text-secondary hover:text-primary hover:border-primary hover:bg-blue-50/50 transition-all"
                    >
                      <FiEye size={14} /> View Details
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {loading && (
          <div className="p-16 text-center text-text-muted font-medium animate-pulse">
            Fetching your statements...
          </div>
        )}
      </div>

      {selectedPayslip && (
        <PayslipDrawer
          payslip={selectedPayslip}
          onClose={() => setSelectedPayslip(null)}
        />
      )}
    </div>
  );
}

/* ================= DRAWER ================= */
function PayslipDrawer({ payslip, onClose }) {
  const calculateLopPerDay = (totalLopAmount, days) => {
    // Check for zero, null, undefined, or empty strings
    if (!days || Number(days) === 0 || !totalLopAmount) {
      return 0;
    }
    return Number(totalLopAmount) / Number(days);
  };
  const downloadPDF = (p) => {
    const doc = new jsPDF();
    const lopPerDay = calculateLopPerDay(p.deductions.lop, p.lopDays);
    doc.text("SALARY STATEMENT", 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [["Earnings", "Amount", "Deductions", "Amount"]],
      body: [
        ["Basic", money(p.earnings.basic), "PF", money(p.deductions.pf)],
        ["HRA", money(p.earnings.hra), "PT", money(p.deductions.pt)],
        ["Special", money(p.earnings.specialAllowance), "ESI", money(p.deductions.esi)],
        ["Reimbursement", money(p.reimbursements.total), "LOP", money(p.deductions.lop)],
        ["Gross", money(p.gross), "Total", money(p.deductions.total)],
      ],
    });
    if (p.reimbursements?.items?.length) {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [["Reimbursements", "Amount",]],
        body: p.reimbursements.items.map((r) => [
          `${r.category}${r.description ? " - " + r.description : ""}`,
          money(r.amount),
        ]),
      });
    }
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10, // Adjust spacing based on previous table
      theme: 'grid',
      headStyles: { fillGray: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
      head: [["LOP Days", "Total LOP Amount", "Per Day (LOP Amount)"]],
      body: [
        [
          p.lopDays || 0, 
          money(p.deductions.lop), 
          money(lopPerDay) // This handles the zero case gracefully
        ],
      ],
      styles: { fontSize: 9, cellPadding: 4 },
    });
    doc.text(`NET PAY: ${money(p.netPay)}`, 14, doc.lastAutoTable.finalY + 20);
    doc.save(`Payslip_${p.month}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Drawer Body */}
      <div className="relative w-full max-w-lg bg-slate-50 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Statement Summary</h3>
            <p className="text-sm font-bold text-blue-600">{payslip.month}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <Section title="Income Breakdown">
            <DetailRow label="Basic Salary" value={money(payslip.earnings.basic)} />
            <DetailRow label="HRA" value={money(payslip.earnings.hra)} />
            <DetailRow label="Special Allowance" value={money(payslip.earnings.specialAllowance)} />
            <div className="mt-4 pt-3 border-t border-slate-100">
                <DetailRow label="Gross Earnings" value={money(payslip.gross)} bold />
            </div>
          </Section>

          <Section title="Deductions" isRed>
            <DetailRow label="Employee PF" value={money(payslip.deductions.pf)} />
            <DetailRow label="Professional Tax" value={money(payslip.deductions.pt)} />
            <DetailRow label="ESI" value={money(payslip.deductions.esi)} />
            <DetailRow label="LOP Days" value={payslip.lopDays} />
            <DetailRow label="LOP" value={money(payslip.deductions.lop)} />
            <div className="mt-4 pt-3 border-t border-slate-100">
                <DetailRow label="Total Reductions" value={money(payslip.deductions.total)} bold />
            </div>
          </Section>

          {payslip.reimbursements?.items?.length > 0 && (
            <Section title="Reimbursements" isGreen>
              {payslip.reimbursements.items.map((r, i) => (
                <DetailRow
                  key={i}
                  label={`${r.category}`}
                  value={`+${money(r.amount)}`}
                  green
                />
              ))}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <DetailRow
                  label="Reimbursement Credit"
                  value={`+${money(payslip.reimbursements.total)}`}
                  bold
                  green
                />
              </div>
            </Section>
          )}

          {/* Large Net Pay Display */}
          <div className="bg-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200">
             <div className="flex justify-between items-center font-bold">
                <span className="opacity-80 text-sm uppercase tracking-wider">Final Net Pay</span>
                <span className="text-3xl tracking-tighter">{money(payslip.netPay)}</span>
             </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white border-t border-slate-200">
          <button
            onClick={() => downloadPDF(payslip)}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 hover:scale-[0.98] transition-all active:scale-95"
          >
            <FiDownload /> Download Official Statement
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function Section({ title, children, isRed, isGreen }) {
  const borderColor = isRed ? 'border-rose-100' : isGreen ? 'border-emerald-100' : 'border-slate-200';
  const headerBg = isRed ? 'bg-rose-50' : isGreen ? 'bg-emerald-50' : 'bg-slate-50';
  const titleColor = isRed ? 'text-rose-700' : isGreen ? 'text-emerald-700' : 'text-slate-700';

  return (
    <div className={`border ${borderColor} rounded-2xl bg-white overflow-hidden`}>
      <div className={`${headerBg} px-5 py-3 font-extrabold text-xs uppercase tracking-widest ${titleColor}`}>
        {title}
      </div>
      <div className="p-5 space-y-3">{children}</div>
    </div>
  );
}

function DetailRow({ label, value, bold, green }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-500 font-medium">{label}</span>
      <span
        className={`${bold ? "text-base font-black" : "font-bold text-sm"} ${
          green ? "text-emerald-600" : "text-slate-800"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function money(v) {
  // Use 'Rs.' instead of '₹' to avoid encoding issues in standard PDF fonts
  return v != null ? `Rs. ${Number(v).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}` : "Rs. 0.00";
}