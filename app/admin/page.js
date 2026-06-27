"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [selectedRest, setSelectedRest] = useState('all');
  const [metrics, setMetrics] = useState({ revenue: 0, productCount: 0, orderCount: 0, orders: [] });
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

  const pullAdminMetricsData = async (nodeId) => {
    const res = await fetch(`${BACKEND_URL}/api/admin/metrics/?restaurant_id=${nodeId}`);
    if (res.ok) setMetrics(await res.json());
  };

  useEffect(() => {
    if (localStorage.getItem('auth_role') !== 'admin') { router.push('/login'); return; }
    pullAdminMetricsData(selectedRest);
  }, [selectedRest]);

  return (
    <div className="p-6 md:p-12 space-y-6 text-[#2B1704]">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-black text-choc-main">👑 Master Administrative Command Terminal</h1>
        <select value={selectedRest} onChange={e => setSelectedRest(e.target.value)} className="p-3 bg-white border border-choc-main/20 rounded-xl text-xs font-bold outline-none shadow-sm">
          <option value="all">🌐 Aggregated Data All Nodes</option>
          <option value="r1">🏪 Bengaluru Branch Central</option>
          <option value="r2">🏪 Mumbai Branch Central</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-bold">
        <div className="bg-white border-b-4 border-choc-shine p-6 rounded-2xl shadow-lg">
          <span className="text-xs text-gray-400 uppercase tracking-wider">Gross Settlement Sales Revenue (COD Volume)</span>
          <h3 className="text-3xl font-black mt-2">₹{metrics.revenue}</h3>
        </div>
        <div className="bg-white border-b-4 border-choc-main p-6 rounded-2xl shadow-lg">
          <span className="text-xs text-gray-400 uppercase tracking-wider">Live Active Dynamic Menu Products</span>
          <h3 className="text-3xl font-black mt-2">{metrics.productCount} SKUs</h3>
        </div>
        <div className="bg-white border-b-4 border-amber-600 p-6 rounded-2xl shadow-lg">
          <span className="text-xs text-gray-400 uppercase tracking-wider">Total Active Dispatched Invoices</span>
          <h3 className="text-3xl font-black mt-2">{metrics.orderCount} Transactions</h3>
        </div>
      </div>

      <div className="bg-white border p-6 rounded-2xl shadow-xl overflow-x-auto text-xs">
        <table className="min-w-full text-left font-medium">
          <thead>
            <tr className="bg-choc-main text-white uppercase font-bold"><th className="p-4">Invoice ID</th><th className="p-4">Item Breakdown</th><th className="p-4">Location Node</th><th className="p-4">Final Value</th><th className="p-4">Status State</th></tr>
          </thead>
          <tbody className="divide-y text-gray-700">
            {metrics.orders.map(o => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="p-4 font-mono font-bold text-choc-shine">#{o.id}</td>
                <td className="p-4 font-bold text-choc-dark text-sm">{o.dish_name}</td>
                <td className="p-4 uppercase text-gray-500 font-bold">{o.restaurant_id}</td>
                <td className="p-4 font-black">₹{o.total_price}</td>
                <td className="p-4"><span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-[10px] font-bold">{o.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}