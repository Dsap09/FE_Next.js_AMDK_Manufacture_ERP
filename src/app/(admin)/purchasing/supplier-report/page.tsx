"use client";
import React, { useEffect, useState } from "react";
import { supplierReportService, ttfReportService } from "@/services/reportService";
import { RefreshCw, Users, TrendingUp, Package, Eye, X, Calendar, Loader2, FileText, AlertTriangle, Clock, PackageOpen, Receipt } from "lucide-react";

export default function SupplierReportPage() {
    const [loading, setLoading] = useState(true);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
    const [detailData, setDetailData] = useState<any>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // New State for Tab and Invoices
    const [activeTab, setActiveTab] = useState<'summary' | 'invoices'>('summary');
    const [dueInvoices, setDueInvoices] = useState<any[]>([]);
    const [loadingInvoices, setLoadingInvoices] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;
            const res = await supplierReportService.getAll(params);
            setSuppliers(Array.isArray(res) ? res : res?.data || []);
        } catch (error) {
            console.error(error);
            setSuppliers([]);
        } finally {
            setLoading(false);
        }
    };

    const loadDueInvoices = async () => {
        setLoadingInvoices(true);
        try {
            // Fetch due invoices (default 30 days ahead or all if needed, here we just fetch)
            const res = await ttfReportService.getDueInvoices({ status: 'approved' }); // Filter confirmed receipts if needed
            setDueInvoices(res.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingInvoices(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'summary') {
            loadData();
        } else {
            loadDueInvoices();
        }
    }, [startDate, endDate, activeTab]);

    const viewDetail = async (supplier: any) => {
        setSelectedSupplier(supplier);
        setDetailOpen(true);
        setLoadingDetail(true);
        try {
            const params: any = {};
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;
            const res = await supplierReportService.getDetail(supplier.supplier_id || supplier.id, params);
            setDetailData(res?.data || res);
        } catch (e) { console.error(e); }
        finally { setLoadingDetail(false); }
    };

    const getUrgencyColor = (level: string) => {
        switch (level) {
            case 'overdue': return 'bg-red-50 text-red-600 border-red-200';
            case 'urgent': return 'bg-orange-50 text-orange-600 border-orange-200';
            case 'soon': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
            default: return 'bg-emerald-50 text-emerald-600 border-emerald-200';
        }
    };

    const getUrgencyLabel = (level: string) => {
        switch (level) {
            case 'overdue': return 'Jatuh Tempo';
            case 'urgent': return '< 7 Hari';
            case 'soon': return '< 14 Hari';
            default: return 'Aman';
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6 bg-gray-50/30 min-h-screen font-sans">
            {/* Header */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 dark:bg-gray-900">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-100">
                            <Users className="text-white" size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black uppercase text-gray-800 dark:text-white tracking-tight leading-none mb-1">
                                Laporan Supplier
                            </h1>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Analisa Pembelian & Tagihan</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex p-1 bg-gray-100/80 rounded-xl border border-gray-100">
                            <button onClick={() => setActiveTab('summary')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-black uppercase transition-all duration-300 ${activeTab === 'summary'
                                    ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-gray-100'
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200/50'
                                    }`}>
                                <Users size={14} className={activeTab === 'summary' ? "text-indigo-500" : "opacity-50"} />
                                Ringkasan
                            </button>
                            <button onClick={() => setActiveTab('invoices')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-black uppercase transition-all duration-300 ${activeTab === 'invoices'
                                    ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-gray-100'
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200/50'
                                    }`}>
                                <Receipt size={14} className={activeTab === 'invoices' ? "text-indigo-500" : "opacity-50"} />
                                Tagihan (Invoices)
                            </button>
                        </div>
                        <button onClick={activeTab === 'summary' ? loadData : loadDueInvoices}
                            className="bg-gray-900 text-white p-3 rounded-xl hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95">
                            <RefreshCw size={18} className={loading || loadingInvoices ? "animate-spin" : ""} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters (Only for Summary Tab currently, or shared if needed) */}
            {activeTab === 'summary' && (
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm dark:bg-gray-900 transition-all hover:border-indigo-100 focus-within:ring-2 focus-within:ring-indigo-100">
                        <Calendar className="text-indigo-400" size={18} />
                        <div className="h-4 w-px bg-gray-200"></div>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                            className="text-xs font-bold outline-none dark:bg-gray-900 text-gray-600 uppercase bg-transparent hover:cursor-pointer" />
                        <span className="text-gray-300 font-light">to</span>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                            className="text-xs font-bold outline-none dark:bg-gray-900 text-gray-600 uppercase bg-transparent hover:cursor-pointer" />
                    </div>
                    {(startDate || endDate) && (
                        <button onClick={() => { setStartDate(""); setEndDate(""); }}
                            className="text-[10px] font-black text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-4 py-2.5 rounded-xl uppercase transition-all border border-rose-100 flex items-center gap-2">
                            <X size={14} /> Clear Filter
                        </button>
                    )}
                </div>
            )}

            {/* Content Swich */}
            {activeTab === 'summary' ? (
                <div className="space-y-8">
                    {/* Summary Table */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 dark:bg-gray-900 overflow-hidden relative">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/40">
                                        <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-widest leading-relaxed">Supplier Info</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center leading-relaxed">Total Order</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center leading-relaxed">Total Qty</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right leading-relaxed">Total Nilai</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center leading-relaxed">Detail</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                    {loading ? (
                                        <tr><td colSpan={5} className="py-32 text-center">
                                            <div className="flex flex-col items-center justify-center animate-pulse">
                                                <div className="h-12 w-12 bg-gray-100 rounded-full mb-4"></div>
                                                <div className="h-4 w-32 bg-gray-100 rounded mb-2"></div>
                                                <div className="h-3 w-24 bg-gray-50 rounded"></div>
                                            </div>
                                        </td></tr>
                                    ) : suppliers.length === 0 ? (
                                        <tr><td colSpan={5} className="py-32 text-center">
                                            <div className="flex flex-col items-center justify-center opacity-40">
                                                <PackageOpen size={48} className="text-gray-300 mb-4" />
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tidak ada data transaksi</p>
                                            </div>
                                        </td></tr>
                                    ) : (
                                        suppliers.map((s, idx) => (
                                            <tr key={idx} className="hover:bg-indigo-50/30 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <span className="font-bold text-gray-800 dark:text-gray-200 text-sm block mb-1 group-hover:text-indigo-600 transition-colors">{s.supplier_name || s.nama}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-0.5 bg-gray-100 rounded text-[9px] font-bold text-gray-500 uppercase tracking-wide">{s.supplier_code || "SUP"}</span>
                                                        <span className="text-[10px] text-gray-400 font-medium">{s.supplier_phone || "-"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <span className="px-3 py-1 rounded-full text-[10px] font-black bg-gray-100 text-gray-600 border border-gray-200 group-hover:bg-white group-hover:border-indigo-100 group-hover:text-indigo-600 group-hover:shadow-sm transition-all">
                                                            {s.total_po} Order
                                                        </span>
                                                        {/* Status Breakdown Mini */}
                                                        <div className="flex gap-1.5 text-[9px] items-center opacity-60 group-hover:opacity-100 transition-opacity">
                                                            {s.po_draft > 0 && <span title="Draft" className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>}
                                                            {s.po_sent > 0 && <span title="Sent" className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>}
                                                            {s.po_received > 0 && <span title="Received" className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                                                            {s.po_closed > 0 && <span title="Closed" className="w-1.5 h-1.5 rounded-full bg-red-400"></span>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-center font-bold text-gray-600">
                                                    {Number(s.total_quantity || 0).toLocaleString()} <span className="text-[9px] font-normal text-gray-400 ml-1">Items</span>
                                                </td>
                                                <td className="px-8 py-5 text-right font-black text-gray-800 text-sm group-hover:text-indigo-600 transition-colors">
                                                    <span className="text-[10px] text-gray-400 font-bold mr-1">Rp</span>
                                                    {Number(s.total_pembelian || 0).toLocaleString()}
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <button onClick={() => viewDetail(s)}
                                                        className="p-2.5 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-95" title="Lihat Detail">
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

                    {/* Accumulated PO Status Table */}
                    {!loading && suppliers.length > 0 && (
                        <div className="mt-8 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden max-w-2xl">
                            <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100">
                                <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest">Akumulasi Status Purchase Order</h3>
                            </div>
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-50 bg-gray-50/20">
                                        <th className="px-6 py-4 text-[9px] font-black uppercase text-gray-400 tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase text-gray-400 tracking-widest text-center">Total PO</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    <tr className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-3 flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Draft</span>
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <span className="text-sm font-black text-gray-800">
                                                {suppliers.reduce((acc, s) => acc + (Number(s.po_draft) || 0), 0)}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-3 flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-blue-400 shadow-sm shadow-blue-100"></div>
                                            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Sent (Dikirim)</span>
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <span className="text-sm font-black text-gray-800">
                                                {suppliers.reduce((acc, s) => acc + (Number(s.po_sent) || 0), 0)}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-3 flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-100"></div>
                                            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Received (Diterima)</span>
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <span className="text-sm font-black text-gray-800">
                                                {suppliers.reduce((acc, s) => acc + (Number(s.po_received) || 0), 0)}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-3 flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-red-400 shadow-sm shadow-red-100"></div>
                                            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Closed (Ditutup)</span>
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <span className="text-sm font-black text-gray-800">
                                                {suppliers.reduce((acc, s) => acc + (Number(s.po_closed) || 0), 0)}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
                /* Invoices Table */
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 dark:bg-gray-900 overflow-hidden relative">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/40">
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-widest leading-relaxed">Invoice Details</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-widest leading-relaxed">Supplier</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center leading-relaxed">Jatuh Tempo</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right leading-relaxed">Nilai Tagihan</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center leading-relaxed">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {loadingInvoices ? (
                                    <tr><td colSpan={5} className="py-32 text-center">
                                        <div className="flex flex-col items-center justify-center animate-pulse">
                                            <div className="h-12 w-12 bg-gray-100 rounded-full mb-4"></div>
                                            <div className="h-4 w-32 bg-gray-100 rounded mb-2"></div>
                                        </div>
                                    </td></tr>
                                ) : dueInvoices.length === 0 ? (
                                    <tr><td colSpan={5} className="py-32 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-40">
                                            <Receipt size={48} className="text-gray-300 mb-4" />
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tidak ada tagihan aktif</p>
                                        </div>
                                    </td></tr>
                                ) : (
                                    dueInvoices.map((inv, idx) => (
                                        <tr key={idx} className="hover:bg-indigo-50/30 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-start gap-4">
                                                    <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg">
                                                        <FileText size={18} />
                                                    </div>
                                                    <div>
                                                        <span className="font-black text-gray-800 dark:text-gray-200 text-sm block group-hover:text-indigo-600 transition-colors">{inv.invoice_number}</span>
                                                        <div className="flex items-center gap-2 mt-1.5">
                                                            <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-bold uppercase tracking-wide border border-gray-200">{inv.po_number}</span>
                                                            <span className="text-[9px] px-1.5 py-0.5 bg-indigo-50 text-indigo-500 rounded font-bold uppercase tracking-wide border border-indigo-100">{inv.receipt_number}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="font-bold text-gray-700 dark:text-gray-300 text-xs block mb-1">{inv.supplier_name}</span>
                                                <span className="text-[9px] text-gray-400 block font-medium tracking-wide">{inv.supplier_phone || "-"}</span>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xs font-bold text-gray-600 mb-2">{inv.due_date}</span>
                                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${getUrgencyColor(inv.urgency_level)}`}>
                                                        {inv.urgency_level === 'overdue' && <AlertTriangle size={10} />}
                                                        {inv.urgency_level === 'urgent' && <Clock size={10} />}
                                                        <span className="text-[9px] font-black uppercase tracking-wide">
                                                            {inv.days_remaining} Hari
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <span className="font-black text-gray-800 text-sm block">
                                                    <span className="text-[10px] text-gray-400 font-bold mr-1">Rp</span>
                                                    {Number(inv.amount || 0).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wide border transition-all ${inv.receipt_status === 'approved'
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm'
                                                    : 'bg-gray-50 text-gray-500 border-gray-100'
                                                    }`}>
                                                    {inv.receipt_status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Detail Modal (Only relevant for Summary Tab) */}
            {detailOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm transition-all">
                    <div className="w-full max-w-5xl bg-white rounded-[2rem] p-8 shadow-2xl dark:bg-gray-900 flex flex-col max-h-[90vh] border border-white/20">
                        <div className="flex items-center justify-between pb-6 mb-6 border-b border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gray-50 rounded-2xl">
                                    <Package size={24} className="text-indigo-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">
                                        {selectedSupplier?.supplier_name || selectedSupplier?.nama}
                                    </h3>
                                    <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">Detail Riwayat & Analisa</p>
                                </div>
                            </div>
                            <button onClick={() => setDetailOpen(false)}
                                className="group p-2 bg-gray-50 rounded-xl text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all">
                                <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>

                        {loadingDetail ? (
                            <div className="py-32 text-center flex flex-col items-center justify-center h-full">
                                <Loader2 className="animate-spin text-indigo-500 mb-4" size={32} />
                                <span className="text-xs font-bold uppercase text-gray-400 tracking-widest">Mengambil data transaksi...</span>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                    <div className="p-6 rounded-3xl bg-indigo-50/50 border border-indigo-100 relative overflow-hidden group hover:shadow-lg hover:shadow-indigo-100/50 transition-all duration-300">
                                        <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-500">
                                            <Package size={64} />
                                        </div>
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Total PO</p>
                                        <p className="text-3xl font-black text-indigo-600 tracking-tight">{detailData?.summary?.total_po || 0}</p>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-emerald-50/50 border border-emerald-100 relative overflow-hidden group hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300">
                                        <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-500">
                                            <TrendingUp size={64} />
                                        </div>
                                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Item Jenis</p>
                                        <p className="text-3xl font-black text-emerald-600 tracking-tight">{detailData?.summary?.total_items || 0}</p>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-violet-50/50 border border-violet-100 relative overflow-hidden group hover:shadow-lg hover:shadow-violet-100/50 transition-all duration-300">
                                        <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-500">
                                            <Package size={64} />
                                        </div>
                                        <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-2">Total Qty</p>
                                        <p className="text-3xl font-black text-violet-600 tracking-tight">{Number(detailData?.summary?.total_qty || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-orange-50/50 border border-orange-100 relative overflow-hidden group hover:shadow-lg hover:shadow-orange-100/50 transition-all duration-300">
                                        <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-500">
                                            <TrendingUp size={64} />
                                        </div>
                                        <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">Total Nilai</p>
                                        <p className="text-3xl font-black text-orange-600 tracking-tight truncate">
                                            <span className="text-base align-top opactiy-50 mr-1">Rp</span>
                                            {Number(detailData?.summary?.total_amount || 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* PO Status Breakdown */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                    <div className="flex items-center gap-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Draft</p>
                                            <p className="text-lg font-black text-gray-700">{detailData?.summary?.po_draft || 0}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                        <div className="w-2 h-2 rounded-full bg-blue-400 shadow-sm shadow-blue-100"></div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dikirim</p>
                                            <p className="text-lg font-black text-gray-700">{detailData?.summary?.po_sent || 0}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-100"></div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Diterima</p>
                                            <p className="text-lg font-black text-gray-700">{detailData?.summary?.po_received || 0}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                        <div className="w-2 h-2 rounded-full bg-red-400 shadow-sm shadow-red-100"></div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ditutup</p>
                                            <p className="text-lg font-black text-gray-700">{detailData?.summary?.po_closed || 0}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* PO List */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-8 w-1 bg-indigo-500 rounded-full"></div>
                                        <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest">
                                            Riwayat Pesanan
                                        </h4>
                                    </div>

                                    {(!detailData?.data || detailData?.data.length === 0) ? (
                                        <div className="py-16 text-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                                            <PackageOpen size={32} className="mx-auto text-gray-300 mb-3" />
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Belum ada riwayat pesanan</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-5">
                                            {detailData.data.map((po: any, idx: number) => (
                                                <div key={idx} className="bg-white border boundary-gray-100 rounded-3xl p-6 hover:shadow-lg hover:shadow-gray-100 transition-all group duration-300">
                                                    <div className="flex justify-between items-start mb-6 border-b border-gray-50 pb-4">
                                                        <div>
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <span className="font-black text-lg text-indigo-600">{po.po_number || po.kode || "-"}</span>
                                                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${po.po_status === 'received' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                    po.po_status === 'draft' ? 'bg-gray-50 text-gray-500 border-gray-100' :
                                                                        'bg-blue-50 text-blue-600 border-blue-100'
                                                                    }`}>
                                                                    {po.po_status}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-gray-400">
                                                                <Calendar size={12} />
                                                                <p className="text-[10px] font-bold uppercase tracking-wide">{po.order_date || po.created_at?.slice(0, 10)}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Nilai</p>
                                                            <p className="text-xl font-black text-gray-800">Rp {Number(po.total_amount || 0).toLocaleString()}</p>
                                                        </div>
                                                    </div>

                                                    {/* Items Preview */}
                                                    <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-50">
                                                        <table className="w-full text-left">
                                                            <thead>
                                                                <tr className="text-[9px] font-black text-gray-400 uppercase text-left border-b border-gray-100">
                                                                    <th className="pb-3 pl-2 tracking-wider">Item Details</th>
                                                                    <th className="pb-3 text-center tracking-wider">Qty</th>
                                                                    <th className="pb-3 text-right pr-2 tracking-wider">Subtotal</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-100">
                                                                {po.items.map((item: any, i: number) => (
                                                                    <tr key={i} className="group/item hover:bg-white transition-colors">
                                                                        <td className="py-3 pl-2">
                                                                            <p className="text-xs font-bold text-gray-700 group-hover/item:text-indigo-600 transition-colors">{item.item_name}</p>
                                                                            <p className="text-[9px] text-gray-400 font-medium tracking-wide">{item.item_code}</p>
                                                                        </td>
                                                                        <td className="py-3 text-center text-xs font-bold text-gray-500">
                                                                            {item.quantity} <span className="text-[9px] font-normal text-gray-400 ml-0.5">{item.unit_name}</span>
                                                                        </td>
                                                                        <td className="py-3 text-right text-xs font-bold text-gray-700 pr-2">
                                                                            Rp {Number(item.subtotal || 0).toLocaleString()}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="pt-6 border-t border-gray-100 mt-2 flex justify-end">
                            <button onClick={() => setDetailOpen(false)} className="px-8 py-3 text-xs font-black text-gray-500 bg-gray-50 hover:bg-gray-100 hover:text-gray-800 rounded-xl uppercase transition-all tracking-wide">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
