import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatApi, userApi } from '../../api/services';
import useAuthStore from '../../store/authStore';
import useSocketStore from '../../store/socketStore';
import Spinner from '../../components/common/Spinner';
import { Send, Search, MessageSquare, Hash, Trash2, Check, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';

// Removed GLOBAL_ROOMS as per requirement to only keep direct messages

export default function ChatPage() {
  const { room: roomParam } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { socket, joinRoom, leaveRoom, sendMessage, sendTyping, onlineUsers, deleteMessage, markMessagesRead } = useSocketStore();
  const [activeRoom, setActiveRoom] = useState(roomParam || '');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const [myRooms, setMyRooms] = useState([]);
  const [activePrivateUser, setActivePrivateUser] = useState(null);
  const messagesContainerRef = useRef(null);
  const typingTimer = useRef(null);

  // Load messages for room
  useEffect(() => {
    setLoading(true);
    chatApi.getMessages(activeRoom)
      .then(r => {
        setMessages(r.data.messages || []);
        markMessagesRead(activeRoom);
      })
      .finally(() => setLoading(false));

    joinRoom(activeRoom);
    navigate(`/chat/${activeRoom}`, { replace: true });

    chatApi.getRooms().then(r => {
      const fetchedRooms = r.data.rooms || [];
      setMyRooms(fetchedRooms);
      // Auto-select first room if no active room is specified and rooms exist
      if (!activeRoom && fetchedRooms.length > 0) {
        setActiveRoom(fetchedRooms[0]._id);
      }
    }).catch(e => console.error(e));

    if (activeRoom.includes('_')) {
      const otherId = activeRoom.split('_').find(id => id !== user?._id);
      if (otherId) {
        userApi.getProfile(otherId).then(r => setActivePrivateUser(r.data.user)).catch(() => {});
      }
    } else {
      setActivePrivateUser(null);
    }

    if (!activeRoom) return;
    return () => leaveRoom(activeRoom);
  }, [activeRoom, user]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;
    const onMsg = (msg) => {
      setMessages(prev => [...prev, msg]);
      if (document.hasFocus()) {
        markMessagesRead(activeRoom);
      }
    };
    const onTyping = ({ user: u, isTyping }) => {
      setTypingUsers(prev => isTyping
        ? prev.includes(u.name) ? prev : [...prev, u.name]
        : prev.filter(n => n !== u.name));
    };
    const onMsgDeleted = ({ messageId, content }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, isDeleted: true, content } : m));
    };
    const onMsgsRead = ({ room, readerId }) => {
      if (room === activeRoom) {
        setMessages(prev => prev.map(m => m.sender?._id === user?._id && !m.readBy?.includes(readerId) 
          ? { ...m, readBy: [...(m.readBy || []), readerId] } 
          : m));
      }
    };
    
    socket.on('new_message', onMsg);
    socket.on('user_typing', onTyping);
    socket.on('message_deleted', onMsgDeleted);
    socket.on('messages_read', onMsgsRead);
    return () => { 
      socket.off('new_message', onMsg); 
      socket.off('user_typing', onTyping); 
      socket.off('message_deleted', onMsgDeleted);
      socket.off('messages_read', onMsgsRead);
    };
  }, [socket]);

  // Auto scroll isolated to messages container
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ room: activeRoom, content: input.trim() });
    setInput('');
    sendTyping(activeRoom, false);
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    sendTyping(activeRoom, true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => sendTyping(activeRoom, false), 1500);
  };

  const isOnline = (userId) => onlineUsers.includes(userId?.toString());

  return (
    <div className="flex h-full w-full">
      {/* Rooms sidebar */}
      <div className="w-56 bg-white/80 dark:bg-white/5 backdrop-blur-md border-r border-slate-200 dark:border-white/10 flex flex-col flex-shrink-0 transition-colors">
        {/* Direct Messages */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10">
          <h2 className="font-semibold text-slate-900 dark:text-white text-sm">Direct Messages</h2>
        </div>
        <div className="flex-1 p-2 overflow-y-auto">
          {myRooms.filter(r => r._id.includes('_')).map(room => {
            const otherUser = room.otherUser;
            if (!otherUser) return null;
            return (
              <button key={room._id} onClick={() => setActiveRoom(room._id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg mb-1 transition-all ${
                  activeRoom === room._id ? 'bg-gradient-to-r from-violet-600/90 to-fuchsia-600/90 dark:from-violet-600/80 dark:to-fuchsia-600/80 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'}`}>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {otherUser?.avatar ? <img src={otherUser.avatar} className="w-full h-full object-cover"/> : <span className="text-[10px] font-bold text-slate-500">{otherUser?.name?.[0]}</span>}
                  </div>
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <span className="text-sm font-medium truncate pr-2">{otherUser.name}</span>
                    {isOnline(otherUser._id) && (
                      <span className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
        {/* Online count */}
        <div className="p-3 border-t border-slate-200 dark:border-white/10">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full mr-1.5 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
            {onlineUsers.length} online
          </p>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white/60 dark:bg-black/20 backdrop-blur-sm transition-colors">
        {/* Header */}
        {activeRoom ? (
          <div className="border-b border-slate-200 dark:border-white/10 px-5 py-3 flex items-center gap-3 bg-white/40 dark:bg-white/5 backdrop-blur-md z-10 shadow-sm">
            <Hash className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <div className="flex flex-col">
              <h2 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight flex items-center gap-2">
                {myRooms.find(r => r._id === activeRoom)?.otherUser?.name || activePrivateUser?.name || activeRoom}
                {isOnline(myRooms.find(r => r._id === activeRoom)?.otherUser?._id || activePrivateUser?._id) && (
                  <span className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" title="Online" />
                )}
              </h2>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {isOnline(myRooms.find(r => r._id === activeRoom)?.otherUser?._id || activePrivateUser?._id) ? 'Active now' : 'Offline'}
              </span>
            </div>
          </div>
        ) : (
          <div className="border-b border-slate-200 dark:border-white/10 px-5 py-3 flex items-center gap-2 bg-white/40 dark:bg-white/5 backdrop-blur-md z-10 shadow-sm">
            <h2 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">Messages</h2>
          </div>
        )}

        {/* Messages */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-1">
          {!activeRoom ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MessageSquare className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">Select a conversation to start chatting</p>
            </div>
          ) : loading ? <Spinner /> : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MessageSquare className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No messages yet. Say hello!</p>
            </div>
          ) : messages.map((msg, i) => {
            const isMine = msg.sender?._id === user?._id || msg.sender === user?._id;
            const showAvatar = i === 0 || messages[i-1]?.sender?._id !== msg.sender?._id;
            return (
              <div key={msg._id} className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
                {!isMine && (
                  <div className={`w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0 ${showAvatar ? 'visible' : 'invisible'}`}>
                    {msg.sender?.avatar
                      ? <img src={msg.sender.avatar} alt="" className="w-full h-full object-cover" />
                      : <span className="text-primary-700 text-xs font-bold">{msg.sender?.name?.[0]}</span>}
                  </div>
                )}
                <div className={`max-w-xs lg:max-w-md group ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                  {showAvatar && !isMine && (
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">{msg.sender?.name}</span>
                  )}
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words shadow-sm flex items-end gap-2 ${
                    isMine
                      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-br-sm'
                      : 'bg-white/90 dark:bg-white/10 border border-slate-200 dark:border-white/20 text-slate-900 dark:text-white rounded-bl-sm backdrop-blur-md'
                  } ${msg.isDeleted ? 'opacity-50 italic' : ''}`}>
                    <span>{msg.content}</span>
                    {isMine && !msg.isDeleted && (
                      <div className="flex items-center gap-0.5 mb-[-2px] ml-1">
                        {msg.readBy?.length > 0 
                          ? <CheckCheck className="w-3.5 h-3.5 text-blue-300" />
                          : <Check className="w-3.5 h-3.5 text-white/60" />
                        }
                      </div>
                    )}
                  </div>
                  <div className={`flex items-center gap-2 mt-0.5 mx-1 opacity-0 group-hover:opacity-100 transition-opacity ${isMine ? 'flex-row-reverse' : ''}`}>
                    <span className="text-xs text-gray-400">
                      {format(new Date(msg.createdAt), 'h:mm a')}
                    </span>
                    {isMine && !msg.isDeleted && (
                      <button onClick={() => deleteMessage(activeRoom, msg._id)} className="text-rose-400 hover:text-rose-600 transition-colors" title="Delete message">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-400 pl-9">
              <div className="flex gap-0.5">
                {[0,1,2].map(i => (
                  <span key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
                ))}
              </div>
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing…
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-slate-200 dark:border-white/10 p-4 bg-white/40 dark:bg-white/5 backdrop-blur-md z-10">
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <input
              className="input flex-1"
              placeholder={`Message ${myRooms.find(r => r._id === activeRoom)?.otherUser?.name || activePrivateUser?.name || '...'}`}
              value={input}
              onChange={handleTyping}
              maxLength={2000}
              disabled={!activeRoom}
            />
            <button type="submit" disabled={!input.trim()}
              className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0 shadow-md">
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
