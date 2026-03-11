"use client";
import React, { useEffect, useState } from "react";
import { purchaseReturnReportService } from "@/services/reportService";
import { RefreshCw, RotateCcw, Eye, Loader2, Package, BarChart2, TrendingUp } from "lucide-react";

export default function ReturnReportPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any[]>([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailData, setDetailData] = useState<any>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // Stats
    const [topItems, setTopItems] = useState<any[]>([]);
    const [byReason, setByReason] = useState<any[]>([]);

    const loadData = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;
            if (filterStatus) params.status = filterStatus;
            const res = await purchaseReturnReportService.getAll(params);
            setData(Array.isArray(res) ? res : res?.data || []);

            // Load stats
            try {
                const topRes = await purchaseReturnReportService.getTopReturnedItems(params);
                setTopItems(Array.isArray(topRes) ? topRes : topRes?.data || []);
            } catch (e) { }
            try {
                const reasonRes = await purchaseReturnReportService.getByReason(params);
                setByReason(Array.isArray(reasonRes) ? reasonRes : reasonRes?.data || []);
            } catch (e) { }
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
            const res = await purchaseReturnReportService.getDetail(item.return_id || item.id);
            setDetailData(res?.data || res);
        } catch (e) { console.error(e); }
        finally { setLoadingDetail(false); }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            draft: "bg-gray-100 text-gray-500",
            pending: "bg-blue-100 text-blue-600",
            approved: "bg-emerald-100 text-emerald-600",
            rejected: "bg-red-100 text-red-600",
            realized: "bg-purple-100 text-purple-600",
            completed: "bg-green-100 text-green-600",
        };
        return styles[status] || "bg-gray-100 text-gray-500";
    };

    return (
        <div className="p-4 md:p-6 space-y-6 bg-gray-50/20 min-h-screen">
            {/* Header */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 dark:bg-gray-900">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl shadow-lg">
                            <RotateCcw className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black uppercase italic text-gray-800 dark:text-white tracking-tighter">
                                Laporan Retur Pembelian
                            </h1>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Purchase Return Report</p>
                        </div>
                    </div>
                    <button onClick={loadData}
                        className="bg-rose-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase shadow-lg shadow-rose-100 hover:bg-rose-700 transition-all flex items-center gap-2">
                        <RefreshCw size={16} /> Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Top Returned Items */}
                    {topItems.length > 0 && (
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm dark:bg-gray-900">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <TrendingUp size={14} className="text-rose-500" /> Top Item Diretur
                            </h3>
                            <div className="space-y-2">
                                {topItems.slice(0, 5).map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-gray-50">
                                        <span className="text-xs font-bold text-gray-700">{item.item_name || item.nama}</span>
                                        <span className="text-xs font-black text-rose-600">{item.total_qty || item.quantity} unit</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* By Reason */}
                    {byReason.length > 0 && (
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm dark:bg-gray-900">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <BarChart2 size={14} className="text-amber-500" /> Berdasarkan Alasan
                            </h3>
                            <div className="space-y-2">
                                {byReason.slice(0, 5).map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-gray-50">
                                        <span className="text-xs font-bold text-gray-700">{item.reason || item.alasan}</span>
                                        <span className="text-xs font-black text-amber-600">{item.total || item.count} retur</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                    className="border-2 border-gray-100 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-rose-500 transition-all dark:bg-gray-800">
                    <option value="">Semua Status</option>
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="realized">Realized</option>
                    <option value="completed">Completed</option>
                </select>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    className="border-2 border-gray-100 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-rose-500 transition-all dark:bg-gray-800" />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                    className="border-2 border-gray-100 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-rose-500 transition-all dark:bg-gray-800" />
                {(filterStatus || startDate || endDate) && (
                    <button onClick={() => { setFilterStatus(""); setStartDate(""); setEndDate(""); }}
                        className="text-xs font-black text-rose-500 hover:text-rose-700 uppercase">Reset</button>
                )}
            </div>

            {/* Table */}
            <div className="rounded-3xl border border-gray-100 bg-white shadow-sm dark:bg-gray-900 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                            <tr className="border-b border-gray-100">
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">No. Retur</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">PO / Supplier</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Alasan</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Item</th>
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
                                    Tidak ada data retur
                                </td></tr>
                            ) : (
                                data.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-rose-600 uppercase italic tracking-tighter">
                                                {item.return_number || item.no_retur}
                                            </span>
                                            <br /><span className="text-[9px] text-gray-400 font-bold">{item.return_date || item.tanggal}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-gray-700">{item.po_number || item.purchase_order?.kode || "—"}</span>
                                            <br /><span className="text-[9px] text-gray-400 font-bold">{item.supplier_name || item.purchase_order?.supplier?.nama || "—"}</span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-600 max-w-[200px] truncate">
                                            {item.reason || "—"}
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-gray-600">
                                            {item.items_count || item.items?.length || 0}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusBadge(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => viewDetail(item)}
                                                className="p-2.5 bg-gray-50 text-gray-400 hover:text-rose-600 rounded-xl transition-all">
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
                            <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase italic">Detail Retur</h3>
                            <button onClick={() => setDetailOpen(false)} className="text-gray-400 hover:text-red-500">✕</button>
                        </div>

                        {loadingDetail ? (
                            <div className="py-12 text-center"><Loader2 className="animate-spin mx-auto text-gray-300 mb-2" /></div>
                        ) : detailData ? (
                            <div className="flex-1 overflow-y-auto space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100">
                                        <p className="text-[9px] font-black text-gray-400 uppercase mb-1">No Retur</p>
                                        <p className="text-sm font-black text-rose-600">{detailData.return?.return_number || detailData.return?.no_retur}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                        <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Tanggal</p>
                                        <p className="text-sm font-bold">{detailData.return?.return_date || detailData.return?.tanggal}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                        <p className="text-[9px] font-black text-gray-400 uppercase mb-1">PO</p>
                                        <p className="text-sm font-bold">{detailData.return?.po_number || detailData.return?.purchase_order?.kode}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                        <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Status</p>
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${getStatusBadge(detailData.return?.status)}`}>
                                            {detailData.return?.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
                                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Alasan Retur</p>
                                    <p className="text-sm font-bold text-red-600">{detailData.return?.reason}</p>
                                </div>

                                <div className="rounded-2xl border border-gray-100 overflow-hidden">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-gray-50 dark:bg-gray-800">
                                            <tr className="text-[9px] font-black uppercase text-gray-400">
                                                <th className="p-4">Barang</th>
                                                <th className="p-4 text-center">Qty Return</th>
                                                <th className="p-4">Alasan</th>
                                                <th className="p-4">Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {(detailData.items || []).map((item: any, idx: number) => (
                                                <tr key={idx}>
                                                    <td className="p-4 font-bold text-gray-700">
                                                        {item.raw_material?.name || item.product?.name || item.item_name}
                                                    </td>
                                                    <td className="p-4 text-center font-black text-rose-600">{item.quantity_return} {item.unit?.name}</td>
                                                    <td className="p-4 text-gray-600">{item.reason || "—"}</td>
                                                    <td className="p-4 text-gray-500">{item.notes || "—"}</td>
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
