"use client";
import React, { useEffect, useState } from "react";
import { inventoryReportService } from "@/services/inventoryReportService";
import { Package, Search, RefreshCw, Calendar, BarChart3, Layers } from "lucide-react";

export default function KartuPersediaanPage() {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"product" | "rawMaterial">("product");
    const [data, setData] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        return d.toISOString().split("T")[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);

    const loadData = async () => {
        setLoading(true);
        try {
            const params = { start_date: startDate, end_date: endDate, search: search || undefined };
            const res = activeTab === "product"
                ? await inventoryReportService.getProducts(params)
                : await inventoryReportService.getRawMaterials(params);
            const items = res?.data || res || [];
            setData(Array.isArray(items) ? items : []);
        } catch (error) {
            console.error("Failed to load kartu persediaan:", error);
            setData([]);
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

    const totals = data.reduce(
        (acc, row) => ({
            stok_awal: acc.stok_awal + (row.stok_awal || 0),
            stok_masuk: acc.stok_masuk + (row.stok_masuk || 0),
            stok_keluar: acc.stok_keluar + (row.stok_keluar || 0),
            stok_akhir: acc.stok_akhir + (row.stok_akhir || 0),
        }),
        { stok_awal: 0, stok_masuk: 0, stok_keluar: 0, stok_akhir: 0 }
    );

    return (
        <div className="p-4 md:p-6 space-y-6 bg-gray-50/20 min-h-screen">
            {/* Header */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 dark:bg-gray-900">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
                            <BarChart3 className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black uppercase italic text-gray-800 dark:text-white tracking-tighter">
                                Kartu Persediaan
                            </h1>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                Rekap Stok Masuk, Keluar & Saldo
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={loadData}
                        className="bg-emerald-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center gap-2"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Tab Selector */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab("product")}
                    className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === "product"
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100"
                            : "bg-white text-gray-400 border-2 border-gray-100 hover:border-emerald-200"
                        }`}
                >
                    <Package size={14} className="inline mr-2" />
                    Produk Jadi
                </button>
                <button
                    onClick={() => setActiveTab("rawMaterial")}
                    className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === "rawMaterial"
                            ? "bg-amber-600 text-white shadow-lg shadow-amber-100"
                            : "bg-white text-gray-400 border-2 border-gray-100 hover:border-amber-200"
                        }`}
                >
                    <Layers size={14} className="inline mr-2" />
                    Bahan Baku
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 dark:bg-gray-900">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Dari Tanggal</label>
                        <div className="relative">
                            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full pl-9 p-3 rounded-xl border-2 border-gray-100 text-sm font-bold focus:border-emerald-500 outline-none transition-all dark:bg-gray-800"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Sampai Tanggal</label>
                        <div className="relative">
                            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full pl-9 p-3 rounded-xl border-2 border-gray-100 text-sm font-bold focus:border-emerald-500 outline-none transition-all dark:bg-gray-800"
                            />
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Cari</label>
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari nama atau kode..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 p-3 rounded-xl border-2 border-gray-100 text-sm font-bold focus:border-emerald-500 outline-none transition-all dark:bg-gray-800"
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-emerald-600 text-white px-5 py-3 rounded-xl text-xs font-black uppercase hover:bg-emerald-700 transition-all"
                            >
                                Cari
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            {!loading && data.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm dark:bg-gray-900">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Stok Awal</p>
                        <p className="text-2xl font-black text-gray-800 dark:text-white">{totals.stok_awal.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm dark:bg-gray-900">
                        <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1">Total Masuk</p>
                        <p className="text-2xl font-black text-green-600">{totals.stok_masuk.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm dark:bg-gray-900">
                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Total Keluar</p>
                        <p className="text-2xl font-black text-red-600">{totals.stok_keluar.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm dark:bg-gray-900">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Total Stok Akhir</p>
                        <p className="text-2xl font-black text-blue-600">{totals.stok_akhir.toLocaleString()}</p>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-900">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-xs font-black uppercase text-gray-400 border-b dark:bg-gray-800 tracking-widest">
                            <tr>
                                <th className="p-5">Kode</th>
                                <th className="p-5">Nama</th>
                                <th className="p-5 text-center">Kategori</th>
                                <th className="p-5 text-center">Satuan</th>
                                <th className="p-5 text-right">Stok Awal</th>
                                <th className="p-5 text-right">Masuk</th>
                                <th className="p-5 text-right">Keluar</th>
                                {activeTab === "product" && <th className="p-5 text-right">Adjustment</th>}
                                <th className="p-5 text-right">Stok Akhir</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={activeTab === "product" ? 9 : 8} className="p-12 text-center">
                                        <RefreshCw className="animate-spin mx-auto mb-4 text-emerald-600" size={40} />
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading...</p>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={activeTab === "product" ? 9 : 8} className="p-12 text-center">
                                        <Package className="mx-auto mb-4 text-gray-300" size={48} />
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Tidak ada data</p>
                                    </td>
                                </tr>
                            ) : (
                                data.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                                        <td className="p-5">
                                            <span className="text-xs font-black text-emerald-600 uppercase">
                                                {activeTab === "product" ? row.kode : row.kode_produk}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <span className="font-bold text-gray-800 dark:text-gray-200">
                                                {activeTab === "product" ? row.nama : row.nama_produk}
                                            </span>
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
                                                {row.kategori || "-"}
                                            </span>
                                        </td>
                                        <td className="p-5 text-center text-xs font-bold text-gray-500">{row.satuan || "-"}</td>
                                        <td className="p-5 text-right font-bold text-gray-600">{(row.stok_awal || 0).toLocaleString()}</td>
                                        <td className="p-5 text-right font-black text-green-600">+{(row.stok_masuk || 0).toLocaleString()}</td>
                                        <td className="p-5 text-right font-black text-red-600">-{(row.stok_keluar || 0).toLocaleString()}</td>
                                        {activeTab === "product" && (
                                            <td className="p-5 text-right font-bold text-purple-600">
                                                {(row.stock_adj || row.stock_adjustment || 0).toLocaleString()}
                                            </td>
                                        )}
                                        <td className="p-5 text-right">
                                            <span className="font-black text-blue-600 text-base">{(row.stok_akhir || 0).toLocaleString()}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                {!loading && data.length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-100 p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                Total {activeTab === "product" ? "Produk" : "Bahan Baku"}
                            </p>
                            <p className="text-sm font-black text-emerald-600">{data.length} Item</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
