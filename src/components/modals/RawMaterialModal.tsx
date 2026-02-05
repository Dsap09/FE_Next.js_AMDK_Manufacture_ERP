"use client";
import React, { useState, useEffect } from "react";
import { rawMaterialService } from "@/services/rawMaterialService";

export default function RawMaterialModal({ isOpen, onClose, onSuccess, initialData }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category: "umum",
    unit: "Kg"
  });

  // Efek untuk mengisi data saat mode EDIT
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        code: initialData.code || "",
        category: initialData.category || "umum",
        unit: initialData.unit || "Kg"
      });
    } else {
      setFormData({ name: "", code: "", category: "umum", unit: "Kg" });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initialData) {
        await rawMaterialService.update(initialData.id, formData);
        alert("Bahan Baku berhasil diperbarui!");
      } else {
        await rawMaterialService.create(formData);
        alert("Bahan Baku berhasil ditambahkan!");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl dark:bg-gray-900">
        <h3 className="text-lg font-black mb-6 uppercase border-b pb-3 italic tracking-tighter">
          {initialData ? "✏️ Edit Bahan Baku" : "➕ Tambah Bahan Baku"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Kode</label>
              <input type="text" className="w-full border-2 border-gray-100 p-2.5 rounded-xl text-sm outline-none focus:border-blue-500 uppercase font-bold"
                value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Kategori</label>
              <select className="w-full border-2 border-gray-100 p-2.5 rounded-xl text-sm outline-none focus:border-blue-500"
                value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="umum">Umum</option>
                <option value="bahan_utama">Bahan Utama</option>
                <option value="kemasan">Kemasan</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nama Bahan</label>
            <input type="text" className="w-full border-2 border-gray-100 p-2.5 rounded-xl text-sm outline-none focus:border-blue-500 font-bold"
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Satuan</label>
            <select className="w-full border-2 border-gray-100 p-2.5 rounded-xl text-sm"
              value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
              <option value="Kg">Kilogram (Kg)</option>
              <option value="Gr">Gram (Gr)</option>
              <option value="Ltr">Liter (Ltr)</option>
              <option value="Pcs">Pieces (Pcs)</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="text-xs font-bold text-gray-400 uppercase">Batal</button>
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-black text-xs uppercase shadow-lg shadow-blue-100 hover:bg-blue-700">
              {loading ? "Proses..." : "Simpan Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}