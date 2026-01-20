"use client";
import React, { useEffect, useState } from "react";
import { warehouseService } from "@/services/warehouseService";
import Button from "../ui/button/Button";
import WarehouseModal from "../modals/WarehouseModal";

export default function WarehouseTable() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await warehouseService.getAll();
      const data = Array.isArray(res) ? res : res.data || [];
      setWarehouses(data);
    } catch (error) {
      console.error("Gagal load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: any) => {
    try {
      if (selectedWarehouse) {
        await warehouseService.update((selectedWarehouse as any).id, formData);
      } else {
        await warehouseService.create(formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert("Gagal menyimpan data gudang.");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Hapus gudang "${name}"?`)) {
      await warehouseService.delete(id);
      fetchData();
    }
  };

  const openAddModal = () => { setSelectedWarehouse(null); setIsModalOpen(true); };
  const openEditModal = (w: any) => { setSelectedWarehouse(w); setIsModalOpen(true); };

  if (loading) return <div className="p-10 text-center">Memuat data gudang...</div>;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-bold">Daftar Gudang (Warehouse)</h3>
        <Button onClick={openAddModal} size="sm">+ Tambah Gudang</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 dark:bg-white/5">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Kode</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Nama Gudang</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Lokasi</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {warehouses.length > 0 ? warehouses.map((w: any) => (
              <tr key={w.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                <td className="px-6 py-4 text-sm font-bold">{w.kode}</td>
                <td className="px-6 py-4 text-sm">{w.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{w.lokasi}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-3">
                  <button onClick={() => openEditModal(w)} className="text-blue-500 font-bold text-sm">Edit</button>
                  <button onClick={() => handleDelete(w.id, w.name)} className="text-red-500 font-bold text-sm">Hapus</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="p-10 text-center text-gray-400">Belum ada data gudang.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <WarehouseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        initialData={selectedWarehouse} 
      />
    </div>
  );
}