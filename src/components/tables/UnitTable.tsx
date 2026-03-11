"use client";
import React, { useEffect, useState } from "react";
import { unitService } from "@/services/unitService";
import Button from "../ui/button/Button";
import UnitModal from "../modals/UnitModal";

export default function UnitTable() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await unitService.getAll();
      setUnits(Array.isArray(res) ? res : res.data || []);
    } catch (error) {
      console.error("Gagal load data unit");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: any) => {
    try {
      if (selectedUnit) {
        await unitService.update((selectedUnit as any).id, formData);
      } else {
        await unitService.create(formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert("Gagal menyimpan data unit.");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Hapus satuan unit "${name}"?`)) {
      try {
        await unitService.delete(id);
        fetchData();
      } catch (error) {
        alert("Gagal menghapus unit.");
      }
    }
  };

  const openAddModal = () => { setSelectedUnit(null); setIsModalOpen(true); };
  const openEditModal = (unit: any) => { setSelectedUnit(unit); setIsModalOpen(true); };

  if (loading) return <div className="p-10 text-center">Memuat data unit...</div>;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-bold">Daftar Satuan Unit</h3>
        <Button onClick={openAddModal} size="sm">+ Tambah Unit</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 dark:bg-white/5">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Kode</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Nama Satuan</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Keterangan</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {units.length > 0 ? (
              units.map((u: any) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                    <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">{u.kode}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{u.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 italic">{u.description || "-"}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-3">
                    <button onClick={() => openEditModal(u)} className="text-blue-500 hover:text-blue-700 text-sm font-bold">Edit</button>
                    <button onClick={() => handleDelete(u.id, u.name)} className="text-red-500 hover:text-red-700 text-sm font-bold">Hapus</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4} className="p-10 text-center text-gray-400">Belum ada data unit.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <UnitModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        initialData={selectedUnit} 
      />
    </div>
  );
}
