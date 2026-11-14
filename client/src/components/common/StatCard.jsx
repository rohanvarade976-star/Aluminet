export default function StatCard({ label, title, value, icon: Icon, color = 'blue', trend, subtitle }) {
  const displayLabel = label || title;
  const colorMap = {
    blue:    { bg: 'bg-blue-50 dark:bg-blue-500/10',    text: 'text-blue-600 dark:text-blue-400' },
    indigo:  { bg: 'bg-indigo-50 dark:bg-indigo-500/10',text: 'text-indigo-600 dark:text-indigo-400' },
    cyan:    { bg: 'bg-cyan-50 dark:bg-cyan-500/10',    text: 'text-cyan-600 dark:text-cyan-400' },
    amber:   { bg: 'bg-amber-50 dark:bg-amber-500/10',  text: 'text-amber-600 dark:text-amber-400' },
    green:   { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
    fuchsia: { bg: 'bg-fuchsia-50 dark:bg-fuchsia-500/10', text: 'text-fuchsia-600 dark:text-fuchsia-400' },
    primary: { bg: 'bg-blue-50 dark:bg-blue-500/10',    text: 'text-blue-600 dark:text-blue-400' },
  };
  const theme = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 transition-all duration-200 hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme.bg} ${theme.text}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
            ↑ +{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</p>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{displayLabel}</p>
      {subtitle && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}
