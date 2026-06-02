'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Mail, 
  ShieldAlert, 
  Package, 
  MessageSquare, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  ArrowLeft,
  ShoppingBag
} from 'lucide-react';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://fashion-backend-production-d453.up.railway.app';

function authFetch(path: string, opts: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return fetch(`${BASE}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts.headers },
  });
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    try {
      const u = localStorage.getItem('user');
      if (u) setUser(JSON.parse(u));
    } catch {}

    async function fetchProfile() {
      const endpoints = ['/auth/me', '/auth/profile', '/users/profile', '/users/me'];
      for (const ep of endpoints) {
        try {
          const r = await authFetch(ep);
          if (r.ok) {
            const d = await r.json();
            const data = d.data ?? d;
            if (data?.name || data?.email) {
              setUser(data);
              localStorage.setItem('user', JSON.stringify(data));
              break;
            }
          }
        } catch {}
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    router.push('/login');
  };

  const getInitial = (name: string) => name?.charAt(0)?.toUpperCase() ?? '?';

  const getRoleBadge = (role: string) => {
    const r = role?.toUpperCase();
    if (r === 'ADMIN') return { label: 'Admin', bg: '#fef3c7', color: '#d97706' };
    // Mengubah warna teks badge user menjadi Navy khas SHINE
    return { label: 'Pelanggan', bg: '#f1f5f9', color: '#0a1628' };
  };

  if (loading && !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTop: '3px solid #0a1628', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: '#64748b', fontSize: 14 }}>Memuat profil...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const badge = getRoleBadge(user?.role ?? 'USER');

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', paddingTop: '90px' }}>

      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1e293b 100%)', padding: '36px 24px 72px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          
          {/* Tombol Kembali ke Beranda */}
          <Link href="/home" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.7)', fontSize: 13, textDecoration: 'none', marginBottom: 16, background: 'rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: 99, transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}>
            <ArrowLeft size={14} /> Kembali ke Beranda
          </Link>

          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>Profil Saya</h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 4, margin: 0 }}>Informasi akun dan pengaturan belanja Anda</p>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '-44px auto 0', padding: '0 24px 60px' }}>

        {/* Card Avatar + Info */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '28px 32px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: 16 }}>
          
          {/* Avatar Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#f1f5f9', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#475569', fontSize: 24, fontWeight: 700 }}>{getInitial(user?.name ?? '')}</span>
            </div>
            <div>
              <h2 style={{ fontSize: 19, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>{user?.name ?? '—'}</h2>
              <span style={{ background: badge.bg, color: badge.color, fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 99, letterSpacing: '0.03em' }}>
                {badge.label}
              </span>
            </div>
          </div>

          {/* Detail Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
            {[
              { label: 'Nama Lengkap', value: user?.name ?? '—', icon: <User size={18} /> },
              { label: 'Email', value: user?.email ?? '—', icon: <Mail size={18} /> },
              { label: 'Status Akun', value: badge.label, icon: <ShieldAlert size={18} /> },
            ].map((item, i) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: i < 2 ? '1px solid #e2e8f0' : 'none' }}>
                <span style={{ color: '#64748b', width: 24, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Menu Navigasi */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
          {[
            { icon: <Package size={20} />, label: 'Pesanan Saya', desc: 'Lihat riwayat dan status pesanan', href: '/orders' },
            { icon: <MessageSquare size={20} />, label: 'Live Chat', desc: 'Hubungi tim SHINE Customer Care', href: '/chat' },
            { icon: <HelpCircle size={20} />, label: 'Kontak & Bantuan', desc: 'FAQ dan informasi kontak', href: '/kontak' },
          ].map((item, i, arr) => (
            <Link key={item.href} href={item.href}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', textDecoration: 'none', borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none', background: 'transparent', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <span style={{ color: '#64748b', width: 24, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{item.label}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{item.desc}</div>
              </div>
              <ChevronRight size={18} color="#cbd5e1" />
            </Link>
          ))}
        </div>

        {/* Aksi Akun: Belanja & Keluar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          
          {/* Tombol Lanjut Belanja */}
          <Link href="/home" style={{ width: '100%', padding: '14px', background: '#0a1628', color: '#fff', borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 12px rgba(10,22,40,0.15)', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#1e293b'}
            onMouseLeave={e => e.currentTarget.style.background = '#0a1628'}>
            <ShoppingBag size={16} /> Lanjut Belanja
          </Link>

          {/* Tombol Logout */}
          <button onClick={logout} style={{ width: '100%', padding: '14px', background: '#fff', color: '#ef4444', border: '1.5px solid #fecaca', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.01)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}>
            <LogOut size={16} /> Keluar dari Akun
          </button>
        </div>

      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}