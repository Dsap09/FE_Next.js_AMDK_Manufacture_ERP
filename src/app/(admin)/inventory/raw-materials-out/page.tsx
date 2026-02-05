"use client";
import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { rawMaterialService } from "@/services/rawMaterialService";
import RawMaterialStockOutModal from "@/components/modals/RawMaterialStockOutModal";
import { Minus, Search, FileSpreadsheet } from "lucide-react";

export default function RawMaterialOutPage() {
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
      const res = await rawMaterialService.getStockOutHistory();
      setHistory(Array.isArray(res) ? res : res.data || []);
    } catch (error) {
      console.error("Gagal memuat histori pengeluaran");
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => { fetchHistory(); }, []);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageBreadcrumb pageName="Bahan Baku Keluar" />

      <div className="flex justify-end">
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg hover:bg-red-700 transition-all uppercase tracking-wider"
        >
          <Minus size={16} /> Catat Penggunaan Bahan
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-400">ID Transaksi</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-400">Gudang Asal</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-400">Tanggal Keluar</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-400">Keterangan</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-400 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-xs text-gray-400 italic">Memproses histori...</td></tr>
              ) : history.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-xs text-gray-400">Belum ada pemakaian bahan baku</td></tr>
              ) : (
                history.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-red-600 uppercase">#ROUT-{item.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {item.warehouse?.name || 'Gudang Utama'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatIndonesianDate(item.issued_at || item.issued_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 truncate max-w-[200px]">
                      {item.notes || "Pemakaian Produksi"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[10px] font-bold text-gray-400 hover:text-red-600 uppercase border border-gray-100 px-3 py-1 rounded-lg">Detail</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RawMaterialStockOutModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        onSuccess={fetchHistory} 
      />
    </div>
  );
}