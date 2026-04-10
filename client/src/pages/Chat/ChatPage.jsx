import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatApi, userApi } from '../../api/services';
import useAuthStore from '../../store/authStore';
import useSocketStore from '../../store/socketStore';
import Spinner from '../../components/common/Spinner';
import { Send, Search, MessageSquare, Hash } from 'lucide-react';
import { format } from 'date-fns';

const GLOBAL_ROOMS = [
  { id: 'general', name: 'General', desc: 'Open to everyone' },
  { id: 'career',  name: 'Career',  desc: 'Jobs & opportunities' },
  { id: 'technical', name: 'Technical', desc: 'Code & CS topics' },
  { id: 'mentorship', name: 'Mentorship', desc: 'Advice & guidance' },
];

export default function ChatPage() {
  const { room: roomParam } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { socket, joinRoom, leaveRoom, sendMessage, sendTyping, onlineUsers } = useSocketStore();
  const [activeRoom, setActiveRoom] = useState(roomParam || 'general');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  // Load messages for room
  useEffect(() => {
    setLoading(true);
    chatApi.getMessages(activeRoom)
      .then(r => setMessages(r.data.messages || []))
      .finally(() => setLoading(false));

    joinRoom(activeRoom);
    navigate(`/chat/${activeRoom}`, { replace: true });

    return () => leaveRoom(activeRoom);
  }, [activeRoom]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;
    const onMsg = (msg) => setMessages(prev => [...prev, msg]);
    const onTyping = ({ user: u, isTyping }) => {
      setTypingUsers(prev => isTyping
        ? prev.includes(u.name) ? prev : [...prev, u.name]
        : prev.filter(n => n !== u.name));
    };
    socket.on('new_message', onMsg);
    socket.on('user_typing', onTyping);
    return () => { socket.off('new_message', onMsg); socket.off('user_typing', onTyping); };
  }, [socket]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    <div className="flex h-full">
      {/* Rooms sidebar */}
      <div className="w-56 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-sm">Channels</h2>
        </div>
        <div className="flex-1 p-2 overflow-y-auto">
          {GLOBAL_ROOMS.map(room => (
            <button key={room.id} onClick={() => setActiveRoom(room.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg mb-1 transition-all ${
                activeRoom === room.id ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}>
              <div className="flex items-center gap-2">
                <Hash className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-sm font-medium">{room.name}</span>
              </div>
              <p className="text-xs text-gray-400 ml-5.5 pl-0.5 mt-0.5">{room.desc}</p>
            </button>
          ))}
        </div>
        {/* Online count */}
        <div className="p-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-1.5"></span>
            {onlineUsers.length} online
          </p>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center gap-2">
          <Hash className="w-4 h-4 text-gray-400" />
          <h2 className="font-semibold text-gray-800">{GLOBAL_ROOMS.find(r => r.id === activeRoom)?.name || activeRoom}</h2>
          <span className="text-sm text-gray-400 ml-1">— {GLOBAL_ROOMS.find(r => r.id === activeRoom)?.desc}</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {loading ? <Spinner /> : messages.length === 0 ? (
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
                    <span className="text-xs text-gray-500 mb-1 ml-1">{msg.sender?.name}</span>
                  )}
                  <div className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words ${
                    isMine
                      ? 'bg-primary-600 text-white rounded-br-sm'
                      : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'
                  } ${msg.isDeleted ? 'opacity-50 italic' : ''}`}>
                    {msg.content}
                  </div>
                  <span className="text-xs text-gray-400 mt-0.5 mx-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {format(new Date(msg.createdAt), 'h:mm a')}
                  </span>
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
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-100 p-4">
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <input
              className="input flex-1"
              placeholder={`Message #${GLOBAL_ROOMS.find(r => r.id === activeRoom)?.name || activeRoom}…`}
              value={input}
              onChange={handleTyping}
              maxLength={2000}
            />
            <button type="submit" disabled={!input.trim()}
              className="w-10 h-10 flex items-center justify-center bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
