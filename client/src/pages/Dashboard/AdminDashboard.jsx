import { useEffect, useState } from 'react';
import { adminApi } from '../../api/services';
import StatCard from '../../components/common/StatCard';
import Spinner from '../../components/common/Spinner';
import { Users, GraduationCap, Calendar, BookOpen, ShieldAlert, UserCheck, Shield, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [fraudLogs, setFraudLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.getStats().then(r => setData(r.data)),
      adminApi.getUsers({ limit: 8 }).then(r => setUsers(r.data.users || [])),
      adminApi.getFraudLogs().then(r => setFraudLogs(r.data.logs || [])),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner full />;

  const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const chartData = (data?.monthlySignups || []).map(m => ({
    name: monthLabels[m._id.month - 1],
    signups: m.count
  }));

  const handleToggle = async (userId, isActive) => {
    try {
      await adminApi.updateUser(userId, { isActive: !isActive });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !isActive } : u));
      toast.success('User updated');
    } catch { toast.error('Failed'); }
  };

  const handleResolveFraud = async (logId) => {
    try {
      await adminApi.resolveFraud(logId);
      setFraudLogs(prev => prev.filter(l => l._id !== logId));
      toast.success('Resolved');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Platform overview and management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-7">
        <StatCard icon={Users}       label="Total Users"  value={data?.stats?.totalUsers || 0}  color="primary" />
        <StatCard icon={UserCheck}   label="Students"     value={data?.stats?.students || 0}    color="blue" />
        <StatCard icon={GraduationCap} label="Alumni"     value={data?.stats?.alumni || 0}      color="purple" />
        <StatCard icon={Calendar}    label="Events"       value={data?.stats?.events || 0}       color="green" />
        <StatCard icon={BookOpen}    label="Sessions"     value={data?.stats?.sessions || 0}     color="amber" />
        <StatCard icon={ShieldAlert} label="Fraud Alerts" value={data?.stats?.pendingFraud || 0} color="red" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        {/* Signup Chart */}
        <div className="lg:col-span-2 card p-5">
          <h2 className="section-title">Monthly Signups</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: 13 }} />
                <Bar dataKey="signups" fill="#4f46e5" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center">
              <p className="text-slate-400 text-sm">No signup data yet</p>
            </div>
          )}
        </div>

        {/* Fraud Alerts */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-danger-500" /> Fraud Alerts
            </h2>
            <Link to="/admin/verify" className="text-xs text-primary-600 font-medium hover:underline">Verifications →</Link>
          </div>
          {fraudLogs.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-10 h-10 text-success-400 mx-auto mb-2" />
              <p className="text-sm text-slate-400 font-medium">All clear! No active alerts</p>
            </div>
          ) : fraudLogs.slice(0,5).map(log => (
            <div key={log._id} className="flex items-start gap-3 p-3 bg-danger-50 rounded-xl border border-danger-100 mb-2 last:mb-0">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-danger-800">{log.user?.name || 'Unknown user'}</p>
                <p className="text-xs text-danger-600 truncate mt-0.5">{log.reason}</p>
                <p className="text-xs text-danger-400 mt-0.5">Score: {log.score}</p>
              </div>
              <button onClick={() => handleResolveFraud(log._id)}
                className="text-xs bg-danger-600 text-white px-2 py-1 rounded-lg hover:bg-danger-700 flex-shrink-0 transition-all">
                Resolve
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">Recent Users</h2>
          <span className="text-xs text-slate-400">{data?.stats?.totalUsers || 0} total users</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-100">
                <th className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">User</th>
                <th className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Role</th>
                <th className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Verified</th>
                <th className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
                <th className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-slate-50 transition-all">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                          : <span className="text-primary-700 font-bold text-xs">{u.name?.[0]}</span>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{u.name}</p>
                        <p className="text-xs text-slate-400 truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`badge capitalize ${
                      u.role==='admin' ? 'bg-red-50 text-red-700'
                      : u.role==='alumni' ? 'bg-purple-50 text-purple-700'
                      : 'badge-primary'}`}>{u.role}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`badge ${u.isVerified ? 'badge-success' : 'badge-warning'}`}>
                      {u.isVerified ? '✓ Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3">
                    <button onClick={() => handleToggle(u._id, u.isActive)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                        u.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
