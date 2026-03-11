"use client";
import React, { useEffect, useState } from "react";
import { salesReturnService } from "@/services/salesReturnService";
import Button from "../ui/button/Button";
import SalesReturnModal from "../modals/SalesReturnModal";
import { Trash, FileText } from "lucide-react";

export default function SalesReturnTable() {
    const [returns, setReturns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await salesReturnService.getAll();
            const dataArray = res.data?.data || res.data || [];
            setReturns(Array.isArray(dataArray) ? dataArray : []);
        } catch (error) {
            console.error("Gagal memuat data Retur Penjualan:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async (payload: any) => {
        try {
            await salesReturnService.store(payload);
            setIsModalOpen(false);
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal menyimpan data Retur.");
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Menghapus retur akan mengembalikan stok & tagihan invoice asli. Lanjutkan?")) {
            try {
                await salesReturnService.delete(id);
                fetchData();
            } catch (error: any) {
                alert(error.response?.data?.message || "Gagal menghapus data.");
            }
        }
    };

    const handlePrintPdf = async (id: number, returnNo: string) => {
        try {
            const blob = await salesReturnService.printPdf(id);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${returnNo}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (error) {
            console.error("Failed to print PDF", error);
            alert("Gagal mengunduh PDF");
        }
    }

    const openCreateModal = () => {
        setIsModalOpen(true);
    };

    if (loading) return <div className="p-10 text-center">Memuat data Retur Penjualan...</div>;

    return (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold">Retur Penjualan</h3>
                <Button onClick={openCreateModal} size="sm">+ Buat Retur Baru</Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 dark:bg-white/5">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">No. Retur</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Input By</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Ref. Invoice & Customer</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Tgl Retur</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Total Retur (Rp)</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {returns.length > 0 ? (
                            returns.map((ret: any) => (
                                <tr key={ret.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-sm font-mono font-medium">{ret.return_no}</td>
                                    <td className="px-6 py-4 text-sm font-semibold">{ret.creator?.name || 'Unknown'}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-blue-600">
                                        {ret.invoice?.no_invoice || ret.invoice?.invoice_number || "-"} <br />
                                        <span className="text-gray-500 text-xs">{ret.invoice?.customer?.name}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                        {new Date(ret.return_date).toLocaleDateString("id-ID")}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-red-600">
                                        Rp {Number(ret.total_return_amount).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 items-center">
                                            <button onClick={() => handlePrintPdf(ret.id, ret.return_no)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Cetak PDF">
                                                <FileText className="w-4 h-4" />
                                            </button>

                                            {/* Retur tidak bisa diedit setelah dibuat berdasar kontroler */}
                                            <button onClick={() => handleDelete(ret.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus Bukti Retur">
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={6} className="p-10 text-center text-gray-400">Belum ada data Retur Penjualan.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <SalesReturnModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
            />
        </div>
    );
}
