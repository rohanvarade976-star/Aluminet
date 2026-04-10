import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { notificationApi } from '../../api/services';
import useSocketStore from '../../store/socketStore';

export default function NotificationBell() {
  const [unread, setUnread] = useState(0);
  const { socket } = useSocketStore();

  useEffect(() => {
    notificationApi.getAll({ limit: 1 }).then(r => setUnread(r.data.unreadCount || 0)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = () => setUnread(prev => prev + 1);
    socket.on('new_notification', handler);
    return () => socket.off('new_notification', handler);
  }, [socket]);

  return (
    <Link to="/notifications" className="relative p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-500 hover:text-slate-700">
      <Bell className="w-5 h-5" />
      {unread > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center leading-none">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
  );
}
