'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://fashion-backend-production-d453.up.railway.app';

// Data Lokal Cadangan jika API Backend sedang offline / loading
const mockProduk = [
  { id: '1', name: 'Kaos Oversize Hitam', category: { id: 1, name: 'Kaos', slug: 'kaos' }, price: 185000, stock: 42, status: 'Aktif', image: '' },
  { id: '2', name: 'Hoodie Premium Navy', category: { id: 2, name: 'Hoodie', slug: 'hoodie' }, price: 320000, stock: 18, status: 'Aktif', image: '' },
  { id: '3', name: 'Celana Jogger Abu', category: { id: 3, name: 'Celana', slug: 'celana' }, price: 250000, stock: 7, status: 'Aktif', image: '' },
  { id: '4', name: 'Kemeja Flanel Merah', category: { id: 4, name: 'Kemeja', slug: 'kemeja' }, price: 275000, stock: 0, status: 'Habis', image: '' },
];

export default function AdminProdukPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Form & mode Edit (Mendukung ID String/Number)
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [form, setForm] = useState({ name: '', category: '', price: '', stock: '' });

  useEffect(() => {
    fetchProductsFromBackend();
  }, []);

  // 1. GET DATA PRODUCTS
  async function fetchProductsFromBackend() {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const res = await fetch(`${BASE}/products`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) throw new Error('Response server bermasalah');
      const data = await res.json();
      
      if (Array.isArray(data)) setProducts(data);
      else if (data.products && Array.isArray(data.products)) setProducts(data.products);
      else if (data.data && Array.isArray(data.data)) setProducts(data.data);
      else setProducts(mockProduk);
    } catch (e) {
      console.warn("Koneksi BE gagal, beralih ke data lokal cadangan.", e);
      setProducts(mockProduk); 
    } finally {
      setLoading(false);
    }
  }

  // 2. SUBMIT FORM (TAMBAH / EDIT)
  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const bodyData = {
        name: form.name,
        category: form.category, 
        price: Number(form.price),
        stock: Number(form.stock)
      };

      let url = `${BASE}/products`;
      let method = 'POST';

      if (editingId) {
        url = `${BASE}/products/${editingId}`;
        method = 'PUT'; 
      }

      const res = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData)
      });

      if (!res.ok) {
        const errResponse = await res.json().catch(() => ({}));
        throw new Error(errResponse.message || 'Gagal menyimpan produk ke server');
      }
      
      fetchProductsFromBackend();
      handleCloseModal();
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan sistem');
    }
  }

  // 3. DELETE PRODUCT
  async function handleDeleteProduct(id: string | number) {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${BASE}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Gagal menghapus produk');
      fetchProductsFromBackend();
    } catch (err) {
      alert('Gagal menghapus data dari backend.');
    }
  }

  // 4. LOGIKA MODAL CONTROL
  function handleOpenEdit(product: any) {
    setEditingId(product.id ?? product._id);
    
    const catName = typeof product.kategori === 'object' ? product.kategori?.name : (product.kategori ?? product.category ?? '');
    
    setForm({
      name: product.nama ?? product.name ?? '',
      category: catName ?? '',
      price: String(product.harga ?? product.price ?? ''),
      stock: String(product.stok ?? product.stock ?? '')
    });
    setShowModal(true);
  }

  function handleCloseModal() {
    setShowModal(false);
    setEditingId(null);
    setForm({ name: '', category: '', price: '', stock: '' });
  }

  // 5. FILTER LOGIKA PENCARIAN & STATUS
  const filtered = products.filter(p => {
    const namaProduk = p.nama ?? p.name ?? '';
    const rawCat = p.kategori ?? p.category;
    const kategoriText = typeof rawCat === 'object' && rawCat !== null 
      ? (rawCat.name ?? rawCat.nama ?? '') 
      : (rawCat ?? '');

    const stokProduk = p.stok ?? p.stock ?? 0;
    const matchesSearch = namaProduk.toLowerCase().includes(search.toLowerCase()) || 
                          kategoriText.toLowerCase().includes(search.toLowerCase());
    
    if (statusFilter === 'Aktif') return matchesSearch && stokProduk > 0;
    if (statusFilter === 'Habis') return matchesSearch && stokProduk === 0;
    return matchesSearch;
  });

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', width: '100%', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* Header Halaman */}
      <div style={{ height: '70px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0a1628', margin: 0 }}>Manajemen Produk SHINE</h2>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{products.length} koleksi baju terdaftar</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => router.push('/admin/dashboard')}
            style={{ background: '#fff', color: '#0a1628', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Kembali ke Dashboard
          </button>
          <button
            onClick={() => setShowModal(true)}
            style={{ background: '#0a1628', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(10,22,40,0.15)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Tambah Produk Baru
          </button>
        </div>
      </div>

      <div style={{ padding: '32px' }}>

        {/* Search & Filter Bar */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '14px 20px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari koleksi produk atau kategori..."
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', color: '#0f172a', background: 'transparent' }}
          />
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 12px', fontSize: '13px', color: '#475569', background: '#f8fafc', cursor: 'pointer', outline: 'none' }}
          >
            <option value="Semua Status">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Habis">Habis</option>
          </select>
        </div>

        {/* Tabel Tampilan Utama Produk */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Produk', 'Kategori', 'Harga', 'Stok', 'Status', 'Aksi'].map(h => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>Mendownload data produk dari server SHINE...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>Produk tidak ditemukan.</td>
                </tr>
              ) : (
                filtered.map((p, i) => {
                  const currentId = p.id ?? p._id ?? i;
                  const name = p.nama ?? p.name ?? 'Produk Tanpa Nama';
                  const price = p.harga ?? p.price ?? 0;
                  const stock = p.stok ?? p.stock ?? 0;
                  
                  // Perbaikan Deteksi URL Gambar dari BE
                  const image = p.imageUrl ?? p.image ?? p.gambar ?? '';

                  const rawCategory = p.kategori ?? p.category;
                  const categoryName = typeof rawCategory === 'object' && rawCategory !== null
                    ? (rawCategory.name ?? rawCategory.nama ?? 'Uncategorized')
                    : (rawCategory ?? 'Uncategorized');

                  return (
                    <tr key={currentId} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                            {image && typeof image === 'string' && (image.startsWith('http') || image.startsWith('/')) ? (
                              <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46L16 2.14a2 2 0 0 0-1.16 0L4.1 6.18a2 2 0 0 0-1.2 1.83v8a2 2 0 0 0 1.2 1.83l10.74 4a2 2 0 0 0 1.16 0l10.74-4a2 2 0 0 0 1.2-1.83v-8a2 2 0 0 0-1.2-1.83z"></path></svg>
                            )}
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ background: '#f1f5f9', color: '#0a1628', fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                          {categoryName}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>Rp {price.toLocaleString('id-ID')}</td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: stock === 0 ? '#ef4444' : stock < 10 ? '#f59e0b' : '#64748b', fontWeight: stock < 10 ? 600 : 400 }}>{stock} pcs</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ background: stock > 0 ? '#eafaf1' : '#fef2f2', color: stock > 0 ? '#117b34' : '#ef4444', fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px' }}>
                          {stock > 0 ? 'Aktif' : 'Habis'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => handleOpenEdit(p)} 
                            style={{ background: '#f1f5f9', color: '#0a1628', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path></svg>
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(currentId)} 
                            style={{ background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            title="Hapus Produk"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Info Total Data */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Menampilkan {filtered.length} dari {products.length} produk</span>
        </div>
      </div>

      {/* Modal Popup Tambah & Edit Produk Baru */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={handleSaveProduct} style={{ background: '#fff', borderRadius: '20px', padding: '32px', width: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0a1628', margin: 0 }}>
                {editingId ? 'Edit Data Produk' : 'Tambah Produk Baru'}
              </h3>
              <button type="button" onClick={handleCloseModal} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            {[
              { label: 'Nama Produk', key: 'name', type: 'text', placeholder: 'cth. Denim Jacket Premium' },
              { label: 'Kategori', key: 'category', type: 'text', placeholder: 'cth. Jaket' },
              { label: 'Harga (Rp)', key: 'price', type: 'number', placeholder: 'cth. 185000' },
              { label: 'Stok Barang', key: 'stock', type: 'number', placeholder: 'cth. 50' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{field.label}</label>
                <input
                  type={field.type}
                  required
                  value={(form as any)[field.key]}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#0f172a' }}
                />
              </div>
            ))}

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button type="button" onClick={handleCloseModal} style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Batal</button>
              <button type="submit" style={{ flex: 1, background: '#0a1628', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                {editingId ? 'Simpan Perubahan' : 'Simpan Produk'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}