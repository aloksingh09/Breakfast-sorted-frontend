"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MyOrdersTracker() {
  const router = useRouter();
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      alert("Verification session required to view your order ledger.");
      router.push('/login');
      return;
    }

    fetch(`${BACKEND_URL}/api/orders/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Sort layout with newest orders first
          setUserOrders([...data].reverse());
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed loading target records:", err);
        setLoading(false);
      });
  }, [router, BACKEND_URL]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-6 h-6 border-2 border-[#A38A5F] border-t-transparent rounded-full animate-spin" />
        <div className="text-xs uppercase tracking-[0.2em] text-[#8C7A62] font-medium">
          Synchronizing Order History...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 text-[#2C2623] min-h-screen selection:bg-[#A38A5F]/20">
      
      {/* Header System */}
      <div className="mb-12">
        <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#A38A5F] mb-1">
          Dashboard
        </p>
        <h2 className="text-3xl font-serif font-normal text-[#1A1A1A] tracking-wide">
          My Order History
        </h2>
        <p className="text-xs text-gray-400 font-light mt-1">
          Trace active culinary preparations or review historical fine-dining delivery receipts.
        </p>
        <div className="w-12 h-[1px] bg-[#D4AF37] mt-4" />
      </div>

      {userOrders.length === 0 ? (
        <div className="bg-white border border-[#EAE5DC] p-16 rounded-2xl shadow-sm text-center space-y-4">
          <span className="text-2xl block">🥣</span>
          <p className="font-serif text-sm italic text-gray-400 max-w-xs mx-auto">
            No dynamic transactions registered inside your personal tracking vault yet.
          </p>
        </div>
      ) : (
        /* Row-wise (Horizontal) Premium Cards Stack */
        <div className="space-y-4">
          {userOrders.map(order => {
            const isActive = !order.status.toLowerCase().includes('delivered') && 
                             !order.status.toLowerCase().includes('prepared');
            return (
              <div 
                key={order.id} 
                className="group bg-white border border-[#EAE5DC] p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                {/* Left Metadata Grid Column */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-[11px] font-semibold text-[#8C7A62] bg-[#FDFBF7] px-2.5 py-1 rounded-md border border-[#F2EDE4]">
                      ID #{order.id}
                    </span>
                    
                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                      isActive 
                        ? 'bg-[#FDFBF7] text-[#A38A5F] border border-[#EAE5DC] animate-pulse' 
                        : 'bg-[#F5F2EB] text-[#554C47]'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <h4 className="text-lg font-serif font-normal text-[#1A1A1A] group-hover:text-[#A38A5F] transition-colors duration-200">
                    {order.dish_name}
                  </h4>
                  
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-light truncate">
                    <span>📍</span>
                    <span className="truncate">
                      Destination: {`${order.flat_no || ''}, ${order.area_street || ''} [${order.pincode || ''}]`}
                    </span>
                  </div>
                </div>

                {/* Right Structural Price & Payment Term Block */}
                <div className="text-left sm:text-right sm:border-l sm:border-[#F2EDE4] sm:pl-8 min-w-[140px] flex sm:flex-col justify-between sm:justify-center items-center sm:items-end gap-2">
                  <div>
                    <span className="block text-[9px] font-semibold uppercase tracking-widest text-gray-400">
                      Payment Mode
                    </span>
                    <span className="text-[11px] text-[#8C7A62] font-medium uppercase tracking-wider">
                      Cash on Delivery
                    </span>
                  </div>
                  
                  <div className="sm:mt-1">
                    <span className="text-xl font-serif text-[#1A1A1A]">
                      ₹{order.total_price}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}