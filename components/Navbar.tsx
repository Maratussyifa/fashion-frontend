'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ShoppingBag, Heart, User, Search, MessageSquare, Menu, X, ChevronDown, LogOut, LayoutDashboard, Package } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false); // Untuk mencegah hydration error

  // Pastikan komponen telah termuat di sisi klien (client-side)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sinkronisasi kolom pencarian dari parameter URL
  useEffect(() => {
    const currentSearch = searchParams.get('search') ?? '';
    setSearchQuery(currentSearch);
  }, [searchParams]);

  // Muat data otentikasi lokal aman setelah komponen mounted
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const t = localStorage.getItem('token');
      const r = localStorage.getItem('role');
      const u = localStorage.getItem('user');
      setToken(t);
      setRole(r);
      if (u) { try { setUser(JSON.parse(u)); } catch { } }
    }
  }, [pathname]);

  // Pantau efek scroll halaman
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Tutup dropdown menu desktop saat klik di luar area
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    setToken(null); setRole(null); setUser(null); setMenuOpen(false);
    router.push('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();

    if (!query) {
      if (pathname === '/' || pathname === '/home') {
        router.push(pathname);
      } else {
        router.push('/katalog');
      }
      setMobileOpen(false);
      return;
    }

    if (pathname === '/' || pathname === '/home') {
      router.push(`${pathname}?search=${encodeURIComponent(query)}`);
    } else {
      router.push(`/katalog?search=${encodeURIComponent(query)}`);
    }
    
    setMobileOpen(false);
  };

  const displayName = user?.name ?? '';
  const initials = displayName ? displayName.charAt(0).toUpperCase() : '?';

  // LOGIKA RESPONSIVE WARNA
  const useDarkTheme = isScrolled || mobileOpen;

  // Render minimal untuk menghindari perbedaan struktur HTML server vs client
  if (!mounted) return <div style={{ height: 70, background: 'transparent' }} />;

  // Variabel helper untuk mempermudah pengecekan role admin
  const isAdmin = role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'ADMIN';

  return (
    <nav style={{
      background: useDarkTheme ? '#fff' : 'transparent',
      borderBottom: useDarkTheme ? '1px solid #e2e8f0' : '1px solid transparent',
      boxShadow: useDarkTheme ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none',
      position: 'fixed',
      left: 0, right: 0, top: 0,
      zIndex: 9999,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70,
      }}>

        {/* ── KIRI: LOGO SHINE & MENU DESKTOP ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <Link href={token ? '/home' : '/'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <img 
              src="/shine-logo.svg" 
              alt="SHINE Fashion House" 
              style={{ 
                height: '30px', 
                width: 'auto', 
                display: 'block',
                objectFit: 'contain',
                filter: useDarkTheme ? 'none' : 'brightness(0) invert(1)' 
              }} 
            />
          </Link>
          <div style={{ display: 'flex', gap: '24px' }} className="hidden-mobile">
            <Link href="/home" style={{ textDecoration: 'none', color: useDarkTheme ? '#0f172a' : '#ffffff', fontSize: '14px', fontWeight: 600, letterSpacing: '0.5px', transition: 'color 0.3s' }}>HOME</Link>
            <Link href="/katalog" style={{ textDecoration: 'none', color: useDarkTheme ? '#0f172a' : '#ffffff', fontSize: '14px', fontWeight: 600, letterSpacing: '0.5px', transition: 'color 0.3s' }}>KATALOG</Link>
          </div>
        </div>

        {/* ── TENGAH: SEARCH BAR DESKTOP ── */}
        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '450px', margin: '0 32px', position: 'relative', display: 'flex', alignItems: 'center' }} className="hidden-mobile">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Apa yang anda cari?"
            style={{
              width: '100%', height: '42px', padding: '0 44px 0 16px',
              borderRadius: '21px',
              border: useDarkTheme ? '1.5px solid #cbd5e1' : '1.5px solid rgba(255,255,255,0.4)',
              background: useDarkTheme ? '#f8fafc' : 'rgba(255,255,255,0.15)',
              backdropFilter: useDarkTheme ? 'none' : 'blur(4px)',
              fontSize: '14px', outline: 'none',
              color: useDarkTheme ? '#0f172a' : '#fff',
              transition: 'all 0.3s'
            }}
            onFocus={e => { e.target.style.borderColor = useDarkTheme ? '#0f172a' : '#fff'; e.target.style.background = useDarkTheme ? '#fff' : 'rgba(255,255,255,0.3)'; }}
            onBlur={e => { e.target.style.borderColor = useDarkTheme ? '#cbd5e1' : 'rgba(255,255,255,0.4)'; e.target.style.background = useDarkTheme ? '#f8fafc' : 'rgba(255,255,255,0.15)'; }}
          />
          <button type="submit" style={{ position: 'absolute', right: '14px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: useDarkTheme ? '#64748b' : '#cbd5e1', display: 'flex', alignItems: 'center', transition: 'color 0.3s' }}>
            <Search size={18} strokeWidth={2.5} />
          </button>
        </form>

        {/* ── KANAN: UTILITY NAVIGATION ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!isAdmin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="hidden-mobile">
              <Link href="/chat" title="Live Chat" style={{ color: useDarkTheme ? '#0f172a' : '#fff', padding: '10px', borderRadius: '50%', display: 'flex', transition: 'all 0.3s' }} onMouseEnter={e => e.currentTarget.style.background = useDarkTheme ? '#f1f5f9' : 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <MessageSquare size={22} strokeWidth={2} />
              </Link>
              <Link href="/wishlist" title="Favorit" style={{ color: useDarkTheme ? '#0f172a' : '#fff', padding: '10px', borderRadius: '50%', display: 'flex', transition: 'all 0.3s' }} onMouseEnter={e => e.currentTarget.style.background = useDarkTheme ? '#f1f5f9' : 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <Heart size={22} strokeWidth={2} />
              </Link>
              <Link href="/cart" title="Keranjang" style={{ color: useDarkTheme ? '#0f172a' : '#fff', padding: '10px', borderRadius: '50%', display: 'flex', transition: 'all 0.3s' }} onMouseEnter={e => e.currentTarget.style.background = useDarkTheme ? '#f1f5f9' : 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <ShoppingBag size={22} strokeWidth={2} />
              </Link>
            </div>
          )}

          {token && isAdmin && (
            <Link href="/admin/dashboard" title="Admin Panel" style={{ color: useDarkTheme ? '#0f172a' : '#fff', padding: '10px', borderRadius: '50%', display: 'flex', transition: 'color 0.3s' }} className="hidden-mobile">
              <LayoutDashboard size={22} strokeWidth={2} />
            </Link>
          )}

          {/* Profile Dropdown Desktop */}
          <div className="hidden-mobile" style={{ marginLeft: '4px' }}>
            {!token ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Link href="/login" style={{ textDecoration: 'none' }}>
                  <button style={{ background: 'transparent', border: 'none', color: useDarkTheme ? '#0f172a' : '#fff', fontSize: '14px', fontWeight: 600, padding: '8px 12px', cursor: 'pointer', transition: 'color 0.3s' }}>Masuk</button>
                </Link>
                <Link href="/register" style={{ textDecoration: 'none' }}>
                  <button style={{ background: useDarkTheme ? '#0a1628' : '#fff', border: 'none', color: useDarkTheme ? '#fff' : '#0a1628', fontSize: '14px', fontWeight: 600, padding: '8px 18px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.3s' }}>Daftar</button>
                </Link>
              </div>
            ) : (
              <div ref={menuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px 4px 4px', borderRadius: '20px', border: useDarkTheme ? '1.5px solid #e2e8f0' : '1.5px solid rgba(255,255,255,0.4)', background: useDarkTheme ? '#fff' : 'rgba(255,255,255,0.15)', cursor: 'pointer', transition: 'all 0.3s' }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: useDarkTheme ? '#0a1628' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: useDarkTheme ? '#fff' : '#0a1628', fontSize: 12, fontWeight: 700 }}>{initials}</span>
                  </div>
                  <ChevronDown size={14} color={useDarkTheme ? '#64748b' : '#cbd5e1'} style={{ transform: menuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                {menuOpen && (
                  <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: '#fff', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', padding: '6px', minWidth: 190, zIndex: 200 }}>
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', marginBottom: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{displayName}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'capitalize' }}>{user?.role ?? role?.toLowerCase()}</div>
                    </div>

                    <DropdownItem icon={<User size={14} />} href="/profile" onClick={() => setMenuOpen(false)}>Profil Saya</DropdownItem>
                    
                    {/* HANYA TAMPILKAN JIKA BUKAN ADMIN */}
                    {!isAdmin && (
                      <DropdownItem icon={<Package size={14} />} href="/orders" onClick={() => setMenuOpen(false)}>Pesanan Saya</DropdownItem>
                    )}

                    <div style={{ height: 1, background: '#f1f5f9', margin: '4px 0' }} />
                    <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: '8px', fontSize: 13, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', width: '100%', fontWeight: 500 }}>
                      <LogOut size={14} /> Keluar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tombol Hamburger Menu Mobile */}
          <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: useDarkTheme ? '#0f172a' : '#fff', padding: '10px', display: 'none', transition: 'color 0.3s' }} className="mobile-menu-btn">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* ── MOBILE DRAWER CONTAINER ── */}
      {mobileOpen && (
        <div style={{ background: '#fff', borderTop: '1px solid #e2e8f0', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f1f5f9', borderRadius: '20px', padding: '8px 16px', border: '1px solid #e2e8f0', marginBottom: '8px' }}>
            <Search size={16} color="#94a3b8" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Cari produk..." style={{ border: 'none', outline: 'none', fontSize: 14, color: '#0f172a', background: 'transparent', flex: 1 }} />
          </form>
          
          <MobileLink href="/home" onClick={() => setMobileOpen(false)}>Home</MobileLink>
          <MobileLink href="/katalog" onClick={() => setMobileOpen(false)}>Katalog Semua Produk</MobileLink>
          
          {token && !isAdmin && (
            <>
              <MobileLink href="/profile" onClick={() => setMobileOpen(false)}>👤 Profil Saya</MobileLink>
              <MobileLink href="/cart" onClick={() => setMobileOpen(false)}>🛒 Keranjang Belanja</MobileLink>
              <MobileLink href="/wishlist" onClick={() => setMobileOpen(false)}>🤍 Favorit Saya</MobileLink>
              <MobileLink href="/orders" onClick={() => setMobileOpen(false)}>📦 Daftar Pesanan</MobileLink>
              <MobileLink href="/chat" onClick={() => setMobileOpen(false)}>💬 Hubungi Live Chat</MobileLink>
            </>
          )}

          {token && isAdmin && (
            <>
              <MobileLink href="/profile" onClick={() => setMobileOpen(false)}>👤 Profil Saya</MobileLink>
              <MobileLink href="/admin/dashboard" onClick={() => setMobileOpen(false)}>⚙️ Admin Dashboard</MobileLink>
            </>
          )}
          
          <div style={{ height: '1px', background: '#f1f5f9', margin: '8px 0' }} />
          
          {!token ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link href="/login" style={{ flex: 1, textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
                <button style={{ width: '100%', padding: '10px', fontSize: 14, fontWeight: 600, background: 'none', border: '1.5px solid #cbd5e1', borderRadius: '8px', color: '#334155', cursor: 'pointer' }}>Masuk</button>
              </Link>
              <Link href="/register" style={{ flex: 1, textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
                <button style={{ width: '100%', padding: '10px', fontSize: 14, fontWeight: 600, background: '#0a1628', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>Daftar</button>
              </Link>
            </div>
          ) : (
            <button onClick={() => { logout(); setMobileOpen(false); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'none', border: '1.5px solid #fca5a5', borderRadius: '8px', color: '#ef4444', fontSize: 14, fontWeight: 500, padding: '10px', cursor: 'pointer' }}>
              <LogOut size={14} /> Keluar dari Akun
            </button>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}

function DropdownItem({ href, icon, children, onClick }: { href: string; icon: React.ReactNode; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} style={{ textDecoration: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: '8px', fontSize: 13, color: '#334155', fontWeight: 500, transition: 'background 0.1s' }}
        onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
        <span style={{ color: '#64748b', display: 'flex' }}>{icon}</span>
        {children}
      </div>
    </Link>
  );
}

function MobileLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} style={{ textDecoration: 'none', padding: '12px 14px', borderRadius: '8px', color: '#0f172a', display: 'block', fontWeight: 600, fontSize: 14, transition: 'background 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      {children}
    </Link>
  );
}