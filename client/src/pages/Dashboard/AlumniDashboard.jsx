import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { mentorApi, eventApi } from '../../api/services';
import useAuthStore from '../../store/authStore';
import StatCard from '../../components/common/StatCard';
import Spinner from '../../components/common/Spinner';
import { BookOpen, Calendar, CheckCircle, Clock, Plus, Users, Star } from 'lucide-react';
import { format } from 'date-fns';

export default function AlumniDashboard() {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      mentorApi.getSessions().then(r => setSessions(r.data.sessions || [])).catch(() => {}),
      eventApi.getAll({ limit: 5 }).then(r => setEvents(r.data.events || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner full />;

  const pending   = sessions.filter(s => s.status === 'pending');
  const confirmed = sessions.filter(s => s.status === 'confirmed');
  const completed = sessions.filter(s => s.status === 'completed');
  const avgRating = completed.filter(s => s.rating).reduce((a, b, _, arr) => a + b.rating / arr.length, 0);

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 mt-1">Manage your mentorship sessions and make an impact.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatCard icon={Clock}       label="Pending"   value={pending.length}   color="amber" />
        <StatCard icon={BookOpen}    label="Confirmed" value={confirmed.length} color="blue" />
        <StatCard icon={CheckCircle} label="Completed" value={completed.length} color="green" />
        <StatCard icon={Star}        label="Avg Rating" value={avgRating ? avgRating.toFixed(1) : '—'} color="purple" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        {/* Pending requests */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="section-title mb-0">Pending Requests</h2>
            {pending.length > 0 && (
              <span className="badge bg-amber-100 text-amber-700 ml-auto">{pending.length} new</span>
            )}
          </div>
          {pending.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No pending requests</p>
            </div>
          ) : pending.map(s => (
            <div key={s._id} className="flex items-start gap-3 p-3.5 rounded-xl border border-amber-100 bg-amber-50/50 mb-3 last:mb-0">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                {s.mentee?.avatar
                  ? <img src={s.mentee.avatar} alt="" className="w-full h-full object-cover" />
                  : <span className="text-primary-700 font-bold text-sm">{s.mentee?.name?.[0]}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{s.mentee?.name}</p>
                <p className="text-xs text-slate-600 mt-0.5 truncate">{s.title}</p>
                <p className="text-xs text-primary-600 font-medium mt-0.5">{format(new Date(s.scheduledAt), 'MMM d, h:mm a')}</p>
              </div>
              <div className="flex gap-1.5">
                <button onClick={async () => {
                  await mentorApi.updateSession(s._id, { status: 'confirmed' });
                  setSessions(prev => prev.map(x => x._id === s._id ? { ...x, status: 'confirmed' } : x));
                }} className="text-xs bg-success-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-success-700 font-medium transition-all">Accept</button>
                <button onClick={async () => {
                  await mentorApi.updateSession(s._id, { status: 'cancelled' });
                  setSessions(prev => prev.map(x => x._id === s._id ? { ...x, status: 'cancelled' } : x));
                }} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-200 font-medium transition-all">Decline</button>
              </div>
            </div>
          ))}
        </div>

        {/* Confirmed sessions */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-success-600" />
            </div>
            <h2 className="section-title mb-0">Upcoming Sessions</h2>
          </div>
          {confirmed.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No confirmed sessions yet</p>
            </div>
          ) : confirmed.map(s => (
            <div key={s._id} className="flex items-center gap-3 p-3.5 rounded-xl bg-success-50 border border-success-100 mb-3 last:mb-0">
              <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{s.title}</p>
                <p className="text-xs text-slate-500">with {s.mentee?.name} · {format(new Date(s.scheduledAt), 'MMM d, h:mm a')}</p>
              </div>
              {s.meetLink && (
                <a href={s.meetLink} target="_blank" rel="noreferrer"
                  className="text-xs bg-primary-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-primary-700 font-medium transition-all flex-shrink-0">
                  Join
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Create event CTA */}
      <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-primary-600 to-indigo-600 p-6 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div className="text-white">
            <h3 className="text-xl font-bold mb-1">Share your expertise 🎤</h3>
            <p className="text-primary-100 text-sm">Host a webinar, workshop or talk for students on AlumiNet</p>
          </div>
          <Link to="/events/create"
            className="flex-shrink-0 flex items-center gap-2 bg-white text-primary-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-50 transition-all shadow-sm text-sm">
            <Plus className="w-4 h-4" /> Create Event
          </Link>
        </div>
      </div>
    </div>
  );
}
