"use client";
import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { purchaseRequestService } from "@/services/purchaseRequestService";
import PurchaseRequestModal from "@/components/modals/PurchaseRequestModal";
import { 
  CheckCircle, 
  Clock, 
  Eye, 
  Send, 
  Check, 
  AlertCircle 
} from "lucide-react";

export default function PurchaseRequestPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. Ambil data dari API
  const fetchPR = async () => {
    try {
      setLoading(true);
      const res = await purchaseRequestService.getAll();
      const data = Array.isArray(res) ? res : res.data || [];
      setRequests(data);
    } catch (error) {
      console.error("Gagal sinkronisasi data PR");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPR();
  }, []);

  // 2. Logika Aksi Submit (Draft -> Submitted)
  const handleSubmitAction = async (id: number) => {
    if (!confirm("Kirim pengajuan ini ke Manajer?")) return;
    try {
      await purchaseRequestService.submit(id);
      alert("PR Berhasil disubmit!");
      fetchPR();
    } catch (error: any) {
      alert("Gagal submit: " + (error.response?.data?.message || "Cek rute /submit di Laravel"));
    }
  };

  // 3. Logika Aksi Approve (Submitted -> Approved)
  const handleApproveAction = async (id: number) => {
    if (!confirm("Setujui pengajuan ini?")) return;
    try {
      await purchaseRequestService.approve(id);
      alert("PR Berhasil disetujui!");
      fetchPR();
    } catch (error: any) {
      alert("Gagal approve: " + (error.response?.data?.message || "Cek rute /approve di Laravel"));
    }
  };

  // Helper untuk styling status
  const getStatusBadge = (status: string) => {
    const styles: any = {
      draft: "bg-gray-100 text-gray-500",
      submitted: "bg-blue-100 text-blue-600",
      approved: "bg-green-100 text-green-600",
      rejected: "bg-red-100 text-red-600"
    };
    return styles[status] || "bg-gray-100";
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageBreadcrumb pageName="Purchase Request (PR)" />
      
      <div className="flex justify-end">
        <button 
          onClick={() => { setSelectedData(null); setIsOpen(true); }}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all uppercase tracking-widest"
        >
          + Buat Pengajuan Baru
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden dark:bg-gray-900 dark:border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Kode PR</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Departemen</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Keterangan Sistem</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Alur Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-sm text-gray-400 italic">Menghubungkan ke server...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-sm text-gray-400">Data PR kosong</td></tr>
              ) : (
                requests.map((pr: any) => {
                  const isDraft = pr.status === 'draft';
                  const isSubmitted = pr.status === 'submitted';
                  const isApproved = pr.status === 'approved';

                  return (
                    <tr key={pr.id} className="hover:bg-gray-50/50 transition-all">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-blue-600 uppercase tracking-tighter italic">{pr.kode}</span>
                          <span className="text-[10px] text-gray-400 font-bold">{pr.request_date}</span>
                        </div>
                      </td>

                      {/* FIX: Menghindari error "Objects are not valid as a React child" */}
                      <td className="px-6 py-4 text-sm font-bold text-gray-600 dark:text-gray-400">
                        {typeof pr.department === 'object' ? pr.department?.name : pr.department || "-"}
                      </td>

                      <td className="px-6 py-4 text-center">
                        {isApproved ? (
                          <div className="inline-flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1 rounded-full dark:bg-green-900/20">
                            <CheckCircle size={12} strokeWidth={3} />
                            <span className="text-[9px] font-black uppercase italic">Siap Jadi PO</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 text-amber-500 bg-amber-50 px-3 py-1 rounded-full dark:bg-amber-900/20">
                            <Clock size={12} strokeWidth={3} />
                            <span className="text-[9px] font-black uppercase tracking-tight">Proses Verifikasi</span>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          {isDraft && (
                            <button 
                              onClick={() => handleSubmitAction(pr.id)}
                              className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase shadow-lg shadow-blue-100 hover:scale-105 transition-all"
                            >
                              <Send size={12} /> Submit PR
                            </button>
                          )}

                          {isSubmitted && (
                            <button 
                              onClick={() => handleApproveAction(pr.id)}
                              className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase shadow-lg shadow-green-100 hover:scale-105 transition-all"
                            >
                              <Check size={12} /> Approve PR
                            </button>
                          )}

                          {/* Tampilkan badge status jika sudah tidak bisa di-submit/approve */}
                          {(!isDraft && !isSubmitted) && (
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusBadge(pr.status)}`}>
                              {pr.status}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => { setSelectedData(pr); setIsOpen(true); }}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-all bg-gray-50 rounded-xl dark:bg-gray-800"
                        >
                          <Eye size={16} />
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

      <PurchaseRequestModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        onSave={fetchPR} 
        initialData={selectedData} 
      />
    </div>
  );
}