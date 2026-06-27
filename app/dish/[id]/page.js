"use client";
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import DriveImage from '../../../components/DriveImage';

export default function FoodAboutPage({ params }) {
  const resolvedParams = use(params);
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/dishes/?id=${resolvedParams.id}`)
      .then(res => res.json())
      .then(data => {
        // Find specific match mapping row arrays data
        const match = Array.isArray(data) ? data.find(item => item.id.toString() === resolvedParams.id) : data;
        setDish(match);
        setLoading(false);
      })
      .catch(err => {
        console.error("DB connection error drops:", err);
        setLoading(false);
      });
  }, [resolvedParams.id]);

  if (loading) return <div className="p-12 text-center text-sm font-bold text-choc-main">Parsing Recipe Parameters Manifest...</div>;
  if (!dish) return <div className="p-12 text-center text-sm font-bold text-red-600">Product schema identity matching records dropped.</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-choc-dark">
      <Link href="/" className="text-xs font-bold text-choc-light hover:text-choc-shine transition-colors flex items-center gap-1 mb-6">
        ← Back to Storefront Menu
      </Link>
      
      <div className="bg-white border border-choc-light/10 rounded-3xl p-6 md:p-10 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {/* Dynamic Google Drive Engine Rendering Asset */}
          <DriveImage driveLink={dish.img} alt={dish.name} className="w-full h-72 object-cover rounded-2xl shadow-md border-2 border-choc-light/5" />
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-black text-choc-main tracking-tight leading-tight mb-2">{dish.name}</h1>
            <div className="text-2xl font-black text-choc-shine mb-4">Base Variant Price: ₹{dish.price}</div>
            <p className="text-gray-600 text-xs leading-relaxed mb-6">{dish.description}</p>
          </div>

          <div className="space-y-4 border-t pt-4">
            <div>
              <span className="block text-[10px] font-black text-choc-light uppercase tracking-wider mb-1">Raw Ingredient Manifest</span>
              <p className="bg-choc-bg/40 p-3 rounded-xl border text-xs font-medium">{dish.ingredients}</p>
            </div>
            <div>
              <span className="block text-[10px] font-black text-choc-light uppercase tracking-wider mb-1">Micro Nutritional Allocation</span>
              <p className="bg-choc-bg/40 p-3 rounded-xl border font-mono text-xs text-choc-main font-bold">{dish.nutrition_content}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}