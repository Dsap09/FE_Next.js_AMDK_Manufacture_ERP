"use client";
import React, { useEffect, useState } from "react";
import { accountPayableService } from "@/services/accountPayableService";
import { invoiceReceiptService } from "@/services/invoiceReceiptService";
import { chartOfAccountService } from "@/services/chartOfAccountService";
import { useSearch } from "@/context/SearchContext";
import {
    FileText, Eye, Plus, Loader2, AlertTriangle,
    Calendar, DollarSign, Users, Clock, TrendingDown
} from "lucide-react";

type TabKey = "all" | "unpaid" | "overdue" | "aging" | "supplier";

export default function AccountPayablePage() {
    const { searchTerm } = useSearch();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabKey>("all");
    const [payables, setPayables] = useState<any[]>([]);

    // Aging
    const [agingData, setAgingData] = useState<any>(null);
    // Supplier Summary
    const [supplierSummary, setSupplierSummary] = useState<any[]>([]);

    // Create Modal
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [approvedTTFs, setApprovedTTFs] = useState<any[]>([]);
    const [liabilityAccounts, setLiabilityAccounts] = useState<any[]>([]);
    const [assetAccounts, setAssetAccounts] = useState<any[]>([]);
    const [createForm, setCreateForm] = useState({
        invoice_receipt_id: "",
        payable_account_id: "",
        inventory_account_id: "",
        notes: "",
    });

    // Detail Modal
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedPayable, setSelectedPayable] = useState<any>(null);

    const fetchPayables = async (params?: any) => {
        try {
            setLoading(true);
            const res = await accountPayableService.getAll(params);
            setPayables(Array.isArray(res) ? res : res?.data || []);
        } catch (error) {
            console.error("Failed to fetch payables:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAging = async () => {
        try {
            setLoading(true);
            const res = await accountPayableService.getAgingReport();
            setAgingData(res);
        } catch (error) {
            console.error("Failed to fetch aging:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSupplierSummary = async () => {
        try {
            setLoading(true);
            const res = await accountPayableService.getSummaryBySupplier();
            setSupplierSummary(Array.isArray(res) ? res : res?.data || []);
        } catch (error) {
            console.error("Failed to fetch supplier summary:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        switch (activeTab) {
            case "all":
                fetchPayables();
                break;
            case "unpaid":
                fetchPayables({ status: "unpaid" });
                break;
            case "overdue":
                fetchPayables({ overdue: "true" });
                break;
            case "aging":
                fetchAging();
                break;
            case "supplier":
                fetchSupplierSummary();
                break;
        }
    }, [activeTab]);

    const openCreate = async () => {
        try {
            const [ttfRes, liabilityRes, assetRes] = await Promise.all([
                invoiceReceiptService.getAll({ status: "approved" }),
                chartOfAccountService.getAll({ type: "liability" }),
                chartOfAccountService.getAll({ type: "asset" }),
            ]);
            setApprovedTTFs(Array.isArray(ttfRes) ? ttfRes : ttfRes?.data || []);
            setLiabilityAccounts(Array.isArray(liabilityRes) ? liabilityRes : liabilityRes?.data || []);
            setAssetAccounts(Array.isArray(assetRes) ? assetRes : assetRes?.data || []);
        } catch (e) {
            console.error(e);
        }
        setCreateForm({ invoice_receipt_id: "", payable_account_id: "", inventory_account_id: "", notes: "" });
        setIsCreateOpen(true);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await accountPayableService.createFromInvoiceReceipt({
                invoice_receipt_id: Number(createForm.invoice_receipt_id),
                payable_account_id: Number(createForm.payable_account_id),
                inventory_account_id: Number(createForm.inventory_account_id),
                notes: createForm.notes || undefined,
            });
            alert("Hutang usaha berhasil dicatat!");
            setIsCreateOpen(false);
            fetchPayables();
            setActiveTab("all");
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal membuat hutang");
        }
    };

    const viewDetail = async (payable: any) => {
        try {
            const res = await accountPayableService.getById(payable.id);
            setSelectedPayable(res?.data || res);
            setIsDetailOpen(true);
        } catch (e) {
            console.error(e);
        }
    };

    const formatCurrency = (amount: number) =>
        `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            unpaid: "bg-amber-100 text-amber-700 border-amber-200",
            paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
            partial: "bg-blue-100 text-blue-700 border-blue-200",
        };
        const labels: Record<string, string> = {
            unpaid: "Belum Lunas",
            paid: "Lunas",
            partial: "Sebagian",
        };
        return (
            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${styles[status] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
                {labels[status] || status}
            </span>
        );
    };

    const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
        { key: "all", label: "Semua Hutang", icon: <FileText size={14} /> },
        { key: "unpaid", label: "Belum Lunas", icon: <Clock size={14} /> },
        { key: "overdue", label: "Jatuh Tempo", icon: <AlertTriangle size={14} /> },
        { key: "aging", label: "Aging Report", icon: <TrendingDown size={14} /> },
        { key: "supplier", label: "Per Supplier", icon: <Users size={14} /> },
    ];

    const agingBucketLabels: Record<string, { label: string; color: string }> = {
        current: { label: "Belum Jatuh Tempo", color: "from-emerald-500 to-emerald-600" },
        "1_30": { label: "1 – 30 Hari", color: "from-amber-500 to-amber-600" },
        "31_60": { label: "31 – 60 Hari", color: "from-orange-500 to-orange-600" },
        "61_90": { label: "61 – 90 Hari", color: "from-red-500 to-red-600" },
        above_90: { label: "> 90 Hari", color: "from-rose-600 to-rose-700" },
    };

    return (
        <div className="p-4 md:p-6 space-y-6 bg-gray-50/30 min-h-screen flex flex-col items-stretch max-w-full overflow-hidden">
            {/* Header */}
            <div className="flex-none w-full">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 dark:bg-gray-900 overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg shrink-0">
                                <DollarSign className="text-white" size={24} />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-2xl font-black uppercase italic text-gray-800 dark:text-white tracking-tighter truncate">
                                    Account Payable
                                </h1>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest truncate">Hutang Usaha — Pembelian</p>
                            </div>
                        </div>
                        <button
                            onClick={openCreate}
                            className="bg-violet-600 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase shadow-lg shadow-violet-100 hover:bg-violet-700 active:scale-95 transition-all shrink-0"
                        >
                            <Plus size={16} className="inline mr-2" /> Buat Hutang dari TTF
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex-none w-full overflow-x-auto scrollbar-hide">
                <div className="flex flex-nowrap md:flex-wrap gap-2 pb-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all shrink-0 ${activeTab === tab.key
                                ? "bg-violet-600 text-white shadow-lg shadow-violet-100"
                                : "bg-white text-gray-500 border border-gray-100 hover:border-violet-200 hover:text-violet-600"
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area - Isolation using Grid */}
            <div className="grid grid-cols-1 w-full min-w-0 overflow-hidden">
                {(activeTab === "all" || activeTab === "unpaid" || activeTab === "overdue") && (
                    <div className="rounded-3xl border border-gray-100 bg-white shadow-sm dark:bg-gray-900 overflow-hidden w-full">
                        <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-gray-200">
                            <table className="w-full text-left min-w-[1200px] table-auto">
                                <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                                    <tr className="border-b border-gray-100 dark:border-gray-800">
                                        <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">No. AP</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Supplier</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">No. TTF</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Total</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Dibayar</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Sisa</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Jatuh Tempo</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Status</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Overdue</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                    {loading ? (
                                        <tr><td colSpan={10} className="py-20 text-center">
                                            <Loader2 className="animate-spin mx-auto text-gray-300 mb-2" />
                                            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Loading...</span>
                                        </td></tr>
                                    ) : payables.filter(p => {
                                        if (!searchTerm) return true;
                                        const supplierName = (p.supplier?.nama || p.invoice_receipt?.supplier?.nama || p.invoice_receipt?.purchase_order?.supplier?.nama || "").toLowerCase();
                                        const payableNum = (p.payable_number || "").toLowerCase();
                                        return supplierName.includes(searchTerm.toLowerCase()) || payableNum.includes(searchTerm.toLowerCase());
                                    }).length === 0 ? (
                                        <tr><td colSpan={10} className="py-20 text-center text-xs font-bold text-gray-300 uppercase tracking-widest">
                                            {searchTerm ? "Hasil pencarian tidak ditemukan" : "Belum ada data hutang usaha"}
                                        </td></tr>
                                    ) : (
                                        payables.filter(p => {
                                            if (!searchTerm) return true;
                                            const supplierName = (p.supplier?.nama || p.invoice_receipt?.supplier?.nama || p.invoice_receipt?.purchase_order?.supplier?.nama || "").toLowerCase();
                                            const payableNum = (p.payable_number || "").toLowerCase();
                                            return supplierName.includes(searchTerm.toLowerCase()) || payableNum.includes(searchTerm.toLowerCase());
                                        }).map((p) => (
                                            <tr key={p.id} className="hover:bg-gray-50/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-black text-violet-600 uppercase italic tracking-tighter">{p.payable_number}</span>
                                                    <br /><span className="text-[9px] text-gray-400 font-bold">{p.invoice_date}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                                        {p.supplier?.nama || 
                                                         p.invoice_receipt?.supplier?.nama || 
                                                         p.invoice_receipt?.purchase_order?.supplier?.nama || 
                                                         "—"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-bold text-gray-500">{p.invoice_receipt?.receipt_number || "—"}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-xs font-black text-gray-700">{formatCurrency(p.amount)}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-xs font-bold text-emerald-600">{formatCurrency(p.paid_amount)}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-xs font-black text-red-600">{formatCurrency(p.remaining_amount)}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-bold text-gray-500 whitespace-nowrap">
                                                        {p.due_date?.includes('T') ? p.due_date.split('T')[0] : p.due_date}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {getStatusBadge(p.status)}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {p.is_overdue ? (
                                                        <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-red-100 text-red-600 border border-red-200">
                                                            {p.overdue_days} hari
                                                        </span>
                                                    ) : (
                                                        <span className="text-[9px] font-bold text-gray-300 uppercase">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => viewDetail(p)}
                                                        className="p-2.5 bg-gray-50 text-gray-500 hover:text-violet-600 rounded-xl transition-all">
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
                )}

                {/* Aging Report Tab */}
                {activeTab === "aging" && (
                    <div className="space-y-6 overflow-y-auto">
                        {loading ? (
                            <div className="py-20 text-center">
                                <Loader2 className="animate-spin mx-auto text-gray-300 mb-2" />
                                <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Loading...</span>
                            </div>
                        ) : agingData ? (
                            <>
                                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm dark:bg-gray-900">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-sm font-black uppercase text-gray-600 tracking-wider">Aging Payable Report</h2>
                                        <span className="text-[10px] font-bold text-gray-400">Per {agingData.as_of}</span>
                                    </div>
                                    <div className="text-2xl font-black text-violet-600">{formatCurrency(agingData.grand_total)}</div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total Hutang Belum Lunas</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                    {Object.entries(agingBucketLabels).map(([key, { label, color }]) => {
                                        const bucket = agingData.aging?.[key];
                                        if (!bucket) return null;
                                        return (
                                            <div key={key} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden dark:bg-gray-900">
                                                <div className={`p-4 bg-gradient-to-r ${color}`}>
                                                    <p className="text-white text-[10px] font-black uppercase tracking-widest">{label}</p>
                                                </div>
                                                <div className="p-5">
                                                    <div className="text-lg font-black text-gray-800 dark:text-white">{formatCurrency(bucket.total)}</div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">{bucket.count} hutang</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {Object.entries(agingBucketLabels).map(([key, { label }]) => {
                                    const bucket = agingData.aging?.[key];
                                    if (!bucket || bucket.items.length === 0) return null;
                                    return (
                                        <div key={key} className="rounded-3xl border border-gray-100 bg-white shadow-sm dark:bg-gray-900 overflow-hidden">
                                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                                <h3 className="text-xs font-black uppercase text-gray-600 tracking-wider">{label}</h3>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left min-w-[800px]">
                                                    <thead>
                                                        <tr className="border-b border-gray-100">
                                                            <th className="px-6 py-3 text-[10px] font-black uppercase text-gray-400 tracking-widest">No. AP</th>
                                                            <th className="px-6 py-3 text-[10px] font-black uppercase text-gray-400 tracking-widest">Supplier</th>
                                                            <th className="px-6 py-3 text-[10px] font-black uppercase text-gray-400 tracking-widest">Jatuh Tempo</th>
                                                            <th className="px-6 py-3 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Sisa Hutang</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        {bucket.items.map((item: any) => (
                                                            <tr key={item.id} className="hover:bg-gray-50/30">
                                                                <td className="px-6 py-3 text-xs font-black text-violet-600">{item.payable_number}</td>
                                                                <td className="px-6 py-3 text-xs font-bold text-gray-700">{item.supplier?.nama || "—"}</td>
                                                                <td className="px-6 py-3 text-xs font-bold text-gray-500">{item.due_date?.split('T')[0] || item.due_date}</td>
                                                                <td className="px-6 py-3 text-xs font-black text-red-600 text-right">{formatCurrency(item.remaining_amount)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        ) : (
                            <div className="py-20 text-center text-xs font-bold text-gray-300 uppercase tracking-widest">
                                Tidak ada data aging report
                            </div>
                        )}
                    </div>
                )}

                {/* Supplier Summary Tab */}
                {activeTab === "supplier" && (
                    <div className="space-y-4 overflow-y-auto">
                        {loading ? (
                            <div className="py-20 text-center">
                                <Loader2 className="animate-spin mx-auto text-gray-300 mb-2" />
                                <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Loading...</span>
                            </div>
                        ) : supplierSummary.length === 0 ? (
                            <div className="py-20 text-center text-xs font-bold text-gray-300 uppercase tracking-widest">
                                Belum ada data ringkasan supplier
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {supplierSummary.map((s: any, idx: number) => (
                                    <div key={idx} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 dark:bg-gray-900">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center shrink-0">
                                                <Users size={18} className="text-violet-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-sm font-black text-gray-800 dark:text-white truncate">{s.supplier_name || "—"}</h3>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{s.count} hutang</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">Total Hutang</span>
                                                <span className="text-xs font-black text-gray-700">{formatCurrency(s.total_payable)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">Sisa Hutang</span>
                                                <span className="text-xs font-black text-red-600">{formatCurrency(s.total_remaining)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">Jatuh Tempo Tertua</span>
                                                <span className="text-xs font-bold text-gray-500">{s.oldest_due_date?.split('T')[0] || s.oldest_due_date}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl dark:bg-gray-900 overflow-y-auto max-h-[90vh]">
                        <div className="flex items-center justify-between border-b pb-4 mb-6">
                            <h3 className="text-lg font-black text-gray-800 dark:text-white uppercase italic">Buat Hutang dari TTF</h3>
                            <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-red-500">✕</button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">TTF (Approved)</label>
                                <select required value={createForm.invoice_receipt_id}
                                    onChange={(e) => setCreateForm({ ...createForm, invoice_receipt_id: e.target.value })}
                                    className="w-full p-3 rounded-xl border-2 border-gray-100 text-sm font-bold focus:border-violet-500 outline-none dark:bg-gray-800">
                                    <option value="">Pilih TTF...</option>
                                    {approvedTTFs.map((ttf: any) => (
                                        <option key={ttf.id} value={ttf.id}>
                                            {ttf.receipt_number} — {ttf.purchase_order?.supplier?.nama || "N/A"}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Akun Hutang Usaha (Kredit)</label>
                                <select required value={createForm.payable_account_id}
                                    onChange={(e) => setCreateForm({ ...createForm, payable_account_id: e.target.value })}
                                    className="w-full p-3 rounded-xl border-2 border-gray-100 text-sm font-bold focus:border-violet-500 outline-none dark:bg-gray-800">
                                    <option value="">Pilih Akun Hutang...</option>
                                    {liabilityAccounts.map((acc: any) => (
                                        <option key={acc.id} value={acc.id}>{acc.code} — {acc.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Akun Persediaan / Beban (Debit)</label>
                                <select required value={createForm.inventory_account_id}
                                    onChange={(e) => setCreateForm({ ...createForm, inventory_account_id: e.target.value })}
                                    className="w-full p-3 rounded-xl border-2 border-gray-100 text-sm font-bold focus:border-violet-500 outline-none dark:bg-gray-800">
                                    <option value="">Pilih Akun Persediaan...</option>
                                    {assetAccounts.map((acc: any) => (
                                        <option key={acc.id} value={acc.id}>{acc.code} — {acc.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Catatan</label>
                                <textarea value={createForm.notes}
                                    onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                                    className="w-full p-3 rounded-xl border-2 border-gray-100 text-sm font-bold focus:border-violet-500 outline-none dark:bg-gray-800"
                                    rows={2} placeholder="Catatan (opsional)" />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsCreateOpen(false)}
                                    className="px-6 py-2.5 text-xs font-black text-gray-400 uppercase">Batal</button>
                                <button type="submit"
                                    className="bg-violet-600 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase shadow-lg">
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {isDetailOpen && selectedPayable && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-4xl bg-white rounded-3xl p-6 shadow-2xl dark:bg-gray-900 flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between border-b pb-4 mb-6 shrink-0">
                            <div>
                                <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase italic">{selectedPayable.payable_number}</h3>
                                <p className="text-xs text-gray-400 font-bold mt-1">
                                    Status: {getStatusBadge(selectedPayable.status)}
                                    {selectedPayable.is_overdue && (
                                        <span className="ml-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-red-100 text-red-600 border border-red-200">
                                            Overdue {selectedPayable.overdue_days} hari
                                        </span>
                                    )}
                                </p>
                            </div>
                            <button onClick={() => setIsDetailOpen(false)} className="text-gray-400 hover:text-red-500">✕</button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 rounded-2xl bg-violet-50 border border-violet-100 dark:bg-violet-900/20">
                                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Supplier</p>
                                    <p className="text-sm font-black">
                                        {selectedPayable.supplier?.nama || 
                                         selectedPayable.invoice_receipt?.supplier?.nama || 
                                         selectedPayable.invoice_receipt?.purchase_order?.supplier?.nama || 
                                         "—"}
                                    </p>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 dark:bg-gray-800">
                                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">No. TTF</p>
                                    <p className="text-sm font-bold">{selectedPayable.invoice_receipt?.receipt_number || "—"}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 dark:bg-gray-800">
                                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Jatuh Tempo</p>
                                    <p className="text-sm font-bold">{selectedPayable.due_date?.split('T')[0] || selectedPayable.due_date}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Total Hutang</p>
                                    <p className="text-lg font-black text-gray-800">{formatCurrency(selectedPayable.amount)}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Sudah Dibayar</p>
                                    <p className="text-lg font-black text-emerald-600">{formatCurrency(selectedPayable.paid_amount)}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
                                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Sisa Hutang</p>
                                    <p className="text-lg font-black text-red-600">{formatCurrency(selectedPayable.remaining_amount)}</p>
                                </div>
                            </div>

                            {selectedPayable.payments && selectedPayable.payments.length > 0 && (
                                <div className="rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                        <h4 className="text-xs font-black uppercase text-gray-600 tracking-wider">Riwayat Pembayaran</h4>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs min-w-[500px]">
                                            <thead className="bg-gray-50 dark:bg-gray-800">
                                                <tr className="text-[9px] font-black uppercase text-gray-400">
                                                    <th className="p-4">No. Payment</th>
                                                    <th className="p-4">Tanggal</th>
                                                    <th className="p-4">Metode</th>
                                                    <th className="p-4 text-right">Jumlah</th>
                                                    <th className="p-4 text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                                {selectedPayable.payments.map((pay: any) => (
                                                    <tr key={pay.id}>
                                                        <td className="p-4 font-bold text-violet-600">{pay.payment_number}</td>
                                                        <td className="p-4 text-gray-500">{pay.payment_date}</td>
                                                        <td className="p-4 text-gray-500 uppercase">{pay.payment_method}</td>
                                                        <td className="p-4 text-right font-black text-gray-700">{formatCurrency(pay.amount)}</td>
                                                        <td className="p-4 text-center">
                                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${pay.status === 'confirmed' ? 'bg-emerald-100 text-emerald-600' : pay.status === 'draft' ? 'bg-gray-100 text-gray-500' : 'bg-red-100 text-red-500'}`}>
                                                                {pay.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t mt-4 shrink-0">
                            <button onClick={() => setIsDetailOpen(false)} className="px-6 py-2.5 text-xs font-black text-gray-400 uppercase">Tutup</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
