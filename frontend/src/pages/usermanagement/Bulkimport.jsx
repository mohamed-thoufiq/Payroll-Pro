import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUploadCloud, FiCheckCircle, FiAlertCircle, 
  FiTrash2, FiDownload, FiChevronLeft, FiChevronRight, 
  FiInfo, FiUser, FiMail, FiHash, FiShield 
} from 'react-icons/fi';
import api from '../../utils/api'; 
import { API_URL } from '../../config/api.js';

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
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          {/* BACK BUTTON */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-text-secondary hover:text-primary transition-colors shadow-sm"
          >
            <FiChevronLeft size={16} />
            <span>Back to Employees</span>
          </button>

          {/* TITLES */}
          <div>
            <h2 className="text-xl font-semibold text-text-primary">
              Bulk Employee Onboarding
            </h2>
            <p className="text-sm text-text-secondary mt-0.5">
              Upload employee records via CSV, validate data structure, and import in batch
            </p>
          </div>
        </div>
        <button 
          onClick={() => window.open(`${API_URL}/api/users/download-template`)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold text-xs shadow-sm transition-colors"
        >
          <FiDownload size={14} /> Download CSV Template
        </button>
      </div>

      {!summary ? (
        <label 
          onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl py-16 px-6 transition-all cursor-pointer shadow-sm
            ${isDragging ? 'border-primary bg-blue-50/50' : 'border-gray-300 bg-white hover:border-primary hover:bg-gray-50/50'}`}
        >
          <div className={`p-4 rounded-full mb-4 transition-all
            ${isDragging ? 'bg-primary text-white' : 'bg-blue-50 text-primary border border-blue-100'}`}>
             <FiUploadCloud size={36} />
          </div>
          <p className="text-base text-text-primary font-semibold mb-1">
            {isDragging ? 'Drop file to upload' : 'Click or drag employee CSV here'}
          </p>
          <p className="text-xs text-text-muted">Supports formatted .csv files with required employee headers</p>
          <input type="file" className="hidden" accept=".csv" onChange={(e) => processFile(e.target.files[0])} />
        </label>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEFT: APPROVED */}
          <div className="flex flex-col bg-white border border-gray-200 border-l-4 border-l-success rounded-xl shadow-sm overflow-hidden">
            <div className="bg-muted px-5 py-3.5 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-2 text-success font-semibold text-sm">
                <FiCheckCircle size={18}/>
                <span>Approved Records ({approvedData.length})</span>
              </div>
              <button 
                onClick={handleFinalInsert} 
                disabled={loading || approvedData.length === 0} 
                className="bg-success hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
              >
                Confirm Import
              </button>
            </div>
            <div className="flex-1 flex flex-col">
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/60 border-b border-gray-200 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3">Emp ID</th>
                      <th className="px-5 py-3">Identity</th>
                      <th className="px-5 py-3">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedApproved.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-text-primary text-xs">{row.employeeId}</td>
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-text-primary text-xs">{row.firstName} {row.lastName}</div>
                          <div className="text-xs text-text-muted">{row.email}</div>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-text-secondary">{row.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-3 bg-muted border-t border-gray-200 flex items-center justify-between text-xs text-text-secondary">
                <span>Page {pageApp} of {totalPagesApp || 1}</span>
                <div className="flex gap-1.5">
                  <button onClick={() => setPageApp(p => Math.max(1, p-1))} disabled={pageApp === 1} className="p-1.5 bg-white rounded border border-gray-200 disabled:opacity-30"><FiChevronLeft size={14} /></button>
                  <button onClick={() => setPageApp(p => Math.min(totalPagesApp, p+1))} disabled={pageApp === totalPagesApp} className="p-1.5 bg-white rounded border border-gray-200 disabled:opacity-30"><FiChevronRight size={14} /></button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: ACTION NEEDED */}
          <div className="flex flex-col bg-white border border-gray-200 border-l-4 border-l-danger rounded-xl shadow-sm overflow-hidden">
            <div className="bg-muted px-5 py-3.5 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-2 text-danger font-semibold text-sm">
                <FiAlertCircle size={18}/>
                <span>Action Needed ({failedData.length})</span>
              </div>
              <button onClick={() => setSummary(null)} className="text-text-secondary hover:text-danger text-xs font-semibold px-2.5 py-1 rounded transition-colors">
                <FiTrash2 className="inline mr-1" /> Reset
              </button>
            </div>
            <div className="flex-1 flex flex-col p-4 space-y-3 overflow-y-auto max-h-[500px]">
              {paginatedFailed.map((row, i) => (
                <div key={i} className="bg-muted border border-gray-200 p-4 rounded-lg space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold px-2 py-0.5 bg-white border border-gray-200 rounded text-text-secondary">Row {(pageErr-1)*10 + i + 1}</span>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-danger">
                       <FiInfo size={14} /> {row.errorDetails}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <DetailCard icon={<FiUser />} label="Name" value={`${row.firstName || ''} ${row.lastName || ''}`} err={!row.firstName} />
                    <DetailCard icon={<FiMail />} label="Email" value={row.email} err={!row.email?.includes('@')} />
                    <DetailCard icon={<FiHash />} label="Emp ID" value={row.employeeId} err={!row.employeeId} />
                    <DetailCard icon={<FiShield />} label="Role" value={row.role} err={!row.role} />
                  </div>
                </div>
              ))}
              <div className="pt-2 flex items-center justify-between text-xs text-text-secondary border-t border-gray-200">
                <span>Page {pageErr} of {totalPagesErr || 1}</span>
                <div className="flex gap-1.5">
                  <button onClick={() => setPageErr(p => Math.max(1, p-1))} disabled={pageErr === 1} className="p-1.5 bg-white rounded border border-gray-200 disabled:opacity-30"><FiChevronLeft size={14} /></button>
                  <button onClick={() => setPageErr(p => Math.min(totalPagesErr, p+1))} disabled={pageErr === totalPagesErr} className="p-1.5 bg-white rounded border border-gray-200 disabled:opacity-30"><FiChevronRight size={14} /></button>
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
  <div className="bg-white border border-gray-200 p-2 rounded flex items-center gap-2">
    <div className={`p-1.5 rounded text-xs ${err ? 'bg-rose-50 text-danger' : 'text-text-muted'}`}> {icon} </div>
    <div className="min-w-0">
       <p className="text-[10px] text-text-muted uppercase font-medium">{label}</p>
       <p className={`text-xs truncate font-medium ${err ? 'text-danger italic' : 'text-text-primary'}`}>
         {value || 'MISSING'}
       </p>
    </div>
  </div>
);