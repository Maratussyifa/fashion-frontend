'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { productsApi, categoriesApi } from '@/lib/api';

interface Product {
  id: number | string;
  name: string;
  price: number | string;
  imageUrl?: string;
  category?: { name: string; slug?: string } | string;
  isNew?: boolean;
  isTrending?: boolean;
  discount?: number;
  stock?: number;
}
interface Category {
  id: number | string;
  name: string;
  slug: string;
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') ?? '');
  const [sortBy, setSortBy] = useState('default');
  const [wishlist, setWishlist] = useState<Set<string | number>>(new Set());

  useEffect(() => {
    categoriesApi.getAll().then((c: any) => setCategories(Array.isArray(c) ? c : []));
  }, []);

  useEffect(() => {
    const q = searchParams.get('search') ?? '';
    const cat = searchParams.get('category') ?? '';
    setSearch(q);
    setActiveCategory(cat);
    loadProducts(q, cat);
  }, [searchParams]);

  async function loadProducts(q: string, cat: string) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('search', q);
      if (cat) params.set('category', cat);
      const data = await productsApi.getAll(params.toString()) as any;
      setProducts(Array.isArray(data) ? data : data?.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function applySearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (activeCategory) params.set('category', activeCategory);
    router.push(`/products/all?${params.toString()}`);
  }

  function applyCategory(slug: string) {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (slug) params.set('category', slug);
    router.push(`/products/all?${params.toString()}`);
  }

  function clearAll() {
    setSearch('');
    setActiveCategory('');
    router.push('/products/all');
  }

  function toggleWishlist(id: string | number) {
    setWishlist(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }

  const sorted = [...products].sort((a, b) => {
    if (sortBy === 'price-asc') return Number(a.price) - Number(b.price);
    if (sortBy === 'price-desc') return Number(b.price) - Number(a.price);
    if (sortBy === 'name') return String(a.name).localeCompare(String(b.name));
    return 0;
  });

  const BG = ['#EEF2FF', '#F0FDF4', '#FFFBEB', '#FFF1F2', '#F0F9FF', '#FDF4FF', '#ECFDF5'];
  const EMOJI = ['👕', '👖', '🧥', '👜', '👟', '🎒', '🧢', '👒', '🧣', '🧤'];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1e3a8a 100%)', padding: '48px 24px 36px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Link href="/home" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, textDecoration: 'none' }}>Home</Link>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>›</span>
            <span style={{ color: '#93c5fd', fontSize: 13 }}>Katalog</span>
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(24px,3vw,36px)', fontWeight: 900, color: '#fff', marginBottom: 20 }}>
            {searchParams.get('search') ? `Hasil: "${searchParams.get('search')}"` : 'Semua Produk'}
          </h1>

          {/* Search bar */}
          <form onSubmit={applySearch} style={{ display: 'flex', gap: 8, maxWidth: 560 }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari produk..."
              style={{ flex: 1, padding: '11px 16px', borderRadius: 10, border: 'none', fontSize: 14, outline: 'none' }}
            />
            <button type="submit" style={{ padding: '11px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              Cari
            </button>
            {(search || activeCategory) && (
              <button type="button" onClick={clearAll} style={{ padding: '11px 16px', background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, cursor: 'pointer' }}>
                Reset
              </button>
            )}
          </form>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px' }}>

        {/* Filter & Sort */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>

          {/* Kategori */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => applyCategory('')}
              style={{ padding: '7px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', background: activeCategory === '' ? '#2563eb' : '#e2e8f0', color: activeCategory === '' ? '#fff' : '#475569', transition: 'all 0.2s' }}>
              Semua
            </button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => applyCategory(cat.slug)}
                style={{ padding: '7px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', background: activeCategory === cat.slug ? '#2563eb' : '#e2e8f0', color: activeCategory === cat.slug ? '#fff' : '#475569', transition: 'all 0.2s' }}>
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort & count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>{sorted.length} produk</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              style={{ padding: '7px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, background: '#fff', cursor: 'pointer', outline: 'none' }}>
              <option value="default">Urutkan</option>
              <option value="price-asc">Harga: Terendah</option>
              <option value="price-desc">Harga: Tertinggi</option>
              <option value="name">Nama A–Z</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, color: '#64748b' }}>
            <div style={{ width: 36, height: 36, border: '3px solid #dbeafe', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            Memuat produk...
          </div>
        ) : sorted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 16, color: '#64748b', marginBottom: 16 }}>Produk tidak ditemukan.</div>
            <button onClick={clearAll} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Lihat Semua Produk</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {sorted.map((p, i) => (
              <div key={p.id} onClick={() => router.push(`/products/${p.id}`)}
                style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', border: '1px solid #f1f5f9', transition: 'all 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}>
                <div style={{ height: 200, background: BG[i % BG.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60, position: 'relative' }}>
                  {p.imageUrl
                    ? <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span>{EMOJI[i % EMOJI.length]}</span>}
                  <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 4 }}>
                    {p.isNew && <span style={{ background: '#2563eb', color: '#fff', fontSize: 10, padding: '3px 8px', borderRadius: 99, fontWeight: 700 }}>New</span>}
                    {p.isTrending && <span style={{ background: '#f59e0b', color: '#fff', fontSize: 10, padding: '3px 8px', borderRadius: 99, fontWeight: 700 }}>🔥</span>}
                    {p.discount && p.discount > 0 && <span style={{ background: '#ef4444', color: '#fff', fontSize: 10, padding: '3px 8px', borderRadius: 99, fontWeight: 700 }}>-{p.discount}%</span>}
                  </div>
                  <button onClick={e => { e.stopPropagation(); toggleWishlist(p.id); }}
                    style={{ position: 'absolute', top: 10, right: 10, background: '#fff', border: 'none', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                    {wishlist.has(p.id) ? '❤️' : '🤍'}
                  </button>
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {typeof p.category === 'object' ? p.category?.name : p.category}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#2563eb' }}>Rp {Number(p.price).toLocaleString('id-ID')}</div>
                    <button onClick={e => { e.stopPropagation(); router.push(`/products/${p.id}`); }}
                      style={{ background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>+ Keranjang</button>
                  </div>
                  {p.stock !== undefined && p.stock < 10 && p.stock > 0 && <div style={{ fontSize: 10, color: '#f59e0b', fontWeight: 600, marginTop: 6 }}>Sisa {p.stock}</div>}
                  {p.stock === 0 && <div style={{ fontSize: 10, color: '#ef4444', fontWeight: 600, marginTop: 6 }}>Habis</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default function ProductsAllPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: 80 }}>Memuat...</div>}>
      <ProductsContent />
    </Suspense>
  );
}