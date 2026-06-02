'use client';
import { usePathname } from 'next/navigation';
import { Suspense } from 'react'; 
import Navbar from '@/components/Navbar'; 
import Footer from '@/components/Footer'; 

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Daftarkan semua halaman yang SAMA SEKALI tidak boleh memunculkan Navbar & Footer pembeli
  const hideNavbarFooter = 
    pathname.startsWith('/admin') || 
    pathname === '/login' || 
    pathname === '/register';

  return (
    <html lang="en">
      <head>
        {/* Metadata tag untuk mengubah nama brand di Tab Browser */}
        <title>SHINE | Premium Fashion House</title>
        <meta name="description" content="Wear Your Story, Defined by You" />
        <link rel="icon" href="/shine-logo.svg" type="image/svg+xml" />

        {/* 🚨 KUNCI AUTO-SCALE: Memaksa HP nge-zoom out tampilan desktop agar tetap rapi */}
        <meta name="viewport" content="width=1024" />
      </head>
      <body style={{ 
        margin: 0, 
        padding: 0, 
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      }}>
        
        {/* Bungkus Navbar dengan Suspense agar Vercel lolos dari prerender-error */}
        {!hideNavbarFooter && (
          <Suspense fallback={<div style={{ padding: '15px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>Loading Navigation...</div>}>
            <Navbar />
          </Suspense>
        )}

        {/* Menggunakan flex-grow agar main mengambil sisa ruang dan mendorong footer ke bawah secara aman */}
        <main style={{ flex: '1 0 auto', width: '100%' }}>
          {children}
        </main>

        {/* Hanya tampilkan Footer jika bukan halaman admin, login, atau register */}
        {!hideNavbarFooter && <Footer />}

      </body>
    </html>
  );
}