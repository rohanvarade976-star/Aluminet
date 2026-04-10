import { create } from 'zustand';
import { io } from 'socket.io-client';

const useSocketStore = create((set, get) => ({
  socket: null,
  onlineUsers: [],
  connected: false,

  connect: (token) => {
    const existing = get().socket;
    if (existing?.connected) return;
    const socket = io('/', { auth: { token }, transports: ['websocket'] });
    socket.on('connect', () => set({ connected: true }));
    socket.on('disconnect', () => set({ connected: false }));
    socket.on('online_users', (users) => set({ onlineUsers: users }));
    set({ socket });
  },

  disconnect: () => {
    get().socket?.disconnect();
    set({ socket: null, connected: false, onlineUsers: [] });
  },

  joinRoom: (room) => get().socket?.emit('join_room', room),
  leaveRoom: (room) => get().socket?.emit('leave_room', room),
  sendMessage: (payload) => get().socket?.emit('send_message', payload),
  sendTyping: (room, isTyping) => get().socket?.emit('typing', { room, isTyping }),
}));

export default useSocketStore;
