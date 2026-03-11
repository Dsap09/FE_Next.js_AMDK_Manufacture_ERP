"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { purchaseRequestService } from "@/services/purchaseRequestService";
import PurchaseRequestModal from "@/components/modals/PurchaseRequestModal";
import {
  CheckCircle,
  Clock,
  Eye,
  Send,
  Check,
  X,
  ListChecks,
  Loader2
} from "lucide-react";

export default function PurchaseRequestPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Data dari Backend
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

  // 2. Handler Submit (Draft -> Submitted)
  const handleSubmitAction = async (id: number) => {
    if (!confirm("Kirim pengajuan ini untuk diverifikasi?")) return;
    try {
      await purchaseRequestService.submit(id);
      alert("PR Berhasil disubmit!");
      fetchPR();
    } catch (error: any) {
      alert("Gagal: " + (error.response?.data?.message || "Kesalahan sistem"));
    }
  };

  // 3. Handler Approve (Submitted -> Approved)
  const handleApproveAction = async (id: number) => {
    if (!confirm("Setujui pengajuan PR ini?")) return;
    try {
      await purchaseRequestService.approve(id);
      alert("PR Berhasil disetujui!");
      fetchPR();
    } catch (error: any) {
      alert("Gagal: " + (error.response?.data?.message || "Kesalahan sistem"));
    }
  };

  // 4. Handler Reject (Submitted -> Rejected)
  const handleRejectAction = async (id: number) => {
    if (!confirm("Tolak pengajuan PR ini?")) return;
    try {
      await purchaseRequestService.reject(id);
      alert("PR Berhasil ditolak!");
      fetchPR();
    } catch (error: any) {
      alert("Gagal: " + (error.response?.data?.message || "Kesalahan sistem"));
    }
  };

  // Helper Warna Status
  const getStatusBadge = (status: string) => {
    const styles: any = {
      draft: "bg-gray-100 text-gray-400",
      submitted: "bg-blue-100 text-blue-600",
      approved: "bg-emerald-100 text-emerald-600",
      rejected: "bg-red-100 text-red-600"
    };
    return styles[status] || "bg-gray-100";
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageBreadcrumb pageName="Purchase Request" />

      {/* Tombol Buat Baru */}
      <div className="flex justify-end">
        <button
          onClick={() => { setSelectedData(null); setIsOpen(true); }}
          className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-[11px] font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all uppercase tracking-widest active:scale-95"
        >
          + Create New Request
        </button>
      </div>

      {/* Tabel Utama */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden dark:bg-gray-900 dark:border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Identitas PR</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Departemen</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Info Sistem</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Alur Status</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-gray-300 mb-2" />
                    <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Sinkronisasi Data...</span>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-xs font-bold text-gray-300 uppercase tracking-widest">
                    Belum ada data pengajuan
                  </td>
                </tr>
              ) : (
                requests.map((pr: any) => {
                  const isDraft = pr.status === 'draft';
                  const isSubmitted = pr.status === 'submitted';
                  const isApproved = pr.status === 'approved';

                  return (
                    <tr key={pr.id} className="hover:bg-gray-50/50 transition-all">
                      {/* Kode & Tanggal */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-blue-600 uppercase tracking-tighter italic">{pr.kode}</span>
                          <span className="text-[10px] text-gray-400 font-bold">{pr.request_date}</span>
                        </div>
                      </td>

                      {/* Departemen */}
                      <td className="px-6 py-4 text-xs font-black text-gray-600 dark:text-gray-400 uppercase italic">
                        {pr.department || "-"}
                      </td>

                      {/* Info Sistem */}
                      <td className="px-6 py-4 text-center">
                        {isApproved ? (
                          <div className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                            <CheckCircle size={10} strokeWidth={3} />
                            <span className="text-[9px] font-black uppercase italic">Ready to PO</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 text-amber-500 bg-amber-50 px-3 py-1 rounded-full">
                            <Clock size={10} strokeWidth={3} />
                            <span className="text-[9px] font-black uppercase tracking-tight">On Process</span>
                          </div>
                        )}
                      </td>

                      {/* Status & Transisi */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          {isDraft && (
                            <button
                              onClick={() => handleSubmitAction(pr.id)}
                              className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase shadow-lg shadow-blue-100 hover:scale-105 transition-all"
                            >
                              <Send size={10} /> Submit
                            </button>
                          )}

                          {isSubmitted && (
                            <>
                              <button
                                onClick={() => handleApproveAction(pr.id)}
                                className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase shadow-lg shadow-emerald-100 hover:scale-105 transition-all"
                              >
                                <Check size={10} /> Approve
                              </button>
                              <button
                                onClick={() => handleRejectAction(pr.id)}
                                className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase shadow-lg shadow-red-100 hover:scale-105 transition-all"
                              >
                                <X size={10} /> Reject
                              </button>
                            </>
                          )}

                          {(!isDraft && !isSubmitted) && (
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusBadge(pr.status)}`}>
                              {pr.status}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Kolom Aksi Sesuai Modifikasi Anda */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {/* LINK KELOLA ITEM DENGAN QUERY PARAMS */}
                          <Link
                            href={`/purchasing/Purchase-Request-Item?id=${pr.id}`}
                            className="flex items-center gap-1.5 p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all dark:bg-blue-900/20"
                          >
                            <ListChecks size={16} />
                            <span className="text-[10px] font-black uppercase tracking-tighter mr-1">Items</span>
                          </Link>

                          <button
                            onClick={() => { setSelectedData(pr); setIsOpen(true); }}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-all bg-gray-50 rounded-xl dark:bg-gray-800"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal CRUD Header */}
      <PurchaseRequestModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={fetchPR}
        initialData={selectedData}
      />
    </div>
  );
}
