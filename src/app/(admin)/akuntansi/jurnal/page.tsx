"use client";
import React, { useEffect, useState } from "react";
import { ledgerService } from "@/services/ledgerService";
import { chartOfAccountService } from "@/services/chartOfAccountService";
import { useSearch } from "@/context/SearchContext";
import {
    BookOpen, History, BarChart3, List, Search, Loader2,
    ArrowUpRight, ArrowDownRight, Calendar, Filter
} from "lucide-react";

type JournalTab = "ledger" | "trial" | "detail";

export default function JournalPage() {
    const { searchTerm } = useSearch();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<JournalTab>("ledger");
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    // Ledger Summary Data
    const [ledgerSummary, setLedgerSummary] = useState<any[]>([]);
    // Trial Balance Data
    const [trialData, setTrialData] = useState<any>(null);
    // Detail Account Data
    const [selectedAccountId, setSelectedAccountId] = useState<string>("");
    const [accounts, setAccounts] = useState<any[]>([]);
    const [detailData, setDetailData] = useState<any>(null);

    const fetchAccounts = async () => {
        try {
            const res = await chartOfAccountService.getAll();
            setAccounts(Array.isArray(res) ? res : res?.data || []);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchLedgerSummary = async () => {
        try {
            setLoading(true);
            const res = await ledgerService.getSummary({ start_date: startDate, end_date: endDate });
            setLedgerSummary(res?.accounts || res?.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchTrialBalance = async () => {
        try {
            setLoading(true);
            const res = await ledgerService.getTrialBalance({ end_date: endDate });
            setTrialData(res?.data || res);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchDetailAccount = async () => {
        if (!selectedAccountId) return;
        try {
            setLoading(true);
            const res = await ledgerService.getDetail(Number(selectedAccountId), { start_date: startDate, end_date: endDate });
            setDetailData(res?.data || res);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    useEffect(() => {
        if (activeTab === "ledger") fetchLedgerSummary();
        if (activeTab === "trial") fetchTrialBalance();
        if (activeTab === "detail") fetchDetailAccount();
    }, [activeTab, startDate, endDate, selectedAccountId]);

    const formatCurrency = (amount: number) =>
        `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;

    const tabs: { key: JournalTab; label: string; icon: React.ReactNode }[] = [
        { key: "ledger", label: "Buku Besar", icon: <BookOpen size={14} /> },
        { key: "trial", label: "Neraca Saldo", icon: <BarChart3 size={14} /> },
        { key: "detail", label: "Detail Akun", icon: <List size={14} /> },
    ];

    const typeLabels: Record<string, { label: string; color: string }> = {
        asset: { label: "Aset / Aktiva", color: "from-blue-500 to-indigo-600" },
        liability: { label: "Kewajiban / Pasiva", color: "from-amber-500 to-orange-600" },
        equity: { label: "Modal / Ekuitas", color: "from-emerald-500 to-teal-600" },
        revenue: { label: "Pendapatan", color: "from-violet-500 to-purple-600" },
        expense: { label: "Beban", color: "from-rose-500 to-red-600" },
    };

    return (
        <div className="p-4 md:p-6 space-y-6 bg-gray-50/30 min-h-screen flex flex-col items-stretch max-w-full overflow-hidden">
            {/* Header */}
            <div className="flex-none w-full">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 dark:bg-gray-900 overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-lg shrink-0">
                                <BookOpen className="text-white" size={24} />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-2xl font-black uppercase italic text-gray-800 dark:text-white tracking-tighter truncate">
                                    Jurnal & Buku Besar
                                </h1>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest truncate">General Ledger & Trial Balance</p>
                            </div>
                        </div>
                        {/* Date Filters */}
                        <div className="flex flex-wrap items-center gap-3 shrink-0">
                            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100 shrink-0">
                                <Calendar size={14} className="text-gray-400" />
                                <input type="date" value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="bg-transparent text-[10px] font-black uppercase outline-none text-gray-600" />
                                <span className="text-gray-300">to</span>
                                <input type="date" value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="bg-transparent text-[10px] font-black uppercase outline-none text-gray-600" />
                            </div>
                        </div>
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
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all shrink-0 ${activeTab === tab.key
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-105"
                                : "bg-white text-gray-500 border border-gray-100 hover:border-indigo-200"
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area - Isolation using Grid */}
            <div className="grid grid-cols-1 w-full min-w-0 overflow-hidden">
                <div className="h-full">
                    {/* Ledgers Summary Tab */}
                    {activeTab === "ledger" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm dark:bg-gray-900">
                                    <div className="p-2 w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                                        <ArrowUpRight size={20} className="text-blue-600" />
                                    </div>
                                    <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Total Debit</h3>
                                    <p className="text-xl font-black text-gray-800 dark:text-white mt-1">
                                        {formatCurrency(ledgerSummary.reduce((acc, curr) => acc + (Number(curr.total_debit) || 0), 0))}
                                    </p>
                                </div>
                                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm dark:bg-gray-900 text-right">
                                    <div className="p-2 w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-3 ml-auto">
                                        <ArrowDownRight size={20} className="text-red-600" />
                                    </div>
                                    <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Total Kredit</h3>
                                    <p className="text-xl font-black text-gray-800 dark:text-white mt-1">
                                        {formatCurrency(ledgerSummary.reduce((acc, curr) => acc + (Number(curr.total_credit) || 0), 0))}
                                    </p>
                                </div>
                            </div>

                            {/* Accounts table */}
                            <div className="rounded-3xl border border-gray-100 bg-white shadow-sm dark:bg-gray-900 overflow-hidden w-full">
                                <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-gray-200">
                                    <table className="w-full text-left min-w-[1000px] table-auto">
                                        <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                                            <tr className="border-b border-gray-100">
                                                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Kode</th>
                                                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Nama Akun</th>
                                                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Tipe</th>
                                                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Debit</th>
                                                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Kredit</th>
                                                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Saldo Akhir</th>
                                                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                            {loading ? (
                                                <tr><td colSpan={7} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-gray-300" /></td></tr>
                                            ) : ledgerSummary.filter(l => {
                                                if (!searchTerm) return true;
                                                const searchStr = searchTerm.toLowerCase();
                                                return (l.name?.toLowerCase() || "").includes(searchStr) || (l.code?.toLowerCase() || "").includes(searchStr);
                                            }).length === 0 ? (
                                                <tr><td colSpan={7} className="py-20 text-center text-xs font-bold text-gray-300 uppercase tracking-widest">
                                                    {searchTerm ? "Hasil pencarian tidak ditemukan" : "Tidak ada data"}
                                                </td></tr>
                                            ) : (
                                                ledgerSummary.filter(l => {
                                                    if (!searchTerm) return true;
                                                    const searchStr = searchTerm.toLowerCase();
                                                    return (l.name?.toLowerCase() || "").includes(searchStr) || (l.code?.toLowerCase() || "").includes(searchStr);
                                                }).map((l) => (
                                                    <tr key={`${l.account_id}-${l.code}`} className="hover:bg-gray-50/30 transition-colors">
                                                        <td className="px-6 py-4 font-black text-[10px] text-indigo-600">{l.code}</td>
                                                        <td className="px-6 py-4 text-xs font-bold text-gray-700 dark:text-gray-300">{l.name}</td>
                                                        <td className="px-6 py-4 text-[9px] font-bold text-gray-400 uppercase tracking-widest">{l.type}</td>
                                                        <td className="px-6 py-4 text-right text-xs font-black text-blue-600">{formatCurrency(l.total_debit)}</td>
                                                        <td className="px-6 py-4 text-right text-xs font-black text-red-600">{formatCurrency(l.total_credit)}</td>
                                                        <td className="px-6 py-4 text-right text-xs font-black text-gray-800">{formatCurrency(l.saldo_normal ?? l.saldo)}</td>
                                                        <td className="px-6 py-4 text-center">
                                                            <button onClick={() => { setSelectedAccountId(l.account_id); setActiveTab("detail"); }}
                                                                className="p-2 bg-gray-50 text-gray-400 hover:text-indigo-600 rounded-lg">
                                                                <List size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Trial Balance Tab */}
                    {activeTab === "trial" && (
                        <div className="space-y-6">
                            {loading ? (
                                <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-gray-300" /></div>
                            ) : trialData ? (
                                <>
                                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm dark:bg-gray-900 flex justify-between items-center">
                                        <div>
                                            <h3 className="text-sm font-black uppercase text-gray-600 tracking-wider italic">Neraca Saldo</h3>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Periode s/d {trialData.as_of}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${Math.abs(Number(trialData.total_debit) - Number(trialData.total_credit)) < 1 ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
                                                {Math.abs(Number(trialData.total_debit) - Number(trialData.total_credit)) < 1 ? "Balanced ✅" : "Unbalanced ❌"}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Grouped by type */}
                                    <div className="space-y-4">
                                        {trialData.by_type && Object.entries(trialData.by_type).map(([type, items]: [string, any]) => (
                                            <div key={type} className="rounded-3xl border border-gray-100 bg-white shadow-sm dark:bg-gray-900 overflow-hidden w-full">
                                                <div className={`px-6 py-4 bg-gradient-to-r ${typeLabels[type]?.color || "from-gray-400 to-gray-500"}`}>
                                                    <h3 className="text-sm font-black uppercase text-white tracking-wider">{typeLabels[type]?.label || type}</h3>
                                                </div>
                                                <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-gray-200">
                                                    <table className="w-full text-left min-w-[800px] table-auto">
                                                        <thead>
                                                            <tr className="border-b border-gray-100">
                                                                <th className="px-6 py-3 text-[10px] font-black uppercase text-gray-400 tracking-widest">Kode</th>
                                                                <th className="px-6 py-3 text-[10px] font-black uppercase text-gray-400 tracking-widest">Nama Akun</th>
                                                                <th className="px-6 py-3 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Debit</th>
                                                                <th className="px-6 py-3 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Kredit</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-50">
                                                            {items.map((item: any) => (
                                                                <tr key={item.code} className="hover:bg-gray-50/30">
                                                                    <td className="px-6 py-3 text-xs font-black text-indigo-600 italic tracking-tighter">{item.code}</td>
                                                                    <td className="px-6 py-3 text-xs font-bold text-gray-700">{item.name}</td>
                                                                    <td className="px-6 py-3 text-right text-xs font-black text-blue-600">{Number(item.total_debit) > 0 ? formatCurrency(item.total_debit) : "—"}</td>
                                                                    <td className="px-6 py-3 text-right text-xs font-black text-red-600">{Number(item.total_credit) > 0 ? formatCurrency(item.total_credit) : "—"}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Footer Grand Total */}
                                    <div className="bg-gray-900 text-white rounded-3xl p-6 shadow-xl flex justify-between items-center mt-10">
                                        <h3 className="text-sm font-black uppercase tracking-[0.2em] italic">Total Seluruh</h3>
                                        <div className="flex gap-10">
                                            <div className="text-right">
                                                <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1">Total Debit</p>
                                                <p className="text-lg font-black">{formatCurrency(trialData.total_debit)}</p>
                                            </div>
                                            <div className="text-right border-l border-gray-800 pl-10">
                                                <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1">Total Kredit</p>
                                                <p className="text-lg font-black">{formatCurrency(trialData.total_credit)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : null}
                        </div>
                    )}

                    {/* Detail Account Tab */}
                    {activeTab === "detail" && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm dark:bg-gray-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Pilih Akun</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <select
                                            value={selectedAccountId}
                                            onChange={(e) => setSelectedAccountId(e.target.value)}
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 p-3 pl-10 rounded-2xl text-xs font-black outline-none transition-all uppercase italic"
                                        >
                                            <option value="">Cari Akun...</option>
                                            {accounts.map(acc => (
                                                <option key={acc.id} value={acc.id}>{acc.code} — {acc.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {detailData && (
                                    <div className="text-right">
                                        <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Saldo Berjalan</div>
                                        <div className="text-2xl font-black text-indigo-600">{formatCurrency(detailData.summary?.saldo_akhir)}</div>
                                    </div>
                                )}
                            </div>

                            {loading ? (
                                <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-gray-300" /></div>
                            ) : detailData ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-white p-5 rounded-3xl border border-gray-100 text-center">
                                            <h4 className="text-[9px] font-black text-gray-400 uppercase mb-1">Saldo Awal</h4>
                                            <p className="text-sm font-black text-gray-700">{formatCurrency(detailData.opening_balance || 0)}</p>
                                        </div>
                                        <div className="bg-white p-5 rounded-3xl border border-gray-100 text-center">
                                            <h4 className="text-[9px] font-black text-blue-400 uppercase mb-1">Total Mutasi Debit</h4>
                                            <p className="text-sm font-black text-blue-600">{formatCurrency(detailData.summary?.total_debit)}</p>
                                        </div>
                                        <div className="bg-white p-5 rounded-3xl border border-gray-100 text-center">
                                            <h4 className="text-[9px] font-black text-red-400 uppercase mb-1">Total Mutasi Kredit</h4>
                                            <p className="text-sm font-black text-red-600">{formatCurrency(detailData.summary?.total_credit)}</p>
                                        </div>
                                    </div>

                                    {/* Transactions table */}
                                    <div className="rounded-3xl border border-gray-100 bg-white shadow-sm dark:bg-gray-900 overflow-hidden w-full">
                                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                            <h4 className="text-xs font-black uppercase text-gray-600 tracking-wider">Riwayat Transaksi</h4>
                                            <p className="text-[9px] text-gray-400 font-bold mt-1">
                                                Periode: {detailData.period?.start_date || "Awal"} s/d {detailData.period?.end_date || "Sekarang"}
                                            </p>
                                        </div>
                                        <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-gray-200">
                                            <table className="w-full text-left min-w-[1000px] table-auto">
                                                <thead>
                                                    <tr className="border-b border-gray-100">
                                                        <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">No. Jurnal</th>
                                                        <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Tanggal</th>
                                                        <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Keterangan</th>
                                                        <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Debit</th>
                                                        <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Kredit</th>
                                                        <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Saldo</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {detailData.transactions?.length === 0 ? (
                                                        <tr><td colSpan={6} className="py-20 text-center text-[10px] font-bold text-gray-300 uppercase">Tidak ada mutasi</td></tr>
                                                    ) : (
                                                        detailData.transactions?.map((entry: any, idx: number) => (
                                                            <tr key={idx} className="hover:bg-gray-50/30">
                                                                <td className="px-6 py-5 text-[10px] font-black text-indigo-500">{entry.journal_number || "—"}</td>
                                                                <td className="px-6 py-5 text-xs font-bold text-gray-400 whitespace-nowrap">{entry.journal_date}</td>
                                                                <td className="px-6 py-5">
                                                                    <div className="text-xs font-bold text-gray-700">{entry.description}</div>
                                                                    <div className="text-[9px] text-gray-400 italic">No. Dok: {entry.reference_number || "—"}</div>
                                                                </td>
                                                                <td className="px-6 py-5 text-right text-xs font-black text-blue-600">{Number(entry.debit) > 0 ? formatCurrency(entry.debit) : "—"}</td>
                                                                <td className="px-6 py-5 text-right text-xs font-black text-red-600">{Number(entry.credit) > 0 ? formatCurrency(entry.credit) : "—"}</td>
                                                                <td className="px-6 py-5 text-right text-xs font-black text-gray-800">{formatCurrency(entry.saldo)}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="py-40 text-center">
                                    <Filter className="mx-auto text-gray-100 mb-4" size={60} />
                                    <p className="text-xs font-black text-gray-300 uppercase tracking-widest italic">Silakan pilih akun untuk melihat detail</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
