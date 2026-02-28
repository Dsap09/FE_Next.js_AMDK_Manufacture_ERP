"use client";
import React, { useEffect, useState } from "react";
import { initialBalanceService } from "@/services/initialBalanceService";
import Button from "../ui/button/Button";
import InitialBalanceModal from "../modals/InitialBalanceModal";

export default function InitialBalanceTable() {
    const [years, setYears] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedYear, setExpandedYear] = useState<number | null>(null);
    const [yearDetail, setYearDetail] = useState<any>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => { fetchYears(); }, []);

    const fetchYears = async () => {
        try {
            setLoading(true);
            const res = await initialBalanceService.getYears();
            setYears(Array.isArray(res) ? res : res.data || []);
        } catch (error) {
            console.error("Gagal load data saldo awal");
        } finally {
            setLoading(false);
        }
    };

    const handleExpand = async (year: number) => {
        if (expandedYear === year) {
            setExpandedYear(null);
            setYearDetail(null);
            return;
        }
        try {
            setDetailLoading(true);
            setExpandedYear(year);
            const res = await initialBalanceService.getByYear(year);
            setYearDetail(res);
        } catch (error) {
            console.error("Gagal load detail");
        } finally {
            setDetailLoading(false);
        }
    };

    const handleSave = async (formData: any) => {
        try {
            await initialBalanceService.store(formData);
            setIsModalOpen(false);
            fetchYears();
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal menyimpan saldo awal.");
        }
    };

    const handleApprove = async (year: number) => {
        if (!confirm(`Approve saldo awal tahun ${year}? Pastikan Debit = Credit.`)) return;
        try {
            await initialBalanceService.approve(year);
            fetchYears();
            if (expandedYear === year) handleExpand(year);
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal approve.");
        }
    };

    const handleDelete = async (year: number) => {
        if (!confirm(`Hapus saldo awal draft tahun ${year}?`)) return;
        try {
            await initialBalanceService.destroy(year);
            fetchYears();
            if (expandedYear === year) {
                setExpandedYear(null);
                setYearDetail(null);
            }
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal menghapus.");
        }
    };

    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            draft: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
            approved: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${styles[status] || "bg-gray-100 text-gray-600"}`}>
                {status}
            </span>
        );
    };

    if (loading) return <div className="p-10 text-center">Memuat data saldo awal...</div>;

    return (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold">Saldo Awal (Initial Balance)</h3>
                <Button onClick={() => setIsModalOpen(true)} size="sm">+ Tambah Saldo Awal</Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 dark:bg-white/5">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Tahun</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {years.length > 0 ? (
                            years.map((y: any) => (
                                <React.Fragment key={y.year}>
                                    <tr className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={() => handleExpand(y.year)}>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                                            <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded text-xs">{y.year}</span>
                                            <span className="ml-2 text-gray-400 text-xs">{expandedYear === y.year ? "▲" : "▼"}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">{statusBadge(y.status)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                                                {y.status === "draft" && (
                                                    <>
                                                        <button onClick={() => handleApprove(y.year)} className="text-green-500 hover:text-green-700 text-sm font-bold">Approve</button>
                                                        <button onClick={() => handleDelete(y.year)} className="text-red-500 hover:text-red-700 text-sm font-bold">Hapus</button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Expanded detail row */}
                                    {expandedYear === y.year && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-4 bg-gray-50/50 dark:bg-white/5">
                                                {detailLoading ? (
                                                    <div className="text-center text-gray-400 py-4">Memuat detail...</div>
                                                ) : yearDetail ? (
                                                    <div className="space-y-3">
                                                        <table className="w-full text-sm">
                                                            <thead>
                                                                <tr className="text-xs text-gray-400 uppercase">
                                                                    <th className="text-left py-2">Kode Akun</th>
                                                                    <th className="text-left py-2">Nama Akun</th>
                                                                    <th className="text-right py-2">Debit</th>
                                                                    <th className="text-right py-2">Credit</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                                {yearDetail.balances?.map((b: any) => (
                                                                    <tr key={b.id}>
                                                                        <td className="py-2 font-mono text-xs">{b.account?.code || "-"}</td>
                                                                        <td className="py-2">{b.account?.name || "-"}</td>
                                                                        <td className="py-2 text-right font-mono">{Number(b.debit).toLocaleString("id-ID")}</td>
                                                                        <td className="py-2 text-right font-mono">{Number(b.credit).toLocaleString("id-ID")}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                            <tfoot className="border-t-2 border-gray-200 dark:border-gray-700 font-bold">
                                                                <tr>
                                                                    <td colSpan={2} className="py-2 text-right text-xs uppercase text-gray-500">Total</td>
                                                                    <td className="py-2 text-right font-mono">{Number(yearDetail.total_debit).toLocaleString("id-ID")}</td>
                                                                    <td className="py-2 text-right font-mono">{Number(yearDetail.total_credit).toLocaleString("id-ID")}</td>
                                                                </tr>
                                                            </tfoot>
                                                        </table>
                                                    </div>
                                                ) : null}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <tr><td colSpan={3} className="p-10 text-center text-gray-400">Belum ada data saldo awal.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <InitialBalanceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
            />
        </div>
    );
}
