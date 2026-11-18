import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Shield, Clock, FileText, Users } from 'lucide-react';
import api from '../../api/axiosInstance';
import PageHeader from '../../components/common/PageHeader';
import TabBar from '../../components/common/TabBar';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

// Documents are private: a plain link can't send the auth token, so fetch the file
// with the token and open it as a blob URL in a new tab.
async function openDocument(verifId, field) {
  // Open the tab synchronously (inside the click) so popup blockers allow it
  const tab = window.open('', '_blank');
  if (tab) tab.opener = null;
  try {
    const { data } = await api.get(`/verification/${verifId}/file/${field}`, { responseType: 'blob' });
    const url = URL.createObjectURL(data);
    if (tab) tab.location.href = url;
    else window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 5 * 60 * 1000);
  } catch {
    if (tab) tab.close();
    toast.error('Could not open document');
  }
}

function ReviewModal({ verif, onClose, onDone }) {
  const [status, setStatus] = useState('approved');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    setLoading(true);
    try {
      await api.put(`/verification/${verif._id}/review`, { status, reviewNote: note });
      toast.success(`Request ${status}`);
      onDone();
    } catch {
      toast.error('Failed');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="modal-overlay">
      <div className="modal-panel max-w-md w-full">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Review Verification</h3>
        <div className="p-4 rounded-xl mb-4 border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
          <p className="font-semibold text-slate-900 dark:text-white">{verif.user?.name}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">{verif.user?.email} · <span className="capitalize">{verif.user?.role}</span></p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Submitted {format(new Date(verif.createdAt), 'MMM d, yyyy h:mm a')}</p>
        </div>
        <div className="space-y-2 mb-4">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Documents</p>
          {verif.collegeIdUrl && (
            <button type="button" onClick={() => openDocument(verif._id, 'collegeId')} className="flex items-center gap-2 text-sm text-violet-600 dark:text-violet-400 hover:underline font-medium">
              <FileText className="w-4 h-4 flex-shrink-0" /> College ID Card
            </button>
          )}
          {verif.degreeUrl && (
            <button type="button" onClick={() => openDocument(verif._id, 'degree')} className="flex items-center gap-2 text-sm text-violet-600 dark:text-violet-400 hover:underline font-medium">
              <FileText className="w-4 h-4 flex-shrink-0" /> Degree Certificate
            </button>
          )}
          {verif.offerLetterUrl && (
            <button type="button" onClick={() => openDocument(verif._id, 'offerLetter')} className="flex items-center gap-2 text-sm text-violet-600 dark:text-violet-400 hover:underline font-medium">
              <FileText className="w-4 h-4 flex-shrink-0" /> Offer Letter
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {['approved', 'rejected'].map(s => (
            <button key={s} type="button" onClick={() => setStatus(s)}
              className={`py-2.5 rounded-xl text-sm font-semibold capitalize border-2 transition-all ${
                status === s
                  ? (s === 'approved'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-200'
                    : 'border-rose-500 bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-200')
                  : 'border-slate-200 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/25'
              }`}>
              {s === 'approved' ? 'Approve' : 'Reject'}
            </button>
          ))}
        </div>
        {status === 'rejected' && (
          <textarea className="input resize-none mb-4" rows={2} placeholder="Reason for rejection (optional)..."
            value={note} onChange={e => setNote(e.target.value)} />
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="button" onClick={submit} disabled={loading}
            className={`flex-1 font-semibold py-2.5 rounded-xl transition-all ${
              status === 'approved' ? 'btn-primary' : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}>
            {loading ? 'Submitting…' : 'Confirm'}
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

  const fetch = (s) => {
    setLoading(true);
    api.get(`/verification/all?status=${s}`)
      .then(r => setVerifs(r.data.verifs || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(tab); }, [tab]);

  const tabs = [
    { key: 'pending', label: 'Pending', icon: Clock },
    { key: 'approved', label: 'Approved', icon: CheckCircle },
    { key: 'rejected', label: 'Rejected', icon: XCircle },
  ];

  return (
    <div className="page-container max-w-5xl animate-fade-in">
      <PageHeader
        title="Verification Queue"
        subtitle="Review and approve user verification requests"
        icon={Shield}
        breadcrumb={[
          { label: 'Admin', to: '/dashboard' },
          { label: 'Verifications' },
        ]}
      />

      <TabBar tabs={tabs} active={tab} onChange={setTab} />

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : verifs.length === 0 ? (
        <div className="card-glass p-14 text-center">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="font-semibold text-slate-600 dark:text-slate-300">No {tab} requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {verifs.map(v => (
            <div key={v._id} className="card-glass p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-slate-200 dark:ring-white/10">
                  {v.user?.avatar
                    ? <img src={v.user.avatar} alt="" className="w-full h-full object-cover" />
                    : <span className="text-violet-700 dark:text-violet-200 font-bold text-lg">{v.user?.name?.[0]}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-900 dark:text-white">{v.user?.name}</p>
                    <span className={`badge capitalize ${v.user?.role === 'alumni' ? 'badge-violet' : 'badge-primary'}`}>
                      {v.user?.role}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 truncate">{v.user?.email}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                    {v.collegeIdUrl && <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">ID Card</span>}
                    {v.degreeUrl && <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Degree</span>}
                    {v.offerLetterUrl && <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Offer</span>}
                    <span className="text-xs text-slate-500 dark:text-slate-400">{format(new Date(v.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
              <div className="flex sm:flex-col items-stretch sm:items-end gap-2 flex-shrink-0 sm:min-w-[120px]">
                {tab === 'pending' ? (
                  <button type="button" onClick={() => setSelected(v)} className="btn-primary text-sm w-full sm:w-auto justify-center">
                    <Eye className="w-4 h-4" /> Review
                  </button>
                ) : (
                  <span className={`badge capitalize justify-center ${tab === 'approved' ? 'badge-success' : 'badge-danger'}`}>{tab}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <ReviewModal
          verif={selected}
          onClose={() => setSelected(null)}
          onDone={() => { setSelected(null); fetch(tab); }}
        />
      )}
    </div>
  );
}
