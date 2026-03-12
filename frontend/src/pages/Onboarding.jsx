import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config/api';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useContext(AuthContext);
  const { user } = useContext(AuthContext);
  const roleToPath = (role) => role.toLowerCase().replace(/\s+/g, '');

  const [onboardingData, setOnboardingData] = useState({
    companyName: '',
    industry: '',
    financialYear: { startMonth: 'April', endMonth: 'March' },
    statutoryConfig: {
      pf: { enabled: false, employeeContribution: 12, employerContribution: 12 },
      esi: { enabled: false, employeeContribution: 0.75, employerContribution: 3.25, wageLimit: 21000 },
      professionalTax: { enabled: false, state: '' },
      hra: { enabled: true, percentageOfBasic: 40, taxExempt: true }
    },
    accessLevels: {
      payrollAdmin: { canProcessPayroll: true, canApprovePayroll: true },
      hrAdmin: { canManageEmployees: true, canManageSalaryStructure: true },
      finance: { canViewReports: true, canExportData: true }
    },
    setupCompleted: true,
    location: ['']
  });

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/onboarding/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(onboardingData)
      });
      
      if (!res.ok) throw new Error("Failed to save configuration");
      
      const user = JSON.parse(localStorage.getItem('user'));
      user.onboardingCompleted = true;
      localStorage.setItem('user', JSON.stringify(user));
      window.location.href = `/payroll/${roleToPath(user.role)}`;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden">
      
      {/* LEFT SIDEBAR - Fixed */}
      <div className="w-1/4 bg-slate-900 text-white p-10 flex flex-col shrink-0">
        <div className="flex items-center gap-2 mb-16">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-lg">💼</div>
          <span className="text-xl font-bold tracking-tight">PayrollPro</span>
        </div>

        <div className="space-y-8">
          {[
            { id: 1, label: "Company Profile" },
            { id: 2, label: "Statutory & HRA" },
            { id: 3, label: "Finalize Setup" }
          ].map((s) => (
            <div key={s.id} className={`flex items-center gap-4 ${step === s.id ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm ${step >= s.id ? 'bg-white text-slate-900 border-white' : 'border-slate-700'}`}>
                {s.id}
              </div>
              <span className="font-semibold">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto text-slate-500 text-xs">
          © 2026 PayrollPro v1.0 <br />
          Organization Onboarding
        </div>
      </div>

      {/* RIGHT CONTENT - Scrollable */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-2xl mx-auto py-20 px-10">
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          {/* STEP 1: COMPANY INFO */}
          {step === 1 && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Company Information</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Company Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                    placeholder="WAMS"
                    value={onboardingData.companyName}
                    onChange={(e) => setOnboardingData({...onboardingData, companyName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Industry</label>
                  <select 
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white"
                    value={onboardingData.industry}
                    onChange={(e) => setOnboardingData({...onboardingData, industry: e.target.value})}
                  >
                    <option value="">Select Industry</option>
                    <option value="IT Services">IT Services</option>
                    <option value="Finance">Finance</option>
                    <option value="Retail">Retail</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Location</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                    placeholder="Chennai, Tamil Nadu"
                    value={onboardingData.location[0]}
                    onChange={(e) => setOnboardingData({...onboardingData, location: [e.target.value]})}
                  />
                </div>
                <button onClick={() => setStep(2)} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition mt-4">
                  Continue to Statutory
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: STATUTORY & HRA */}
          {step === 2 && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Statutory Details</h2>
              <div className="space-y-6">
                
                {/* PF Detail */}
                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-slate-700">Provident Fund (PF)</span>
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 accent-blue-600"
                      checked={onboardingData.statutoryConfig.pf.enabled} 
                      onChange={(e) => setOnboardingData({...onboardingData, statutoryConfig: {...onboardingData.statutoryConfig, pf: {...onboardingData.statutoryConfig.pf, enabled: e.target.checked}}})} 
                    />
                  </div>
                  {onboardingData.statutoryConfig.pf.enabled && (
                    <div className="grid grid-cols-2 gap-4 animate-fade-in">
                      <input type="number" placeholder="Emp %" className="p-2 border rounded text-sm" value={onboardingData.statutoryConfig.pf.employeeContribution} />
                      <input type="number" placeholder="Empr %" className="p-2 border rounded text-sm" value={onboardingData.statutoryConfig.pf.employerContribution} />
                    </div>
                  )}
                </div>

                {/* ESI Detail */}
                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-slate-700">ESI Coverage</span>
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 accent-blue-600"
                      checked={onboardingData.statutoryConfig.esi.enabled} 
                      onChange={(e) => setOnboardingData({...onboardingData, statutoryConfig: {...onboardingData.statutoryConfig, esi: {...onboardingData.statutoryConfig.esi, enabled: e.target.checked}}})} 
                    />
                  </div>
                  {onboardingData.statutoryConfig.esi.enabled && (
                    <input type="number" placeholder="Wage Limit (₹)" className="w-full p-2 border rounded text-sm" value={onboardingData.statutoryConfig.esi.wageLimit} />
                  )}
                </div>

                {/* Professional Tax */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Professional Tax State</label>
                  <select 
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white"
                    value={onboardingData.statutoryConfig.professionalTax.state}
                    onChange={(e) => setOnboardingData({...onboardingData, statutoryConfig: {...onboardingData.statutoryConfig, professionalTax: {enabled: !!e.target.value, state: e.target.value}}})}
                  >
                    <option value="">None</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Maharashtra">Maharashtra</option>
                  </select>
                </div>

                {/* HRA Detail */}
                <div className="p-5 bg-slate-900 text-white rounded-xl">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold">HRA (% of Basic)</span>
                    <input type="number" className="w-20 p-1 bg-slate-800 border-none rounded text-center font-bold" value={onboardingData.statutoryConfig.hra.percentageOfBasic} onChange={(e) => setOnboardingData({...onboardingData, statutoryConfig: {...onboardingData.statutoryConfig, hra: {...onboardingData.statutoryConfig.hra, percentageOfBasic: e.target.value}}})} />
                  </div>
                  <p className="text-xs text-slate-400">Default policy: 40% of basic salary for non-metro cities.</p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button onClick={() => setStep(1)} className="flex-1 py-3 text-sm font-bold text-slate-400">Back</button>
                  <button onClick={() => setStep(3)} className="flex-[2] bg-blue-600 text-white py-3 rounded-lg font-bold">Review & Finish</button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: FINAL REVIEW */}
          {step === 3 && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Ready to Launch?</h2>
              <p className="text-slate-500 mb-8 text-sm">Review your settings before completing the setup.</p>
              
              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-sm py-2 border-b">
                  <span className="text-slate-500">Company</span>
                  <span className="font-bold">{onboardingData.companyName}</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b">
                  <span className="text-slate-500">PF Status</span>
                  <span className="font-bold">{onboardingData.statutoryConfig.pf.enabled ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b">
                  <span className="text-slate-500">HRA Percentage</span>
                  <span className="font-bold">{onboardingData.statutoryConfig.hra.percentageOfBasic}%</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="flex-1 py-3 text-sm font-bold text-slate-400">Back</button>
                <button 
                  onClick={handleFinalSubmit} 
                  disabled={loading}
                  className="flex-[2] bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-lg shadow-green-100"
                >
                  {loading ? 'Finalizing...' : 'Complete Setup'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;