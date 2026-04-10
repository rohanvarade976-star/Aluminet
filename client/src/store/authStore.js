import { create } from 'zustand';
import { authApi } from '../api/services';

const useAuthStore = create((set) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken') || null,
  loading: false,

  init: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return set({ loading: false, user: null });
    try {
      const { data } = await authApi.getMe();
      set({ user: data.user, accessToken: token, loading: false });
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, accessToken: null, loading: false });
    }
  },

  login: async (email, password) => {
    try {
      const { data } = await authApi.login({ email, password });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      set({ user: data.user, accessToken: data.accessToken, loading: false });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Login failed' };
    }
  },

  register: async (formData) => {
    try {
      const { data } = await authApi.register(formData);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      set({ user: data.user, accessToken: data.accessToken, loading: false });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Registration failed' };
    }
  },

  logout: async () => {
    try { await authApi.logout(); } catch {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, accessToken: null, loading: false });
  },

  updateUser: (updates) => set(s => ({ user: { ...s.user, ...updates } })),
}));

export default useAuthStore;
