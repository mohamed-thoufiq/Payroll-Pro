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
      <div className="w-1/4 bg-gray-900 text-white p-8 flex flex-col shrink-0 border-r border-gray-800">
        <div className="flex items-center gap-2 mb-12">
          <div className="w-8 h-8 rounded-lg bg-yellow-400 text-gray-900 font-bold flex items-center justify-center text-sm shadow-sm">
            P
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">Payroll<span className="text-yellow-400">Pro</span></span>
        </div>

        <div className="space-y-6">
          {[
            { id: 1, label: "Company Profile" },
            { id: 2, label: "Statutory & HRA" },
            { id: 3, label: "Finalize Setup" }
          ].map((s) => (
            <div key={s.id} className={`flex items-center gap-3.5 ${step === s.id ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-7 h-7 rounded-full border flex items-center justify-center font-bold text-xs ${
                step === s.id 
                  ? 'bg-yellow-400 text-gray-900 border-yellow-400' 
                  : step > s.id 
                  ? 'bg-primary text-white border-primary' 
                  : 'border-gray-700 text-gray-400'
              }`}>
                {step > s.id ? '✓' : s.id}
              </div>
              <span className="font-medium text-sm text-white">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto text-gray-500 text-xs">
          © 2026 PayrollPro <br />
          Organization Setup
        </div>
      </div>

      {/* RIGHT CONTENT - Scrollable */}
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-xl mx-auto py-16 px-8">
          
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-danger rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {/* STEP 1: COMPANY INFO */}
          {step === 1 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-primary">
              <h2 className="text-xl font-semibold text-text-primary mb-1">Company Profile</h2>
              <p className="text-sm text-text-secondary mb-6">Enter details about your organization</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Company Name</label>
                  <input 
                    type="text" 
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm text-text-primary"
                    placeholder="Acme Corp"
                    value={onboardingData.companyName}
                    onChange={(e) => setOnboardingData({...onboardingData, companyName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Industry Type</label>
                  <select 
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-text-primary outline-none focus:border-primary"
                    value={onboardingData.industry}
                    onChange={(e) => setOnboardingData({...onboardingData, industry: e.target.value})}
                  >
                    <option value="">Select Industry</option>
                    <option value="IT Services">IT Services</option>
                    <option value="Finance">Finance</option>
                    <option value="Retail">Retail</option>
                    <option value="Manufacturing">Manufacturing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Headquarters Location</label>
                  <input 
                    type="text" 
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm text-text-primary"
                    placeholder="Chennai, Tamil Nadu"
                    value={onboardingData.location[0]}
                    onChange={(e) => setOnboardingData({...onboardingData, location: [e.target.value]})}
                  />
                </div>
                <button onClick={() => setStep(2)} className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 rounded-lg font-semibold text-sm transition mt-3 shadow-sm">
                  Continue to Statutory Settings →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: STATUTORY & HRA */}
          {step === 2 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-primary">
              <h2 className="text-xl font-semibold text-text-primary mb-1">Statutory Compliance</h2>
              <p className="text-sm text-text-secondary mb-6">Configure payroll statutory deductions and HRA allowance</p>
              <div className="space-y-4">
                
                {/* PF Detail */}
                <div className="p-4 border border-gray-200 rounded-lg bg-muted">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-text-primary text-xs uppercase tracking-wider">Provident Fund (PF)</span>
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 accent-primary"
                      checked={onboardingData.statutoryConfig.pf.enabled} 
                      onChange={(e) => setOnboardingData({...onboardingData, statutoryConfig: {...onboardingData.statutoryConfig, pf: {...onboardingData.statutoryConfig.pf, enabled: e.target.checked}}})} 
                    />
                  </div>
                  {onboardingData.statutoryConfig.pf.enabled && (
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                      <div>
                        <label className="text-[11px] text-text-muted block mb-1">Employee Contrib (%)</label>
                        <input type="number" className="w-full p-2 border border-gray-200 rounded text-xs" value={onboardingData.statutoryConfig.pf.employeeContribution} onChange={(e) => setOnboardingData({...onboardingData, statutoryConfig: {...onboardingData.statutoryConfig, pf: {...onboardingData.statutoryConfig.pf, employeeContribution: Number(e.target.value)}}})}/>
                      </div>
                      <div>
                        <label className="text-[11px] text-text-muted block mb-1">Employer Contrib (%)</label>
                        <input type="number" className="w-full p-2 border border-gray-200 rounded text-xs" value={onboardingData.statutoryConfig.pf.employerContribution} onChange={(e) => setOnboardingData({...onboardingData, statutoryConfig: {...onboardingData.statutoryConfig, pf: {...onboardingData.statutoryConfig.pf, employerContribution: Number(e.target.value)}}})}/>
                      </div>
                    </div>
                  )}
                </div>

                {/* ESI Detail */}
                <div className="p-4 border border-gray-200 rounded-lg bg-muted">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-text-primary text-xs uppercase tracking-wider">ESI Coverage</span>
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 accent-primary"
                      checked={onboardingData.statutoryConfig.esi.enabled} 
                      onChange={(e) => setOnboardingData({...onboardingData, statutoryConfig: {...onboardingData.statutoryConfig, esi: {...onboardingData.statutoryConfig.esi, enabled: e.target.checked}}})} 
                    />
                  </div>
                  {onboardingData.statutoryConfig.esi.enabled && (
                    <div className="pt-2 border-t border-gray-200">
                      <label className="text-[11px] text-text-muted block mb-1">Wage Ceiling (₹)</label>
                      <input type="number" className="w-full p-2 border border-gray-200 rounded text-xs" value={onboardingData.statutoryConfig.esi.wageLimit} onChange={(e) => setOnboardingData({...onboardingData, statutoryConfig: {...onboardingData.statutoryConfig, esi: {...onboardingData.statutoryConfig.esi, wageLimit: Number(e.target.value)}}})}/>
                    </div>
                  )}
                </div>

                {/* Professional Tax */}
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Professional Tax State</label>
                  <select 
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-200 bg-white text-sm"
                    value={onboardingData.statutoryConfig.professionalTax.state}
                    onChange={(e) => setOnboardingData({...onboardingData, statutoryConfig: {...onboardingData.statutoryConfig, professionalTax: {enabled: !!e.target.value, state: e.target.value}}})}
                  >
                    <option value="">None</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Maharashtra">Maharashtra</option>
                  </select>
                </div>

                {/* HRA Detail */}
                <div className="p-4 bg-muted border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">House Rent Allowance (HRA)</span>
                    <div className="flex items-center gap-1">
                      <input type="number" className="w-16 p-1.5 bg-white border border-gray-200 rounded text-center text-xs font-semibold" value={onboardingData.statutoryConfig.hra.percentageOfBasic} onChange={(e) => setOnboardingData({...onboardingData, statutoryConfig: {...onboardingData.statutoryConfig, hra: {...onboardingData.statutoryConfig.hra, percentageOfBasic: Number(e.target.value)}}})} />
                      <span className="text-xs text-text-muted">%</span>
                    </div>
                  </div>
                  <p className="text-xs text-text-muted mt-1">Default statutory policy: 40% of basic salary for non-metro locations.</p>
                </div>

                <div className="flex gap-3 pt-3">
                  <button onClick={() => setStep(1)} className="flex-1 py-2 rounded-lg text-xs font-semibold text-text-secondary border border-gray-200 hover:bg-gray-50 transition">Back</button>
                  <button onClick={() => setStep(3)} className="flex-[2] bg-primary hover:bg-primary-hover text-white py-2 rounded-lg font-semibold text-xs transition shadow-sm">Review & Finish</button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: FINAL REVIEW */}
          {step === 3 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-success">
              <h2 className="text-xl font-semibold text-text-primary mb-1">Ready to Launch</h2>
              <p className="text-sm text-text-secondary mb-6">Review your initial organization setup before completing launch</p>
              
              <div className="space-y-3 mb-6 bg-muted p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between text-xs py-1 border-b border-gray-200">
                  <span className="text-text-secondary">Company Name</span>
                  <span className="font-semibold text-text-primary">{onboardingData.companyName || 'Not Set'}</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-gray-200">
                  <span className="text-text-secondary">PF Status</span>
                  <span className="font-semibold text-text-primary">{onboardingData.statutoryConfig.pf.enabled ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span className="text-text-secondary">HRA Percentage</span>
                  <span className="font-semibold text-text-primary">{onboardingData.statutoryConfig.hra.percentageOfBasic}% of Basic</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-2.5 text-xs font-semibold text-text-secondary border border-gray-200 rounded-lg hover:bg-gray-50 transition">Back</button>
                <button 
                  onClick={handleFinalSubmit} 
                  disabled={loading}
                  className="flex-[2] bg-primary hover:bg-primary-hover text-white py-2.5 rounded-lg font-semibold text-xs transition shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Finalizing...' : 'Complete Setup & Launch'}
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