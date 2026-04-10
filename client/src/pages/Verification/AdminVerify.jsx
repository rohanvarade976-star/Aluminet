import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Shield, Clock, FileText, Users } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

function ReviewModal({ verif, onClose, onDone }) {
  const [status, setStatus] = useState('approved');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    setLoading(true);
    try { await api.put(`/verification/${verif._id}/review`, { status, reviewNote: note }); toast.success(`Request ${status}`); onDone(); }
    catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card p-6 w-full max-w-md animate-scale-in shadow-xl">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Review Verification Request</h3>
        <div className="p-4 bg-slate-50 rounded-xl mb-4 border border-slate-100">
          <p className="font-semibold text-slate-900">{verif.user?.name}</p>
          <p className="text-sm text-slate-500">{verif.user?.email} · <span className="capitalize">{verif.user?.role}</span></p>
          <p className="text-xs text-slate-400 mt-1">Submitted {format(new Date(verif.createdAt), 'MMM d, yyyy h:mm a')}</p>
        </div>
        <div className="space-y-2 mb-4">
          <p className="text-sm font-semibold text-slate-600 mb-2">Uploaded Documents</p>
          {verif.collegeIdUrl && <a href={`http://localhost:5000${verif.collegeIdUrl}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary-600 hover:underline"><FileText className="w-4 h-4" /> College ID Card</a>}
          {verif.degreeUrl && <a href={`http://localhost:5000${verif.degreeUrl}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary-600 hover:underline"><FileText className="w-4 h-4" /> Degree Certificate</a>}
          {verif.offerLetterUrl && <a href={`http://localhost:5000${verif.offerLetterUrl}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary-600 hover:underline"><FileText className="w-4 h-4" /> Offer Letter</a>}
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {['approved','rejected'].map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`py-2.5 rounded-xl text-sm font-semibold capitalize border-2 transition-all ${status === s ? (s==='approved' ? 'border-success-500 bg-success-50 text-success-700' : 'border-danger-500 bg-danger-50 text-danger-700') : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
              {s === 'approved' ? '✅ Approve' : '❌ Reject'}
            </button>
          ))}
        </div>
        {status === 'rejected' && (
          <textarea className="input resize-none mb-4" rows={2} placeholder="Reason for rejection (sent to user via email)..."
            value={note} onChange={e=>setNote(e.target.value)} />
        )}
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={submit} disabled={loading} className={`flex-1 font-semibold py-2.5 rounded-xl transition-all ${status==='approved' ? 'bg-success-600 hover:bg-success-700 text-white' : 'bg-danger-600 hover:bg-danger-700 text-white'}`}>
            {loading ? 'Submitting…' : 'Confirm Decision'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminVerify() {
  const [verifs, setVerifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [selected, setSelected] = useState(null);

  const fetch = (s) => { setLoading(true); api.get(`/verification/all?status=${s}`).then(r=>setVerifs(r.data.verifs||[])).finally(()=>setLoading(false)); };
  useEffect(() => { fetch(tab); }, [tab]);

  const tabs = [
    { key: 'pending',  label: 'Pending',  icon: Clock },
    { key: 'approved', label: 'Approved', icon: CheckCircle },
    { key: 'rejected', label: 'Rejected', icon: XCircle },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2"><Shield className="w-6 h-6 text-primary-600" /> Verification Queue</h1>
        <p className="page-subtitle">Review and approve user verification requests</p>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${tab===key ? 'bg-primary-600 text-white border-primary-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="skeleton h-20 rounded-2xl"/>)}</div>
      ) : verifs.length === 0 ? (
        <div className="card p-14 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-500">No {tab} requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {verifs.map(v => (
            <div key={v._id} className="card-hover p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                {v.user?.avatar ? <img src={v.user.avatar} alt="" className="w-full h-full object-cover" /> : <span className="text-primary-700 font-bold text-lg">{v.user?.name?.[0]}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-slate-900">{v.user?.name}</p>
                  <span className={`badge capitalize ${v.user?.role==='alumni' ? 'bg-purple-50 text-purple-700' : 'badge-primary'}`}>{v.user?.role}</span>
                </div>
                <p className="text-sm text-slate-500">{v.user?.email}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  {v.collegeIdUrl && <span className="text-xs text-success-600 font-medium">✓ ID Card</span>}
                  {v.degreeUrl && <span className="text-xs text-success-600 font-medium">✓ Degree</span>}
                  {v.offerLetterUrl && <span className="text-xs text-success-600 font-medium">✓ Offer Letter</span>}
                  <span className="text-xs text-slate-400">{format(new Date(v.createdAt), 'MMM d, yyyy')}</span>
                </div>
              </div>
              {tab === 'pending'
                ? <button onClick={()=>setSelected(v)} className="btn-primary text-sm"><Eye className="w-4 h-4" /> Review</button>
                : <span className={`badge ${tab==='approved' ? 'badge-success' : 'badge-danger'} capitalize`}>{tab}</span>
              }
            </div>
          ))}
        </div>
      )}
      {selected && <ReviewModal verif={selected} onClose={()=>setSelected(null)} onDone={()=>{setSelected(null);fetch(tab);}} />}
    </div>
  );
}
