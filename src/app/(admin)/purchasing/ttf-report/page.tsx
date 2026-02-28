"use client";
import React, { useEffect, useState } from "react";
import { ttfReportService } from "@/services/reportService";
import { RefreshCw, FileText, Eye, X, Calendar, Loader2, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";

export default function TTFReportPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any[]>([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailData, setDetailData] = useState<any>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // Stats
    const [dueInvoices, setDueInvoices] = useState<any[]>([]);

    const loadData = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;
            if (filterStatus) params.status = filterStatus;
            const res = await ttfReportService.getAll(params);
            setData(Array.isArray(res) ? res : res?.data || []);

            // Load due invoices
            try {
                const dueRes = await ttfReportService.getDueInvoices();
                setDueInvoices(Array.isArray(dueRes) ? dueRes : dueRes?.data || []);
            } catch (e) { /* optional */ }
        } catch (error) {
            console.error(error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [startDate, endDate, filterStatus]);

    const viewDetail = async (item: any) => {
        setDetailOpen(true);
        setLoadingDetail(true);
        try {
            const res = await ttfReportService.getDetail(item.id);
            setDetailData(res?.data || res);
        } catch (e) { console.error(e); }
        finally { setLoadingDetail(false); }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            draft: "bg-gray-100 text-gray-500",
            submitted: "bg-blue-100 text-blue-600",
            approved: "bg-emerald-100 text-emerald-600",
            rejected: "bg-red-100 text-red-600",
        };
        return styles[status] || "bg-gray-100 text-gray-500";
    };

    return (
        <div className="p-4 md:p-6 space-y-6 bg-gray-50/20 min-h-screen">
            {/* Header */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 dark:bg-gray-900">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg">
                            <FileText className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black uppercase italic text-gray-800 dark:text-white tracking-tighter">
                                Laporan TTF
                            </h1>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Invoice Receipt Report</p>
                        </div>
                    </div>
                    <button onClick={loadData}
                        className="bg-violet-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase shadow-lg shadow-violet-100 hover:bg-violet-700 transition-all flex items-center gap-2">
                        <RefreshCw size={16} /> Refresh
                    </button>
                </div>
            </div>

            {/* Due Invoices Alert */}
            {dueInvoices.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                    <AlertTriangle className="text-amber-600 shrink-0" size={20} />
                    <p className="text-xs font-bold text-amber-700">
                        <span className="font-black">{dueInvoices.length}</span> faktur mendekati atau melewati jatuh tempo!
                    </p>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                    className="border-2 border-gray-100 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-violet-500 transition-all dark:bg-gray-800">
                    <option value="">Semua Status</option>
                    <option value="draft">Draft</option>
                    <option value="submitted">Submitted</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    className="border-2 border-gray-100 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-violet-500 transition-all dark:bg-gray-800" />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                    className="border-2 border-gray-100 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-violet-500 transition-all dark:bg-gray-800" />
                {(filterStatus || startDate || endDate) && (
                    <button onClick={() => { setFilterStatus(""); setStartDate(""); setEndDate(""); }}
                        className="text-xs font-black text-violet-500 hover:text-violet-700 uppercase">Reset</button>
                )}
            </div>

            {/* Table */}
            <div className="rounded-3xl border border-gray-100 bg-white shadow-sm dark:bg-gray-900 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                            <tr className="border-b border-gray-100">
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">No. TTF</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Supplier</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Jumlah Faktur</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Total Nilai</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {loading ? (
                                <tr><td colSpan={6} className="py-20 text-center">
                                    <Loader2 className="animate-spin mx-auto text-gray-300 mb-2" />
                                    <span className="text-[10px] font-bold uppercase text-gray-400">Loading...</span>
                                </td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan={6} className="py-20 text-center text-xs font-bold text-gray-300 uppercase tracking-widest">
                                    Tidak ada data
                                </td></tr>
                            ) : (
                                data.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-violet-600 uppercase italic tracking-tighter">
                                                {item.receipt_number || item.no_ttf}
                                            </span>
                                            <br /><span className="text-[9px] text-gray-400 font-bold">{item.transaction_date || item.tanggal}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-gray-700">{item.supplier_name || item.supplier?.nama || "—"}</span>
                                            <br /><span className="text-[9px] text-gray-400 font-bold">{item.po_number || item.purchase_order?.kode || ""}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 rounded-full text-xs font-black bg-violet-50 text-violet-600 border border-violet-200">
                                                {item.invoice_count || item.invoices?.length || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-violet-600">
                                            Rp {Number(item.total_amount || item.total_invoices || 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusBadge(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => viewDetail(item)}
                                                className="p-2.5 bg-gray-50 text-gray-400 hover:text-violet-600 rounded-xl transition-all">
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {detailOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-4xl bg-white rounded-3xl p-6 shadow-2xl dark:bg-gray-900 flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between border-b pb-4 mb-6">
                            <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase italic">
                                Detail TTF
                            </h3>
                            <button onClick={() => setDetailOpen(false)} className="text-gray-400 hover:text-red-500">✕</button>
                        </div>

                        {loadingDetail ? (
                            <div className="py-12 text-center">
                                <Loader2 className="animate-spin mx-auto text-gray-300 mb-2" />
                            </div>
                        ) : detailData ? (
                            <div className="flex-1 overflow-y-auto space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="p-4 rounded-2xl bg-violet-50 border border-violet-100">
                                        <p className="text-[9px] font-black text-gray-400 uppercase mb-1">No TTF</p>
                                        <p className="text-sm font-black text-violet-600">{detailData.receipt_number}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                        <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Tanggal</p>
                                        <p className="text-sm font-bold">{detailData.transaction_date}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                        <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Supplier</p>
                                        <p className="text-sm font-bold">{detailData.purchase_order?.supplier?.nama}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                        <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Status</p>
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${getStatusBadge(detailData.status)}`}>
                                            {detailData.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Invoices */}
                                <div className="rounded-2xl border border-gray-100 overflow-hidden">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-gray-50 dark:bg-gray-800">
                                            <tr className="text-[9px] font-black uppercase text-gray-400">
                                                <th className="p-4">No. Faktur</th>
                                                <th className="p-4">Tgl Faktur</th>
                                                <th className="p-4">Jatuh Tempo</th>
                                                <th className="p-4 text-right">Jumlah</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {(detailData.invoices || []).map((inv: any, idx: number) => (
                                                <tr key={idx}>
                                                    <td className="p-4 font-bold text-gray-700">{inv.invoice_number}</td>
                                                    <td className="p-4 text-gray-500">{inv.invoice_date}</td>
                                                    <td className="p-4 text-gray-500">{inv.due_date}</td>
                                                    <td className="p-4 text-right font-black text-violet-600">
                                                        Rp {Number(inv.amount || 0).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : null}

                        <div className="flex justify-end pt-4 border-t mt-4">
                            <button onClick={() => setDetailOpen(false)} className="px-6 py-2.5 text-xs font-black text-gray-400 uppercase">Tutup</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
