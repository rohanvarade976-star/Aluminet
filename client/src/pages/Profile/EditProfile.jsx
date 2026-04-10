import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../api/services';
import useAuthStore from '../../store/authStore';
import { Camera, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EditProfile() {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const fileRef = useRef();
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [form, setForm] = useState({
    name:           user?.name || '',
    bio:            user?.bio || '',
    department:     user?.department || '',
    graduationYear: user?.graduationYear || '',
    currentRole:    user?.currentRole || '',
    currentCompany: user?.currentCompany || '',
    location:       user?.location || '',
    linkedIn:       user?.linkedIn || '',
    github:         user?.github || '',
    skills:         (user?.skills || []).join(', '),
    interests:      (user?.interests || []).join(', '),
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    setAvatarLoading(true);
    try {
      const { data } = await userApi.uploadAvatar(formData);
      updateUser({ avatar: data.avatarUrl });
      toast.success('Avatar updated!');
    } catch { toast.error('Upload failed'); }
    finally { setAvatarLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        interests: form.interests.split(',').map(s => s.trim()).filter(Boolean),
        graduationYear: form.graduationYear ? Number(form.graduationYear) : undefined,
      };
      const { data } = await userApi.updateProfile(payload);
      updateUser(data.user);
      toast.success('Profile updated!');
      navigate(`/profile/${user._id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
        <p className="text-gray-500 mt-1">Keep your profile updated to get better mentor matches</p>
      </div>

      {/* Avatar */}
      <div className="card p-5 mb-5 flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center overflow-hidden">
            {user?.avatar
              ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              : <span className="text-primary-700 font-bold text-2xl">{user?.name?.[0]}</span>}
          </div>
          <button onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-md hover:bg-primary-700 transition-all">
            <Camera className="w-3.5 h-3.5" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div>
          <p className="font-medium text-gray-800">{user?.name}</p>
          <p className="text-sm text-gray-500 mt-0.5 capitalize">{user?.role}</p>
          {avatarLoading && <p className="text-xs text-primary-600 mt-1">Uploading…</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {/* Basic info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input required className="input" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input className="input" placeholder="Computer Engineering" value={form.department} onChange={e => set('department', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
            <input type="number" className="input" placeholder="2025" min={2000} max={2035}
              value={form.graduationYear} onChange={e => set('graduationYear', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea className="input resize-none" rows={3} maxLength={500}
            placeholder="Tell mentors and students a bit about yourself…"
            value={form.bio} onChange={e => set('bio', e.target.value)} />
          <p className="text-xs text-gray-400 text-right mt-0.5">{form.bio.length}/500</p>
        </div>

        {user?.role === 'alumni' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Role</label>
              <input className="input" placeholder="Software Engineer" value={form.currentRole} onChange={e => set('currentRole', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input className="input" placeholder="Google" value={form.currentCompany} onChange={e => set('currentCompany', e.target.value)} />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input className="input" placeholder="Bangalore, India" value={form.location} onChange={e => set('location', e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Skills <span className="text-gray-400 font-normal">(comma separated)</span>
          </label>
          <input className="input" placeholder="React, Node.js, Python, Machine Learning"
            value={form.skills} onChange={e => set('skills', e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Interests <span className="text-gray-400 font-normal">(comma separated)</span>
          </label>
          <input className="input" placeholder="Web Development, AI, Startups, Open Source"
            value={form.interests} onChange={e => set('interests', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
            <input type="url" className="input" placeholder="https://linkedin.com/in/username"
              value={form.linkedIn} onChange={e => set('linkedIn', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
            <input type="url" className="input" placeholder="https://github.com/username"
              value={form.github} onChange={e => set('github', e.target.value)} />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1 flex items-center justify-center gap-2">
            <X className="w-4 h-4" /> Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
