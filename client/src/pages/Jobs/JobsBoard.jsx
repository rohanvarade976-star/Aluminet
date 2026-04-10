import { useEffect, useState } from 'react';
import { jobsApi } from '../../api/services';
import useAuthStore from '../../store/authStore';
import Spinner from '../../components/common/Spinner';
import { Briefcase, MapPin, Clock, Search, Plus, Bookmark, BookmarkCheck, ExternalLink, Building, Star, X, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const TYPE_COLORS = {
  'full-time':  'badge-primary',
  'internship': 'bg-green-50 text-green-700',
  'part-time':  'bg-amber-50 text-amber-700',
  'contract':   'bg-purple-50 text-purple-700',
  'freelance':  'bg-orange-50 text-orange-700',
};
const LEVEL_COLORS = {
  fresher: 'bg-blue-50 text-blue-700',
  junior:  'bg-teal-50 text-teal-700',
  mid:     'bg-indigo-50 text-indigo-700',
  senior:  'bg-violet-50 text-violet-700',
};

function PostJobModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title:'', company:'', location:'Remote', type:'full-time', experienceLevel:'fresher', description:'', requirements:'', skills:'', salary:'', applyLink:'', applyEmail:'', department:'' });
  const [loading, setLoading] = useState(false);
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, requirements: form.requirements.split('\n').filter(Boolean), skills: form.skills.split(',').map(s => s.trim()).filter(Boolean) };
      const { data } = await jobsApi.create(payload);
      toast.success('Job posted!');
      onCreated(data.job);
      onClose();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 w-full max-w-xl shadow-xl my-4 animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900">Post a Job</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Job Title*</label><input required className="input" placeholder="Software Engineer" value={form.title} onChange={f('title')} /></div>
            <div><label className="label">Company*</label><input required className="input" placeholder="Google" value={form.company} onChange={f('company')} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Location</label><input className="input" placeholder="Bangalore / Remote" value={form.location} onChange={f('location')} /></div>
            <div><label className="label">Department</label><input className="input" placeholder="Computer Engineering" value={form.department} onChange={f('department')} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Type</label>
              <select className="input" value={form.type} onChange={f('type')}>
                {['full-time','internship','part-time','contract','freelance'].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <div><label className="label">Level</label>
              <select className="input" value={form.experienceLevel} onChange={f('experienceLevel')}>
                {['fresher','junior','mid','senior'].map(l => <option key={l} value={l} className="capitalize">{l}</option>)}
              </select>
            </div>
          </div>
          <div><label className="label">Salary Range</label><input className="input" placeholder="₹6-10 LPA / ₹20,000/month" value={form.salary} onChange={f('salary')} /></div>
          <div><label className="label">Description*</label><textarea required className="input resize-none" rows={3} placeholder="What is this role about?" value={form.description} onChange={f('description')} /></div>
          <div><label className="label">Requirements (one per line)</label><textarea className="input resize-none" rows={3} placeholder="Bachelor's in CS&#10;1+ years experience&#10;Strong communication skills" value={form.requirements} onChange={f('requirements')} /></div>
          <div><label className="label">Required Skills (comma separated)</label><input className="input" placeholder="React, Node.js, MongoDB" value={form.skills} onChange={f('skills')} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Apply Link</label><input className="input" placeholder="https://careers.company.com/..." value={form.applyLink} onChange={f('applyLink')} /></div>
            <div><label className="label">Apply Email</label><input className="input" placeholder="hr@company.com" value={form.applyEmail} onChange={f('applyEmail')} /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Posting…' : 'Post Job'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function JobsBoard() {
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [showPost, setShowPost] = useState(false);
  const [savedJobs, setSavedJobs] = useState(new Set());

  const fetchJobs = (params = {}) => {
    setLoading(true);
    jobsApi.getAll(params).then(r => setJobs(r.data.jobs || [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleSearch = e => {
    e.preventDefault();
    fetchJobs({ search, type: typeFilter !== 'all' ? typeFilter : undefined, level: levelFilter !== 'all' ? levelFilter : undefined });
  };

  const handleApply = async (id) => {
    const { data } = await jobsApi.apply(id);
    toast.success(data.applied ? 'Application registered!' : 'Application withdrawn');
    setJobs(prev => prev.map(j => j._id === id ? { ...j, applicants: data.applied ? [...(j.applicants||[]), {_id: user._id}] : (j.applicants||[]).filter(a => a._id !== user._id) } : j));
  };

  const handleSave = async (id) => {
    await jobsApi.save(id);
    setSavedJobs(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    toast.success(savedJobs.has(id) ? 'Removed from saved' : 'Job saved!');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2"><Briefcase className="w-6 h-6 text-primary-600" /> Alumni Job Board</h1>
          <p className="page-subtitle">Exclusive opportunities posted by AlumiNet alumni</p>
        </div>
        {user?.role === 'alumni' && (
          <button onClick={() => setShowPost(true)} className="btn-primary"><Plus className="w-4 h-4" /> Post a Job</button>
        )}
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="card p-4 mb-5 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-48">
          <label className="label text-xs">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="input pl-9" placeholder="Role, company, or skill…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label text-xs">Type</label>
          <select className="input" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            {['full-time','internship','part-time','contract','freelance'].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label text-xs">Level</label>
          <select className="input" value={levelFilter} onChange={e => setLevelFilter(e.target.value)}>
            <option value="all">All Levels</option>
            {['fresher','junior','mid','senior'].map(l => <option key={l} value={l} className="capitalize">{l}</option>)}
          </select>
        </div>
        <button type="submit" className="btn-primary">Search</button>
      </form>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">{[1,2,3,4].map(i => <div key={i} className="skeleton h-56 rounded-2xl" />)}</div>
      ) : jobs.length === 0 ? (
        <div className="card p-14 text-center">
          <Briefcase className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="font-semibold text-slate-400">No jobs found</p>
          {user?.role === 'alumni' && <button onClick={() => setShowPost(true)} className="btn-primary mt-4 text-sm">Post the first job</button>}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {jobs.map(job => {
            const isApplied = job.applicants?.some(a => a._id === user?._id || a === user?._id);
            const isSaved = savedJobs.has(job._id);
            return (
              <div key={job._id} className="card-hover p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`badge capitalize ${TYPE_COLORS[job.type] || 'badge-gray'}`}>{job.type}</span>
                      <span className={`badge capitalize ${LEVEL_COLORS[job.experienceLevel] || 'badge-gray'}`}>{job.experienceLevel}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base leading-tight">{job.title}</h3>
                    <p className="flex items-center gap-1.5 text-sm text-slate-600 mt-1">
                      <Building className="w-3.5 h-3.5 text-slate-400" /> {job.company}
                    </p>
                  </div>
                  <button onClick={() => handleSave(job._id)} className="p-2 hover:bg-slate-100 rounded-xl transition-all flex-shrink-0">
                    {isSaved ? <BookmarkCheck className="w-5 h-5 text-primary-600" /> : <Bookmark className="w-5 h-5 text-slate-300" />}
                  </button>
                </div>

                <p className="text-sm text-slate-500 line-clamp-2 mb-3">{job.description}</p>

                <div className="flex flex-wrap gap-2 mb-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                  {job.salary && <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500" />{job.salary}</span>}
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
                </div>

                {job.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {job.skills.slice(0,5).map(s => (
                      <span key={s} className={`badge text-xs ${user?.skills?.map(sk=>sk.toLowerCase()).includes(s.toLowerCase()) ? 'badge-success' : 'badge-gray'}`}>{s}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
                  {job.postedBy && (
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {job.postedBy.avatar ? <img src={job.postedBy.avatar} alt="" className="w-full h-full object-cover" /> : <span className="text-primary-700 font-bold text-xs">{job.postedBy.name?.[0]}</span>}
                      </div>
                      <span className="text-xs text-slate-400 truncate">{job.postedBy.name}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    {job.applyLink && (
                      <a href={job.applyLink} target="_blank" rel="noreferrer" className="btn-secondary text-xs py-1.5 px-3">
                        <ExternalLink className="w-3 h-3" /> Apply
                      </a>
                    )}
                    <button onClick={() => handleApply(job._id)}
                      className={`text-xs py-1.5 px-3 rounded-xl font-semibold transition-all border ${isApplied ? 'bg-success-50 text-success-700 border-success-200' : 'btn-primary'}`}>
                      {isApplied ? '✓ Applied' : 'Apply Now'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showPost && <PostJobModal onClose={() => setShowPost(false)} onCreated={job => setJobs(prev => [job, ...prev])} />}
    </div>
  );
}
