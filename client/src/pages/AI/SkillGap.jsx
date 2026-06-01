import { useState } from 'react';
import { aiApi } from '../../api/services';
import { Target, ChevronRight, Clock, ExternalLink, BookOpen, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const PRIORITY_COLOR = {
  High: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
  Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  Low: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
};

export default function SkillGap() {
  const [targetRole, setTargetRole] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async (e) => {
    e.preventDefault();
    if (!targetRole.trim()) return;
    setLoading(true);
    try {
      const { data } = await aiApi.getSkillGap(targetRole.trim());
      setResult(data.skillGap);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analysis failed. Check your Groq API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-4xl animate-fade-in">
      <div className="mb-8">
        <h1 className="page-title flex items-center gap-2">
          <Target className="w-6 h-6 text-rose-500" /> Skill Gap Analyzer
        </h1>
        <p className="page-subtitle">Enter your target role and get a personalized roadmap to get there</p>
      </div>

      <form onSubmit={analyze} className="card-glass p-6 mb-8">
        <label className="label">What role are you targeting?</label>
        <div className="flex gap-3">
          <input
            className="input flex-1"
            placeholder="e.g. Backend Engineer, Data Scientist, DevOps Engineer"
            value={targetRole}
            onChange={e => setTargetRole(e.target.value)}
            required
          />
          <button type="submit" disabled={loading || !targetRole.trim()} className="btn-primary px-6">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing…
              </span>
            ) : (
              <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> Analyze</span>
            )}
          </button>
        </div>
      </form>

      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Readiness Score */}
          <div className="card-glass p-6 flex items-center gap-6">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-200 dark:text-white/10" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2.5"
                  strokeDasharray={`${result.readinessScore}, 100`}
                  className="text-rose-500" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-black text-slate-900 dark:text-white">{result.readinessScore}%</span>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Readiness for {targetRole}</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Estimated time to ready: <span className="font-bold text-rose-600 dark:text-rose-400">{result.timeToReady}</span></p>
              {result.existingSkills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {result.existingSkills.map(s => (
                    <span key={s} className="badge bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300 text-xs">✓ {s}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Missing Skills */}
          {result.missingSkills?.length > 0 && (
            <div className="card-glass p-6">
              <h2 className="font-bold text-slate-900 dark:text-white text-lg mb-4">Skills to Learn</h2>
              <div className="space-y-3">
                {result.missingSkills.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 dark:text-white">{item.skill}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${PRIORITY_COLOR[item.priority] || PRIORITY_COLOR.Medium}`}>{item.priority}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5" /> {item.learningTime}
                      </div>
                      {item.resources?.length > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {item.resources.map((r, j) => (
                            <span key={j} className="text-xs bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-300 flex items-center gap-1">
                              <BookOpen className="w-3 h-3" /> {r}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Roadmap */}
          {result.roadmap?.length > 0 && (
            <div className="card-glass p-6">
              <h2 className="font-bold text-slate-900 dark:text-white text-lg mb-4">Your Learning Roadmap</h2>
              <div className="space-y-3">
                {result.roadmap.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-rose-600 dark:text-rose-300">
                      {i + 1}
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
