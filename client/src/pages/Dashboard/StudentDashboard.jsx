import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { mentorApi, eventApi, forumApi } from '../../api/services';
import useAuthStore from '../../store/authStore';
import {
  Users, Calendar, MessageSquare, BookOpen, ArrowRight,
  Briefcase, ChevronRight, TrendingUp, Sparkles, Filter, ChevronDown
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import StatCard from '../../components/common/StatCard';
import { format } from 'date-fns';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

// Engagement Trend Data (Recharts Area Chart)
const engagementData = [
  { date: 'Oct 15', users: 180, sessions: 45, matches: 60 },
  { date: 'Oct 18', users: 260, sessions: 70, matches: 90 },
  { date: 'Oct 21', users: 210, sessions: 60, matches: 75 },
  { date: 'Oct 24', users: 380, sessions: 110, matches: 140 },
  { date: 'Oct 27', users: 490, sessions: 145, matches: 190 },
  { date: 'Oct 30', users: 430, sessions: 120, matches: 160 },
  { date: 'Nov 2',  users: 560, sessions: 170, matches: 210 },
  { date: 'Nov 5',  users: 510, sessions: 155, matches: 200 },
  { date: 'Nov 8',  users: 680, sessions: 210, matches: 260 },
  { date: 'Nov 11', users: 820, sessions: 286, matches: 310 },
];

// Donut chart status data
const statusPieData = [
  { name: 'Completed', value: 45, color: '#2563EB' },
  { name: 'Ongoing',   value: 35, color: '#06B6D4' },
  { name: 'Pending',   value: 12, color: '#38BDF8' },
  { name: 'Declined',  value: 8,  color: '#94A3B8' },
];

// Top domains progress bars
const topDomains = [
  { name: 'Software Development', pct: 32, color: 'bg-blue-600' },
  { name: 'Data Science / AI',    pct: 24, color: 'bg-indigo-600' },
  { name: 'Cloud & DevOps',       pct: 16, color: 'bg-cyan-500' },
  { name: 'Product & Management', pct: 14, color: 'bg-amber-500' },
  { name: 'Others',               pct: 14, color: 'bg-slate-400' },
];

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [matches, setMatches] = useState([]);
  const [events, setEvents] = useState([]);
  const [posts, setPosts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartMetric, setChartMetric] = useState('users');

  useEffect(() => {
    Promise.all([
      mentorApi.getMatches().then(r => setMatches(r.data.matches || [])).catch(() => {}),
      eventApi.getAll({ limit: 4 }).then(r => setEvents(r.data.events || [])).catch(() => {}),
      forumApi.getPosts({ limit: 4 }).then(r => setPosts(r.data.posts || [])).catch(() => {}),
      mentorApi.getSessions().then(r => setSessions(r.data.sessions || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const totalMatchesCount = matches.length > 0 ? (matches.length >= 10 ? 286 : matches.length * 28) : 286;

  // Prepare table data from actual matches or fallback demo items
  const tableMatches = matches.length > 0 ? matches.slice(0, 4) : [
    {
      mentor: { _id: '1', name: 'Rahul Mehta', currentRole: 'Senior Software Engineer', currentCompany: 'Google', skills: ['Python', 'System Design'] },
      matchScore: 92,
      status: 'Ongoing'
    },
    {
      mentor: { _id: '2', name: 'Ananya Singh', currentRole: 'Data Scientist', currentCompany: 'Microsoft', skills: ['Machine Learning', 'AI'] },
      matchScore: 88,
      status: 'Completed'
    },
    {
      mentor: { _id: '3', name: 'Vikas Kulkarni', currentRole: 'SDE II', currentCompany: 'Amazon', skills: ['Backend', 'Go'] },
      matchScore: 81,
      status: 'Ongoing'
    },
    {
      mentor: { _id: '4', name: 'Pooja Desai', currentRole: 'Cloud Engineer', currentCompany: 'AWS', skills: ['Cloud', 'Kubernetes'] },
      matchScore: 75,
      status: 'Pending'
    }
  ];

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">

      {/* ── 1. Hero Greeting Banner (With Campus Architectural Backdrop) ── */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden p-6 sm:p-8 flex items-center justify-between min-h-[130px]">
        {/* Blended Campus Graphic */}
        <div className="absolute right-0 top-0 bottom-0 w-full sm:w-1/2 overflow-hidden pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=900&auto=format&fit=crop"
            alt="University Campus"
            className="w-full h-full object-cover object-right opacity-35 dark:opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-slate-900 dark:via-slate-900/80" />
        </div>

        {/* Left Text */}
        <div className="relative z-10 max-w-xl">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {getGreeting()},{' '}
            <span className="text-blue-600 dark:text-blue-400">
              {user?.name?.split(' ')[0] || 'Student'}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Connect, learn and grow with your alumni network.
          </p>
        </div>

        {/* Right Date Filter Pill */}
        <div className="relative z-10 hidden sm:flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Last 30 Days</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      {/* ── 2. Top 4 KPI Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          icon={Users}
          value="1,248"
          label="Alumni on Platform"
          color="blue"
          trend={12}
        />
        <StatCard
          icon={BookOpen}
          value="286"
          label="Active Mentorships"
          color="indigo"
          trend={18}
        />
        <StatCard
          icon={Calendar}
          value={events.length > 0 ? events.length : 17}
          label="Events"
          color="cyan"
          trend={6}
        />
        <StatCard
          icon={Briefcase}
          value="94"
          label="Job & Internship Posts"
          color="amber"
          trend={22}
        />
      </div>

      {/* ── 3. Data & Analytics Row (3 Columns) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Card 1: Platform Engagement (Area Chart) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                Platform Engagement
              </h2>
              <p className="text-[11px] text-slate-400">User activity over time</p>
            </div>
            {/* Filter Toggle Pills */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-semibold">
              {['users', 'sessions', 'matches'].map(m => (
                <button
                  key={m}
                  onClick={() => setChartMetric(m)}
                  className={`px-2.5 py-1 rounded-md capitalize transition-all ${
                    chartMetric === m
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={engagementData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B132B', borderColor: '#1E293B', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey={chartMetric} stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#engagementGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: Mentor Match Status (Donut Chart) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 flex flex-col justify-between">
          <div className="mb-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Mentor Match Status
            </h2>
          </div>

          <div className="flex items-center justify-between gap-2 my-auto">
            {/* Donut Chart with Center Metric */}
            <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusPieData} dataKey="value" innerRadius={36} outerRadius={50} paddingAngle={2}>
                    {statusPieData.map(entry => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                  {totalMatchesCount}
                </span>
                <span className="text-[9px] text-slate-400 uppercase font-semibold">Matches</span>
              </div>
            </div>

            {/* Legend with percentages */}
            <div className="space-y-1.5 flex-1 pl-2">
              {statusPieData.map(item => (
                <div key={item.name} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: Top Domains (Mentorship Progress Bars) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 flex flex-col justify-between">
          <div className="mb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Top Domains <span className="text-slate-400 font-normal text-xs">(Mentorship)</span>
            </h2>
          </div>

          <div className="space-y-2.5 my-auto">
            {topDomains.map(d => (
              <div key={d.name}>
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <span className="truncate pr-2">{d.name}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{d.pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── 4. Bottom Content Row: Recent Matches Table & Upcoming Events ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Left (8 Cols): Recent Mentor Matches Data Table */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Recent Mentor Matches
            </h2>
            <Link to="/mentors" className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 inline-flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[11px] font-semibold">
                  <th className="pb-2.5 font-medium">Alumni</th>
                  <th className="pb-2.5 font-medium">Role & Company</th>
                  <th className="pb-2.5 font-medium">Domain</th>
                  <th className="pb-2.5 font-medium">Match</th>
                  <th className="pb-2.5 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {tableMatches.map((m, idx) => {
                  const mentor = m.mentor || {};
                  const initials = mentor.name ? mentor.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'AL';
                  const domain = mentor.skills?.[0] || 'Engineering';
                  const status = m.status || (idx % 2 === 0 ? 'Ongoing' : 'Completed');
                  const score = m.matchScore || (idx === 0 ? 92 : idx === 1 ? 88 : idx === 2 ? 81 : 75);

                  return (
                    <tr key={mentor._id || idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Alumni */}
                      <td className="py-3">
                        <Link to={`/profile/${mentor._id}`} className="flex items-center gap-2.5 group">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                            {initials}
                          </div>
                          <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition-colors">
                            {mentor.name}
                          </span>
                        </Link>
                      </td>

                      {/* Role & Company */}
                      <td className="py-3 text-slate-500 dark:text-slate-400">
                        {mentor.currentRole || 'Software Engineer'} {mentor.currentCompany ? `· ${mentor.currentCompany}` : ''}
                      </td>

                      {/* Domain Pill */}
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 border border-blue-200/50 dark:border-blue-500/20">
                          {domain}
                        </span>
                      </td>

                      {/* Match */}
                      <td className="py-3 font-bold text-slate-900 dark:text-white">
                        {score}%
                      </td>

                      {/* Status */}
                      <td className="py-3 text-right">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                            : status === 'Ongoing'
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                            : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                        }`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right (4 Cols): Upcoming Events */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Upcoming Events
            </h2>
            <Link to="/events" className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 inline-flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3 my-auto">
            {(events.length > 0 ? events.slice(0, 3) : [
              { _id: '1', title: 'Alumni Talk: Career in AI', location: 'Online', scheduledAt: '2026-11-16T18:00:00' },
              { _id: '2', title: 'Resume Review Workshop', location: 'Campus Aud', scheduledAt: '2026-11-22T11:00:00' },
              { _id: '3', title: 'Alumni Networking Meet', location: 'Auditorium', scheduledAt: '2026-12-02T16:00:00' },
            ]).map(ev => {
              const evDate = new Date(ev.scheduledAt || Date.now());
              const month = format(evDate, 'MMM');
              const day = format(evDate, 'd');
              const time = format(evDate, 'h:mm a');

              return (
                <Link
                  key={ev._id}
                  to={`/events/${ev._id}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
                >
                  {/* Date Badge */}
                  <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex flex-col items-center justify-center flex-shrink-0 font-bold border border-blue-100 dark:border-blue-500/20">
                    <span className="text-[9px] uppercase tracking-wider leading-none text-blue-500 font-semibold">{month}</span>
                    <span className="text-sm font-extrabold leading-none mt-0.5">{day}</span>
                  </div>

                  {/* Title & Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 transition-colors">
                      {ev.title}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {ev.location || 'Online'} · {time}
                    </p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
