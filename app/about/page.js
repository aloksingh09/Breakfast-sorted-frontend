"use client";

export default function AboutCompanyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-choc-dark leading-relaxed">
      <div className="space-y-6 bg-white border border-choc-light/10 p-8 md:p-12 rounded-3xl shadow-2xl">
        <h1 className="text-4xl font-black text-choc-main tracking-tight border-b pb-4">Our Corporate Manifest</h1>
        
        <p className="text-sm font-medium text-gray-600">
          Founded on premium breakfast design models, <strong className="text-choc-main font-bold">BreakFast Sorted</strong> redefines morning kitchen logistics lines. We bridge decentralized culinary branch nodes directly with immediate household delivery corridors.
        </p>

        <blockquote className="border-l-4 border-choc-shine bg-choc-bg/40 p-4 rounded-r-xl font-serif text-sm font-medium italic text-choc-main">
          "Every execution sequence, from cocoa-roasting adjustments parameters to instant local COD parcel fleet tracking, is monitored via secure cloud matrices databases."
        </blockquote>

        <div className="space-y-3 pt-4">
          <h3 className="text-base font-black text-choc-main uppercase tracking-wider">Operational Standards Mandate</h3>
          <ul className="space-y-2 text-xs font-semibold text-gray-500 list-disc pl-5">
            <li>Zero static elements catalog displays pipeline architectures.</li>
            <li>Role-Based Access Controls deployment models safeguarding system nodes layouts.</li>
            <li>Direct physical validation of postal index coordinates structures everywhere.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}