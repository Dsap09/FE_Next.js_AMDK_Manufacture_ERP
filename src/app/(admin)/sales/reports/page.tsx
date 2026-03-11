"use client";
import React, { useEffect, useState } from "react";
import { salesReportService } from "@/services/salesReportService";
import {
    RefreshCw,
    TrendingUp,
    Package,
    Users,
    FileText,
    Calendar,
    Download,
    ChevronRight,
    BarChart3,
    ArrowUpRight,
    TrendingDown,
    Clock,
    ArrowRight
} from "lucide-react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

type TabType = "summary" | "product" | "customer";

export default function SalesReportPage() {
    const [activeTab, setActiveTab] = useState<TabType>("summary");
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [paymentStatus, setPaymentStatus] = useState<string>("");

    // Data States
    const [resume, setResume] = useState<any>(null);
    const [productData, setProductData] = useState<any[]>([]);
    const [customerData, setCustomerData] = useState<any[]>([]);
    const [trendData, setTrendData] = useState<any[]>([]);

    const loadSummary = async () => {
        try {
            const res = await salesReportService.getResume({ start_date: startDate, end_date: endDate });
            setResume(res.data);

            const trendRes = await salesReportService.getMonthlyTrend({ year });
            setTrendData(trendRes.data);
        } catch (error) {
            console.error("Error loading summary:", error);
        }
    };

    const loadProductReport = async () => {
        try {
            const res = await salesReportService.getByProduct({ start_date: startDate, end_date: endDate });
            setProductData(res.data);
        } catch (error) {
            console.error("Error loading product report:", error);
        }
    };

    const loadCustomerReport = async () => {
        try {
            const res = await salesReportService.getByCustomer({
                start_date: startDate,
                end_date: endDate,
                payment_status: paymentStatus || undefined
            });
            setCustomerData(res.data);
        } catch (error) {
            console.error("Error loading customer report:", error);
        }
    };

    const refreshData = async () => {
        setLoading(true);
        if (activeTab === "summary") await loadSummary();
        else if (activeTab === "product") await loadProductReport();
        else if (activeTab === "customer") await loadCustomerReport();
        setLoading(false);
    };

    useEffect(() => {
        refreshData();
    }, [activeTab, startDate, endDate, year, paymentStatus]);

    const handleDownloadPdf = async (type: "product" | "customer" | "aging") => {
        try {
            let blob;
            let filename = "";
            if (type === "product") {
                blob = await salesReportService.downloadProductReportPdf({ start_date: startDate, end_date: endDate });
                filename = `laporan-penjualan-produk-${startDate}-${endDate}.pdf`;
            } else if (type === "customer") {
                blob = await salesReportService.downloadCustomerReportPdf({
                    start_date: startDate,
                    end_date: endDate,
                    payment_status: paymentStatus || undefined
                });
                filename = `laporan-penjualan-customer-${startDate}-${endDate}.pdf`;
            } else if (type === "aging") {
                blob = await salesReportService.downloadAgingReportPdf();
                filename = `laporan-aging-piutang-${new Date().toISOString().split('T')[0]}.pdf`;
            }

            if (blob) {
                // Periksa jika blob sebenarnya adalah JSON error (dari backend)
                if (blob.type === 'application/json') {
                    const text = await blob.text();
                    const errorData = JSON.parse(text);
                    throw new Error(errorData.message || "Gagal mengunduh PDF: Terjadi kesalahan pada server.");
                }

                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            }
        } catch (error: any) {
            console.error("Error downloading PDF:", error);
            const message = error.message || "Gagal mengunduh file PDF.";
            alert(message);
        }
    };

    // Chart Configuration
    const chartOptions: ApexOptions = {
        chart: {
            type: 'area',
            height: 350,
            zoom: { enabled: false },
            toolbar: { show: false },
            fontFamily: 'Outfit, sans-serif',
        },
        colors: ['#4F46E5'],
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3 },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.45,
                opacityTo: 0.05,
                stops: [20, 100, 100, 100]
            }
        },
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
        },
        yaxis: {
            labels: {
                formatter: (val) => `Rp ${val.toLocaleString()}`
            }
        },
        tooltip: {
            y: {
                formatter: (val) => `Rp ${val.toLocaleString()}`
            }
        },
        grid: {
            borderColor: '#f1f1f1',
        }
    };

    const chartSeries = [
        {
            name: 'Total Omzet',
            data: Array(12).fill(0).map((_, i) => {
                const monthData = trendData.find(d => d.bulan === i + 1);
                return monthData ? parseFloat(monthData.total_omzet) : 0;
            })
        }
    ];

    return (
        <div className="p-4 md:p-8 space-y-8 bg-gray-50/30 min-h-screen font-sans anonymous-content">
            {/* Header Section */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative group">
                <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-50/50 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-100/50 transition-colors duration-700"></div>

                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-5 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl shadow-xl shadow-indigo-100 border border-white/20">
                        <TrendingUp className="text-white" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter leading-none mb-1.5">
                            Laporan Penjualan
                        </h1>
                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <BarChart3 size={12} className="text-indigo-500" />
                            Insight & Analisa Performa Bisnis
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 relative z-10">
                    {/* Main Tabs */}
                    <div className="flex p-1.5 bg-gray-100/80 rounded-2xl border border-gray-200 backdrop-blur-sm">
                        {[
                            { id: 'summary', label: 'Ringkasan', icon: TrendingUp },
                            { id: 'product', label: 'Per Barang', icon: Package },
                            { id: 'customer', label: 'Per Konsumen', icon: Users },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${activeTab === tab.id
                                    ? 'bg-white text-indigo-600 shadow-md shadow-indigo-100/50 scale-[1.02]'
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200/50'
                                    }`}
                            >
                                <tab.icon size={14} className={activeTab === tab.id ? "text-indigo-500" : "opacity-40"} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={refreshData}
                        className="p-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95 group"
                    >
                        <RefreshCw size={20} className={`${loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
                    </button>
                </div>
            </div>

            {/* Control Panel (Filters & Actions) */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-3xl border border-gray-100 shadow-sm focus-within:ring-2 focus-within:ring-indigo-100 transition-all hover:border-indigo-100">
                        <Calendar className="text-indigo-500" size={18} />
                        <div className="h-5 w-px bg-gray-200"></div>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="text-xs font-bold font-mono outline-none bg-transparent text-gray-700 hover:cursor-pointer uppercase"
                        />
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-2">s/d</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="text-xs font-bold font-mono outline-none bg-transparent text-gray-700 hover:cursor-pointer uppercase"
                        />
                    </div>

                    {activeTab === 'summary' && (
                        <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-3xl border border-gray-100 shadow-sm">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">Tahun Grafik:</span>
                            <select
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="text-xs font-black text-gray-800 outline-none bg-transparent hover:cursor-pointer min-w-[100px]"
                            >
                                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    )}

                    {activeTab === 'customer' && (
                        <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-3xl border border-gray-100 shadow-sm transition-all hover:border-indigo-100">
                            <Users className="text-indigo-500" size={18} />
                            <div className="h-5 w-px bg-gray-200 mx-2"></div>
                            <select
                                value={paymentStatus}
                                onChange={(e) => setPaymentStatus(e.target.value)}
                                className="text-[10px] font-black text-gray-800 uppercase tracking-widest outline-none bg-transparent hover:cursor-pointer"
                            >
                                <option value="">Semua Status Bayar</option>
                                <option value="paid">Lunas (Paid)</option>
                                <option value="unpaid">Piutang (Unpaid)</option>
                            </select>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleDownloadPdf("aging")}
                        className="flex items-center gap-3 px-6 py-4 bg-rose-50 text-rose-600 rounded-3xl border border-rose-100 text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all active:scale-95 group"
                    >
                        <Clock size={16} className="group-hover:rotate-12 transition-transform" />
                        Download Aging PDF
                    </button>

                    {activeTab !== 'summary' && (
                        <button
                            onClick={() => handleDownloadPdf(activeTab as "product" | "customer")}
                            className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-3xl shadow-lg shadow-indigo-100 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 flex-1 md:flex-none group"
                        >
                            <Download size={16} className="group-hover:-translate-y-1 transition-transform" />
                            Download Report
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            {activeTab === 'summary' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Statistics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-100 transition-colors"></div>
                            <div className="relative z-10">
                                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl w-fit mb-6">
                                    <BarChart3 size={24} />
                                </div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Total Omzet Penjualan</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-sm font-bold text-gray-400">Rp</span>
                                    <h3 className="text-4xl font-black text-gray-900 tracking-tighter">
                                        {Number(resume?.total_omzet || 0).toLocaleString()}
                                    </h3>
                                </div>
                                <div className="mt-6 flex items-center gap-2 text-emerald-500 bg-emerald-50 w-fit px-3 py-1 rounded-lg">
                                    <ArrowUpRight size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-wide">Real-time Data</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-full -mr-16 -mt-16 group-hover:bg-violet-100 transition-colors"></div>
                            <div className="relative z-10">
                                <div className="p-4 bg-violet-50 text-violet-600 rounded-2xl w-fit mb-6">
                                    <FileText size={24} />
                                </div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Total Transaksi</p>
                                <h3 className="text-4xl font-black text-gray-900 tracking-tighter">
                                    {resume?.total_transaksi || 0}
                                    <span className="text-sm font-bold text-gray-400 ml-3 font-sans">Invoices</span>
                                </h3>
                                <div className="mt-6 flex items-center gap-2 text-violet-500 bg-violet-50 w-fit px-3 py-1 rounded-lg">
                                    <RefreshCw size={12} />
                                    <span className="text-[10px] font-black uppercase tracking-wide">Updated just now</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 group-hover:bg-amber-100 transition-colors"></div>
                            <div className="relative z-10">
                                <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl w-fit mb-6">
                                    <Users size={24} />
                                </div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Top Customer</p>
                                <h3 className="text-2xl font-black text-gray-800 tracking-tight line-clamp-1 mb-1">
                                    {resume?.top_customer?.name || "N/A"}
                                </h3>
                                <p className="text-sm font-bold text-amber-600">
                                    Kontribusi: Rp {Number(resume?.top_customer?.total || 0).toLocaleString()}
                                </p>
                                <div className="mt-5 pt-5 border-t border-gray-50 flex items-center justify-between">
                                    <span className="text-[9px] font-extrabold text-gray-300 uppercase tracking-widest">Customer Loyalty</span>
                                    <ChevronRight size={16} className="text-amber-300" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trend Chart */}
                    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h4 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-1">Grafik Tren Omzet</h4>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Performan Penjualan Bulanan Tahun {year}</p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest">Live Monitoring</span>
                            </div>
                        </div>

                        <div className="w-full h-[350px]">
                            <ReactApexChart
                                options={chartOptions}
                                series={chartSeries}
                                type="area"
                                height={350}
                            />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'product' && (
                <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-10 py-8 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Info Barang</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] text-center">Total Terjual</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] text-right">Perkiraan Omzet</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] text-center">Analisa</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr><td colSpan={4} className="py-40 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Memproses Laporan Barang...</p>
                                        </div>
                                    </td></tr>
                                ) : productData.length === 0 ? (
                                    <tr><td colSpan={4} className="py-40 text-center">
                                        <div className="flex flex-col items-center opacity-30">
                                            <Package size={64} className="text-gray-300 mb-6" />
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data penjualan barang tidak ditemukan</p>
                                        </div>
                                    </td></tr>
                                ) : (
                                    productData.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-indigo-50/30 transition-all duration-300 group">
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-5">
                                                    <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-white transition-colors">
                                                        <Package size={20} className="text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                                    </div>
                                                    <div>
                                                        <span className="font-black text-gray-800 text-sm block mb-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{item.product_name}</span>
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100/50 px-2 py-0.5 rounded border border-gray-100">{item.product_code}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-center">
                                                <div className="inline-flex flex-col items-center">
                                                    <span className="text-lg font-black text-gray-800">{Number(item.total_qty).toLocaleString()}</span>
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Quantity</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-right font-black text-gray-800 text-sm group-hover:text-indigo-600">
                                                <span className="text-[10px] text-gray-400 mr-2">Rp</span>
                                                {Number(item.total_omzet).toLocaleString()}
                                            </td>
                                            <td className="px-10 py-6 text-center">
                                                <div className="flex items-center justify-center gap-2 text-emerald-500">
                                                    <TrendingUp size={16} />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Top Selling</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'customer' && (
                <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-10 py-8 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Konsumen</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] text-center">Total Pesanan</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] text-right">Total Kontribusi</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] text-right">Saldo Piutang</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr><td colSpan={5} className="py-40 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Analisa Profil Konsumen...</p>
                                        </div>
                                    </td></tr>
                                ) : customerData.length === 0 ? (
                                    <tr><td colSpan={5} className="py-40 text-center">
                                        <div className="flex flex-col items-center opacity-30">
                                            <Users size={64} className="text-gray-300 mb-6" />
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data riwayat konsumen tidak ditemukan</p>
                                        </div>
                                    </td></tr>
                                ) : (
                                    customerData.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-indigo-50/30 transition-all duration-300 group">
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-5">
                                                    <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-white">
                                                        <Users size={20} className="text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                                    </div>
                                                    <div>
                                                        <span className="font-black text-gray-800 text-sm block mb-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{item.customer_name}</span>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                                            <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">Active Client</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-center">
                                                <span className="px-4 py-1.5 bg-gray-100 text-gray-600 text-[10px] font-black rounded-xl uppercase tracking-widest border border-gray-200 group-hover:bg-white group-hover:border-indigo-100 transition-all">
                                                    {item.total_orders} Pesanan
                                                </span>
                                            </td>
                                            <td className="px-10 py-6 text-right font-black text-gray-800 text-sm group-hover:text-indigo-600">
                                                <span className="text-[10px] text-gray-400 mr-2">Rp</span>
                                                {Number(item.total_kontribusi).toLocaleString()}
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                {Number(item.total_piutang) > 0 ? (
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-sm font-black text-rose-500 tracking-tight">
                                                            Rp {Number(item.total_piutang).toLocaleString()}
                                                        </span>
                                                        <span className="text-[9px] font-bold text-rose-400 uppercase tracking-widest">Outstanding</span>
                                                    </div>
                                                ) : (
                                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-lg uppercase tracking-widest border border-emerald-100 shadow-sm shadow-emerald-50">Lunas</span>
                                                )}
                                            </td>
                                            <td className="px-10 py-6 text-center">
                                                <button className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-2xl transition-all active:scale-95 border border-transparent hover:border-indigo-100">
                                                    <ArrowRight size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
