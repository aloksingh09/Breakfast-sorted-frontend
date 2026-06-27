// LocalStorage handlers to act like a real database before backend is ready
export const getDB = (key, defaultData) => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultData;
  }
  return defaultData;
};

export const setDB = (key, data) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// Initial Mock Data Structure
export const INITIAL_RESTAURANTS = [
  { id: "r1", name: "Chocolaty Shine - Bengaluru Central" },
  { id: "r2", name: "Chocolaty Shine - Mumbai Hub" }
];

export const INITIAL_DISHES = [
  { id: 1, restaurantId: "r1", name: "Classic Fudge Pancake Stack", description: "Rich buttermilk pancake stacks.", price: 249, img: "🥞", ingredients: "Flour, Cocoa", nutrition_content: "450 kcal", is_available: true },
  { id: 2, restaurantId: "r1", name: "Cocoa Dust Oats Bowl", description: "Healthy hot oats.", price: 189, img: "🥣", ingredients: "Oats, Honey", nutrition_content: "320 kcal", is_available: true },
  { id: 3, restaurantId: "r2", name: "Gourmet Waffle Treat", description: "Belgian waffles.", price: 299, img: "🧇", ingredients: "Waffle mix, Chocolate", nutrition_content: "510 kcal", is_available: true }
];
















//CODE FOR FUTURE USE FOR app/page.jss

// "use client";
// import { useState, useEffect } from 'react';
// import Link from 'next/link';

// const SLIDING_BANNERS = [
//   { id: 1, text: "Hot Premium Belgian Waffles Roasted in Caramel", img: "🥞" },
//   { id: 2, text: "Gourmet High-Protein Dark Chocolate Oats Bowl", img: "🥣" },
//   { id: 3, text: "Handcrafted Creamy Fluffy Croissants", img: "🥐" }
// ];

// export default function HomePage() {
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [dishes, setDishes] = useState([]);

//   // Auto-sliding interval trigger for banners
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentSlide(prev => (prev + 1) % SLIDING_BANNERS.length);
//     }, 4000);
//     return () => clearInterval(timer);
//   }, []);

//   // Sync state with simulated live DB storage object
//   useEffect(() => {
//     const initializeMockDatabase = () => {
//       const liveDB = localStorage.getItem('local_dishes_db');
//       if (!liveDB) {
//         // Hydrate default baseline dishes into dummy persistent system
//         const initialMockSet = [
//           {
//             id: 1,
//             name: "Classic Chocolate Fudge Pancake Stack",
//             description: "Fluffy rich buttermilk stacks saturated in 70% dark ganache fudge layers.",
//             price: 249,
//             img: "🥞"
//           },
//           {
//             id: 2,
//             name: "Cocoa Dust Cream Oats Bowl",
//             description: "Slow roasted oats cooked hot with honey, cocoa butter, and banana cuts.",
//             price: 189,
//             img: "🥣"
//           }
//         ];
//         localStorage.setItem('local_dishes_db', JSON.stringify(initialMockSet));
//         setDishes(initialMockSet);
//       } else {
//         setDishes(JSON.parse(liveDB));
//       }
//     };
//     initializeMockDatabase();
//   }, []);

//   const addToCart = (dish) => {
//     const currentCart = JSON.parse(localStorage.getItem('app_cart') || '[]');
//     const finalizedCartItem = { ...dish, uniqueCartId: Date.now() };
//     localStorage.setItem('app_cart', JSON.stringify([...currentCart, finalizedCartItem]));
//     alert(`Added "${dish.name}" directly to your cart!`);
//   };

//   return (
//     <div className="min-h-screen pb-16">
//       {/* Sliding Hero Banner Workspace */}
//       <section className="bg-choc-dark text-white py-16 px-6 relative overflow-hidden border-b-4 border-choc-shine">
//         <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between transition-all duration-700 ease-in-out">
//           <div className="space-y-4 max-w-lg">
//             <span className="bg-choc-shine text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full">Chef Special Menu</span>
//             <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight min-h-[96px]">
//               {SLIDING_BANNERS[currentSlide].text}
//             </h2>
//             <p className="text-gray-400 text-sm">Custom prepared orders made daily at down-to-earth prices.</p>
//           </div>
//           <div className="text-8xl md:text-[12rem] select-none filter drop-shadow-[0_10px_10px_rgba(230,106,0,0.3)] animate-bounce mt-6 md:mt-0">
//             {SLIDING_BANNERS[currentSlide].img}
//           </div>
//         </div>
        
//         {/* Sliding Dot Indexes */}
//         <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
//           {SLIDING_BANNERS.map((_, index) => (
//             <button 
//               key={index} 
//               onClick={() => setCurrentSlide(index)}
//               className={`h-2.5 w-2.5 rounded-full transition-all ${index === currentSlide ? 'bg-choc-shine w-6' : 'bg-gray-600'}`}
//             />
//           ))}
//         </div>
//       </section>

//       {/* Simplified Grid Body Content */}
//       <main className="max-w-6xl mx-auto px-6 mt-16">
//         <h3 className="text-2xl font-black text-choc-main uppercase tracking-tight mb-8 border-l-4 border-choc-shine pl-3">
//           On Today's Breakfast Menu
//         </h3>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//           {dishes.map(dish => (
//             <div key={dish.id} className="bg-white border-2 border-choc-main/5 rounded-3xl p-5 shadow-lg flex flex-col justify-between hover:shadow-xl transition-shadow bg-gradient-to-b from-white to-choc-bg/10">
//               <div>
//                 <div className="text-6xl bg-choc-bg p-4 rounded-2xl w-fit mb-4 filter drop-shadow-sm">{dish.img || "🍽️"}</div>
//                 <h4 className="text-xl font-bold text-choc-main tracking-tight mb-2">{dish.name}</h4>
//                 <p className="text-gray-600 text-xs line-clamp-3 mb-4 leading-relaxed">{dish.description}</p>
//                 <div className="text-xl font-black text-choc-shine mb-6">₹{dish.price}</div>
//               </div>

//               <div className="flex gap-2 w-full">
//                 <Link 
//                   href={`/dish/${dish.id}`}
//                   className="flex-1 bg-choc-dark hover:bg-choc-main text-white text-center text-xs font-bold py-3 px-2 rounded-xl transition-all"
//                 >
//                   About Food
//                 </Link>
//                 <button 
//                   onClick={() => addToCart(dish)}
//                   className="flex-1 bg-choc-shine hover:bg-orange-600 text-white text-xs font-extrabold py-3 px-2 rounded-xl shadow-md transition-all"
//                 >
//                   + Add to Cart
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </main>
//     </div>
//   );
// }