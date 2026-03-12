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
} from 'lucide-react'; // Modern, attractive icon set
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
      
      {/* SIDEBAR ASIDE */}
      <aside className={`
        fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        
        {/* MOBILE CLOSE BUTTON */}
        <button onClick={onClose} className="lg:hidden absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={20} />
        </button>

        {/* PROFILE HEADER */}
        <div className="p-8 border-b border-slate-50 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-indigo-100 mb-4 transition-transform hover:scale-105">
            {getInitials(user?.name)}
          </div>
          <div className="min-w-0">
            <p className="font-black text-slate-900 truncate text-sm">
              {user?.name ?? 'Employee'}
            </p>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-1">
              {user?.role ?? 'User'}
            </p>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1 custom-scrollbar">
          {menu.map(({ label, key, icon: Icon }) => {
            const isActive = key === activeSection;
            return (
              <div
                key={key}
                onClick={() => handleNavClick(key)}
                className={`
                  group flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-200
                  ${isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                <Icon 
                  size={20} 
                  className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'} 
                />
                <span className={`text-sm ${isActive ? 'font-black' : 'font-bold'}`}>
                  {label}
                </span>
                
                {/* Visual indicator for active item */}
                {isActive && (
                  <motion.div 
                    layoutId="activePill"
                    className="ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-sm"
                  />
                )}
              </div>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <div className="p-4 border-t border-slate-50 bg-slate-50/30">
          <button
            onClick={Employeelogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all font-bold text-sm"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}