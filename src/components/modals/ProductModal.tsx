"use client";
import React, { useEffect, useState } from "react";
import Button from "../ui/button/Button";
import { unitService } from "@/services/unitService";

export default function ProductModal({ isOpen, onClose, onSave, initialData }: any) {
  const [formData, setFormData] = useState({
    kode: "",
    name: "",
    unit_id: "",
    tipe: "", // Pastikan menggunakan 'type' bukan 'tipe'
    volume: 0, // Inisialisasi sebagai Number
    harga: 0,
    is_returnable: true
  });
  const [units, setUnits] = useState([]);

  useEffect(() => {
    // Load data unit untuk pilihan di dropdown
    unitService.getAll().then((res) => setUnits(Array.isArray(res) ? res : res.data || []));

    if (initialData) {
      setFormData({
        ...initialData,
        volume: Number(initialData.volume), // Pastikan volume dikonversi ke number
        harga: Number(initialData.harga)
      });
    } else {
      setFormData({ kode: "", name: "", unit_id: "", tipe: "", volume: 0, harga: 0, is_returnable: true });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <h3 className="mb-6 text-xl font-bold text-gray-800 dark:text-white">
          {initialData ? "Edit Produk" : "Tambah Produk Baru"}
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium">Nama Produk</label>
            <input type="text" className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Kode Produk</label>
            <input type="text" className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
              value={formData.kode} onChange={(e) => setFormData({...formData, kode: e.target.value})} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Satuan (Unit)</label>
            <select className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
              value={formData.unit_id} onChange={(e) => setFormData({...formData, unit_id: Number(e.target.value)})}>
              <option value="">Pilih Unit</option>
              {units.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Tipe</label>
            <input type="text" className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
              value={formData.type} onChange={(e) => setFormData({...formData, tipe: e.target.value})} placeholder="Contoh: Galon" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Volume (Angka)</label>
            <input type="number" className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
              value={formData.volume} onChange={(e) => setFormData({...formData, volume: Number(e.target.value)})} />
          </div>

          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium">Harga (Rp)</label>
            <input type="number" className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
              value={formData.harga} onChange={(e) => setFormData({...formData, harga: Number(e.target.value)})} />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Batal</button>
          <Button onClick={() => onSave(formData)}>
            {initialData ? "Simpan Perubahan" : "Tambah Produk"}
          </Button>
        </div>
      </div>
    </div>
  );
}