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

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      const data = await res.json();
      if (!res.ok) { alert(data.error || "Authentication failed validation checks."); return; }

      if (isRegister) {
        alert(data.message || "Registration completed successfully."); 
        setIsRegister(false);
      } else {
        // Store session state tokens
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_role', data.role);
        localStorage.setItem('auth_restaurant', data.branch);
        localStorage.setItem('user_id', data.user_id);
        
        // Dispatching structural update event for custom navbar framework
        window.dispatchEvent(new Event('cartUpdated'));

        if (data.role === 'admin') router.push('/admin');
        else if (data.role === 'chef') router.push('/chef');
        else router.push('/checkout');
      }
    } catch (err) {
      console.error("Authentication error: ", err);
      alert("Unable to connect to the authentication server.");
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#FDFBF7] flex items-center justify-center p-6 selection:bg-[#A38A5F]/20">
      <div className="bg-white border border-[#EAE5DC] p-10 md:p-12 rounded-2xl shadow-xl max-w-md w-full space-y-8 transition-all duration-500 hover:shadow-2xl">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#A38A5F] block">
            BREAKFAST SORTED
          </span>
          <h2 className="text-2xl md:text-3xl font-serif font-normal text-[#1A1A1A] tracking-wide leading-tight">
            {isRegister ? "Create Profile" : "Welcome Back"}
          </h2>
          <p className="text-xs text-gray-400 font-light max-w-[280px] mx-auto">
            {isRegister 
              ? "Join us to discover chef-built compositions engineered around performance." 
              : "Access your personalized epicurean nutrition dashboard."}
          </p>
          <div className="w-8 h-[1px] bg-[#D4AF37] mx-auto pt-2" />
        </div>
        
        {/* Interactive Form System */}
        <form onSubmit={executeAuthCall} className="space-y-4 text-xs font-medium">
          {isRegister && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#6E655F] block mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Alexander Mercer" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="w-full p-3.5 bg-[#FDFBF7] text-[#1A1A1A] border border-[#EAE5DC] rounded-xl focus:outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-gray-300 placeholder:font-light" 
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#6E655F] block mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  placeholder="alexander@maison.com" 
                  required 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  className="w-full p-3.5 bg-[#FDFBF7] text-[#1A1A1A] border border-[#EAE5DC] rounded-xl focus:outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-gray-300 placeholder:font-light" 
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#6E655F] block mb-1.5">Mobile Number</label>
                <input 
                  type="tel" 
                  placeholder="+91 XXXXX XXXXX" 
                  required 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                  className="w-full p-3.5 bg-[#FDFBF7] text-[#1A1A1A] border border-[#EAE5DC] rounded-xl focus:outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-gray-300 placeholder:font-light" 
                />
              </div>
            </div>
          )}

          {!isRegister && (
            <div className="space-y-1 animate-in fade-in duration-300">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#6E655F] block mb-1.5">Account Identifier</label>
              <input 
                type="text" 
                placeholder="Email or Mobile Number" 
                required 
                value={formData.identity} 
                onChange={e => setFormData({...formData, identity: e.target.value})} 
                className="w-full p-3.5 bg-[#FDFBF7] text-[#1A1A1A] border border-[#EAE5DC] rounded-xl focus:outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-gray-300 placeholder:font-light" 
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#6E655F] block mb-1.5">Passcode Pin</label>
            <input 
              type="password" 
              placeholder="••••••••••••" 
              required 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
              className="w-full p-3.5 bg-[#FDFBF7] text-[#1A1A1A] border border-[#EAE5DC] rounded-xl focus:outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-gray-300 placeholder:font-light" 
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              className="w-full bg-[#1A1A1A] hover:bg-[#A38A5F] text-white text-xs font-bold uppercase tracking-widest py-4 rounded-xl shadow-md transition-all duration-300 transform active:scale-[0.99]"
            >
              {isRegister ? "Register Account" : "Sign In"}
            </button>
          </div>
        </form>

        {/* Footnote Toggle Option */}
        <div className="pt-2">
          <button 
            onClick={() => setIsRegister(!isRegister)} 
            className="w-full text-center text-[11px] font-medium uppercase tracking-wider text-[#8C7A62] hover:text-[#1A1A1A] transition-colors duration-200"
          >
            {isRegister ? "Have an existing account? Login" : "New user? Create your account"}
          </button>
        </div>

      </div>
    </div>
  );
}