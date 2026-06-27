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

  useEffect(() => {
    // Continuous auto banner cycle shifting
    const timer = setInterval(() => setCurrentSlide(p => (p + 1) % slides.length), 4000);
    
    // Read dynamic data objects direct from database REST engine
    fetch('${BACKEND_URL}/api/dishes/')
      .then(res => res.json())
      .then(data => setDishes(data))
      .catch(err => console.error("Database connection drops: ", err));

    fetch('${BACKEND_URL}/api/addons/')
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

            return (
              <div key={dish.id} className="bg-white border border-choc-light/10 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="text-5xl bg-choc-bg p-4 rounded-xl w-fit mb-4">{dish.img}</div>
                  <h4 className="text-lg font-bold text-choc-main mb-1">{dish.name}</h4>
                  <p className="text-gray-500 text-xs line-clamp-2 mb-4">{dish.description}</p>
                  <div className="text-xl font-black text-choc-shine mb-4">₹{dish.price}</div>

                  {/* Dynamic Add-ons UI Render */}
                  <div className="border-t border-gray-100 pt-3 mb-4">
                    <span className="text-xs font-bold text-choc-light uppercase tracking-wider block mb-2">Add Extras:</span>
                    <div className="space-y-1.5">
                      {addons.map(addon => {
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
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <button 
                    onClick={() => addToCart(dish)} 
                    className="w-full bg-choc-shine hover:bg-choc-main text-white text-xs font-extrabold py-3 rounded-xl shadow-md transition-all flex justify-between px-4"
                  >
                    <span>+ Add To Basket</span>
                    <span>Total: ₹{dynamicTotal}</span>
                  </button>
                  <Link href={`/dish/${dish.id}`} className="bg-choc-dark text-white text-center text-xs font-bold py-2 rounded-xl">About Food</Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}