'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://fashion-backend-production-d453.up.railway.app';

export default function AdminProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // State Data Profil Utama Admin
  const [adminData, setAdminData] = useState({
    name: 'Super Admin SHINE',
    email: 'admin@shinefashion.com',
    role: 'Head Manager / Owner',
    phone: '081234567890',
    avatar: '' // Menyimpan string base64 atau URL gambar
  });

  // State Ganti Password
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // TEPAT DI BARIS 28 SCREENSHOT KAMU:
  useEffect(() => {
    fetchProfileData();
  }, []);

  // 1. GET DATA PROFIL DARI BACKEND
  async function fetchProfileData() {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const res = await fetch(`${BASE}/admin/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        const user = data.user ?? data.data ?? data;
        setAdminData({
          name: user.name ?? user.nama ?? 'Super Admin SHINE',
          email: user.email ?? 'admin@shinefashion.com',
          role: user.role ?? 'Head Manager / Owner',
          phone: user.phone ?? user.no_hp ?? '081234567890',
          avatar: user.avatar ?? user.image ?? ''
        });
      }
    } catch (e) {
      console.warn("Gagal terhubung ke BE, menggunakan data simulasi profil.", e);
    } finally {
      setLoading(false);
    }
  }

  // 2. SIMPAN PERUBAHAN PROFIL (NAMA & NO HP)
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const res = await fetch(`${BASE}/admin/profile/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: adminData.name,
          phone: adminData.phone,
          avatar: adminData.avatar
        })
      });

      if (!res.ok) throw new Error('Gagal memperbarui profil di server');
      alert('Profil Admin SHINE berhasil diperbarui!');
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan data.');
    } finally {
      setSaving(false);
    }
  }

  // 3. UPDATE PASSWORD
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Konfirmasi password baru tidak cocok!');
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${BASE}/admin/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (!res.ok) throw new Error('Password lama salah atau request ditolak');
      
      alert('Password berhasil diubah!');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah password.');
    }
  }

  // 4. HANDLE UPLOAD FOTO PROFIL (CONVERT TO BASE64)
  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdminData({ ...adminData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', width: '100%', fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: '40px' }}>
      
      {/* Header Halaman */}
      <div style={{ height: '70px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0a1628', margin: 0 }}>Pengaturan Akun</h2>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Kelola data profil dan keamanan dashboard admin</p>
        </div>
        <button
          onClick={() => router.push('/admin/dashboard')}
          style={{ background: '#fff', color: '#0a1628', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Ke Dashboard
        </button>
      </div>

      <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
        
        {/* Kiri: Avatar & Role */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', textAlign: 'center', height: 'fit-content' }}>
          <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 16px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #0a1628', overflow: 'hidden' }}>
            {adminData.avatar ? (
              <img src={adminData.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            )}
          </div>
          
          <label style={{ display: 'inline-block', background: '#f1f5f9', color: '#0a1628', fontSize: '12px', fontWeight: 600, padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
            Ganti Foto
            <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
          </label>

          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0a1628', margin: '0 0 4px' }}>{adminData.name}</h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px' }}>{adminData.email}</p>
          <span style={{ background: '#0a1628', color: '#fff', fontSize: '11px', fontWeight: 600, padding: '4px 12px', borderRadius: '12px' }}>{adminData.role}</span>
        </div>

        {/* Kanan: Form Data & Keamanan */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Form Utama Profil */}
          <form onSubmit={handleSaveProfile} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0a1628', margin: '0 0 20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>Informasi Profil</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Nama Lengkap</label>
                <input type="text" value={adminData.name} onChange={e => setAdminData({...adminData, name: e.target.value})} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Nomor Telepon / WhatsApp</label>
                <input type="text" value={adminData.phone} onChange={e => setAdminData({...adminData, phone: e.target.value})} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Alamat Email (Tidak dapat diubah)</label>
              <input type="email" value={adminData.email} disabled style={{ width: '100%', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#94a3b8', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', boxSizing: 'border-box', cursor: 'not-allowed' }} />
            </div>

            <button type="submit" disabled={saving} style={{ background: '#0a1628', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              {saving ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
            </button>
          </form>

          {/* Form Ganti Password */}
          <form onSubmit={handleChangePassword} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0a1628', margin: '0 0 20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>Keamanan Akun (Ganti Password)</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Password Saat Ini</label>
              <input type="password" value={passwordForm.oldPassword} onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Password Baru</label>
                <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Konfirmasi Password Baru</label>
                <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} required />
              </div>
            </div>

            <button type="submit" style={{ background: '#fff', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
              Perbarui Password
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}