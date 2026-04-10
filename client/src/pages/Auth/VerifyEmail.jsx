import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authApi } from '../../api/services';
import { CheckCircle, XCircle, Loader, GraduationCap } from 'lucide-react';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  useEffect(() => {
    authApi.verifyEmail(token).then(() => setStatus('success')).catch(() => setStatus('error'));
  }, [token]);
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="card p-10 text-center max-w-md w-full animate-fade-in">
        <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <GraduationCap className="w-7 h-7 text-white" />
        </div>
        {status === 'loading' && <><Loader className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-4" /><p className="text-slate-500">Verifying your email…</p></>}
        {status === 'success' && (<>
          <CheckCircle className="w-12 h-12 text-success-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Email Verified!</h2>
          <p className="text-slate-500 mb-6">Your account is now active. You can sign in.</p>
          <Link to="/login" className="btn-primary">Go to Login</Link>
        </>)}
        {status === 'error' && (<>
          <XCircle className="w-12 h-12 text-danger-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Verification Failed</h2>
          <p className="text-slate-500 mb-6">This link is invalid or has expired.</p>
          <Link to="/login" className="btn-primary">Back to Login</Link>
        </>)}
      </div>
    </div>
  );
}
