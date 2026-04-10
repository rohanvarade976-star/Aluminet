import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventApi } from '../../api/services';
import useAuthStore from '../../store/authStore';
import Spinner from '../../components/common/Spinner';
import { Calendar, Clock, Users, Plus, Search, Video, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

const TYPE_STYLES = {
  webinar:    'bg-blue-50 text-blue-700',
  workshop:   'bg-purple-50 text-purple-700',
  talk:       'bg-green-50 text-green-700',
  networking: 'bg-orange-50 text-orange-700',
  other:      'bg-slate-100 text-slate-600',
};

export default function EventList() {
  const { user } = useAuthStore();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    eventApi.getAll({ limit: 20 })
      .then(r => setEvents(r.data.events || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner full />;

  const filtered = filter === 'all' ? events : events.filter(e => e.type === filter);
  const types = ['all','webinar','workshop','talk','networking'];

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-title">Events & Webinars</h1>
          <p className="page-subtitle">Attend sessions hosted by alumni and industry experts</p>
        </div>
        {['alumni','admin'].includes(user?.role) && (
          <Link to="/events/create" className="btn-primary"><Plus className="w-4 h-4" /> Create Event</Link>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold capitalize transition-all border ${
              filter === t ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-14 text-center">
          <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="font-semibold text-slate-400">No events found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(ev => (
            <div key={ev._id} className="card-hover p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`badge capitalize ${TYPE_STYLES[ev.type] || 'badge-gray'}`}>{ev.type}</span>
                    {new Date(ev.scheduledAt) > new Date() && <span className="badge-success">Upcoming</span>}
                  </div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">{ev.title}</h3>
                </div>
              </div>
              <p className="text-sm text-slate-500 line-clamp-2 mb-4">{ev.description}</p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Calendar className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  <span>{format(new Date(ev.scheduledAt), 'MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  <span>{format(new Date(ev.scheduledAt), 'h:mm a')} · {ev.duration} minutes</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Users className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  <span>{ev.attendees?.length || 0} / {ev.maxAttendees} registered</span>
                </div>
              </div>
              {ev.host && (
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {ev.host.avatar
                      ? <img src={ev.host.avatar} alt="" className="w-full h-full object-cover" />
                      : <span className="text-primary-700 font-bold text-xs">{ev.host.name?.[0]}</span>}
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Hosted by</p>
                    <p className="text-sm font-semibold text-slate-700">{ev.host.name}</p>
                  </div>
                </div>
              )}
              <Link to={`/events/${ev._id}`} className="btn-primary w-full text-sm">
                <ExternalLink className="w-4 h-4" /> View Details & RSVP
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
