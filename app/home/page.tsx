'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; 
import Link from 'next/link';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://fashion-backend-production-d453.up.railway.app';

// Helper penjamin gambar Cloudinary Supabase
const getFullImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const backendBase = 'https://fashion-backend-production-d453.up.railway.app';
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${backendBase}${cleanPath}`;
};

function authFetch(path: string, opts: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return fetch(`${BASE}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts.headers },
  });
}

const productsApi = {
  getAll: async (qs = '') => {
    const r = await authFetch(`/products${qs ? `?${qs}` : ''}`);
    const d = await r.json();
    return d.data ?? d;
  },
};
const categoriesApi = {
  getAll: async () => {
    const r = await authFetch('/categories');
    const d = await r.json();
    return d.data ?? d;
  },
};

interface Product {
  id: number | string;
  name: string;
  price: number | string;
  imageUrl?: string;
  image?: string;
  images?: string[];
  ProductVariant?: any[];
  productVariants?: any[];
  variants?: any[];
  category?: { name: string; slug?: string } | string;
  isNew?: boolean;
  isTrending?: boolean;
  discount?: number;
}
interface Category {
  id: number | string;
  name: string;
  slug: string;
}

function renderCategoryIcon(slug: string, isActive: boolean) {
  const color = isActive ? '#ffffff' : '#1e293b';
  switch (slug?.toLowerCase()) {
    case 'baju':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.38 4.38A2 2 0 0 0 18.25 3H5.75a2 2 0 0 0-2.13 1.38L2 9h4v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9h4z"/>
          <path d="M12 3v3"/>
        </svg>
      );
    case 'celana':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 3h14v3l-2 13H7L5 6Z"/>
          <path d="M12 3v16"/>
        </svg>
      );
    default: 
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
          <path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>
        </svg>
      );
  }
}

// 1. Komponen Utama Konten yang membaca useSearchParams
function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); 
  const urlSearchQuery = searchParams.get('search') ?? '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<Set<string | number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => { 
    async function loadCategories() {
      try {
        const cats = await categoriesApi.getAll();
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (e) { console.error(e); }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    if (urlSearchQuery) {
      setQueryAndFetch(urlSearchQuery);
    } else {
      setSearchQuery('');
      loadDefaultProducts(); 
    }
  }, [urlSearchQuery]);

  async function setQueryAndFetch(q: string) {
    setSearchQuery(q);
    setActiveCategory(''); 
    setLoading(true);
    try {
      const prods = await productsApi.getAll(`search=${encodeURIComponent(q)}`);
      setProducts(Array.isArray(prods) ? prods : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function loadDefaultProducts() {
    setLoading(true);
    try {
      const prods = await productsApi.getAll(activeCategory ? `category=${activeCategory}` : '');
      setProducts(Array.isArray(prods) ? prods : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    async function syncWishlistFromServer() {
      try {
        const res = await authFetch('/wishlist');
        if (res.ok) {
          const json = await res.json();
          const data = json.data ?? json ?? [];
          const serverIds = data.map((item: any) => (item.product?.id || item.id));
          setWishlist(new Set(serverIds));
          
          const backupItems = data.map((item: any) => item.product || item);
          localStorage.setItem('wishlistItems', JSON.stringify(backupItems));
        }
      } catch (err) {
        console.error("Gagal sinkronisasi data wishlist awal:", err);
      }
    }
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      syncWishlistFromServer();
    }
  }, []);

  useEffect(() => {
    if ((searchQuery || activeCategory) && resultRef.current) {
      const timer = setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, activeCategory]);

  async function filterCategory(slug: string) {
    if (activeCategory === slug && !searchQuery) return;
    setActiveCategory(slug);
    
    if (searchQuery) {
      setSearchQuery('');
      router.push(window.location.pathname); 
    }
    
    setLoading(true);
    try {
      const prods = await productsApi.getAll(slug ? `category=${slug}` : '');
      setProducts(Array.isArray(prods) ? prods : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function toggleWishlist(product: Product) {
    if (!localStorage.getItem('token')) {
      router.push('/login');
      return;
    }

    const productId = product.id;
    let localSaved = JSON.parse(localStorage.getItem('wishlistItems') || '[]');

    setWishlist(prev => {
      const s = new Set(prev);
      if (s.has(productId)) {
        s.delete(productId);
        localSaved = localSaved.filter((x: any) => x.id !== productId);
      } else {
        s.add(productId);
        localSaved.push(product);
      }
      localStorage.setItem('wishlistItems', JSON.stringify(localSaved));
      return s;
    });

    try {
      await authFetch('/wishlist/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId: productId })
      });
    } catch (e) {
      console.error("Gagal memperbarui status wishlist di database:", e);
    }
  }

  const isFiltered = searchQuery || activeCategory;
  const trending = isFiltered ? [] : products.filter(p => p.isTrending);

  return (
    <div ref={resultRef} style={{ minHeight: '100vh', background: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1 }}>
        
        {/* Hero Section Premium */}
        {!isFiltered && (
          <div style={{ position: 'relative', minHeight: '82vh', padding: '100px 0 90px 0', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
            <img src="/catalog2.jpg" alt="SHINE Collection" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(95deg, rgba(10,22,44,0.85) 0%, rgba(10,22,44,0.65) 40%, rgba(10,22,44,0.2) 70%, transparent 100%)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 220, background: 'linear-gradient(to top, #ffffff 0%, rgba(255,255,255,0.95) 30%, rgba(255,255,255,0.4) 70%, transparent 100%)' }} />
            
            <div style={{ position: 'relative', zIndex: 10, maxWidth: 1280, margin: '0 auto', width: '100%', padding: '0 24px' }}>
              <div style={{ maxWidth: 600 }}>
                <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(38px, 4.8vw, 56px)', fontWeight: 800, color: '#ffffff', lineHeight: 1.25, marginBottom: 18 }}>
                  Wear Your Story,<br /><span style={{ color: '#93c5fd' }}>Defined by You</span>
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, lineHeight: 1.8, marginBottom: 36, maxWidth: 500 }}>
                  Fashion premium yang mencerminkan siapa dirimu. Temukan koleksi pakaian eksklusif dan terbaik dari kami.
                </p>
                
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 44 }}>
                  <button onClick={() => document.getElementById('katalog-section')?.scrollIntoView({ behavior: 'smooth' })}
                    style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '12px', padding: '16px 36px', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(37,99,235,0.3)' }}>
                    Belanja Sekarang →
                  </button>
                  <button onClick={() => router.push('/katalog')}
                    style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: '12px', padding: '16px 36px', fontSize: 15, fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
                    Lihat Katalog
                  </button>
                </div>
                
                <div style={{ display: 'flex', gap: 48, borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '20px' }}>
                  {([['10K+', 'Pelanggan Happy'], ['500+', 'Brand Ternama'], ['4.9★', 'Rating Toko']] as [string, string][]).map(([num, lbl]) => (
                    <div key={lbl}>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>{num}</div>
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pilihan Kategori */}
        <div id="katalog-section" style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0f172a', margin: 0 }}>Pilihan Kategori</h2>
            <div style={{ width: '28px', height: '2.5px', background: '#2563eb', marginTop: '6px' }} />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <button onClick={() => filterCategory('')} style={{ background: 'none', border: 'none', cursor: 'pointer', width: '72px', padding: 0 }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: activeCategory === '' ? '#2563eb' : '#f8fafc', border: '1px solid #e2e8f0' }}>
                {renderCategoryIcon('', activeCategory === '')}
              </div>
              <p style={{ marginTop: '8px', fontSize: '12px', textAlign: 'center', color: activeCategory === '' ? '#2563eb' : '#64748b' }}>Semua</p>
            </button>
            {categories.map(cat => {
              const isActive = activeCategory === cat.slug;
              return (
                <button key={cat.id} onClick={() => filterCategory(cat.slug)} style={{ background: 'none', border: 'none', cursor: 'pointer', width: '72px', padding: 0 }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isActive ? '#2563eb' : '#f8fafc', border: '1px solid #e2e8f0' }}>
                    {renderCategoryIcon(cat.slug, isActive)}
                  </div>
                  <p style={{ marginTop: '8px', fontSize: '12px', textAlign: 'center', color: isActive ? '#2563eb' : '#64748b' }}>{cat.name}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Bar Pencarian */}
        {searchQuery && (
          <div style={{ maxWidth: 1280, margin: '24px auto 0', padding: '0 24px' }}>
            <div style={{ color: '#64748b', fontSize: '14px', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              Hasil untuk pencarian kata kunci: <strong>"{searchQuery}"</strong>
            </div>
          </div>
        )}

        {loading && <div style={{ textAlign: 'center', padding: 80, color: '#64748b' }}>Memuat produk...</div>}

        {/* List Grid Konten */}
        {!loading && (
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 60px' }}>
            {isFiltered ? (
              products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '15px' }}>Produk tidak ditemukan.</div>
              ) : (
                <ProductGrid products={products} router={router} wishlist={wishlist} toggleWishlist={toggleWishlist} />
              )
            ) : (
              <>
                {trending.length > 0 && (
                  <div style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Produk Terlaris</h2>
                    <ProductGrid products={trending} router={router} wishlist={wishlist} toggleWishlist={toggleWishlist} />
                  </div>
                )}
                {products.length > 0 && trending.length === 0 && (
                  <ProductGrid products={products} router={router} wishlist={wishlist} toggleWishlist={toggleWishlist} />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-Komponen Card Grid
function ProductGrid({ products, router, wishlist, toggleWishlist }: { products: Product[]; router: any; wishlist: Set<string | number>; toggleWishlist: (product: Product) => void }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 28 }}>
      {products.map(p => {
        const priceNum = Number(p.price || 0);
        const variantList = p.ProductVariant || p.productVariants || p.variants || [];
        const variantImg = Array.isArray(variantList) && variantList.length > 0 ? variantList[0]?.imageUrl : '';
        const rawImgUrl = variantImg || p.imageUrl || p.image || p.images?.[0] || '';
        const finalImgSrc = getFullImageUrl(rawImgUrl);

        return (
          <div key={p.id} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', paddingTop: '125%', background: '#f1f5f9', cursor: 'pointer' }} onClick={() => router.push(`/products/${p.id}`)}>
              {finalImgSrc ? (
                <img 
                  src={finalImgSrc} 
                  alt={p.name} 
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
                  onError={(e) => {
                    e.currentTarget.style.opacity = '0';
                    const parent = e.currentTarget.parentElement;
                    if (parent) parent.style.background = '#e2e8f0';
                  }}
                />
              ) : (
                <div style={{ position: 'absolute', inset: 0, background: '#e2e8f0' }} />
              )}
              {p.isNew && <span style={{ position: 'absolute', top: 12, left: 12, background: '#10b981', color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 6 }}>NEW</span>}
            </div>
            
            <button onClick={() => toggleWishlist(p)} style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%', background: '#fff', border: 'none', boxShadow: '0 4px 8px rgba(0,0,0,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
              {wishlist.has(p.id) ? '❤️' : '🤍'}
            </button>

            <div style={{ padding: 18, display: 'flex', flexDirection: 'column', flex: 1 }}>
              <span style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                {typeof p.category === 'object' ? p.category?.name : p.category || 'Baju'}
              </span>
              <h3 onClick={() => router.push(`/products/${p.id}`)} style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', margin: '6px 0 12px', cursor: 'pointer' }}>
                {p.name}
              </h3>
              <div style={{ marginTop: 'auto' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#2563eb' }}>
                  Rp {priceNum.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 2. Export default dibungkus Suspense Boundary agar lolos vercel build
export default function HomePage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '100px', color: '#64748b' }}>Loading Home Component...</div>}>
      <HomePageContent />
    </Suspense>
  );
}