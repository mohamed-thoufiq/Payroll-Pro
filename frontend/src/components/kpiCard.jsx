import {
  FiTrendingUp,
  FiDollarSign,
  FiMinusCircle,
  FiFileText,
} from 'react-icons/fi';

const ICONS = {
  green: <FiTrendingUp className="text-success" />,
  primary: <FiDollarSign className="text-primary" />,
  red: <FiMinusCircle className="text-danger" />,
  orange: <FiFileText className="text-warning" />,
};

const accentStyles = {
  green: 'border-l-success',
  red: 'border-l-danger',
  primary: 'border-l-primary',
  orange: 'border-l-warning',
};

export default function KpiCard({ title, value, subtitle, accent = 'primary' }) {
  const icon = ICONS[accent] || ICONS.primary;
  const accentBorder = accentStyles[accent] || accentStyles.primary;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className={`flex items-start gap-4 border-l-4 pl-4 ${accentBorder}`}>
        <div className="text-xl mt-1">
          {icon}
        </div>

        <div>
          <p className="text-sm font-medium text-text-secondary">{title}</p>
          <p className="text-2xl font-semibold text-text-primary mt-1 tabular-nums tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-text-muted mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}