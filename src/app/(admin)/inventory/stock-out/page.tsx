"use client";
import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { stockOutService } from "@/services/stockOutService";
import StockOutModal from "@/components/modals/StockOutModal";

export default function StockOutPage() {
  const [stockOuts, setStockOuts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await stockOutService.getAll();
      setStockOuts(Array.isArray(res) ? res : res.data || []);
    } catch (error) {
      console.error("Gagal mengambil data barang keluar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: number) => {
    if (confirm("Hapus catatan barang keluar ini?")) {
      try {
        await stockOutService.delete(id);
        fetchData();
      } catch (error) {
        alert("Gagal menghapus data.");
      }
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageBreadcrumb pageName="Barang Keluar" />

      <div className="flex justify-end">
        <button 
          onClick={() => { setSelectedData(null); setIsModalOpen(true); }}
          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
        >
          + Catat Barang Keluar
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Tanggal Keluar</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Ref. Permintaan</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Gudang</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Catatan</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={5} className="p-6 text-center text-sm">Memuat data...</td></tr>
              ) : stockOuts.length === 0 ? (
                <tr><td colSpan={5} className="p-6 text-center text-sm text-gray-500">Belum ada data barang keluar.</td></tr>
              ) : (
                stockOuts.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="px-6 py-4 text-sm">{item.out_date}</td>
                    <td className="px-6 py-4 text-sm font-medium">REQ-{item.stock_request_id}</td>
                    <td className="px-6 py-4 text-sm">{item.warehouse_name || `ID: ${item.warehouse_id}`}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.notes || "-"}</td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => { setSelectedData(item); setIsModalOpen(true); }} className="text-blue-600 font-bold text-xs uppercase">Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-600 font-bold text-xs uppercase">Hapus</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <StockOutModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={fetchData} 
        initialData={selectedData} 
      />
    </div>
  );
}