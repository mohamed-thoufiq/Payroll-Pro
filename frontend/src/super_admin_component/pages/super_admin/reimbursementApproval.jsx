import { useEffect, useState } from "react"; 
import api from "../../../utils/api"; 

export default function HRReimbursementApproval() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("PENDING"); // New state for tabs

  const fetchRequests = async (status) => {
    try {
      setLoading(true);
      // Fetches based on the active tab
      const res = await api.get(`/reimbursements/pending?status=${status}`);
      setData(res.data);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setLoading(true);
      await api.patch(`/reimbursements/${id}`, { status });
      alert(`Request ${status.toLowerCase()} successfully!`);
      fetchRequests(activeTab); // Refresh current view
    } catch (err) {
      console.error(err);
      alert("Action failed: " + (err.response?.data?.message || "Server Error"));
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch whenever activeTab changes
  useEffect(() => {
    fetchRequests(activeTab);
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary">Reimbursement Management</h2>
        <p className="text-sm text-text-secondary mt-1">
          Review, approve, and track employee expense claims
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
        {/* Tabs UI */}
        <div className="flex space-x-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("PENDING")}
            className={`pb-3 px-4 text-sm font-medium transition-colors relative ${
              activeTab === "PENDING"
                ? "border-b-2 border-primary text-primary font-semibold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Pending Requests
          </button>
          <button
            onClick={() => setActiveTab("APPROVED")}
            className={`pb-3 px-4 text-sm font-medium transition-colors relative ${
              activeTab === "APPROVED"
                ? "border-b-2 border-primary text-primary font-semibold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Approved History
          </button>
          <button
            onClick={() => setActiveTab("PAID")}
            className={`pb-3 px-4 text-sm font-medium transition-colors relative ${
              activeTab === "PAID"
                ? "border-b-2 border-primary text-primary font-semibold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Paid History
          </button>
        </div>

        {/* Table Container */}
        <div className="border border-gray-200 rounded-xl overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-text-secondary border-b border-gray-200 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Employee ID</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5 text-center">Action / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-primary font-medium">Loading claims...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-text-muted">No {activeTab.toLowerCase()} requests found</td></tr>
              ) : (
                data.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-text-primary">{r.employeeId}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-blue-50 text-primary border border-blue-100 rounded-full text-xs font-medium">
                        {r.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-text-primary">₹{r.amount?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-text-secondary text-xs">
                      {new Date(r.expenseDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {activeTab === "PENDING" && (
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => updateStatus(r._id, "APPROVED")}
                            className="bg-success hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(r._id, "REJECTED")}
                            className="bg-danger hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {activeTab === "APPROVED" && (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Approved
                        </span>
                      )}

                      {activeTab === "PAID" && (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-primary border border-blue-200">
                          Paid
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}