"use client";
import React, { useState, useEffect } from "react";
import { stockAdjustmentService } from "@/services/stockAdjustmentService";
import axiosInstance from "@/lib/axios";

export default function StockAdjustmentModal({ isOpen, onClose, onSave, initialData }: any) {
  const [formData, setFormData] = useState({
    adjustment_date: new Date().toISOString().split("T")[0],
    warehouse_id: "",
    reason: "",
    notes: "",
    items: [{ product_id: "", actual_qty: 0 }]
  });

  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (isOpen) {
      axiosInstance.get("/api/v1/warehouses").then(res => setWarehouses(res.data?.data || res.data || []));
      axiosInstance.get("/api/v1/products").then(res => setProducts(res.data?.data || res.data || []));

      if (initialData) setFormData(initialData);
      else setFormData({
        adjustment_date: new Date().toISOString().split("T")[0],
        warehouse_id: "",
        reason: "",
        notes: "",
        items: [{ product_id: "", actual_qty: 0 }]
      });
    }
  }, [isOpen, initialData]);

  const addItem = () => setFormData({ ...formData, items: [...formData.items, { product_id: "", actual_qty: 0 }] });
  
  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async () => {
    try {
      if (initialData) await stockAdjustmentService.update(initialData.id, formData);
      else await stockAdjustmentService.create(formData);
      onSave(); onClose();
    } catch (error) { alert("Gagal menyimpan data."); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h3 className="mb-6 text-xl font-bold">{initialData ? "Edit Penyesuaian" : "Input Penyesuaian Stok"}</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tanggal</label>
              <input type="date" className="w-full border p-2 rounded-lg text-sm" value={formData.adjustment_date} onChange={(e) => setFormData({...formData, adjustment_date: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gudang</label>
              <select className="w-full border p-2 rounded-lg text-sm" value={formData.warehouse_id} onChange={(e) => setFormData({...formData, warehouse_id: e.target.value})}>
                <option value="">Pilih Gudang</option>
                {warehouses.map((wh: any) => <option key={wh.id} value={wh.id}>{wh.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Alasan Penyesuaian</label>
            <input type="text" className="w-full border p-2 rounded-lg text-sm" placeholder="Contoh: Stok Opname Tahunan" value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} />
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <label className="font-bold text-sm">Daftar Barang & Stok Fisik</label>
              <button onClick={addItem} className="text-blue-600 text-xs font-bold">+ Tambah Baris</button>
            </div>
            
            {formData.items.map((item, index) => (
              <div key={index} className="flex gap-3 mb-3 items-center">
                <div className="flex-1">
                  <select className="w-full border p-2 rounded-lg text-sm" value={item.product_id} onChange={(e) => {
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
                    className="w-full border p-2 rounded-lg text-sm" 
                    placeholder="Stok Fisik"
                    // Atribut value harus di sini, bukan di dalam onChange
                    value={isNaN(item.actual_qty) ? "" : item.actual_qty} 
                    onChange={(e) => {
                    const val = e.target.value;
                    const newItems = [...formData.items];
                    
                    // Jika input kosong, set ke 0 agar tidak NaN
                    newItems[index].actual_qty = val === "" ? 0 : parseInt(val);
                    
                    setFormData({ ...formData, items: newItems });
                    }} 
                />
                </div>
                <button onClick={() => removeItem(index)} className="text-red-500 font-bold text-xs">Hapus</button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onClose} className="text-gray-500 text-sm font-bold px-4">Batal</button>
          <button onClick={handleSubmit} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm">Simpan Penyesuaian</button>
        </div>
      </div>
    </div>
  );
}