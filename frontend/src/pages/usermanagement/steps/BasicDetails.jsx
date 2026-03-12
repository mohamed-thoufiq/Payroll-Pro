import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { basicSchema } from "../../../validation/employeeScemas";
import { checkEmployeeExists } from "../../../api/employeeApi";
import { useEmployeeForm } from "../context/EmployeeFormContext";
import { useState, useContext, useEffect } from "react"; 
import { AuthContext } from '..//..//..//context/AuthContext';
import { MdInfoOutline, MdLockOutline, MdEmail, MdBadge } from "react-icons/md";

const BasicDetails = ({ onNext }) => {
  const { update, employee } = useEmployeeForm();
  const [checking, setChecking] = useState(false);
  const [duplicateError, setDuplicateError] = useState(""); 
  const { token } = useContext(AuthContext);

  const [orgSettings, setOrgSettings] = useState({
    roles: [],
    departments: [],
    locations: []
  });
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/organization/settings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOrgSettings({
            roles: data.roles || [],
            departments: data.departments || [],
            locations: data.locations?.length > 0 ? data.locations : ["Head Office (Chennai)"]
          });
        }
      } catch (err) {
        console.error("Failed to load org settings", err);
      } finally {
        setLoadingSettings(false);
      }
    };
    if (token) fetchSettings();
  }, [token]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(basicSchema),
    defaultValues: employee.basic 
  });

  const onSubmit = async (data) => {
    setChecking(true);
    setDuplicateError("");
    const res = await checkEmployeeExists({
      email: data.email,
      employeeId: data.employeeId
    });
    setChecking(false);

    if (res.exists) {
      setDuplicateError("Email or Employee ID already exists in the system.");
      return;
    }

    update("basic", data);
    onNext();
  };

  // UI Variable constants for matching theme
  const labelClass = "text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1";
  const inputClass = (error) => 
    `w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all outline-none border 
    ${error 
      ? 'border-rose-300 bg-rose-50 text-rose-900 focus:ring-4 focus:ring-rose-500/10' 
      : 'border-slate-200 bg-white text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
    }`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-500 bg-white p-2">
      
      {/* 1. Name Section */}
      <section>
        <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-indigo-600 rounded-full"></span>
          Personal Identity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className={labelClass}>First Name*</label>
            <input {...register("firstName")} placeholder="First Name" className={inputClass(errors.firstName)} />
            {errors.firstName && <p className="text-rose-500 text-[10px] font-bold mt-1.5 ml-1">{errors.firstName.message}</p>}
          </div>
          <div className="flex flex-col">
            <label className={labelClass}>Middle Name</label>
            <input {...register("middleName")} placeholder="Middle Name" className={inputClass()} />
          </div>
          <div className="flex flex-col">
            <label className={labelClass}>Last Name</label>
            <input {...register("lastName")} placeholder="Last Name" className={inputClass()} />
          </div>
        </div>
      </section>

      {/* 2. Credentials Section */}
      <section>
        <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-purple-600 rounded-full"></span>
          Work Credentials
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className={labelClass}>Employee ID*</label>
            <div className="relative">
              <MdBadge className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input {...register("employeeId")} className={`${inputClass(errors.employeeId)} pl-11`} />
            </div>
            {errors.employeeId && <p className="text-rose-500 text-[10px] font-bold mt-1.5 ml-1">{errors.employeeId.message}</p>}
          </div>
          
          <div className="flex flex-col">
            <label className={labelClass}>Date of Joining*</label>
            <input type="date" {...register("doj")} className={inputClass(errors.doj)} />
            {errors.doj && <p className="text-rose-500 text-[10px] font-bold mt-1.5 ml-1">{errors.doj.message}</p>}
          </div>

          <div className="flex flex-col">
            <label className={labelClass}>Work Email*</label>
            <div className="relative">
              <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input {...register("email")} placeholder="abc@xyz.com" className={`${inputClass(errors.email)} pl-11`} />
            </div>
            {errors.email && <p className="text-rose-500 text-[10px] font-bold mt-1.5 ml-1">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col">
            <label className={labelClass}>Mobile Number</label>
            <input {...register("mobile")} className={inputClass()} />
          </div>

          <div className="flex flex-col">
            <label className={labelClass}>Portal Password*</label>
            <div className="relative">
              <MdLockOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="password" {...register("password")} placeholder="Set portal password" className={`${inputClass(errors.password)} pl-11`} />
            </div>
            {errors.password && <p className="text-rose-500 text-[10px] font-bold mt-1.5 ml-1">{errors.password.message}</p>}
          </div>
        </div>
      </section>

      {/* 3. Placement Section */}
      <section>
        <div className="flex items-center gap-2 mb-6 text-slate-700">
          <input type="checkbox" {...register("isDirector")} id="isDirector" className="w-5 h-5 accent-slate-800 cursor-pointer" />
          <label htmlFor="isDirector" className="text-xs font-bold cursor-pointer">
            Employee is a <span className="text-indigo-600">Director / substantial interest</span> person. 
            <MdInfoOutline className="inline ml-1 text-slate-400" size={16} />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Gender *</label>
            <select {...register("gender")} className={inputClass(errors.gender)}>
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Others</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Work Location *</label>
            <select {...register("location")} className={inputClass(errors.location)}>
              <option value="">Select Location</option>
              {orgSettings.locations.map((loc, i) => (
                <option key={i} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Role *</label>
            <select {...register("role")} className={inputClass(errors.role)}>
              <option value="">Select Role</option>
              {orgSettings.roles.map((role, i) => (
                <option key={i} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Department *</label>
            <select {...register("department")} className={inputClass(errors.department)}>
              <option value="">Select Department</option>
              {orgSettings.departments.map((dept, i) => (
                <option key={i} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* 4. Portal Access */}
      <div className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-2xl transition-all hover:bg-indigo-50">
        <div className="flex items-center gap-3">
          <input type="checkbox" {...register("enablePortal")} id="portal" className="w-5 h-5 accent-indigo-600 cursor-pointer" />
          <label htmlFor="portal" className="text-sm font-black text-indigo-900 cursor-pointer tracking-tight">Enable Employee Portal Access</label>
        </div>
        <p className="text-[11px] text-indigo-600 font-medium mt-1.5 ml-8 leading-relaxed">
          The employee will be able to view payslips, submit their IT declaration and create reimbursement claims through the employee portal.
        </p>
      </div>

      {duplicateError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-[11px] font-black uppercase tracking-wider animate-shake">
          {duplicateError}
        </div>
      )}

      {/* Footer Button - Matching Dashboard Glow */}
      <div className="pt-6 border-t border-slate-100 flex justify-end">
        <button 
          disabled={checking} 
          type="submit"
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-3 rounded-xl font-black text-sm transition-all shadow-lg shadow-indigo-200 active:scale-95 disabled:bg-slate-300 disabled:shadow-none"
        >
          {checking ? "Verifying..." : "Save and Continue"}
        </button>
      </div>
    </form>
  );
};

export default BasicDetails;