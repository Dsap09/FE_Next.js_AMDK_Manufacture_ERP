"use client";
import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { stockAdjustmentService } from "@/services/stockAdjustmentService";
import StockAdjustmentModal from "@/components/modals/StockAdjustmentModal";

export default function StockAdjustmentPage() {
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await stockAdjustmentService.getAll();
      setAdjustments(Array.isArray(res) ? res : res.data || []);
    } catch (error) {
      console.error("Gagal mengambil data penyesuaian");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: number) => {
    if (confirm("Hapus data penyesuaian ini? (Ini tidak akan mengembalikan stok)")) {
      await stockAdjustmentService.delete(id);
      fetchData();
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageBreadcrumb pageName="Penyesuaian Stok (Adjustment)" />

      <div className="flex justify-end">
        <button 
          onClick={() => { setSelectedData(null); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
        >
          + Tambah Penyesuaian
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Tanggal</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Gudang</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Alasan</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 text-center">Item</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={5} className="p-6 text-center text-sm">Memuat data...</td></tr>
              ) : adjustments.map((adj: any) => (
                <tr key={adj.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                  <td className="px-6 py-4 text-sm">{adj.adjustment_date}</td>
                  <td className="px-6 py-4 text-sm font-medium">{adj.warehouse_name || `ID: ${adj.warehouse_id}`}</td>
                  <td className="px-6 py-4 text-sm">{adj.reason}</td>
                  <td className="px-6 py-4 text-sm text-center font-bold">{adj.items?.length || 0}</td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => { setSelectedData(adj); setIsModalOpen(true); }} className="text-blue-600 font-bold text-xs uppercase">Edit</button>
                    <button onClick={() => handleDelete(adj.id)} className="text-red-600 font-bold text-xs uppercase">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <StockAdjustmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={fetchData} 
        initialData={selectedData} 
      />
    </div>
  );
}