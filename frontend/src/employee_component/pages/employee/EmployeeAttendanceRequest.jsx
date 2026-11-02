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
      PENDING: "bg-amber-50 text-amber-700 border-amber-200",
      APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
      REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${config[status] || config.PENDING}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
          <FiCalendar className="text-primary" /> Attendance & Leave Corrections
        </h2>
        <p className="text-sm text-text-secondary mt-0.5">Submit check-in/out adjustments or missed attendance records</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT: REQUEST FORM */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-primary shadow-sm overflow-hidden">
            <div className="bg-muted px-6 py-4 border-b border-gray-200 flex items-center gap-2.5">
              <div className="p-1.5 bg-blue-50 text-primary rounded-lg border border-blue-100">
                <FiCalendar size={18} />
              </div>
              <h3 className="text-base font-semibold text-text-primary">New Correction Request</h3>
            </div>

            <form onSubmit={submit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">Check-In Time</label>
                  <input
                    type="time"
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                    value={form.checkIn}
                    onChange={e => setForm({ ...form, checkIn: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">Check-Out Time</label>
                  <input
                    type="time"
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                    value={form.checkOut}
                    onChange={e => setForm({ ...form, checkOut: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">Reason for Adjustment</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Provide reason for missing check-in/out or correction..."
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm resize-none"
                  value={form.reason}
                  onChange={e => setForm({ ...form, reason: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                {loading ? "Submitting..." : success ? "Submitted Successfully!" : "Send Adjustment Request"}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: HISTORY LIST */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <FiActivity className="text-primary" /> Past Correction Requests
            </h3>
            <span className="text-xs font-medium text-text-secondary bg-muted px-2.5 py-1 rounded-full border border-gray-200">
              {history.length} Total
            </span>
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {history.length > 0 ? (
              history.map((req) => {
                const accentColor = 
                  req.status === 'PENDING' ? 'border-l-warning' : 
                  req.status === 'APPROVED' ? 'border-l-success' : 'border-l-danger';

                return (
                  <div key={req._id} className={`bg-white border border-gray-200 border-l-4 ${accentColor} p-4 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col gap-2.5`}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-muted rounded-lg text-text-secondary">
                          <FiCalendar size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{new Date(req.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          <p className="text-xs text-text-muted">
                            Time: {req.checkIn} — {req.checkOut}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(req.status)}
                    </div>
                    
                    <div className="bg-muted rounded-lg p-2.5 text-xs text-text-secondary italic">
                      "{req.reason}"
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center bg-white rounded-xl border border-dashed border-gray-200">
                 <FiPending className="mx-auto text-text-muted mb-2" size={32} />
                 <p className="text-xs font-medium text-text-muted">No attendance adjustment requests recorded</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function money(v) {
  return v ? `₹${Number(v).toLocaleString("en-IN")}` : "₹0";
}