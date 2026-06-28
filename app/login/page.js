"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SecurityPortal() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', identity: '', password: '' });
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  const executeAuthCall = async (e) => {
    e.preventDefault();
    const endpoint = isRegister ? 'register/' : 'login/';
    const bodyPayload = isRegister 
      ? { name: formData.name, email: formData.email, phone: formData.phone, password: formData.password }
      : { identity: formData.identity, password: formData.password };

    const res = await fetch(`${BACKEND_URL}/api/auth/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload)
    });

    const data = await res.json();
    if (!res.ok) { alert(data.error || "Action failed validation checks."); return; }

    if (isRegister) {
      alert(data.message); setIsRegister(false);
    } else {
      // Store session state tokens
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_role', data.role);
      localStorage.setItem('auth_restaurant', data.branch);
      localStorage.setItem('user_id', data.user_id);
      
      alert(`Authenticated successfully. Redirecting environment workflows...`);
      if (data.role === 'admin') router.push('/admin');
      else if (data.role === 'chef') router.push('/chef');
      else router.push('/checkout');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="bg-white border p-8 rounded-3xl shadow-2xl max-w-sm w-full space-y-6">
        <h2 className="text-2xl font-black text-choc-main text-center">
          {isRegister ? "Join Breakfast Sorted" : "Welcome Back! Get your Breakfast Sorted"}
        </h2>
        
        <form onSubmit={executeAuthCall} className="space-y-4 text-xs font-semibold">
          {isRegister && (
            <>
              <input type="text" placeholder="Full Profile Name" required value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} className="w-full p-3.5 bg-gray-50 border rounded-xl" />
              <input type="email" placeholder="Email Account Address" required value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} className="w-full p-3.5 bg-gray-50 border rounded-xl" />
              <input type="tel" placeholder="Mobile Number Verification" required value={formData.phone} onChange={e=>setFormData({...formData, phone:e.target.value})} className="w-full p-3.5 bg-gray-50 border rounded-xl" />
            </>
          )}
          {!isRegister && (
            <input type="text" placeholder="Registered Email ID or Phone Number" required value={formData.identity} onChange={e=>setFormData({...formData, identity:e.target.value})} className="w-full p-3.5 bg-gray-50 border rounded-xl" />
          )}
          <input type="password" placeholder="Access Authentication Pin" required value={formData.password} onChange={e=>setFormData({...formData, password:e.target.value})} className="w-full p-3.5 bg-gray-50 border rounded-xl" />

          <button type="submit" className="w-full bg-choc-main hover:bg-choc-shine text-white font-bold py-4 rounded-xl text-xs uppercase tracking-wide shadow-md transition-all">
            {isRegister ? "Commit Registry Object" : "Login"}
          </button>
        </form>

        <button onClick={() => setIsRegister(!isRegister)} className="w-full text-center text-xs font-bold text-choc-light hover:underline">
          {isRegister ? "Already hold an identity card? Login here" : "New user? Register your profile now"}
        </button>
      </div>
    </div>
  );
}