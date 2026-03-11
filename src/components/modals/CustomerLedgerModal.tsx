"use client";
import React, { useEffect, useState } from "react";
import { salesInvoiceService } from "@/services/salesInvoiceService";
import * as Icons from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    customer: any;
}

export default function CustomerLedgerModal({ isOpen, onClose, customer }: Props) {
    const [ledgerData, setLedgerData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({
        start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
    });

    const fetchLedger = async () => {
        if (!customer) return;
        try {
            setLoading(true);
            const res = await salesInvoiceService.getLedgerReport({
                customer_id: customer.id,
                ...dateRange
            });
            setLedgerData(res);
        } catch (error) {
            console.error("Gagal memuat Ledger:", error);
            alert("Gagal memuat laporan buku pembantu piutang.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && customer) {
            fetchLedger();
        }
    }, [isOpen, customer]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-900 flex flex-col border border-white/20">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-emerald-600/5 to-transparent">
                    <div>
                        <h3 className="text-xl font-black text-gray-800 dark:text-white flex items-center gap-2">
                            <Icons.BookOpen className="w-6 h-6 text-emerald-600" />
                            Buku Pembantu Piutang (Ledger)
                        </h3>
                        <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-widest">Konsumen: {customer?.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400">
                        <Icons.X className="w-5 h-5" />
                    </button>
                </div>

                {/* Filters */}
                <div className="p-6 bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-end gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Mulai Tanggal</label>
                        <input
                            type="date"
                            className="block w-full rounded-lg border-gray-200 text-xs font-bold dark:bg-gray-800 dark:border-gray-700"
                            value={dateRange.start_date}
                            onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Sampai Tanggal</label>
                        <input
                            type="date"
                            className="block w-full rounded-lg border-gray-200 text-xs font-bold dark:bg-gray-800 dark:border-gray-700"
                            value={dateRange.end_date}
                            onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                        />
                    </div>
                    <button
                        onClick={fetchLedger}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                    >
                        <Icons.Search className="w-3.5 h-3.5" /> Filter
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                            <Icons.Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                            <p className="mt-4 text-sm font-bold text-gray-500 uppercase tracking-widest">Menyusun Data Ledger...</p>
                        </div>
                    ) : ledgerData ? (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">Total Tagihan</p>
                                    <p className="text-lg font-black text-blue-700 dark:text-blue-400 mt-1">
                                        Rp {Number(ledgerData.summary.total_invoiced).toLocaleString('id-ID')}
                                    </p>
                                </div>
                                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">Total Terbayar</p>
                                    <p className="text-lg font-black text-emerald-700 dark:text-emerald-400 mt-1">
                                        Rp {Number(ledgerData.summary.total_paid_to_date).toLocaleString('id-ID')}
                                    </p>
                                </div>
                                <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 text-orange-600">
                                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-tighter">Sisa Piutang</p>
                                    <p className="text-lg font-black mt-1">
                                        Rp {Number(ledgerData.summary.total_outstanding).toLocaleString('id-ID')}
                                    </p>
                                </div>
                                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
                                    <p className="text-[10px] font-black text-purple-500 uppercase tracking-tighter">Pinjaman Galon</p>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <p className="text-lg font-black text-purple-700 dark:text-purple-400">{ledgerData.summary.gallon_summary.still_at_customer}</p>
                                        <p className="text-[10px] text-purple-600 font-bold uppercase">Galon</p>
                                    </div>
                                </div>
                            </div>

                            {/* Ledger Table */}
                            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-white/5">
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase">Tanggal</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase">Keterangan / Deskripsi</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase">Referensi</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase text-right">Debit (Penjualan)</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase text-right">Kredit (Bayar)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {ledgerData.ledger_history.map((entry: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-400">
                                                    {new Date(entry.date).toLocaleDateString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4 text-xs font-bold text-gray-800 dark:text-white">{entry.description}</td>
                                                <td className="px-6 py-4 text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded w-fit uppercase font-mono tracking-tighter">
                                                    {entry.reference}
                                                </td>
                                                <td className={`px-6 py-4 text-xs text-right font-black ${entry.type === 'DEBIT' ? 'text-rose-600' : 'text-gray-300'}`}>
                                                    {entry.type === 'DEBIT' ? `Rp ${Number(entry.amount).toLocaleString('id-ID')}` : '-'}
                                                </td>
                                                <td className={`px-6 py-4 text-xs text-right font-black ${entry.type === 'CREDIT' ? 'text-emerald-600' : 'text-gray-300'}`}>
                                                    {entry.type === 'CREDIT' ? `Rp ${Number(entry.amount).toLocaleString('id-ID')}` : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="p-20 text-center text-gray-400 font-bold italic uppercase tracking-widest bg-gray-50 dark:bg-white/5 rounded-3xl">
                            Pilih Periode Tanggal untuk melihat data.
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-gray-800 text-white px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-black shadow-xl shadow-gray-900/20 transition-all active:scale-95"
                    >
                        Tutup Laporan
                    </button>
                </div>
            </div>
        </div>
    );
}
