import { useState } from 'react';
import { aiApi } from '../../api/services';
import { MessageSquare, RefreshCw, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';

const DIFFICULTY_COLOR = {
  Easy:   'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
  Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  Hard:   'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
};
const TYPE_COLOR = {
  behavioral:  'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  technical:   'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
  situational: 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300',
};

function QuestionCard({ q, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card-glass p-5 transition-all">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center text-sm font-bold text-violet-600 dark:text-violet-300 flex-shrink-0">
          {index + 1}
        </div>
        <div className="flex-1">
          <p className="font-bold text-slate-900 dark:text-white text-base leading-snug">{q.question}</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold capitalize ${TYPE_COLOR[q.type] || TYPE_COLOR.behavioral}`}>{q.type}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${DIFFICULTY_COLOR[q.difficulty] || DIFFICULTY_COLOR.Medium}`}>{q.difficulty}</span>
          </div>
          {q.tips && (
            <div className="mt-3">
              <button onClick={() => setOpen(o => !o)}
                className="flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors">
                <Lightbulb className="w-3.5 h-3.5" />
                {open ? 'Hide tip' : 'Show tip'}
                {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {open && (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 p-3 bg-violet-50 dark:bg-violet-500/10 rounded-xl border border-violet-100 dark:border-violet-500/20">
                  💡 {q.tips}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InterviewPrep() {
  const [form, setForm] = useState({ role: '', level: 'fresher' });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasResults, setHasResults] = useState(false);

  const generate = async (e) => {
    e?.preventDefault();
    if (!form.role.trim()) return;
    setLoading(true);
    try {
      const { data } = await aiApi.getInterviewQuestions(form.role.trim(), form.level);
      setQuestions(data.questions || []);
      setHasResults(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate questions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-4xl animate-fade-in">
      <div className="mb-8">
        <h1 className="page-title flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-violet-500" /> Interview Prep
        </h1>
        <p className="page-subtitle">Get AI-generated interview questions tailored to your role and level</p>
      </div>

      <form onSubmit={generate} className="card-glass p-6 mb-8">
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="label">Target Role</label>
            <input className="input" placeholder="e.g. Software Engineer, Data Scientist"
              value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Experience Level</label>
            <select className="input" value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}>
              <option value="fresher">Fresher (0–1 yrs)</option>
              <option value="junior">Junior (1–3 yrs)</option>
              <option value="mid">Mid-level (3–5 yrs)</option>
              <option value="senior">Senior (5+ yrs)</option>
            </select>
          </div>
        </div>
        <button type="submit" disabled={loading || !form.role.trim()} className="btn-primary w-full">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating questions…
            </span>
          ) : 'Generate Interview Questions'}
        </button>
      </form>

      {hasResults && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 dark:text-white text-lg">
              {questions.length} questions for <span className="text-violet-600 dark:text-violet-400">{form.role}</span>
            </h2>
            <button onClick={generate} disabled={loading} className="btn-secondary text-sm">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Regenerate
            </button>
          </div>
          <div className="space-y-3">
            {questions.map((q, i) => <QuestionCard key={i} q={q} index={i} />)}
          </div>
        </div>
      )}
    </div>
  );
}
