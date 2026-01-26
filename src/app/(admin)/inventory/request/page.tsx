"use client";
import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { stockRequestService } from "@/services/stockRequestService";
import StockRequestModal from "@/components/modals/StockRequestModal";

export default function StockRequestPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await stockRequestService.getAll();
      setRequests(Array.isArray(res) ? res : res.data || []);
    } catch (error) {
      console.error("Gagal ambil data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleProcessStatus = async (id: number, status: 'approve' | 'reject' | 'draft') => {
    const messages = {
      approve: "Setujui permintaan ini?",
      reject: "Tolak permintaan ini?",
      draft: "Kembalikan status ke draft?"
    };

    if (!confirm(messages[status])) return;

    try {
      if (status === 'approve') await stockRequestService.approve(id);
      else if (status === 'reject') await stockRequestService.reject(id);
      else if (status === 'draft') await stockRequestService.setDraft(id); // Sekarang sudah didefinisikan
      
      fetchData(); // Refresh tabel
    } catch (error) {
      alert("Gagal memperbarui status. Pastikan rute di backend sudah ada.");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Hapus permintaan ini?")) {
      await stockRequestService.delete(id);
      fetchData();
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageBreadcrumb pageName="Permintaan Stok" />

      <div className="flex justify-end">
        <button 
          onClick={() => { setSelectedData(null); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
        >
          + Buat Permintaan Baru
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Tanggal</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Catatan</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 text-center">Jumlah Item</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {requests.map((req: any) => (
                <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                  <td className="px-6 py-4 text-sm">{req.request_date}</td>
                  <td className="px-6 py-4 text-sm">{req.notes || "-"}</td>
                  <td className="px-6 py-4 text-sm text-center">
                    <span className="bg-gray-100 px-2 py-1 rounded-md font-bold">
                      {req.items?.length || 0} Barang
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      req.status === 'approved' ? 'bg-green-50 text-green-600' :
                      req.status === 'rejected' ? 'bg-red-50 text-red-600' : 
                      'bg-gray-100 text-gray-600' // Warna abu-abu untuk DRAFT
                    }`}>
                      {req.status || 'draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {/* Tombol Approve/Reject hanya muncul jika status masih draft */}
                    {/* {(!req.status || req.status === 'draft') && (
                      <>
                        <button 
                          onClick={() => handleProcessStatus(req.id, 'approve')}
                          className="text-[10px] font-bold text-green-600 border border-green-200 px-2 py-1 rounded hover:bg-green-50"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleProcessStatus(req.id, 'reject')}
                          className="text-[10px] font-bold text-red-600 border border-red-200 px-2 py-1 rounded hover:bg-red-50"
                        >
                          Reject
                        </button>
                      </>
                    )} */}
                    
                    <button onClick={() => { setSelectedData(req); setIsModalOpen(true); }} className="text-blue-600 font-bold text-[10px] uppercase ml-2">Edit</button>
                    <button onClick={() => handleDelete(req.id)} className="text-gray-400 font-bold text-[10px] uppercase ml-2">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <StockRequestModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={fetchData} 
        initialData={selectedData} 
      />
    </div>
  );
}