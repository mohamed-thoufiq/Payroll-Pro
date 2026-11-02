import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, Download, Search, CheckCircle2, Clock, AlertCircle, X, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { API_URL } from '../../../config/api.js';

const PayrollHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRun, setSelectedRun] = useState(null); // State for Dialog

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/payroll/history`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
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

  if (loading) {
    return (
      <div className="p-8 text-center text-primary font-medium">
        Loading Payroll History...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary">Payroll History</h2>
        <p className="text-sm text-text-secondary mt-1">
          View finalized and locked payroll cycles
        </p>
      </div>

      {/* --- DETAILS DIALOG --- */}
      {selectedRun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl border border-gray-200 overflow-hidden transform animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-muted border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-base font-semibold text-text-primary">Payroll Summary</h3>
                <p className="text-xs text-primary font-medium uppercase tracking-wider">{selectedRun.month}</p>
              </div>
              <button 
                onClick={() => setSelectedRun(null)}
                className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors text-text-secondary"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {/* Main Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50/60 rounded-lg border-l-4 border-l-primary border border-gray-100">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <Users size={14}/>
                    <span className="text-xs font-semibold uppercase tracking-wider">Total Staff</span>
                  </div>
                  <p className="text-xl font-bold text-text-primary">{selectedRun.totals?.totalEmployees}</p>
                </div>
                <div className="p-4 bg-emerald-50/60 rounded-lg border-l-4 border-l-success border border-gray-100">
                  <div className="flex items-center gap-2 text-success mb-1">
                    <TrendingUp size={14}/>
                    <span className="text-xs font-semibold uppercase tracking-wider">Gross Amount</span>
                  </div>
                  <p className="text-xl font-bold text-text-primary">{formatCurrency(selectedRun.totals?.gross)}</p>
                </div>
              </div>

              {/* Detail Breakdown */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center p-3.5 bg-muted rounded-lg text-sm">
                  <span className="text-text-secondary font-medium">Deductions</span>
                  <span className="font-semibold text-danger">-{formatCurrency(selectedRun.totals?.deductions)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-primary text-white rounded-lg shadow-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-yellow-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider opacity-90">Final Net Pay</span>
                  </div>
                  <span className="text-xl font-bold">{formatCurrency(selectedRun.totals?.netPay)}</span>
                </div>
              </div>

              {/* Metadata */}
              <div className="pt-3 border-t border-gray-200 flex justify-between text-xs text-text-muted">
                <span>Created: {new Date(selectedRun.createdAt).toLocaleDateString()}</span>
                <span className="font-medium text-text-secondary uppercase">Status: {selectedRun.status}</span>
              </div>
            </div>
            
            <div className="px-6 py-3.5 bg-muted border-t border-gray-200">
              <button className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 rounded-lg font-medium text-sm shadow-sm transition-all flex items-center justify-center gap-2">
                <Download size={16}/> Download Full Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- TABLE VIEW --- */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-text-secondary border-b border-gray-200 text-xs font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3.5">Ref ID</th>
              <th className="px-6 py-3.5">Payroll Period</th>
              <th className="px-6 py-3.5">Net Payable</th>
              <th className="px-6 py-3.5 text-center">Staff Count</th>
              <th className="px-6 py-3.5 text-center">Status</th>
              <th className="px-6 py-3.5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {history.length > 0 ? history.map((run) => (
              <tr key={run._id} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-text-muted">
                  #{run._id.substring(18)}
                </td>
                <td className="px-6 py-4 font-medium text-text-primary">
                  {run.month}
                </td>
                <td className="px-6 py-4 font-semibold text-primary">
                  {formatCurrency(run.totals?.netPay)}
                </td>
                <td className="px-6 py-4 text-center text-text-secondary">
                  {run.totals?.totalEmployees} Employees
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
                    run.status === 'LOCKED' ? 'bg-gray-900 text-white' : 
                    run.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
                    'bg-gray-100 text-text-secondary'
                  }`}>
                    {run.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => setSelectedRun(run)}
                    className="text-primary hover:text-primary-hover text-xs font-medium hover:underline inline-flex items-center gap-1.5"
                  >
                    <Eye size={14} /> View
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-text-muted text-sm">
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