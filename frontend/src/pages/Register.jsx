import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await register(formData.name, formData.email, formData.password, formData.companyName);
    } catch (err) {
      setError(err.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full bg-white font-sans">
      
      {/* LEFT SIDE: Brand & Aesthetic */}
      <div className="w-full lg:w-2/5 relative flex flex-col justify-between p-10 lg:p-14 bg-primary text-white lg:sticky lg:top-0 lg:h-screen">
        <div>
          <div className="flex items-center gap-2 mb-12">
            <div className="w-9 h-9 bg-yellow-400 rounded-lg flex items-center justify-center text-primary font-bold shadow-sm">
              <span className="text-base">P</span>
            </div>
            <span className="font-semibold text-xl tracking-tight text-white">Payroll<span className="text-yellow-400">Pro</span></span>
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-bold leading-tight tracking-tight mb-4 text-white">
            Modern Payroll & <br />
            <span className="text-yellow-400">Compliance</span> for Global Teams.
          </h2>
          <p className="text-blue-100 max-w-sm leading-relaxed text-sm">
            Automate salary disbursement, statutory compliance, tax deductions, and employee self-service in one platform.
          </p>
        </div>

        <div className="mt-10 pt-6 border-t border-white/20">
          <p className="text-xs text-blue-200 font-medium">
            Enterprise Grade • 100% Statutory Compliant
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Form Section */}
      <div className="w-full lg:w-3/5 flex flex-col bg-background pb-12 lg:pb-0">
        {/* Header/Nav */}
        <div className="p-6 lg:p-8 flex justify-end items-center sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-20">
          <p className="text-sm text-text-secondary mr-3">Already registered?</p>
          <Link to="/login" className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg text-xs font-semibold transition-colors">
            Sign In
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex flex-col justify-center px-6 md:px-16 lg:px-20 py-10 max-w-2xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-1">Create Admin Profile</h1>
            <p className="text-sm text-text-secondary">Register your organization to start processing payroll</p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-danger text-xs font-medium rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Your Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none transition-all text-sm font-medium text-text-primary"
                  placeholder="Alex Rivera"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Organization Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none transition-all text-sm font-medium text-text-primary"
                  placeholder="Acme Technologies"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Business Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none transition-all text-sm font-medium text-text-primary"
                placeholder="alex@acme.com"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none transition-all text-sm font-medium text-text-primary"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none transition-all text-sm font-medium text-text-primary"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-sm disabled:opacity-50 mt-2"
            >
              {loading ? 'Setting up workspace...' : 'Register Organization'}
            </button>
          </form>

          <footer className="mt-8 text-center">
            <p className="text-xs text-text-muted">
              By registering, you agree to our Terms of Service & Privacy Policy
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Register;