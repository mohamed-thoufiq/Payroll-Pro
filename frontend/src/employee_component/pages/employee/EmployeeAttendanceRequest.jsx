import { useEffect, useState } from "react";
import { FiCalendar, FiClock, FiFileText, FiSend, FiCheckCircle, FiClock as FiPending, FiXCircle, FiActivity } from "react-icons/fi";
import api from "../../../utils/api";

export default function AttendanceRequest() {
  const [form, setForm] = useState({
    date: "",
    checkIn: "",
    checkOut: "",
    reason: ""
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fetch history on load
  const fetchHistory = async () => {
    try {
      const res = await api.get("/attendance/mine");
      setHistory(res.data);
    } catch (err) {
      console.error("Error fetching history", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/attendance/request", form);
      setSuccess(true);
      setForm({ date: "", checkIn: "", checkOut: "", reason: "" });
      fetchHistory(); // Refresh history after submission
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Submission failed", err);
    } finally {
      setLoading(false);
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    const config = {
      PENDING: "bg-amber-50 text-amber-600 border-amber-100",
      APPROVED: "bg-emerald-50 text-emerald-600 border-emerald-100",
      REJECTED: "bg-rose-50 text-rose-600 border-rose-100",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${config[status] || config.PENDING}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-10">
      
      {/* LEFT: REQUEST FORM */}
      <div className="space-y-6">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100 overflow-hidden">
          <div className="bg-slate-50 px-8 py-6 border-b border-slate-100">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <div className="p-2 bg-blue-600 text-white rounded-lg">
                <FiCalendar size={20} />
              </div>
              New Request
            </h2>
          </div>

          <form onSubmit={submit} className="p-8 space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</label>
              <input
                type="date"
                required
                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-slate-700"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">In</label>
                <input
                  type="time"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-slate-700"
                  value={form.checkIn}
                  onChange={e => setForm({ ...form, checkIn: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Out</label>
                <input
                  type="time"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-slate-700"
                  value={form.checkOut}
                  onChange={e => setForm({ ...form, checkOut: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason</label>
              <textarea
                required
                rows="2"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none font-medium text-slate-700"
                value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2"
            >
              {loading ? "Processing..." : success ? "Submitted!" : "Send Request"}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT: HISTORY LIST */}
      <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <FiActivity className="text-blue-600" /> Recent Requests
          </h3>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            {history.length} Total
          </span>
        </div>

        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {history.length > 0 ? (
            history.map((req) => (
              <div key={req._id} className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-xl text-slate-600">
                      <FiCalendar size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{new Date(req.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        {req.checkIn} — {req.checkOut}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(req.status)}
                </div>
                
                <div className="px-1">
                  <p className="text-xs text-slate-500 italic leading-relaxed">
                    "{req.reason}"
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100">
               <FiPending className="mx-auto text-slate-200 mb-3" size={40} />
               <p className="text-sm font-bold text-slate-400">No requests found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function money(v) {
  return v ? `₹${Number(v).toLocaleString("en-IN")}` : "₹0";
}