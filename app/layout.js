"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import './globals.css';

export default function RootLayout({ children }) {
  const [cartCount, setCartCount] = useState(0);
  const [userRole, setUserRole] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const syncState = () => {
      const items = JSON.parse(localStorage.getItem('app_cart') || '[]');
      setCartCount(items.length);
      setUserRole(localStorage.getItem('auth_role'));
    };
    syncState();
    const interval = setInterval(syncState, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_role');
    localStorage.removeItem('auth_restaurant');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('app_cart');
    setUserRole(null);
    router.push('/');
  };

  return (
    <html lang="en">
      <body className="bg-[#FFF8F2] text-[#2B1704] min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 bg-[#1E0F02] border-b-2 border-[#E66A00] text-white px-6 py-4 flex justify-between items-center shadow-2xl">
          <Link href="/" className="text-xl font-black tracking-wider text-[#FAF0E6]">
            🍫 <span className="text-[#E66A00]">Breakfast</span> Sorted
          </Link>
          
          <nav className="hidden md:flex gap-6 text-xs font-bold uppercase tracking-wider text-gray-300">
            <Link href="/" className="hover:text-[#E66A00] transition-colors">Home</Link>
            <Link href="/about" className="hover:text-[#E66A00] transition-colors">About Us</Link>
            {userRole === 'user' && <Link href="/orders" className="text-choc-bg hover:text-choc-shine">My Orders</Link>}
            {userRole === 'chef' && <Link href="/chef" className="text-amber-400 font-black">👨‍🍳 Chef Panel</Link>}
            {userRole === 'admin' && <Link href="/admin" className="text-orange-400 font-black">👑 Admin Panel</Link>}
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/checkout" className="bg-[#3D220A] hover:bg-[#E66A00] px-4 py-2 rounded-xl text-sm font-bold border border-[#A06A38]/30 transition-all flex items-center gap-2">
              🛒 Basket <span className="bg-[#E66A00] text-white text-xs px-2 py-0.5 rounded-full">{cartCount}</span>
            </Link>
            {userRole ? (
              <button onClick={handleLogout} className="text-xs bg-red-900/50 hover:bg-red-900 border border-red-700 px-3 py-1.5 rounded-lg font-bold">
                Logout
              </button>
            ) : (
              <Link href="/login" className="text-sm font-bold text-[#FAF0E6] hover:text-[#E66A00]">Login</Link>
            )}
          </div>
        </header>
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}