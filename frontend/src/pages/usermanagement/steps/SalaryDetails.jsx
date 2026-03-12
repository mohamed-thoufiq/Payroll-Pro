import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { salarySchema } from "../../../validation/employeeScemas";
import { useEmployeeForm } from "../context/EmployeeFormContext";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { MdPayments, MdArrowBack, MdArrowForward } from "react-icons/md";

const SalaryDetails = ({ onNext, onBack }) => {
  const { update, employee } = useEmployeeForm();
  const { token } = useContext(AuthContext);

  const [hraConfig, setHraConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/organization/settings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setHraConfig(data?.statutoryConfig?.hra || null);
      } catch (err) {
        console.error("Failed to fetch HRA config", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchSettings();
  }, [token]);

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(salarySchema),
    defaultValues: {
      ctc: employee.salary?.ctc || 0,
      basicPercentage: 50
    }
  });

  const ctc = useWatch({ control, name: "ctc", defaultValue: 0 });

  // ---------------- CALCULATIONS (Logic strictly untouched) ----------------
  const annualBasic = ctc * 0.5;
  const monthlyBasic = annualBasic / 12;

  const hraPercentage = hraConfig?.percentage || 40;
  const annualHra = (annualBasic * hraPercentage) / 100;
  const monthlyHra = annualHra / 12;

  const annualFixedAllowance = ctc - (annualBasic + annualHra);
  const monthlyFixedAllowance = annualFixedAllowance / 12;
  // -------------------------------------------------------------------------

  const onSubmit = (data) => {
    update("salary", {
      ...data,
      breakdown: {
        basic: annualBasic,
        hra: annualHra,
        fixedAllowance: annualFixedAllowance
      }
    });
    onNext();
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Calculating Structure...</p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. CTC INPUT SECTION */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1.5 bg-indigo-600" />
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <MdPayments className="text-indigo-600" size={20} />
              Cost to Company (CTC)
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">Enter the annual gross amount for the employee.</p>
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
            <input
              type="number"
              {...register("ctc")}
              placeholder="0.00"
              className="w-full md:w-64 pl-8 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-black text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-lg"
            />
          </div>
        </div>
      </section>

      {/* 2. BREAKDOWN TABLE */}
      <section>
        <div className="mb-4 ml-1">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Monthly Salary Breakdown</h3>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Earnings Component</th>
                <th className="px-6 py-4">Calculation Logic</th>
                <th className="px-6 py-4 text-right">Monthly (₹)</th>
                <th className="px-6 py-4 text-right">Annual (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <tr className="hover:bg-slate-50/30 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-slate-700">Basic Salary</td>
                <td className="px-6 py-4 text-xs font-medium text-slate-500">50% of Total CTC</td>
                <td className="px-6 py-4 text-right font-bold text-slate-800">{monthlyBasic.toLocaleString("en-IN")}</td>
                <td className="px-6 py-4 text-right font-bold text-slate-800">{annualBasic.toLocaleString("en-IN")}</td>
              </tr>
              <tr className="hover:bg-slate-50/30 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-slate-700">HRA</td>
                <td className="px-6 py-4 text-xs font-medium text-slate-500">{hraPercentage}% of Basic</td>
                <td className="px-6 py-4 text-right font-bold text-slate-800">{monthlyHra.toLocaleString("en-IN")}</td>
                <td className="px-6 py-4 text-right font-bold text-slate-800">{annualHra.toLocaleString("en-IN")}</td>
              </tr>
              <tr className="hover:bg-slate-50/30 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-slate-700">Fixed Allowance</td>
                <td className="px-6 py-4 text-xs font-medium text-slate-500">Balancing Figure</td>
                <td className="px-6 py-4 text-right font-bold text-slate-800">{monthlyFixedAllowance.toLocaleString("en-IN")}</td>
                <td className="px-6 py-4 text-right font-bold text-slate-800">{annualFixedAllowance.toLocaleString("en-IN")}</td>
              </tr>
              <tr className="bg-indigo-50/30">
                <td className="px-6 py-4 text-sm font-black text-indigo-700 italic">Total CTC</td>
                <td className="px-6 py-4"></td>
                <td className="px-6 py-4 text-right font-black text-indigo-700">₹{(ctc / 12).toLocaleString("en-IN")}</td>
                <td className="px-6 py-4 text-right font-black text-indigo-700">₹{Number(ctc).toLocaleString("en-IN")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FOOTER NAVIGATION */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
        <button 
          type="button" 
          onClick={onBack} 
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-slate-500 hover:bg-slate-100 transition-all active:scale-95"
        >
          <MdArrowBack /> Prev
        </button>
        
        <button 
          type="submit" 
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-black text-sm transition-all shadow-lg shadow-indigo-100 active:scale-95"
        >
          Save & Continue <MdArrowForward />
        </button>
      </div>
    </form>
  );
};

export default SalaryDetails;