import api from './axiosInstance';

export const authApi = {
  register: (d) => api.post('/auth/register', d),
  login: (d) => api.post('/auth/login', d),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

export const userApi = {
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (d) => api.put('/users/profile', d),
  uploadAvatar: (fd) => api.post('/users/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  search: (q, role) => api.get('/users/search', { params: { q, role } }),
};

export const mentorApi = {
  getAll: (p) => api.get('/mentors', { params: p }),
  getMatches: () => api.get('/mentors/matches'),
  getSessions: () => api.get('/mentors/sessions'),
  bookSession: (d) => api.post('/mentors/sessions', d),
  updateSession: (id, d) => api.put(`/mentors/sessions/${id}`, d),
};

export const eventApi = {
  getAll: (p) => api.get('/events', { params: p }),
  getOne: (id) => api.get(`/events/${id}`),
  create: (d) => api.post('/events', d),
  update: (id, d) => api.put(`/events/${id}`, d),
  delete: (id) => api.delete(`/events/${id}`),
  rsvp: (id) => api.post(`/events/${id}/rsvp`),
};

export const forumApi = {
  getPosts: (p) => api.get('/forum', { params: p }),
  getPost: (id) => api.get(`/forum/${id}`),
  createPost: (d) => api.post('/forum', d),
  addReply: (id, content) => api.post(`/forum/${id}/replies`, { content }),
  upvote: (id) => api.post(`/forum/${id}/upvote`),
  deletePost: (id) => api.delete(`/forum/${id}`),
};

export const chatApi = {
  getRooms: () => api.get('/chat/rooms'),
  getMessages: (room, p) => api.get(`/chat/rooms/${room}`, { params: p }),
  deleteMessage: (id) => api.delete(`/chat/messages/${id}`),
};

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (p) => api.get('/admin/users', { params: p }),
  updateUser: (id, d) => api.put(`/admin/users/${id}`, d),
  getFraudLogs: () => api.get('/admin/fraud'),
  resolveFraud: (id) => api.put(`/admin/fraud/${id}/resolve`),
};

export const verificationApi = {
  getMyStatus: () => api.get('/verification/me'),
  submit: (fd) => api.post('/verification/submit', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: (status) => api.get(`/verification/all?status=${status}`),
  review: (id, d) => api.put(`/verification/${id}/review`, d),
};

export const aiApi = {
  chat: (message, history) => api.post('/ai/chat', { message, history }),
  analyzeResume: (fd) => api.post('/ai/resume/analyze', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getResumeAnalysis: () => api.get('/ai/resume'),
  getJobRecs: () => api.get('/ai/jobs'),
  getForumSuggestion: (postId) => api.get(`/ai/forum/${postId}/suggest`),
  getSkillGap: (targetRole) => api.get('/ai/skill-gap', { params: { targetRole } }),
  getInterviewQuestions: (role, level) => api.get('/ai/interview-questions', { params: { role, level } }),
};

export const notificationApi = {
  getAll: (p) => api.get('/notifications', { params: p }),
  markAllRead: () => api.put('/notifications/read-all'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const jobsApi = {
  getAll: (p) => api.get('/jobs', { params: p }),
  getOne: (id) => api.get(`/jobs/${id}`),
  create: (d) => api.post('/jobs', d),
  apply: (id) => api.post(`/jobs/${id}/apply`),
  save: (id) => api.post(`/jobs/${id}/save`),
  delete: (id) => api.delete(`/jobs/${id}`),
};

export const studyGroupApi = {
  getAll: (p) => api.get('/study-groups', { params: p }),
  getMine: () => api.get('/study-groups/mine'),
  getOne: (id) => api.get(`/study-groups/${id}`),
  create: (d) => api.post('/study-groups', d),
  join: (id) => api.post(`/study-groups/${id}/join`),
  sendMessage: (id, content) => api.post(`/study-groups/${id}/messages`, { content }),
};

export const achievementApi = {
  getUserAchievements: (userId) => api.get(`/achievements/${userId}`),
  getLeaderboard: () => api.get('/achievements/leaderboard'),
};
