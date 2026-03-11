"use client";
import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { stockRequestService } from "@/services/stockRequestService";
import StockRequestModal from "@/components/modals/StockRequestModal";

export default function StockRequestPage() {
  const [requests, setRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);

  const fetchData = async () => {
    try {
      const res = await stockRequestService.getAll();
      setRequests(Array.isArray(res) ? res : res.data || []);
    } catch (error) {
      console.error("Gagal memuat data");
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAction = async (id: number, type: 'approve' | 'reject' | 'delete') => {
    const confirmMsg = type === 'delete' ? "Hapus data ini?" : `Yakin ingin ${type} permintaan ini?`;
    if (!confirm(confirmMsg)) return;

    try {
      if (type === 'approve') await stockRequestService.approve(id);
      else if (type === 'reject') await stockRequestService.reject(id);
      else await stockRequestService.delete(id);
      
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal memproses aksi");
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageBreadcrumb pageName="Permintaan Stok" />

      <div className="flex justify-end">
        <button 
          onClick={() => { setSelectedData(null); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold uppercase"
        >
          + Buat Permintaan
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">No. Request</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Tanggal</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Peminta</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {requests.map((req: any) => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-gray-800 dark:text-gray-200">
                    {req.request_number}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {req.request_date}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {/* Mengambil nama user dari relasi request_by */}
                    {req.user_request?.name || "System"}
                  </td>
<td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      req.status === 'approved' ? 'bg-green-50 text-green-600' :
                      req.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {req.status || 'draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-4">
                      {/* GRUP KIRI: APPROVE & REJECT (Hanya muncul jika Draft) */}
                      {(req.status === 'draft' || !req.status) && (
                        <div className="flex flex-col gap-1 border-r border-gray-200 pr-4">
                          <button 
                            onClick={() => handleAction(req.id, 'approve')}
                            className="text-green-600 font-bold text-[10px] uppercase hover:bg-green-50 px-2 py-0.5 rounded text-right"
                          >
                            ✔ Approve
                          </button>
                          <button 
                            onClick={() => handleAction(req.id, 'reject')}
                            className="text-red-500 font-bold text-[10px] uppercase hover:bg-red-50 px-2 py-0.5 rounded text-right"
                          >
                            ✖ Reject
                          </button>
                        </div>
                      )}

                      {/* GRUP KANAN: EDIT & HAPUS */}
                      <div className="flex flex-col gap-1">
                        {(req.status === 'draft' || !req.status) ? (
                          <>
                            <button 
                              onClick={() => { setSelectedData(req); setIsModalOpen(true); }}
                              className="text-blue-600 font-bold text-[10px] uppercase hover:underline text-right"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleAction(req.id, 'delete')}
                              className="text-gray-400 font-bold text-[10px] uppercase hover:text-red-500 text-right"
                            >
                              Hapus
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] italic text-gray-400 font-bold uppercase">Locked</span>
                        )}
                      </div>
                    </div>
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
        initialData={selectedData}
        onSave={fetchData} 
      />
    </div>
  );
}
