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
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header & Tab Navigation */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100">
              <FiCheckCircle size={24} />
            </div>
            Leave Management
          </h2>
          <p className="text-slate-500 font-medium mt-1">Review and audit employee attendance corrections</p>
        </div>

        {/* Same Pinch Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner border border-slate-200">
          {["PENDING", "APPROVED", "REJECTED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all tracking-widest ${
                activeTab === tab 
                ? "bg-white text-blue-600 shadow-md" 
                : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4 lg:hidden">
         <div className="bg-amber-50 p-3 rounded-2xl text-center border border-amber-100">
            <p className="text-[10px] font-bold text-amber-600 uppercase">Pending</p>
            <p className="font-black text-amber-700">{allRecords.filter(r => r.status === 'PENDING').length}</p>
         </div>
         <div className="bg-emerald-50 p-3 rounded-2xl text-center border border-emerald-100">
            <p className="text-[10px] font-bold text-emerald-600 uppercase">Approved</p>
            <p className="font-black text-emerald-700">{allRecords.filter(r => r.status === 'APPROVED').length}</p>
         </div>
         <div className="bg-rose-50 p-3 rounded-2xl text-center border border-rose-100">
            <p className="text-[10px] font-bold text-rose-600 uppercase">Rejected</p>
            <p className="font-black text-rose-700">{allRecords.filter(r => r.status === 'REJECTED').length}</p>
         </div>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {!loading && filteredRecords.map(a => (
          <div
            key={a._id}
            className={`bg-white border-2 border-slate-50 rounded-[32px] p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 ${
              processingId === a._id ? 'opacity-50 pointer-events-none scale-95' : ''
            }`}
          >
            {/* Top Row: User & Status Dot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <FiUser size={20} />
                </div>
                <h4 className="font-black text-slate-800 tracking-tight">{a.employeeId}</h4>
              </div>
              <div className={`w-2.5 h-2.5 rounded-full ${
                activeTab === 'PENDING' ? 'bg-amber-400 animate-pulse' : 
                activeTab === 'APPROVED' ? 'bg-emerald-400' : 'bg-rose-400'
              }`} />
            </div>

            {/* Content Box */}
            <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3 text-slate-600">
                <FiCalendar className="shrink-0" size={16} />
                <span className="text-sm font-bold">{new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <FiClock className="shrink-0" size={16} />
                <span className="text-sm font-bold">{a.checkIn} — {a.checkOut}</span>
              </div>
              <div className="flex items-start gap-3 text-slate-500 pt-2 border-t border-slate-200/50">
                <FiMessageSquare className="shrink-0 mt-0.5" size={16} />
                <p className="text-xs italic leading-relaxed line-clamp-2">"{a.reason}"</p>
              </div>
            </div>

            {/* Contextual Actions */}
            <div className="flex gap-3">
              {activeTab === "PENDING" ? (
                <>
                  <button
                    onClick={() => handleUpdate(a._id, "APPROVED")}
                    className="flex-1 bg-slate-900 text-white py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-black transition-all"
                  >
                    <FiCheck /> Approve
                  </button>
                  <button
                    onClick={() => handleUpdate(a._id, "REJECTED")}
                    className="flex-1 bg-white border-2 border-slate-100 text-slate-400 py-3 rounded-2xl font-black text-sm hover:border-rose-200 hover:text-rose-500 transition-all"
                  >
                    <FiX /> Reject
                  </button>
                </>
              ) : (
                <div className={`w-full py-2 rounded-xl text-center text-[10px] font-black uppercase tracking-[0.2em] border ${
                  activeTab === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                }`}>
                  Action Completed
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {!loading && filteredRecords.length === 0 && (
          <div className="col-span-full py-24 text-center bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[40px]">
             <FiCheckCircle className="mx-auto text-slate-200 mb-4" size={48} />
             <p className="text-xl font-black text-slate-800">No {activeTab.toLowerCase()} requests</p>
             <p className="text-slate-400 font-medium">There are currently no items in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}