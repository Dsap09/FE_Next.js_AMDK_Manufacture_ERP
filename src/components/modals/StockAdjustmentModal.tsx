"use client";
import React, { useState, useEffect } from "react";
import { stockAdjustmentService } from "@/services/stockAdjustmentService";
import axiosInstance from "@/lib/axios";
import { Loader2, Plus, Trash2 } from "lucide-react";

export default function StockAdjustmentModal({ isOpen, onClose, onSave, initialData }: any) {
  const [mode, setMode] = useState<"product" | "raw_material">("product");
  const [formData, setFormData] = useState({
    adjustment_date: new Date().toISOString().split("T")[0],
    warehouse_id: "",
    reason: "",
    notes: "",
    items: [{ product_id: "", actual_qty: 0 }],
    // For Raw Material (Single item per backend API)
    raw_material_id: "",
    after_quantity: 0
  });

  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      axiosInstance.get("/api/v1/warehouses").then(res => setWarehouses(res.data?.data || res.data || []));
      axiosInstance.get("/api/v1/products").then(res => setProducts(res.data?.data || res.data || []));
      axiosInstance.get("/api/v1/raw-materials").then(res => setRawMaterials(res.data?.data || res.data || []));

      if (initialData) {
        if (initialData.raw_material_id) {
          setMode("raw_material");
          setFormData({
            ...formData,
            adjustment_date: initialData.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
            warehouse_id: initialData.warehouse_id?.toString() || "",
            reason: initialData.reason || "",
            raw_material_id: initialData.raw_material_id?.toString() || "",
            after_quantity: initialData.after_quantity || 0
          });
        } else {
          setMode("product");
          setFormData({
            ...formData,
            ...initialData,
            warehouse_id: initialData.warehouse_id?.toString() || "",
            items: initialData.items?.map((it: any) => ({
              product_id: it.product_id.toString(),
              actual_qty: it.actual_qty
            })) || [{ product_id: "", actual_qty: 0 }]
          });
        }
      } else {
        setFormData({
          adjustment_date: new Date().toISOString().split("T")[0],
          warehouse_id: "",
          reason: "",
          notes: "",
          items: [{ product_id: "", actual_qty: 0 }],
          raw_material_id: "",
          after_quantity: 0
        });
      }
    }
  }, [isOpen, initialData]);

  const addItem = () => setFormData({ ...formData, items: [...formData.items, { product_id: "", actual_qty: 0 }] });
  
  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async () => {
    if (!formData.warehouse_id) return alert("Pilih gudang terlebih dahulu.");
    
    try {
      setLoading(true);
      if (mode === "product") {
        if (initialData) await stockAdjustmentService.update(initialData.id, formData);
        else await stockAdjustmentService.create(formData);
      } else {
        // Raw Material handles only one item per adjustment record in backend
        const payload = {
          raw_material_id: formData.raw_material_id,
          warehouse_id: formData.warehouse_id,
          after_quantity: formData.after_quantity,
          reason: formData.reason
        };
        await stockAdjustmentService.createRawMaterial(payload);
      }
      onSave(); 
      onClose();
    } catch (error) { 
      alert("Gagal menyimpan data."); 
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-gray-800 dark:text-white">
                {initialData ? "Edit Penyesuaian" : "Input Penyesuaian Stok"}
            </h3>
            {!initialData && (
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                    <button 
                        onClick={() => setMode("product")}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mode === "product" ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600" : "text-gray-400"}`}
                    >
                        Produk
                    </button>
                    <button 
                        onClick={() => setMode("raw_material")}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mode === "raw_material" ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600" : "text-gray-400"}`}
                    >
                        Bahan Baku
                    </button>
                </div>
            )}
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Tanggal</label>
              <input 
                type="date" 
                className="w-full border-2 border-gray-100 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 p-3 rounded-2xl text-xs font-bold outline-none focus:border-blue-500 transition-all uppercase" 
                value={formData.adjustment_date} 
                onChange={(e) => setFormData({...formData, adjustment_date: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Gudang</label>
              <select 
                className="w-full border-2 border-gray-100 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 p-3 rounded-2xl text-xs font-bold outline-none focus:border-blue-500 transition-all uppercase italic" 
                value={formData.warehouse_id} 
                onChange={(e) => setFormData({...formData, warehouse_id: e.target.value})}
              >
                <option value="">Pilih Gudang</option>
                {warehouses.map((wh: any) => <option key={wh.id} value={wh.id}>{wh.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Alasan Penyesuaian</label>
            <input 
                type="text" 
                className="w-full border-2 border-gray-100 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 p-3 rounded-2xl text-xs font-bold outline-none focus:border-blue-500 transition-all placeholder:italic" 
                placeholder="Contoh: Stok Opname Tahunan" 
                value={formData.reason} 
                onChange={(e) => setFormData({...formData, reason: e.target.value})} 
            />
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
            {mode === "product" ? (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Daftar Produk & Stok Fisik</label>
                        <button onClick={addItem} className="flex items-center gap-1 text-blue-600 text-[10px] font-black uppercase hover:text-blue-700">
                            <Plus size={14} /> Tambah Baris
                        </button>
                    </div>
                    
                    <div className="space-y-3">
                        {formData.items.map((item, index) => (
                        <div key={index} className="flex gap-3 items-center bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                            <div className="flex-1">
                                <select className="w-full bg-white dark:bg-gray-800 border-none p-2 rounded-xl text-xs font-bold outline-none uppercase italic" value={item.product_id} onChange={(e) => {
                                    const newItems = [...formData.items];
                                    newItems[index].product_id = e.target.value;
                                    setFormData({...formData, items: newItems});
                                }}>
                                    <option value="">Pilih Produk</option>
                                    {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="w-32">
                                <input 
                                    type="number" 
                                    className="w-full bg-white dark:bg-gray-800 border-none p-2 rounded-xl text-xs font-black text-right outline-none" 
                                    placeholder="Qty Fisik"
                                    value={isNaN(item.actual_qty) ? "" : item.actual_qty} 
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        const newItems = [...formData.items];
                                        newItems[index].actual_qty = val === "" ? 0 : parseInt(val);
                                        setFormData({ ...formData, items: newItems });
                                    }} 
                                />
                            </div>
                            <button onClick={() => removeItem(index)} className="p-2 text-red-400 hover:text-red-600 transition-colors">
                                <Trash2 size={16} />
                            </button>
                        </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="bg-blue-50/30 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30 space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-blue-500 tracking-[0.2em] mb-4 italic">Detail Penyesuaian Bahan Baku</h4>
                    <div>
                        <label className="block text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">Pilih Bahan Baku</label>
                        <select 
                            className="w-full bg-white dark:bg-gray-800 border-2 border-transparent p-3 rounded-2xl text-xs font-bold outline-none focus:border-blue-500 uppercase italic transition-all" 
                            value={formData.raw_material_id} 
                            onChange={(e) => setFormData({...formData, raw_material_id: e.target.value})}
                        >
                            <option value="">Pilih Bahan Baku</option>
                            {rawMaterials.map((rm: any) => <option key={rm.id} value={rm.id}>{rm.name} ({rm.unit})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">Stok Fisik Saat Ini</label>
                        <input 
                            type="number" 
                            className="w-full bg-white dark:bg-gray-800 border-2 border-transparent p-3 rounded-2xl text-xs font-black outline-none focus:border-blue-500 transition-all" 
                            placeholder="Contoh: 50.5" 
                            value={formData.after_quantity} 
                            onChange={(e) => setFormData({...formData, after_quantity: e.target.value === "" ? 0 : parseFloat(e.target.value)})} 
                        />
                        <p className="text-[9px] text-gray-400 mt-2 italic font-bold uppercase tracking-tighter">* Stok di sistem akan langsung disesuaikan ke angka ini.</p>
                    </div>
                </div>
            )}
          </div>
        </div>

        <div className="mt-12 flex justify-end items-center gap-6">
          <button onClick={onClose} className="text-[11px] font-black uppercase text-gray-400 tracking-widest hover:text-gray-600 transition-colors">Batal</button>
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase shadow-xl shadow-blue-100 dark:shadow-none hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : "Simpan Penyesuaian"}
          </button>
        </div>
      </div>
    </div>
  );
}
