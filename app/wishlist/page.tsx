'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Shirt } from 'lucide-react';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://fashion-backend-production-d453.up.railway.app';

const getFullImageUrl = (url: any) => {
  if (url && typeof url === 'object') {
    url = url.imageUrl || url.image || url.url || url.imagepath || url.imagePath || '';
  }
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${BASE}${cleanPath}`;
};

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

const BG = ['#EEF2FF','#F0FDF4','#FFFBEB','#FFF1F2','#F0F9FF','#FDF4FF'];

export default function WishlistPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('token')) { 
      router.push('/login'); 
      return; 
    }
    loadWishlist();
  }, []);

  async function loadWishlist() {
    try {
      setLoading(true);
      const res = await authFetch('/wishlist');
      const homeProductsCache = JSON.parse(localStorage.getItem('wishlistItems') || '[]');

      if (res.ok) {
        const json = await res.json();
        const wishlistData = json.data ?? json ?? [];
        
        const normalizedItems = wishlistData.map((item: any) => {
          let p = item.product ? { ...item.product, wishlistRecordId: item.id } : item;
          const matchCache = homeProductsCache.find((cache: any) => Number(cache.id) === Number(p.id));
          if (matchCache) {
            p.imageUrl = p.imageUrl || matchCache.imageUrl || matchCache.image;
            p.ProductVariant = p.ProductVariant || matchCache.ProductVariant || matchCache.productVariants || matchCache.variants;
          }
          return p;
        });
        setItems(normalizedItems);
      }
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  }

  async function removeWishlist(productId: number | string) {
    try {
      const updated = items.filter(item => item.id !== productId);
      setItems(updated);
      localStorage.setItem('wishlistItems', JSON.stringify(updated));

      await authFetch('/wishlist/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId })
      });
    } catch (e) { 
      console.error(e); 
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* PADDING ATAS DISESUAIKAN AGAR LEBIH NAIK */}
      <div style={{ maxWidth: 1200, width: '100%', margin: '0 auto', padding: '110px 24px 60px', flex: 1 }}>
        
        {/* NEGATIVE MARGIN & JARAK RAPAT */}
        <div style={{ marginTop: '-10px', marginBottom: '15px' }}>
          <Link href="/home" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}>
            ← Kembali ke Beranda
          </Link>
        </div>
        
        <div style={{ paddingBottom: '8px', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Produk Favorit</h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px', margin: 0 }}>Menampilkan {items.length} produk yang kamu sukai</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: '#64748b', fontSize: '14px' }}>
            Memuat wishlist...
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '50%', marginBottom: '16px', display: 'inline-flex' }}>
              <Heart size={40} color="#ef4444" fill="#ef4444" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '8px', margin: 0 }}>Wishlist Kosong</h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px', marginTop: 0 }}>Belum ada produk yang kamu tambahkan ke daftar keinginan.</p>
            <button onClick={() => router.push('/home')} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '12px', padding: '12px 32px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
              Jelajahi Produk
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
            {items.map((product, i) => {
              const variantList = product.ProductVariant || product.productVariants || product.variants || [];
              const rawImgUrl = product.imageUrl || product.image || product.imagePath || 
                                variantList[0]?.imageUrl || variantList[0]?.image || '';
              
              const finalImgSrc = getFullImageUrl(rawImgUrl);

              return (
                <div key={product.id} style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)' }}>
                  
                  {/* TOMBOL REMOVE WISHLIST (MENGGUNAKAN ICON LUCIDE HEART) */}
                  <button 
                    onClick={() => removeWishlist(product.id)} 
                    className="wishlist-heart-btn"
                    style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(4px)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', zIndex: 2, transition: 'all 0.2s ease' }}
                  >
                    <Heart size={18} className="heart-icon" style={{ fill: '#ef4444', stroke: '#ef4444', transition: 'all 0.2s ease' }} />
                  </button>
                  
                  <div onClick={() => router.push(`/products/${product.id}`)} style={{ height: '260px', background: BG[i % BG.length], display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                    {finalImgSrc ? (
                      <img src={finalImgSrc} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    ) : (
                      /* FALLBACK ICON BAJU */
                      <Shirt size={54} style={{ color: '#94a3b8', opacity: 0.7 }} />
                    )}
                  </div>

                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b', marginBottom: '6px', lineHeight: '1.4' }}>{product.name}</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#2563eb' }}>Rp {Number(product.price || 0).toLocaleString('id-ID')}</div>
                    </div>
                    <button onClick={() => router.push(`/products/${product.id}`)} style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '12px', padding: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Lihat Detail</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* STYLE HOVER SINKRONISASI WARNA ICON HEART */}
      <style>{`
        .wishlist-heart-btn:hover {
          transform: scale(1.08);
          background: #ffffff !important;
        }
        .wishlist-heart-btn:hover .heart-icon {
          fill: none !important;
          stroke: #cbd5e1 !important;
        }
      `}</style>
    </div>
  );
}