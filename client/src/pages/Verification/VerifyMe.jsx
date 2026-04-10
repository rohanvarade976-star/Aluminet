import { useState, useEffect } from 'react';
import { CheckCircle, Upload, Clock, XCircle, Shield, AlertTriangle, FileCheck } from 'lucide-react';
import api from '../../api/axiosInstance';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function VerifyMe() {
  const { user } = useAuthStore();
  const [verif, setVerif] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState({});

  useEffect(() => { api.get('/verification/me').then(r=>setVerif(r.data.verif)).finally(()=>setLoading(false)); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData();
    Object.entries(files).forEach(([k,v]) => form.append(k,v));
    try {
      const { data } = await api.post('/verification/submit', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setVerif(data.verif);
      toast.success('Documents submitted! Admin will review within 24-48 hours.');
    } catch (err) { toast.error(err.response?.data?.error || 'Submission failed'); }
    finally { setSubmitting(false); }
  };

  const FileUpload = ({ name, label, required }) => (
    <div>
      <label className="label">{label}{required && <span className="text-danger-500 ml-0.5">*</span>}</label>
      <div className={`relative border-2 border-dashed rounded-xl p-4 transition-all cursor-pointer ${files[name] ? 'border-success-400 bg-success-50' : 'border-slate-200 hover:border-primary-300 hover:bg-primary-50/30'}`}>
        <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={e => setFiles(f => ({ ...f, [name]: e.target.files[0] }))} />
        <div className="flex items-center gap-3">
          {files[name] ? <FileCheck className="w-5 h-5 text-success-600 flex-shrink-0" /> : <Upload className="w-5 h-5 text-slate-400 flex-shrink-0" />}
          <div>
            <p className={`text-sm font-medium ${files[name] ? 'text-success-700' : 'text-slate-600'}`}>{files[name] ? files[name].name : 'Click to upload or drag here'}</p>
            <p className="text-xs text-slate-400 mt-0.5">PDF, JPG, PNG · Max 10MB</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="skeleton h-8 w-48 mb-4 rounded-xl" />
      <div className="skeleton h-32 rounded-2xl mb-4" />
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  );

  const status = verif?.status || 'none';
  const statusConfig = {
    none:     { icon: Shield,       color: 'bg-slate-50 border-slate-200',   iconColor: 'text-slate-400',   title: 'Not submitted yet',   desc: 'Submit your documents to get verified' },
    pending:  { icon: Clock,        color: 'bg-blue-50 border-blue-200',     iconColor: 'text-blue-500',    title: 'Under Review',        desc: 'Admin is reviewing your documents (24-48 hours)' },
    approved: { icon: CheckCircle,  color: 'bg-success-50 border-success-200', iconColor: 'text-success-600', title: 'Verified Account ✅', desc: 'You have full access to all AlumiNet features' },
    rejected: { icon: XCircle,      color: 'bg-danger-50 border-danger-200',  iconColor: 'text-danger-600',  title: 'Verification Rejected', desc: verif?.reviewNote || 'Please resubmit with correct documents' },
  };
  const sc = statusConfig[status];

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2"><Shield className="w-6 h-6 text-primary-600" /> Account Verification</h1>
        <p className="page-subtitle">Verify your identity to unlock all platform features</p>
      </div>

      {/* Status */}
      <div className={`card p-5 mb-6 border-2 ${sc.color}`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${sc.color} flex-shrink-0`}>
            <sc.icon className={`w-6 h-6 ${sc.iconColor}`} />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-lg">{sc.title}</p>
            <p className="text-slate-500 text-sm mt-0.5">{sc.desc}</p>
          </div>
        </div>
      </div>

      {/* Benefits */}
      {status === 'none' && (
        <div className="card p-5 mb-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-warning-500" /> Why verify your account?</h3>
          <div className="grid grid-cols-2 gap-3">
            {['Access all mentorship features','Post in the forum','RSVP to events','Get AI mentor matches','Verified badge on profile','Direct messaging with alumni'].map(b => (
              <div key={b} className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />{b}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload form */}
      {(status === 'none' || status === 'rejected') && (
        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
          <h3 className="section-title">{user?.role === 'student' ? '📎 Upload Student ID Card' : '📎 Upload Verification Documents'}</h3>
          {user?.role === 'student' && <FileUpload name="collegeId" label="College ID Card" required />}
          {user?.role === 'alumni' && (<>
            <FileUpload name="degree" label="Degree Certificate" required />
            <FileUpload name="offerLetter" label="Offer Letter or Employment Proof (optional)" />
          </>)}
          <button type="submit" disabled={submitting || Object.keys(files).length === 0} className="btn-primary w-full py-3">
            {submitting ? 'Submitting…' : 'Submit for Verification'}
          </button>
          <p className="text-xs text-slate-400 text-center">Documents are reviewed within 24-48 hours. Files are securely stored.</p>
        </form>
      )}
    </div>
  );
}
