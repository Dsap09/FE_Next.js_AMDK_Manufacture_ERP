"use client";
import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { stockOutService } from "@/services/stockOutService";
import StockOutProcessModal from "@/components/modals/StockOutModal";
// Import icon pendukung
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function StockOutPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchFromApi = async () => {
    try {
      setLoading(true);
      // Memanggil API /api/v1/stock-requests
      const res = await stockOutService.getPendingApproval();
      const data = Array.isArray(res) ? res : res.data || [];
      
      // Filter: Hanya tampilkan yang sudah di-approve atau sudah selesai
      const filtered = data.filter((item: any) => 
        item.status === 'approved' || item.status === 'completed'
      );
      setRequests(filtered);
    } catch (error) {
      console.error("Gagal sinkronisasi API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFromApi();
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageBreadcrumb pageName="Manajemen Stok Keluar" />

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-400">No. Permintaan</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-400">Peminta</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-400 text-center">Keterangan Sistem (API)</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-400 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={4} className="text-center py-12 text-sm text-gray-400 animate-pulse">Menghubungkan ke API...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-sm text-gray-400">Data antrean kosong</td></tr>
              ) : (
                requests.map((item: any) => {
                  // Cek status langsung dari field API
                  const isCompleted = item.status === 'completed';

                  return (
                    <tr key={item.id} className={`transition-all ${isCompleted ? 'opacity-70' : 'hover:bg-blue-50/30'}`}>
                      <td className="px-6 py-4 text-sm font-bold text-gray-800 dark:text-gray-200">
                        {item.request_number}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.requester?.name || "User"}
                      </td>

                      {/* KOLOM KETERANGAN DINAMIS BERDASARKAN API */}
                      <td className="px-6 py-4 text-center">
                        {isCompleted ? (
                          <div className="inline-flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full dark:bg-green-900/20">
                            <CheckCircle size={14} strokeWidth={3} />
                            <span className="text-[10px] font-black uppercase italic">Barang Berhasil Keluar</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 text-amber-500 bg-amber-50 px-3 py-1 rounded-full dark:bg-amber-900/20">
                            <Clock size={14} strokeWidth={3} />
                            <span className="text-[10px] font-black uppercase italic">Siap Diproses</span>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button 
                          disabled={isCompleted}
                          onClick={() => { setSelectedRequest(item); setIsModalOpen(true); }}
                          className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase transition-all 
                            ${isCompleted 
                              ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed" 
                              : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100"
                            }`}
                        >
                          {isCompleted ? "Sudah Keluar" : "Proses Keluar"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <StockOutProcessModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        requestData={selectedRequest}
        onSuccess={fetchFromApi}
      />
    </div>
  );
}