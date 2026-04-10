import { useEffect, useState } from 'react';
import { studyGroupApi } from '../../api/services';
import useAuthStore from '../../store/authStore';
import Spinner from '../../components/common/Spinner';
import { Users, Search, Plus, BookOpen, Send, X, Hash, Lock, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

function CreateGroupModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name:'', description:'', subject:'', maxMembers:10, schedule:'', meetLink:'', tags:'', department:'', isPublic:true });
  const [loading, setLoading] = useState(false);
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean), maxMembers: Number(form.maxMembers) };
      const { data } = await studyGroupApi.create(payload);
      toast.success('Study group created!');
      onCreated(data.group);
      onClose();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900">Create Study Group</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div><label className="label">Group Name*</label><input required className="input" placeholder="e.g. DBMS Exam Prep 2025" value={form.name} onChange={f('name')} /></div>
          <div><label className="label">Subject / Topic*</label><input required className="input" placeholder="e.g. Database Management Systems" value={form.subject} onChange={f('subject')} /></div>
          <div><label className="label">Description</label><textarea className="input resize-none" rows={2} placeholder="What will this group focus on?" value={form.description} onChange={f('description')} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Max Members</label><input type="number" min={2} max={50} className="input" value={form.maxMembers} onChange={f('maxMembers')} /></div>
            <div><label className="label">Department</label><input className="input" placeholder="Computer Engg" value={form.department} onChange={f('department')} /></div>
          </div>
          <div><label className="label">Schedule</label><input className="input" placeholder="e.g. Weekdays 7-9 PM" value={form.schedule} onChange={f('schedule')} /></div>
          <div><label className="label">Meet Link (optional)</label><input className="input" placeholder="https://meet.google.com/..." value={form.meetLink} onChange={f('meetLink')} /></div>
          <div><label className="label">Tags (comma separated)</label><input className="input" placeholder="dbms, sql, exam" value={form.tags} onChange={f('tags')} /></div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <button type="button" onClick={() => setForm(p => ({ ...p, isPublic: true }))}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold border transition-all ${form.isPublic ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-500 border-slate-200'}`}>
              <Globe className="w-4 h-4" /> Public
            </button>
            <button type="button" onClick={() => setForm(p => ({ ...p, isPublic: false }))}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold border transition-all ${!form.isPublic ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-500 border-slate-200'}`}>
              <Lock className="w-4 h-4" /> Private
            </button>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Creating…' : 'Create Group'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GroupChat({ group, onClose }) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState(group.messages || []);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    setSending(true);
    try {
      const { data } = await studyGroupApi.sendMessage(group._id, input.trim());
      setMessages(prev => [...prev, { ...data.message, sender: { _id: user._id, name: user.name, avatar: user.avatar } }]);
      setInput('');
    } catch { toast.error('Failed to send'); }
    finally { setSending(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end justify-end z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md h-[520px] flex flex-col shadow-xl animate-scale-in">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div>
            <p className="font-bold text-slate-900 text-sm">{group.name}</p>
            <p className="text-xs text-slate-400">{group.members?.length} members · {group.subject}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && <p className="text-center text-sm text-slate-400 py-8">No messages yet. Start the conversation!</p>}
          {messages.map((m, i) => {
            const isMe = m.sender?._id === user._id || m.sender === user._id;
            return (
              <div key={i} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {m.sender?.avatar ? <img src={m.sender.avatar} alt="" className="w-full h-full object-cover" /> : <span className="text-primary-700 font-bold text-xs">{m.sender?.name?.[0] || '?'}</span>}
                </div>
                <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${isMe ? 'bg-primary-600 text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'}`}>
                  {!isMe && <p className="text-xs font-semibold mb-0.5 opacity-70">{m.sender?.name}</p>}
                  {m.content}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2 p-3 border-t border-slate-100">
          <input className="flex-1 input py-2 text-sm" placeholder="Type a message…"
            value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} />
          <button onClick={send} disabled={sending || !input.trim()} className="w-9 h-9 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 rounded-xl flex items-center justify-center transition-all">
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StudyGroups() {
  const { user } = useAuthStore();
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('discover');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [chatGroup, setChatGroup] = useState(null);

  useEffect(() => {
    Promise.all([
      studyGroupApi.getAll().then(r => setGroups(r.data.groups || [])),
      studyGroupApi.getMine().then(r => setMyGroups(r.data.groups || [])),
    ]).finally(() => setLoading(false));
  }, []);

  const handleJoin = async (id) => {
    const { data } = await studyGroupApi.join(id);
    toast.success(data.message);
    const refresh = await studyGroupApi.getAll();
    setGroups(refresh.data.groups || []);
    const myRefresh = await studyGroupApi.getMine();
    setMyGroups(myRefresh.data.groups || []);
  };

  const openChat = async (group) => {
    const { data } = await studyGroupApi.getOne(group._id);
    setChatGroup(data.group);
  };

  const filtered = groups.filter(g =>
    !search || g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.subject.toLowerCase().includes(search.toLowerCase()) ||
    g.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <Spinner full />;

  const display = tab === 'discover' ? filtered : myGroups;

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2"><BookOpen className="w-6 h-6 text-primary-600" /> Study Groups</h1>
          <p className="page-subtitle">Find peers to study with and ace your exams together</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary"><Plus className="w-4 h-4" /> Create Group</button>
      </div>

      <div className="flex gap-2 mb-5">
        {['discover','mine'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all border ${tab === t ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
            {t === 'discover' ? `Discover (${groups.length})` : `My Groups (${myGroups.length})`}
          </button>
        ))}
      </div>

      {tab === 'discover' && (
        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="input pl-10 max-w-md" placeholder="Search groups by name, subject, or tag…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      )}

      {display.length === 0 ? (
        <div className="card p-14 text-center">
          <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="font-semibold text-slate-400">{tab === 'mine' ? 'You haven\'t joined any groups yet' : 'No groups found'}</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary mt-4 text-sm">Create the first group</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {display.map(group => {
            const isMember = group.members?.some(m => m._id === user._id || m === user._id);
            const isFull = group.members?.length >= group.maxMembers;
            return (
              <div key={group._id} className="card-hover p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex items-center gap-1">
                    {group.isPublic ? <Globe className="w-3.5 h-3.5 text-slate-400" /> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
                    {isMember && <span className="badge-success text-xs">Joined</span>}
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 mb-0.5">{group.name}</h3>
                <p className="text-sm text-primary-600 font-medium mb-1">{group.subject}</p>
                {group.description && <p className="text-sm text-slate-500 line-clamp-2 mb-3">{group.description}</p>}
                <div className="flex items-center gap-3 mb-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{group.members?.length}/{group.maxMembers}</span>
                  {group.schedule && <span>📅 {group.schedule}</span>}
                </div>
                {group.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {group.tags.slice(0,3).map(t => <span key={t} className="badge-gray text-xs"><Hash className="w-2.5 h-2.5" />{t}</span>)}
                  </div>
                )}
                <div className="flex gap-2 pt-3 border-t border-slate-50">
                  {isMember && (
                    <button onClick={() => openChat(group)} className="btn-primary flex-1 text-sm">
                      <Send className="w-3.5 h-3.5" /> Open Chat
                    </button>
                  )}
                  <button onClick={() => handleJoin(group._id)}
                    disabled={isFull && !isMember}
                    className={`flex-1 text-sm font-semibold py-2 rounded-xl transition-all border ${
                      isMember ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                      : isFull ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                      : 'btn-secondary'}`}>
                    {isMember ? 'Leave' : isFull ? 'Full' : 'Join Group'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} onCreated={g => { setGroups(prev => [g, ...prev]); setMyGroups(prev => [g, ...prev]); }} />}
      {chatGroup && <GroupChat group={chatGroup} onClose={() => setChatGroup(null)} />}
    </div>
  );
}
