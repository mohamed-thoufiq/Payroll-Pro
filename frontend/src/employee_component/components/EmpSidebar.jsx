import { useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  ReceiptText, 
  ScrollText, 
  HandCoins, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  X, 
  WalletCards 
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const menu = [
  { label: 'Dashboard', key: 'dashboard', icon: LayoutDashboard },
  { label: 'Payslips', key: 'payslips', icon: ReceiptText },
  { label: 'Salary Structure', key: 'salary', icon: ScrollText }, 
  { label: 'Reimbursement', key: 'reimbursement', icon: WalletCards }, 
  { label: 'Leave Request', key: 'attendence', icon: HandCoins },
  { label: 'Notifications', key: 'notifications', icon: Bell },
  { label: 'Profile', key: 'profile', icon: UserIcon },
];

export default function EmpSidebar({ isOpen, onClose }) {
  const { user, Employeelogout } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = searchParams.get('section') || 'dashboard';

  const getInitials = (name) => {
    if (!name) return "EE";
    return name.split(' ').filter(Boolean).map(w => w[0].toUpperCase()).join('').slice(0, 2);
  };

  const handleNavClick = (key) => {
    setSearchParams({ section: key });
    onClose(); 
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>
      
      {/* SIDEBAR ASIDE - Royal Blue & Gold Theme from C:\HTML\Payroll-frontend */}
      <aside className={`
        fixed left-0 top-0 h-screen w-64 bg-primary text-white flex flex-col z-50 transition-transform duration-300 ease-in-out shadow-lg
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        
        {/* MOBILE CLOSE BUTTON */}
        <button onClick={onClose} className="lg:hidden absolute right-4 top-4 p-2 text-blue-200 hover:text-white transition-colors">
          <X size={20} />
        </button>

        {/* PROFILE HEADER */}
        <div className="px-6 py-6 border-b border-yellow-400/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-yellow-400 bg-white/10 flex items-center justify-center text-yellow-300 font-bold text-base shadow-sm">
              {getInitials(user?.name)}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-white truncate text-sm">
                {user?.name ?? 'Employee'}
              </p>
              <p className="text-xs text-yellow-300 font-medium">
                {user?.role ?? 'User'}
              </p>
            </div>
          </div>

          <div className="mt-3 text-xs text-yellow-200/90 font-medium">
            {user?.employeeDetails?.basic?.department || 'Employee Self-Service'}
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto custom-scrollbar">
          {menu.map(({ label, key, icon: Icon }) => {
            const isActive = key === activeSection;
            return (
              <div
                key={key}
                onClick={() => handleNavClick(key)}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer
                  transition-all duration-200 ease-out text-sm
                  ${
                    isActive
                      ? 'bg-yellow-400 text-primary font-bold shadow-sm'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white hover:translate-x-0.5 font-medium'
                  }
                `}
              >
                <Icon size={18} className={isActive ? 'text-primary' : 'text-blue-200'} />
                <span>{label}</span>
              </div>
            );
          })}
        </nav>

        {/* FOOTER & LOGOUT */}
        <div className="px-6 py-4 border-t border-yellow-400/20 flex flex-col gap-2">
          <button
            onClick={Employeelogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-blue-100 hover:bg-white/10 hover:text-white transition-all"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
          <div className="text-[10px] text-blue-200/80">
            © 2026 Payroll System
          </div>
        </div>
      </aside>
    </>
  );
}