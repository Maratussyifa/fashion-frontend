'use client';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar'; // Pastikan di dalam komponen ini teks "AIGNE" sudah diganti logo SHINE
import Footer from '@/components/Footer'; // Pastikan copyright di dalam komponen ini sudah diubah ke SHINE

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
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f8fafc' }}>
        
        {/* Hanya tampilkan Navbar jika bukan halaman admin, login, atau register */}
        {!hideNavbarFooter && <Navbar />}

        {/* Berikan minHeight agar footer tetap berada di bawah jika konten sedikit */}
        <main style={{ minHeight: 'calc(100vh - 70px)' }}>
          {children}
        </main>

        {/* Hanya tampilkan Footer jika bukan halaman admin, login, atau register */}
        {!hideNavbarFooter && <Footer />}

      </body>
    </html>
  );
}