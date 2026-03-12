import {
  FiTrendingUp,
  FiDollarSign,
  FiMinusCircle,
  FiFileText,
} from 'react-icons/fi';

// Updated to high-contrast modern colors
const ICONS = {
  green: <FiTrendingUp />,
  primary: <FiDollarSign />,
  red: <FiMinusCircle />,
  orange: <FiFileText />,
};

// Modern color mapping for backgrounds and icons
const themeStyles = {
  green: {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-600',
    accent: 'bg-emerald-600',
  },
  red: {
    bg: 'bg-rose-50',
    icon: 'text-rose-600',
    accent: 'bg-rose-600',
  },
  primary: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    accent: 'bg-blue-600',
  },
  orange: {
    bg: 'bg-amber-50',
    icon: 'text-amber-600',
    accent: 'bg-amber-600',
  },
};

export default function KpiCard({ title, value, subtitle, accent }) {
  const theme = themeStyles[accent] || themeStyles.primary;

  return (
    <div className="relative group bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* Subtle top accent bar that expands on hover */}
      <div className={`absolute top-0 left-0 w-full h-1 ${theme.accent} opacity-20 group-hover:opacity-100 transition-opacity`} />
      
      <div className="flex flex-col gap-4">
        {/* Icon Header */}
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-2xl ${theme.bg} ${theme.icon} transition-transform group-hover:scale-110 duration-300`}>
            <div className="text-2xl">
              {ICONS[accent]}
            </div>
          </div>
          {/* Decorative element: tiny sparkline or badge can go here */}
          <div className={`text-[10px] font-bold px-2 py-1 rounded-full ${theme.bg} ${theme.icon} uppercase tracking-wider`}>
            Live
          </div>
        </div>

        {/* Content */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-tight">
            {title}
          </p>
          <p className="text-3xl font-black text-slate-800 mt-2 tracking-tighter">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs font-medium text-slate-500 mt-2 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-200"></span>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}