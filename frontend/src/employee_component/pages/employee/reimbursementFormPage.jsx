import { useState } from "react";
import api from "../../../utils/api";
import { 
  MdReceiptLong, 
  MdOutlineCategory, 
  MdCurrencyRupee, 
  MdCalendarToday, 
  MdDescription, 
  MdSend, 
  MdInfoOutline ,
  MdHistory
} from "react-icons/md";
import toast, { Toaster } from "react-hot-toast";
import { useSearchParams } from 'react-router-dom';

export default function EmployeeReimbursementForm() {
  const [form, setForm] = useState({
    category: "",
    amount: "",
    description: "",
    expenseDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = searchParams.get('section') || 'dashboard';

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleNavClick = (key) => {
    setSearchParams({ section: "myreimbursement" });
    onClose(); 
  };

  const submitRequest = async () => {
    // Validation
    if (!form.category || !form.amount || !form.expenseDate) {
      return toast.error("Please fill in all required fields", {
        style: { 
          borderRadius: '15px', 
          background: '#333', 
          color: '#fff', 
          fontSize: '12px', 
          fontWeight: 'bold' 
        }
      });
    }

    setLoading(true);
    const loadToast = toast.loading("Syncing claim with server...");

    try {
      await api.post("/reimbursements/submit-reimbursement", form);
      
      toast.success("Reimbursement submitted successfully!", {
        id: loadToast,
        duration: 4000,
        style: {
          borderRadius: '20px',
          background: '#10B981',
          color: '#fff',
          fontWeight: '900',
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        },
      });

      // Reset Form
      setForm({ 
        category: "", 
        amount: "", 
        description: "", 
        expenseDate: new Date().toISOString().split('T')[0] 
      });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to submit claim", {
        id: loadToast,
        style: {
          borderRadius: '20px',
          background: '#F43F5E',
          color: '#fff',
          fontWeight: '900',
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" reverseOrder={false} />

      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
            <MdReceiptLong className="text-primary text-2xl" /> New Reimbursement Claim
          </h2>
          <p className="text-sm text-text-secondary mt-0.5">
            Submit business and travel expenses for management approval and payroll settlement
          </p>
        </div>
         
        <button 
          onClick={handleNavClick}
          className="flex items-center gap-1.5 bg-muted hover:bg-gray-200 text-text-primary border border-gray-200 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          <MdHistory size={16}/> Claim History
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. LEFT: FORM SECTION */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-primary shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-muted border-b border-gray-200 flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-text-secondary">
              <span>Expense Details</span>
              <MdOutlineCategory size={18} className="text-primary" />
            </div>

            <div className="p-6 space-y-5">
              {/* Row 1: Category & Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormGroup label="Expense Category" icon={<MdOutlineCategory />}>
                  <select
                    name="category"
                    className="w-full bg-white border border-gray-200 px-3.5 py-2.5 rounded-lg font-medium text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                    value={form.category}
                    onChange={handleChange}
                  >
                    <option value="">Select Category</option>
                    <option value="TRAVEL">✈️ Travel</option>
                    <option value="FOOD">🍴 Food</option>
                    <option value="HOTEL">🏨 Hotel</option>
                    <option value="MARKETING">📈 Marketing</option>
                    <option value="OTHER">📁 Other</option>
                  </select>
                </FormGroup>

                <FormGroup label="Claim Amount (INR)" icon={<MdCurrencyRupee />}>
                  <input
                    name="amount"
                    type="number"
                    placeholder="0.00"
                    className="w-full bg-white border border-gray-200 px-3.5 py-2.5 rounded-lg font-medium text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                    onChange={handleChange}
                    value={form.amount}
                  />
                </FormGroup>
              </div>

              {/* Row 2: Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormGroup label="Expense Incurred Date" icon={<MdCalendarToday />}>
                  <input
                    name="expenseDate"
                    type="date"
                    className="w-full bg-white border border-gray-200 px-3.5 py-2.5 rounded-lg font-medium text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                    onChange={handleChange}
                    value={form.expenseDate}
                  />
                </FormGroup>
              </div>

              {/* Row 3: Description */}
              <FormGroup label="Business Justification" icon={<MdDescription />}>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Provide details about the business purpose of this expense..."
                  className="w-full bg-white border border-gray-200 px-3.5 py-2.5 rounded-lg font-medium text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm resize-none"
                  onChange={handleChange}
                  value={form.description}
                />
              </FormGroup>

              {/* Submit Button */}
              <button
                onClick={submitRequest}
                disabled={loading}
                className={`w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
                  loading 
                    ? "bg-gray-200 text-text-muted cursor-not-allowed" 
                    : "bg-primary hover:bg-primary-hover text-white active:scale-[0.99]"
                }`}
              >
                {loading ? "Submitting Claim..." : "Submit Claim for Approval"}
                {!loading && <MdSend size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* 3. RIGHT: INFO & POLICIES */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-warning p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
              <MdInfoOutline className="text-warning text-lg" />
              <h3 className="font-semibold text-text-primary text-sm uppercase tracking-wider">Policy Checklist</h3>
            </div>
            <ul className="space-y-3">
              <PolicyItem text="Ensure receipts and bills are clear and legible." />
              <PolicyItem text="Claims must be submitted within 30 days of the expense." />
              <PolicyItem text="Hotel and travel claims require valid GST invoices." />
              <PolicyItem text="Meal expenses have a daily allowance limit per policy." />
            </ul>
          </div>

          <div className="bg-gray-900 p-6 rounded-xl text-white shadow-sm relative overflow-hidden">
            <p className="text-xs font-semibold text-yellow-400 uppercase tracking-wider mb-1">Settlement Cycle</p>
            <p className="text-lg font-bold tracking-tight">Approved payouts process on the 15th of every month.</p>
            <p className="text-xs text-gray-400 mt-2">Disbursements are added to your monthly bank transfer batch.</p>
          </div>
        </div>

      </div>
    </div>
  );
}

// Internal Helper Component for Policy Items
function PolicyItem({ text }) {
  return (
    <li className="flex items-start gap-2.5">
      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
      <p className="text-xs text-text-secondary leading-relaxed">{text}</p>
    </li>
  );
}

// Internal Helper Component for Form Groups
function FormGroup({ label, icon, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
        {icon} {label}
      </label>
      {children}
    </div>
  );
}