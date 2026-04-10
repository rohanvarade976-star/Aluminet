import { useEffect, useState } from 'react';
import { achievementApi } from '../../api/services';
import useAuthStore from '../../store/authStore';
import Spinner from '../../components/common/Spinner';
import { Trophy, Star, Award, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

const ALL_ACHIEVEMENTS = [
  { type:'first_login',      icon:'👋', title:'First Steps',       description:'Logged into AlumiNet for the first time', points:10 },
  { type:'profile_complete', icon:'✨', title:'Profile Pro',        description:'Completed your profile with all details', points:25 },
  { type:'first_session',    icon:'🎯', title:'First Session',      description:'Booked your first mentorship session',   points:30 },
  { type:'five_sessions',    icon:'🏆', title:'Mentorship Seeker',  description:'Completed 5 mentorship sessions',        points:100 },
  { type:'verified',         icon:'✅', title:'Verified Member',    description:'Got your account verified by admin',     points:50 },
  { type:'first_post',       icon:'💬', title:'Forum Voice',        description:'Posted your first forum discussion',     points:20 },
  { type:'helpful_member',   icon:'⭐', title:'Helpful Member',     description:'Received 10 upvotes on your posts',     points:75 },
  { type:'event_host',       icon:'🎤', title:'Event Host',         description:'Hosted your first webinar or talk',     points:60 },
  { type:'study_leader',     icon:'📚', title:'Study Leader',       description:'Created a study group with 5+ members', points:40 },
];

export default function AchievementsPage() {
  const { user } = useAuthStore();
  const [achievements, setAchievements] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      achievementApi.getUserAchievements(user._id).then(r => {
        setAchievements(r.data.achievements || []);
        setTotalPoints(r.data.totalPoints || 0);
      }),
      achievementApi.getLeaderboard().then(r => setLeaderboard(r.data.leaderboard || [])),
    ]).finally(() => setLoading(false));
  }, [user._id]);

  if (loading) return <Spinner full />;

  const earned = new Set(achievements.map(a => a.type));
  const myRank = leaderboard.findIndex(u => u._id === user._id) + 1;

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="page-title flex items-center gap-2"><Trophy className="w-6 h-6 text-amber-500" /> Achievements</h1>
        <p className="page-subtitle">Track your progress and earn badges for your activity</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-7">
        <div className="card p-5 text-center border-amber-100">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <Star className="w-6 h-6 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{totalPoints}</p>
          <p className="text-sm text-slate-500 mt-0.5">Total Points</p>
        </div>
        <div className="card p-5 text-center border-primary-100">
          <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <Award className="w-6 h-6 text-primary-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{achievements.length}</p>
          <p className="text-sm text-slate-500 mt-0.5">Badges Earned</p>
        </div>
        <div className="card p-5 text-center border-green-100">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{myRank > 0 ? `#${myRank}` : '—'}</p>
          <p className="text-sm text-slate-500 mt-0.5">Leaderboard Rank</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Badges */}
        <div className="lg:col-span-2">
          <h2 className="section-title">All Badges</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {ALL_ACHIEVEMENTS.map(def => {
              const isEarned = earned.has(def.type);
              const earnedData = achievements.find(a => a.type === def.type);
              return (
                <div key={def.type} className={`card p-4 flex items-start gap-3 transition-all ${isEarned ? 'border-amber-200 bg-amber-50/30' : 'opacity-60 grayscale'}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${isEarned ? 'bg-amber-50 border border-amber-200' : 'bg-slate-100'}`}>
                    {def.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 text-sm">{def.title}</p>
                      {isEarned && <span className="badge bg-amber-100 text-amber-700 text-xs">+{def.points}pts</span>}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{def.description}</p>
                    {earnedData && (
                      <p className="text-xs text-amber-600 font-medium mt-1">Earned {format(new Date(earnedData.earnedAt), 'MMM d, yyyy')}</p>
                    )}
                    {!isEarned && <p className="text-xs text-slate-400 mt-1">Not yet earned · {def.points} pts</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leaderboard */}
        <div>
          <h2 className="section-title">Leaderboard 🏆</h2>
          <div className="card p-4">
            {leaderboard.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No rankings yet</p>
            ) : leaderboard.map((u, i) => (
              <div key={u._id} className={`flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0 ${u._id === user._id ? 'bg-primary-50 -mx-2 px-2 rounded-xl' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-100 text-slate-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-400'}`}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}`}
                </div>
                <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : <span className="text-primary-700 font-bold text-xs">{u.name?.[0]}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{u.name}</p>
                  <p className="text-xs text-slate-400 capitalize">{u.role}</p>
                </div>
                <span className="text-sm font-bold text-amber-600">{u.points}pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
