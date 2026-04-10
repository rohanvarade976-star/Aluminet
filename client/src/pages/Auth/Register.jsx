import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { GraduationCap, Mail, Lock, User, Eye, EyeOff, ArrowRight, Building } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'student', department:'', graduationYear:'' });
  const [showPw, setShowPw] = useState(false);
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await register(form);
    if (res.success) { toast.success('Account created! Welcome to AlumiNet 🎉'); navigate('/dashboard', { replace: true }); }
    else toast.error(res.error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-primary">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">AlumiNet</span>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-1">Create your account</h1>
        <p className="text-slate-500 mb-8">Join thousands of students and alumni on AlumiNet</p>

        <div className="card p-6">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[['student','🎓','Student','Currently studying'],['alumni','💼','Alumni','Already graduated']].map(([r,emoji,label,desc]) => (
              <button key={r} type="button" onClick={() => setForm(p => ({ ...p, role: r }))}
                className={`p-3 rounded-xl border-2 text-left transition-all ${form.role === r ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                <span className="text-lg">{emoji}</span>
                <p className={`text-sm font-semibold mt-1 ${form.role === r ? 'text-primary-700' : 'text-slate-700'}`}>{label}</p>
                <p className={`text-xs ${form.role === r ? 'text-primary-500' : 'text-slate-400'}`}>{desc}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input required className="input pl-10" placeholder="Your full name" value={form.name} onChange={f('name')} />
              </div>
            </div>
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" required className="input pl-10" placeholder="you@example.com" value={form.email} onChange={f('email')} />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type={showPw ? 'text' : 'password'} required minLength={6} className="input pl-10 pr-10" placeholder="Min. 6 characters" value={form.password} onChange={f('password')} />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Department</label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input className="input pl-10" placeholder="e.g. Computer Engg" value={form.department} onChange={f('department')} />
                </div>
              </div>
              <div>
                <label className="label">Grad Year</label>
                <input type="number" className="input" placeholder="2025" min="2000" max="2030" value={form.graduationYear} onChange={f('graduationYear')} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-1">
              {loading ? 'Creating account…' : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          Already have an account? <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
