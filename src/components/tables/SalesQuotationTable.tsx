"use client";
import React, { useEffect, useState } from "react";
import { salesQuotationService } from "@/services/salesQuotationService";
import Button from "../ui/button/Button";
import SalesQuotationModal from "../modals/SalesQuotationModal";
import { Edit, Trash, CheckCircle } from "lucide-react";

export default function SalesQuotationTable() {
    const [quotations, setQuotations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedQuotation, setSelectedQuotation] = useState<any | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await salesQuotationService.getAll();
            setQuotations(Array.isArray(res.data) ? res.data : res.data?.data || []);
        } catch (error) {
            console.error("Gagal memuat data penawaran:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async (payload: any) => {
        try {
            if (selectedQuotation) {
                await salesQuotationService.update(selectedQuotation.id, payload);
            } else {
                await salesQuotationService.store(payload);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal menyimpan data.");
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Apakah Anda yakin ingin menghapus penawaran ini?")) {
            try {
                await salesQuotationService.delete(id);
                fetchData();
            } catch (error: any) {
                alert(error.response?.data?.message || "Gagal menghapus data.");
            }
        }
    };

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            await salesQuotationService.updateStatus(id, status);
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal mengubah status.");
        }
    };

    const handleConvertToSpk = async (id: number) => {
        if (confirm("Konversi penawaran ini menjadi SPK?")) {
            try {
                await salesQuotationService.convertToSpk(id);
                fetchData();
            } catch (error: any) {
                alert(error.response?.data?.message || "Gagal konversi ke SPK.");
            }
        }
    }

    const openCreateModal = () => {
        setSelectedQuotation(null);
        setIsModalOpen(true);
    };

    const openEditModal = (quotation: any) => {
        setSelectedQuotation(quotation);
        setIsModalOpen(true);
    };

    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
            sent: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
            approved: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
            rejected: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${styles[status] || "bg-gray-100 text-gray-600"}`}>
                {status}
            </span>
        );
    };

    if (loading) return <div className="p-10 text-center">Memuat data penawaran...</div>;

    return (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold">Data Penawaran Penjualan (SQ)</h3>
                <Button onClick={openCreateModal} size="sm">+ Buat Penawaran</Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 dark:bg-white/5">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">No. SQ</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Total</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {quotations.length > 0 ? (
                            quotations.map((q: any) => (
                                <tr key={q.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-sm font-mono font-medium">{q.no_quotation}</td>
                                    <td className="px-6 py-4 text-sm font-semibold">{q.customer?.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{q.tanggal}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-green-600">
                                        Rp {Number(q.total_price).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 text-sm">{statusBadge(q.status)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 items-center">
                                            {q.status === 'draft' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(q.id, 'sent')}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-sm"
                                                >
                                                    Kirim
                                                </button>
                                            )}
                                            {q.status === 'sent' && (
                                                <>
                                                    <button
                                                        onClick={() => handleUpdateStatus(q.id, 'approved')}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-sm"
                                                    >
                                                        Setuju
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(q.id, 'rejected')}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-sm"
                                                    >
                                                        Tolak
                                                    </button>
                                                </>
                                            )}
                                            {q.status === 'approved' && !q.salesOrder && (
                                                <button
                                                    onClick={() => handleConvertToSpk(q.id)}
                                                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-violet-500/20"
                                                >
                                                    <CheckCircle className="w-3.5 h-3.5" /> Jadi SPK
                                                </button>
                                            )}

                                            {q.status !== 'approved' && (
                                                <>
                                                    <button onClick={() => openEditModal(q)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit HEADER">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(q.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={6} className="p-10 text-center text-gray-400">Belum ada data penawaran.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <SalesQuotationModal
                isOpen={isModalOpen}
                initialData={selectedQuotation}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
            />
        </div>
    );
}
