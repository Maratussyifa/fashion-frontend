'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://fashion-backend-production-d453.up.railway.app';

// Data Cadangan Lokal
const mockOrders = [
  { id: '14', pembeli: 'Andi Wijaya', tanggal: '2026-06-01', total: 185000, status: 'SUCCESS', metode: 'Transfer Bank', item: '1x Kemeja Flanel Premium' },
  { id: '15', pembeli: 'Siti Rahma', tanggal: '2026-05-31', total: 240000, status: 'PENDING', metode: 'E-Wallet', item: '2x Kaos Oversize Hitam' },
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | number | null>(null);

  useEffect(() => {
    fetchOrdersFromBackend();
  }, []);

  // Ambil semua orderan masuk (GET /orders)
  async function fetchOrdersFromBackend() {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const res = await fetch(`${BASE}/orders`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) throw new Error('Gagal mengambil data dari server utama');
      const data = await res.json();
      
      let rawOrders = [];
      if (Array.isArray(data)) rawOrders = data;
      else if (data.orders && Array.isArray(data.orders)) rawOrders = data.orders;
      else if (data.data && Array.isArray(data.data)) rawOrders = data.data;

      if (rawOrders.length > 0) {
        setOrders(rawOrders);
      } else {
        setOrders(mockOrders);
      }
    } catch (e) {
      console.warn("Koneksi API pesanan bermasalah. Mengaktifkan data simulasi lokal.", e);
      setOrders(mockOrders); 
    } finally {
      setLoading(false);
    }
  }

  // Update Status Pesanan (PATCH /orders/{id}/status)
  async function handleUpdateStatus(orderId: string | number, newStatus: string) {
    try {
      setUpdatingId(orderId);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const formattedStatus = newStatus.toUpperCase();

      const res = await fetch(`${BASE}/orders/${orderId}/status`, {
        method: 'PATCH', 
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: formattedStatus })
      });

      if (!res.ok) throw new Error('Gagal memperbarui status transaksi');
      
      // Sinkronisasi Instan UI Lokal
      setOrders(prev => prev.map(o => {
        const currentId = o.id ?? o.order_id ?? o._id;
        if (String(currentId) === String(orderId)) {
          return { ...o, status: formattedStatus, order_status: formattedStatus };
        }
        return o;
      }));

      alert(`Status pesanan #${orderId} berhasil di-sinkronkan ke ${formattedStatus}!`);
    } catch (err) {
      alert('Gagal memperbarui status ke server backend Railway.');
    } finally {
      setUpdatingId(null);
    }
  }

  // Fungsi Pembantu Pengecekan & Perhitungan Harga Total
  function parseTotalPay(o: any): number {
    // 1. Cek semua variasi field harga nominal yang mungkin dikirim oleh Back-End
    if (o.total !== undefined && o.total !== null) return Number(o.total);
    if (o.totalHarga !== undefined && o.totalHarga !== null) return Number(o.totalHarga);
    if (o.total_price !== undefined && o.total_price !== null) return Number(o.total_price);
    if (o.grand_total !== undefined && o.grand_total !== null) return Number(o.grand_total);
    if (o.amount !== undefined && o.amount !== null) return Number(o.amount);
    if (o.price !== undefined && o.price !== null) return Number(o.price);

    // 2. Jika field di atas 0 / tidak ada, tapi ada array orderItems/items, kita hitung manual (Fallback kalkulasi)
    const itemsArray = o.orderItems ?? o.items ?? [];
    if (Array.isArray(itemsArray) && itemsArray.length > 0) {
      return itemsArray.reduce((acc: number, item: any) => {
        const itemPrice = item.price ?? item.harga ?? item.product?.price ?? 0;
        const itemQty = item.quantity ?? item.qty ?? item.jumlah ?? 1;
        return acc + (Number(itemPrice) * Number(itemQty));
      }, 0);
    }

    return 0;
  }

  // Fungsi Pembantu Ringkasan Nama Item Produk
  function parseItemsSummary(o: any): string {
    if (o.item) return o.item;
    if (o.items_summary) return o.items_summary;

    const itemsArray = o.orderItems ?? o.items ?? [];
    if (Array.isArray(itemsArray) && itemsArray.length > 0) {
      return itemsArray
        .map((item: any) => {
          const name = item.product?.name || item.productName || item.name || 'Produk';
          const qty = item.quantity ?? item.qty ?? 1;
          return `${qty}x ${name}`;
        })
        .join(', ');
    }
    return 'Detail produk';
  }

  const filtered = orders.filter(o => {
    const namaPembeli = o.pembeli ?? o.customer?.name ?? o.user?.name ?? o.customer_name ?? 'Pelanggan Anonim';
    const idOrder = o.id ?? o.order_id ?? o._id ?? '';
    const statusPesanan = o.status ?? o.order_status ?? 'PENDING';
    
    const matchesSearch = 
      String(namaPembeli).toLowerCase().includes(search.toLowerCase()) || 
      String(idOrder).toLowerCase().includes(search.toLowerCase());
    
    if (statusFilter === 'Semua Status') return matchesSearch;
    return matchesSearch && statusPesanan.toUpperCase() === statusFilter.toUpperCase();
  });

  const getStatusStyle = (status: string) => {
    const s = String(status).toUpperCase();
    if (s === 'SUCCESS' || s === 'SELESAI') {
      return { bg: '#eafaf1', color: '#117b34', label: 'Selesai' };
    }
    return { bg: '#fef2f2', color: '#dc2626', label: 'Pending' };
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', width: '100%', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* TOPBAR / HEADER */}
      <div className="admin-header" style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0a1628', margin: 0 }}>Manajemen Pesanan SHINE (Admin)</h2>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>{orders.length} transaksi masuk terpantau</p>
        </div>
        <button onClick={() => router.push('/admin/dashboard')} style={{ background: '#fff', color: '#0a1628', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          Kembali ke Dashboard
        </button>
      </div>

      {/* UTAMA KONTEN CONTAINER */}
      <div className="admin-container" style={{ padding: '32px' }}>
        
        {/* FILTER & PENCARIAN BOX */}
        <div className="filter-box" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '14px 20px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, width: '100%' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari ID transaksi atau nama pembeli..." style={{ width: '100%', border: 'none', outline: 'none', fontSize: '14px', background: 'transparent' }} />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', background: '#f8fafc', cursor: 'pointer', outline: 'none' }} className="filter-select">
            <option value="Semua Status">Semua Status</option>
            <option value="PENDING">Pending</option>
            <option value="SUCCESS">Selesai</option>
          </select>
        </div>

        {/* LOADING & EMPTY STATE STATUS */}
        {loading && (
          <div style={{ background: '#fff', padding: '40px', textAlign: 'center', color: '#64748b', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '14px', fontWeight: 500 }}>
            Sinkronisasi riwayat transaksi server...
          </div>
        )}
        
        {!loading && filtered.length === 0 && (
          <div style={{ background: '#fff', padding: '40px', textAlign: 'center', color: '#94a3b8', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '14px' }}>
            Tidak ada riwayat pesanan ditemukan.
          </div>
        )}

        {/* DATA CONTAINER (DESKTOP VIEW: TABLE) */}
        {!loading && filtered.length > 0 && (
          <div className="desktop-table-container" style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['ID Pesanan', 'Pembeli', 'Item Produk', 'Total Bayar', 'Status Transaksi', 'Ubah Status'].map(h => (
                    <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((o, i) => {
                  const orderId = o.id ?? o.order_id ?? o._id ?? `ORD-${1000 + i}`;
                  const customer = o.pembeli ?? o.customer?.name ?? o.user?.name ?? o.customer_name ?? 'Pelanggan Anonim';
                  const status = o.status ?? o.order_status ?? 'PENDING';
                  const badge = getStatusStyle(status);
                  const selectValue = (status.toUpperCase() === 'SUCCESS' || status.toUpperCase() === 'SELESAI') ? 'SUCCESS' : 'PENDING';
                  
                  // Menggunakan fungsi pembantu pintar baru kita
                  const totalPay = parseTotalPay(o);
                  const items = parseItemsSummary(o);

                  return (
                    <tr key={String(orderId)} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 700, fontFamily: 'monospace', color: '#0a1628' }}>#{orderId}</td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>{customer}</td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: '#64748b' }}>{items}</td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 700, color: '#0a1628' }}>Rp {totalPay.toLocaleString('id-ID')}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ background: badge.bg, color: badge.color, fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '12px', display: 'inline-block' }}>{badge.label}</span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <select disabled={updatingId === orderId} value={selectValue} onChange={e => handleUpdateStatus(orderId, e.target.value)} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', width: '130px', outline: 'none' }}>
                          <option value="PENDING">Pending</option>
                          <option value="SUCCESS">Selesai</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* DATA CONTAINER (MOBILE VIEW: CARDS LIST) */}
        {!loading && filtered.length > 0 && (
          <div className="mobile-cards-container" style={{ display: 'none', flexDirection: 'column', gap: '16px' }}>
            {filtered.map((o, i) => {
              const orderId = o.id ?? o.order_id ?? o._id ?? `ORD-${1000 + i}`;
              const customer = o.pembeli ?? o.customer?.name ?? o.user?.name ?? o.customer_name ?? 'Pelanggan Anonim';
              const status = o.status ?? o.order_status ?? 'PENDING';
              const badge = getStatusStyle(status);
              const selectValue = (status.toUpperCase() === 'SUCCESS' || status.toUpperCase() === 'SELESAI') ? 'SUCCESS' : 'PENDING';
              
              // Menggunakan fungsi pembantu pintar baru kita
              const totalPay = parseTotalPay(o);
              const items = parseItemsSummary(o);

              return (
                <div key={`mob-${orderId}`} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                    <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '14px', color: '#0a1628' }}>#{orderId}</span>
                    <span style={{ background: badge.bg, color: badge.color, fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '10px' }}>{badge.label}</span>
                  </div>
                  
                  <div style={{ fontSize: '13px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div><strong style={{ color: '#0a1628' }}>Pembeli:</strong> {customer}</div>
                    <div><strong style={{ color: '#0a1628' }}>Item:</strong> {items}</div>
                    <div style={{ fontSize: '15px', marginTop: '4px' }}><strong style={{ color: '#0a1628' }}>Total:</strong> <span style={{ color: '#0a1628', fontWeight: 700 }}>Rp {totalPay.toLocaleString('id-ID')}</span></div>
                  </div>

                  <div style={{ paddingTop: '8px', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Aksi Ubah Status:</label>
                    <select disabled={updatingId === orderId} value={selectValue} onChange={e => handleUpdateStatus(orderId, e.target.value)} style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 600, background: '#fff' }}>
                      <option value="PENDING">Pending</option>
                      <option value="SUCCESS">Selesai</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* CORE CSS RESPONSIVE ENGINE INJECTOR */}
      <style>{`
        @media (max-width: 768px) {
          .admin-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            padding: 16px !important;
          }
          .admin-header button {
            width: 100% !important;
            text-align: center;
          }
          .admin-container {
            padding: 16px !important;
          }
          .filter-box {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          .filter-select {
            width: 100% !important;
          }
          .desktop-table-container {
            display: none !important;
          }
          .mobile-cards-container {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}