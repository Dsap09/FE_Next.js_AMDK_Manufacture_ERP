"use client";
import React, { useState, useEffect } from "react";
import { rawMaterialService } from "@/services/rawMaterialService";
import { warehouseService } from "@/services/warehouseService";

export default function RawMaterialStockInModal({ isOpen, onClose, onSuccess }: any) {
  const [warehouses, setWarehouses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    warehouse_id: "",
    stock_in_date: new Date().toISOString().split("T")[0],
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
    if (!formData.warehouse_id || formData.items.some(i => !i.raw_material_id || i.quantity <= 0)) {
      return alert("Harap lengkapi semua data barang!");
    }

    setLoading(true);
    try {
      await rawMaterialService.createStockIn(formData);
      alert("Penerimaan stok berhasil dicatat!");
      onSuccess();
      onClose();
      // Reset form
      setFormData({ warehouse_id: "", stock_in_date: new Date().toISOString().split("T")[0], notes: "", items: [{ raw_material_id: "", quantity: 0 }] });
    } catch (error) {
      alert("Gagal menyimpan stok masuk");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl dark:bg-gray-900 border border-white/20">
        <h3 className="text-lg font-black mb-6 uppercase text-gray-800 dark:text-white border-b pb-4">📥 Input Barang Masuk</h3>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Gudang Tujuan</label>
              <select 
                className="w-full border-2 border-gray-100 p-3 rounded-xl text-sm focus:border-blue-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700"
                value={formData.warehouse_id} 
                onChange={e => setFormData({...formData, warehouse_id: e.target.value})} 
                required
              >
                <option value="">-- Pilih Gudang --</option>
                {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Tanggal Terima</label>
              <input 
                type="date" 
                className="w-full border-2 border-gray-100 p-3 rounded-xl text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
                value={formData.stock_in_date} 
                onChange={e => setFormData({...formData, stock_in_date: e.target.value})} 
                required 
              />
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black text-gray-500 uppercase">Daftar Item</span>
              <button type="button" onClick={handleAddItem} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase">+ Tambah Baris</button>
            </div>
            
            <div className="space-y-3 max-h-52 overflow-y-auto pr-2">
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <select 
                    className="flex-1 border-2 border-gray-100 p-2.5 rounded-xl text-sm outline-none focus:border-blue-500 dark:bg-gray-800"
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
                    className="w-24 border-2 border-gray-100 p-2.5 rounded-xl text-sm text-center outline-none focus:border-blue-500 dark:bg-gray-800"
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
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Keterangan / Notes</label>
            <textarea 
              className="w-full border-2 border-gray-100 p-3 rounded-xl text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
              placeholder="Contoh: Pengiriman dari Supplier A"
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
              className="bg-blue-600 text-white px-10 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all disabled:bg-gray-300"
            >
              {loading ? "Menyimpan..." : "Konfirmasi Stok"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
