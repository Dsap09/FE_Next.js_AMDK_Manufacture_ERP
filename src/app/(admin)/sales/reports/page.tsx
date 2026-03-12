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

type TabType = "summary" | "product" | "customer" | "aging" | "returns" | "invoice-status";

export default function SalesReportPage() {
    const [activeTab, setActiveTab] = useState<TabType>("summary");
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [paymentStatus, setPaymentStatus] = useState<string>("");
    const [invoiceStatus, setInvoiceStatus] = useState<string>("");

    // Data States
    const [resume, setResume] = useState<any>(null);
    const [productData, setProductData] = useState<any[]>([]);
    const [customerData, setCustomerData] = useState<any[]>([]);
    const [trendData, setTrendData] = useState<any[]>([]);
    const [agingData, setAgingData] = useState<any[]>([]);
    const [returnsData, setReturnsData] = useState<any[]>([]);
    const [invoiceStatusData, setInvoiceStatusData] = useState<any[]>([]);

    const loadSummary = async () => {
        try {
            const res = await salesReportService.getResume({ start_date: startDate, end_date: endDate });
            // Cek jika response adalah wrapper (ada property data) atau data langsung
            const resumeData = res?.data || res;
            
            // Calculate missing fields if possible or default to 0
            setResume({
                ...resumeData,
                total_return: resumeData.total_return || 0,
                omzet_bersih: resumeData.omzet_bersih || (parseFloat(resumeData.total_omzet || 0) - parseFloat(resumeData.total_return || 0)),
                total_piutang: resumeData.total_piutang || 0,
                top_product: resumeData.top_product || { name: "N/A", total_qty: 0 }
            });

            const trendRes = await salesReportService.getMonthlyTrend({
                year,
                start_date: startDate,
                end_date: endDate
            });
            setTrendData(trendRes?.data || trendRes || []);
        } catch (error) {
            console.error("Error loading summary:", error);
            setResume(null);
            setTrendData([]);
        }
    };

    const loadProductReport = async () => {
        try {
            const res = await salesReportService.getByProduct({ start_date: startDate, end_date: endDate });
            setProductData(res?.data || res || []);
        } catch (error) {
            console.error("Error loading product report:", error);
            setProductData([]);
        }
    };

    const loadCustomerReport = async () => {
        try {
            const res = await salesReportService.getByCustomer({
                start_date: startDate,
                end_date: endDate,
                payment_status: paymentStatus || undefined
            });
            setCustomerData(res?.data || res || []);
        } catch (error) {
            console.error("Error loading customer report:", error);
            setCustomerData([]);
        }
    };

    const loadAgingReport = async () => {
        try {
            const res = await salesReportService.getAging({ start_date: startDate, end_date: endDate });
            let rawData = res?.data || res || [];
            
            // If backend returns flat list with status_aging, map it to columns
            // Or if backend returns one row per invoice, group by customer
            const mapped = Array.isArray(rawData) ? rawData.map((item: any) => {
                const days = parseInt(item.days_overdue || "0");
                const balance = parseFloat(item.balance_due || "0");
                
                return {
                    ...item,
                    customer_name: item.customer_name || item.customer?.name || "N/A",
                    current: days <= 0 ? balance : 0,
                    aging_1_30: (days > 0 && days <= 30) ? balance : 0,
                    aging_31_60: (days > 30 && days <= 60) ? balance : 0,
                    aging_61_90: (days > 60 && days <= 90) ? balance : 0,
                    aging_over_90: days > 90 ? balance : 0,
                    total_piutang: balance
                };
            }) : [];

            // Group by customer for the table
            const grouped = mapped.reduce((acc: any[], curr: any) => {
                const existing = acc.find(a => a.customer_name === curr.customer_name);
                if (existing) {
                    existing.current += curr.current;
                    existing.aging_1_30 += curr.aging_1_30;
                    existing.aging_31_60 += curr.aging_31_60;
                    existing.aging_61_90 += curr.aging_61_90;
                    existing.aging_over_90 += curr.aging_over_90;
                    existing.total_piutang += curr.total_piutang;
                } else {
                    acc.push({...curr});
                }
                return acc;
            }, []);

            setAgingData(grouped);
        } catch (error) {
            console.error("Error loading aging report:", error);
            setAgingData([]);
        }
    };

    const loadReturnsReport = async () => {
        try {
            const res = await salesReportService.getReturns({ start_date: startDate, end_date: endDate });
            const data = res?.data || res || [];
            // Map backend structure to frontend table
            const mapped = Array.isArray(data) ? data.map((item: any) => ({
                return_number: item.return_number || item.return_no || "N/A",
                return_date: item.return_date || "N/A",
                invoice_number: item.invoice_number || item.invoice?.no_invoice || "N/A",
                customer_name: item.customer_name || item.invoice?.customer?.name || item.customer?.name || "N/A",
                total_amount: item.total_amount || item.total_return_amount || 0
            })) : [];
            setReturnsData(mapped);
        } catch (error) {
            console.error("Error loading returns report:", error);
            setReturnsData([]);
        }
    };

    const loadInvoiceStatusReport = async () => {
        try {
            const res = await salesReportService.getInvoiceStatus({
                start_date: startDate,
                end_date: endDate,
                status: invoiceStatus || undefined
            });
            const data = res?.data?.data || res?.data || res || [];
            // Map backend structure to frontend table
            const mapped = Array.isArray(data) ? data.map((item: any) => ({
                invoice_number: item.invoice_number || item.no_invoice || "N/A",
                invoice_date: item.invoice_date || item.tanggal || "N/A",
                customer_name: item.customer_name || item.customer?.name || "N/A",
                status: item.status || "N/A",
                total_amount: item.total_amount || item.final_amount || item.total_price || 0
            })) : [];
            setInvoiceStatusData(mapped);
        } catch (error) {
            console.error("Error loading invoice status report:", error);
            setInvoiceStatusData([]);
        }
    };

    const refreshData = async () => {
        setLoading(true);
        try {
            if (activeTab === "summary") await loadSummary();
            else if (activeTab === "product") await loadProductReport();
            else if (activeTab === "customer") await loadCustomerReport();
            else if (activeTab === "aging") await loadAgingReport();
            else if (activeTab === "returns") await loadReturnsReport();
            else if (activeTab === "invoice-status") await loadInvoiceStatusReport();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, [activeTab, startDate, endDate, year, paymentStatus, invoiceStatus]);

    const handleDownloadPdf = async (type: TabType) => {
        try {
            let blob;
            let filename = "";
            const params = { start_date: startDate, end_date: endDate };

            if (type === "product") {
                blob = await salesReportService.downloadProductReportPdf(params);
                filename = `laporan-produk-${startDate}-${endDate}.pdf`;
            } else if (type === "customer") {
                blob = await salesReportService.downloadCustomerReportPdf({ ...params, payment_status: paymentStatus || undefined });
                filename = `laporan-customer-${startDate}-${endDate}.pdf`;
            } else if (type === "aging") {
                blob = await salesReportService.downloadAgingReportPdf(params);
                filename = `laporan-aging-${endDate}.pdf`;
            } else if (type === "returns") {
                blob = await salesReportService.downloadReturnsReportPdf(params);
                filename = `laporan-retur-${startDate}-${endDate}.pdf`;
            }

            if (blob) {
                if (blob.type === 'application/json') {
                    const error = JSON.parse(await blob.text());
                    throw new Error(error.message || "Gagal unduh PDF");
                }
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = filename;
                document.body.appendChild(a); a.click(); a.remove();
                window.URL.revokeObjectURL(url);
            }
        } catch (error: any) { alert(error.message || "Gagal unduh PDF"); }
    };

    // Chart Options
    const chartOptions: ApexOptions = {
        chart: { type: 'area', height: 350, toolbar: { show: false }, fontFamily: 'Outfit' },
        colors: ['#4F46E5'], stroke: { curve: 'smooth', width: 3 },
        fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.05 } },
        xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'] },
        yaxis: { labels: { formatter: (v) => `Rp ${v.toLocaleString()}` } },
        tooltip: { y: { formatter: (v) => `Rp ${v.toLocaleString()}` } }
    };

    const chartSeries = [{
        name: 'Omzet',
        data: Array(12).fill(0).map((_, i) => {
            const d = trendData.find(m => m.bulan === i + 1);
            return d ? parseFloat(d.total_omzet) : 0;
        })
    }];

    return (
        <div className="p-4 md:p-8 space-y-8 bg-gray-50/30 min-h-screen font-sans">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-50/50 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-5 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-100"><TrendingUp className="text-white" size={32} /></div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase mb-1">Laporan Penjualan</h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <BarChart3 size={12} className="text-indigo-500" /> Analisa & Insight Performa
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 relative z-10">
                    <div className="flex p-1.5 bg-gray-100 rounded-2xl">
                        {[
                            { id: 'summary', icon: TrendingUp, label: 'Ringkasan' },
                            { id: 'product', icon: Package, label: 'Barang' },
                            { id: 'customer', icon: Users, label: 'Konsumen' },
                            { id: 'aging', icon: Clock, label: 'Aging' },
                            { id: 'returns', icon: RefreshCw, label: 'Retur' },
                            { id: 'invoice-status', icon: FileText, label: 'Status' }
                        ].map((t) => (
                            <button key={t.id} onClick={() => setActiveTab(t.id as TabType)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${activeTab === t.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                                <t.icon size={12} /> {t.label}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={refreshData}
                        className="p-3.5 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95 group"
                        title="Refresh Data"
                    >
                        <RefreshCw size={18} className={`${loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-6 pb-2">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-3xl border border-gray-100 shadow-sm">
                        <Calendar className="text-indigo-500" size={18} />
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="text-xs font-bold outline-none bg-transparent" />
                        <span className="text-[10px] font-black text-gray-300 uppercase">s/d</span>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="text-xs font-bold outline-none bg-transparent" />
                    </div>
                    {activeTab === 'summary' && (
                        <select value={year} onChange={(e) => setYear(e.target.value)} className="bg-white px-6 py-4 rounded-3xl border border-gray-100 text-xs font-black uppercase">
                            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    )}
                    {activeTab === 'customer' && (
                        <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="bg-white px-6 py-4 rounded-3xl border border-gray-100 text-[10px] font-black uppercase">
                            <option value="">Status Bayar</option>
                            <option value="paid">PAID (LUNAS)</option>
                            <option value="unpaid">UNPAID (PIUTANG)</option>
                        </select>
                    )}
                    {activeTab === 'invoice-status' && (
                        <select value={invoiceStatus} onChange={(e) => setInvoiceStatus(e.target.value)} className="bg-white px-6 py-4 rounded-3xl border border-gray-100 text-[10px] font-black uppercase">
                            <option value="">Semua Status</option>
                            <option value="draft">Draft</option>
                            <option value="partial">Parsial</option>
                            <option value="paid">Lunas</option>
                            <option value="cancelled">Batal</option>
                        </select>
                    )}
                </div>
                {activeTab !== 'invoice-status' && (
                    <button onClick={() => handleDownloadPdf(activeTab)} className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] shadow-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all">
                        <Download size={16} /> Download {activeTab === 'aging' ? 'Aging' : activeTab === 'returns' ? 'Retur' : 'Laporan'} PDF
                    </button>
                )}
            </div>

            {activeTab === 'summary' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute right-0 bottom-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><TrendingUp size={80} /></div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Total Omzet</p>
                            <h3 className="text-3xl font-black text-gray-900 tracking-tighter">Rp {Number(resume?.total_omzet || 0).toLocaleString()}</h3>
                            <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase">
                                <ArrowUpRight size={14} /> Gross Revenue
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute right-0 bottom-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><RefreshCw size={80} /></div>
                            <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] mb-4">Total Retur</p>
                            <h3 className="text-3xl font-black text-rose-500 tracking-tighter">Rp {Number(resume?.total_return || 0).toLocaleString()}</h3>
                            <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-rose-400 uppercase">
                                <TrendingDown size={14} /> Saldo Berkurang
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute right-0 bottom-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><BarChart3 size={80} className="text-indigo-200" /></div>
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">Omzet Bersih</p>
                            <h3 className="text-3xl font-black text-indigo-600 tracking-tighter">Rp {Number(resume?.omzet_bersih || 0).toLocaleString()}</h3>
                            <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase">
                                <TrendingUp size={14} /> Net Earnings
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute right-0 bottom-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><Clock size={80} /></div>
                            <p className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em] mb-4">Total Piutang</p>
                            <h3 className="text-3xl font-black text-orange-500 tracking-tighter">Rp {Number(resume?.total_piutang || 0).toLocaleString()}</h3>
                            <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-orange-400 uppercase">
                                <Clock size={14} /> Outstanding
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <h4 className="text-xl font-black text-gray-900 uppercase tracking-tight">Tren Omzet Bulanan</h4>
                                <div className="px-4 py-2 bg-gray-50 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest">{year} Analytics</div>
                            </div>
                            <ReactApexChart options={chartOptions} series={chartSeries} type="area" height={350} />
                        </div>

                        <div className="space-y-6">
                            <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl shadow-indigo-100 text-white relative overflow-hidden group">
                                <div className="absolute right-0 top-0 p-4 opacity-20 -mr-4 -mt-4"><Users size={120} /></div>
                                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-4">Top Customer</p>
                                <h3 className="text-2xl font-black tracking-tight mb-2 truncate relative z-10">{resume?.top_customer?.name || "N/A"}</h3>
                                <p className="text-xs font-bold text-indigo-100">{resume?.top_customer?.total_amount ? `Rp ${Number(resume.top_customer.total_amount).toLocaleString()}` : "Belum ada transaksi"}</p>
                            </div>

                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute right-0 top-0 p-4 opacity-5"><Package size={100} /></div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Top Product</p>
                                <h3 className="text-2xl font-black text-gray-800 tracking-tight mb-2 truncate">{resume?.top_product?.name || "N/A"}</h3>
                                <p className="text-xs font-bold text-gray-400">{resume?.top_product?.total_qty ? `${Number(resume.top_product.total_qty).toLocaleString()} Terjual` : "Belum ada data"}</p>
                            </div>

                            <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-xl text-white">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Total Transaksi</p>
                                <div className="flex items-end justify-between">
                                    <h3 className="text-5xl font-black tracking-tighter">{resume?.total_transaksi || 0}</h3>
                                    <span className="text-[10px] font-black text-gray-500 uppercase mb-2">Invoices</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {(activeTab === 'product' || activeTab === 'customer' || activeTab === 'aging' || activeTab === 'returns' || activeTab === 'invoice-status') && (
                <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    {(activeTab === 'product' || activeTab === 'customer' || activeTab === 'aging') && (
                                        <>
                                            <th className="px-10 py-8 text-[10px] font-black uppercase text-gray-400">{activeTab === 'product' ? 'Info Barang' : 'Konsumen'}</th>
                                            {activeTab === 'product' && <th className="px-10 py-8 text-[10px] font-black uppercase text-gray-400 text-center">Terjual</th>}
                                            {activeTab === 'customer' && <th className="px-10 py-8 text-[10px] font-black uppercase text-gray-400 text-center">Orders</th>}
                                            {activeTab === 'aging' && (
                                                <>
                                                    <th className="px-6 py-8 text-[10px] font-black uppercase text-gray-400 text-right">Current</th>
                                                    <th className="px-6 py-8 text-[10px] font-black uppercase text-gray-400 text-right">1-30</th>
                                                    <th className="px-6 py-8 text-[10px] font-black uppercase text-gray-400 text-right">31-60</th>
                                                    <th className="px-6 py-8 text-[10px] font-black uppercase text-gray-400 text-right">61-90</th>
                                                    <th className="px-6 py-8 text-[10px] font-black uppercase text-gray-400 text-right">&gt;90</th>
                                                </>
                                            )}
                                            <th className="px-10 py-8 text-[10px] font-black uppercase text-gray-400 text-right">{activeTab === 'product' ? 'Omzet' : activeTab === 'customer' ? 'Kontribusi' : 'Total'}</th>
                                            {activeTab === 'customer' && <th className="px-10 py-8 text-[10px] font-black uppercase text-gray-400 text-right">Piutang</th>}
                                        </>
                                    )}
                                    {activeTab === 'returns' && (
                                        <>
                                            <th className="px-10 py-8 text-[10px] font-black uppercase text-gray-400">No. Retur</th>
                                            <th className="px-10 py-8 text-[10px] font-black uppercase text-gray-400">Invoice</th>
                                            <th className="px-10 py-8 text-[10px] font-black uppercase text-gray-400">Konsumen</th>
                                            <th className="px-10 py-8 text-[10px] font-black uppercase text-gray-400 text-right">Total Retur</th>
                                        </>
                                    )}
                                    {activeTab === 'invoice-status' && (
                                        <>
                                            <th className="px-10 py-8 text-[10px] font-black uppercase text-gray-400">No. Invoice</th>
                                            <th className="px-10 py-8 text-[10px] font-black uppercase text-gray-400">Konsumen</th>
                                            <th className="px-10 py-8 text-[10px] font-black uppercase text-gray-400 text-center">Status</th>
                                            <th className="px-10 py-8 text-[10px] font-black uppercase text-gray-400 text-right">Total Tagihan</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr><td colSpan={10} className="py-40 text-center text-[10px] font-black uppercase text-gray-400 animate-pulse">Memuat Data...</td></tr>
                                ) : (
                                    (activeTab === 'product' ? productData :
                                        activeTab === 'customer' ? customerData :
                                            activeTab === 'aging' ? agingData :
                                                activeTab === 'returns' ? returnsData :
                                                    invoiceStatusData).length === 0 ? (
                                        <tr><td colSpan={10} className="py-40 text-center text-gray-300 italic uppercase text-[10px] font-black">Data tidak ditemukan</td></tr>
                                    ) : (
                                        (activeTab === 'product' ? productData :
                                            activeTab === 'customer' ? customerData :
                                                activeTab === 'aging' ? agingData :
                                                    activeTab === 'returns' ? returnsData :
                                                        invoiceStatusData).map((item, idx) => (
                                                            <tr key={idx} className="hover:bg-indigo-50/20 transition-all font-bold text-xs">
                                                                {activeTab === 'product' && (
                                                                    <>
                                                                        <td className="px-10 py-5">{item.product_name} <br /><span className="text-[9px] text-gray-400 font-mono">#{item.product_code}</span></td>
                                                                        <td className="px-10 py-5 text-center">{item.total_qty}</td>
                                                                        <td className="px-10 py-5 text-right font-black">Rp {Number(item.total_omzet).toLocaleString()}</td>
                                                                    </>
                                                                )}
                                                                {activeTab === 'customer' && (
                                                                    <>
                                                                        <td className="px-10 py-5 uppercase">{item.customer_name}</td>
                                                                        <td className="px-10 py-5 text-center">{item.total_orders}</td>
                                                                        <td className="px-10 py-5 text-right font-black">Rp {Number(item.total_kontribusi).toLocaleString()}</td>
                                                                        <td className="px-10 py-5 text-right text-rose-500">Rp {Number(item.total_piutang).toLocaleString()}</td>
                                                                    </>
                                                                )}
                                                                {activeTab === 'aging' && (
                                                                    <>
                                                                        <td className="px-10 py-5 uppercase">{item.customer_name}</td>
                                                                        <td className="px-6 py-5 text-right">{Number(item.current || 0).toLocaleString()}</td>
                                                                        <td className="px-6 py-5 text-right">{Number(item.aging_1_30 || 0).toLocaleString()}</td>
                                                                        <td className="px-6 py-5 text-right">{Number(item.aging_31_60 || 0).toLocaleString()}</td>
                                                                        <td className="px-6 py-5 text-right">{Number(item.aging_61_90 || 0).toLocaleString()}</td>
                                                                        <td className="px-6 py-5 text-right text-rose-500">{Number(item.aging_over_90 || 0).toLocaleString()}</td>
                                                                        <td className="px-10 py-5 text-right font-black text-indigo-600">Rp {Number(item.total_piutang).toLocaleString()}</td>
                                                                    </>
                                                                )}
                                                                {activeTab === 'returns' && (
                                                                    <>
                                                                        <td className="px-10 py-5 uppercase text-indigo-600">{item.return_number} <br /><span className="text-[9px] text-gray-400">{item.return_date}</span></td>
                                                                        <td className="px-10 py-5 uppercase text-gray-500">{item.invoice_number}</td>
                                                                        <td className="px-10 py-5 uppercase">{item.customer_name}</td>
                                                                        <td className="px-10 py-5 text-right font-black text-rose-500">Rp {Number(item.total_amount).toLocaleString()}</td>
                                                                    </>
                                                                )}
                                                                {activeTab === 'invoice-status' && (
                                                                    <>
                                                                        <td className="px-10 py-5 uppercase text-indigo-600">{item.invoice_number} <br /><span className="text-[9px] text-gray-400">{item.invoice_date}</span></td>
                                                                        <td className="px-10 py-5 uppercase">{item.customer_name}</td>
                                                                        <td className="px-10 py-5 text-center"><span className="px-3 py-1 bg-gray-100 rounded-lg text-[9px] font-black uppercase">{item.status}</span></td>
                                                                        <td className="px-10 py-5 text-right font-black">Rp {Number(item.total_amount).toLocaleString()}</td>
                                                                    </>
                                                                )}
                                                            </tr>
                                                        ))
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
