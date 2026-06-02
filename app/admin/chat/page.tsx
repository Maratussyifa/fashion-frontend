'use client';
import { useState, useEffect, useRef } from 'react';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://fashion-backend-production-d453.up.railway.app';

function getValidToken(): string | null {
  if (typeof window === 'undefined') return null;
  const manualToken = localStorage.getItem('manual_admin_token');
  if (manualToken) return manualToken;

  const directKeys = ['token', 'accessToken', 'jwt', 'admin_token', 'user_token', 'access_token'];
  for (const key of directKeys) {
    const val = localStorage.getItem(key);
    if (val && val !== 'undefined' && val !== 'null') return val;
  }
  const userData = localStorage.getItem('user') || localStorage.getItem('admin');
  if (userData) {
    try {
      const parsed = JSON.parse(userData);
      return parsed.token || parsed.accessToken || parsed.access_token || parsed.user?.token;
    } catch (e) {}
  }
  return null;
}

function authFetch(path: string, opts: RequestInit = {}) {
  const token = getValidToken();
  return fetch(`${BASE}${path}`, {
    ...opts,
    headers: { 
      'Content-Type': 'application/json', 
      ...(token ? { Authorization: `Bearer ${token}` } : {}), 
      ...opts.headers 
    },
  });
}

export default function AdminChatsPage() {
  const [chatList, setChatList] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [roomMessages, setRoomMessages] = useState<any[]>([]);
  
  const [loadingList, setLoadingList] = useState(true);
  const [loadingRoom, setLoadingRoom] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [error, setError] = useState('');
  const [showBypassBox, setShowBypassBox] = useState(false);
  const [inputTokenManual, setInputTokenManual] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChatList(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchChatList(false); 
      if (selectedUserId) {
        refreshRoomMessages(selectedUserId);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedUserId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages]);

  // GET /chat/all
  async function fetchChatList(showLoadingSpinner = false) {
    try {
      if (showLoadingSpinner) setLoadingList(true);
      const res = await authFetch('/chat/all'); 
      if (!res.ok) throw new Error(`Gagal memuat list chat (${res.status})`);
      const result = await res.json();
      const dataArray = result.data ?? result.chats ?? result.messages ?? (Array.isArray(result) ? result : []);
      
      const uniqueChats: any[] = [];
      const seenUsers = new Set();
      
      if (Array.isArray(dataArray)) {
        const latestDataFirst = [...dataArray].reverse();
        latestDataFirst.forEach((item: any) => {
          const uId = item.userId || item.user?._id || item.user?.id || item.user;
          if (uId && !seenUsers.has(String(uId))) {
            seenUsers.add(String(uId));
            uniqueChats.push({ ...item, computedUserId: String(uId) });
          }
        });
      }
      setChatList(uniqueChats);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat list chat.');
    } finally {
      if (showLoadingSpinner) setLoadingList(false);
    }
  }

  // GET /chat/user/{userId}
  async function refreshRoomMessages(userId: string | number) {
    try {
      const res = await authFetch(`/chat/user/${userId}`);
      if (!res.ok) return;
      const result = await res.json();
      const messagesArray = result.data ?? result.messages ?? (Array.isArray(result) ? result : []);
      setRoomMessages(messagesArray);
    } catch (e) {}
  }

  async function handleSelectUser(userId: string | number, name: string) {
    setSelectedUserId(userId);
    setSelectedUserName(name);
    try {
      setLoadingRoom(true);
      const res = await authFetch(`/chat/user/${userId}`);
      if (!res.ok) throw new Error();
      const result = await res.json();
      const messagesArray = result.data ?? result.messages ?? (Array.isArray(result) ? result : []);
      setRoomMessages(messagesArray);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRoom(false);
    }
  }

  // POST /chat/reply/{userId}
  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim() || !selectedUserId) return;

    const currentReply = replyText;
    setReplyText('');

    // Optimistic Update instan di kanan demi kenyamanan UI
    setRoomMessages(prev => [...prev, {
      id: `local-${Date.now()}`,
      isFromUser: false, 
      content: currentReply, 
      text: currentReply, 
      message: currentReply, 
      createdAt: new Date().toISOString()
    }]);

    try {
      const res = await authFetch(`/chat/reply/${selectedUserId}`, {
        method: 'POST',
        body: JSON.stringify({ 
          content: currentReply, 
          text: currentReply, 
          message: currentReply 
        })
      });

      if (!res.ok) throw new Error('Gagal membalas chat');
      
      await refreshRoomMessages(selectedUserId);
      fetchChatList(false);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div style={{ height: '100vh', display: 'flex', width: '100%', overflow: 'hidden', background: '#f1f5f9', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* KIRI: DAFTAR USER */}
      <div style={{ width: '360px', background: '#ffffff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0a1628' }}>Panel Admin Chat</h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>Pelanggan Aktif ({chatList.length})</p>
          </div>
          <button onClick={() => fetchChatList(true)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>🔄</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loadingList && chatList.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Memuat pesan...</div>}
          {error && <div style={{ padding: '16px', color: '#ef4444', background: '#fef2f2' }}>{error}</div>}
          
          {chatList.map((item) => {
            const name = item.user?.name || `User #${item.computedUserId}`;
            const isActive = selectedUserId === item.computedUserId;
            return (
              <div key={item.id || item._id} onClick={() => handleSelectUser(item.computedUserId, name)} style={{ padding: '16px 20px', borderBottom: '1px solid #f8fafc', cursor: 'pointer', background: isActive ? '#f0f4f8' : 'transparent', borderLeft: isActive ? '4px solid #0a1628' : '4px solid transparent' }}>
                <span style={{ fontWeight: 700, color: '#0a1628', fontSize: '13px' }}>{name}</span>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.content || item.text || item.message || ''}
                </p>
              </div>
            );
          })}
        </div>

        <div style={{ padding: '12px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          {!showBypassBox ? (
            <button onClick={() => setShowBypassBox(true)} style={{ width: '100%', padding: '8px', border: '1px dashed #cbd5e1', background: '#fff', fontSize: '11px', cursor: 'pointer' }}>⚙️ Token Bypass</button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <textarea value={inputTokenManual} onChange={e => setInputTokenManual(e.target.value)} placeholder="Paste Token Admin..." style={{ width: '100%', height: '40px', fontSize: '11px' }} />
              <button onClick={() => { localStorage.setItem('manual_admin_token', inputTokenManual.trim()); setShowBypassBox(false); fetchChatList(true); }} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '6px', fontSize: '11px', cursor: 'pointer' }}>Simpan</button>
            </div>
          )}
        </div>
      </div>

      {/* KANAN: RUANG CHAT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedUserId ? (
          <>
            <div style={{ background: '#ffffff', padding: '16px 24px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Membalas: {selectedUserName}</h3>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#f8fafc' }}>
              {roomMessages.map((msg: any, idx: number) => {
                
                // 🚨 FIX TOTAL KUNCI MATI DISINI BERDASARKAN CONSOLE LOG 🚨
                // Jika isFromUser bernilai false, MAKA 100% PASTI CHAT ADMIN (KANAN)
                const isAdmin = msg.isFromUser === false || msg.sender === 'admin' || msg.role === 'admin';

                const textContent = msg.content || msg.text || msg.message || '';
                if (!textContent.trim()) return null;

                return (
                  <div key={msg.id || msg._id || idx} style={{ display: 'flex', flexDirection: 'column', alignItems: isAdmin ? 'flex-end' : 'flex-start', alignSelf: isAdmin ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                    <div style={{ 
                      background: isAdmin ? '#0a1628' : '#ffffff', 
                      color: isAdmin ? '#ffffff' : '#1e293b', 
                      padding: '10px 14px', 
                      borderRadius: isAdmin ? '12px 12px 2px 12px' : '12px 12px 12px 2px', 
                      fontSize: '13px', 
                      border: isAdmin ? 'none' : '1px solid #e2e8f0'
                    }}>
                      {textContent}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendReply} style={{ background: '#ffffff', padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px' }}>
              <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Tulis balasan resmi admin..." style={{ flex: 1, height: '40px', padding: '0 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
              <button type="submit" style={{ background: '#0a1628', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Kirim Balas</button>
            </form>
          </>
        ) : (
          <div style={{ margin: 'auto', color: '#94a3b8' }}>Silakan pilih antrean pesan pelanggan di sisi kiri.</div>
        )}
      </div>
    </div>
  );
}