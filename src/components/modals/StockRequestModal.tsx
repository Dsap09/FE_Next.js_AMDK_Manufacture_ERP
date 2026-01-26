"use client";
import React, { useState, useEffect } from "react";
import { stockRequestService } from "@/services/stockRequestService";
import { productService } from "@/services/productService";

export default function StockRequestModal({ isOpen, onClose, onSave, initialData }: any) {
  const [formData, setFormData] = useState({
    request_date: new Date().toISOString().split("T")[0],
    notes: "",
    status: "draft",
    items: [{ product_id: "", quantity: 1 }]
  });
  const [productList, setProductList] = useState([]);

  useEffect(() => {
    // Ambil daftar produk untuk dropdown
    productService.getAllProducts().then((res: any) => setProductList(res.data || res));

if (initialData) {
      setFormData({
        ...initialData,
        status: initialData.status || "pending" // Pastikan status terisi
      });
    } else {
      setFormData({
        request_date: new Date().toISOString().split("T")[0],
        notes: "",
        status: "pending", // Reset ke pending jika buat baru
        items: [{ product_id: "", quantity: 1 }]
      });
    }
  }, [initialData, isOpen]);

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, { product_id: "", quantity: 1 }] });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async () => {
    try {
      if (initialData) {
        await stockRequestService.update(initialData.id, formData);
      } else {
        await stockRequestService.create(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      alert("Gagal menyimpan data.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl overflow-y-auto max-h-[90vh]">
        <h3 className="mb-6 text-xl font-bold">{initialData ? "Edit Permintaan" : "Buat Permintaan"}</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tanggal Permintaan</label>
              <input type="date" className="w-full border p-2 rounded-lg" value={formData.request_date} onChange={(e) => setFormData({...formData, request_date: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Catatan</label>
            <textarea className="w-full border p-2 rounded-lg" rows={2} value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Alasan permintaan..." />
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <label className="font-bold text-sm">Daftar Barang yang Diminta</label>
              <button onClick={addItem} className="text-blue-600 text-xs font-bold">+ Tambah Barang</button>
            </div>
            
            {formData.items.map((item, index) => (
              <div key={index} className="flex gap-4 mb-3 items-end">
                <div className="flex-1">
                  <select 
                    className="w-full border p-2 rounded-lg text-sm"
                    value={item.product_id}
                    onChange={(e) => {
                      const newItems = [...formData.items];
                      newItems[index].product_id = e.target.value;
                      setFormData({...formData, items: newItems});
                    }}
                  >
                    <option value="">Pilih Produk</option>
                    {productList.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="w-24">
                  <input 
                    type="number" 
                    className="w-full border p-2 rounded-lg text-sm" 
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => {
                      const newItems = [...formData.items];
                      newItems[index].quantity = parseInt(e.target.value);
                      setFormData({...formData, items: newItems});
                    }}
                  />
                </div>
                <button onClick={() => removeItem(index)} className="text-red-500 mb-2 font-bold text-xs">Hapus</button>
              </div>
            ))}
          </div>
          
          <div>
            <label className="block text-sm font-bold mb-1 uppercase text-gray-500">Status Permintaan</label>
            <select 
              className="w-full border-2 border-gray-200 p-2 rounded-lg text-sm font-bold focus:border-blue-500 outline-none"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="draft">DRAFT</option>
              <option value="approved">APPROVED (Setuju)</option>
              <option value="rejected">REJECTED (Tolak)</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onClose} className="text-gray-500 text-sm font-bold px-4">Batal</button>
          <button onClick={handleSubmit} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm">Simpan Permintaan</button>
        </div>
      </div>
    </div>
  );
}