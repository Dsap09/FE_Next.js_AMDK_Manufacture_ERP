"use client";
import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { rawMaterialService } from "@/services/rawMaterialService";
import RawMaterialModal from "@/components/modals/RawMaterialModal";
import { Plus, Pencil, Trash2, Database } from "lucide-react";

export default function RawMaterialPage() {
  const [materials, setMaterials] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await rawMaterialService.getAll();
      setMaterials(Array.isArray(res) ? res : res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMaterials(); }, []);

  const handleEdit = (item: any) => {
    setSelectedData(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus bahan baku ini?")) return;
    try {
      await rawMaterialService.delete(id);
      alert("Data berhasil dihapus");
      fetchMaterials();
    } catch (error) {
      alert("Gagal menghapus data. Pastikan bahan tidak sedang digunakan di transaksi lain.");
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageBreadcrumb pageName="Master Bahan Baku" />

      <div className="flex justify-end">
        <button 
          onClick={() => { setSelectedData(null); setIsModalOpen(true); }} 
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-blue-100 hover:bg-blue-700 uppercase tracking-tighter"
        >
          <Plus size={16} /> Tambah Bahan Baru
        </button>
      </div>

      

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden dark:bg-gray-900 dark:border-gray-800">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Info Bahan</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Kategori</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <tr><td colSpan={3} className="text-center py-10 text-gray-400 italic">Memuat data...</td></tr>
            ) : materials.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-10 text-gray-400 italic">Data kosong</td></tr>
            ) : (
              materials.map((m: any) => (
                <tr key={m.id} className="hover:bg-gray-50/50 transition-all">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-gray-800 dark:text-gray-200 uppercase">{m.name}</span>
                      <span className="text-[10px] text-blue-600 font-mono font-bold">{m.code} — {m.unit}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tight dark:bg-gray-800">
                      {m.category || 'Umum'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(m)} 
                        className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                        title="Edit Data"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(m.id)} 
                        className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                        title="Hapus Data"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <RawMaterialModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchMaterials} 
        initialData={selectedData} 
      />
    </div>
  );
}
