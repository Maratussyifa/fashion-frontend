'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cartApi } from '@/lib/api';

const BG = ['#EEF2FF','#F0FDF4','#FFFBEB','#FFF1F2','#F0F9FF','#FDF4FF'];

function BoxIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    loadCart();
  }, []);

  async function loadCart() {
    try {
      const data = await cartApi.get();
      const cartItems = data.items || data || [];
      setItems(cartItems);
      setChecked(new Set(cartItems.map((i: any) => i.id)));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function updateQty(id: number, qty: number) {
    if (qty < 1) return;
    try {
      await cartApi.updateItem(id, qty);
      setItems(items.map(i => i.id === id ? { ...i, quantity: qty } : i));
    } catch (e) { console.error(e); }
  }

  async function removeItem(id: number) {
    try {
      await cartApi.deleteItem(id);
      setItems(items.filter(i => i.id !== id));
      setChecked(prev => { const s = new Set(prev); s.delete(id); return s; });
    } catch (e) { console.error(e); }
  }

  function toggleCheck(id: number) {
    setChecked(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }

  function toggleAll() {
    if (checked.size === items.length) setChecked(new Set());
    else setChecked(new Set(items.map(i => i.id)));
  }

  const selectedItems = items.filter(i => checked.has(i.id));
  const subtotal = selectedItems.reduce((sum, i) => sum + Number(i.product?.price || 0) * i.quantity, 0);
  const shipping = selectedItems.length > 0 ? 15000 : 0;
  const total = subtotal + shipping;

  function goCheckout() {
    if (selectedItems.length === 0) { alert('Pilih minimal 1 item'); return; }
    localStorage.setItem('checkoutItems', JSON.stringify(selectedItems.map(i => i.id)));
    router.push('/checkout');
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      <div style={{ maxWidth: 1100, width: '100%', margin: '0 auto', padding: '110px 16px 60px', boxSizing: 'border-box', flex: 1 }}>
        
        <div style={{ marginTop: '-10px', marginBottom: '15px' }}>
          <Link href="/home" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}>
            ← Kembali ke Beranda
          </Link>
        </div>

        <div style={{ paddingBottom: '8px', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Keranjang Belanja</h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px', margin: 0 }}>Kamu memiliki {items.length} produk di dalam keranjang</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, color: '#64748b' }}>
            <div style={{ width: 40, height: 40, border: '3px solid #dbeafe', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            Memuat keranjang...
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <div style={{ marginBottom: 20, background: '#eff6ff', width: 70, height: 70, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Keranjang Belanja Kosong</h2>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24, maxWidth: 320, lineHeight: 1.5 }}>Yuk, kembali lihat katalog kami dan temukan produk fashion premium favoritmu!</p>
            <button onClick={() => router.push('/home')} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 36px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              Mulai Belanja
            </button>
          </div>
        ) : (
          /* Menggunakan Class Name untuk Kontrol Responsive Grid */
          <div className="cart-grid-layout">
            
            {/* Bagian Kiri: Daftar Items */}
            <div>
              <div style={{ background: '#fff', borderRadius: 16, padding: '14px 20px', marginBottom: 14, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12 }}>
                <input type="checkbox" checked={checked.size === items.length} onChange={toggleAll} style={{ width: 18, height: 18, accentColor: '#2563eb', cursor: 'pointer' }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Pilih Semua ({items.length} produk)</span>
              </div>

              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                {items.map((item, i) => (
                  <div key={item.id} className="cart-item-row" style={{ borderBottom: i < items.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    
                    {/* Checkbox dan Thumbnail Gambar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                      <input type="checkbox" checked={checked.has(item.id)} onChange={() => toggleCheck(item.id)} style={{ width: 18, height: 18, accentColor: '#2563eb', cursor: 'pointer' }} />
                      <div style={{ width: 80, height: 80, borderRadius: 12, background: BG[i % BG.length], display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                        {item.product?.imageUrl ? (
                          <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <BoxIcon />
                        )}
                      </div>
                    </div>

                    {/* Informasi Produk */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.product?.name}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                        {item.size && `Ukuran: ${item.size}`}{item.size && item.color && ' · '}{item.color && `Warna: ${item.color}`}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#2563eb' }}>Rp {Number(item.product?.price || 0).toLocaleString('id-ID')}</div>
                    </div>

                    {/* Pengatur Kuantitas & Tombol Hapus */}
                    <div className="cart-action-block">
                      <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
                        <button onClick={() => updateQty(item.id, item.quantity - 1)} style={{ width: 28, height: 28, border: 'none', background: '#f8fafc', cursor: 'pointer', fontSize: 14, color: '#334155', fontWeight: 600 }}>−</button>
                        <span style={{ minWidth: 32, textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, item.quantity + 1)} style={{ width: 28, height: 28, border: 'none', background: '#f8fafc', cursor: 'pointer', fontSize: 14, color: '#334155', fontWeight: 600 }}>+</button>
                      </div>
                      <button onClick={() => removeItem(item.id)} style={{ fontSize: 12, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: '4px' }}>Hapus</button>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* Bagian Kanan: Ringkasan Belanja */}
            <div className="cart-summary-card">
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 16, marginTop: 0 }}>Ringkasan Belanja</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b', marginBottom: 10 }}>
                <span>Total Item ({selectedItems.length})</span>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b', marginBottom: 14 }}>
                <span>Ongkos Kirim</span>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>Rp {shipping.toLocaleString('id-ID')}</span>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                  <span>Total Harga</span>
                  <span style={{ color: '#2563eb', fontSize: 17 }}>Rp {total.toLocaleString('id-ID')}</span>
                </div>
              </div>
              <button onClick={goCheckout} style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 12, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                Checkout ({selectedItems.length})
              </button>
            </div>

          </div>
        )}
      </div>

      {/* SUNTIKAN INJECT STYLING GLOBAL RESPONSIVE DESKTOP & MOBILE */}
      <style jsx global>{`
        /* Tata Letak Utama Grid */
        .cart-grid-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
          align-items: start;
        }

        /* Desain Blok Sticky Ringkasan */
        .cart-summary-card {
          background: #fff;
          border-radius: 16px;
          padding: 20px;
          border: 1px solid #e2e8f0;
          position: sticky;
          top: 110px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.01);
        }

        /* Desain Dasar Baris Item Produk */
        .cart-item-row {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 20px;
          transition: background 0.2s ease;
        }

        /* Blok Kontrol Aksi Qty & Hapus */
        .cart-action-block {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
          flex-shrink: 0;
        }

        /* === RESPONSIVE TABLET / DESKTOP KECIL === */
        @media (max-width: 991px) {
          .cart-grid-layout {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .cart-summary-card {
            position: static !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.02) !important;
          }
        }

        /* === RESPONSIVE SMARTPHONE / HP SANGAT KECIL === */
        @media (max-width: 640px) {
          .cart-item-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 14px !important;
            padding: 16px !important;
          }
          
          .cart-action-block {
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
            width: 100% !important;
            margin-top: 4px !important;
            padding-top: 12px !important;
            border-top: 1px dashed #f1f5f9;
          }
        }
      `}</style>
    </div>
  );
}