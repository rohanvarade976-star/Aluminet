import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { userApi, mentorApi } from '../../api/services';
import useAuthStore from '../../store/authStore';
import Spinner from '../../components/common/Spinner';
import { MapPin, Briefcase, GraduationCap, ExternalLink, Edit, BookOpen, Github, Linkedin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ViewProfile() {
  const { id } = useParams();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    userApi.getProfile(id).then(r => setProfile(r.data.user)).finally(() => setLoading(false));
  }, [id]);

  const handleQuickBook = async () => {
    const scheduledAt = new Date(Date.now() + 24*60*60*1000).toISOString();
    setBooking(true);
    try {
      await mentorApi.bookSession({ mentorId: id, title: 'Quick mentorship session', scheduledAt, duration: 60 });
      toast.success('Session request sent!');
    } catch (err) { toast.error(err.response?.data?.error || 'Booking failed'); }
    finally { setBooking(false); }
  };

  if (loading) return <Spinner full />;
  if (!profile) return <div className="p-6 text-gray-500">User not found.</div>;

  const isOwnProfile = currentUser?._id === id;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="card overflow-hidden mb-6">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-primary-500 to-indigo-600" />
        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="w-20 h-20 rounded-2xl border-4 border-white bg-primary-100 flex items-center justify-center overflow-hidden shadow-md">
              {profile.avatar
                ? <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                : <span className="text-primary-700 font-bold text-2xl">{profile.name?.[0]}</span>}
            </div>
            <div className="flex gap-2 pb-1">
              {isOwnProfile && (
                <Link to="/profile/edit" className="btn-secondary flex items-center gap-1.5 text-sm">
                  <Edit className="w-3.5 h-3.5" /> Edit Profile
                </Link>
              )}
              {!isOwnProfile && profile.role === 'alumni' && currentUser?.role === 'student' && (
                <button onClick={handleQuickBook} disabled={booking} className="btn-primary text-sm">
                  {booking ? 'Requesting…' : 'Book Session'}
                </button>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{profile.name}</h1>
              <span className={`badge capitalize ${
                profile.role === 'alumni' ? 'bg-green-100 text-green-700'
                : profile.role === 'admin' ? 'bg-red-100 text-red-700'
                : 'bg-blue-100 text-blue-700'}`}>
                {profile.role}
              </span>
              {profile.isVerified && (
                <span className="badge bg-primary-100 text-primary-700">✓ Verified</span>
              )}
            </div>

            {(profile.currentRole || profile.currentCompany) && (
              <p className="flex items-center gap-1.5 text-gray-600 mt-1.5">
                <Briefcase className="w-4 h-4 text-gray-400" />
                {profile.currentRole}{profile.currentCompany && ` at ${profile.currentCompany}`}
              </p>
            )}
            {profile.department && (
              <p className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                <GraduationCap className="w-4 h-4 text-gray-400" />
                {profile.department}{profile.graduationYear && ` · Class of ${profile.graduationYear}`}
              </p>
            )}
            {profile.location && (
              <p className="flex items-center gap-1.5 text-gray-400 text-sm mt-1">
                <MapPin className="w-4 h-4" /> {profile.location}
              </p>
            )}

            {profile.bio && (
              <p className="text-gray-600 text-sm mt-3 leading-relaxed">{profile.bio}</p>
            )}

            {/* Social links */}
            <div className="flex gap-3 mt-4">
              {profile.linkedIn && (
                <a href={profile.linkedIn} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                  <Linkedin className="w-4 h-4" /> LinkedIn
                </a>
              )}
              {profile.github && (
                <a href={profile.github} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 text-sm text-gray-700 hover:underline">
                  <Github className="w-4 h-4" /> GitHub
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      {profile.skills?.length > 0 && (
        <div className="card p-5 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map(skill => (
              <span key={skill} className="badge bg-primary-50 text-primary-700 px-3 py-1">{skill}</span>
            ))}
          </div>
        </div>
      )}

      {/* Interests */}
      {profile.interests?.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Interests</h2>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map(interest => (
              <span key={interest} className="badge bg-gray-100 text-gray-600 px-3 py-1">{interest}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
