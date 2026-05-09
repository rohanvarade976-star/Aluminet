import { useState, useRef } from 'react';
import api from '../../api/axiosInstance';
import { FileText, Upload, CheckCircle, AlertCircle, Lightbulb, Target, TrendingUp, Loader, RefreshCw } from 'lucide-react';

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [drag, setDrag] = useState(false);
  const fileRef = useRef();

  const handleFile = (f) => {
    if (f && (f.type === 'application/pdf' || f.type === 'text/plain')) setFile(f);
    else alert('Please upload a PDF or TXT file');
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    const form = new FormData();
    form.append('resume', file);
    try {
      const { data } = await api.post('/ai/resume/analyze', form);
      setAnalysis(data.analysis);
    } catch (err) { alert(err.response?.data?.error || 'Analysis failed'); }
    finally { setLoading(false); }
  };

  const scoreColor = (s) => s >= 80 ? 'text-success-600' : s >= 60 ? 'text-warning-600' : 'text-danger-600';
  const scoreRing = (s) => s >= 80 ? '#16a34a' : s >= 60 ? '#d97706' : '#dc2626';

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-7">
        <h1 className="page-title flex items-center gap-2"><FileText className="w-6 h-6 text-primary-600" /> AI Resume Analyzer</h1>
        <p className="page-subtitle">Upload your resume for instant AI-powered feedback and improvement tips</p>
      </div>

      {!analysis && (
        <>
          <div onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)}
            onDrop={e=>{e.preventDefault();setDrag(false);handleFile(e.dataTransfer.files[0])}}
            onClick={()=>fileRef.current?.click()}
            className={`card border-2 border-dashed p-14 text-center cursor-pointer transition-all ${drag ? 'border-primary-400 bg-primary-50' : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'}`}>
            <input ref={fileRef} type="file" accept=".pdf,.txt" className="hidden" onChange={e=>handleFile(e.target.files[0])} />
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${file ? 'bg-primary-50' : 'bg-slate-100'}`}>
              <Upload className={`w-8 h-8 ${file ? 'text-primary-600' : 'text-slate-400'}`} />
            </div>
            {file ? (
              <div><p className="font-semibold text-slate-900">{file.name}</p><p className="text-slate-400 text-sm mt-1">{(file.size/1024).toFixed(0)} KB · Click to change</p></div>
            ) : (
              <div><p className="font-semibold text-slate-700">Drop your resume here or click to browse</p><p className="text-slate-400 text-sm mt-1">Supports PDF and TXT files up to 10MB</p></div>
            )}
          </div>
          {file && (
            <button onClick={analyze} disabled={loading} className="btn-primary w-full mt-4 py-3 text-base">
              {loading ? <><Loader className="w-4 h-4 animate-spin" /> Analyzing with AI...</> : <><FileText className="w-4 h-4" /> Analyze My Resume</>}
            </button>
          )}
        </>
      )}

      {analysis && (
        <div className="space-y-5 animate-fade-in">
          {/* Score */}
          <div className="card p-6 flex items-center gap-6">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3" stroke={scoreRing(analysis.overallScore)}
                  strokeDasharray={`${analysis.overallScore} ${100-analysis.overallScore}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className={`text-2xl font-bold ${scoreColor(analysis.overallScore)}`}>{analysis.overallScore}</span>
                <span className="text-xs text-slate-400">/100</span>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900 mb-1">Resume Score</h2>
              <p className="text-slate-500 text-sm leading-relaxed">{analysis.summary}</p>
              <button onClick={()=>{setAnalysis(null);setFile(null);}} className="btn-secondary mt-3 text-xs">
                <RefreshCw className="w-3.5 h-3.5" /> Analyze Another
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success-600" /> Strengths</h3>
              <ul className="space-y-2">
                {analysis.strengths?.map((s,i)=><li key={i} className="flex items-start gap-2 text-sm text-slate-600"><span className="w-1.5 h-1.5 bg-success-500 rounded-full mt-1.5 flex-shrink-0"/>{s}</li>)}
              </ul>
            </div>
            <div className="card p-5">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-danger-500" /> Areas to Improve</h3>
              <ul className="space-y-2">
                {analysis.weaknesses?.map((w,i)=><li key={i} className="flex items-start gap-2 text-sm text-slate-600"><span className="w-1.5 h-1.5 bg-danger-500 rounded-full mt-1.5 flex-shrink-0"/>{w}</li>)}
              </ul>
            </div>
            <div className="card p-5">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-warning-500" /> Actionable Suggestions</h3>
              <ul className="space-y-2">
                {analysis.suggestions?.map((s,i)=><li key={i} className="flex items-start gap-2 text-sm text-slate-600"><span className="text-primary-600 font-bold flex-shrink-0 text-xs w-4">{i+1}.</span>{s}</li>)}
              </ul>
            </div>
            <div className="card p-5">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-purple-600" /> Skills to Learn</h3>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {analysis.missingSkills?.map(s=><span key={s} className="badge bg-purple-50 text-purple-700">{s}</span>)}
              </div>
              <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary-600" /> Recommended Roles</h3>
              <div className="flex flex-wrap gap-1.5">
                {analysis.recommendedRoles?.map(r=><span key={r} className="badge-primary">{r}</span>)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
