'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ordersApi } from '@/lib/api';
import { Package, MapPin, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    ordersApi.getMy().then((o: any) => setOrders(o)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTop: '3px solid #0a1628', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: '#64748b', fontSize: 14 }}>Memuat daftar pesanan...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', paddingTop: '90px', paddingBottom: '60px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 24px' }}>
        
        {/* Judul Halaman */}
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0a1628', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Pesanan Saya</h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 24px' }}>Pantau status pengiriman dan riwayat transaksi Anda</p>

        {orders.length === 0 ? (
          /* Tampilan Jika Kosong */
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: '60px 24px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Package size={32} color="#94a3b8" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0a1628', margin: '0 0 8px' }}>Belum Ada Pesanan</h3>
            <p style={{ color: '#64748b', fontSize: 14, maxWidth: 320, margin: '0 auto 24px', lineHeight: 1.5 }}>Sepertinya Anda belum melakukan transaksi apa pun.</p>
            <button 
              onClick={() => router.push('/products/all')} 
              style={{ padding: '10px 24px', background: '#0a1628', color: '#fff', border: 'none', borderRadius: '20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1e293b'}
              onMouseLeave={e => e.currentTarget.style.background = '#0a1628'}
            >
              Mulai Belanja <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          /* Tampilan List Pesanan */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map((order: any) => {
              const isPending = order.status?.toUpperCase() === 'PENDING';
              
              {/* PENYELESAIAN MASALAH RP 0: Cek beberapa kemungkinan key dari backend */}
              const totalBayar = order.totalAmount ?? order.totalPrice ?? order.total ?? 0;

              return (
                <div key={order.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
                  
                  {/* Header Card Order */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9', marginBottom: '14px' }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0a1628' }}>ID Order #{order.id}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 12, color: '#94a3b8', marginTop: '2px' }}>
                        <Clock size={12} />
                        {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                    <span style={{ 
                      background: isPending ? '#fef3c7' : '#dcfce7', 
                      color: isPending ? '#d97706' : '#15803d', 
                      fontSize: 11, 
                      fontWeight: 700, 
                      padding: '4px 12px', 
                      borderRadius: '12px', 
                      textTransform: 'capitalize' 
                    }}>
                      {order.status?.toLowerCase()}
                    </span>
                  </div>

                  {/* Daftar Item Baju */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {order.items?.map((item: any) => (
                      <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ width: 52, height: 52, background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          {item.product?.imageUrl ? (
                            <img src={item.product.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <img src="/catalog-denim.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 600, fontSize: '13px', color: '#0a1628', margin: 0 }}>{item.product?.name ?? 'Produk Busana'}</p>
                          <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
                            Jumlah: {item.quantity} {item.size ? ` · Ukuran ${item.size}` : ''}{item.color ? ` · ${item.color}` : ''}
                          </p>
                        </div>
                        <span style={{ fontWeight: 600, color: '#334155', fontSize: '13px' }}>
                          Rp {Number(item.price || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer Card Order: Alamat & Total */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '6px', fontSize: '12px', color: '#64748b', maxWidth: '65%' }}>
                      <MapPin size={14} style={{ flexShrink: 0, marginTop: 1, color: '#94a3b8' }} />
                      <span>
                        {order.address ? `${order.address.street || order.address}, ${order.address.city || ''}` : 'Malang, Jawa Timur'}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>Total Pembayaran</span>
                      <span style={{ fontWeight: 800, fontSize: '15px', color: '#0a1628' }}>
                        Rp {Number(totalBayar).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
        
        {/* Tombol Back */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link href="/home" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: '#64748b', fontSize: 13, fontWeight: 500 }}>
            <ArrowLeft size={14} /> Kembali ke Beranda SHINE
          </Link>
        </div>

      </div>
    </div>
  );
}