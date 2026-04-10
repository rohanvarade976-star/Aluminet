import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { GraduationCap, LayoutDashboard, Users, Calendar, MessageSquare, BookOpen, LogOut, User, Shield, Wifi, WifiOff, FileText, Briefcase, CheckCircle, ChevronRight, BookMarked, Trophy } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useSocketStore from '../../store/socketStore';
import NotificationBell from './NotificationBell';
import toast from 'react-hot-toast';

const navGroups = {
  student: [
    { label: 'Main', items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/mentors',   icon: Users,           label: 'Find Mentors' },
      { to: '/sessions',  icon: BookOpen,         label: 'My Sessions' },
    ]},
    { label: 'Community', items: [
      { to: '/events',       icon: Calendar,      label: 'Events' },
      { to: '/forum',        icon: MessageSquare, label: 'Forum' },
      { to: '/chat',         icon: MessageSquare, label: 'Chat' },
      { to: '/study-groups', icon: BookMarked,    label: 'Study Groups' },
      { to: '/jobs',         icon: Briefcase,     label: 'Job Board' },
    ]},
    { label: 'AI Tools', items: [
      { to: '/ai-jobs', icon: Briefcase, label: 'AI Job Match' },
      { to: '/resume',  icon: FileText,  label: 'Resume Analyzer' },
    ]},
    { label: 'Account', items: [
      { to: '/achievements', icon: Trophy,      label: 'Achievements' },
      { to: '/verify',       icon: CheckCircle, label: 'Get Verified' },
    ]},
  ],
  alumni: [
    { label: 'Main', items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/sessions',  icon: BookOpen,         label: 'My Sessions' },
    ]},
    { label: 'Community', items: [
      { to: '/events',       icon: Calendar,      label: 'Events' },
      { to: '/forum',        icon: MessageSquare, label: 'Forum' },
      { to: '/chat',         icon: MessageSquare, label: 'Chat' },
      { to: '/study-groups', icon: BookMarked,    label: 'Study Groups' },
      { to: '/jobs',         icon: Briefcase,     label: 'Post Jobs' },
    ]},
    { label: 'Account', items: [
      { to: '/achievements', icon: Trophy,      label: 'Achievements' },
      { to: '/verify',       icon: CheckCircle, label: 'Get Verified' },
    ]},
  ],
  admin: [
    { label: 'Management', items: [
      { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/admin/verify', icon: Shield,           label: 'Verifications' },
      { to: '/events',       icon: Calendar,         label: 'Events' },
      { to: '/forum',        icon: MessageSquare,    label: 'Forum' },
      { to: '/jobs',         icon: Briefcase,        label: 'Jobs' },
    ]},
  ],
};

function NavGroup({ label, items }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1">{label}</p>
      {items.map(({ to, icon: Icon, label }) => (
        <NavLink key={to} to={to} end={to === '/dashboard'}
          className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 mb-0.5 ${isActive ? 'bg-primary-50 text-primary-700 border border-primary-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
          <Icon className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{label}</span>
        </NavLink>
      ))}
    </div>
  );
}

export default function Layout() {
  const { user, logout } = useAuthStore();
  const { connected } = useSocketStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const groups = navGroups[user?.role] || navGroups.student;
  const verifStatus = user?.verificationStatus || 'none';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col flex-shrink-0 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-primary flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-slate-900 text-base leading-none">AlumiNet</h1>
              <div className="flex items-center gap-1 mt-0.5">
                {connected ? <Wifi className="w-2.5 h-2.5 text-green-500" /> : <WifiOff className="w-2.5 h-2.5 text-slate-400" />}
                <span className="text-xs text-slate-400">{connected ? 'Live' : 'Offline'}</span>
              </div>
            </div>
            <NotificationBell />
          </div>
        </div>

        {verifStatus === 'none' && user?.role !== 'admin' && (
          <NavLink to="/verify" className="mx-3 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 hover:bg-amber-100 transition-all">
            <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-amber-800">Verify your account</p>
              <p className="text-xs text-amber-600">Upload docs to unlock all features</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          </NavLink>
        )}
        {verifStatus === 'approved' && (
          <div className="mx-3 mt-3 p-2.5 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <p className="text-xs font-semibold text-green-700">Verified Account ✅</p>
          </div>
        )}
        {verifStatus === 'pending' && (
          <div className="mx-3 mt-3 p-2.5 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-xs font-semibold text-blue-700">⏳ Verification under review</p>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto p-3 pt-3">
          {groups.map(g => <NavGroup key={g.label} {...g} />)}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-primary-200">
              {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : <span className="text-primary-700 font-bold text-sm">{user?.name?.[0]?.toUpperCase()}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize flex items-center gap-1">
                {user?.role === 'admin' && <Shield className="w-2.5 h-2.5" />}
                {user?.role}{user?.points > 0 && ` · ${user.points}pts`}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <NavLink to={`/profile/${user?._id}`} className="flex-1 flex items-center justify-center gap-1 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 py-2 rounded-xl transition-all font-medium">
              <User className="w-3.5 h-3.5" /> Profile
            </NavLink>
            <button onClick={handleLogout} className="flex-1 flex items-center justify-center gap-1 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 py-2 rounded-xl transition-all font-medium">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto"><Outlet /></main>
    </div>
  );
}
