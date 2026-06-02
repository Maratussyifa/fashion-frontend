'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productsApi, cartApi } from '@/lib/api';
import Link from 'next/link';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>('');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      productsApi.getOne(Number(id)),
      productsApi.getVariants(Number(id))
    ]).then(([p, v]) => {
      setProduct(p);
      setVariants(Array.isArray(v) ? v : []);
      if (p) {
        const defaultImg = p.imageUrl || (p.images && p.images[0]) || '';
        setCurrentImage(defaultImg);
      }
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const safeVariants = variants || [];
  const colors = [...new Set(safeVariants.map((v: any) => v?.color).filter(Boolean))];
  const sizes = [...new Set(safeVariants.map((v: any) => v?.size).filter(Boolean))];
  const availableSizes = selectedColor
    ? [...new Set(safeVariants.filter((v: any) => v?.color === selectedColor).map((v: any) => v?.size).filter(Boolean))]
    : sizes;
  const activeVariant = safeVariants.find((v: any) =>
    (!selectedColor || v?.color === selectedColor) &&
    (!selectedSize || String(v?.size) === selectedSize)
  );
  const displayStock = (selectedColor && selectedSize && activeVariant)
    ? (activeVariant.stock || 0)
    : (product?.stock || 0);

  const handleColorSelect = (color: string) => {
    if (selectedColor === color) {
      setSelectedColor('');
      setSelectedSize('');
      setCurrentImage(product?.imageUrl || (product?.images && product?.images[0]) || '');
    } else {
      setSelectedColor(color);
      setSelectedSize('');
      const variantWithImg = safeVariants.find((v: any) => v?.color === color && v?.imageUrl);
      if (variantWithImg?.imageUrl) {
        setCurrentImage(variantWithImg.imageUrl);
      } else {
        setCurrentImage(product?.imageUrl || (product?.images && product?.images[0]) || '');
      }
    }
  };

  async function addToCart() {
    if (colors.length > 0 && !selectedColor) { alert('Pilih warna terlebih dahulu'); return; }
    if (sizes.length > 0 && !selectedSize) { alert('Pilih ukuran terlebih dahulu'); return; }
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    setAddLoading(true);
    try {
      await cartApi.addItem({ productId: Number(id), quantity: qty, size: selectedSize || undefined, color: selectedColor || undefined });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan ke keranjang');
    } finally { setAddLoading(false); }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#ffffff' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #f1f5f9', borderTop: '3px solid #0a1628', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!product) return (
    <div style={{ textAlign: 'center', padding: '110px 4rem', color: '#64748b', background: '#ffffff', minHeight: '100vh' }}>
      Produk tidak ditemukan. <Link href="/home" style={{ color: '#0a1628', fontWeight: 600 }}>Kembali ke Beranda</Link>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif', paddingTop: '110px' }}>
      
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '1rem 1.5rem 4rem' }}>
        
        <div style={{ marginTop: '-10px', marginBottom: '15px' }}>
          <Link href="/home" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}>
            ← Kembali ke Beranda
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
          
          <div style={{ height: 460, background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            {currentImage ? (
              <img src={currentImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 20 }} />
            ) : (
              <span style={{ fontSize: 80 }}>👕</span>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {product.isNew && <span style={{ background: '#0a1628', color: '#fff', fontSize: 11, padding: '3px 10px', borderRadius: 6, fontWeight: 600, letterSpacing: '0.05em' }}>NEW</span>}
              {product.isTrending && <span style={{ background: '#f59e0b', color: '#fff', fontSize: 11, padding: '3px 10px', borderRadius: 6, fontWeight: 600 }}>🔥 TRENDING</span>}
            </div>

            <p style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{product.category?.name}</p>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0a1628', marginBottom: 10, lineHeight: 1.25 }}>{product.name}</h1>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0a1628', marginBottom: 14 }}>
              Rp {Number(product.price || 0).toLocaleString('id-ID')}
            </div>

            {product.description && (
              <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: 16, fontSize: 14 }}>{product.description}</p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '8px 12px', background: '#f8fafc', borderRadius: 10, fontSize: 13, color: '#334155', width: 'fit-content', border: '1px solid #e2e8f0' }}>
              📦 Stok: <strong>{displayStock} pcs</strong>
            </div>

            {colors.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#1e293b' }}>
                  Warna {selectedColor && <span style={{ fontWeight: 400, color: '#64748b' }}>— {selectedColor}</span>}
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {colors.map((c: any) => {
                    const colorStr = String(c);
                    const isSelected = selectedColor === colorStr;
                    return (
                      <button 
                        key={colorStr} 
                        onClick={() => handleColorSelect(colorStr)}
                        style={{ 
                          padding: '6px 14px', 
                          borderRadius: 8, 
                          fontSize: 13, 
                          fontWeight: 500, 
                          cursor: 'pointer', 
                          transition: 'all 0.15s', 
                          background: isSelected ? '#0a1628' : '#fff', 
                          color: isSelected ? '#fff' : '#334155', 
                          border: `1.5px solid ${isSelected ? '#0a1628' : '#e2e8f0'}` 
                        }}
                      >
                        {colorStr}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {sizes.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#1e293b' }}>Ukuran</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {sizes.map((s: any) => {
                    const isAvailable = (availableSizes as any[]).includes(s);
                    const ss = String(s);
                    const isSelected = selectedSize === ss;
                    return (
                      <button 
                        key={ss} 
                        disabled={!isAvailable} 
                        onClick={() => setSelectedSize(isSelected ? '' : ss)}
                        style={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: 8, 
                          fontSize: 13, 
                          fontWeight: 600, 
                          cursor: isAvailable ? 'pointer' : 'not-allowed',
                          background: isSelected ? '#0a1628' : '#fff',
                          color: isSelected ? '#fff' : (isAvailable ? '#334155' : '#cbd5e1'),
                          border: `1.5px solid ${isSelected ? '#0a1628' : '#e2e8f0'}`,
                          opacity: isAvailable ? 1 : 0.5
                        }}
                      >
                        {ss}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e2e8f0', borderRadius: 12, background: '#fff', overflow: 'hidden' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 36, height: 40, border: 'none', background: '#f8fafc', cursor: 'pointer', fontSize: 16, fontWeight: 600 }}>-</button>
                <span style={{ width: 40, textAlign: 'center', fontSize: 14, fontWeight: 700 }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} style={{ width: 36, height: 40, border: 'none', background: '#f8fafc', cursor: 'pointer', fontSize: 16, fontWeight: 600 }}>+</button>
              </div>

              <button 
                onClick={addToCart} 
                disabled={addLoading}
                style={{ 
                  flex: 1, 
                  background: added ? '#10b981' : '#0a1628', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: 12, 
                  height: 40, 
                  fontSize: 14, 
                  fontWeight: 700, 
                  cursor: 'pointer', 
                  transition: 'background 0.2s' 
                }}
              >
                {addLoading ? 'Menambahkan...' : added ? '✓ Berhasil Ditambahkan' : 'Tambah Ke Keranjang'}
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}