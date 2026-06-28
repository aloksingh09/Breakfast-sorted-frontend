"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Storefront() {
  const [dishes, setDishes] = useState([]);
  const [addons, setAddons] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedAddons, setSelectedAddons] = useState({});
  const slides = ["🥞 Kickstart your day with high protein meal", "🥣 Get your protein intake right"];
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
  const [activeModalDish, setActiveModalDish] = useState(null);

  useEffect(() => {
    // Continuous auto banner cycle shifting
    const timer = setInterval(() => setCurrentSlide(p => (p + 1) % slides.length), 4000);
    
    // Read dynamic data objects direct from database REST engine
    fetch(`${BACKEND_URL}/api/dishes/`)
      .then(res => res.json())
      .then(data => setDishes(data))
      .catch(err => console.error("Database connection drops: ", err));

    fetch(`${BACKEND_URL}/api/addons/`)
      .then(res => res.json())
      .then(data => setAddons(data))
      .catch(err => console.error("Database connection drops: ", err));

    return () => clearInterval(timer);
  }, []);

  const handleAddonToggle = (dishId, addon) => {
    setSelectedAddons(prev => {
      const current = prev[dishId] || [];
      const exists = current.some(item => item.id === addon.id);
      if (exists) {
        return { ...prev, [dishId]: current.filter(item => item.id !== addon.id) };
      } else {
        return { ...prev, [dishId]: [...current, addon] };
      }
    });
  };

  const addToCart = (dish) => {
    const activeBasket = JSON.parse(localStorage.getItem('app_cart') || '[]');
    const chosenAddons = selectedAddons[dish.id] || [];
    
    // Calculate single item total with its addons
    const addonsPrice = chosenAddons.reduce((sum, item) => sum + item.price, 0);
    
    const basketItem = {
      ...dish,
      uniqueCartId: Date.now(), // Unique key to remove specific item from cart
      chosenAddons: chosenAddons,
      finalItemPrice: dish.price + addonsPrice
    };

    localStorage.setItem('app_cart', JSON.stringify([...activeBasket, basketItem]));
    alert(`"${dish.name}" with selected add-ons added to basket!`);
    
    // Reset selected checkboxes for this dish
    setSelectedAddons(prev => ({ ...prev, [dish.id]: [] }));
  };

  return (
    <div className="min-h-screen pb-16">
      {/* Dynamic Slide Banner Panel */}
      <section className="bg-choc-dark text-white py-16 px-6 text-center border-b-4 border-choc-shine">
        <h2 className="text-3xl md:text-5xl font-black text-choc-bg transition-all duration-500">{slides[currentSlide]}</h2>
        <p className="text-choc-light text-xs font-bold uppercase tracking-widest mt-3">Fresh Premium Morning Recipes</p>
      </section>

      {/* Primary Catalog Container loop logic */}
      <main className="max-w-6xl mx-auto px-6 mt-12">
        <h3 className="text-2xl font-black text-choc-main mb-8 border-l-4 border-choc-shine pl-3">Today's Gourmet Selections</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {dishes.map(dish => {
            const currentChosen = selectedAddons[dish.id] || [];
            const dynamicTotal = dish.price + currentChosen.reduce((sum, item) => sum + item.price, 0);
            const allowedAddons = addons.filter(addon => dish.addon_ids?.includes(addon.id)) || [];

            return (
              <div key={dish.id} className="bg-white border border-choc-light/10 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                    {/* Image Container */}
                    <div className="bg-choc-bg p-2 rounded-2xl w-full mb-5 overflow-hidden shadow-inner">
                      <img 
                        src={dish.img} 
                        alt={dish.name || "Dish image"} 
                        className="w-full h-32 md:h-40 object-cover rounded-xl" // Size badha diya h yahan
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"; 
                        }}
                      />
                  </div>
                  <h4 className="text-lg font-bold text-choc-main mb-1">{dish.name}</h4>
                  <p className="text-gray-500 text-xs line-clamp-2 mb-4">{dish.description}</p>
                  <div className="text-xl font-black text-choc-shine mb-4">₹{dish.price}</div>

                  {/* Dynamic Add-ons UI Render */}
                  {allowedAddons.length > 0 && (
                  <div className="border-t border-gray-100 pt-3 mb-4">
                    <span className="text-xs font-bold text-choc-light uppercase tracking-wider block mb-2">Add Extras:</span>
                    <div className="space-y-1.5">
                      {allowedAddons.map(addon => {
                        const isChecked = currentChosen.some(item => item.id === addon.id);
                        return (
                          <label key={addon.id} className="flex items-center justify-between text-xs font-semibold cursor-pointer p-1 hover:bg-choc-bg rounded">
                            <div className="flex items-center gap-2">
                              <input 
                                type="checkbox" 
                                checked={isChecked}
                                onChange={() => handleAddonToggle(dish.id, addon)}
                                className="accent-choc-shine" 
                              />
                              <span>{addon.name}</span>
                            </div>
                            <span className="text-choc-shine">+₹{addon.price}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <button 
                    onClick={() => addToCart(dish)} 
                    className="w-full bg-choc-shine hover:bg-choc-main text-white text-xs font-extrabold py-3 rounded-xl shadow-md transition-all flex justify-between px-4"
                  >
                    <span>+ Add To Basket</span>
                    <span>Total: ₹{dynamicTotal}</span>
                  </button>
                  <button 
                    onClick={() => setActiveModalDish(dish)} 
                    className="w-full bg-choc-dark hover:bg-black text-white text-center text-xs font-bold py-2 rounded-xl transition-all"
                  >
                    About Food
                </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
      {/* 🚀 POP-UP MODAL UI - Side-by-Side with Scrolling */}
      {activeModalDish && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-0 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            
            {/* Close Button ("X") */}
            <button 
              onClick={() => setActiveModalDish(null)}
              className="absolute top-4 right-4 bg-gray-100/70 hover:bg-gray-200 backdrop-blur-sm text-gray-700 font-bold rounded-full w-8 h-8 flex items-center justify-center transition-all z-10"
            >
              ✕
            </button>

            {/* 🚀 SIDE-BY-SIDE LAYOUT GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2">
              
              {/* LEFT COLUMN: Image (Fixed Height, No Scroll) */}
              <div className="p-3 bg-choc-bg flex items-center justify-center h-64 md:h-[480px]">
                <img 
                  src={activeModalDish.img} 
                  alt={activeModalDish.name} 
                  className="w-full h-full object-cover rounded-xl shadow-lg"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600"; 
                  }}
                />
              </div>

              {/* RIGHT COLUMN: Details (Scrollable Content) */}
              <div className="p-6 md:p-8 h-64 md:h-[480px] flex flex-col">
                {/* Fixed Title Header */}
                <div className="border-b border-gray-100 pb-4 mb-4">
                  <h3 className="text-2xl md:text-3xl font-black text-choc-main leading-tight mb-1">{activeModalDish.name}</h3>
                  <p className="text-choc-shine text-xl font-bold">₹{activeModalDish.price}</p>
                </div>
                
                {/* 🚀 SCROLLABLE DETAILS AREA */}
                <div className="flex-grow space-y-5 overflow-y-auto pr-3 -mr-3">
                  <div>
                    <h5 className="text-xs font-bold text-choc-light uppercase tracking-wider mb-1.5">Description</h5>
                    <p className="text-gray-600 text-sm leading-relaxed">{activeModalDish.description}</p>
                  </div>

                  {/* Ingredients field jo backend model me tha */}
                  {activeModalDish.ingredients && (
                    <div>
                      <h5 className="text-xs font-bold text-choc-light uppercase tracking-wider mb-1.5">Ingredients</h5>
                      <p className="text-gray-600 text-sm leading-relaxed">{activeModalDish.ingredients}</p>
                    </div>
                  )}

                  {/* Nutrition Content field jo backend model me tha */}
                  {activeModalDish.nutrition_content && (
                    <div className="bg-choc-bg/30 p-4 rounded-xl border border-choc-light/5">
                      <h5 className="text-xs font-bold text-choc-main uppercase tracking-wider mb-1.5">Nutrition Content</h5>
                      <p className="text-gray-600 text-xs font-medium">{activeModalDish.nutrition_content}</p>
                    </div>
                  )}
                </div>
              </div>

            </div> {/* End Grid */}
          </div>
        </div>
      )}
    </div>
  );
}