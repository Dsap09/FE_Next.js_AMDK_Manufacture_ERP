"use client";
import React, { useEffect, useState } from "react";
import { stockTransferService } from "@/services/stockTransferService";
import Button from "../ui/button/Button";
import StockTransferModal from "../modals/StockTransferModal";

export default function StockTransferTable() {
    const [transfers, setTransfers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await stockTransferService.getAll();
            setTransfers(Array.isArray(res) ? res : res.data || []);
        } catch (error) {
            console.error("Gagal load data transfer");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (payload: any) => {
        try {
            await stockTransferService.store(payload);
            setIsModalOpen(false);
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal membuat transfer.");
        }
    };

    const handleApprove = async (id: number) => {
        if (!confirm("Approve transfer ini?")) return;
        try {
            await stockTransferService.approve(id);
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal approve.");
        }
    };

    const handleReject = async (id: number) => {
        if (!confirm("Reject transfer ini?")) return;
        try {
            await stockTransferService.reject(id);
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal reject.");
        }
    };

    const handleExecute = async (id: number) => {
        if (!confirm("Eksekusi transfer ini? Stok akan dipindahkan.")) return;
        try {
            await stockTransferService.execute(id);
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal eksekusi transfer.");
        }
    };

    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            draft: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
            approved: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
            executed: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
            rejected: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${styles[status] || "bg-gray-100 text-gray-600"}`}>
                {status}
            </span>
        );
    };

    if (loading) return <div className="p-10 text-center">Memuat data transfer...</div>;

    return (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold">Transfer Gudang</h3>
                <Button onClick={() => setIsModalOpen(true)} size="sm">+ Buat Transfer</Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 dark:bg-white/5">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Kode</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Dari Gudang</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Ke Gudang</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Catatan</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {transfers.length > 0 ? (
                            transfers.map((t: any) => (
                                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-sm">
                                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs font-mono font-bold">{t.kode}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                        {t.dari_warehouse?.name || t.dari_warehouse_id}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                        {t.ke_warehouse?.name || t.ke_warehouse_id}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                        {t.transfer_date ? new Date(t.transfer_date).toLocaleDateString("id-ID") : "-"}
                                    </td>
                                    <td className="px-6 py-4 text-sm">{statusBadge(t.status)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 italic">{t.notes || "-"}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {t.status === "draft" && (
                                                <>
                                                    <button onClick={() => handleApprove(t.id)} className="text-blue-500 hover:text-blue-700 text-xs font-bold">Approve</button>
                                                    <button onClick={() => handleReject(t.id)} className="text-red-500 hover:text-red-700 text-xs font-bold">Reject</button>
                                                </>
                                            )}
                                            {t.status === "approved" && (
                                                <button onClick={() => handleExecute(t.id)} className="text-green-500 hover:text-green-700 text-xs font-bold">Eksekusi</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={7} className="p-10 text-center text-gray-400">Belum ada data transfer gudang.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <StockTransferModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
            />
        </div>
    );
}
