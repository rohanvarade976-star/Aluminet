import { useEffect, useState } from 'react';
import { achievementApi } from '../../api/services';
import useAuthStore from '../../store/authStore';
import { Trophy, Star, TrendingUp, Zap, Target, Medal, Crown } from 'lucide-react';

const calculateLevel = (points) => {
  if (points < 100) return { level: 1, next: 100, title: 'Novice' };
  if (points < 300) return { level: 2, next: 300, title: 'Contributor' };
  if (points < 600) return { level: 3, next: 600, title: 'Active Member' };
  if (points < 1000) return { level: 4, next: 1000, title: 'Expert' };
  return { level: 5, next: 2000, title: 'Master Alumni' };
};
const ALL_ACHIEVEMENTS = [
  { type: 'first_login',      icon: '👋', title: 'First Steps',       description: 'Logged in for the first time',         points: 10  },
  { type: 'profile_complete', icon: '✨', title: 'Profile Pro',        description: 'Completed your full profile',           points: 25  },
  { type: 'first_post',       icon: '💬', title: 'Forum Voice',        description: 'Posted your first forum discussion',    points: 20  },
  { type: 'first_session',    icon: '🎯', title: 'First Session',      description: 'Booked your first mentorship session',  points: 30  },
  { type: 'verified',         icon: '✅', title: 'Verified Member',    description: 'Got your account verified by admin',    points: 50  },
  { type: 'helpful_member',   icon: '⭐', title: 'Helpful Member',     description: 'Received 10 upvotes on your posts',     points: 75  },
  { type: 'five_sessions',    icon: '🏆', title: 'Mentorship Seeker',  description: 'Completed 5 mentorship sessions',       points: 100 },
  { type: 'event_host',       icon: '🎤', title: 'Event Host',         description: 'Hosted your first webinar or talk',     points: 60  },
  { type: 'study_leader',     icon: '📚', title: 'Study Leader',       description: 'Led a study group with 5+ members',     points: 40  },
];

export default function AchievementsPage() {
  const { user } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState([]);
  const [myAchievements, setMyAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    achievementApi.getLeaderboard()
      .then(r => setLeaderboard(r.data.leaderboard || []))
      .catch(() => {})
      .finally(() => setLoading(false));

    if (user?._id) {
      achievementApi.getUserAchievements(user._id)
        .then(r => setMyAchievements(r.data.achievements || []))
        .catch(() => {});
    }
  }, [user?._id]);

  const userStats = calculateLevel(user?.points || 0);
  const progressPercent = Math.min(100, ((user?.points || 0) / userStats.next) * 100);

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <Trophy className="w-8 h-8 text-amber-500" /> Achievements & Rankings
        </h1>
        <p className="page-subtitle">Track your engagement and see how you stack up against the community.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* ── Left Column: User Stats ── */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card-glass relative overflow-hidden p-6"
               style={{ background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(124, 58, 237, 0.1))' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl" />
            
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-glow">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-primary-600 dark:text-primary-400">Level {userStats.level}</p>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white">{userStats.title}</h2>
              </div>
            </div>

            <div className="relative z-10">
              <div className="flex justify-between text-sm font-bold mb-2">
                <span className="text-slate-700 dark:text-slate-300">{user?.points || 0} XP</span>
                <span className="text-slate-500 dark:text-slate-400">{userStats.next} XP</span>
              </div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary-500 to-violet-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 text-center font-medium">
                Earn {userStats.next - (user?.points || 0)} more XP to reach the next level!
              </p>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
              <Medal className="w-4 h-4 text-primary-500" /> How to earn points?
            </h3>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-center justify-between">
                <span>Start a forum discussion</span>
                <span className="font-bold text-green-500">+10 XP</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Reply to a post</span>
                <span className="font-bold text-green-500">+5 XP</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Attend a mentor session</span>
                <span className="font-bold text-green-500">+20 XP</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Get your account verified</span>
                <span className="font-bold text-green-500">+50 XP</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Right Column: Leaderboard ── */}
        <div className="lg:col-span-2">
          <h2 className="font-bold text-slate-800 dark:text-white text-xl mb-4">My Achievements</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {ALL_ACHIEVEMENTS.map(def => {
              const earned = myAchievements.find(a => a.type === def.type);
              return (
                <div key={def.type}
                  className={`card p-4 text-center transition-all ${earned ? 'border-amber-200 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/10' : 'opacity-40 grayscale'}`}>
                  <div className="text-3xl mb-2">{def.icon}</div>
                  <p className={`font-bold text-sm ${earned ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{def.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{def.description}</p>
                  <p className={`text-xs font-bold mt-2 ${earned ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
                    {earned ? `+${def.points} XP earned` : `${def.points} XP`}
                  </p>
                  {earned && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(earned.earnedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="card p-0 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-lg">
                <Target className="w-5 h-5 text-red-500" /> Global Leaderboard
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Top 10 most engaged members on AlumiNet</p>
            </div>

            {loading ? (
              <div className="p-10 text-center text-slate-500 dark:text-slate-400">Loading rankings...</div>
            ) : leaderboard.length === 0 ? (
              <div className="p-10 text-center text-slate-500 dark:text-slate-400">No data available yet.</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {leaderboard.map((u, i) => {
                  const isTop3 = i < 3;
                  const rankColors = [
                    'text-amber-500 bg-amber-100 dark:bg-amber-500/20 ring-amber-200 dark:ring-amber-500/30', // 1st
                    'text-slate-400 bg-slate-100 dark:bg-slate-500/20 ring-slate-200 dark:ring-slate-500/30', // 2nd
                    'text-amber-700 bg-amber-50 dark:bg-amber-700/20 ring-amber-100 dark:ring-amber-700/30'   // 3rd
                  ];
                  const rankStyle = isTop3 ? rankColors[i] : 'text-slate-500 dark:text-slate-400 bg-transparent';
                  const isMe = u._id === user?._id;

                  return (
                    <div key={u._id} 
                      className={`flex items-center gap-4 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30 ${isMe ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}>
                      
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ring-1 ${rankStyle}`}>
                        {i + 1}
                      </div>

                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0 ring-2 ring-white dark:ring-slate-800">
                        {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" alt="" /> : <span className="font-bold text-slate-500 dark:text-slate-300">{u.name[0]}</span>}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 dark:text-slate-100 truncate flex items-center gap-2">
                          {u.name} 
                          {isMe && <span className="badge-primary text-[10px] py-0 px-1.5 h-4">You</span>}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 capitalize truncate">{u.role}</p>
                      </div>

                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{u.points || 0}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
