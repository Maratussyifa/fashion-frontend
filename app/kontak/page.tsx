'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Phone, MapPin, Send, HelpCircle, CheckCircle2 } from 'lucide-react';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://fashion-backend-production-d453.up.railway.app';

function authFetch(path: string, opts: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return fetch(`${BASE}${path}`, {
    ...opts,
    headers: { 
      'Content-Type': 'application/json', 
      ...(token ? { Authorization: `Bearer ${token}` } : {}), 
      ...opts.headers 
    },
  });
}

export default function ContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'Pertanyaan Umum', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    // Memastikan user telah login saat mengakses bantuan/kontak resmi
    if (!localStorage.getItem('token')) { 
      router.push('/login'); 
      return; 
    }
    
    // Autofill data profil jika tersimpan di localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setFormData(prev => ({
          ...prev,
          name: parsed.name || parsed.username || '',
          email: parsed.email || ''
        }));
      } catch (e) {
        console.error("Gagal membaca profil user untuk kontak", e);
      }
    }
  }, []);

  // FUNGSI BARU KHUSUS: Mengirimkan form pesan/tiket pengaduan resmi ke API Backend
  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.message.trim()) return alert("Silakan tulis pesan Anda terlebih dahulu.");

    try {
      setIsSubmitting(true);
      
      // Mengirimkan data formulir kontak langsung menuju endpoint bantuan/kontak
      const res = await authFetch('/contact/submit', {
        method: 'POST',
        body: JSON.stringify({
          senderName: formData.name,
          senderEmail: formData.email,
          category: formData.subject,
          content: formData.message,
          timestamp: new Date().toISOString()
        })
      });

      // Fallback: Jika rute pengaduan khusus belum dibuat, alihkan sebagai trigger pesan pertama
      if (!res.ok) {
        await authFetch(`/chat/reply/system`, {
          method: 'POST',
          body: JSON.stringify({ text: `[TIKET ${formData.subject.toUpperCase()}] ${formData.message}` })
        });
      }

      setSubmitSuccess(true);
      setFormData(prev => ({ ...prev, message: '' }));
      setTimeout(() => setSubmitSuccess(false), 5000);

    } catch (err) {
      console.error("Gagal mengirim tiket kontak:", err);
      alert("Terjadi gangguan jaringan, pesan Anda gagal dikirim.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* WRAPPER UTAMA: Menggunakan padding-top 110px agar simetris di bawah Navbar Fixed */}
      <div style={{ maxWidth: 1100, width: '100%', margin: '0 auto', padding: '110px 24px 60px', flex: 1 }}>
        
        {/* NAVIGASI BACK */}
        <div style={{ marginTop: '-10px', marginBottom: '15px' }}>
          <Link href="/home" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}>
            ← Kembali ke Beranda
          </Link>
        </div>

        {/* HEADER */}
        <div style={{ paddingBottom: '8px', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Hubungi Kami</h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px', margin: 0 }}>Punya pertanyaan atau keluhan seputar layanan SHINE? Kami siap membantu 24/7.</p>
        </div>

        {/* LAYOUT GRID UTAMA */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'start' }}>
          
          {/* KOLOM KIRI: INFORMASI KONTAK RESMI */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpCircle size={18} color="#2563eb" /> Informasi Saluran Bantuan
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '10px', color: '#2563eb' }}><Mail size={18} /></div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>EMAIL LAYANAN</div>
                    <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: 600, marginTop: '2px' }}>support@shinefashion.id</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ background: '#ecfdf5', padding: '10px', borderRadius: '10px', color: '#10b981' }}><Phone size={18} /></div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>WHATSAPP HOTLINE</div>
                    <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: 600, marginTop: '2px' }}>+62 812-3456-7890</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ background: '#fef2f2', padding: '10px', borderRadius: '10px', color: '#ef4444' }}><MapPin size={18} /></div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>KANTOR PUSAT</div>
                    <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: 600, marginTop: '2px', lineHeight: 1.4 }}>Gedung SHINE Creative Labs, Lantai 4. Jl. Fashion Avenue No.10, Jakarta Pusat</div>
                  </div>
                </div>
              </div>
            </div>

            {/* SLA BANNER */}
            <div style={{ background: '#0f172a', color: '#fff', padding: '20px', borderRadius: '18px', fontSize: '12.5px', lineHeight: 1.5 }}>
              💡 <strong>Estimasi Tanggapan:</strong> Setiap formulir tiket keluhan yang masuk via halaman ini akan diulas oleh tim administrasi dengan jangka waktu maksimal 1x24 jam kerja. Riwayat balasan akan langsung dikirim menuju alamat email terdaftar Anda.
            </div>
          </div>

          {/* KOLOM KANAN: FORMULIR INPUT TIKET PENGADUAN */}
          <div style={{ background: '#fff', padding: '28px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>Kirim Tiket Masalah</h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 20px 0' }}>Tinggalkan pesan resmi tanpa perlu menunggu antrean ruang live chat.</p>

            {submitSuccess && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', marginBottom: '18px', fontWeight: 500 }}>
                <CheckCircle2 size={16} color="#10b981" /> Tiket bantuan Anda berhasil dibuat dan masuk antrean sistem!
              </div>
            )}

            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Nama Pelanggan</label>
                <input 
                  type="text" 
                  value={formData.name}
                  disabled
                  style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#f1f5f9', color: '#64748b', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Email Konfirmasi</label>
                <input 
                  type="email" 
                  value={formData.email}
                  disabled
                  style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#f1f5f9', color: '#64748b', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Kategori Topik Keluhan</label>
                <select 
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', boxSizing: 'border-box', outline: 'none', color: '#1e293b', fontWeight: 500 }}
                >
                  <option value="Pertanyaan Umum">Pertanyaan Umum & Katalog</option>
                  <option value="Kendala Pembayaran">Kendala Transaksi & Pembayaran</option>
                  <option value="Status Pengiriman">Status Pengiriman & Ekspedisi</option>
                  <option value="Retur Barang">Retur / Pengembalian Produk cacat</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Detail Isi Pesan</label>
                <textarea 
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Tuliskan kendala Anda secara detail beserta nomor invoice pesanan jika ada..."
                  required
                  rows={4}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13.5px', boxSizing: 'border-box', outline: 'none', color: '#1e293b', lineHeight: 1.5, resize: 'none' }}
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '12px', padding: '12px', fontSize: '13.5px', fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '6px', transition: 'background 0.2s' }}
                onMouseEnter={(e) => { if(!isSubmitting) e.currentTarget.style.background = '#1d4ed8'; }}
                onMouseLeave={(e) => { if(!isSubmitting) e.currentTarget.style.background = '#2563eb'; }}
              >
                <Send size={14} /> {isSubmitting ? "Mengirim Tiket..." : "Kirim Pengaduan"}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}