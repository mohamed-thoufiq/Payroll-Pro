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
    <div className="bg-white p-6 rounded-xl shadow">
     <button
      onClick={() => navigate(-1)}
      className="group flex items-center gap-2.5 px-4 py-2 rounded-full border border-slate-200 bg-white text-sm font-bold text-slate-600 transition-all duration-200 hover:border-indigo-600 hover:text-indigo-600 hover:shadow-lg hover:shadow-indigo-50 active:scale-95"
    >
      <MoveLeft 
        size={18} 
        className="transition-transform duration-200 group-hover:-translate-x-1" 
      />
      <span>Back</span>
    </button>
      <h2 className="text-xl font-semibold mb-6">My Reimbursements</h2>

      {/* Tabs */}
      <div className="flex space-x-4 border-b mb-6">
        <button
          onClick={() => setActiveTab("PENDING")}
          className={`pb-2 px-4 text-sm font-medium transition-colors ${
            activeTab === "PENDING"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setActiveTab("HISTORY")}
          className={`pb-2 px-4 text-sm font-medium transition-colors ${
            activeTab === "HISTORY"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          History
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b bg-gray-50">
              <th className="p-3">Category</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="p-10 text-center animate-pulse">Loading your requests...</td></tr>
            ) : filteredData.length === 0 ? (
              <tr><td colSpan="4" className="p-10 text-center text-gray-500">No requests found here</td></tr>
            ) : (
              filteredData.map((r) => (
                <tr key={r._id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-medium">{r.category}</td>
                  <td className="p-3 font-semibold">₹{r.amount.toLocaleString()}</td>
                  <td className="p-3 text-gray-500">
                    {new Date(r.expenseDate).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      r.status === "APPROVED"
                        ? "bg-green-100 text-green-700"
                        : r.status === "REJECTED"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
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
  );
}