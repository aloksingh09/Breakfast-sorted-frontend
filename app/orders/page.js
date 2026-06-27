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
      alert("Verification session required to map order history data lines.");
      router.push('/login');
      return;
    }

    // Pass custom specific authorization header to get users historical constraints mappings
    fetch(`${BACKEND_URL}/api/orders/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Sort layout newest arrivals sequences first mapping configuration
          setUserOrders(data.reverse());
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed loading target records:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-choc-main text-sm">Synchronizing Historic Ledger Transactions...</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-choc-dark min-h-screen">
      <h2 className="text-3xl font-black text-choc-main tracking-tight mb-2 border-l-4 border-choc-shine pl-3">My Breakfast Logs</h2>
      <p className="text-xs text-gray-500 mb-8">Trace live production line updates states or past delivery confirmations receipts.</p>

      {userOrders.length === 0 ? (
        <div className="bg-white border p-12 rounded-3xl shadow text-center text-sm font-medium text-gray-400">
          No transactions registered inside DB tracking arrays pipelines yet. Complete your first checkout stream layout!
        </div>
      ) : (
        <div className="space-y-4">
          {userOrders.map(order => (
            <div key={order.id} className="bg-white border border-choc-light/10 p-5 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-choc-shine/20">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-black text-choc-shine">Receipt ID #{order.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${order.status.includes('Prepared') ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800 animate-pulse'}`}>
                    {order.status}
                  </span>
                </div>
                <h4 className="text-base font-bold text-choc-main leading-snug">{order.dish_name}</h4>
                <p className="text-[11px] font-medium text-gray-400 max-w-xl truncate">📍 Shipped: {`${order.flat_no}, ${order.area_street} [${order.pincode}]`}</p>
              </div>

              <div className="text-right sm:border-l sm:pl-6 min-w-[100px]">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Payable COD</span>
                <span className="text-xl font-black text-choc-dark">₹{order.total_price}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}