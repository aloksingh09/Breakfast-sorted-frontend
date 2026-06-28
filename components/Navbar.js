// components/Navbar.js
"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [userRole, setUserRole] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

  const syncState = () => {
    const items = JSON.parse(localStorage.getItem('app_cart') || '[]');
    setCartItems(items);
    setCartCount(items.length);
    setUserRole(localStorage.getItem('auth_role'));
  };

  useEffect(() => {
    syncState();
    window.addEventListener('storage', syncState);
    window.addEventListener('cartUpdated', syncState);

    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function (key, value) {
      originalSetItem.apply(this, arguments);
      if (key === 'app_cart' || key === 'auth_role') {
        window.dispatchEvent(new Event('cartUpdated'));
      }
    };

    return () => {
      window.removeEventListener('storage', syncState);
      window.removeEventListener('cartUpdated', syncState);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_role');
    localStorage.removeItem('auth_restaurant');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('app_cart');
    setUserRole(null);
    setIsSidebarOpen(false);
    router.push('/');
  };

  const removeFromCart = (uniqueCartId) => {
    const updatedCart = cartItems.filter(item => item.uniqueCartId !== uniqueCartId);
    localStorage.setItem('app_cart', JSON.stringify(updatedCart));
    syncState();
  };

  const handleCheckoutRouting = () => {
    setIsSidebarOpen(false);
    if (!userRole) {
      router.push('/login');
    } else {
      router.push('/checkout');
    }
  };

  const formatImageUrl = (imgUrl) => {
    if (!imgUrl) return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150";
    if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) return imgUrl;
    return `${BACKEND_URL}${imgUrl}`;
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.finalItemPrice || item.price), 0);

  return (
    <>
      {/* 👑 PREMIUM MINIMAL HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#EAE5DC] text-[#1A1A1A] px-8 py-5 flex justify-between items-center transition-all duration-300">
        <Link href="/" className="font-serif text-xl tracking-[0.15em] font-medium text-[#1A1A1A] hover:opacity-80 transition-opacity">
          BREAKFAST <span className="text-[#A38A5F] font-light">SORTED</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6E655F]">
          <Link href="/" className="hover:text-[#A38A5F] transition-colors duration-200">Menu</Link>
          <Link href="/about" className="hover:text-[#A38A5F] transition-colors duration-200">Our Story</Link>
          {userRole === 'user' && <Link href="/orders" className="hover:text-[#A38A5F] transition-colors duration-200">My Orders</Link>}
          {userRole === 'chef' && <Link href="/chef" className="text-[#A38A5F] font-bold tracking-[0.25em]">👨‍🍳 Chef Panel</Link>}
          {userRole === 'admin' && <Link href="/admin" className="text-amber-700 font-bold tracking-[0.25em]">👑 Admin Panel</Link>}
        </nav>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="group bg-transparent hover:bg-[#1A1A1A] px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-widest text-[#1A1A1A] hover:text-white border border-[#1A1A1A] transition-all duration-300 flex items-center gap-3 shadow-sm"
          >
            <span>Basket</span>
            <span className="bg-[#A38A5F] group-hover:bg-white text-white group-hover:text-[#1A1A1A] text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors duration-300">
              {cartCount}
            </span>
          </button>

          {userRole ? (
            <button onClick={handleLogout} className="text-[10px] uppercase tracking-widest font-bold text-red-700/80 hover:text-red-600 transition-colors">
              Logout
            </button>
          ) : (
            <Link href="/login" className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] hover:text-[#A38A5F] transition-colors">
              Login
            </Link>
          )}
        </div>
      </header>

      {/* 🛒 SIDEBAR DRAWER PANEL */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-500" onClick={() => setIsSidebarOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white border-l border-[#EAE5DC] flex flex-col shadow-2xl">
              
              <div className="px-6 py-6 bg-[#FDFBF7] border-b border-[#EAE5DC] flex items-center justify-between">
                <h2 className="text-lg font-serif font-medium tracking-wide text-[#1A1A1A]">Your Selection</h2>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-400 hover:text-[#1A1A1A] text-lg font-light transition-colors">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-60">
                    <span className="text-3xl">🥣</span>
                    <p className="font-serif text-gray-500 text-sm italic">Your gourmet basket is currently empty.</p>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.uniqueCartId} className="flex items-center gap-4 bg-[#FDFBF7] p-3 rounded-xl border border-[#F2EDE4] transition-all hover:border-[#C8BFB0]">
                      <img 
                        src={formatImageUrl(item.img)} 
                        alt={item.name} 
                        className="w-16 h-16 object-cover rounded-lg bg-[#F5F2EB]"
                        onError={(e) => e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150"}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-[#1A1A1A] truncate">{item.name}</h4>
                        {item.chosenAddons && item.chosenAddons.length > 0 && (
                          <p className="text-[11px] text-gray-400 truncate mt-0.5">
                            + {item.chosenAddons.map(a => a.name).join(', ')}
                          </p>
                        )}
                        <p className="text-xs font-serif text-[#A38A5F] mt-1">₹{item.finalItemPrice || item.price}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.uniqueCartId)} className="text-gray-400 hover:text-red-700 p-2 text-xs transition-colors">✕</button>
                    </div>
                  ))
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="border-t border-[#EAE5DC] p-6 bg-[#FDFBF7] space-y-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#6E655F]">Subtotal</span>
                    <span className="text-2xl font-serif font-medium text-[#1A1A1A]">₹{subtotal}</span>
                  </div>
                  <button
                    onClick={handleCheckoutRouting}
                    className="w-full bg-[#1A1A1A] hover:bg-[#A38A5F] text-white text-xs font-bold uppercase tracking-widest py-4 rounded-xl shadow-md transition-all duration-300 text-center block"
                  >
                    {userRole ? "Proceed to Checkout" : "Login to Complete Order"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}