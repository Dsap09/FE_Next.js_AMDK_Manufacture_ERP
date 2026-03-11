"use client";
import React, { useEffect, useState } from "react";
import Button from "../ui/button/Button";

export default function UserModal({ isOpen, onClose, onSave, initialData }: any) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff-gudang" // Default role yang valid
  });

  // DAFTAR ROLE DISESUAIKAN PERSIS DENGAN PESAN ERROR BACKEND
const availableRoles = [
  "super-admin", // Masukkan ini kembali
  "admin-operasional",
  "admin-penjualan",
  "staff-gudang",
  "staff-produksi",
  "qc",
  "kurir",
  "owner"
];

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        password: "", 
        role: initialData.role || "staff-gudang"
      });
    } else {
      // Saat tambah baru, pastikan role awal adalah salah satu dari list di atas
      setFormData({ name: "", email: "", password: "", role: "staff-gudang" });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <h3 className="mb-6 text-xl font-bold text-gray-800 dark:text-white">
          {initialData ? "Edit Akses Pengguna" : "Tambah Pengguna Baru"}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Nama</label>
            <input 
              type="text" 
              className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              placeholder="Contoh: Bayu" 
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input 
              type="email" 
              className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              placeholder="bayu@example.com" 
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input 
              type="password" 
              className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
              value={formData.password} 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
              placeholder="••••••••" 
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Role Access</label>
            <select 
              className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700 capitalize"
              value={formData.role} 
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {role.replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Batal</button>
          <Button onClick={() => onSave(formData)}>Simpan Pengguna</Button>
        </div>
      </div>
    </div>
  );
}
