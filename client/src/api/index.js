import api from './axiosInstance';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

export const userApi = {
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  search: (q, role) => api.get('/users/search', { params: { q, role } }),
};

export const mentorApi = {
  getAll: (params) => api.get('/mentors', { params }),
  getMatches: () => api.get('/mentors/matches'),
  getSessions: () => api.get('/mentors/sessions'),
  bookSession: (data) => api.post('/mentors/sessions', data),
  updateSession: (id, data) => api.put(`/mentors/sessions/${id}`, data),
};

export const eventApi = {
  getAll: (params) => api.get('/events', { params }),
  getOne: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  rsvp: (id) => api.post(`/events/${id}/rsvp`),
};

export const forumApi = {
  getAll: (params) => api.get('/forum', { params }),
  getOne: (id) => api.get(`/forum/${id}`),
  create: (data) => api.post('/forum', data),
  addReply: (id, content) => api.post(`/forum/${id}/replies`, { content }),
  upvote: (id) => api.post(`/forum/${id}/upvote`),
  delete: (id) => api.delete(`/forum/${id}`),
};

export const chatApi = {
  getRooms: () => api.get('/chat/rooms'),
  getMessages: (room, params) => api.get(`/chat/rooms/${room}`, { params }),
  deleteMessage: (id) => api.delete(`/chat/messages/${id}`),
};

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  getFraudLogs: () => api.get('/admin/fraud'),
  resolveFraud: (id) => api.put(`/admin/fraud/${id}/resolve`),
};
