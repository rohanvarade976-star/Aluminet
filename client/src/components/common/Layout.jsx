import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import AnimatedPage from './AnimatedPage';
import {
  GraduationCap, LayoutDashboard, Users, Calendar, MessageSquare,
  BookOpen, LogOut, User, Shield, Briefcase, CheckCircle,
  BookMarked, Trophy, ChevronRight, ChevronDown, Bell, Menu, X,
  Sparkles, Zap, Moon, Sun, Target, Search
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
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/mentors',   icon: Users,           label: 'Find Alumni' },
      { to: '/sessions',  icon: BookOpen,        label: 'My Sessions' },
    ]},
    { label: 'Community', items: [
      { to: '/jobs',         icon: Briefcase,     label: 'Jobs & Internships' },
      { to: '/events',       icon: Calendar,      label: 'Events' },
      { to: '/forum',        icon: MessageSquare, label: 'Discussion Forum' },
      { to: '/chat',         icon: Zap,           label: 'Live Chat' },
      { to: '/study-groups', icon: BookMarked,    label: 'Study Groups' },
    ]},
    { label: 'AI Tools', items: [
      { to: '/skill-gap',      icon: Target,       label: 'Skill Gap' },
      { to: '/interview-prep', icon: MessageSquare, label: 'Interview Prep' },
      { to: '/ai-jobs',        icon: Sparkles,     label: 'AI Job Match' },
    ]},
    { label: 'Account', items: [
      { to: '/achievements', icon: Trophy,      label: 'Achievements' },
      { to: '/verify',       icon: CheckCircle, label: 'Get Verified' },
    ]},
  ],
  alumni: [
    { label: 'Overview', items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/sessions',  icon: BookOpen,        label: 'My Sessions' },
    ]},
    { label: 'Community', items: [
      { to: '/jobs',         icon: Briefcase,     label: 'Post Jobs' },
      { to: '/events',       icon: Calendar,      label: 'Events' },
      { to: '/forum',        icon: MessageSquare, label: 'Discussion Forum' },
      { to: '/chat',         icon: Zap,           label: 'Live Chat' },
      { to: '/study-groups', icon: BookMarked,    label: 'Study Groups' },
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

function NavItem({ to, icon: Icon, label }) {
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
          <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
          <span className="flex-1 truncate">{label}</span>
        </>
      )}
    </NavLink>
  );
}

function NavGroup({ label, items }) {
  return (
    <div className="mb-4">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3.5 mb-1.5">{label}</p>
      <div className="space-y-1">
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
    <aside className="w-64 flex flex-col flex-shrink-0 h-full bg-[#0B132B] text-slate-100 border-r border-slate-800/60 relative z-20">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-600 shadow-sm text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-white text-lg leading-none tracking-tight">AlumiNet</h1>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">{connected ? 'Live' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Verification banner */}
      {verifStatus === 'none' && user?.role !== 'admin' && (
        <NavLink to="/verify"
          className="mx-3 mt-3 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/15 transition-all flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-amber-400 text-xs font-bold">!</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-amber-300">Verify Account</p>
            <p className="text-[10px] text-amber-400/70 truncate">Unlock full network</p>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-amber-400/60 group-hover:translate-x-0.5 transition-transform" />
        </NavLink>
      )}
      {verifStatus === 'approved' && (
        <div className="mx-3 mt-3 p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-2">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <p className="text-[11px] font-bold text-emerald-300">Verified Account</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3.5 pt-5 pb-2 scrollbar-hidden">
        {groups.map(g => <NavGroup key={g.label} {...g} />)}
      </nav>

      {/* Grow your network CTA Card (as in reference UI) */}
      <div className="p-3.5 border-t border-slate-800/80">
        <div className="rounded-2xl bg-gradient-to-br from-blue-950/60 to-slate-900 border border-blue-500/20 p-3.5 text-center mb-3">
          <div className="w-9 h-9 mx-auto mb-2 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <GraduationCap className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-white mb-0.5">Grow your network</p>
          <p className="text-[10px] text-slate-400 mb-2.5">with AlumiNet</p>
          <NavLink
            to="/mentors"
            className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Users className="w-3.5 h-3.5" /> Find Alumni
          </NavLink>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/10 mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center overflow-hidden flex-shrink-0 font-bold text-xs">
            {user?.avatar
              ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              : <span>{user?.name?.[0]?.toUpperCase()}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-400 capitalize">{user?.role}</p>
          </div>
          <button onClick={handleLogout} title="Logout"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden relative">
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

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">

        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm relative z-20">
          <button onClick={() => setMobileOpen(true)} className="btn-icon text-slate-900 dark:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-600 text-white">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white tracking-tight">AlumiNet</span>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button type="button" onClick={toggleTheme} className="btn-icon text-slate-700 dark:text-slate-200">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Desktop Header / Topbar (Matching the Reference UI) */}
        <div className="hidden lg:flex items-center justify-between gap-4 px-8 py-3.5 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0 shadow-sm">
          {/* Search Bar */}
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search alumni, jobs, events, discussions..."
              className="w-full pl-9 pr-14 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  navigate(`/mentors?q=${encodeURIComponent(e.target.value.trim())}`);
                }
              }}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 bg-slate-200/70 dark:bg-slate-700 px-1.5 py-0.5 rounded">
              Ctrl K
            </span>
          </div>

          {/* Right Header Items: Notifications & User profile pill */}
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button
              type="button"
              onClick={toggleTheme}
              className="btn-icon text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Profile Pill */}
            <NavLink
              to={`/profile/${user?._id}`}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 transition-all group"
            >
              <div className="w-7 h-7 rounded-full bg-[#0B132B] text-white flex items-center justify-center font-bold text-xs ring-1 ring-slate-300 dark:ring-slate-700 overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.slice(0, 2)?.toUpperCase() || 'AL'
                )}
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition-colors">
                {user?.name || 'User'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </NavLink>
          </div>
        </div>

        <main className="flex-1 flex flex-col relative z-10 overflow-y-auto min-h-0 bg-[#F8FAFC] dark:bg-slate-950">
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
