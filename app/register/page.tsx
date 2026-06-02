'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await authApi.register(form.name, form.email, form.password);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 1500);
    } catch (err: any) {
      setError(err.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Left Panel — foto + overlay */}
      <div style={{ width: '45%', position: 'relative', overflow: 'hidden' }}>
        {/* Foto background */}
        <img
          src="/catalog-denim.jpg"
          alt="SHINE Collection"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', filter: 'blur(2px) brightness(0.5)', transform: 'scale(1.05)' }}
        />
        {/* Gradient overlay biru di atas foto */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(145deg, rgba(10,22,40,0.85) 0%, rgba(15,31,58,0.8) 50%, rgba(30,41,59,0.7) 100%)' }} />

        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.02)' }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px', boxSizing: 'border-box' }}>
          
          {/* Logo Brand Baru SHINE */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img 
              src="/shine-logo.svg" 
              alt="SHINE Logo" 
              style={{ height: '32px', width: 'auto', display: 'block', filter: 'brightness(0) invert(1)' }} 
            />
          </div>

          {/* Main text — Disinkronkan dengan Slogan Utama */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 99, padding: '6px 16px', marginBottom: 24 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
              <span style={{ color: '#fff', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em' }}>Daftar Akun SHINE</span>
            </div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 36, fontWeight: 700, color: '#fff', lineHeight: 1.25, marginBottom: 20, textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
              Wear Your Story,<br /><span style={{ color: '#cbd5e1' }}>Defined by You</span>
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: 40 }}>
              Fashion premium yang mencerminkan siapa dirimu. Bergabunglah dengan ribuan pelanggan SHINE dan nikmati eksklusivitas tren busana terkini.
            </div>
            <div style={{ display: 'flex', gap: 32 }}>
              {([['10K+', 'Pelanggan'], ['500+', 'Koleksi'], ['4.9★', 'Rating']] as [string,string][]).map(([num, lbl]) => (
                <div key={lbl}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{num}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            © 2026 SHINE Fashion House. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 48 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0a1628', marginBottom: 8, fontFamily: 'Georgia, serif' }}>Buat Akun Baru</h1>
            <p style={{ fontSize: 14, color: '#94a3b8' }}>Isi data di bawah untuk mendaftar layanan SHINE</p>
          </div>

          {success && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#16a34a', fontSize: 13, textAlign: 'center' }}>
              ✓ Akun berhasil dibuat! Mengalihkan ke halaman login...
            </div>
          )}
          {error && (
            <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#991b1b', marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: 8 }}>Nama Lengkap</label>
              <input type="text" placeholder="Nama kamu" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required
                style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '13px 16px', fontSize: 14, outline: 'none', transition: 'border .2s', background: '#fff', boxSizing: 'border-box' }}
                onFocus={e => (e.target.style.borderColor = '#0a1628')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: 8 }}>Email</label>
              <input type="email" placeholder="nama@email.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required
                style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '13px 16px', fontSize: 14, outline: 'none', transition: 'border .2s', background: '#fff', boxSizing: 'border-box' }}
                onFocus={e => (e.target.style.borderColor = '#0a1628')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: 8 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} placeholder="Min. 6 karakter" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6}
                  style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '13px 48px 13px 16px', fontSize: 14, outline: 'none', transition: 'border .2s', background: '#fff', boxSizing: 'border-box' }}
                  onFocus={e => (e.target.style.borderColor = '#0a1628')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 16, padding: 0 }}>
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: '100%', background: loading ? '#94a3b8' : '#0a1628', color: '#fff', border: 'none', borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all .2s', boxShadow: loading ? 'none' : '0 8px 24px rgba(10,22,40,0.25)', marginTop: 8 }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = '#1e293b'; }}
              onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = '#0a1628'; }}>
              {loading ? 'Mendaftarkan...' : 'Daftar Sekarang →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#94a3b8' }}>
            Sudah punya akun?{' '}
            <Link href="/login" style={{ color: '#0a1628', fontWeight: 700, textDecoration: 'none' }}>Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  );
}