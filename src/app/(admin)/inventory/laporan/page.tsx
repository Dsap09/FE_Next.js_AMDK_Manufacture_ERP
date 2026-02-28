"use client";
import React, { useEffect, useState } from "react";
import { inventoryReportService } from "@/services/inventoryReportService";
import { Package, TrendingUp, TrendingDown, Calendar, RefreshCw, Search, ChevronDown, ChevronRight, FileText } from "lucide-react";

export default function LaporanPersediaanPage() {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"masuk" | "keluar">("masuk");
    const [data, setData] = useState<any>({});
    const [meta, setMeta] = useState<any>({});
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        return d.toISOString().split("T")[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

    const loadData = async () => {
        setLoading(true);
        try {
            const params = { start_date: startDate, end_date: endDate, search: search || undefined };
            const res = activeTab === "masuk"
                ? await inventoryReportService.getIncomingReport(params)
                : await inventoryReportService.getOutgoingReport(params);
            setData(res?.data || {});
            setMeta(res?.meta || {});
            // Auto-expand all dates
            const dates = Object.keys(res?.data || {});
            const expanded: Record<string, boolean> = {};
            dates.forEach((d) => (expanded[d] = true));
            setExpandedDates(expanded);
        } catch (error) {
            console.error("Failed to load laporan:", error);
            setData({});
            setMeta({});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [activeTab, startDate, endDate]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadData();
    };

    const toggleDate = (date: string) => {
        setExpandedDates((prev) => ({ ...prev, [date]: !prev[date] }));
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    const dateKeys = Object.keys(data).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    return (
        <div className="p-4 md:p-6 space-y-6 bg-gray-50/20 min-h-screen">
            {/* Header */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 dark:bg-gray-900">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                            <FileText className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black uppercase italic text-gray-800 dark:text-white tracking-tighter">
                                Laporan Persediaan
                            </h1>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                Detail Barang Masuk & Keluar
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={loadData}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Tab + Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab("masuk")}
                        className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === "masuk"
                                ? "bg-green-600 text-white shadow-lg shadow-green-100"
                                : "bg-white text-gray-400 border-2 border-gray-100 hover:border-green-200"
                            }`}
                    >
                        <TrendingUp size={14} />
                        Barang Masuk
                    </button>
                    <button
                        onClick={() => setActiveTab("keluar")}
                        className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === "keluar"
                                ? "bg-red-600 text-white shadow-lg shadow-red-100"
                                : "bg-white text-gray-400 border-2 border-gray-100 hover:border-red-200"
                            }`}
                    >
                        <TrendingDown size={14} />
                        Barang Keluar
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 dark:bg-gray-900">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Dari Tanggal</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full p-3 rounded-xl border-2 border-gray-100 text-sm font-bold focus:border-indigo-500 outline-none transition-all dark:bg-gray-800"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Sampai Tanggal</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full p-3 rounded-xl border-2 border-gray-100 text-sm font-bold focus:border-indigo-500 outline-none transition-all dark:bg-gray-800"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Cari</label>
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Cari nama atau kode barang..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="flex-1 p-3 rounded-xl border-2 border-gray-100 text-sm font-bold focus:border-indigo-500 outline-none transition-all dark:bg-gray-800"
                            />
                            <button type="submit" className="bg-indigo-600 text-white px-5 py-3 rounded-xl text-xs font-black uppercase">
                                <Search size={16} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Grand Total */}
            {!loading && meta.grand_total_qty !== undefined && (
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm dark:bg-gray-900 flex items-center justify-between">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                        Grand Total Qty ({activeTab === "masuk" ? "Barang Masuk" : "Barang Keluar"})
                    </p>
                    <p className={`text-2xl font-black ${activeTab === "masuk" ? "text-green-600" : "text-red-600"}`}>
                        {Number(meta.grand_total_qty || 0).toLocaleString()}
                    </p>
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <RefreshCw className="animate-spin mx-auto mb-4 text-indigo-600" size={40} />
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading...</p>
                    </div>
                </div>
            ) : dateKeys.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-20 text-center dark:bg-gray-900">
                    <Package className="mx-auto mb-4 text-gray-300" size={48} />
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Tidak ada data</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {dateKeys.map((dateKey) => {
                        const categories = data[dateKey];
                        const isExpanded = expandedDates[dateKey];

                        return (
                            <div key={dateKey} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-900">
                                {/* Date Header */}
                                <button
                                    onClick={() => toggleDate(dateKey)}
                                    className="w-full flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        {isExpanded ? (
                                            <ChevronDown size={18} className="text-indigo-600" />
                                        ) : (
                                            <ChevronRight size={18} className="text-gray-400" />
                                        )}
                                        <Calendar size={16} className="text-indigo-600" />
                                        <span className="text-sm font-black text-gray-800 dark:text-white uppercase">
                                            {formatDate(dateKey)}
                                        </span>
                                    </div>
                                </button>

                                {/* Items */}
                                {isExpanded && (
                                    <div className="border-t border-gray-100">
                                        {Object.entries(categories).map(([category, group]: [string, any]) => (
                                            <div key={category} className="border-b border-gray-50 last:border-0">
                                                <div className="px-5 py-3 bg-gray-50/50 flex items-center justify-between">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${category === "Product"
                                                                ? "bg-purple-100 text-purple-700 border border-purple-200"
                                                                : "bg-amber-100 text-amber-700 border border-amber-200"
                                                            }`}
                                                    >
                                                        {category === "Product" ? "Produk" : "Bahan Baku"}
                                                    </span>
                                                    <span className="text-xs font-black text-gray-400">
                                                        Sub Total: <span className={activeTab === "masuk" ? "text-green-600" : "text-red-600"}>
                                                            {Number(group.sub_total_qty || 0).toLocaleString()}
                                                        </span>
                                                    </span>
                                                </div>
                                                <table className="w-full text-left text-sm">
                                                    <thead className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                                        <tr>
                                                            <th className="px-5 py-3">No Dokumen</th>
                                                            <th className="px-5 py-3">Kode</th>
                                                            <th className="px-5 py-3">Nama Barang</th>
                                                            {activeTab === "keluar" && <th className="px-5 py-3">Pengambil</th>}
                                                            <th className="px-5 py-3 text-right">Qty</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        {(group.items || []).map((item: any, idx: number) => (
                                                            <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                                                                <td className="px-5 py-3 text-xs font-bold text-gray-500">{item.no_dokumen || "-"}</td>
                                                                <td className="px-5 py-3 text-xs font-black text-indigo-600 uppercase">{item.kode_barang}</td>
                                                                <td className="px-5 py-3 font-bold text-gray-800 dark:text-gray-200">{item.nama_barang}</td>
                                                                {activeTab === "keluar" && (
                                                                    <td className="px-5 py-3 text-xs font-bold text-gray-500">{item.nama_pengambil || "-"}</td>
                                                                )}
                                                                <td className="px-5 py-3 text-right">
                                                                    <span className={`font-black ${activeTab === "masuk" ? "text-green-600" : "text-red-600"}`}>
                                                                        {Number(item.qty || 0).toLocaleString()}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
