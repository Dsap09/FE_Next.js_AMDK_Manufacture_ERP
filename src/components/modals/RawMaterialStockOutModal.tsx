"use client";
import React, { useState, useEffect } from "react";
import { rawMaterialService } from "@/services/rawMaterialService";
import { warehouseService } from "@/services/warehouseService";

export default function RawMaterialStockOutModal({ isOpen, onClose, onSuccess }: any) {
  const [warehouses, setWarehouses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    warehouse_id: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    items: [{ raw_material_id: "", quantity: 0 }]
  });

  useEffect(() => {
    if (isOpen) {
      warehouseService.getAll().then(res => setWarehouses(Array.isArray(res) ? res : res.data || []));
      rawMaterialService.getAll().then(res => setMaterials(Array.isArray(res) ? res : res.data || []));
    }
  }, [isOpen]);

  const handleAddItem = () => {
    setFormData({ ...formData, items: [...formData.items, { raw_material_id: "", quantity: 0 }] });
  };

  const handleRemoveItem = (index: number) => {
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items] as any;
    newItems[index][field] = field === "quantity" ? parseFloat(value) : value;
    setFormData({ ...formData, items: newItems });
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    // Transformasi data di sini sebelum dikirim
    const payload = {
      issued_at: formData.date, // Mapping date ke issued_at
      warehouse_id: Number(formData.warehouse_id),
      notes: formData.notes,
      items: formData.items.map((item: any) => ({
        raw_material_id: Number(item.raw_material_id),
        quantity: Number(item.quantity),
        // Pastikan unit_id diambil dari data material atau dropdown
        unit_id: Number(item.unit_id || 1) 
      }))
    };

    await rawMaterialService.createStockOut(payload);
    alert("Stok keluar berhasil dicatat!");
    onSuccess();
    onClose();
  } catch (error: any) {
    console.error("Detail Error:", error.response?.data?.errors);
    alert("Gagal: " + (error.response?.data?.message || "Cek konsol"));
  } finally {
    setLoading(false);
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl dark:bg-gray-900 border border-white/10">
        <h3 className="text-lg font-black mb-6 uppercase text-red-600 border-b pb-4">📤 Catat Bahan Baku Keluar</h3>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Gudang Asal</label>
              <select 
                className="w-full border-2 border-gray-100 p-3 rounded-xl text-sm focus:border-red-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700"
                value={formData.warehouse_id} 
                onChange={e => setFormData({...formData, warehouse_id: e.target.value})} 
                required
              >
                <option value="">-- Pilih Gudang --</option>
                {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Tanggal Keluar</label>
              <input 
                type="date" 
                className="w-full border-2 border-gray-100 p-3 rounded-xl text-sm outline-none focus:border-red-500 dark:bg-gray-800 dark:border-gray-700"
                value={formData.date} 
                onChange={e => setFormData({...formData, date: e.target.value})} 
                required 
              />
            </div>
          </div>

          <div className="p-4 bg-red-50/30 rounded-2xl border border-red-100 dark:bg-red-900/10 dark:border-red-900/20">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black text-red-500 uppercase">Item yang Digunakan</span>
              <button type="button" onClick={handleAddItem} className="text-[10px] font-bold text-red-600 uppercase">+ Tambah Baris</button>
            </div>
            
            <div className="space-y-3 max-h-52 overflow-y-auto pr-2">
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <select 
                    className="flex-1 border-2 border-gray-100 p-2.5 rounded-xl text-sm outline-none focus:border-red-500 dark:bg-gray-800"
                    value={item.raw_material_id}
                    onChange={e => handleItemChange(index, "raw_material_id", e.target.value)} 
                    required
                  >
                    <option value="">-- Pilih Bahan Baku --</option>
                    {materials.map((m: any) => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
                  </select>
                  <input 
                    type="number" 
                    placeholder="Qty"
                    className="w-24 border-2 border-gray-100 p-2.5 rounded-xl text-sm text-center outline-none focus:border-red-500 dark:bg-gray-800"
                    value={item.quantity} 
                    onChange={e => handleItemChange(index, "quantity", e.target.value)} 
                    required 
                  />
                  {formData.items.length > 1 && (
                    <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-400 hover:text-red-600 p-1">✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Keterangan / Keperluan</label>
            <textarea 
              className="w-full border-2 border-gray-100 p-3 rounded-xl text-sm outline-none focus:border-red-500 dark:bg-gray-800 dark:border-gray-700"
              placeholder="Contoh: Digunakan untuk produksi batch #102"
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={onClose} className="text-xs font-bold text-gray-400 uppercase tracking-widest px-4">Batal</button>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-red-600 text-white px-10 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-100 hover:bg-red-700 transition-all disabled:bg-gray-300"
            >
              {loading ? "Memproses..." : "Konfirmasi Keluar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}