import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, Download, Search, CheckCircle2, Clock, AlertCircle, X, TrendingUp, TrendingDown, Users } from 'lucide-react';

const PayrollHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRun, setSelectedRun] = useState(null); // State for Dialog

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('${API_URL}/api/payroll/history');
        setHistory(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch payroll history:", error);
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  if (loading) return <div className="p-10 text-center text-indigo-600 font-bold">Loading Payroll History...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      <h1 className="text-2xl font-black text-slate-800 mb-6 tracking-tight">Real-time Payroll History</h1>

      {/* --- DETAILS DIALOG --- */}
      {selectedRun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden transform animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Payroll Summary</h2>
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{selectedRun.month}</p>
              </div>
              <button 
                onClick={() => setSelectedRun(null)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6">
              {/* Main Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                   <div className="flex items-center gap-2 text-indigo-600 mb-1">
                      <Users size={14}/>
                      <span className="text-[10px] font-black uppercase tracking-wider">Total Staff</span>
                   </div>
                   <p className="text-xl font-black text-slate-800">{selectedRun.totals.totalEmployees}</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                   <div className="flex items-center gap-2 text-emerald-600 mb-1">
                      <TrendingUp size={14}/>
                      <span className="text-[10px] font-black uppercase tracking-wider">Gross Amount</span>
                   </div>
                   <p className="text-xl font-black text-slate-800">{formatCurrency(selectedRun.totals.gross)}</p>
                </div>
              </div>

              {/* Detail Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Deductions</span>
                  <span className="font-bold text-rose-500">-{formatCurrency(selectedRun.totals.deductions)}</span>
                </div>
                <div className="flex justify-between items-center p-6 bg-slate-900 rounded-2xl text-white shadow-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-emerald-400" />
                    <span className="text-xs font-black uppercase tracking-widest opacity-80">Final Net Pay</span>
                  </div>
                  <span className="text-2xl font-black">{formatCurrency(selectedRun.totals.netPay)}</span>
                </div>
              </div>

              {/* Metadata */}
              <div className="pt-4 border-t border-slate-100 flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                <span>Created: {new Date(selectedRun.createdAt).toLocaleDateString()}</span>
                <span>Status: {selectedRun.status}</span>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100">
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-md transition-all active:scale-95 flex items-center justify-center gap-2">
                   <Download size={16}/> Download Full Report
                </button>
            </div>
          </div>
        </div>
      )}

      {/* --- TABLE VIEW --- */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Ref ID</th>
              <th className="px-6 py-4">Payroll Period</th>
              <th className="px-6 py-4">Net Payable</th>
              <th className="px-6 py-4">Staff Count</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {history.length > 0 ? history.map((run) => (
              <tr key={run._id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 font-mono text-[10px] text-slate-400 uppercase tracking-tighter">
                  #{run._id.substring(18)}
                </td>
                <td className="px-6 py-4 font-bold text-slate-700">
                  {run.month}
                </td>
                <td className="px-6 py-4 font-black text-indigo-600">
                  {formatCurrency(run.totals?.netPay)}
                </td>
                <td className="px-6 py-4 text-slate-600 font-medium">
                  {run.totals?.totalEmployees} Employees
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest ${
                    run.status === 'LOCKED' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                    run.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                    'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {run.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => setSelectedRun(run)}
                    className="bg-slate-900 text-white p-2 rounded-lg hover:bg-black transition-all active:scale-90 flex items-center justify-center mx-auto"
                  >
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="px-6 py-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest italic">
                  No payroll history recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayrollHistory;