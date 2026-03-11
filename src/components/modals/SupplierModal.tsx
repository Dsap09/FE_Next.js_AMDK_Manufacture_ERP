"use client";
import React, { useEffect, useState } from "react";
import Button from "../ui/button/Button";

export default function SupplierModal({ isOpen, onClose, onSave, initialData }: any) {
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    alamat: "",
    telepon: "",
    kontak_person: ""
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ nama: "", email: "", alamat: "", telepon: "", kontak_person: "" });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <h3 className="mb-6 text-xl font-bold text-gray-800 dark:text-white">
          {initialData ? "Edit Supplier" : "Tambah Supplier Baru"}
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium">Nama Supplier</label>
            <input type="text" className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
              value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} placeholder="Contoh: PT Sumber Air" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input type="email" className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
              value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="supplier@mail.com" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="mb-1 block text-sm font-medium">Telepon</label>
            <input type="text" className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
              value={formData.telepon} onChange={(e) => setFormData({...formData, telepon: e.target.value})} placeholder="0812..." />
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium">Kontak Person</label>
            <input type="text" className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
              value={formData.kontak_person} onChange={(e) => setFormData({...formData, kontak_person: e.target.value})} placeholder="Nama PIC" />
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium">Alamat</label>
            <textarea className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
              value={formData.alamat} onChange={(e) => setFormData({...formData, alamat: e.target.value})} placeholder="Alamat lengkap supplier" />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Batal</button>
          <Button onClick={() => onSave(formData)}>Simpan Supplier</Button>
        </div>
      </div>
    </div>
  );
}
