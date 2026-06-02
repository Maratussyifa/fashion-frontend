'use client';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Ambil ID menu aktif berdasarkan URL path saat ini
  const getActiveMenu = () => {
    if (pathname.includes('/products')) return 'produk';
    if (pathname.includes('/categories')) return 'kategori'; 
    if (pathname.includes('/orders')) return 'pesanan'; 
    if (pathname.includes('/chat')) return 'chat';
    return 'dashboard';
  };

  const activeMenu = getActiveMenu();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/admin/dashboard',
      icon: (color: string) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" />
          <rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
          <rect x="3" y="16" width="7" height="5" />
        </svg>
      )
    },
    {
      id: 'produk',
      label: 'Produk',
      path: '/admin/products',
      icon: (color: string) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l-7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      )
    },
    {
      id: 'kategori',
      label: 'Kategori',
      path: '/admin/categories',
      icon: (color: string) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      )
    },
    {
      id: 'pesanan',
      label: 'Pesanan',
      path: '/admin/orders',
      icon: (color: string) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      )
    },
    {
      id: 'chat',
      label: 'Chat',
      path: '/admin/chat',
      icon: (color: string) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )
    }
  ];

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token'); // Bersihkan session token
    }
    router.push('/auth/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* SIDEBAR TUNGGAL MODERN */}
      <div style={{ width: '260px', background: '#0a1628', color: '#ffffff', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 50, boxShadow: '4px 0 24px rgba(10, 22, 40, 0.08)', borderRight: '1px solid #1e293b' }}>

        {/* Brand Header — Menggunakan Identitas Premium SHINE */}
        <div style={{ padding: '24px 24px 20px 24px', borderBottom: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <svg width="110" height="28" viewBox="0 0 110 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
              <text x="0" y="22" fill="#ffffff" fontSize="22" fontWeight="900" fontFamily="Georgia, serif" letterSpacing="3px">
                SHINE
              </text>
              <rect x="0" y="26" width="35" height="3" fill="#cbd5e1" rx="1.5" /> 
            </svg>
          </div>
          <p style={{ color: '#475569', fontSize: '10px', fontWeight: 700, margin: '6px 0 0 0', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
            Admin Control Panel
          </p>
        </div>

        {/* Menu Navigasi */}
        <div style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {menuItems.map((menu) => {
            const isActive = activeMenu === menu.id;
            // Menu aktif menggunakan warna putih murni, menu biasa menggunakan slate redup yang mewah
            const iconColor = isActive ? '#ffffff' : '#475569';

            return (
              <button
                key={menu.id}
                onClick={() => router.push(menu.path)}
                className={`menu-btn ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 16px',
                  background: isActive ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : 'transparent',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  border: isActive ? '1px solid rgba(255, 255, 255, 0.15)' : 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.25s ease',
                  boxSizing: 'border-box',
                  boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.2)' : 'none',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }}>
                  {menu.icon(iconColor)}
                </span>
                {menu.label}
              </button>
            );
          })}
        </div>

        {/* Logout Section */}
        <div style={{ padding: '20px 16px', borderTop: '1px solid #1e293b' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(244, 63, 94, 0.08)',
              color: '#f43f5e',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(244, 63, 94, 0.15)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(244, 63, 94, 0.08)';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            Keluar Panel
          </button>
        </div>
      </div>

      {/* AREA KONTEN UTAMA */}
      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {children}
      </div>

      {/* Efek Hover CSS Murni untuk tombol menu non-aktif */}
      <style>{`
        .menu-btn:not(.active):hover {
          background: rgba(255, 255, 255, 0.04) !important;
          color: #f1f5f9 !important;
        }
        .menu-btn:not(.active):hover svg {
          stroke: #94a3b8 !important;
          transform: scale(1.05);
        }
      `}</style>

    </div>
  );
}