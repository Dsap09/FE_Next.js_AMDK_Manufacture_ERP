"use client";
import React, { useEffect, useState } from "react";
import Button from "../ui/button/Button";

export default function UnitModal({ isOpen, onClose, onSave, initialData }: any) {
  const [formData, setFormData] = useState({
    kode: "",
    name: "",
    description: ""
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        kode: initialData.kode || "",
        name: initialData.name || "",
        description: initialData.description || ""
      });
    } else {
      setFormData({ kode: "", name: "", description: "" });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <h3 className="mb-6 text-xl font-bold text-gray-800 dark:text-white">
          {initialData ? "Edit Satuan Unit" : "Tambah Satuan Baru"}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Kode Unit (e.g., PCS, LTR)</label>
            <input 
              type="text" 
              className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
              value={formData.kode} 
              onChange={(e) => setFormData({...formData, kode: e.target.value})} 
              placeholder="PCS" 
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Nama Satuan</label>
            <input 
              type="text" 
              className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              placeholder="Pieces" 
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Keterangan</label>
            <textarea 
              className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              placeholder="Satuan untuk barang bijian"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Batal</button>
          <Button onClick={() => onSave(formData)}>
            {initialData ? "Simpan Perubahan" : "Simpan Unit"}
          </Button>
        </div>
      </div>
    </div>
  );
}
