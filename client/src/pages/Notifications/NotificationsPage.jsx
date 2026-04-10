import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { notificationApi } from '../../api/services';
import { Bell, Check, Trash2, BellOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

const TYPE_ICONS = {
  session_request:'📅', session_confirmed:'✅', session_cancelled:'❌',
  verification_approved:'🛡️', verification_rejected:'⚠️', forum_reply:'💬',
  event_reminder:'🎤', job_posted:'💼', study_group_invite:'📚',
  achievement_earned:'🏆', mention:'📣',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    notificationApi.getAll()
      .then(r => { setNotifications(r.data.notifications || []); setUnread(r.data.unreadCount || 0); })
      .finally(() => setLoading(false));
  }, []);

  const markAll = async () => {
    await notificationApi.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnread(0);
    toast.success('All marked as read');
  };

  const deleteOne = async (id) => {
    await notificationApi.delete(id);
    setNotifications(prev => prev.filter(n => n._id !== id));
  };

  const markOne = async (id) => {
    await notificationApi.markRead(id);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
  };

  if (loading) return <Spinner full />;

  return (
    <div className="p-6 max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary-600" /> Notifications
            {unread > 0 && <span className="ml-1 badge bg-primary-600 text-white">{unread}</span>}
          </h1>
          <p className="page-subtitle">Stay updated on all your activity</p>
        </div>
        {unread > 0 && (
          <button onClick={markAll} className="btn-secondary text-sm">
            <Check className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card p-14 text-center">
          <BellOff className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="font-semibold text-slate-400">No notifications yet</p>
          <p className="text-sm text-slate-300 mt-1">Activity from mentors, events, and the forum will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n._id}
              className={`card p-4 flex items-start gap-3 transition-all hover:shadow-card-hover ${!n.isRead ? 'border-l-4 border-l-primary-500 bg-primary-50/30' : ''}`}>
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl flex-shrink-0">
                {TYPE_ICONS[n.type] || '🔔'}
              </div>
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => !n.isRead && markOne(n._id)}>
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold ${n.isRead ? 'text-slate-600' : 'text-slate-900'}`}>{n.title}</p>
                  {!n.isRead && <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1.5" />}
                </div>
                <p className="text-sm text-slate-500 mt-0.5">{n.message}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-slate-400">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
                  {n.link && <Link to={n.link} className="text-xs text-primary-600 font-semibold hover:underline">View →</Link>}
                </div>
              </div>
              <button onClick={() => deleteOne(n._id)}
                className="p-1.5 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-400 transition-all flex-shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
