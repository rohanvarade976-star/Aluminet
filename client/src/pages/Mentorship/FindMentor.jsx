import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { mentorApi } from '../../api/services';
import Spinner from '../../components/common/Spinner';
import { Star, Search, Sparkles, MapPin, Briefcase, BookOpen, X, Calendar, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

function MentorCard({ mentor, matchScore, commonSkills, onBook }) {
  return (
    <div className="card p-5 hover:shadow-card-hover hover:border-slate-200 transition-all duration-200">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-primary-100">
          {mentor.avatar
            ? <img src={mentor.avatar} alt="" className="w-full h-full object-cover" />
            : <span className="text-primary-700 font-bold text-xl">{mentor.name?.[0]}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link to={`/profile/${mentor._id}`} className="font-bold text-slate-900 hover:text-primary-600 transition-colors">{mentor.name}</Link>
              {matchScore && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-bold text-amber-600">{matchScore}% match</span>
                </div>
              )}
            </div>
          </div>
          {(mentor.currentRole || mentor.currentCompany) && (
            <p className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
              <Briefcase className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{mentor.currentRole}{mentor.currentCompany && ` @ ${mentor.currentCompany}`}</span>
            </p>
          )}
          {mentor.location && (
            <p className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
              <MapPin className="w-3 h-3" /> {mentor.location}
            </p>
          )}
          {mentor.bio && <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">{mentor.bio}</p>}
          {mentor.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {mentor.skills.slice(0,5).map(s => (
                <span key={s} className={`badge text-xs ${commonSkills?.includes(s) ? 'badge-primary' : 'badge-gray'}`}>{s}</span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50">
        <Link to={`/profile/${mentor._id}`} className="btn-secondary flex-1 text-sm">View Profile</Link>
        <button onClick={() => onBook(mentor)} className="btn-primary flex-1 text-sm">Book Session</button>
      </div>
    </div>
  );
}

function BookModal({ mentor, onClose }) {
  const [form, setForm] = useState({ title: '', description: '', scheduledAt: '', duration: 60 });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await mentorApi.bookSession({ mentorId: mentor._id, ...form });
      toast.success('Session booked! Mentor will confirm shortly.');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Book a Session</h2>
            <p className="text-sm text-slate-500">with {mentor.name} · {mentor.currentRole}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Session Title</label>
            <input required className="input" placeholder="e.g. Career guidance for ML roles"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="label">What do you want to discuss?</label>
            <textarea className="input resize-none" rows={3} placeholder="Describe topics you'd like to cover..."
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Date & Time</label>
              <input required type="datetime-local" className="input"
                min={new Date().toISOString().slice(0,16)}
                value={form.scheduledAt} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} />
            </div>
            <div>
              <label className="label flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Duration</label>
              <select className="input" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))}>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Booking…' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FindMentor() {
  const [tab, setTab] = useState('ai');
  const [matches, setMatches] = useState([]);
  const [allMentors, setAllMentors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingMentor, setBookingMentor] = useState(null);

  useEffect(() => {
    Promise.all([
      mentorApi.getMatches().then(r => setMatches(r.data.matches || [])).catch(() => {}),
      mentorApi.getAll().then(r => setAllMentors(r.data.mentors || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const filtered = allMentors.filter(m =>
    !search ||
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.skills?.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
    m.currentRole?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner full />;

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Find a Mentor</h1>
        <p className="page-subtitle">Connect with experienced alumni who can guide your career</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        <button onClick={() => setTab('ai')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === 'ai' ? 'bg-white shadow-card text-primary-700' : 'text-slate-500 hover:text-slate-700'}`}>
          <Sparkles className="w-4 h-4" /> AI Matches {matches.length > 0 && `(${matches.length})`}
        </button>
        <button onClick={() => setTab('all')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === 'all' ? 'bg-white shadow-card text-primary-700' : 'text-slate-500 hover:text-slate-700'}`}>
          <BookOpen className="w-4 h-4" /> All Mentors ({allMentors.length})
        </button>
      </div>

      {tab === 'all' && (
        <div className="relative mb-5 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="input pl-10" placeholder="Search by name, skill, or role…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      )}

      {tab === 'ai' ? (
        matches.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-primary-400" />
            </div>
            <h3 className="font-bold text-slate-700 mb-2">No AI matches yet</h3>
            <p className="text-slate-400 text-sm">Add skills and interests to your profile to get matched with the perfect mentors</p>
            <Link to="/profile/edit" className="btn-primary mt-5">Update My Profile</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map(({ mentor, matchScore, commonSkills }) => (
              <MentorCard key={mentor._id} mentor={mentor} matchScore={matchScore} commonSkills={commonSkills} onBook={setBookingMentor} />
            ))}
          </div>
        )
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(mentor => (
            <MentorCard key={mentor._id} mentor={mentor} onBook={setBookingMentor} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-400">
              <Search className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p>No mentors found for "{search}"</p>
            </div>
          )}
        </div>
      )}

      {bookingMentor && <BookModal mentor={bookingMentor} onClose={() => setBookingMentor(null)} />}
    </div>
  );
}
