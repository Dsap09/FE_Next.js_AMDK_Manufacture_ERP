"use client";
import React, { useEffect, useState } from "react";
import { supplierService } from "@/services/supplierService";
import Button from "../ui/button/Button";
import SupplierModal from "../modals/SupplierModal";

export default function SupplierTable() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await supplierService.getAll();
      setSuppliers(Array.isArray(res) ? res : res.data || []);
    } catch (error) {
      console.error("Gagal load supplier");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: any) => {
    try {
      if (selectedSupplier) {
        await supplierService.update((selectedSupplier as any).id, formData);
      } else {
        await supplierService.create(formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert("Gagal menyimpan data supplier.");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Hapus supplier "${name}"?`)) {
      await supplierService.delete(id);
      fetchData();
    }
  };

  if (loading) return <div className="p-10 text-center">Memuat data supplier...</div>;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-bold">Daftar Supplier</h3>
        <Button onClick={() => { setSelectedSupplier(null); setIsModalOpen(true); }} size="sm">+ Tambah Supplier</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 dark:bg-white/5">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Nama Supplier</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Kontak Person</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Telepon</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {suppliers.map((s: any) => (
              <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">{s.nama}</div>
                  <div className="text-xs text-gray-500">{s.email}</div>
                </td>
                <td className="px-6 py-4 text-sm">{s.kontak_person}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{s.telepon}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-3">
                  <button onClick={() => { setSelectedSupplier(s); setIsModalOpen(true); }} className="text-blue-500 font-bold text-sm">Edit</button>
                  <button onClick={() => handleDelete(s.id, s.nama)} className="text-red-500 font-bold text-sm">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SupplierModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} initialData={selectedSupplier} />
    </div>
  );
}
