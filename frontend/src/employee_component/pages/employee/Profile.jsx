import { useContext } from 'react';
import {
  MdPerson,
  MdMail,
  MdWork,
  MdCalendarToday,
  MdAccountBalance,
  MdBadge,
  MdLocationOn,
  MdCake,
  MdPhoneIphone,
  MdFingerprint
} from 'react-icons/md';
import { AuthContext } from '../../../context/AuthContext';

export default function Profile() {
  const { user } = useContext(AuthContext);
  
  const basic = user?.employeeDetails?.basic;
  const personal = user?.employeeDetails?.personal;
  const payment = user?.employeeDetails?.payment;

  // Safe Derived Values
  const fullName = basic ? `${basic.firstName} ${basic.lastName}` : (user?.name || 'Employee User');
  const initials = fullName !== 'Employee User' 
    ? fullName.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'EU';

  return (
    <div className="space-y-6">
      
      {/* Page Header matching C:\HTML\Payroll-frontend */}
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold text-text-primary">
          <MdPerson size={22} className="text-primary" />
          Profile
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          View your personal and payroll-related information
        </p>
      </div>

      {/* ===== 1. BASIC PROFILE CARD ===== */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center gap-6">
        <div className="w-16 h-16 rounded-full border-2 border-primary bg-blue-50 flex items-center justify-center text-primary font-bold text-xl shrink-0">
          {initials}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-text-primary">{fullName}</h3>
          <p className="text-sm text-text-secondary">{user?.role ?? 'Employee'}</p>
          <p className="text-xs text-text-muted mt-0.5">{basic?.department || 'Employee Self-Service'}</p>
        </div>
      </div>

      {/* ===== 2. DETAILS GRID ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* EMPLOYMENT CARD */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <MdWork className="text-primary" size={20} />
            <h3 className="font-semibold text-text-primary">Employment Details</h3>
          </div>
          <div className="space-y-3">
            <DetailItem icon={MdBadge} label="Employee ID" value={basic?.employeeId || 'EMP-001'} />
            <DetailItem icon={MdCalendarToday} label="Date of Joining" value={basic?.doj} />
            <DetailItem icon={MdWork} label="Department" value={basic?.department} />
            <DetailItem icon={MdLocationOn} label="Work Location" value={basic?.location} />
          </div>
        </div>

        {/* PERSONAL CARD */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <MdPerson className="text-success" size={20} />
            <h3 className="font-semibold text-text-primary">Personal Details</h3>
          </div>
          <div className="space-y-3">
            <DetailItem icon={MdMail} label="Work Email" value={basic?.email || user?.email} />
            <DetailItem icon={MdPhoneIphone} label="Mobile Number" value={basic?.mobile} />
            <DetailItem icon={MdCake} label="Date of Birth" value={personal?.dob} />
            <DetailItem icon={MdFingerprint} label="PAN Number" value={personal?.pan} />
          </div>
        </div>

        {/* BANKING CARD - Full Width */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <MdAccountBalance className="text-warning" size={20} />
            <h3 className="font-semibold text-text-primary">Payment Information</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <DetailItem icon={MdAccountBalance} label="Bank Name" value={payment?.details?.bankName} />
            <DetailItem icon={MdBadge} label="Account Number" value={payment?.details?.accountNumber} />
            <DetailItem icon={MdFingerprint} label="IFSC Code" value={payment?.details?.ifsc} />
            <div className="p-3 bg-muted rounded-lg border border-gray-200">
              <p className="text-[11px] font-semibold text-text-secondary uppercase">Payment Mode</p>
              <p className="text-sm font-semibold text-text-primary mt-0.5">{payment?.mode || 'Direct Deposit'}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-muted text-text-secondary shrink-0">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-sm font-medium text-text-primary truncate">
          {value || '—'}
        </p>
      </div>
    </div>
  );
}