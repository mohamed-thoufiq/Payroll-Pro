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
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-6">Reimbursement Management</h2>

      {/* Tabs UI */}
      <div className="flex space-x-4 border-b mb-6">
        <button
          onClick={() => setActiveTab("PENDING")}
          className={`pb-2 px-4 text-sm font-medium transition-colors ${
            activeTab === "PENDING"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Pending Requests
        </button>
        <button
          onClick={() => setActiveTab("APPROVED")}
          className={`pb-2 px-4 text-sm font-medium transition-colors ${
            activeTab === "APPROVED"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Approved History
        </button>
        <button
          onClick={() => setActiveTab("PAID")}
          className={`pb-2 px-4 text-sm font-medium transition-colors ${
            activeTab === "PAID"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Paid History
        </button>

      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left bg-gray-50">
              <th className="p-3">Employee ID</th>
              <th className="p-3">Category</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Date</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="p-10 text-center animate-pulse">Loading data...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan="5" className="p-10 text-center text-gray-500">No {activeTab.toLowerCase()} requests found</td></tr>
            ) : (
              data.map((r) => (
                <tr key={r._id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-medium">{ r.employeeId}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold">
                      {r.category}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-gray-900">₹{r.amount.toLocaleString()}</td>
                  <td className="p-3 text-gray-500">
                    {new Date(r.expenseDate).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    {activeTab === "PENDING" && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => updateStatus(r._id, "APPROVED")}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded shadow-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(r._id, "REJECTED")}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded shadow-sm"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {activeTab === "APPROVED" && (
                      <span className="text-blue-600 font-medium">✓ Approved</span>
                    )}

                    {activeTab === "PAID" && (
                      <span className="text-green-700 font-medium">💰 Paid</span>
                    )}

                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}