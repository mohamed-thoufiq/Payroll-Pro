import { useEffect, useState } from "react";
import api from "../../../utils/api"; 
import { useNavigate } from "react-router-dom";
import { MoveLeft } from "lucide-react";

export default function MyReimbursements() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("PENDING");

  const fetchData = async () => {
    try {
      setLoading(true);
      // We filter on the frontend or backend; usually better to fetch all for "My" view 
      // but we'll stay consistent with your tab logic
      const res = await api.get("/reimbursements/my");
      setData(res.data);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter data based on active tab
  const filteredData = data.filter(r => 
    activeTab === "PENDING" ? r.status === "PENDING" : r.status !== "PENDING"
  );
  const navigate = useNavigate();
 
  return (
    <div className="space-y-6">
      {/* Top Navigation & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-text-secondary hover:text-primary transition-colors shadow-sm"
        >
          <MoveLeft size={14} />
          <span>Back</span>
        </button>
        <div>
          <h2 className="text-xl font-semibold text-text-primary">My Reimbursements</h2>
          <p className="text-sm text-text-secondary mt-0.5">Track status of your submitted expense claims</p>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
        {/* Tabs */}
        <div className="flex space-x-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("PENDING")}
            className={`pb-3 px-4 text-sm font-medium transition-colors relative ${
              activeTab === "PENDING"
                ? "border-b-2 border-primary text-primary font-semibold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Pending Claims
          </button>
          <button
            onClick={() => setActiveTab("HISTORY")}
            className={`pb-3 px-4 text-sm font-medium transition-colors relative ${
              activeTab === "HISTORY"
                ? "border-b-2 border-primary text-primary font-semibold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Claim History
          </button>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-text-secondary border-b border-gray-200 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="4" className="p-8 text-center text-primary font-medium">Loading your requests...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-text-muted">No requests found in this view</td></tr>
              ) : (
                filteredData.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-blue-50 text-primary border border-blue-100 rounded-full text-xs font-medium">
                        {r.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-text-primary">₹{r.amount?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-xs text-text-secondary">
                      {new Date(r.expenseDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        r.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : r.status === "REJECTED"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {r.status}
                      </span>
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