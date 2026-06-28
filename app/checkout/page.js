"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [isLogged, setIsLogged] = useState(false);

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new'); // Default is 'new'
  
  // Single Unified Form State
  const [addressForm, setAddressForm] = useState({ flat_no: '', area_street: '', landmark: '', pincode: '' });
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    setCartItems(JSON.parse(localStorage.getItem('app_cart') || '[]'));
    const token = localStorage.getItem('auth_token');
    setIsLogged(!!token);

    if (token) {
      // Fetch user's previous address book directly from live DB
      fetch(`${BACKEND_URL}/api/auth/addresses/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setSavedAddresses(data);
        })
        .catch(err => console.error("Error fetching addresses:", err));
    } else {
      router.push('/login');
    }
  }, []);

  // Calculate dynamic bill based on remaining products + their specific addons
  const totalBill = cartItems.reduce((acc, item) => acc + item.finalItemPrice, 0);

  const handleAddressDropdownChange = (e) => {
    const targetId = e.target.value;
    setSelectedAddressId(targetId);

    if (targetId === 'new') {
      // Clear form inputs for new entries orientation
      setAddressForm({ flat_no: '', area_street: '', landmark: '', pincode: '' });
    } else {
      // Find the selected saved address configuration properties match
      const selected = savedAddresses.find(addr => addr.id === parseInt(targetId));
      if (selected) {
        setAddressForm({
          flat_no: selected.flat_no,
          area_street: selected.area_street,
          landmark: selected.landmark || '',
          pincode: selected.pincode
        });
      }
    }
  };

  const handleRemoveItem = (uniqueCartId) => {
    const updatedCart = cartItems.filter(item => item.uniqueCartId !== uniqueCartId);
    setCartItems(updatedCart);
    localStorage.setItem('app_cart', JSON.stringify(updatedCart));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) { alert("Basket is dry!"); return; }
    if (addressForm.pincode.length !== 6) { alert("Postal index code must be exactly 6 digits."); return; }

    const token = localStorage.getItem('auth_token');

    if (!isLogged) { alert("Please login first to place an order."); router.push('/login'); return; }
    if (cartItems.length === 0) { alert("Your basket is empty!"); return; }

    const userId = localStorage.getItem('user_id');
    if (!userId) {
      alert("Your session is invalid. Please log out and log back in.");
      return;
    }

    // Creating structured strings of all items and their corresponding add-ons for the Chef Row view
    const compiledDishes = cartItems.map(item => {
      const addonNames = (item.chosenAddons || []).map(a => a.name).join(', ');
      return `${item.name} ${addonNames ? `[Addons: ${addonNames}]` : ''}`;
    }).join(' + ');

    const orderPayload = {
      restaurant_id: JSON.parse(localStorage.getItem('auth_restaurant')) || 1,
      user_id: userId,
      dish_name: compiledDishes,
      addons_selected: cartItems.map(item => item.chosenAddons.map(a => a.name).join(',')).filter(Boolean).join(' | ') || "None",
      flat_no: addressForm.flat_no,
      area_street: addressForm.area_street,
      landmark: addressForm.landmark || "None",
      pincode: addressForm.pincode,
      total_price: totalBill,
      payment_method: 'COD',
      status: 'Pending',
      is_new_address: selectedAddressId === 'new'
    };

    const res = await fetch(`${BACKEND_URL}/api/orders/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(orderPayload)
    });

    if (res.ok) {
      alert("🎉 Order placed successfully via Cash on Delivery!");
      localStorage.removeItem('app_cart');
      router.push('/');
    } else {
      alert("Failed to create order on Database.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-8 text-choc-dark">
      {/* Basket View & Remove Controls */}
      <div className="bg-white border p-6 rounded-3xl shadow-xl h-fit space-y-4">
        <h3 className="font-black text-lg text-choc-main border-b pb-2">Your Breakfast Basket</h3>
        {cartItems.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-6">Your basket is empty. Go back and add some delicious breakfast!</p>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={item.uniqueCartId} className="bg-choc-bg/40 p-4 rounded-xl border border-choc-light/10 space-y-2 relative">
                <div className="flex justify-between font-bold text-xs pr-12">
                  <span className="text-sm font-bold text-choc-main">{item.name}</span>
                  <span className="text-choc-shine">₹{item.price}</span>
                </div>
                
                {/* Displaying selected add-ons for this specific item */}
                {(item.chosenAddons || []).length > 0 && (
                  <div className="text-[11px] text-gray-500 font-semibold pl-2 border-l border-choc-light/30">
                    <p className="text-choc-light uppercase text-[9px] tracking-wider mb-0.5">Selected Add-ons:</p>
                    {(item.chosenAddons || []).map(a => (
                      <div key={a.id} className="flex justify-between">
                        <span>• {a.name}</span>
                        <span>+₹{a.price}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Individual Item Total and Remove Action Trigger */}
                <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-200">
                  <button 
                    onClick={() => handleRemoveItem(item.uniqueCartId)}
                    className="text-[10px] font-black text-red-600 hover:underline uppercase"
                  >
                    🗑️ Remove
                  </button>
                  <span className="text-xs font-black text-choc-main">Item Subtotal: ₹{item.finalItemPrice}</span>
                </div>
              </div>
            ))}
            <div className="text-right text-base font-black text-choc-main pt-3 border-t">
              Total Payable Amount: <span className="text-choc-shine text-xl ml-1">₹{totalBill}</span>
            </div>
          </div>
        )}
      </div>

      {/* Address & COD Checkout Action Form */}
      <form onSubmit={handlePlaceOrder} className="bg-white border p-6 rounded-3xl shadow-xl space-y-4 text-xs font-bold">
        <h3 className="font-black text-lg text-choc-main border-b pb-2">Please Provide Your Delivery Details</h3>
        
        {/* Step A: Saved Address Dropdown Switch Selector */}
        {savedAddresses.length > 0 && (
          <div>
            <label className="block text-[10px] uppercase text-gray-400 mb-1">Choose Location:</label>
            <select 
              value={selectedAddressId} 
              onChange={handleAddressDropdownChange}
              className="w-full p-3.5 bg-gray-50 border rounded-xl font-semibold text-xs outline-none focus:border-choc-shine text-choc-dark"
            >
              <option value="new">➕ Add New Shipping Address</option>
              {savedAddresses.map(addr => (
                <option key={addr.id} value={addr.id}>
                  📍 {`${addr.flat_no}, ${addr.area_street} (${addr.pincode})`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Step B: Structured Inputs Blocks with Controlled Values Modifiers */}
        <div className="space-y-3">
          <input 
            type="text" required placeholder="Flat / House / Apartment No. *" 
            value={addressForm.flat_no} 
            disabled={selectedAddressId !== 'new'} // Lock fields if using a saved address
            onChange={e=>setAddressForm({...addressForm, flat_no:e.target.value})} 
            className="w-full p-3.5 bg-gray-50 border rounded-xl disabled:opacity-60 disabled:cursor-not-allowed" 
          />
          <input 
            type="text" required placeholder="Area / Colony / Street Name *" 
            value={addressForm.area_street} 
            disabled={selectedAddressId !== 'new'}
            onChange={e=>setAddressForm({...addressForm, area_street:e.target.value})} 
            className="w-full p-3.5 bg-gray-50 border rounded-xl disabled:opacity-60 disabled:cursor-not-allowed" 
          />
          <input 
            type="text" placeholder="Known Landmark (Optional)" 
            value={addressForm.landmark} 
            disabled={selectedAddressId !== 'new'}
            onChange={e=>setAddressForm({...addressForm, landmark:e.target.value})} 
            className="w-full p-3.5 bg-gray-50 border rounded-xl disabled:opacity-60 disabled:cursor-not-allowed" 
          />
          <input 
            type="text" required maxLength={6} placeholder="6-Digit Postal Code Pincode *" 
            value={addressForm.pincode} 
            disabled={selectedAddressId !== 'new'}
            onChange={e=>setAddressForm({...addressForm, pincode:e.target.value})} 
            className="w-full p-3.5 bg-gray-50 border rounded-xl font-mono tracking-widest text-sm disabled:opacity-60 disabled:cursor-not-allowed" 
          />
        </div>

        <div className="p-3 bg-amber-50 rounded-xl font-bold border border-amber-200 text-amber-900 text-[10px]">
          💵 Currently, We Are Accepting COD Payments Only.
        </div>

        <button 
          type="submit" 
          disabled={cartItems.length === 0} 
          className="w-full bg-choc-main hover:bg-choc-shine text-white font-black py-4 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-40"
        >
          Place Your Order
        </button>
      </form>
    </div>
  );
}