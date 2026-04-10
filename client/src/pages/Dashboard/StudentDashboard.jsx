import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { mentorApi, eventApi, forumApi } from '../../api/services';
import useAuthStore from '../../store/authStore';
import { Users, Calendar, MessageSquare, BookOpen, ArrowRight, Star, Sparkles, TrendingUp, Clock } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import Spinner from '../../components/common/Spinner';
import { format } from 'date-fns';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [matches, setMatches] = useState([]);
  const [events, setEvents] = useState([]);
  const [posts, setPosts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      mentorApi.getMatches().then(r => setMatches(r.data.matches?.slice(0,3) || [])).catch(()=>{}),
      eventApi.getAll({ limit: 3 }).then(r => setEvents(r.data.events || [])).catch(()=>{}),
      forumApi.getPosts({ limit: 4 }).then(r => setPosts(r.data.posts || [])).catch(()=>{}),
      mentorApi.getSessions().then(r => setSessions(r.data.sessions || [])).catch(()=>{}),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner full />;

  const upcoming = sessions.filter(s => s.status === 'confirmed' && new Date(s.scheduledAt) > new Date());

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-900">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 mt-1">Here's what's happening in your network today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatCard icon={Users}         label="AI Matches"   value={matches.length}   color="primary" />
        <StatCard icon={BookOpen}      label="Sessions"     value={sessions.length}  color="green" />
        <StatCard icon={Calendar}      label="Events"       value={events.length}    color="blue" />
        <StatCard icon={MessageSquare} label="Discussions"  value={posts.length}     color="purple" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* AI Mentor Matches */}
        <div className="lg:col-span-2">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-primary-50 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary-600" />
                </div>
                <h2 className="font-semibold text-slate-800">AI Mentor Matches</h2>
              </div>
              <Link to="/mentors" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {matches.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">No matches yet</p>
                <p className="text-slate-400 text-sm mt-1">Add skills to your profile to get AI-matched mentors</p>
                <Link to="/profile/edit" className="btn-primary mt-4 text-sm">Update Profile</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {matches.map(({ mentor, matchScore, commonSkills }) => (
                  <Link key={mentor._id} to={`/profile/${mentor._id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100">
                    <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {mentor.avatar
                        ? <img src={mentor.avatar} alt="" className="w-full h-full object-cover" />
                        : <span className="text-primary-700 font-bold">{mentor.name?.[0]}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm">{mentor.name}</p>
                      <p className="text-xs text-slate-500 truncate">{mentor.currentRole}{mentor.currentCompany && ` @ ${mentor.currentCompany}`}</p>
                      {commonSkills?.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {commonSkills.slice(0,2).map(s => <span key={s} className="badge-primary text-xs">{s}</span>)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 bg-success-50 px-2.5 py-1.5 rounded-full border border-success-500/20">
                      <Star className="w-3 h-3 text-success-600 fill-success-600" />
                      <span className="text-xs font-bold text-success-700">{matchScore}%</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Forum */}
          <div className="card p-5 mt-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                </div>
                <h2 className="font-semibold text-slate-800">Recent Discussions</h2>
              </div>
              <Link to="/forum" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View all</Link>
            </div>
            <div className="space-y-2">
              {posts.map(post => (
                <Link key={post._id} to={`/forum/${post._id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                  <span className={`badge flex-shrink-0 ${
                    post.category==='career' ? 'badge-primary'
                    : post.category==='technical' ? 'bg-purple-50 text-purple-700'
                    : 'badge-gray'}`}>{post.category}</span>
                  <span className="text-sm text-slate-700 flex-1 truncate font-medium">{post.title}</span>
                  <span className="text-xs text-slate-400 flex-shrink-0">{post.replies?.length || 0} replies</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Upcoming Sessions */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-green-600" />
              </div>
              <h2 className="font-semibold text-slate-800">Upcoming Sessions</h2>
            </div>
            {upcoming.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-slate-400">No upcoming sessions</p>
                <Link to="/mentors" className="text-sm text-primary-600 font-medium hover:underline mt-1 inline-block">Book one →</Link>
              </div>
            ) : upcoming.slice(0,3).map(s => (
              <div key={s._id} className="border-l-2 border-primary-400 pl-3 py-1.5 mb-2 last:mb-0">
                <p className="text-sm font-semibold text-slate-800">{s.title}</p>
                <p className="text-xs text-slate-500">with {s.mentor?.name}</p>
                <p className="text-xs text-primary-600 font-medium mt-0.5">{format(new Date(s.scheduledAt), 'MMM d, h:mm a')}</p>
              </div>
            ))}
          </div>

          {/* Events */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <h2 className="font-semibold text-slate-800">Events</h2>
              </div>
              <Link to="/events" className="text-xs text-primary-600 font-medium">All →</Link>
            </div>
            {events.length === 0
              ? <p className="text-sm text-slate-400 text-center py-4">No upcoming events</p>
              : events.map(ev => (
                <Link key={ev._id} to={`/events/${ev._id}`}
                  className="block p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all mb-1 last:mb-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{ev.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="badge-gray capitalize text-xs">{ev.type}</span>
                    <span className="text-xs text-slate-400">{format(new Date(ev.scheduledAt), 'MMM d')}</span>
                  </div>
                </Link>
              ))
            }
          </div>

          {/* Quick Links */}
          <div className="card p-5">
            <h2 className="font-semibold text-slate-800 mb-3">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { to: '/jobs', label: '💼 View Job Recommendations', color: 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-100' },
                { to: '/resume', label: '📄 Analyze My Resume', color: 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-100' },
                { to: '/verify', label: '✅ Get Account Verified', color: 'bg-green-50 hover:bg-green-100 text-green-800 border-green-100' },
              ].map(({ to, label, color }) => (
                <Link key={to} to={to} className={`block px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${color}`}>{label}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
