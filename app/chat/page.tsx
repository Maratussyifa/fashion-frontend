'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Send, ShoppingBag, ArrowLeft } from 'lucide-react';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://fashion-backend-production-d453.up.railway.app';

function getUserToken(): string | null {
  if (typeof window === 'undefined') return null;
  const keys = ['token', 'accessToken', 'jwt', 'user_token', 'access_token'];
  for (const key of keys) {
    const val = localStorage.getItem(key);
    if (val && val !== 'undefined' && val !== 'null') return val;
  }
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const parsed = JSON.parse(userData);
      return parsed.token || parsed.accessToken || parsed.access_token || parsed.user?.token;
    } catch (e) {}
  }
  return null;
}

export default function UserChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = getUserToken();
      setHasToken(!!token);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!hasToken) return;
    fetchMyMessages();
    const interval = setInterval(() => {
      fetchMyMessages();
    }, 3500);
    return () => clearInterval(interval);
  }, [hasToken]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // GET /chat/my
  async function fetchMyMessages() {
    try {
      const token = getUserToken();
      const res = await fetch(`${BASE}/chat/my`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error('Gagal mengambil chat user');
      const result = await res.json();
      const dataArray = result.data ?? result.messages ?? (Array.isArray(result) ? result : []);
      setMessages(dataArray);
    } catch (err) {
      console.error(err);
    }
  }

  // POST /chat/send
  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!inputText.trim()) return;

    const currentMsg = inputText;
    setInputText('');

    // OPTIMISTIC UPDATE: Langsung kunci di kanan (isBawaanLokalUser = true)
    setMessages(prev => [...prev, {
      id: `user-local-${Date.now()}`,
      isBawaanLokalUser: true,
      isFromUser: true,
      sender: 'user',
      role: 'user',
      content: currentMsg,
      text: currentMsg,
      message: currentMsg,
      createdAt: new Date().toISOString()
    }]);

    try {
      const token = getUserToken();
      const res = await fetch(`${BASE}/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ content: currentMsg, text: currentMsg, message: currentMsg })
      });
      if (!res.ok) throw new Error('Gagal mengirim chat');
      fetchMyMessages();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div style={{ height: '100vh', paddingTop: '70px', display: 'flex', flexDirection: 'column', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', boxSizing: 'border-box' }}>
      
      {/* HEADER */}
      <div style={{ background: '#ffffff', padding: '14px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/home" style={{ color: '#64748b', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <ArrowLeft size={18} style={{ marginRight: '4px' }} />
          </Link>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0a1628' }}>Customer Service SHINE</h3>
            <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }}></span> Online
            </span>
          </div>
        </div>
        <Link href="/katalog" style={{ textDecoration: 'none', color: '#475569', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '6px' }}>
          <ShoppingBag size={14} /> <span>Kembali Belanja</span>
        </Link>
      </div>

      {/* KONTANER UTAMA BOX PESAN USER */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#f4f6f9' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#64748b', marginTop: '20px' }}>Menghubungkan...</div>
        ) : !hasToken ? (
          <div style={{ textAlign: 'center', color: '#ef4444', margin: 'auto', maxWidth: '320px', background: '#fee2e2', padding: '16px', borderRadius: '12px' }}>
            🔒 Silakan login terlebih dahulu untuk memulai obrolan dengan Customer Service.
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', margin: 'auto', maxWidth: '280px' }}>
            👋 Halo! Ada yang bisa kami bantu mengenai produk SHINE? Tulis pertanyaanmu di sini.
          </div>
        ) : (
          messages.map((msg: any, idx: number) => {
            const text = msg.content || msg.text || msg.message || '';
            if (!text.trim()) return null;

            // 🚨 LOGIKA SELEKSI ELIMINASI ADMIN (Sangat Agresif) 🚨
            // Kita cari tahu apakah ada tanda-tanda pesan ini milik Admin
            const isFromUserFalse = msg.isFromUser === false || String(msg.isFromUser) === 'false';
            
            const adakahBauAdmin = 
              isFromUserFalse || 
              msg.sender === 'admin' || 
              msg.role === 'admin' || 
              msg.sender === 'cs' ||
              (msg.user && (msg.user.role === 'admin' || msg.user.role === 'superadmin'));

            // Jika ada bau admin, pasang di KIRI (isMe = false). 
            // Jika TIDAK ada bau admin, atau ini tiruan lokal, paksa ke KANAN (isMe = true).
            const isMe = msg.isBawaanLokalUser === true || !adakahBauAdmin;

            // Log monitoring untuk inspect element browser
            console.log(`User Room -> Text: "${text}" | Bau Admin: ${adakahBauAdmin} | Posisi Kanan: ${isMe}`);

            const time = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';

            return (
              /* Pembungkus 100% full width agar bubble tidak bisa naik-turun selap-selip */
              <div key={msg.id || msg._id || idx} style={{ width: '100%', display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                  <div style={{
                    background: isMe ? '#0a1628' : '#ffffff', // User sendiri = Gelap (Kanan), CS/Admin = Putih (Kiri)
                    color: isMe ? '#ffffff' : '#1e293b',
                    padding: '10px 16px',
                    borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    fontSize: '13.5px',
                    lineHeight: '1.5',
                    border: isMe ? 'none' : '1px solid #e2e8f0',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {text}
                  </div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px', padding: '0 4px' }}>{time}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* INPUT */}
      <form onSubmit={handleSendMessage} style={{ background: '#ffffff', padding: '14px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px', alignItems: 'center', flexShrink: 0 }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={!hasToken}
          placeholder={hasToken ? "Ketik pesan Anda di sini..." : "Silakan login terlebih dahulu..."}
          style={{ flex: 1, height: '40px', padding: '0 16px', borderRadius: '20px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13.5px' }}
        />
        <button type="submit" disabled={!hasToken} style={{ width: '40px', height: '40px', borderRadius: '50%', background: hasToken ? '#0a1628' : '#94a3b8', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}