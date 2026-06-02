'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Footer() {
  // State untuk mengontrol tampilan konten dinamis di dalam pop-up modal
  const [modalType, setModalType] = useState<'FAQ' | 'TERMS' | 'RETURNS' | 'PRIVACY' | null>(null);

  // Fungsi menutup modal
  const closeModal = () => setModalType(null);

  return (
    <footer style={{ background: '#0a1628', color: '#cbd5e1', padding: '40px 24px 24px', marginTop: '64px', borderTop: '1px solid #1e293b', position: 'relative' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'space-between', marginBottom: '40px' }}>
        
        {/* Branding SHINE */}
        <div style={{ flex: '1 1 300px' }}>
          <Link href="/">
            <img 
              src="/shine-logo.svg" 
              alt="SHINE" 
              style={{ height: '32px', width: 'auto', marginBottom: '16px', objectFit: 'contain', filter: 'brightness(0) invert(1)', cursor: 'pointer' }} 
            />
          </Link>
          <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>
            Menyediakan tren busana premium terbaik untuk menunjang kebutuhan gayamu setiap hari secara eksklusif.
          </p>
        </div>

        {/* Hubungi Kami */}
        <div style={{ flex: '1 1 250px' }}>
          <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hubungi Kami</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            
            <a href="mailto:shine.id@gmail.com" className="footer-link" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', textDecoration: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              shine.id@gmail.com
            </a>
            
            {/* LINK WHATSAPP QR BARU */}
            <a href="https://wa.me/qr/YKMSUVR4MZJ2F1" target="_blank" rel="noopener noreferrer" className="footer-link" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', textDecoration: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              Hubungi via WhatsApp
            </a>
            
            {/* LINK GOOGLE MAPS BARU */}
            <a href="https://share.google/DDh1MxmfoetFD3Eug" target="_blank" rel="noopener noreferrer" className="footer-link" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', textDecoration: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              Jl. Danau Ranau, Sawojajar, Malang
            </a>
            
          </div>
        </div>

        {/* Bantuan */}
        <div style={{ flex: '1 1 200px' }}>
          <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bantuan</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <Link href="/chat" className="footer-link" style={{ color: '#94a3b8', textDecoration: 'none' }}>Hubungi CS (Live Chat)</Link>
            
            <span onClick={() => setModalType('FAQ')} className="footer-link" style={{ color: '#94a3b8', textDecoration: 'none', cursor: 'pointer' }}>
              Pertanyaan Umum (FAQ)
            </span>
            
            <span onClick={() => setModalType('PRIVACY')} className="footer-link" style={{ color: '#94a3b8', textDecoration: 'none', cursor: 'pointer' }}>
              Kebijakan Privasi
            </span>
          </div>
        </div>

      </div>

      {/* Hak Cipta & Link Bawah */}
      <div style={{ maxWidth: 1100, margin: '0 auto', paddingTop: '20px', borderTop: '1px solid #1e293b', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '12px', fontSize: '12px', color: '#64748b' }}>
        <span>© {new Date().getFullYear()} SHINE Fashion House. All rights reserved.</span>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span onClick={() => setModalType('TERMS')} className="footer-link" style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Syarat & Ketentuan</span>
          <span onClick={() => setModalType('RETURNS')} className="footer-link" style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Kebijakan Pengembalian</span>
        </div>
      </div>

      {/* ================= MODAL BOX POP-UP INTERAKTIF ================= */}
      {modalType && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '16px', boxSizing: 'border-box' }} onClick={closeModal}>
          <div style={{ background: '#fff', color: '#1e293b', width: '100%', maxWidth: '550px', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', position: 'relative', maxHeight: '80vh', overflowY: 'auto', animation: 'fadeIn 0.2s ease-out' }} onClick={(e) => e.stopPropagation()}>
            
            {/* Tombol Close Silang */}
            <button onClick={closeModal} style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: '#f1f5f9', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#64748b' }}>✕</button>

            {/* 1. KONTEN FAQ */}
            {modalType === 'FAQ' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Pertanyaan Umum (FAQ)</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px', lineHeight: '1.5' }}>
                  <div>
                    <strong style={{ color: '#0f172a', display: 'block', marginBottom: '2px' }}>Bagaimana cara konfirmasi pembayaran QRIS?</strong>
                    <span style={{ color: '#475569' }}>Cukup unggah foto bukti transfer saat checkout. Admin kami akan segera memverifikasi pesananmu di halaman dashboard admin.</span>
                  </div>
                  <div>
                    <strong style={{ color: '#0f172a', display: 'block', marginBottom: '2px' }}>Berapa lama estimasi waktu pengiriman barang?</strong>
                    <span style={{ color: '#475569' }}>Pengiriman menggunakan layanan reguler kilat dengan estimasi 1-3 hari kerja tergantung lokasi kota tujuan Anda.</span>
                  </div>
                  <div>
                    <strong style={{ color: '#0f172a', display: 'block', marginBottom: '2px' }}>Apakah saya bisa membatalkan pesanan yang sudah dibayar?</strong>
                    <span style={{ color: '#475569' }}>Pesanan yang telah dikonfirmasi atau dikirim tidak dapat dibatalkan. Silakan hubungi menu Live Chat CS untuk bantuan darurat.</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. KONTEN SYARAT KETENTUAN */}
            {modalType === 'TERMS' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Syarat & Ketentuan Penggunaan</h3>
                </div>
                <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#475569', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ margin: 0 }}>1. Pengguna wajib memberikan data alamat pengiriman yang asli, valid, lengkap demi kelancaran kurir logistik.</p>
                  <p style={{ margin: 0 }}>2. Segala bentuk penyalahgunaan akun, kecurangan manipulasi bukti bayar QRIS palsu akan ditindak tegas berupa pemblokiran akun permanen.</p>
                  <p style={{ margin: 0 }}>3. Stok produk bersifat *real-time* dan hanya akan berkurang secara otomatis setelah sistem mendeteksi pembayaran berstatus sukses.</p>
                </div>
              </div>
            )}

            {/* 3. KONTEN KEBIJAKAN PENGEMBALIAN */}
            {modalType === 'RETURNS' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Kebijakan Pengembalian Produk</h3>
                </div>
                <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#475569', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ margin: 0 }}>1. Barang dapat ditukar/dikembalikan maksimal 2x24 jam sejak paket diterima oleh pembeli.</p>
                  <p style={{ margin: 0 }}>2. **Wajib menyertakan video unboxing utuh** tanpa jeda/editan sebagai syarat utama klaim jika terjadi kerusakan barang atau cacat produksi.</p>
                  <p style={{ margin: 0 }}>3. Produk harus dalam kondisi semula, belum pernah dicuci, serta tag label merek masih terpasang utuh.</p>
                </div>
              </div>
            )}

            {/* 4. KONTEN KEBIJAKAN PRIVASI */}
            {modalType === 'PRIVACY' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Kebijakan Privasi</h3>
                </div>
                <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#475569', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ margin: 0 }}>1. SHINE Fashion House berkomitmen penuh melindungi kerahasiaan data pribadi, email, dan riwayat pesanan Anda.</p>
                  <p style={{ margin: 0 }}>2. Data sensitif seperti kata sandi (*password*) tersimpan dengan sistem enkripsi biner yang kuat dan tidak dapat diakses pihak ketiga.</p>
                  <p style={{ margin: 0 }}>3. Kami hanya menyalurkan informasi nama dan alamat rumah Anda kepada mitra kurir logistik demi kepentingan akurasi pengantaran paket belanja.</p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Gaya CSS Global Interaktif */}
      <style jsx global>{`
        .footer-link {
          transition: color 0.2s ease;
        }
        .footer-link:hover {
          color: #ffffff !important;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </footer>
  );
}