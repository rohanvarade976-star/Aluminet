export default function StatCard({ label, title, value, icon: Icon, color = 'primary', trend, subtitle }) {
  const displayLabel = label || title;
  const styles = {
    primary: { icon: 'bg-primary-50 text-primary-600', border: 'border-primary-100' },
    indigo:  { icon: 'bg-indigo-50 text-indigo-600',   border: 'border-indigo-100' },
    green:   { icon: 'bg-success-50 text-success-600',  border: 'border-green-100' },
    amber:   { icon: 'bg-warning-50 text-warning-600',  border: 'border-amber-100' },
    yellow:  { icon: 'bg-yellow-50 text-yellow-600',    border: 'border-yellow-100' },
    red:     { icon: 'bg-danger-50 text-danger-600',    border: 'border-red-100' },
    purple:  { icon: 'bg-purple-50 text-purple-600',    border: 'border-purple-100' },
    blue:    { icon: 'bg-blue-50 text-blue-600',        border: 'border-blue-100' },
  };
  const s = styles[color] || styles.primary;
  return (
    <div className={`bg-white rounded-2xl border shadow-card p-5 ${s.border}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.icon}`}>
          <Icon size={20} />
        </div>
        {trend !== undefined && (
          <span className={`badge text-xs ${trend >= 0 ? 'badge-success' : 'badge-danger'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500 mt-0.5 font-medium">{displayLabel}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}
