'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

interface OrderItem {
  id: string | number;
  invoiceNumber?: string;
  customerName?: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  user?: { name: string };
  orderItems?: any[]; // Tambahan penampung rincian produk per order
  items?: any[];
}

interface ProductItem {
  id: string | number;
  name: string;
  price: number;
  soldCount?: number;
  sales?: number;
  sold?: number;
  totalSold?: number;
  terjual?: number;
  imageUrl?: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendapatan: 0,
    order: 0,
    produk: 0,
    user: 0
  });

  const [recentOrders, setRecentOrders] = useState<OrderItem[]>([]);
  const [topProducts, setTopProducts] = useState<ProductItem[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Fungsi pembantu mengekstrak data jumlah terjual secara dinamis
  function parseSoldCount(p: ProductItem): number {
    if (p.soldCount !== undefined && p.soldCount !== null) return Number(p.soldCount);
    if (p.sales !== undefined && p.sales !== null) return Number(p.sales);
    if (p.sold !== undefined && p.sold !== null) return Number(p.sold);
    if (p.totalSold !== undefined && p.totalSold !== null) return Number(p.totalSold);
    if (p.terjual !== undefined && p.terjual !== null) return Number(p.terjual);
    return 0;
  }

  async function loadDashboardData() {
    try {
      setLoading(true);
      
      // Menembak 3 endpoint secara paralel
      const [resSummary, resOrders, resProducts] = await Promise.all([
        authFetch('/reports/summary'),
        authFetch('/orders'),
        authFetch('/products')
      ]);

      // 1. Proses Data Ringkasan (Summary)
      let summaryData = { pendapatan: 0, order: 0, produk: 0, user: 0 };
      if (resSummary.ok) {
        const jsonSummary = await resSummary.json();
        const data = jsonSummary.data ?? jsonSummary;
        summaryData = {
          pendapatan: Number(data.totalRevenue ?? data.revenue ?? data.pendapatan ?? 0),
          order: Number(data.totalOrders ?? data.ordersCount ?? data.order ?? 0),
          produk: Number(data.totalProducts ?? data.productsCount ?? data.produk ?? 0),
          user: Number(data.totalUsers ?? data.usersCount ?? data.user ?? 0)
        };
      }

      // 2. Proses Data Transaksi
      let rawOrders = [];
      if (resOrders.ok) {
        const jsonOrders = await resOrders.json();
        rawOrders = jsonOrders.data ?? jsonOrders ?? [];
      }

      // 3. Proses Data Produk
      let rawProducts = [];
      if (resProducts.ok) {
        const jsonProducts = await resProducts.json();
        rawProducts = jsonProducts.data ?? jsonProducts ?? [];
      }

      const safeOrders: OrderItem[] = Array.isArray(rawOrders) ? rawOrders : [];
      const safeProducts: ProductItem[] = Array.isArray(rawProducts) ? rawProducts : [];

      // 4. Sinkronisasi State Statistik Card
      if (summaryData.pendapatan > 0 || summaryData.order > 0) {
        setStats(summaryData);
      } else {
        const kalkulasiPendapatanFallback = safeOrders
          .filter(o => {
            const statusLower = o.status?.toLowerCase();
            return statusLower === 'success' || statusLower === 'paid' || statusLower === 'selesai';
          })
          .reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);

        setStats({
          pendapatan: kalkulasiPendapatanFallback,
          order: safeOrders.length,
          produk: safeProducts.length,
          user: summaryData.user > 0 ? summaryData.user : 0
        });
      }

      // Set 5 data order transaksi teratas
      setRecentOrders(safeOrders.slice(0, 5));

      // 5. Cek data "soldCount", jika semua produk bernilai 0, aktifkan Kalkulasi Fallback Terlaris dari Rincian Order
      const apakahSemuaNol = safeProducts.every(p => parseSoldCount(p) === 0);
      let produkHasilProses = [...safeProducts];

      if (apakahSemuaNol && safeOrders.length > 0) {
        // Map untuk menampung hitungan kuantitas per ID produk: { "ID_PRODUK": JUMLAH_TERJUAL }
        const hitungTerjualMap: Record<string | number, number> = {};

        safeOrders.forEach(order => {
          const statusLower = order.status?.toLowerCase();
          // Hanya hitung pesanan yang sudah berhasil/selesai/dibayar
          if (statusLower === 'success' || statusLower === 'paid' || statusLower === 'selesai') {
            const itemsList = order.orderItems ?? order.items ?? [];
            if (Array.isArray(itemsList)) {
              itemsList.forEach(item => {
                // Ambil ID produk (tergantung penamaan objek relasi backend)
                const pId = item.productId ?? item.product_id ?? item.product?.id;
                const qty = item.quantity ?? item.qty ?? item.jumlah ?? 1;
                
                if (pId) {
                  hitungTerjualMap[pId] = (hitungTerjualMap[pId] || 0) + Number(qty);
                }
              });
            }
          }
        });

        // Injeksikan hasil hitung manual ke dalam array produk
        produkHasilProses = produkHasilProses.map(p => {
          if (hitungTerjualMap[p.id]) {
            return { ...p, soldCount: hitungTerjualMap[p.id] };
          }
          return p;
        });
      }

      // Urutkan produk terlaris berdasarkan fungsi pembantu baru
      const urutanTerlaris = produkHasilProses
        .sort((a, b) => parseSoldCount(b) - parseSoldCount(a))
        .slice(0, 5);
        
      setTopProducts(urutanTerlaris);

    } catch (error) {
      console.error("Gagal memuat data dashboard dari backend:", error);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    { 
      title: 'TOTAL PENDAPATAN', 
      value: `Rp ${stats.pendapatan.toLocaleString('id-ID')}`, 
      color: '#fef3c7',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      )
    },
    { 
      title: 'TOTAL ORDER', 
      value: stats.order.toString(), 
      color: '#e0f2fe',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
          <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
        </svg>
      )
    },
    { 
      title: 'TOTAL PRODUK', 
      value: stats.produk.toString(), 
      color: '#f0fdf4',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.38 3.46L16 2.14a2 2 0 0 0-1.16 0L4.1 6.18a2 2 0 0 0-1.2 1.83v8a2 2 0 0 0 1.2 1.83l10.74 4a2 2 0 0 0 1.16 0l10.74-4a2 2 0 0 0 1.2-1.83v-8a2 2 0 0 0-1.2-1.83zM12 22V12"></path>
        </svg>
      )
    },
    { 
      title: 'TOTAL USER', 
      value: stats.user.toLocaleString('id-ID'), 
      color: '#fae8ff',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a21caf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    },
  ];

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Top Navbar Header */}
      <div style={{ minHeight: '70px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0a1628', margin: 0 }}>Selamat datang kembali, Admin</h2>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Berikut adalah ringkasan performa toko SHINE hari ini.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => router.push('/home')} 
            style={{ background: '#ffffff', color: '#0a1628', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a1628" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="hide-on-mobile">Lihat Toko</span>
          </button>

          <button 
            onClick={loadDashboardData} 
            style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            <span className="hide-on-mobile">Perbarui Data</span>
          </button>
          
          <button 
            onClick={() => router.push('/admin/products')} 
            style={{ background: '#0a1628', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(10,22,40,0.15)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Tambah Produk
          </button>
        </div>
      </div>

      {/* Konten Utama Dashboard */}
      <div style={{ padding: '24px', flex: 1 }}>
        
        {/* Grid Menampilkan 4 Card Utama */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {statCards.map((card, idx) => (
            <div 
              key={idx} 
              style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  {card.title}
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0a1628', margin: '4px 0 0' }}>
                  {card.value}
                </h3>
              </div>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {card.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Pemantau Tabel Dua Kolom */}
        <div className="table-grid" style={{ display: 'grid', gap: '24px' }}>
          
          {/* Sisi Kiri: Order Terbaru */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0a1628', margin: 0 }}>Order Terbaru</h3>
              <button 
                onClick={() => router.push('/admin/orders')} 
                style={{ fontSize: '12px', fontWeight: 600, color: '#0a1628', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Lihat Semua →
              </button>
            </div>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid #cbd5e1', borderTopColor: '#0a1628', borderRadius: '50%' }}></div>
                Memuat data terbaru...
              </div>
            ) : recentOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', color: '#94a3b8', fontSize: '13px', border: '1px dashed #e2e8f0', borderRadius: '12px' }}>
                Belum ada data transaksi masuk.
              </div>
            ) : (
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', minWidth: '400px', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>
                      <th style={{ padding: '10px 4px', fontWeight: 600 }}>Invoice / Nama</th>
                      <th style={{ padding: '10px 4px', fontWeight: 600 }}>Total Harga</th>
                      <th style={{ padding: '10px 4px', fontWeight: 600, textAlign: 'right' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order, i) => {
                      const isSuccess = ['success', 'paid', 'selesai'].includes(order.status?.toLowerCase());
                      return (
                        <tr key={order.id || i} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '12px 4px' }}>
                            <div style={{ fontWeight: 700, color: '#0a1628', fontFamily: 'monospace' }}>{order.invoiceNumber || `#TRX-${order.id}`}</div>
                            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>{order.user?.name || order.customerName || 'Pelanggan'}</div>
                          </td>
                          <td style={{ padding: '12px 4px', color: '#334155', fontWeight: 700 }}>
                            Rp {(order.totalPrice || 0).toLocaleString('id-ID')}
                          </td>
                          <td style={{ padding: '12px 4px', textAlign: 'right' }}>
                            <span style={{ 
                              fontSize: '11px', padding: '4px 8px', borderRadius: '12px', fontWeight: 600,
                              background: isSuccess ? '#eafaf1' : '#fef3c7',
                              color: isSuccess ? '#117b34' : '#b45309',
                              textTransform: 'capitalize'
                            }}>
                              {order.status || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sisi Ranan: Produk Terlaris */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0a1628', margin: 0 }}>Produk Terlaris</h3>
            </div>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid #cbd5e1', borderTopColor: '#0a1628', borderRadius: '50%' }}></div>
                Memuat data statistik...
              </div>
            ) : topProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', color: '#94a3b8', fontSize: '13px', border: '1px dashed #e2e8f0', borderRadius: '12px' }}>
                Data penjualan produk belum tersedia.
              </div>
            ) : (
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', minWidth: '400px', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>
                      <th style={{ padding: '10px 4px', fontWeight: 600 }}>Nama Produk</th>
                      <th style={{ padding: '10px 4px', fontWeight: 600 }}>Harga</th>
                      <th style={{ padding: '10px 4px', fontWeight: 600, textAlign: 'right' }}>Terjual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product, i) => (
                      <tr key={product.id || i} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '12px 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', overflow: 'hidden', flexShrink: 0 }}>
                            {product.imageUrl ? <img src={product.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '9px', color: '#cbd5e1' }}>IMG</span>}
                          </div>
                          <span style={{ fontWeight: 600, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                            {product.name}
                          </span>
                        </td>
                        <td style={{ padding: '12px 4px', color: '#0f172a', fontWeight: 500 }}>
                          Rp {(product.price || 0).toLocaleString('id-ID')}
                        </td>
                        <td style={{ padding: '12px 4px', textAlign: 'right', fontWeight: 700, color: '#0a1628' }}>
                          {parseSoldCount(product)} pcs
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Global CSS Media Queries */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spinner {
          animation: spin 0.8s linear infinite;
        }
        
        .table-grid {
          grid-template-columns: 1fr 1fr;
        }

        @media (max-width: 1024px) {
          .table-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 640px) {
          .hide-on-mobile {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}