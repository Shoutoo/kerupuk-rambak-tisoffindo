import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import {
  Users,
  UserPlus,
  Shield,
  UserCheck,
  Power,
  Edit,
  Clock,
  Activity,
  CheckCircle,
  XCircle,
  X,
  Phone,
  Mail,
} from 'lucide-react';

export const UsersView: React.FC = () => {
  const { users, addUser, updateUser, toggleUserStatus, activityLogs, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'petugas' as UserRole,
    phone: '',
    is_active: true,
  });

  const openAddUser = () => {
    setEditingUser(null);
    setFormData({
      full_name: '',
      email: '',
      role: 'petugas',
      phone: '',
      is_active: true,
    });
    setUserModalOpen(true);
  };

  const openEditUser = (u: User) => {
    setEditingUser(u);
    setFormData({
      full_name: u.full_name,
      email: u.email,
      role: u.role,
      phone: u.phone || '',
      is_active: u.is_active,
    });
    setUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email) return;

    if (editingUser) {
      updateUser(editingUser.id, formData);
    } else {
      addUser(formData);
    }
    setUserModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-serif text-stone-900">
              Manajemen Petugas Kasir & Audit Log
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold">
              Admin Only
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Kelola hak akses akun staf toko Tisoffindo dan pantau riwayat aktivitas operasional penting.
          </p>
        </div>

        {/* Action button */}
        {activeTab === 'users' && (
          <button
            onClick={openAddUser}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Akun Petugas</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 text-xs font-bold transition-all relative ${
            activeTab === 'users'
              ? 'text-amber-700 border-b-2 border-amber-600'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Daftar Pengguna ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 px-4 text-xs font-bold transition-all relative ${
            activeTab === 'logs'
              ? 'text-amber-700 border-b-2 border-amber-600'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Audit Log Aktivitas ({activityLogs.length})
        </button>
      </div>

      {/* Users Tab (FR-30 & FR-31) */}
      {activeTab === 'users' ? (
        <>
          {/* Mobile Users Cards (md:hidden) */}
          <div className="md:hidden space-y-3">
            {users.map((u) => {
              const isCurrent = u.id === currentUser?.id;

              return (
                <div
                  key={u.id}
                  className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-stone-900 text-sm">{u.full_name}</h4>
                        {isCurrent && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                            (Anda)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 font-mono mt-0.5">{u.email}</p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                        u.is_active
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {u.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 text-xs">
                    <div>
                      <span className="text-[11px] text-stone-400 block">No. HP:</span>
                      <span className="font-medium text-stone-700">{u.phone || '-'}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-stone-400 block">Role:</span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'admin'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-stone-100 text-stone-800'
                        }`}
                      >
                        {u.role === 'admin' ? (
                          <Shield className="w-3 h-3 text-amber-700" />
                        ) : (
                          <UserCheck className="w-3 h-3 text-stone-600" />
                        )}
                        {u.role.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Mobile Actions */}
                  <div className="flex items-center gap-2 pt-1 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => openEditUser(u)}
                      className="flex-1 py-2 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 min-h-[38px]"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Data</span>
                    </button>

                    {!isCurrent && (
                      <button
                        type="button"
                        onClick={() => toggleUserStatus(u.id)}
                        className={`p-2 rounded-xl border min-h-[38px] min-w-[38px] flex items-center justify-center ${
                          u.is_active
                            ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                            : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={u.is_active ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Users Table (hidden md:block) */}
          <div className="hidden md:block bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[680px]">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Nama Lengkap</th>
                    <th className="py-3 px-3">Email Pengguna</th>
                    <th className="py-3 px-3">No. Handphone</th>
                    <th className="py-3 px-3">Peran / Role</th>
                    <th className="py-3 px-3 text-center">Status Akun</th>
                    <th className="py-3 px-4 text-right">Aksi Kelola</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {users.map((u) => {
                    const isCurrent = u.id === currentUser?.id;

                    return (
                      <tr key={u.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-4 font-bold text-stone-900">
                          <div className="flex items-center gap-2">
                            <span>{u.full_name}</span>
                            {isCurrent && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold">
                                (Anda)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-stone-600 font-mono text-[11px]">{u.email}</td>
                        <td className="py-3 px-3 text-stone-600">{u.phone || '-'}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              u.role === 'admin'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-stone-100 text-stone-800'
                            }`}
                          >
                            {u.role === 'admin' ? (
                              <Shield className="w-3 h-3 text-amber-700" />
                            ) : (
                              <UserCheck className="w-3 h-3 text-stone-600" />
                            )}
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              u.is_active
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {u.is_active ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditUser(u)}
                              className="p-1.5 rounded-md hover:bg-stone-100 text-stone-600"
                              title="Edit Data User"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {!isCurrent && (
                              <button
                                onClick={() => toggleUserStatus(u.id)}
                                className={`p-1.5 rounded-md transition-colors ${
                                  u.is_active
                                    ? 'hover:bg-rose-50 text-rose-600'
                                    : 'hover:bg-emerald-50 text-emerald-600'
                                }`}
                                title={u.is_active ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                              >
                                <Power className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Audit Logs Tab (FR-32) */
        <>
          {/* Mobile Logs Cards (md:hidden) */}
          <div className="md:hidden space-y-3">
            {activityLogs.map((log) => (
              <div
                key={log.id}
                className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-2xs space-y-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 font-mono text-[10px] font-bold text-stone-800">
                    {log.action}
                  </span>
                  <span className="text-[11px] text-stone-400 font-mono">
                    {new Date(log.created_at).toLocaleString('id-ID')}
                  </span>
                </div>
                <p className="text-stone-700">{log.detail}</p>
                <div className="text-[11px] text-stone-500 pt-1 border-t border-stone-100">
                  Oleh: <strong className="text-stone-800">{log.user_name}</strong>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Logs Table (hidden md:block) */}
          <div className="hidden md:block bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[600px]">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-3">Tindakan / Aksi</th>
                    <th className="py-3 px-3">Pelaksana</th>
                    <th className="py-3 px-4">Rincian Aktivitas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {activityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-stone-50/70">
                      <td className="py-3 px-4 text-stone-500 font-mono text-[11px] whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 font-mono text-[10px] font-bold text-stone-800">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-stone-800">{log.user_name}</td>
                      <td className="py-3 px-4 text-stone-600">{log.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal Tambah / Edit User */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="font-bold text-stone-900 text-sm font-serif">
                {editingUser ? 'Ubah Data Akun' : 'Tambah Akun Petugas Baru'}
              </h3>
              <button
                onClick={() => setUserModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Contoh: Siti Nurhaliza"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Alamat Email (Login)
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="petugas@tisoffindo.com"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nomor HP (WhatsApp)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Hak Akses / Peran
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="petugas">Petugas (Kasir & Input Penjualan)</option>
                  <option value="admin">Admin (Pemilik & Akses Penuh)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="user_is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="user_is_active" className="text-xs font-semibold text-stone-700">
                  Akun berstatus aktif (dapat login ke sistem)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
