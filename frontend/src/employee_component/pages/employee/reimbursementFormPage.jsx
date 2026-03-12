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
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Toaster position="top-right" reverseOrder={false} />

      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-200">
      
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <MdReceiptLong className="text-indigo-600" /> New Reimbursement
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest text-[10px]">
            Claim financial settlements for business expenses
          </p>
        </div>
         
          <button onClick={handleNavClick}
          className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs shadow-xl active:scale-95 transition-all hover:bg-slate-800"
          >
          <MdHistory size={20}/>  HISTORY
          </button>
      
      </div>
      

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. LEFT: FORM SECTION (The Glass Slab) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden relative group">
            <div className="absolute right-0 top-1/4 bottom-1/4 w-1.5 rounded-l-full bg-indigo-600" />
            
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
               <span>Expense Details</span>
               <MdOutlineCategory size={20} />
            </div>

            <div className="p-8 space-y-6">
              {/* Row 1: Category & Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup label="Category" icon={<MdOutlineCategory />}>
                  <select
                    name="category"
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner"
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

                <FormGroup label="Claim Amount" icon={<MdCurrencyRupee />}>
                  <input
                    name="amount"
                    type="number"
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner"
                    onChange={handleChange}
                    value={form.amount}
                  />
                </FormGroup>
              </div>

              {/* Row 2: Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup label="Expense Date" icon={<MdCalendarToday />}>
                  <input
                    name="expenseDate"
                    type="date"
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner"
                    onChange={handleChange}
                    value={form.expenseDate}
                  />
                </FormGroup>
              </div>

              {/* Row 3: Description */}
              <FormGroup label="Justification / Description" icon={<MdDescription />}>
                <textarea
                  name="description"
                  rows="4"
                  placeholder="Describe the reason for this expense..."
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner"
                  onChange={handleChange}
                  value={form.description}
                />
              </FormGroup>

              {/* Submit Button */}
              <button
                onClick={submitRequest}
                disabled={loading}
                className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 ${
                  loading 
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
                }`}
              >
                {loading ? "Syncing Claim..." : "Submit for Approval"}
                {!loading && <MdSend size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* 3. RIGHT: INFO & METRICS */}
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-[2.5rem] p-0.5 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl shadow-indigo-100">
            <div className="bg-white/95 backdrop-blur-md rounded-[2.3rem] p-8 h-full">
              <div className="flex items-center gap-2 mb-6">
                 <MdInfoOutline className="text-indigo-600" size={22} />
                 <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest">Policy Guide</h3>
              </div>
              <ul className="space-y-4">
                <PolicyItem text="Ensure receipts are clear and legible." />
                <PolicyItem text="Claims must be submitted within 30 days." />
                <PolicyItem text="Hotel claims require GST invoices." />
              </ul>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <MdReceiptLong size={120} />
             </div>
             <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Settlement Cycle</p>
             <p className="text-2xl font-black tracking-tight leading-tight">Payouts process every 15th of the month.</p>
          </div>
        </div>

      </div>
    </div>
  );
}

// Internal Helper Component for Policy Items
function PolicyItem({ text }) {
  return (
    <li className="flex items-start gap-3">
      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5" />
      <p className="text-xs font-bold text-slate-500 leading-relaxed">{text}</p>
    </li>
  );
}

// Internal Helper Component for Form Groups
function FormGroup({ label, icon, children }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
        {icon} {label}
      </label>
      {children}
    </div>
  );
}