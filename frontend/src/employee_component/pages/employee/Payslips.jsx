import { useEffect, useState } from "react";
import { FiFileText, FiEye, FiX, FiDownload, FiInfo } from "react-icons/fi";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
          "http://localhost:5000/api/payslips/my-payslips",
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
        `http://localhost:5000/api/payslips/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedPayslip(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-10">
      {/* Header Area */}
      <div className="flex flex-col gap-1">
        <h2 className="flex items-center gap-3 text-3xl font-extrabold text-slate-900">
          <div className="p-2 bg-blue-600 text-white rounded-lg shadow-blue-200 shadow-lg">
             <FiFileText size={24} />
          </div>
          My Payslips
        </h2>
        <p className="text-slate-500 font-medium ml-12">
          Securely access and download your monthly earnings
        </p>
      </div>

      {/* Modern Table Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Month</th>
              <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Gross Amount</th>
              <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Deductions</th>
              <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Reimbursements</th>
              <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Net Pay</th>
              <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {!loading &&
              payslips.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-6 py-5 font-bold text-slate-700">{p.month}</td>
                  <td className="px-6 py-5 text-right font-medium text-slate-600">{money(p.gross)}</td>
                  <td className="px-6 py-5 text-right text-rose-500 font-semibold">
                    -{money(p.deductions?.total)}
                  </td>
                  <td className="px-6 py-5 text-right text-emerald-600 font-semibold">
                    +{money(p.reimbursements?.total || 0)}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full font-bold text-sm">
                        {money(p.netPay)}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button
                      onClick={() => viewPayslip(p._id)}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-white hover:shadow-md hover:border-blue-400 hover:text-blue-600 transition-all"
                    >
                      <FiEye /> View Details
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {loading && (
          <div className="p-20 text-center text-slate-400 font-medium animate-pulse">
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