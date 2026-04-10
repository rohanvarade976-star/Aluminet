import { useEffect, useState } from 'react';
import { mentorApi } from '../../api/services';
import useAuthStore from '../../store/authStore';
import Spinner from '../../components/common/Spinner';
import { format } from 'date-fns';
import { CheckCircle, Clock, XCircle, Video, Star, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS = {
  pending:   { style: 'badge-warning', icon: Clock },
  confirmed: { style: 'badge-success', icon: CheckCircle },
  completed: { style: 'badge-primary', icon: CheckCircle },
  cancelled: { style: 'badge-danger',  icon: XCircle },
};

function RatingModal({ session, onClose, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-scale-in">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Rate this session</h2>
        <p className="text-sm text-slate-500 mb-5">How was your session with {session.mentor?.name}?</p>
        <div className="flex gap-2 mb-5 justify-center">
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={() => setRating(n)} className="transition-transform hover:scale-110">
              <Star className={`w-9 h-9 transition-colors ${n <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
            </button>
          ))}
        </div>
        <textarea className="input resize-none mb-4" rows={3} placeholder="Share your experience (optional)…"
          value={feedback} onChange={e => setFeedback(e.target.value)} />
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Skip</button>
          <button onClick={() => onSubmit(session._id, rating, feedback)} className="btn-primary flex-1">Submit</button>
        </div>
      </div>
    </div>
  );
}

export default function MySessions() {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [ratingSession, setRatingSession] = useState(null);

  useEffect(() => {
    mentorApi.getSessions().then(r => setSessions(r.data.sessions || [])).finally(() => setLoading(false));
  }, []);

  const handleRate = async (id, rating, feedback) => {
    try {
      await mentorApi.updateSession(id, { rating, feedback });
      setSessions(prev => prev.map(s => s._id === id ? { ...s, rating, feedback } : s));
      setRatingSession(null);
      toast.success('Rating submitted!');
    } catch { toast.error('Failed'); }
  };

  const handleMarkComplete = async (id) => {
    try {
      await mentorApi.updateSession(id, { status: 'completed' });
      setSessions(prev => prev.map(s => s._id === id ? { ...s, status: 'completed' } : s));
      toast.success('Session marked as completed');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <Spinner full />;

  const filtered = filter === 'all' ? sessions : sessions.filter(s => s.status === filter);
  const tabs = ['all','pending','confirmed','completed','cancelled'];
  const counts = tabs.reduce((acc, t) => ({ ...acc, [t]: t === 'all' ? sessions.length : sessions.filter(s => s.status === t).length }), {});

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">My Sessions</h1>
        <p className="page-subtitle">Track and manage all your mentorship sessions</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold capitalize transition-all border ${
              filter === s ? 'bg-primary-600 text-white border-primary-600 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
            {s} {counts[s] > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === s ? 'bg-white/20' : 'bg-slate-100'}`}>{counts[s]}</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Clock className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="font-semibold text-slate-400">No {filter === 'all' ? '' : filter} sessions</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(session => {
            const st = STATUS[session.status] || STATUS.pending;
            const other = user.role === 'alumni' ? session.mentee : session.mentor;
            return (
              <div key={session._id} className="card p-5 animate-fade-in">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-primary-100">
                    {other?.avatar
                      ? <img src={other.avatar} alt="" className="w-full h-full object-cover" />
                      : <span className="text-primary-700 font-bold text-base">{other?.name?.[0]}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h3 className="font-bold text-slate-900">{session.title}</h3>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {user.role === 'alumni' ? 'Student:' : 'Mentor:'} {other?.name}
                        </p>
                      </div>
                      <span className={`badge capitalize ${st.style}`}>
                        <st.icon className="w-3 h-3" />{session.status}
                      </span>
                    </div>
                    {session.description && <p className="text-sm text-slate-400 mt-2">{session.description}</p>}
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                      <span>📅 {format(new Date(session.scheduledAt), 'MMM d, yyyy · h:mm a')}</span>
                      <span>⏱ {session.duration} min</span>
                    </div>
                    {session.meetLink && (
                      <a href={session.meetLink} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium hover:underline">
                        <Video className="w-3.5 h-3.5" /> Join Meeting
                      </a>
                    )}
                    {session.rating && (
                      <div className="flex items-center gap-1.5 mt-2">
                        {[1,2,3,4,5].map(n => (
                          <Star key={n} className={`w-4 h-4 ${n <= session.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                        ))}
                        {session.feedback && <span className="text-xs text-slate-400 ml-1 italic">"{session.feedback}"</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action bar */}
                {(session.status === 'confirmed' && user.role === 'alumni') || (session.status === 'completed' && user.role === 'student' && !session.rating) ? (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50">
                    {session.status === 'confirmed' && user.role === 'alumni' && (
                      <button onClick={() => handleMarkComplete(session._id)} className="btn-secondary text-sm">
                        <CheckCircle className="w-3.5 h-3.5" /> Mark Complete
                      </button>
                    )}
                    {session.status === 'completed' && user.role === 'student' && !session.rating && (
                      <button onClick={() => setRatingSession(session)} className="btn-primary text-sm">
                        <Star className="w-3.5 h-3.5" /> Rate Session
                      </button>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {ratingSession && <RatingModal session={ratingSession} onClose={() => setRatingSession(null)} onSubmit={handleRate} />}
    </div>
  );
}
