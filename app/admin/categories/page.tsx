'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://fashion-backend-production-d453.up.railway.app';

const mockKategori = [
  { id: 1, name: 'Kaos', slug: 'kaos' },
  { id: 2, name: 'Hoodie', slug: 'hoodie' },
  { id: 3, name: 'Celana', slug: 'celana' },
  { id: 4, name: 'Kemeja', slug: 'kemeja' },
  { id: 5, name: 'Jaket', slug: 'jaket' },
  { id: 6, name: 'Aksesori', slug: 'aksesori' },
];

export default function AdminKategoriPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', slug: '' });

  useEffect(() => {
    fetchCategoriesFromBackend();
  }, []);

  async function fetchCategoriesFromBackend() {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      // 1. Ambil data semua kategori
      let res = await fetch(`${BASE}/categories`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        res = await fetch(`${BASE}/kategori`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      
      let rawCategories = [];
      if (res.ok) {
        const data = await res.json();
        rawCategories = Array.isArray(data) ? data : (data.categories ?? data.data ?? []);
      } else {
        rawCategories = mockKategori;
      }

      // 2. Ambil data produk
      const resProducts = await fetch(`${BASE}/products`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      let rawProducts = [];
      if (resProducts.ok) {
        const dataProd = await resProducts.json();
        rawProducts = Array.isArray(dataProd) ? dataProd : (dataProd.products ?? dataProd.data ?? []);
      }

      // 3. PENCENTANGAN LOGIKA BARU
      const mappedCategories = rawCategories.map((cat: any) => {
        const catName = (cat.name ?? cat.nama ?? '').toLowerCase().trim();
        
        const totalCount = rawProducts.filter((prod: any) => {
          const prodCatString = typeof prod.category === 'string' ? prod.category : (prod.category?.name ?? prod.kategori ?? '');
          const prodCatLower = prodCatString.toLowerCase().trim();

          return (
            prod.categoryId === cat.id || 
            prod.kategoriId === cat.id ||
            (catName !== '' && prodCatLower.includes(catName)) || 
            (prodCatLower !== '' && catName.includes(prodCatLower))
          );
        }).length;

        return {
          ...cat,
          total_produk: totalCount
        };
      });

      setCategories(mappedCategories);
    } catch (e) {
      console.warn("Koneksi BE kategori gagal. Menggunakan data lokal.", e);
      setCategories(mockKategori.map(c => ({ ...c, total_produk: 0 }))); 
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCategory() {
    if (!form.name.trim()) return alert('Nama kategori tidak boleh kosong');
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${BASE}/categories`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, slug: form.slug })
      });
      if (!res.ok) throw new Error('Gagal menyimpan kategori ke server');
      setShowModal(false);
      setForm({ name: '', slug: '' });
      await fetchCategoriesFromBackend();
    } catch (error: any) {
      alert(error.message || 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteCategory(id: string | number) {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return;
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${BASE}/categories/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) throw new Error('Gagal menghapus kategori dari server');
      await fetchCategoriesFromBackend();
    } catch (error: any) {
      alert(error.message || 'Gagal menghapus data');
    } finally {
      setLoading(false);
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nameVal = e.target.value;
    const slugVal = nameVal.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    setForm({ ...form, name: nameVal, slug: slugVal });
  };

  const filtered = categories.filter(c => {
    const namaKategori = c.name ?? c.nama ?? '';
    const slugKategori = c.slug ?? '';
    return namaKategori.toLowerCase().includes(search.toLowerCase()) || slugKategori.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', width: '100%', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* HEADER UTAMA */}
      <div style={{ height: '70px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0a1628', margin: 0 }}>Manajemen Kategori</h2>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{categories.length} kategori terdaftar</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          style={{ 
            background: '#0a1628', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '8px', 
            padding: '9px 18px', 
            fontSize: '13px', 
            fontWeight: 600, 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            boxShadow: '0 4px 12px rgba(10,22,40,0.15)' 
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Tambah Kategori
        </button>
      </div>

      <div style={{ padding: '32px' }}>
        
        {/* KOLOM PENCARIAN */}
        <div className="search-container" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '12px 20px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center', transition: 'all 0.2s' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Cari nama kategori atau slug..." 
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', color: '#0a1628', background: 'transparent' }} 
            onFocus={(e) => e.target.parentElement?.classList.add('focused')}
            onBlur={(e) => e.target.parentElement?.classList.remove('focused')}
          />
        </div>

        {/* TABEL DATA */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Nama Kategori', 'Slug URL', 'Total Produk', 'Aksi'].map(h => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid #cbd5e1', borderTopColor: '#0a1628', borderRadius: '50%' }}></div>
                      Menyelaraskan data kategori dengan server...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>Kategori tidak ditemukan.</td>
                </tr>
              ) : (
                filtered.map((c, i) => {
                  const name = c.name ?? c.nama ?? 'Tanpa Nama';
                  const slug = c.slug ?? '-';
                  const totalProducts = c.total_produk ?? 0;

                  return (
                    <tr key={c.id ?? i} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#0a1628' }}>{name}</span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <code style={{ background: '#f1f5f9', color: '#475569', fontSize: '13px', padding: '3px 8px', borderRadius: '6px', fontFamily: 'monospace' }}>/{slug}</code>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 700, color: '#0a1628' }}>
                        {totalProducts} Item
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => { setForm({ name, slug }); setShowModal(true); }} style={{ background: '#f1f5f9', color: '#0a1628', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }} className="btn-edit">✏️ Edit</button>
                          <button onClick={() => handleDeleteCategory(c.id)} style={{ background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CONTAINER */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,22,40,0.3)', backdropFilter: 'blur(2px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', width: '450px', boxShadow: '0 20px 60px rgba(10,22,40,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0a1628', margin: 0 }}>Tambah Kategori Baru</h3>
              <button onClick={() => setShowModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '14px', color: '#64748b' }}>✕</button>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0a1628', marginBottom: '6px' }}>Nama Kategori</label>
              <input value={form.name} onChange={handleNameChange} placeholder="cth. Jaket Denim" style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#0a1628', transition: 'all 0.2s' }} className="modal-input" />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0a1628', marginBottom: '6px' }}>Slug (URL otomatis)</label>
              <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="jaket-denim" style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#64748b', background: '#f8fafc' }} />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Batal</button>
              <button onClick={handleCreateCategory} style={{ flex: 1, background: '#0a1628', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(10,22,40,0.15)' }}>Simpan Kategori</button>
            </div>
          </div>
        </div>
      )}

      {/* STYLE OVERRIDES */}
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .spinner { animation: spin 0.8s linear infinite; }
        .focused {
          border-color: #0a1628 !important;
          box-shadow: 0 0 0 4px rgba(10, 22, 40, 0.08);
        }
        .modal-input:focus {
          border-color: #0a1628 !important;
          box-shadow: 0 0 0 4px rgba(10, 22, 40, 0.08);
        }
        .btn-edit:hover {
          background: #e2e8f0 !important;
          border-color: #0a1628 !important;
        }
      `}</style>
    </div>
  );
}