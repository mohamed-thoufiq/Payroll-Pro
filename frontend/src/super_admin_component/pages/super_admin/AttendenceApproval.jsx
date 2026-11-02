import { useEffect, useState } from "react";
import { FiCheck, FiX, FiClock, FiUser, FiCalendar, FiMessageSquare, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import api from "../../../utils/api";

export default function AttendanceApproval() {
  const [allRecords, setAllRecords] = useState([]); // Store everything
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PENDING");
  const [processingId, setProcessingId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      // Fetching all (assuming your API returns all, or change endpoint to fetch all)
      const res = await api.get("/attendance/all-requests"); 
      setAllRecords(res.data);
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpdate = async (id, status) => {
    try {
      setProcessingId(id);
      await api.put(`/attendance/${id}/status`, { status });
      // Update local state to reflect new status instantly
      setAllRecords(prev => prev.map(r => r._id === id ? { ...r, status } : r));
    } catch (err) {
      console.error("Update error:", err);
    } finally {
      setProcessingId(null);
    }
  };

  // Filter records based on selected tab
  const filteredRecords = allRecords.filter(r => r.status === activeTab);

  return (
    <div className="space-y-6">
      {/* Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Attendance Corrections</h2>
          <p className="text-sm text-text-secondary mt-0.5">Review and audit employee attendance and leave adjustments</p>
        </div>

        {/* Tab Pills */}
        <div className="flex bg-muted p-1 rounded-lg border border-gray-200 self-start sm:self-auto">
          {["PENDING", "APPROVED", "REJECTED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === tab 
                  ? "bg-white text-primary font-semibold shadow-sm" 
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {!loading && filteredRecords.map(a => {
          const accentColor = 
            a.status === 'PENDING' ? 'border-l-warning' : 
            a.status === 'APPROVED' ? 'border-l-success' : 'border-l-danger';

          return (
            <div
              key={a._id}
              className={`bg-white border border-gray-200 border-l-4 ${accentColor} rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
                processingId === a._id ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              {/* Top Row: User & Status Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-primary border border-blue-200 flex items-center justify-center font-semibold text-sm">
                    <FiUser size={16} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary text-sm">{a.employeeId}</h4>
                    <span className="text-[11px] text-text-muted">Attendance Correction</span>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  a.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 
                  a.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
                  'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {a.status}
                </span>
              </div>

              {/* Content Box */}
              <div className="bg-muted rounded-lg p-3.5 space-y-2 text-xs">
                <div className="flex items-center gap-2.5 text-text-secondary">
                  <FiCalendar className="text-primary shrink-0" size={14} />
                  <span className="font-medium text-text-primary">{new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2.5 text-text-secondary">
                  <FiClock className="text-primary shrink-0" size={14} />
                  <span>Time: <strong>{a.checkIn} — {a.checkOut}</strong></span>
                </div>
                <div className="flex items-start gap-2.5 text-text-secondary pt-2 border-t border-gray-200">
                  <FiMessageSquare className="text-text-muted shrink-0 mt-0.5" size={14} />
                  <p className="italic text-text-secondary">"{a.reason || 'No reason provided'}"</p>
                </div>
              </div>

              {/* Contextual Actions */}
              <div className="pt-1">
                {activeTab === "PENDING" ? (
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => handleUpdate(a._id, "APPROVED")}
                      className="flex-1 bg-success hover:bg-green-700 text-white py-2 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                    >
                      <FiCheck size={14} /> Approve
                    </button>
                    <button
                      onClick={() => handleUpdate(a._id, "REJECTED")}
                      className="flex-1 bg-white border border-danger text-danger hover:bg-danger/10 py-2 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <FiX size={14} /> Reject
                    </button>
                  </div>
                ) : (
                  <div className={`w-full py-1.5 rounded-lg text-center text-xs font-medium border ${
                    activeTab === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    Action Finalized
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {!loading && filteredRecords.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white border border-dashed border-gray-200 rounded-xl">
             <FiCheckCircle className="mx-auto text-text-muted mb-3" size={36} />
             <p className="text-base font-semibold text-text-primary">No {activeTab.toLowerCase()} requests</p>
             <p className="text-xs text-text-muted mt-1">There are currently no items in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}