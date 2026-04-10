import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventApi } from '../../api/services';
import useAuthStore from '../../store/authStore';
import Spinner from '../../components/common/Spinner';
import { Calendar, Users, Clock, Video, ArrowLeft, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  useEffect(() => {
    eventApi.getOne(id)
      .then(r => setEvent(r.data.event))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRSVP = async () => {
    setRsvpLoading(true);
    try {
      const { data } = await eventApi.rsvp(id);
      setEvent(prev => ({
        ...prev,
        attendees: data.attending
          ? [...(prev.attendees || []), { _id: user._id, name: user.name, avatar: user.avatar }]
          : (prev.attendees || []).filter(a => a._id !== user._id)
      }));
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.error || 'RSVP failed');
    } finally { setRsvpLoading(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await eventApi.delete(id);
      toast.success('Event deleted');
      navigate('/events');
    } catch { toast.error('Delete failed'); }
  };

  if (loading) return <Spinner full />;
  if (!event) return <div className="p-6 text-gray-500">Event not found.</div>;

  const isAttending = event.attendees?.some(a => a._id === user?._id || a === user?._id);
  const isHost = event.host?._id === user?._id || event.host === user?._id;
  const isFull = event.attendees?.length >= event.maxAttendees;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link to="/events" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Events
      </Link>

      {event.banner && (
        <img src={event.banner} alt="" className="w-full h-56 object-cover rounded-2xl mb-6" />
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
              {(isHost || user?.role === 'admin') && (
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={handleDelete}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="badge bg-blue-100 text-blue-700 capitalize">{event.type}</span>
              <span className={`badge capitalize ${event.status === 'live' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                {event.status === 'live' ? '● Live Now' : event.status}
              </span>
            </div>
          </div>

          <div className="card p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-primary-500" />
              {format(new Date(event.scheduledAt), 'EEEE, MMMM d yyyy')}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-primary-500" />
              {format(new Date(event.scheduledAt), 'h:mm a')} · {event.duration} minutes
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4 text-primary-500" />
              {event.attendees?.length || 0} / {event.maxAttendees} registered
            </div>
            {event.meetLink && isAttending && (
              <a href={event.meetLink} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-sm text-primary-600 font-medium hover:underline">
                <Video className="w-4 h-4" /> Join Meeting Link
              </a>
            )}
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-3">About this event</h2>
            <p className="text-gray-600 whitespace-pre-wrap text-sm leading-relaxed">{event.description}</p>
          </div>

          {event.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {event.tags.map(tag => (
                <span key={tag} className="badge bg-gray-100 text-gray-600">#{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* RSVP card */}
          <div className="card p-5">
            <div className="text-center mb-4">
              <p className="text-2xl font-bold text-gray-900">{event.attendees?.length || 0}</p>
              <p className="text-sm text-gray-500">of {event.maxAttendees} spots taken</p>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                <div className="bg-primary-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, ((event.attendees?.length || 0) / event.maxAttendees) * 100)}%` }} />
              </div>
            </div>
            {event.status !== 'cancelled' && event.status !== 'completed' && (
              <button onClick={handleRSVP} disabled={rsvpLoading || (isFull && !isAttending)}
                className={`w-full font-medium py-2.5 rounded-xl transition-all ${
                  isAttending ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                  : isFull ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'btn-primary'}`}>
                {rsvpLoading ? 'Processing…' : isAttending ? 'Cancel RSVP' : isFull ? 'Event Full' : 'Register Now'}
              </button>
            )}
          </div>

          {/* Host */}
          {event.host && (
            <div className="card p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Hosted by</p>
              <Link to={`/profile/${event.host._id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                  {event.host.avatar
                    ? <img src={event.host.avatar} alt="" className="w-full h-full object-cover" />
                    : <span className="text-primary-700 font-bold">{event.host.name?.[0]}</span>}
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">{event.host.name}</p>
                  <p className="text-xs text-gray-400">{event.host.currentRole}</p>
                </div>
              </Link>
            </div>
          )}

          {/* Attendees preview */}
          {event.attendees?.length > 0 && (
            <div className="card p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Attendees</p>
              <div className="flex flex-wrap gap-1.5">
                {event.attendees.slice(0,12).map((a, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden" title={a.name}>
                    {a.avatar
                      ? <img src={a.avatar} alt="" className="w-full h-full object-cover" />
                      : <span className="text-primary-700 text-xs font-bold">{a.name?.[0]}</span>}
                  </div>
                ))}
                {event.attendees.length > 12 && (
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                    +{event.attendees.length - 12}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
