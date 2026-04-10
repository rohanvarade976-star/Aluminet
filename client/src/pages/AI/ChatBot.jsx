import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Minimize2, Maximize2, Sparkles } from 'lucide-react';
import api from '../../api/axiosInstance';
import useAuthStore from '../../store/authStore';

function Message({ msg }) {
  const isBot = msg.role === 'assistant';
  return (
    <div className={`flex gap-2.5 ${isBot ? '' : 'flex-row-reverse'} animate-fade-in`}>
      {isBot && (
        <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
        isBot ? 'bg-slate-100 text-slate-800 rounded-tl-sm' : 'bg-primary-600 text-white rounded-tr-sm shadow-sm'}`}>
        {msg.content}
      </div>
    </div>
  );
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm AlumiBot 🤖\n\nI can help you with career advice, finding mentors, and navigating AlumiNet. What would you like to know?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const { user } = useAuthStore();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const { data } = await api.post('/ai/chat', { message: userMsg.content, history: messages.slice(-6) });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again!" }]);
    } finally { setLoading(false); }
  };

  const quickPrompts = ['How to find a mentor?', 'Interview preparation tips', 'How to improve my resume?', 'Career switch advice'];
  if (!user) return null;

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-700 rounded-full shadow-lg shadow-primary-600/30 flex items-center justify-center z-50 transition-all hover:scale-105 group">
          <Bot className="w-7 h-7 text-white" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-success-500 rounded-full border-2 border-white" />
        </button>
      )}

      {open && (
        <div className={`fixed bottom-6 right-6 z-50 w-[340px] bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col transition-all duration-200 ${minimized ? 'h-14' : 'h-[500px]'}`}
          style={{ boxShadow: '0 20px 60px -12px rgba(0,0,0,0.15)' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 flex-shrink-0 bg-white rounded-t-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center shadow-sm">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">AlumiBot</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-success-500 rounded-full inline-block" />
                  <p className="text-xs text-slate-400">AI Assistant · Online</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setMinimized(v => !v)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all">
                {minimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                {messages.map((m, i) => <Message key={i} msg={m} />)}
                {loading && (
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                      {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Quick prompts */}
              {messages.length === 1 && (
                <div className="px-3 pb-2 flex gap-1.5 flex-wrap border-t border-slate-100 pt-2 bg-white">
                  {quickPrompts.map(p => (
                    <button key={p} onClick={() => setInput(p)}
                      className="text-xs bg-slate-50 hover:bg-primary-50 text-slate-600 hover:text-primary-700 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-primary-200 transition-all font-medium">
                      {p}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-2 p-3 border-t border-slate-100 bg-white rounded-b-2xl">
                <input className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-all"
                  placeholder="Ask AlumiBot anything..."
                  value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()} />
                <button onClick={send} disabled={!input.trim() || loading}
                  className="w-9 h-9 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 rounded-xl flex items-center justify-center transition-all shadow-sm flex-shrink-0">
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
