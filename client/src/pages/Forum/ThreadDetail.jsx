import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { forumApi } from '../../api/services';
import useAuthStore from '../../store/authStore';
import Spinner from '../../components/common/Spinner';
import { ArrowLeft, ThumbsUp, Send, Trash2, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function ThreadDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    forumApi.getPost(id).then(r => setPost(r.data.post)).finally(() => setLoading(false));
  }, [id]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await forumApi.addReply(id, reply);
      setPost(prev => ({ ...prev, replies: data.replies }));
      setReply('');
      toast.success('Reply posted!');
    } catch { toast.error('Failed to post reply'); }
    finally { setSubmitting(false); }
  };

  const handleUpvote = async () => {
    try {
      const { data } = await forumApi.upvote(id);
      setPost(prev => ({ ...prev, upvotes: Array(data.upvotes).fill(null) }));
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await forumApi.deletePost(id);
      toast.success('Post deleted');
      navigate('/forum');
    } catch { toast.error('Delete failed'); }
  };

  if (loading) return <Spinner full />;
  if (!post) return <div className="p-6 text-gray-500">Post not found.</div>;

  const CATEGORY_COLORS = {
    career:'bg-blue-100 text-blue-700', technical:'bg-purple-100 text-purple-700',
    campus:'bg-green-100 text-green-700', general:'bg-gray-100 text-gray-600', mentorship:'bg-orange-100 text-orange-700'
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link to="/forum" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Forum
      </Link>

      {/* Main post */}
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            {post.author?.avatar
              ? <img src={post.author.avatar} alt="" className="w-full h-full object-cover" />
              : <span className="text-primary-700 font-bold">{post.author?.name?.[0]}</span>}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link to={`/profile/${post.author?._id}`} className="font-semibold text-gray-900 hover:text-primary-600">{post.author?.name}</Link>
                <p className="text-xs text-gray-400 mt-0.5">{post.author?.role === 'alumni' ? `Alumni · ${post.author?.currentRole}` : 'Student'} · {format(new Date(post.createdAt), 'MMM d, yyyy')}</p>
              </div>
              {(post.author?._id === user?._id || user?.role === 'admin') && (
                <button onClick={handleDelete} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <h1 className="text-xl font-bold text-gray-900 mt-3">{post.title}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`badge text-xs ${CATEGORY_COLORS[post.category] || 'bg-gray-100 text-gray-600'}`}>{post.category}</span>
              {post.tags?.map(tag => <span key={tag} className="badge bg-gray-50 text-gray-500 text-xs">#{tag}</span>)}
            </div>
            <p className="text-gray-700 mt-4 leading-relaxed whitespace-pre-wrap">{post.content}</p>
            <div className="flex items-center gap-4 mt-5 pt-4 border-t border-gray-50">
              <button onClick={handleUpvote}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors">
                <ThumbsUp className="w-4 h-4" /> {post.upvotes?.length || 0} upvotes
              </button>
              <span className="text-sm text-gray-400">{post.replies?.length || 0} replies</span>
              <span className="text-sm text-gray-400">{post.views || 0} views</span>
            </div>
          </div>
        </div>
      </div>

      {/* Replies */}
      <h2 className="font-semibold text-gray-900 mb-4">{post.replies?.length || 0} Replies</h2>

      <div className="space-y-4 mb-6">
        {post.replies?.map((reply) => (
          <div key={reply._id} className={`card p-4 ${reply.isAccepted ? 'border-green-200 bg-green-50' : ''}`}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                {reply.author?.avatar
                  ? <img src={reply.author.avatar} alt="" className="w-full h-full object-cover" />
                  : <span className="text-primary-700 font-semibold text-sm">{reply.author?.name?.[0]}</span>}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link to={`/profile/${reply.author?._id}`} className="font-medium text-sm text-gray-900 hover:text-primary-600">{reply.author?.name}</Link>
                  {reply.author?.role === 'alumni' && (
                    <span className="badge bg-green-100 text-green-700 text-xs">Alumni</span>
                  )}
                  {reply.isAccepted && (
                    <span className="badge bg-green-100 text-green-700 text-xs flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Accepted
                    </span>
                  )}
                  <span className="text-xs text-gray-400">{format(new Date(reply.createdAt), 'MMM d')}</span>
                </div>
                <p className="text-gray-700 mt-2 text-sm leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-gray-400">{reply.upvotes?.length || 0} upvotes</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {(!post.replies || post.replies.length === 0) && (
          <p className="text-sm text-gray-400 text-center py-6">No replies yet. Be the first!</p>
        )}
      </div>

      {/* Reply form */}
      {!post.isClosed ? (
        <div className="card p-5">
          <h3 className="font-medium text-gray-900 mb-3">Add a Reply</h3>
          <form onSubmit={handleReply} className="space-y-3">
            <textarea required className="input resize-none" rows={4}
              placeholder="Share your thoughts, experience or answer…"
              value={reply} onChange={e => setReply(e.target.value)} />
            <button type="submit" disabled={submitting}
              className="btn-primary flex items-center gap-2">
              <Send className="w-4 h-4" /> {submitting ? 'Posting…' : 'Post Reply'}
            </button>
          </form>
        </div>
      ) : (
        <div className="card p-4 text-center text-gray-400 text-sm">This thread is closed.</div>
      )}
    </div>
  );
}
