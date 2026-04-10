import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { eventApi } from '../../api/services';
import { ArrowLeft, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', type: 'webinar',
    scheduledAt: '', duration: 60, maxAttendees: 100,
    meetLink: '', tags: '', isPublished: true
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
      const { data } = await eventApi.create(payload);
      toast.success('Event created!');
      navigate(`/events/${data.event._id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create event');
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link to="/events" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Events
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Event</h1>
        <p className="text-gray-500 mt-1">Host a webinar, talk, or workshop for students</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
          <input required className="input" placeholder="e.g. Breaking into FAANG — A Realistic Guide"
            value={form.title} onChange={e => set('title', e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea required className="input resize-none" rows={4}
            placeholder="Describe what attendees will learn, agenda, prerequisites…"
            value={form.description} onChange={e => set('description', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
            <select className="input" value={form.type} onChange={e => set('type', e.target.value)}>
              {['webinar','talk','workshop','networking','other'].map(t => (
                <option key={t} value={t} className="capitalize">{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
            <select className="input" value={form.duration} onChange={e => set('duration', Number(e.target.value))}>
              {[30,45,60,90,120].map(d => <option key={d} value={d}>{d} min</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time *</label>
            <input required type="datetime-local" className="input"
              min={new Date().toISOString().slice(0,16)}
              value={form.scheduledAt} onChange={e => set('scheduledAt', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Attendees</label>
            <input type="number" min={1} max={1000} className="input"
              value={form.maxAttendees} onChange={e => set('maxAttendees', Number(e.target.value))} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
          <input type="url" className="input" placeholder="https://meet.google.com/xxx-xxxx-xxx"
            value={form.meetLink} onChange={e => set('meetLink', e.target.value)} />
          <p className="text-xs text-gray-400 mt-1">Only visible to registered attendees</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
          <input className="input" placeholder="career, FAANG, interview, coding"
            value={form.tags} onChange={e => set('tags', e.target.value)} />
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" id="published" className="w-4 h-4 text-primary-600 rounded"
            checked={form.isPublished} onChange={e => set('isPublished', e.target.checked)} />
          <label htmlFor="published" className="text-sm text-gray-700">Publish immediately</label>
        </div>

        <div className="flex gap-3 pt-2">
          <Link to="/events" className="btn-secondary flex-1 text-center">Cancel</Link>
          <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" />
            {loading ? 'Creating…' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
}
