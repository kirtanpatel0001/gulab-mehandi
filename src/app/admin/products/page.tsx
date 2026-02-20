"use client";

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client'; // ✅ Updated import
import Image from 'next/image';

export default function AdminProductsPage() {
  // ✅ Removed unnecessary useRef wrapper, initialized directly
  const supabase = getSupabaseClient(); 

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', in_stock: 'true', tag: '',
    weight_volume: '', stain_color: '', shelf_life: '', ingredients: '',
    how_to_use: '', long_description: ''
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (filesArray.length > 4) { alert("Maximum 4 images allowed."); return; }
      setImageFiles(filesArray);
    }
  };

  const handleAddProduct = async () => {
    setIsSubmitting(true);
    let uploadedUrls: string[] = [];

    if (imageFiles.length > 0) {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      try {
        uploadedUrls = await Promise.all(imageFiles.map(async (file) => {
          const data = new FormData();
          data.append('file', file);
          data.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
          const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: data });
          const json = await res.json();
          return json.secure_url as string;
        }));
      } catch {
        alert("Image upload failed.");
        setIsSubmitting(false);
        return;
      }
    }

    const { error } = await supabase.from('products').insert([{
      name: formData.name,
      description: formData.description,
      long_description: formData.long_description,
      price: parseFloat(formData.price),
      tag: formData.tag,
      in_stock: formData.in_stock === 'true',
      image_url: uploadedUrls[0] || '',
      gallery_images: uploadedUrls,
      ingredients: formData.ingredients,
      weight_volume: formData.weight_volume,
      stain_color: formData.stain_color,
      shelf_life: formData.shelf_life,
      how_to_use: formData.how_to_use,
    }]);

    if (error) {
      alert("Database error: " + error.message);
    } else {
      setIsModalOpen(false);
      setStep(1);
      setImageFiles([]);
      setFormData({ name: '', description: '', price: '', in_stock: 'true', tag: '', weight_volume: '', stain_color: '', shelf_life: '', ingredients: '', how_to_use: '', long_description: '' });
      fetchProducts();
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product permanently?")) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts(prev => prev.filter(p => p.id !== id)); // ✅ Optimistic remove
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif text-[#1B342B] mb-2">Boutique Inventory</h1>
          <p className="text-[#1B342B]/60 text-sm font-light">Manage your organic products and media galleries.</p>
        </div>
        <button onClick={() => { setIsModalOpen(true); setStep(1); }} className="bg-[#1B342B] text-white px-6 py-3 rounded-full hover:bg-[#A67C52] transition-colors text-xs uppercase tracking-widest font-bold shadow-md">
          + Add Product
        </button>
      </header>

      <div className="bg-white border border-[#1B342B]/5 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FDFBF7] border-b border-[#1B342B]/5">
              {['Product', 'Price', 'Actions'].map((h, i) => (
                <th key={h} className={`px-8 py-6 text-[10px] uppercase tracking-widest text-[#1B342B]/50 font-bold ${i === 2 ? 'text-right' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="p-20 text-center text-[#A67C52] text-xs uppercase tracking-widest animate-pulse font-bold">Loading Products...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={3} className="p-20 text-center text-[#1B342B]/40 italic text-sm">No products yet. Add your first one.</td></tr>
            ) : products.map((p) => (
              <tr key={p.id} className="border-b border-[#1B342B]/5 hover:bg-[#FDFBF7]/60 transition-colors">
                <td className="px-8 py-6 flex items-center space-x-6">
                  <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-[#1B342B]/5 shadow-sm flex-shrink-0">
                    {p.image_url && <Image src={p.image_url} alt={p.name} fill className="object-cover" />}
                  </div>
                  <div>
                    <p className="font-bold text-[#1B342B] text-sm">{p.name}</p>
                    <p className="text-xs text-[#1B342B]/50 truncate max-w-[200px]">{p.description}</p>
                  </div>
                </td>
                <td className="px-8 py-6 font-bold text-[#1B342B]">${p.price.toFixed(2)}</td>
                <td className="px-8 py-6 text-right">
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-widest bg-red-50 px-4 py-2 rounded-full hover:bg-red-100 transition-colors">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#FDFBF7] w-full max-w-2xl rounded-3xl p-8 relative max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-[#1B342B]/40 hover:text-[#1B342B] transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="mb-8">
              <h2 className="text-3xl font-serif text-[#1B342B] mb-6">Create Product</h2>
              <div className="flex justify-between items-center relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#1B342B]/10 -z-10 -translate-y-1/2" />
                {[1, 2, 3, 4].map((num) => (
                  <div key={num} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors duration-300 ${step >= num ? 'bg-[#A67C52] text-white border-[#A67C52]' : 'bg-[#FDFBF7] text-[#1B342B]/40 border-[#1B342B]/10'}`}>
                    {num}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[9px] uppercase tracking-widest font-bold text-[#1B342B]/50 mt-2">
                <span>Basics</span><span>Media</span><span>Specs</span><span>Details</span>
              </div>
            </div>

            <div className="flex-1 mb-8">
              {step === 1 && (
                <div className="space-y-5">
                  <h3 className="text-lg font-serif text-[#1B342B] border-b border-[#1B342B]/10 pb-2 mb-4">1. Basic Information</h3>
                  {[
                    { label: 'Product Name', name: 'name', placeholder: 'Signature Bridal Cones' },
                    { label: 'Short Tagline', name: 'description', placeholder: 'Pack of 5 • Lavender Blend' },
                  ].map(({ label, name, placeholder }) => (
                    <div key={name} className="flex flex-col space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#1B342B]/80">{label}</label>
                      <input name={name} value={(formData as any)[name]} onChange={handleInputChange} placeholder={placeholder} className="border border-[#1B342B]/10 p-4 bg-white text-sm rounded-xl outline-none focus:border-[#A67C52]" />
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-5">
                    <div className="flex flex-col space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#1B342B]/80">Price (USD)</label>
                      <input name="price" value={formData.price} onChange={handleInputChange} type="number" step="0.01" placeholder="25.00" className="border border-[#1B342B]/10 p-4 bg-white text-sm rounded-xl outline-none focus:border-[#A67C52]" />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#1B342B]/80">Stock</label>
                      <select name="in_stock" value={formData.in_stock} onChange={handleInputChange} className="border border-[#1B342B]/10 p-4 bg-white text-sm rounded-xl outline-none focus:border-[#A67C52] appearance-none">
                        <option value="true">In Stock</option>
                        <option value="false">Sold Out</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <h3 className="text-lg font-serif text-[#1B342B] border-b border-[#1B342B]/10 pb-2 mb-4">2. Media Gallery</h3>
                  <div className="bg-white border-2 border-dashed border-[#A67C52]/40 rounded-2xl p-8 text-center">
                    <svg className="w-10 h-10 text-[#A67C52] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="text-[#1B342B] font-bold text-sm mb-2">Upload up to 4 High-Res Images</p>
                    <p className="text-[#1B342B]/50 text-xs mb-6">Hold Shift/Ctrl to select multiple files.</p>
                    <input type="file" multiple accept="image/*" onChange={handleFileChange} className="text-sm text-[#1B342B]/70 file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-xs file:font-bold file:uppercase file:bg-[#A67C52] file:text-white hover:file:bg-[#1B342B] cursor-pointer mx-auto block" />
                    {imageFiles.length > 0 && <p className="mt-4 text-[10px] text-green-600 font-bold uppercase tracking-widest">{imageFiles.length} files selected</p>}
                  </div>
                  <div className="flex flex-col space-y-2 mt-4">
                    <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#1B342B]/80">Promo Badge (Optional)</label>
                    <input name="tag" value={formData.tag} onChange={handleInputChange} placeholder="e.g. Best Seller" className="border border-[#1B342B]/10 p-4 bg-white text-sm rounded-xl outline-none focus:border-[#A67C52]" />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <h3 className="text-lg font-serif text-[#1B342B] border-b border-[#1B342B]/10 pb-2 mb-4">3. Professional Specs</h3>
                  <div className="grid grid-cols-2 gap-5">
                    {[
                      { label: 'Weight/Volume', name: 'weight_volume', placeholder: 'e.g. 15g per cone' },
                      { label: 'Stain Color', name: 'stain_color', placeholder: 'e.g. Deep Mahogany' },
                    ].map(({ label, name, placeholder }) => (
                      <div key={name} className="flex flex-col space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#1B342B]/80">{label}</label>
                        <input name={name} value={(formData as any)[name]} onChange={handleInputChange} placeholder={placeholder} className="border border-[#1B342B]/10 p-4 bg-white text-sm rounded-xl outline-none focus:border-[#A67C52]" />
                      </div>
                    ))}
                  </div>
                  {[
                    { label: 'Storage & Shelf Life', name: 'shelf_life', placeholder: 'e.g. Keep frozen. Lasts 6 months.', rows: 1 },
                    { label: 'Full Ingredients', name: 'ingredients', placeholder: 'Organic Rajasthani Henna...', rows: 3 },
                  ].map(({ label, name, placeholder, rows }) => (
                    <div key={name} className="flex flex-col space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#1B342B]/80">{label}</label>
                      <textarea name={name} value={(formData as any)[name]} onChange={handleInputChange} rows={rows} placeholder={placeholder} className="border border-[#1B342B]/10 p-4 bg-white text-sm rounded-xl outline-none focus:border-[#A67C52] resize-none" />
                    </div>
                  ))}
                </div>
              )}

              {step === 4 && (
                <div className="space-y-5">
                  <h3 className="text-lg font-serif text-[#1B342B] border-b border-[#1B342B]/10 pb-2 mb-4">4. Application & Story</h3>
                  {[
                    { label: 'How to Use', name: 'how_to_use', placeholder: 'Apply on clean skin...', rows: 3 },
                    { label: 'The Story (Product Page Details)', name: 'long_description', placeholder: 'Describe the crafting process...', rows: 5 },
                  ].map(({ label, name, placeholder, rows }) => (
                    <div key={name} className="flex flex-col space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#1B342B]/80">{label}</label>
                      <textarea name={name} value={(formData as any)[name]} onChange={handleInputChange} rows={rows} placeholder={placeholder} className="border border-[#1B342B]/10 p-4 bg-white text-sm rounded-xl outline-none focus:border-[#A67C52] resize-none" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between border-t border-[#1B342B]/10 pt-6">
              {step > 1 ? (
                <button onClick={() => setStep(step - 1)} className="px-6 py-3 text-xs uppercase tracking-widest font-bold text-[#1B342B]/60 hover:text-[#1B342B] transition-colors">
                  ← Back
                </button>
              ) : <div />}
              {step < 4 ? (
                <button onClick={() => setStep(step + 1)} className="bg-[#1B342B] text-[#FDFBF7] px-8 py-3 rounded-full hover:bg-[#A67C52] transition-colors uppercase text-xs tracking-widest font-bold shadow-md">
                  Next Step →
                </button>
              ) : (
                <button onClick={handleAddProduct} disabled={isSubmitting} className="bg-[#A67C52] text-white px-8 py-3 rounded-full hover:bg-[#1B342B] transition-colors uppercase text-xs tracking-widest font-bold shadow-md disabled:opacity-50">
                  {isSubmitting ? 'Uploading...' : 'Publish Product'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}