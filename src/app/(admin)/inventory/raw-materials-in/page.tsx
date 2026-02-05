"use client";
import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { rawMaterialService } from "@/services/rawMaterialService";
import RawMaterialStockInModal from "@/components/modals/RawMaterialStockInModal";
import { Plus, Calendar, FileText } from "lucide-react";

export default function RawMaterialInPage() {
  const [history, setHistory] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

    const formatIndonesianDate = (dateString: string | null | undefined) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Format Salah";
  
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await rawMaterialService.getStockInHistory();
      setHistory(Array.isArray(res) ? res : res.data || []);
    } catch (error) {
      console.error("Gagal sinkronisasi histori masuk");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageBreadcrumb pageName="Bahan Baku Masuk" />

      <div className="flex justify-end">
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg hover:bg-blue-700 transition-all uppercase tracking-wider"
        >
          <Plus size={16} /> Catat Barang Masuk
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-400">ID Transaksi</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-400">Gudang Tujuan</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-400">Tanggal Terima</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-400">Catatan</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-400 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-xs text-gray-400 italic">Memuat data histori...</td></tr>
              ) : history.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-xs text-gray-400">Belum ada data barang masuk</td></tr>
              ) : (
                history.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-sm font-bold text-blue-600">#RIN-{item.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {item.warehouse?.name || `ID: ${item.warehouse_id}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatIndonesianDate(item.issued_at || item.stock_in_date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 italic">
                      {item.notes || "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[10px] font-bold text-gray-400 hover:text-blue-600 uppercase border border-gray-200 px-3 py-1 rounded-lg">Detail</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RawMaterialStockInModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        onSuccess={fetchHistory} 
      />
    </div>
  );
}