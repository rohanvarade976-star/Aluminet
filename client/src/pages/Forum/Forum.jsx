import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { forumApi } from '../../api/services';
import useAuthStore from '../../store/authStore';
import Spinner from '../../components/common/Spinner';
import { MessageSquare, ThumbsUp, Eye, Plus, Search, Pin, X, Tag } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const CATEGORIES = ['all','career','technical','campus','general','mentorship'];
const CAT_STYLES = {
  career:     'bg-blue-50 text-blue-700',
  technical:  'bg-purple-50 text-purple-700',
  campus:     'bg-green-50 text-green-700',
  general:    'bg-slate-100 text-slate-600',
  mentorship: 'bg-orange-50 text-orange-700',
};

function NewPostModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', content: '', category: 'general', tags: '' });
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await forumApi.createPost({ ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) });
      toast.success('Post created!');
      onCreated(data.post);
      onClose();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900">New Discussion</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input required className="input" placeholder="What's your question or topic?" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="label">Details</label>
            <textarea required className="input resize-none" rows={4} placeholder="Provide more context..."
              value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.filter(c => c !== 'all').map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> Tags (comma separated)</label>
              <input className="input" placeholder="e.g. react, interview" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Posting…' : 'Post Discussion'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Forum() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = (cat, q, p = 1) => {
    setLoading(true);
    forumApi.getPosts({ category: cat !== 'all' ? cat : undefined, search: q || undefined, page: p, limit: 15 })
      .then(r => { setPosts(r.data.posts || []); setTotalPages(r.data.pages || 1); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPosts(category, search, page); }, [category, page]);
  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchPosts(category, search, 1); };

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-title">Community Forum</h1>
          <p className="page-subtitle">Ask questions, share knowledge, connect with peers</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input className="input pl-10 pr-20" placeholder="Search discussions…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary text-xs px-3 py-1.5">Search</button>
      </form>

      {/* Category tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => { setCategory(c); setPage(1); }}
            className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold capitalize transition-all border ${
              category === c ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : posts.length === 0 ? (
        <div className="card p-14 text-center">
          <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="font-semibold text-slate-400">No discussions found</p>
          <button onClick={() => setShowModal(true)} className="btn-primary mt-4 text-sm">Start a discussion</button>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <Link key={post._id} to={`/forum/${post._id}`}
              className="card-hover p-5 block animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {post.isPinned && (
                      <span className="badge bg-amber-50 text-amber-600 border border-amber-100">
                        <Pin className="w-3 h-3" /> Pinned
                      </span>
                    )}
                    <span className={`badge ${CAT_STYLES[post.category] || 'badge-gray'} capitalize`}>{post.category}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug hover:text-primary-600 transition-colors">{post.title}</h3>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{post.content}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                        {post.author?.avatar
                          ? <img src={post.author.avatar} alt="" className="w-full h-full object-cover" />
                          : <span className="text-primary-700 font-bold text-xs">{post.author?.name?.[0]}</span>}
                      </div>
                      <span className="font-medium text-slate-500">{post.author?.name}</span>
                    </div>
                    <span>{format(new Date(post.createdAt), 'MMM d')}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views}</span>
                    <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {post.upvotes?.length || 0}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {post.replies?.length || 0} replies</span>
                  </div>
                  {post.tags?.length > 0 && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {post.tags.slice(0,4).map(t => <span key={t} className="badge-gray text-xs">#{t}</span>)}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-sm px-3 py-2 disabled:opacity-40">Previous</button>
              <span className="text-sm text-slate-500 font-medium">Page {page} of {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary text-sm px-3 py-2 disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      )}

      {showModal && <NewPostModal onClose={() => setShowModal(false)} onCreated={post => setPosts(prev => [post, ...prev])} />}
    </div>
  );
}
