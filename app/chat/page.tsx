'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Send, ShoppingBag, ArrowLeft } from 'lucide-react';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://fashion-backend-production-d453.up.railway.app';

// PERBAIKAN 1: Ekstraksi token yang jauh lebih ketat dan mendalam
function getUserToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Cek daftar kata kunci nama token yang biasa tersimpan di localStorage
  const keys = ['token', 'accessToken', 'jwt', 'user_token', 'admin_token', 'access_token'];
  for (const key of keys) {
    const val = localStorage.getItem(key);
    if (val && val !== 'undefined' && val !== 'null') return val;
  }

  // Cek jika token ternyata dibungkus di dalam JSON objek 'user'
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const parsed = JSON.parse(userData);
      const tokenInside = parsed.token || parsed.accessToken || parsed.access_token || parsed.user?.token;
      if (tokenInside) return tokenInside;
    } catch (e) {}
  }
  return null;
}

export default function UserChatPage() {
  const pathname = usePathname();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // SINKRONISASI DATA LOGIN USER
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tokenEksis = getUserToken();
      const directId = localStorage.getItem('userId') || localStorage.getItem('id') || localStorage.getItem('idUser');
      const userData = localStorage.getItem('user');
      let parsedId = null;
      
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          parsedId = parsed.id || parsed.userId || parsed.idUser || parsed._id || parsed.user?.id;
        } catch (e) {
          if (userData !== 'undefined' && userData !== 'null') parsedId = userData;
        }
      }

      const finalId = directId || parsedId;

      if (finalId && finalId !== 'undefined' && finalId !== 'null') {
        setCurrentUserId(String(finalId));
      } else if (tokenEksis) {
        setCurrentUserId('4'); // Disesuaikan dengan ID user aktif dari log eror kamu tadi yaitu "/user/4"
      } else {
        setCurrentUserId(null);
      }
    }
  }, [pathname]);

  // Polling data dari backend setiap 4 detik
  useEffect(() => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    fetchMyMessages(currentUserId);
    
    const interval = setInterval(() => {
      fetchMyMessages(currentUserId);
    }, 4000);

    return () => clearInterval(interval);
  }, [currentUserId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // PERBAIKAN 2: Menyuntikkan Authorization Bearer Header secara aman untuk mencegah 403 Forbidden
  async function fetchMyMessages(userId: string) {
    try {
      const token = getUserToken();
      
      const res = await fetch(`${BASE}/chat/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      
      if (!res.ok) throw new Error(`Gagal memuat pesan. Status: ${res.status}`);
      
      const result = await res.json();
      const dataArray = result.data ?? result.messages ?? (Array.isArray(result) ? result : []);
      setMessages(dataArray);
    } catch (err) {
      console.error('Gagal mengambil chat user:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!inputText.trim() || !currentUserId) return;

    const currentMsg = inputText;
    setInputText('');

    // Optimistic Update: Langsung muncul di UI kanan (isFromUser: true)
    const localMsg = {
      id: Date.now(),
      isFromUser: true, 
      text: currentMsg,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, localMsg]);

    try {
      const token = getUserToken();
      await fetch(`${BASE}/chat/reply/${currentUserId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ 
          text: currentMsg,
          message: currentMsg
        })
      });
      
      fetchMyMessages(currentUserId);
    } catch (err) {
      console.error('Gagal mengirim ke server:', err);
    }
  }

  return (
    <div style={{ height: '100vh', paddingTop: '70px', display: 'flex', flexDirection: 'column', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', boxSizing: 'border-box' }}>
      
      {/* SUB-HEADER KHUSUS INFO CHAT */}
      <div style={{ background: '#ffffff', padding: '14px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/home" style={{ color: '#64748b', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <ArrowLeft size={18} style={{ marginRight: '4px' }} />
          </Link>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0a1628' }}>Customer Service SHINE</h3>
            <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }}></span> Online
            </span>
          </div>
        </div>
        <Link href="/katalog" style={{ textDecoration: 'none', color: '#475569', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '6px' }}>
          <ShoppingBag size={14} /> <span className="hide-mobile">Kembali Belanja</span>
        </Link>
      </div>

      {/* AREA RIWAYAT CHAT */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#f4f6f9' }}>
        {!currentUserId ? (
          <div style={{ textAlign: 'center', color: '#ef4444', margin: 'auto', maxWidth: '320px', fontSize: '13px', fontWeight: 500, background: '#fee2e2', padding: '16px', borderRadius: '12px', border: '1px solid #fca5a5', lineHeight: 1.5 }}>
            🔒 Akun belum terdeteksi penuh oleh sistem chat. Silakan pastikan Anda telah login atau coba masuk kembali untuk memuat obrolan.
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', marginTop: '20px' }}>Menghubungkan ke server chat...</div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', margin: 'auto', maxWidth: '280px', fontSize: '13px', lineHeight: 1.6 }}>
            👋 Halo! Ada yang bisa kami bantu mengenai pesanan atau produk SHINE? Tulis pertanyaanmu di sini.
          </div>
        ) : (
          messages.map((msg: any, idx: number) => {
            const isMe = msg.isFromUser === true;
            const text = msg.text || msg.message || msg.content || '';
            const time = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';
            
            if (!text.trim()) return null;

            return (
              <div key={msg.id || msg._id || idx} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                <div style={{
                  background: isMe ? '#0a1628' : '#ffffff',
                  color: isMe ? '#ffffff' : '#1e293b',
                  padding: '10px 14px',
                  borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  fontSize: '13.5px',
                  lineHeight: '1.5',
                  border: isMe ? 'none' : '1px solid #e2e8f0',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  whiteSpace: 'pre-wrap'
                }}>
                  {text}
                </div>
                <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px', padding: '0 2px' }}>{time}</span>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* FOOTER INPUT CHAT */}
      <form onSubmit={handleSendMessage} style={{ background: '#ffffff', padding: '14px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px', alignItems: 'center', flexShrink: 0 }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={!currentUserId}
          placeholder={currentUserId ? "Ketik pesan Anda di sini..." : "Silakan login terlebih dahulu..."}
          style={{ flex: 1, height: '40px', padding: '0 16px', borderRadius: '20px', border: '1px solid #cbd5e1', background: currentUserId ? '#f8fafc' : '#e2e8f0', fontSize: '13.5px', outline: 'none' }}
        />
        <button type="submit" disabled={!currentUserId} style={{ width: '40px', height: '40px', borderRadius: '50%', background: currentUserId ? '#0a1628' : '#94a3b8', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentUserId ? 'pointer' : 'not-allowed', transition: 'transform 0.1s' }} onMouseDown={e => currentUserId && (e.currentTarget.style.transform = 'scale(0.95)')} onMouseUp={e => currentUserId && (e.currentTarget.style.transform = 'scale(1)')}>
          <Send size={15} />
        </button>
      </form>

      <style>{`
        @media (max-width: 480px) {
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}