"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChefAdvancedWorkspace() {
  const router = useRouter();
  
  // Dynamic Registries States (Fetched directly from live DB)
  const [orders, setOrders] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [dbAddons, setDbAddons] = useState([]);

  // Active Branch Tracking & UI Control States
  const [branch, setBranch] = useState('');
  const [activeModal, setActiveModal] = useState(null); // 'dish', 'addon', 'material' or null

  // Interactive Forms State Management Objects
  const [newMaterial, setNewMaterial] = useState('');
  const [addonForm, setAddonForm] = useState({ name: '', price: '' });
  const [foodForm, setFoodForm] = useState({
    restaurant_id: '',
    name: '',
    description: '',
    img: '',
    ingredients: '',
    nutrition_content: '',
    price: '',
    discount_price: '',
    selected_addons_ids: [] // Array of chosen addon IDs for this specific dish mapping
  });
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
  const syncWorkspaceMetrics = async (branchId, token) => {
    try {
      const [ordersRes, materialsRes, restRes, addonsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/orders/?restaurant_id=${branchId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${BACKEND_URL}/api/materials/?restaurant_id=${branchId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${BACKEND_URL}/api/restaurants/`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${BACKEND_URL}/api/addons/`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (materialsRes.ok) setMaterials(await materialsRes.json());
      if (restRes.ok) setRestaurants(await restRes.json()); // Update state dynamically
      if (addonsRes.ok) setDbAddons(await addonsRes.json());
      
    } catch (err) {
      console.error("Workspace sync drops: ", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('auth_role');
    const userBranchNode = localStorage.getItem('auth_restaurant') || 'r1';

    if (!token || (role !== 'chef' && role !== 'admin')) {
      alert("Access Violation: Authorization session tokens mismatch.");
      router.push('/login');
      return;
    }
    
    setBranch(userBranchNode);
    setFoodForm(prev => ({ ...prev, restaurant_id: userBranchNode }));
    syncWorkspaceMetrics(userBranchNode, token);
  }, []);

  // --- CONTROL 1: CHANGE ORDER FLOW STATUS DROPDOWN ---
  const handleUpdateOrderStatus = async (orderId, targetStatus) => {
    const token = localStorage.getItem('auth_token');
    const res = await fetch(`${BACKEND_URL}/api/orders/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ id: orderId, status: targetStatus })
    });
    if (res.ok) {
      alert(`Status altered to ${targetStatus} successfully inside DB ledger.`);
      syncWorkspaceMetrics(branch, token);
    }
  };

  // --- CONTROL 2: EXECUTE DISH SUBMISSION ---
  const handleAddNewDish = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('auth_token');

    // Convert internal tracking sub-arrays to plain text list string representation for standard database ingestion models arrays matches
    const mappedAddonNames = foodForm.selected_addons_ids
      .map(id => dbAddons.find(a => a.id === parseInt(id))?.name)
      .filter(Boolean)
      .join(', ');

    const dishPayload = {
      restaurant_id: foodForm.restaurant_id,
      name: foodForm.name,
      description: foodForm.description,
      img: foodForm.img || "🥞",
      ingredients: `${foodForm.ingredients} ${mappedAddonNames ? `[Compatible Addons Base: ${mappedAddonNames}]` : ''}`,
      nutrition_content: foodForm.nutrition_content,
      price: parseFloat(foodForm.price),
      discount_price: foodForm.discount_price ? parseFloat(foodForm.discount_price) : null,
      is_available: true
    };

    const res = await fetch(`${BACKEND_URL}/api/dishes/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(dishPayload)
    });

    if (res.ok) {
      alert("🍽️ New product saved into live DB node catalogs view registers!");
      setFoodForm({ restaurant_id: branch, name: '', description: '', img: '', ingredients: '', nutrition_content: '', price: '', discount_price: '', selected_addons_ids: [] });
      setActiveModal(null);
    }
  };

  // --- CONTROL 3: EXECUTE ADDON SUBMISSION ---
  const handleAddNewAddon = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('auth_token');
    const res = await fetch(`${BACKEND_URL}/api/addons/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: addonForm.name, price: parseFloat(addonForm.price) })
    });

    if (res.ok) {
      alert("✨ Customization asset written into real table rules!");
      setAddonForm({ name: '', price: '' });
      setActiveModal(null);
      syncWorkspaceMetrics(branch, token); // Refresh addons list instantly
    }
  };

  // --- CONTROL 4: EXECUTE MATERIAL SUBMISSION ---
  const handlePostMaterial = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('auth_token');
    await fetch(`${BACKEND_URL}/api/materials/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ restaurant_id: branch, material_name: newMaterial })
    });
    setNewMaterial('');
    setActiveModal(null);
    syncWorkspaceMetrics(branch, token);
  };

  return (
    <div className="p-6 md:p-12 bg-gray-950 min-h-screen text-gray-200 space-y-8 relative">
      
      {/* Topbar Command Navigation Layout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-2xl font-black text-amber-500 tracking-tight">👨‍🍳 Kitchen Console Hub</h1>
          <p className="text-gray-400 text-xs mt-0.5">Tracking Node Mapping Identifier: <span className="text-white underline uppercase">{branch}</span></p>
        </div>
        
        {/* Buttons to trigger Modals Forms views parameters */}
        <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-wider">
          <button onClick={() => setActiveModal('dish')} className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-3 rounded-xl shadow transition-all active:scale-95">🍽️ Add New Dish</button>
          <button onClick={() => setActiveModal('addon')} className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-3 rounded-xl shadow transition-all active:scale-95">✨ Add New Add-On</button>
          <button onClick={() => setActiveModal('material')} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-xl shadow transition-all active:scale-95">📦 Add Material Request</button>
        </div>
      </div>

      {/* MODAL POPUPS CONTAINER OVERLAYS CODES GRAPHICS */}
      {/* MODAL POPUPS CONTAINER OVERLAYS */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border-2 border-amber-500/30 p-6 rounded-3xl max-w-md w-full relative space-y-4 text-xs max-h-[90vh] overflow-y-auto shadow-2xl">
            
            {/* 1. TOP RIGHT CROSS BUTTON (With circular background for high visibility) */}
            <button 
              onClick={() => setActiveModal(null)} 
              className="absolute top-4 right-4 bg-gray-800 text-amber-500 hover:text-white hover:bg-amber-600 h-8 w-8 rounded-full flex items-center justify-center font-black text-sm transition-all shadow-md z-10 cursor-pointer"
              title="Close Form"
            >
              ✕
            </button>
            
            {/* Modal Content Form A: New Dish */}
            {activeModal === 'dish' && (
              <form onSubmit={handleAddNewDish} className="space-y-3 font-semibold text-gray-300">
                <h3 className="text-base font-black text-amber-500 uppercase tracking-wide border-b border-gray-800 pb-2">Deploy New Recipe Object</h3>
                
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Target Restaurant Node *</label>
                  <select value={foodForm.restaurant_id} onChange={e=>setFoodForm({...foodForm, restaurant_id:e.target.value})} className="w-full p-3 bg-gray-800 rounded-xl border border-gray-700 text-white font-medium">
                    {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>

                <input type="text" placeholder="Dish Identity Name *" required value={foodForm.name} onChange={e=>setFoodForm({...foodForm, name:e.target.value})} className="w-full p-3 bg-gray-800 rounded-xl border border-gray-700 outline-none focus:border-amber-500" />
                <textarea placeholder="Public appetizing menu summary descriptive copy... *" required rows="2" value={foodForm.description} onChange={e=>setFoodForm({...foodForm, description:e.target.value})} className="w-full p-3 bg-gray-800 rounded-xl border border-gray-700 outline-none focus:border-amber-500" />
                <input type="url" placeholder="Google Drive Shareable Link Vector URL" value={foodForm.img} onChange={e=>setFoodForm({...foodForm, img:e.target.value})} className="w-full p-3 bg-gray-800 rounded-xl border border-gray-700 text-amber-400 outline-none" />
                
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" step="0.01" placeholder="Base Retail Price *" required value={foodForm.price} onChange={e=>setFoodForm({...foodForm, price:e.target.value})} className="p-3 bg-gray-800 rounded-xl border border-gray-700" />
                  <input type="number" step="0.01" placeholder="Discount Value Price" value={foodForm.discount_price} onChange={e=>setFoodForm({...foodForm, discount_price:e.target.value})} className="p-3 bg-gray-800 rounded-xl border border-gray-700" />
                </div>

                <input type="text" placeholder="Raw Base Ingredients Profiles *" required value={foodForm.ingredients} onChange={e=>setFoodForm({...foodForm, ingredients:e.target.value})} className="w-full p-3 bg-gray-800 rounded-xl border border-gray-700" />
                <input type="text" placeholder="Nutritional Value Mapping (e.g. 400 kcal) *" required value={foodForm.nutrition_content} onChange={e=>setFoodForm({...foodForm, nutrition_content:e.target.value})} className="w-full p-3 bg-gray-800 rounded-xl border border-gray-700" />
                
                <div>
                  {/* Text size ko bada (text-xs/text-sm) aur readable kiya hai */}
                  <label className="block text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">
                    ✨ Select Compatible Add-ons for this Dish *
                  </label>
                  
                  {/* Box containing checkboxes with a sleek scrollbar */}
                  <div className="w-full p-4 bg-gray-800 rounded-xl border border-gray-700 max-h-48 overflow-y-auto space-y-2">
                    {dbAddons.length === 0 ? (
                      <p className="text-gray-500 italic text-xs">No addons found in database. Create an addon first!</p>
                    ) : (
                      dbAddons.map(addon => {
                        // Safe identification string/number conversion check
                        const isChecked = foodForm.selected_addons_ids.includes(addon.id.toString()) || 
                                          foodForm.selected_addons_ids.includes(addon.id);

                        return (
                          <label 
                            key={addon.id} 
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                              isChecked 
                                ? 'bg-amber-950/40 border-amber-500/50 text-white shadow-md shadow-amber-500/5' 
                                : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:bg-gray-800/40'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input 
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  const targetId = addon.id.toString(); // Keeping it consistent as string
                                  if (e.target.checked) {
                                    // Append selected addon
                                    setFoodForm({
                                      ...foodForm,
                                      selected_addons_ids: [...foodForm.selected_addons_ids, targetId]
                                    });
                                  } else {
                                    // Filter out unselected addon
                                    setFoodForm({
                                      ...foodForm,
                                      selected_addons_ids: foodForm.selected_addons_ids.filter(id => id.toString() !== targetId)
                                    });
                                  }
                                }}
                                className="w-4 h-4 rounded text-amber-500 accent-amber-500 focus:ring-amber-500 cursor-pointer"
                              />
                              {/* Text size enlarged from 10px to text-sm */}
                              <span className="text-sm font-bold tracking-wide">{addon.name}</span>
                            </div>
                            <span className="text-amber-400 font-black text-sm font-mono">+₹{addon.price}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Action Buttons Footer */}
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setActiveModal(null)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-3 rounded-xl uppercase tracking-wider">Cancel</button>
                  <button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl uppercase tracking-wider shadow">Publish</button>
                </div>
              </form>
            )}

            {/* Modal Content Form B: Addon Create */}
            {activeModal === 'addon' && (
              <form onSubmit={handleAddNewAddon} className="space-y-3 font-semibold text-gray-300">
                <h3 className="text-base font-black text-yellow-500 uppercase tracking-wide border-b border-gray-800 pb-2">Inject Custom Topping Entry</h3>
                <input type="text" placeholder="Addon Item Variant Label Name *" required value={addonForm.name} onChange={e=>setAddonForm({...addonForm, name:e.target.value})} className="w-full p-3 bg-gray-800 rounded-xl border border-gray-700 outline-none" />
                <input type="number" step="0.01" placeholder="Price Surcharge Incurred (INR) *" required value={addonForm.price} onChange={e=>setAddonForm({...addonForm, price:e.target.value})} className="w-full p-3 bg-gray-800 rounded-xl border border-gray-700 outline-none" />
                
                {/* Action Buttons Footer */}
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setActiveModal(null)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-3 rounded-xl uppercase tracking-wider">Cancel</button>
                  <button type="submit" className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 rounded-xl uppercase tracking-wider shadow">Publish</button>
                </div>
              </form>
            )}

            {/* Modal Content Form C: Material Request */}
            {activeModal === 'material' && (
              <form onSubmit={handlePostMaterial} className="space-y-3 font-semibold text-gray-300">
                <h3 className="text-base font-black text-gray-400 uppercase tracking-wide border-b border-gray-800 pb-2">Log Kitchen Shortage Manifest</h3>
                <input type="text" required placeholder="Raw component deficit detail description (e.g. Skimmed Milk - 10L) *" value={newMaterial} onChange={e=>setNewMaterial(e.target.value)} className="w-full p-3 bg-gray-800 rounded-xl border border-gray-700 text-white outline-none" />
                
                {/* Action Buttons Footer */}
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setActiveModal(null)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-3 rounded-xl uppercase tracking-wider">Cancel</button>
                  <button type="submit" className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl uppercase tracking-wider shadow">Post Request</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Main Row Display Dashboard Workspace list table data */}
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl overflow-x-auto shadow-2xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">Active Dispatch Production Pipeline Manifest</h3>
        <table className="min-w-full text-left text-xs font-semibold">
          <thead>
            <tr className="bg-[#4A2C11] text-white uppercase font-bold tracking-wider">
              <th className="p-4 border-b border-gray-800">Receipt ID</th>
              <th className="p-4 border-b border-gray-800">Product Customization Specs</th>
              <th className="p-4 border-b border-gray-800">Delivery Target Coordinates</th>
              <th className="p-4 border-b border-gray-800">COD Total</th>
              <th className="p-4 border-b border-gray-800 text-center">Alter Flow State Dynamic</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 text-gray-300">
            {orders.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-8 text-gray-500 italic">No operational transactions tracked inside workspace node registry.</td></tr>
            ) : orders.map(o => (
              <tr key={o.id} className="hover:bg-gray-800/30 transition-colors">
                <td className="p-4 font-mono text-amber-400 font-bold">#{o.id}</td>
                <td className="p-4 text-white font-bold text-sm max-w-sm leading-relaxed">{o.dish_name}</td>
                <td className="p-4 text-gray-400 max-w-xs truncate" title={`${o.flat_no}, ${o.area_street} [${o.pincode}]`}>{`${o.flat_no}, ${o.area_street}`}</td>
                <td className="p-4 font-black text-emerald-400 text-sm">₹{o.total_price}</td>
                <td className="p-4 text-center">
                  
                  {/* Status Dropdown Interface for live flow updates processing mappings */}
                  <select 
                    value={o.status} 
                    onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                    className="bg-gray-800 text-white p-2 rounded-xl border border-gray-700 text-xs font-bold font-mono outline-none cursor-pointer focus:border-amber-500"
                  >
                    <option value="Pending">⏳ Pending Order</option>
                    <option value="Preparing">🍳 Preparing Food</option>
                    <option value="Prepared / Ready for Dispatch">📦 Prepared / Ready</option>
                    <option value="Delivered">✓ Delivered Order</option>
                  </select>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}