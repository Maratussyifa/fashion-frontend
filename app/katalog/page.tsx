'use client';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react'; // Menambahkan Suspense di sini
import Link from 'next/link';
import { ArrowLeft, ChevronRight } from 'lucide-react';

// Data Produk Lokal
const EXISTING_PRODUCTS = [
  { id: 1, name: 'Shine Signature Dress', price: 499000, category: 'Dress', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500' },
  { id: 2, name: 'Casual Oversized Blazer', price: 350000, category: 'Outerwear', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500' },
  { id: 3, name: 'Floral Summer Skirt', price: 225000, category: 'Skirt', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500' },
  { id: 4, name: 'Premium Silk Blouse', price: 289000, category: 'Top', image: 'https://images.unsplash.com/photo-1548624149-f1b9f21307fa?w=500' },
  { id: 5, name: 'Linen Wide Trousers', price: 310000, category: 'Pants', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500' },
  { id: 6, name: 'Classic Denim Jacket', price: 420000, category: 'Outerwear', image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500' },
];

// Komponen Konten Utama (Dipisahkan agar bisa dibungkus Suspense)
function KatalogContent() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  
  const searchIntent = searchParams.get('search') ?? '';
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const categories = ['Semua', 'Dress', 'Outerwear', 'Skirt', 'Top', 'Pants'];

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredProducts = EXISTING_PRODUCTS.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchIntent.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!mounted) return <div style={{ paddingTop: '100px', textAlign: 'center' }}>Memuat Katalog...</div>;

  return (
    <div style={{ 
      paddingTop: '90px', 
      paddingBottom: '60px',
      minHeight: '100vh', 
      background: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif' 
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        
        {/* BREADCRUMBS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '13px', color: '#64748b' }}>
          <Link href="/home" style={{ textDecoration: 'none', color: '#64748b', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#0a1628'} onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
            Home
          </Link>
          <ChevronRight size={14} />
          <span style={{ color: '#0f172a', fontWeight: 500 }}>Katalog</span>
        </div>

        {/* Header Informasi */}
        <div style={{ marginBottom: '32px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>Katalog Produk</h1>
          {searchIntent ? (
            <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>
              Menampilkan hasil pencarian untuk: <strong style={{ color: '#0a1628' }}>"{searchIntent}"</strong> ({filteredProducts.length} produk)
            </p>
          ) : (
            <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>Temukan koleksi pakaian eksklusif untuk melengkapi gaya harian Anda.</p>
          )}
        </div>

        {/* Layout Utama */}
        <div className="katalog-container">
          
          {/* SIDEBAR FILTER */}
          <div className="category-sidebar">
            <div className="category-sticky-box">
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', display: 'block' }} className="hidden-mobile">
                Pilih Kategori
              </span>
              
              <div className="category-list">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Tombol Kembali ke Home */}
              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }} className="hidden-mobile">
                <Link href="/home" style={{ textDecoration: 'none' }}>
                  <button style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    background: 'none', 
                    border: '1.5px solid #cbd5e1', 
                    borderRadius: '8px', 
                    color: '#475569', 
                    fontSize: '14px', 
                    fontWeight: 600, 
                    padding: '10px 16px', 
                    width: '100%', 
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#0a1628'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#0a1628'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                  >
                    <ArrowLeft size={16} /> Kembali ke Home
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* AREA PRODUK */}
          <div style={{ flex: 1 }}>
            {filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '16px', color: '#64748b', margin: '0 0 20px 0' }}>Produk tidak ditemukan.</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  <button 
                    onClick={() => { setSelectedCategory('Semua'); window.location.href = '/katalog'; }} 
                    style={{ background: '#0a1628', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '24px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}
                  >
                    Reset Filter
                  </button>
                  <Link href="/home" style={{ textDecoration: 'none' }}>
                    <button style={{ background: '#fff', color: '#475569', border: '1.5px solid #cbd5e1', padding: '10px 24px', borderRadius: '24px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
                      Ke Halaman Utama
                    </button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="product-grid">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="product-card">
                    
                    {/* Pembungkus Gambar Produk */}
                    <div style={{ width: '100%', height: '320px', background: '#f1f5f9', position: 'relative', overflow: 'hidden' }}>
                      <img 
                        src={product.image || 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=500'} 
                        alt={product.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=500';
                        }}
                      />
                    </div>

                    {/* Informasi Detail */}
                    <div style={{ padding: '18px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{product.category}</span>
                      <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: '6px 0 14px 0', height: '44px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.4' }}>
                        {product.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: '#0a1628' }}>
                          Rp {product.price.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* CSS Terpusat & Responsif */}
      <style>{`
        .katalog-container {
          display: flex;
          gap: 40px;
        }
        .category-sidebar {
          width: 260px;
          flex-shrink: 0;
        }
        .category-sticky-box {
          position: sticky;
          top: 100px;
        }
        .category-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .category-btn {
          text-align: left;
          padding: 12px 16px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: #475569;
          font-weight: 500;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .category-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }
        .category-btn.active {
          background: #0a1628;
          color: #fff;
          font-weight: 600;
        }
        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 28px;
        }
        .product-card {
          background: #fff;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 24px -5px rgba(0,0,0,0.07);
        }

        @media (max-width: 768px) {
          .katalog-container {
            flex-direction: column;
            gap: 24px;
          }
          .category-sidebar {
            width: 100%;
          }
          .category-sticky-box {
            position: static;
          }
          .category-list {
            flex-direction: row;
            overflow-x: auto;
            padding-bottom: 8px;
            white-space: nowrap;
            -webkit-overflow-scrolling: touch;
            gap: 8px;
          }
          .category-btn {
            padding: 10px 20px;
            border: 1px solid #e2e8f0;
            background: #fff;
            border-radius: 24px;
            font-size: 14px;
          }
          .hidden-mobile {
            display: none !important;
          }
          .product-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 14px !important;
          }
        }
      `}</style>
    </div>
  );
}

// Export default yang dibungkus dengan Suspense Boundary
export default function KatalogPage() {
  return (
    <Suspense fallback={<div style={{ paddingTop: '100px', textAlign: 'center', color: '#64748b' }}>Memuat Aplikasi Katalog...</div>}>
      <KatalogContent />
    </Suspense>
  );
}