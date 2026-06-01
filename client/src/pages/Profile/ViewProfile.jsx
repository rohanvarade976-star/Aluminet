import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { userApi, mentorApi } from '../../api/services';
import useAuthStore from '../../store/authStore';
import Spinner from '../../components/common/Spinner';
import { MapPin, Briefcase, GraduationCap, Edit, Github, Linkedin, CalendarDays, Award, X, Calendar, Clock, MessageSquare } from 'lucide-react';

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

export default function ViewProfile() {
  const { id } = useParams();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingMentor, setBookingMentor] = useState(null);
  const navigate = useNavigate();

  const handleMessage = () => {
    const ids = [currentUser._id, profile._id].sort();
    const roomId = `${ids[0]}_${ids[1]}`;
    navigate(`/chat/${roomId}`);
  };

  useEffect(() => {
    userApi.getProfile(id).then(r => setProfile(r.data.user)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner full />;
  if (!profile) return <div className="page-container text-center text-slate-500">User not found.</div>;

  const isOwnProfile = currentUser?._id === id;

  return (
    <div className="page-container animate-fade-in max-w-5xl">
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* ── Left Column: Main Profile Info ── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card overflow-hidden">
            {/* Banner */}
            <div className="h-36 relative" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
              <div className="absolute inset-0 bg-dot-pattern opacity-20" />
            </div>
            
            <div className="px-6 pb-6 relative z-10">
              {/* Avatar & Actions */}
              <div className="flex items-end justify-between -mt-12 mb-5">
                <div className="w-24 h-24 rounded-2xl border-4 border-white dark:border-slate-800 bg-gradient-to-br from-primary-100 to-violet-100 flex items-center justify-center overflow-hidden shadow-lg ring-4 ring-primary-500/10">
                  {profile.avatar
                    ? <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                    : <span className="text-primary-700 font-bold text-3xl">{profile.name?.[0]}</span>}
                </div>
                <div className="flex gap-2 pb-2">
                  {isOwnProfile && (
                    <Link to="/profile/edit" className="btn-secondary text-xs px-4 py-2">
                      <Edit className="w-3.5 h-3.5" /> Edit Profile
                    </Link>
                  )}
                  {!isOwnProfile && profile.role === 'alumni' && currentUser?.role === 'student' && (
                    <button onClick={() => setBookingMentor(profile)} className="btn-primary text-xs px-4 py-2 shadow-primary">
                      Book Session
                    </button>
                  )}
                  {!isOwnProfile && (
                    <button onClick={handleMessage} className="btn-secondary text-xs px-4 py-2 shadow-sm">
                      <MessageSquare className="w-3.5 h-3.5" /> Message
                    </button>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{profile.name}</h1>
                  <span className={`badge capitalize text-[11px] py-0.5 ${
                    profile.role === 'alumni' ? 'badge-success'
                    : profile.role === 'admin' ? 'badge-danger'
                    : 'badge-primary'}`}>
                    {profile.role}
                  </span>
                  {profile.isVerified && (
                    <span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-[11px] py-0.5 ring-1 ring-primary-200">✓ Verified</span>
                  )}
                </div>

                <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {(profile.currentRole || profile.currentCompany) && (
                    <p className="flex items-center gap-2 font-medium">
                      <Briefcase className="w-4 h-4 text-primary-500" />
                      {profile.currentRole}{profile.currentCompany && ` @ ${profile.currentCompany}`}
                    </p>
                  )}
                  {profile.department && (
                    <p className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-violet-500" />
                      {profile.department}{profile.graduationYear && ` · Class of ${profile.graduationYear}`}
                    </p>
                  )}
                  {profile.location && (
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" /> {profile.location}
                    </p>
                  )}
                </div>

                {profile.bio && (
                  <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{profile.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Socials & Basic Info */}
          <div className="grid grid-cols-2 gap-4">
             {profile.linkedIn && (
              <a href={profile.linkedIn} target="_blank" rel="noreferrer" className="card-hover p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <Linkedin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">LinkedIn</p>
                  <p className="text-xs text-slate-500">View profile</p>
                </div>
              </a>
            )}
            {profile.github && (
              <a href={profile.github} target="_blank" rel="noreferrer" className="card-hover p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <Github className="w-5 h-5 text-slate-700 dark:text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">GitHub</p>
                  <p className="text-xs text-slate-500">View projects</p>
                </div>
              </a>
            )}
          </div>
        </div>

        {/* ── Right Column: Stats & Charts ── */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Points Card */}
          <div className="card-glass relative overflow-hidden p-6 text-center"
               style={{ background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(124, 58, 237, 0.1))' }}>
            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm ring-4 ring-primary-500/20">
              <Award className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white">{profile.points || 0}</h3>
            <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mt-1">Total Points</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">Active community member</p>
          </div>

          {profile.skills?.length > 0 && (
            <div className="card p-5">
              <h2 className="font-bold text-slate-800 dark:text-white mb-4">Skills</h2>
              <div className="space-y-2">
                {profile.skills.slice(0, 8).map((skill, i) => (
                  <div key={skill} className="flex items-center gap-3">
                    <span className="text-sm text-slate-600 dark:text-slate-300 w-28 truncate flex-shrink-0">{skill}</span>
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                        style={{ width: `${70 + (i * 7) % 30}%`, transition: 'width 0.8s ease' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-3">Self-reported skills</p>
            </div>
          )}

          {/* Tags */}
          {profile.skills?.length > 0 && (
            <div className="card p-5">
              <h2 className="font-bold text-slate-800 dark:text-white mb-3">Core Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map(skill => (
                  <span key={skill} className="badge-primary text-xs">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {profile.interests?.length > 0 && (
            <div className="card p-5">
              <h2 className="font-bold text-slate-800 dark:text-white mb-3">Interests</h2>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map(interest => (
                  <span key={interest} className="badge-gray text-xs">{interest}</span>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
      {bookingMentor && <BookModal mentor={bookingMentor} onClose={() => setBookingMentor(null)} />}
    </div>
  );
}
