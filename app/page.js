"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Storefront() {
  const [dishes, setDishes] = useState([]);
  const [addons, setAddons] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedAddons, setSelectedAddons] = useState({});
  const slides = [
    { title: "Kickstart your day with high protein meals", subtitle: "Six chef-built compositions engineered around performance and theatre." },
    { title: "Get your protein intake exactly right", subtitle: "Meticulously prepared daily using locally sourced artisanal ingredients." }
  ];
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
  const [activeModalDish, setActiveModalDish] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(p => (p + 1) % slides.length), 5000);
    
    fetch(`${BACKEND_URL}/api/dishes/`)
      .then(res => res.json())
      .then(data => setDishes(data))
      .catch(err => console.error("Database connection dropped: ", err));

    fetch(`${BACKEND_URL}/api/addons/`)
      .then(res => res.json())
      .then(data => setAddons(data))
      .catch(err => console.error("Database connection dropped: ", err));

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
    const addonsPrice = chosenAddons.reduce((sum, item) => sum + item.price, 0);
    
    const basketItem = {
      ...dish,
      uniqueCartId: Date.now(),
      chosenAddons: chosenAddons,
      finalItemPrice: dish.price + addonsPrice
    };

    localStorage.setItem('app_cart', JSON.stringify([...activeBasket, basketItem]));
    alert(`"${dish.name}" added to basket!`);
    setSelectedAddons(prev => ({ ...prev, [dish.id]: [] }));
  };

  // Helper function to handle fallback images gracefully
  const formatImageUrl = (imgUrl) => {
  // Ultra-premium fallback image agar koi URL na mile
  const defaultFallback = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600";

  if (!imgUrl) return defaultFallback;

  // 🔥 GOOGLE DRIVE LINK CONVERTER (Tera current link yahan bypass ho jayega)
  if (imgUrl.includes("drive.google.com")) {
    try {
      const match = imgUrl.match(/\/d\/([^/]+)/);
      if (match && match[1]) {
        // High-res view configuration (=w800) for Maison Protéine's clean grid layout
        return `https://lh3.googleusercontent.com/u/0/d/${match[1]}=w800`;
      }
    } catch (e) {
      console.error("Google Drive parsing sequence error:", e);
    }
  }

  // Next.js local public image routing parser
  if (imgUrl.startsWith('/')) return imgUrl;

  // Standard absolute URL handler
  if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
    return imgUrl;
  }
  
  return `${BACKEND_URL}${imgUrl}`;
};

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C2623] font-sans antialiased">
      
      {/* 🥞 PREMIUM IMAGE BANNER WITH LUXURY OVERLAY */}
      <section className="relative h-[420px] flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0 scale-105 transform animate-[pulse_8s_ease-in-out_infinite] opacity-60">
          <img 
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80" 
            alt="Gourmet banner background" 
            className="w-full h-full object-cover filter brightness-75 contrast-125"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#120F0E] via-black/40 to-black/30 z-10" />
        
        <div className="relative z-20 max-w-4xl mx-auto text-center px-6 transition-all duration-700 ease-out">
          <span className="text-[#D4AF37] font-medium tracking-[0.25em] text-xs uppercase block mb-4">
            Maison Protéine • Gourmet Est. 2025
          </span>
          <h2 className="text-4xl md:text-6xl font-serif text-white font-normal tracking-wide leading-tight mb-4 min-h-[120px] md:min-h-[auto]">
            {slides[currentSlide].title}
          </h2>
          <p className="text-gray-300 text-sm md:text-base max-w-xl mx-auto font-light tracking-wide">
            {slides[currentSlide].subtitle}
          </p>
        </div>
      </section>

      {/* 🥣 PRIMARY CATALOG CONTAINER */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#A38A5F] mb-2">The Menu</p>
          <h3 className="text-3xl md:text-5xl font-serif font-normal text-[#1A1A1A]">Today's Selections</h3>
          <div className="w-12 h-[2px] bg-[#D4AF37] mx-auto mt-4" />
        </div>

        {/* Dynamic Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {dishes.map(dish => {
            const currentChosen = selectedAddons[dish.id] || [];
            const dynamicTotal = dish.price + currentChosen.reduce((sum, item) => sum + item.price, 0);
            const allowedAddons = addons.filter(addon => dish.addon_ids?.includes(addon.id)) || [];

            return (
              <div 
                key={dish.id} 
                className="group bg-white border border-[#EAE5DC] rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between"
              >
                <div>
                  {/* Premium Image Handler Container */}
                  <div className="relative overflow-hidden aspect-[4/3] bg-[#F5F2EB]">
                    <img 
                      src={formatImageUrl(dish.img)} 
                      alt={dish.name || "Dish image"} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500"; 
                      }}
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm text-[10px] font-bold uppercase tracking-wider text-[#7A6951]">
                      {dish.nutrition_content ? "High Protein" : "Chef's Pick"}
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h4 className="text-xl font-serif text-[#1A1A1A] group-hover:text-[#A38A5F] transition-colors duration-300 font-medium">
                        {dish.name}
                      </h4>
                      <span className="text-lg font-medium text-[#1A1A1A] font-serif">₹{dish.price}</span>
                    </div>
                    
                    <p className="text-gray-500 text-sm font-light leading-relaxed mb-6 line-clamp-2">
                      {dish.description}
                    </p>

                    {/* Elegant Extras Add-ons Styling */}
                    {allowedAddons.length > 0 && (
                      <div className="border-t border-[#F2EDE4] pt-5 mt-4">
                        <span className="text-[11px] font-semibold text-[#8C7A62] uppercase tracking-widest block mb-3">Compose / Add Extras</span>
                        <div className="space-y-2.5">
                          {allowedAddons.map(addon => {
                            const isChecked = currentChosen.some(item => item.id === addon.id);
                            return (
                              <label key={addon.id} className="flex items-center justify-between text-xs font-medium cursor-pointer p-2 rounded-lg hover:bg-[#FDFBF7] transition-colors group/label">
                                <div className="flex items-center gap-3">
                                  <input 
                                    type="checkbox" 
                                    checked={isChecked}
                                    onChange={() => handleAddonToggle(dish.id, addon)}
                                    className="accent-[#8C7A62] w-4 h-4 border-[#C8BFB0] rounded focus:ring-0 focus:ring-offset-0" 
                                  />
                                  <span className="text-gray-700 group-hover/label:text-[#1A1A1A]">{addon.name}</span>
                                </div>
                                <span className="text-[#A38A5F] font-light">+₹{addon.price}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card CTA Block */}
                <div className="px-8 pb-8 pt-2 flex flex-col gap-3">
                  <button 
                    onClick={() => addToCart(dish)} 
                    className="w-full bg-[#1A1A1A] hover:bg-[#A38A5F] text-white text-xs font-bold uppercase tracking-widest py-4 rounded-xl shadow-sm transition-all duration-300 flex justify-between px-5"
                  >
                    <span>+ Add To Basket</span>
                    <span className="text-gray-300 group-hover:text-white font-light">Total: ₹{dynamicTotal}</span>
                  </button>
                  
                  <button 
                    onClick={() => setActiveModalDish(dish)} 
                    className="w-full bg-transparent border border-[#EAE5DC] hover:border-[#1A1A1A] text-[#554C47] hover:text-[#1A1A1A] text-center text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition-all duration-300"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* 🚀 MODAL OVERLAY */}
      {activeModalDish && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-0 relative shadow-2xl overflow-hidden border border-[#EAE5DC]">
            
            <button 
              onClick={() => setActiveModalDish(null)}
              className="absolute top-5 right-5 bg-white hover:bg-[#1A1A1A] hover:text-white text-gray-700 font-light rounded-full w-9 h-9 flex items-center justify-center transition-all duration-300 z-10 border border-gray-100 shadow-sm"
            >
              ✕
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-[#F5F2EB] flex items-center justify-center h-72 md:h-[520px]">
                <img 
                  src={formatImageUrl(activeModalDish.img)} 
                  alt={activeModalDish.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600"; 
                  }}
                />
              </div>

              <div className="p-8 md:p-12 h-96 md:h-[520px] flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold tracking-[0.2em] text-[#A38A5F] uppercase block mb-2">Gourmet Selection</span>
                  <h3 className="text-3xl font-serif font-normal text-[#1A1A1A] leading-tight mb-2">{activeModalDish.name}</h3>
                  <p className="text-[#A38A5F] text-xl font-light font-serif mb-6">₹{activeModalDish.price}</p>
                  
                  <div className="flex-grow space-y-6 overflow-y-auto pr-2 max-h-[240px] scrollbar-thin">
                    <div>
                      <h5 className="text-[11px] font-bold text-[#8C7A62] uppercase tracking-widest mb-1.5">Description</h5>
                      <p className="text-gray-600 text-sm font-light leading-relaxed">{activeModalDish.description}</p>
                    </div>

                    {activeModalDish.ingredients && (
                      <div>
                        <h5 className="text-[11px] font-bold text-[#8C7A62] uppercase tracking-widest mb-1.5">Ingredients</h5>
                        <p className="text-gray-600 text-sm font-light leading-relaxed">{activeModalDish.ingredients}</p>
                      </div>
                    )}

                    {activeModalDish.nutrition_content && (
                      <div className="bg-[#FDFBF7] p-4 rounded-xl border border-[#EAE5DC]">
                        <h5 className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-widest mb-1">Nutrition Content</h5>
                        <p className="text-gray-600 text-xs font-light tracking-wide">{activeModalDish.nutrition_content}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}