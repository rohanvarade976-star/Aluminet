import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import AnimatedPage from './AnimatedPage';
import {
  GraduationCap, LayoutDashboard, Users, Calendar, MessageSquare,
  BookOpen, LogOut, User, Shield, FileText, Briefcase, CheckCircle,
  BookMarked, Trophy, ChevronRight, Wifi, WifiOff, Bell, Menu, X,
  Sparkles, Zap, Moon, Sun, Target
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useSocketStore from '../../store/socketStore';
import useThemeStore from '../../store/themeStore';
import NotificationBell from './NotificationBell';
import { getRouteMeta } from '../../utils/routeMeta';
import toast from 'react-hot-toast';

const navGroups = {
  student: [
    { label: 'Overview', items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'text-indigo-600 dark:text-indigo-300' },
      { to: '/mentors',   icon: Users,           label: 'Find Alumni', color: 'text-violet-600 dark:text-violet-300' },
      { to: '/sessions',  icon: BookOpen,         label: 'My Sessions', color: 'text-blue-600 dark:text-blue-300' },
    ]},
    { label: 'Community', items: [
      { to: '/events',       icon: Calendar,      label: 'Events',       color: 'text-amber-600 dark:text-amber-300' },
      { to: '/forum',        icon: MessageSquare, label: 'Forum',        color: 'text-pink-600 dark:text-pink-300' },
      { to: '/chat',         icon: Zap,           label: 'Live Chat',    color: 'text-green-600 dark:text-green-300' },
      { to: '/study-groups', icon: BookMarked,    label: 'Study Groups', color: 'text-cyan-600 dark:text-cyan-300' },
      { to: '/jobs',         icon: Briefcase,     label: 'Job Board',    color: 'text-orange-600 dark:text-orange-300' },
    ]},
    { label: 'AI Tools', items: [
      { to: '/skill-gap',      icon: Target,       label: 'Skill Gap',      color: 'text-rose-600 dark:text-rose-300' },
      { to: '/interview-prep', icon: MessageSquare, label: 'Interview Prep', color: 'text-violet-600 dark:text-violet-300' },
      { to: '/ai-jobs', icon: Sparkles, label: 'AI Job Match',     color: 'text-violet-600 dark:text-violet-300' },
      { to: '/resume',  icon: FileText, label: 'Resume Analyzer',  color: 'text-blue-600 dark:text-blue-300' },
    ]},
    { label: 'Account', items: [
      { to: '/achievements', icon: Trophy,      label: 'Achievements', color: 'text-amber-600 dark:text-amber-300' },
      { to: '/verify',       icon: CheckCircle, label: 'Get Verified',  color: 'text-green-600 dark:text-green-300' },
    ]},
  ],
  alumni: [
    { label: 'Overview', items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard',   color: 'text-indigo-600 dark:text-indigo-300' },
      { to: '/sessions',  icon: BookOpen,         label: 'My Sessions', color: 'text-blue-600 dark:text-blue-300' },
    ]},
    { label: 'Community', items: [
      { to: '/events',       icon: Calendar,      label: 'Events',       color: 'text-amber-600 dark:text-amber-300' },
      { to: '/forum',        icon: MessageSquare, label: 'Forum',        color: 'text-pink-600 dark:text-pink-300' },
      { to: '/chat',         icon: Zap,           label: 'Live Chat',    color: 'text-green-600 dark:text-green-300' },
      { to: '/study-groups', icon: BookMarked,    label: 'Study Groups', color: 'text-cyan-600 dark:text-cyan-300' },
      { to: '/jobs',         icon: Briefcase,     label: 'Post Jobs',    color: 'text-orange-600 dark:text-orange-300' },
    ]},
    { label: 'AI Tools', items: [
      { to: '/skill-gap',      icon: Target,       label: 'Skill Gap',      color: 'text-rose-600 dark:text-rose-300' },
      { to: '/interview-prep', icon: MessageSquare, label: 'Interview Prep', color: 'text-violet-600 dark:text-violet-300' },
    ]},
    { label: 'Account', items: [
      { to: '/achievements', icon: Trophy,      label: 'Achievements', color: 'text-amber-600 dark:text-amber-300' },
      { to: '/verify',       icon: CheckCircle, label: 'Get Verified',  color: 'text-green-600 dark:text-green-300' },
    ]},
  ],
  admin: [
    { label: 'Management', items: [
      { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard',      color: 'text-indigo-600 dark:text-indigo-300' },
      { to: '/admin/verify', icon: Shield,           label: 'Verifications',  color: 'text-green-600 dark:text-green-300' },
      { to: '/events',       icon: Calendar,         label: 'Events',         color: 'text-amber-600 dark:text-amber-300' },
      { to: '/forum',        icon: MessageSquare,    label: 'Forum',          color: 'text-pink-600 dark:text-pink-300' },
      { to: '/jobs',         icon: Briefcase,        label: 'Jobs',           color: 'text-orange-600 dark:text-orange-300' },
    ]},
  ],
};

function NavItem({ to, icon: Icon, label, color }) {
  return (
    <NavLink
      to={to} end={to === '/dashboard'}
      className={({ isActive }) =>
        isActive
          ? 'sidebar-link-active group'
          : 'sidebar-link group'
      }
    >
      {({ isActive }) => (
        <>
          <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-150 ${isActive ? 'bg-white/90 dark:bg-white/20 shadow-sm' : 'bg-slate-200 dark:bg-white/5 group-hover:bg-slate-300 dark:group-hover:bg-white/10'}`}>
            <Icon className={`w-4 h-4 ${isActive ? 'text-violet-600 dark:text-white' : color}`} />
          </span>
          <span className="flex-1 truncate">{label}</span>
          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-violet-600 dark:bg-white/60 flex-shrink-0" />}
        </>
      )}
    </NavLink>
  );
}

function NavGroup({ label, items }) {
  return (
    <div className="mb-5">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-1.5">{label}</p>
      <div className="space-y-0.5">
        {items.map(item => <NavItem key={item.to} {...item} />)}
      </div>
    </div>
  );
}

export default function Layout() {
  const { user, logout } = useAuthStore();
  const { connected } = useSocketStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const groups = navGroups[user?.role] || navGroups.student;
  const verifStatus = user?.verificationStatus || 'none';
  const pageMeta = getRouteMeta(location.pathname);

  const Sidebar = () => (
    <aside className="w-64 flex flex-col flex-shrink-0 h-full bg-white/60 dark:bg-white/5 backdrop-blur-3xl border-r border-slate-200 dark:border-white/10 relative z-20">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-sm dark:shadow-[0_0_20px_rgba(139,92,246,0.4)]">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-extrabold text-slate-900 dark:text-white text-lg leading-none tracking-tight">AlumiNet</h1>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 dark:bg-emerald-400 animate-pulse dark:shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'bg-slate-300 dark:bg-slate-500'}`} />
              <span className="text-[10px] text-slate-500 dark:text-slate-300 font-bold tracking-wider uppercase">{connected ? 'Live' : 'Offline'}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <NotificationBell />
          </div>
        </div>
      </div>

      {/* Verification banner */}
      {verifStatus === 'none' && user?.role !== 'admin' && (
        <NavLink to="/verify"
          className="mx-3 mt-3 p-3 rounded-xl border border-amber-200 dark:border-amber-400/30 bg-amber-50 dark:bg-amber-400/10 hover:bg-amber-100 dark:hover:bg-amber-400/15 transition-all flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-400/20 flex items-center justify-center flex-shrink-0">
            <span className="text-amber-700 dark:text-amber-300 text-xs font-bold">!</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-amber-800 dark:text-amber-200">Verify Account</p>
            <p className="text-[10px] text-amber-700/80 dark:text-amber-400/70 truncate">Unlock all features</p>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400/60 group-hover:translate-x-0.5 transition-transform" />
        </NavLink>
      )}
      {verifStatus === 'approved' && (
        <div className="mx-3 mt-3 p-2.5 rounded-xl border border-emerald-200 dark:border-green-400/30 bg-emerald-50 dark:bg-green-400/10 flex items-center gap-2">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-green-400 flex-shrink-0" />
          <p className="text-[11px] font-bold text-emerald-800 dark:text-green-300">Verified Account</p>
        </div>
      )}
      {verifStatus === 'pending' && (
        <div className="mx-3 mt-3 p-2.5 rounded-xl border border-blue-200 dark:border-blue-400/30 bg-blue-50 dark:bg-blue-400/10 flex items-center gap-2">
          <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300">⏳ Under Review</span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 pt-6 pb-2 scrollbar-hidden">
        {groups.map(g => <NavGroup key={g.label} {...g} />)}
      </nav>

      {/* User card */}
      <div className="p-4 border-t border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md shadow-sm mb-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-slate-200 dark:ring-white/20">
            {user?.avatar
              ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              : <span className="text-slate-900 dark:text-white font-bold text-sm">{user?.name?.[0]?.toUpperCase()}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate tracking-tight">{user?.name}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize font-medium">
              {user?.role}{user?.role === 'admin' && ' 🛡️'}
            </p>
            {typeof user?.points === 'number' && user.points > 0 && (
              <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-0.5">{user.points} pts</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <NavLink to={`/profile/${user?._id}`}
            className="flex items-center justify-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 py-2.5 rounded-xl transition-all font-bold">
            <User className="w-4 h-4" /> Profile
          </NavLink>
          <button onClick={handleLogout}
            className="flex items-center justify-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 py-2.5 rounded-xl transition-all font-bold">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
        <button type="button" onClick={toggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="w-full flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 py-2.5 rounded-xl transition-all font-bold">
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden relative transition-colors duration-300">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 animate-slide-in">
            <button onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-3 z-10 btn-icon text-white hover:bg-white/10">
              <X className="w-4 h-4" />
            </button>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Animated Aurora Background */}
        <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950 -z-20 transition-colors duration-300" />
        <div className="absolute inset-0 bg-dot-pattern opacity-10 -z-20" />
        
        {/* Light Mode Meshes */}
        <div className="dark:hidden">
          <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full opacity-60 blur-[100px] -z-10"
            style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.4) 0%, transparent 60%)' }} />
          <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-50 blur-[100px] -z-10"
            style={{ background: 'radial-gradient(circle, rgba(244,114,182,0.4) 0%, transparent 60%)' }} />
          <motion.div animate={{ scale: [1, 1.1, 1], x: [0, 100, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[40%] left-[30%] w-[500px] h-[500px] rounded-full opacity-50 blur-[120px] -z-10"
            style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.3) 0%, transparent 70%)' }} />
        </div>

        {/* Dark Mode Meshes */}
        <div className="hidden dark:block">
          <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full opacity-30 blur-[100px] -z-10"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.6) 0%, transparent 60%)' }} />
          <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20 blur-[100px] -z-10"
            style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.6) 0%, transparent 60%)' }} />
          <motion.div animate={{ scale: [1, 1.1, 1], x: [0, 100, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[40%] left-[30%] w-[500px] h-[500px] rounded-full opacity-20 blur-[120px] -z-10"
            style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.5) 0%, transparent 70%)' }} />
        </div>

        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white/60 dark:bg-white/5 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 shadow-sm relative z-20">
          <button onClick={() => setMobileOpen(true)} className="btn-icon text-slate-900 dark:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-violet-600 to-fuchsia-600">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-slate-900 dark:text-white tracking-tight">AlumiNet</span>
          </div>
          <div className="ml-auto">
            <NotificationBell />
          </div>
        </div>

        {/* Desktop page bar */}
        <div className="hidden lg:flex items-center justify-between gap-4 px-6 py-3.5 border-b border-slate-200/80 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-xl flex-shrink-0">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {pageMeta.subtitle || 'AlumiNet'}
            </p>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
              {pageMeta.title}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border ${connected ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30' : 'text-slate-500 bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10'}`}>
              {connected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {connected ? 'Connected' : 'Offline'}
            </span>
            <button type="button" onClick={toggleTheme} className="btn-icon text-slate-700 dark:text-slate-200" title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <main className="flex-1 flex flex-col relative z-10 overflow-hidden min-h-0">
          <AnimatePresence mode="wait">
            <AnimatedPage key={location.pathname}>
              <Outlet />
            </AnimatedPage>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
