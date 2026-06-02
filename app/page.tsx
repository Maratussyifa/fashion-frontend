'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role === 'ADMIN') router.replace('/admin/dashboard');
    else if (token) router.replace('/home');
    else router.replace('/home');
  }, [router]);
  return null;
}