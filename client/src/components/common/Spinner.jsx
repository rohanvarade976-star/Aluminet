export default function Spinner({ full, size = 'md' }) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-10 h-10 border-3' };
  if (full) return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
  return (
    <div className={`${sizes[size]} border-primary-200 border-t-primary-600 rounded-full animate-spin`} />
  );
}
