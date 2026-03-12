import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUploadCloud, FiCheckCircle, FiAlertCircle, 
  FiTrash2, FiDownload, FiChevronLeft, FiChevronRight, 
  FiInfo, FiUser, FiMail, FiHash, FiShield 
} from 'react-icons/fi';
import api from '../../utils/api'; 

export default function BulkImportPage() {
  const [approvedData, setApprovedData] = useState([]);
  const [failedData, setFailedData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const navigate =useNavigate()
  // --- PAGINATION STATE ---
  const [pageApp, setPageApp] = useState(1);
  const [pageErr, setPageErr] = useState(1);
  const rowsPerPage = 10;

  // Compute Paginated Data
  const paginatedApproved = useMemo(() => {
    const start = (pageApp - 1) * rowsPerPage;
    return approvedData.slice(start, start + rowsPerPage);
  }, [approvedData, pageApp]);

  const paginatedFailed = useMemo(() => {
    const start = (pageErr - 1) * rowsPerPage;
    return failedData.slice(start, start + rowsPerPage);
  }, [failedData, pageErr]);

  const totalPagesApp = Math.ceil(approvedData.length / rowsPerPage);
  const totalPagesErr = Math.ceil(failedData.length / rowsPerPage);

  // --- FILE HANDLING ---
  const processFile = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const res = await api.post('/users/bulk-import', formData);
      setApprovedData(res.data.approved);
      setFailedData(res.data.actionNeeded);
      setSummary(res.data.summary);
      setPageApp(1); setPageErr(1);
    } catch (err) {
      alert("Upload failed: " + (err.response?.data?.message || "Internal Error"));
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleFinalInsert = async () => {
    try {
      setLoading(true);
      await api.post('/users/bulk-confirm', { users: approvedData });
      alert(`Success! Imported ${approvedData.length} records.`);
      setSummary(null); setApprovedData([]); setFailedData([]);
    } catch (err) {
      alert("Final insertion failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6 h-screen flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="flex justify-between items-end shrink-0">
        <div className="space-y-4 shrink-0">
          {/* BACK BUTTON */}
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white text-[10px] font-black text-slate-500 uppercase tracking-widest transition-all hover:border-indigo-600 hover:text-indigo-600 hover:shadow-lg hover:shadow-indigo-50 active:scale-95"
          >
            <FiChevronLeft 
              className="transition-transform group-hover:-translate-x-1" 
              size={16} 
            />
            Back to Employees
          </button>

          {/* TITLES */}
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              Bulk Onboarding
            </h2>
            <p className="text-slate-500 font-bold ml-1 mt-2 uppercase text-[11px] tracking-wider">
              Staging Area • Data Validation & Conflict Resolution
            </p>
          </div>
        </div>
        <button 
          onClick={() => window.open("http://localhost:5000/api/users/download-template")}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
        >
          <FiDownload /> Get CSV Template
        </button>
      </div>

      {!summary ? (
        <label 
          onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
          className={`flex-1 flex flex-col items-center justify-center border-4 border-dashed rounded-[3.5rem] transition-all group cursor-pointer
            ${isDragging ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]' : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-400'}`}
        >
          <div className={`p-10 rounded-full shadow-xl mb-6 transition-all duration-300 
            ${isDragging ? 'bg-indigo-500 scale-110' : 'bg-white group-hover:scale-110'}`}>
             <FiUploadCloud size={50} className={isDragging ? 'text-white' : 'text-indigo-500'} />
          </div>
          <p className="text-xl text-slate-800 font-black uppercase tracking-widest">
            {isDragging ? 'Drop to start' : 'Drop Employee CSV'}
          </p>
          <input type="file" className="hidden" accept=".csv" onChange={(e) => processFile(e.target.files[0])} />
        </label>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0 pb-6">
          
          {/* LEFT: APPROVED */}
          <div className="flex flex-col h-full bg-white border border-slate-100 rounded-[3rem] shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="bg-emerald-500 p-6 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3 text-white">
                <FiCheckCircle size={24}/>
                <h4 className="font-black text-sm uppercase tracking-widest leading-none">Approved ({approvedData.length})</h4>
              </div>
              <button onClick={handleFinalInsert} disabled={loading || approvedData.length === 0} className="bg-white text-emerald-600 px-6 py-2.5 rounded-xl text-[10px] font-black shadow-sm active:scale-95 disabled:opacity-50 uppercase">
                Confirm Import
              </button>
            </div>
            <div className="flex-1 flex flex-col min-h-0">
              <div className="overflow-auto flex-1 custom-scrollbar">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/80 sticky top-0 z-10 border-b">
                    <tr>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase">Emp ID</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase">Identity</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {paginatedApproved.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-5 font-bold text-slate-600 text-xs">{row.employeeId}</td>
                        <td className="px-6 py-5">
                          <div className="font-black text-slate-900 text-sm">{row.firstName} {row.lastName}</div>
                          <div className="text-[10px] font-bold text-slate-400 lowercase">{row.email}</div>
                        </td>
                        <td className="px-6 py-5 text-xs font-bold text-slate-400 italic uppercase">{row.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-5 bg-slate-50 border-t flex items-center justify-between shrink-0">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {pageApp} of {totalPagesApp || 1}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPageApp(p => Math.max(1, p-1))} disabled={pageApp === 1} className="p-2.5 bg-white rounded-xl border disabled:opacity-30"><FiChevronLeft /></button>
                  <button onClick={() => setPageApp(p => Math.min(totalPagesApp, p+1))} disabled={pageApp === totalPagesApp} className="p-2.5 bg-white rounded-xl border disabled:opacity-30"><FiChevronRight /></button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: ACTION NEEDED */}
          <div className="flex flex-col h-full bg-slate-50/50 border border-slate-100 rounded-[3rem] shadow-xl overflow-hidden">
            <div className="bg-rose-500 p-6 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3 text-white">
                <FiAlertCircle size={24}/>
                <h4 className="font-black text-sm uppercase tracking-widest leading-none">Action Needed ({failedData.length})</h4>
              </div>
              <button onClick={() => setSummary(null)} className="text-white text-[10px] font-black uppercase tracking-widest bg-white/10 px-4 py-2 rounded-xl">
                <FiTrash2 className="inline mr-1" /> Reset
              </button>
            </div>
            <div className="flex-1 flex flex-col min-h-0">
              <div className="overflow-y-auto flex-1 p-6 space-y-4 custom-scrollbar">
                {paginatedFailed.map((row, i) => (
                  <div key={i} className="bg-white border border-rose-100 p-6 rounded-[2.5rem] shadow-sm relative border-l-8 border-l-rose-500">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[9px] font-black bg-slate-900 text-white px-3 py-1 rounded-full uppercase">Row {(pageErr-1)*10 + i + 1}</span>
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                         <FiInfo size={12} /> {row.errorDetails}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <DetailCard icon={<FiUser />} label="Name" value={`${row.firstName || ''} ${row.lastName || ''}`} err={!row.firstName} />
                      <DetailCard icon={<FiMail />} label="Email" value={row.email} err={!row.email?.includes('@')} />
                      <DetailCard icon={<FiHash />} label="Emp ID" value={row.employeeId} err={!row.employeeId} />
                      <DetailCard icon={<FiShield />} label="Role" value={row.role} err={!row.role} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-5 bg-white border-t flex items-center justify-between shrink-0">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {pageErr} of {totalPagesErr || 1}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPageErr(p => Math.max(1, p-1))} disabled={pageErr === 1} className="p-2.5 bg-slate-50 rounded-xl border disabled:opacity-30"><FiChevronLeft /></button>
                  <button onClick={() => setPageErr(p => Math.min(totalPagesErr, p+1))} disabled={pageErr === totalPagesErr} className="p-2.5 bg-slate-50 rounded-xl border disabled:opacity-30"><FiChevronRight /></button>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

const DetailCard = ({ icon, label, value, err }) => (
  <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex items-center gap-3">
    <div className={`p-2 rounded-lg text-xs ${err ? 'bg-rose-100 text-rose-600' : 'bg-white text-slate-400 shadow-sm'}`}> {icon} </div>
    <div className="min-w-0">
       <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{label}</p>
       <p className={`text-[11px] font-black truncate mt-0.5 ${err ? 'text-rose-600 italic' : 'text-slate-700'}`}>
         {value || 'MISSING'}
       </p>
    </div>
  </div>
);