import { useEffect, useState } from 'react';
import api from '../../api/axiosInstance';
import Spinner from '../../components/common/Spinner';
import { Briefcase, TrendingUp, Building, Star, RefreshCw, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function JobRecommendations() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();

  const fetchJobs = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try { const { data } = await api.get('/ai/jobs'); setJobs(data.jobs || []); }
    catch {}
    finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(() => { fetchJobs(); }, []);
  if (loading) return <Spinner full />;

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary-600" /> AI Job Recommendations
          </h1>
          <p className="page-subtitle">Personalized roles based on your profile and skills</p>
        </div>
        <button onClick={() => fetchJobs(true)} disabled={refreshing} className="btn-secondary">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {(!user?.skills?.length) && (
        <div className="card p-5 mb-6 border-l-4 border-warning-500 bg-warning-50/50">
          <p className="font-semibold text-warning-800">💡 Add skills for better matches</p>
          <p className="text-warning-700 text-sm mt-1">Update your profile with skills and interests to get personalized job suggestions.</p>
          <Link to="/profile/edit" className="btn-primary mt-3 text-sm">Update Profile</Link>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {jobs.map((job, i) => (
          <div key={i} className="card-hover p-5 animate-fade-in" style={{ animationDelay: `${i*0.06}s` }}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0 pr-3">
                <h3 className="font-bold text-slate-900 text-base">{job.title}</h3>
                <p className="text-slate-500 text-sm mt-0.5">{job.description}</p>
              </div>
              <div className="flex items-center gap-1 bg-primary-50 border border-primary-100 px-2.5 py-1.5 rounded-full flex-shrink-0">
                <Star className="w-3.5 h-3.5 text-primary-600 fill-primary-600" />
                <span className="text-xs font-bold text-primary-700">{job.match}%</span>
              </div>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-1.5 rounded-full" style={{ width: `${job.match}%` }} />
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Required Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {job.skills?.map(s => (
                    <span key={s} className={`badge text-xs ${user?.skills?.map(sk=>sk.toLowerCase()).includes(s.toLowerCase()) ? 'badge-success' : 'badge-gray'}`}>{s}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Top Companies</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {job.companies?.map(c => <span key={c} className="badge-gray">{c}</span>)}
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="text-xs text-slate-400">Avg Salary</p>
                  <p className="text-sm font-bold text-success-700">{job.avgSalary}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
