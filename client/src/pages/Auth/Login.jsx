import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(form.email, form.password);
    if (res.success) { toast.success('Welcome back!'); navigate('/dashboard', { replace: true }); }
    else toast.error(res.error);
  };

  const demoRoles = [
    { label: 'Student', email: 'student@demo.com', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200' },
    { label: 'Alumni',  email: 'alumni@demo.com',  color: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200' },
    { label: 'Admin',   email: 'admin@demo.com',   color: 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/30 rounded-full -translate-y-48 translate-x-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-700/40 rounded-full translate-y-32 -translate-x-32" />
        <div className="relative z-10 text-white max-w-sm">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-4xl font-bold mb-4 leading-tight">Connect. Learn. Grow.</h2>
          <p className="text-primary-100 text-lg leading-relaxed">AlumiNet bridges the gap between students and alumni through AI-powered mentorship and networking.</p>
          <div className="mt-10 space-y-4">
            {[['🤖 AI Mentor Matching','Get matched with the perfect mentor'],['💼 Career Guidance','Learn from real industry professionals'],['🎓 Community Forum','Ask questions, share knowledge']].map(([t,d]) => (
              <div key={t} className="flex items-start gap-3">
                <span className="text-lg">{t.split(' ')[0]}</span>
                <div><p className="font-medium">{t.split(' ').slice(1).join(' ')}</p><p className="text-primary-200 text-sm">{d}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">AlumiNet</span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-1">Welcome back</h1>
          <p className="text-slate-500 mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" required className="input pl-10" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type={showPw ? 'text' : 'password'} required className="input pl-10 pr-10"
                  placeholder="Enter your password" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? 'Signing in…' : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account? <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700">Create account</Link>
          </p>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick Demo Access</p>
            <div className="grid grid-cols-3 gap-2">
              {demoRoles.map(({ label, email, color }) => (
                <button key={label} onClick={() => setForm({ email, password: 'demo123' })}
                  className={`text-xs py-2.5 px-3 rounded-xl font-medium border transition-all ${color}`}>
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 text-center mt-2">Password: demo123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
