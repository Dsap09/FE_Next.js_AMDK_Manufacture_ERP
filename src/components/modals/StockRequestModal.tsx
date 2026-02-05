"use client";
import React, { useEffect, useState } from "react";
import { stockRequestService } from "@/services/stockRequestService";
import { productService } from "@/services/productService";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData?: any;
}

export default function StockRequestModal({ isOpen, onClose, onSave, initialData }: ModalProps) {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState<any>({
    request_date: new Date().toISOString().split("T")[0],
    notes: "",
    items: [{ product_id: "", quantity: 1 }]
  });

  // 1. Sinkronisasi Data: Mengisi form saat Edit atau reset saat Tambah
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          request_date: initialData.request_date || new Date().toISOString().split("T")[0],
          notes: initialData.notes || "",
          items: initialData.items?.length > 0 
            ? initialData.items.map((it: any) => ({
                product_id: it.product_id,
                quantity: it.quantity
              }))
            : [{ product_id: "", quantity: 1 }]
        });
      } else {
        setFormData({
          request_date: new Date().toISOString().split("T")[0],
          notes: "",
          items: [{ product_id: "", quantity: 1 }]
        });
      }
    }
  }, [isOpen, initialData]);

  // 2. Mengambil Daftar Produk untuk Dropdown
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productService.getAll();
        setProducts(Array.isArray(res) ? res : res.data || []);
      } catch (error) {
        console.error("Gagal mengambil data produk:", error);
      }
    };

    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  // Handler Perubahan Data Item (Product/Quantity)
  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = field === "quantity" ? parseFloat(value) || 0 : value;
    setFormData({ ...formData, items: updatedItems });
  };

  // Tambah Baris Baru
  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_id: "", quantity: 1 }]
    });
  };

  // Hapus Baris
  const handleRemoveItem = (index: number) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_: any, i: number) => i !== index);
      setFormData({ ...formData, items: updatedItems });
    }
  };

  const handleSubmit = async () => {
    try {
      if (initialData?.id) {
        await stockRequestService.update(initialData.id, formData);
        alert("Permintaan stok berhasil diperbarui!");
      } else {
        await stockRequestService.create(formData);
        alert("Permintaan stok berhasil dibuat!");
      }
      onSave();
      onClose();
    } catch (error: any) {
      console.error("Error Detail:", error.response?.data?.errors);
      alert("Gagal simpan: " + (error.response?.data?.message || "Cek inputan Anda"));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h3 className="text-lg font-bold uppercase text-gray-700 dark:text-gray-200">
            {initialData ? `Edit Request: ${initialData.request_number}` : "Buat Permintaan Baru"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-black">✕</button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Tanggal Request</label>
              <input 
                type="date" 
                className="w-full border-2 border-gray-100 p-2.5 rounded-lg text-sm focus:border-blue-500 outline-none"
                value={formData.request_date}
                onChange={(e) => setFormData({...formData, request_date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Catatan / Tujuan</label>
              <input 
                type="text" 
                className="w-full border-2 border-gray-100 p-2.5 rounded-lg text-sm focus:border-blue-500 outline-none"
                placeholder="Contoh: Produksi harian"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold uppercase text-gray-400">Item Produk yang Diminta</span>
              <button 
                onClick={handleAddItem}
                className="text-[10px] font-bold text-blue-600 uppercase hover:underline"
              >
                + Tambah Baris
              </button>
            </div>
            
            <div className="max-h-52 overflow-y-auto space-y-3 pr-1">
              {formData.items.map((item: any, index: number) => (
                <div key={index} className="flex gap-2 items-center animate-in slide-in-from-top-1 duration-200">
                  <select 
                    className="flex-1 border-2 border-gray-100 p-2 rounded-lg text-sm focus:border-blue-500 outline-none"
                    value={item.product_id}
                    onChange={(e) => handleItemChange(index, "product_id", e.target.value)}
                  >
                    <option value="">-- Pilih Produk --</option>
                    {products.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.unit?.name || 'Unit'})</option>
                    ))}
                  </select>
                  <div className="w-28 flex items-center gap-2">
                    <input 
                      type="number" 
                      className="w-full border-2 border-gray-100 p-2 rounded-lg text-sm text-center focus:border-blue-500 outline-none"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                    />
                    {formData.items.length > 1 && (
                      <button 
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3 pt-5 border-t">
          <button 
            onClick={onClose} 
            className="px-6 py-2 text-sm font-bold text-gray-400 uppercase hover:text-gray-600"
          >
            Batal
          </button>
          <button 
            onClick={handleSubmit} 
            className="bg-blue-600 text-white px-8 py-2 rounded-lg text-sm font-bold uppercase shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
          >
            {initialData ? "Simpan Perubahan" : "Buat Request"}
          </button>
        </div>
      </div>
    </div>
  );
}