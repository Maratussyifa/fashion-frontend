'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cartApi, addressesApi, ordersApi } from '@/lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [showNewAddr, setShowNewAddr] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: '', street: '', city: '', province: '', postalCode: '' });
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // === DATA FILE BUKTI QRIS ===
  const [qrisFile, setQrisFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!localStorage.getItem('token')) { 
      router.push('/login'); 
      return; 
    }
    loadData();
  }, []);

  async function loadData() {
    try {
      const [addrs, cart] = await Promise.all([addressesApi.getAll(), cartApi.get()]);
      
      // Menghilangkan duplikasi alamat
      const uniqueMap = new Map();
      addrs.forEach((item: any) => {
        const textKey = `${item.street || ''}-${item.city || ''}`.replace(/\s+/g, '').toLowerCase();
        if (!uniqueMap.has(item.id) && !uniqueMap.has(textKey)) {
          uniqueMap.set(item.id, item);
          uniqueMap.set(textKey, true); 
        }
      });

      const finalUniqueAddresses = Array.from(uniqueMap.values()).filter(val => typeof val === 'object');
      setAddresses(finalUniqueAddresses);
      
      if (finalUniqueAddresses.length > 0) {
        setSelectedAddress(finalUniqueAddresses[0].id);
      }
      
      // Mengambil item yang dicheckout dari halaman keranjang
      const ids: number[] = JSON.parse(localStorage.getItem('checkoutItems') || '[]');
      const allItems = cart.items || cart || [];
      setCartItems(ids.length > 0 ? allItems.filter((i: any) => ids.includes(i.id)) : allItems);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  }

  async function addAddress() {
    if (!newAddr.label || !newAddr.street || !newAddr.city) { 
      alert('Isi label, jalan, dan kota'); 
      return; 
    }
    try {
      const addr = await addressesApi.create(newAddr);
      setAddresses(prev => {
        const nextList = [...prev, addr];
        const uniqueMap = new Map();
        nextList.forEach((item: any) => {
          const textKey = `${item.street || ''}-${item.city || ''}`.replace(/\s+/g, '').toLowerCase();
          if (!uniqueMap.has(item.id) && !uniqueMap.has(textKey)) {
            uniqueMap.set(item.id, item);
            uniqueMap.set(textKey, true);
          }
        });
        return Array.from(uniqueMap.values()).filter(val => typeof val === 'object');
      });
      setSelectedAddress(addr.id);
      setShowNewAddr(false);
      setNewAddr({ label: '', street: '', city: '', province: '', postalCode: '' });
    } catch (e: any) { 
      alert(e.message); 
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setQrisFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // === FUNGSI UTAMA YANG SUDAH DISESUAIKAN DENGAN DOKUMENTASI BE ===
  async function placeOrder() {
    if (!selectedAddress) { 
      alert('Pilih alamat pengiriman terlebih dahulu'); 
      return; 
    }
    if (!qrisFile) { 
      alert('Silakan unggah foto bukti transfer QRIS terlebih dahulu untuk validasi'); 
      return; 
    }
    if (cartItems.length === 0) {
      alert('Keranjang belanja Anda kosong atau item belum terpilih');
      return;
    }
    
    setPlacing(true);
    try {
      const formData = new FormData();
      
      // 1. Masukkan Bukti Pembayaran ke key 'image' sesuai instruksi BE
      formData.append('image', qrisFile);
      
      // 2. Bungkus data sesuai struktur keinginan BE ke dalam objek tunggal
      const orderDataPayload = {
        addressId: Number(selectedAddress),
        cartItemIds: cartItems.map(item => Number(item.id))
      };
      
      // 3. Masukkan ke key 'data' dalam bentuk string JSON murni
      formData.append('data', JSON.stringify(orderDataPayload));

      // Kirim data multipart/form-data ke Back-End
      const order = await ordersApi.create(formData);
      
      localStorage.removeItem('checkoutItems');
      setIsSuccess(true);
      setTimeout(() => { 
        router.push(`/orders?success=${order.id}`); 
      }, 2000);
    } catch (e: any) { 
      const backendError = e.response?.data?.message;
      const errorMsg = Array.isArray(backendError) 
        ? backendError.join(', ') 
        : backendError || e.message || 'Gagal membuat order';
        
      alert(errorMsg); 
      setPlacing(false);
    }
  }

  const subtotal = cartItems.reduce((sum, i) => sum + Number(i.product?.price || 0) * i.quantity, 0);
  const shipping = 0; 
  const serviceFee = 2000; 
  const total = subtotal + shipping + serviceFee;

  const inputStyle: React.CSSProperties = { width: '100%', border: '1px solid #cbd5e1', borderRadius: 8, padding: '10px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 12, background: '#fff' };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTop: '3px solid #0f172a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1e293b' }}>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '40px', paddingBottom: '64px', paddingLeft: '16px', paddingRight: '16px', boxSizing: 'border-box' }}>
        
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Form Pembayaran</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Periksa kembali pesanan Anda sebelum menekan tombol buat pesanan.</p>
        </div>

        <div className="main-checkout-grid">
          
          {/* KOLOM KIRI */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Box Alamat Pengiriman */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Alamat Pengiriman</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {addresses.map(addr => (
                  <div key={addr.id} onClick={() => !isSuccess && setSelectedAddress(addr.id)}
                    style={{ border: `1px solid ${selectedAddress === addr.id ? '#2563eb' : '#e2e8f0'}`, borderRadius: '10px', padding: '16px', cursor: isSuccess ? 'not-allowed' : 'pointer', background: selectedAddress === addr.id ? '#f0f7ff' : '#fff', transition: 'all 0.2s ease' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <input type="radio" checked={selectedAddress === addr.id} readOnly style={{ marginTop: '4px', accentColor: '#2563eb', cursor: 'pointer' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>{addr.label}</span>
                          {selectedAddress === addr.id && <span style={{ background: '#2563eb', color: '#fff', fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>Utama</span>}
                        </div>
                        <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>Jl. {addr.street}, {addr.city}, {addr.province} {addr.postalCode}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={() => !isSuccess && setShowNewAddr(!showNewAddr)} disabled={isSuccess}
                style={{ fontSize: '13px', color: '#2563eb', background: 'none', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '12px', cursor: isSuccess ? 'not-allowed' : 'pointer', fontWeight: 600, width: '100%', marginTop: '16px', transition: 'all 0.2s' }}
                onMouseEnter={e => !isSuccess && (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={e => !isSuccess && (e.currentTarget.style.background = 'none')}>
                {showNewAddr ? '✕ Batalkan Pengisian' : '+ Tambah Alamat Baru'}
              </button>

              {showNewAddr && (
                <div style={{ marginTop: '16px', padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div className="form-responsive-row">
                    <input placeholder="Label Alamat (Rumah / Kos)" value={newAddr.label} onChange={e => setNewAddr({ ...newAddr, label: e.target.value })} style={inputStyle} />
                    <input placeholder="Kota" value={newAddr.city} onChange={e => setNewAddr({ ...newAddr, city: e.target.value })} style={inputStyle} />
                  </div>
                  <input placeholder="Nama Jalan & Nomor Kamar" value={newAddr.street} onChange={e => setNewAddr({ ...newAddr, street: e.target.value })} style={inputStyle} />
                  <div className="form-responsive-row">
                    <input placeholder="Provinsi" value={newAddr.province} onChange={e => setNewAddr({ ...newAddr, province: e.target.value })} style={inputStyle} />
                    <input placeholder="Kode Pos" value={newAddr.postalCode} onChange={e => setNewAddr({ ...newAddr, postalCode: e.target.value })} style={inputStyle} />
                  </div>
                  <button onClick={addAddress} style={{ background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 24px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', width: '100%', marginTop: '4px' }}>Simpan Alamat Baru</button>
                </div>
              )}
            </div>

            {/* AREA PEMBAYARAN */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="2" y1="10" x2="22" y2="10"></line>
                </svg>
                <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Metode Pembayaran</span>
              </div>

              <div style={{ border: '2px solid #2563eb', padding: '14px', borderRadius: '10px', background: '#f0f7ff', fontWeight: 700, fontSize: '14px', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                QRIS / E-Wallet (Otomatis Terpilih)
              </div>

              <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '13px', textAlign: 'center', color: '#475569', fontWeight: 500, lineHeight: '1.5' }}>
                  Silakan scan QRIS SHINE Store di bawah ini menggunakan aplikasi e-wallet atau Mobile Banking Anda:
                </div>
                
                <img 
                  src="/qris1.jpeg" 
                  alt="QRIS Pembayaran SHINE" 
                  style={{ width: '190px', height: '190px', objectFit: 'contain', background: '#fff', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} 
                  onError={(e)=>{
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' stroke='%23cbd5e1' stroke-width='2'%3E%3Crect width='18' height='18' x='3' y='3' rx='2'/%3E%3Cpath d='m7 11 2 2 4-4'/%3E%3C/svg%3E";
                  }}
                />

                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', width: '100%', boxSizing: 'border-box' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>Keterangan Pembayaran</h4>
                  <p style={{ margin: 0, fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
                    Pastikan nominal pembayaran sesuai dengan <strong>Total Tagihan</strong> Anda. Setelah berhasil melakukan transfer, simpan struk pembayaran dan wajib unggah pada form di bawah sebagai bukti validasi admin.
                  </p>
                </div>

                <div style={{ width: '100%', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                    Upload Bukti Transfer Resmi (.png / .jpg):
                  </label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    style={{ fontSize: '13px', color: '#475569', width: '100%' }} 
                  />
                </div>

                {previewUrl && (
                  <div style={{ marginTop: '4px', textAlign: 'center', background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%', boxSizing: 'border-box' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px', fontWeight: 600 }}>File Berhasil Dipilih (Preview):</div>
                    <img src={previewUrl} alt="Bukti Transfer" style={{ maxWidth: '140px', maxHeight: '180px', borderRadius: '6px', objectFit: 'contain', border: '1px solid #cbd5e1' }} />
                  </div>
                )}
              </div>
            </div>

            {/* Box Daftar Produk */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                  <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                </svg>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>Daftar Produk ({cartItems.length})</span>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>SHINE Official Store</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {cartItems.map(item => {
                  const productImgUrl = item.product?.image || item.product?.imageUrl || '/placeholder.jpg';
                  return (
                    <div key={item.id} className="product-item-responsive">
                      <div style={{ width: '68px', height: '84px', background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, border: '1px solid #e2e8f0' }}>
                        <img 
                          src={productImgUrl} 
                          alt={item.product?.name || 'Produk SHINE'} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          onError={(e) => { 
                            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' stroke='%23cbd5e1' stroke-width='2'%3E%3Crect width='18' height='18' x='3' y='3' rx='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E"; 
                          }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.product?.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <span>Qty: <strong>{item.quantity}</strong></span>
                          {item.size && <span>• Size: <strong>{item.size}</strong></span>}
                          {item.color && <span>• Warna: <strong>{item.color}</strong></span>}
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>
                          Rp {Number(item.product?.price || 0).toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* KOLOM KANAN */}
          <div className="summary-sticky-card">
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ringkasan Pesanan</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#475569', marginBottom: '12px' }}>
              <span>Subtotal ({cartItems.length} produk)</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#475569', marginBottom: '12px' }}>
              <span>Pengiriman</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>GRATIS</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#475569', marginBottom: '16px' }}>
              <span>Biaya Layanan</span>
              <span style={{ color: '#0f172a' }}>Rp {serviceFee.toLocaleString('id-ID')}</span>
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', color: '#0f172a', marginBottom: '24px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700 }}>Total Tagihan</span>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#2563eb' }}>Rp {total.toLocaleString('id-ID')}</span>
            </div>

            {isSuccess && (
              <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Pesanan Sukses! Mengalihkan...</span>
              </div>
            )}

            <button onClick={placeOrder} disabled={placing || isSuccess}
              style={{ width: '100%', background: isSuccess ? '#10b981' : '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', padding: '16px', fontSize: '14px', fontWeight: 700, cursor: (placing || isSuccess) ? 'not-allowed' : 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px', transition: 'all 0.2s' }}
            >
              {isSuccess ? 'Berhasil ✔' : placing ? 'Memproses...' : 'Pesan Sekarang'}
            </button>
          </div>

        </div>
      </div>

      <style jsx global>{`
        .main-checkout-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 32px;
          align-items: start;
        }
        .summary-sticky-card {
          background: #fff;
          border-radius: 12px;
          padding: 24px;
          border: 1px solid #e2e8f0;
          position: sticky;
          top: 110px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        .form-responsive-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0 12px;
        }
        .product-item-responsive {
          display: flex;
          gap: 16px;
          align-items: center;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 16px;
        }
        @media (max-width: 991px) {
          .main-checkout-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .summary-sticky-card {
            position: static !important;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          }
        }
        @media (max-width: 640px) {
          .form-responsive-row {
            grid-template-columns: 1fr !important;
          }
          .product-item-responsive {
            align-items: flex-start !important;
          }
        }
      `}</style>
    </div>
  );
}