"use client";
import React, { useEffect, useState } from "react";
import { payablePaymentService } from "@/services/payablePaymentService";
import { accountPayableService } from "@/services/accountPayableService";
import { chartOfAccountService } from "@/services/chartOfAccountService";
import { useSearch } from "@/context/SearchContext";
import {
    CreditCard, Eye, Plus, Loader2, Edit3, Trash2, CheckCircle, XCircle, Printer, Link, DollarSign, Calendar
} from "lucide-react";

export default function AccountPaymentPage() {
    const { searchTerm } = useSearch();
    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState<any[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>("");
    const [filterMethod, setFilterMethod] = useState<string>("");

    // Create/Edit Modal
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [unpaidPayables, setUnpaidPayables] = useState<any[]>([]);
    const [bankAccounts, setBankAccounts] = useState<any[]>([]);
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [form, setForm] = useState({
        account_payable_id: "",
        payment_date: new Date().toISOString().split("T")[0],
        payment_method: "bank_transfer",
        amount: 0,
        bank_account_id: "",
        reference_number: "",
        notes: "",
    });

    // Detail Modal
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailData, setDetailData] = useState<any>(null);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (filterStatus) params.status = filterStatus;
            if (filterMethod) params.payment_method = filterMethod;
            const res = await payablePaymentService.getAll(params);
            setPayments(Array.isArray(res) ? res : res?.data || []);
        } catch (error) {
            console.error("Failed to fetch payments:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [filterStatus, filterMethod]);

    const openCreate = async () => {
        try {
            const [unpaidRes, bankRes] = await Promise.all([
                accountPayableService.getAll({ status: "unpaid" }),
                chartOfAccountService.getAll({ type: "asset" }), // Assume bank/cash are assets
            ]);
            setUnpaidPayables(Array.isArray(unpaidRes) ? unpaidRes : unpaidRes?.data || []);
            setBankAccounts(Array.isArray(bankRes) ? bankRes : bankRes?.data || []);
        } catch (e) {
            console.error(e);
        }
        setSelectedPayment(null);
        setForm({
            account_payable_id: "",
            payment_date: new Date().toISOString().split("T")[0],
            payment_method: "bank_transfer",
            amount: 0,
            bank_account_id: "",
            reference_number: "",
            notes: "",
        });
        setIsFormOpen(true);
    };

    const openEdit = async (payment: any) => {
        try {
            const [unpaidRes, bankRes] = await Promise.all([
                accountPayableService.getAll({ status: "unpaid" }),
                chartOfAccountService.getAll({ type: "asset" }),
            ]);
            setUnpaidPayables(Array.isArray(unpaidRes) ? unpaidRes : unpaidRes?.data || []);
            setBankAccounts(Array.isArray(bankRes) ? bankRes : bankRes?.data || []);
        } catch (e) {
            console.error(e);
        }
        setSelectedPayment(payment);
        setForm({
            account_payable_id: payment.account_payable_id.toString(),
            payment_date: payment.payment_date,
            payment_method: payment.payment_method,
            amount: payment.amount,
            bank_account_id: payment.bank_account_id?.toString() || "",
            reference_number: payment.reference_number || "",
            notes: payment.notes || "",
        });
        setIsFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: any = {
                payment_method: form.payment_method,
                payment_date: form.payment_date,
                amount: Number(form.amount),
                payment_account_id: Number(form.bank_account_id),
                reference_number: form.reference_number,
                notes: form.notes,
            };

            if (selectedPayment) {
                await payablePaymentService.update(selectedPayment.id, payload);
                alert("Pembayaran berhasil diupdate");
            } else {
                payload.account_payable_id = Number(form.account_payable_id);
                await payablePaymentService.create(payload);
                alert("Draft pembayaran berhasil dibuat");
            }
            setIsFormOpen(false);
            fetchPayments();
        } catch (error: any) {
            alert(error.response?.data?.message || "Terjadi kesalahan (Status: " + error.response?.status + ")");
        }
    };

    const handleConfirm = async (id: number) => {
        if (!confirm("Konfirmasi pembayaran ini? Jurnal akan otomatis dibuat.")) return;
        try {
            await payablePaymentService.confirm(id);
            alert("Pembayaran dikonfirmasi!");
            fetchPayments();
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal konfirmasi");
        }
    };

    const handleCancel = async (id: number) => {
        const reason = prompt("Alasan pembatalan:");
        if (reason === null) return;
        try {
            // Updated to pass reason correctly if needed by backend API
            await payablePaymentService.cancel(id);
            alert("Pembayaran dibatalkan!");
            fetchPayments();
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal batal");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Hapus draft pembayaran ini?")) return;
        try {
            await payablePaymentService.delete(id);
            alert("Draft berhasil dihapus");
            fetchPayments();
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal hapus");
        }
    };

    const viewDetail = async (id: number) => {
        try {
            const res = await payablePaymentService.print(id);
            setDetailData(res?.data || res);
            setIsDetailOpen(true);
        } catch (e) {
            console.error(e);
        }
    };

    const handlePrint = (id: number) => {
        const url = payablePaymentService.getPrintUrl(id);
        window.open(url, "_blank");
    };

    const formatCurrency = (amount: number) =>
        `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            draft: "bg-gray-100 text-gray-500 border-gray-200",
            confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
            cancelled: "bg-red-100 text-red-700 border-red-200",
        };
        return (
            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${styles[status]}`}>
                {status}
            </span>
        );
    };

    const showBankFields = ["cash", "bank_transfer", "giro_cek", "credit_card"].includes(form.payment_method);

    return (
        <div className="p-4 md:p-6 space-y-6 bg-gray-50/30 min-h-screen flex flex-col items-stretch max-w-full overflow-hidden">
            {/* Header */}
            <div className="flex-none w-full">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 dark:bg-gray-900 overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shrink-0">
                                <CreditCard className="text-white" size={24} />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-2xl font-black uppercase italic text-gray-800 dark:text-white tracking-tighter truncate">
                                    Account Payment
                                </h1>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest truncate">Pembayaran Hutang — Pembelian</p>
                            </div>
                        </div>
                        <button
                            onClick={openCreate}
                            className="bg-emerald-600 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all shrink-0"
                        >
                            <Plus size={16} className="inline mr-2" /> Buat Draft Pembayaran
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex-none w-full">
                <div className="flex flex-wrap gap-4 items-center">
                    <select
                        value={filterMethod}
                        onChange={(e) => setFilterMethod(e.target.value)}
                        className="bg-white border border-gray-100 p-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-gray-500 outline-none focus:border-emerald-500 transition-all shrink-0"
                    >
                        <option value="">Semua Metode</option>
                        <option value="cash">Cash</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="giro_cek">Giro / Cek</option>
                    </select>
                </div>
            </div>

            {/* Content Area - Isolation using Grid */}
            <div className="grid grid-cols-1 w-full min-w-0 overflow-hidden">
                <div className="rounded-3xl border border-gray-100 bg-white shadow-sm dark:bg-gray-900 overflow-hidden">
                    <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-gray-200">
                        <table className="w-full text-left min-w-[1200px] table-auto">
                            <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                                <tr className="border-b border-gray-100 dark:border-gray-800">
                                    <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-[8px] sm:text-[10px]">No. Payment</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Supplier</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">No. AP</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Metode</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Jumlah</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Status</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Tanggal</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {loading ? (
                                    <tr><td colSpan={8} className="py-20 text-center uppercase tracking-widest text-[10px] font-bold text-gray-300">
                                        <Loader2 className="animate-spin mx-auto mb-2" /> Loading...
                                    </td></tr>
                                ) : payments.filter(p => {
                                    if (!searchTerm) return true;
                                    const supplierName = (p.supplier?.nama || p.supplier?.name || p.account_payable?.supplier?.nama || p.account_payable?.supplier?.name || p.account_payable?.supplier_name || "").toLowerCase();
                                    const paymentNum = (p.payment_number || "").toLowerCase();
                                    return supplierName.includes(searchTerm.toLowerCase()) || paymentNum.includes(searchTerm.toLowerCase());
                                }).length === 0 ? (
                                    <tr><td colSpan={8} className="py-20 text-center uppercase tracking-widest text-[10px] font-bold text-gray-300 italic">
                                        {searchTerm ? "Hasil pencarian tidak ditemukan" : "Belum ada data pembayaran"}
                                    </td></tr>
                                ) : (
                                    payments.filter(p => {
                                        if (!searchTerm) return true;
                                        const supplierName = (p.supplier?.nama || p.supplier?.name || p.account_payable?.supplier?.nama || p.account_payable?.supplier?.name || p.account_payable?.supplier_name || "").toLowerCase();
                                        const paymentNum = (p.payment_number || "").toLowerCase();
                                        return supplierName.includes(searchTerm.toLowerCase()) || paymentNum.includes(searchTerm.toLowerCase());
                                    }).map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-black text-emerald-600 uppercase italic tracking-tighter">{p.payment_number}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                                    {p.supplier?.nama ||
                                                        p.supplier?.name ||
                                                        p.account_payable?.supplier?.nama ||
                                                        p.account_payable?.supplier?.name ||
                                                        p.account_payable?.supplier_name ||
                                                        "—"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-black text-gray-400">{p.account_payable?.payable_number}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{p.payment_method.replace('_', ' ')}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-xs font-black text-gray-800 dark:text-gray-200">{formatCurrency(p.amount)}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {getStatusBadge(p.status)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-bold text-gray-400">
                                                    {p.payment_date ? p.payment_date.split('T')[0] : "—"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    {p.status === 'draft' && (
                                                        <>
                                                            <button onClick={() => handleConfirm(p.id)} title="Confirm" className="p-2 bg-emerald-50 text-emerald-500 hover:bg-emerald-100 rounded-lg"><CheckCircle size={16} /></button>
                                                            <button onClick={() => openEdit(p)} title="Edit" className="p-2 bg-blue-50 text-blue-500 hover:bg-blue-100 rounded-lg"><Edit3 size={16} /></button>
                                                            <button onClick={() => handleDelete(p.id)} title="Delete" className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg"><Trash2 size={16} /></button>
                                                        </>
                                                    )}
                                                    {p.status === 'confirmed' && (
                                                        <>
                                                            <button onClick={() => handlePrint(p.id)} title="Print" className="p-2 bg-indigo-50 text-indigo-500 hover:bg-indigo-100 rounded-lg"><Printer size={16} /></button>
                                                            <button onClick={() => handleCancel(p.id)} title="Cancel" className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg"><XCircle size={16} /></button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create/Edit Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl dark:bg-gray-900 overflow-y-auto max-h-[90vh]">
                        <div className="flex items-center justify-between border-b pb-4 mb-6">
                            <h3 className="text-lg font-black text-gray-800 dark:text-white uppercase italic">
                                {selectedPayment ? "Edit Pembayaran" : "Buat Draft Pembayaran"}
                            </h3>
                            <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-red-500">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Hutang (Account Payable)</label>
                                <select required value={form.account_payable_id}
                                    onChange={(e) => setForm({ ...form, account_payable_id: e.target.value })}
                                    className="w-full p-3 rounded-xl border-2 border-gray-100 text-sm font-bold focus:border-emerald-500 outline-none dark:bg-gray-800">
                                    <option value="">Pilih Hutang...</option>
                                    {unpaidPayables.map((ap: any) => (
                                        <option key={ap.id} value={ap.id}>
                                            {ap.payable_number} — {ap.supplier?.nama || ap.invoice_receipt?.supplier?.nama || ap.invoice_receipt?.purchase_order?.supplier?.nama || "N/A"} ({formatCurrency(ap.remaining_amount)})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Tanggal Bayar</label>
                                <input type="date" required value={form.payment_date}
                                    onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
                                    className="w-full p-3 rounded-xl border-2 border-gray-100 text-sm font-bold focus:border-emerald-500 outline-none dark:bg-gray-800" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Jumlah Bayar</label>
                                <input type="number" required value={form.amount}
                                    onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                                    className="w-full p-3 rounded-xl border-2 border-gray-100 text-sm font-black focus:border-emerald-500 outline-none dark:bg-gray-800" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Metode Pembayaran</label>
                                <select required value={form.payment_method}
                                    onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                                    className="w-full p-3 rounded-xl border-2 border-gray-100 text-sm font-bold focus:border-emerald-500 outline-none dark:bg-gray-800">
                                    <option value="cash">Cash</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="giro_cek">Giro / Cek</option>
                                    <option value="credit_card">Kartu Kredit</option>
                                </select>
                            </div>
                            {showBankFields && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Akun Kas/Bank (Debit)</label>
                                        <select required={showBankFields} value={form.bank_account_id}
                                            onChange={(e) => setForm({ ...form, bank_account_id: e.target.value })}
                                            className="w-full p-3 rounded-xl border-2 border-gray-100 text-sm font-bold focus:border-emerald-500 outline-none dark:bg-gray-800">
                                            <option value="">Pilih Bank Account...</option>
                                            {bankAccounts.map((acc: any) => (
                                                <option key={acc.id} value={acc.id}>{acc.code} — {acc.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">No. Referensi / Cek</label>
                                        <input type="text" value={form.reference_number}
                                            onChange={(e) => setForm({ ...form, reference_number: e.target.value })}
                                            className="w-full p-3 rounded-xl border-2 border-gray-100 text-sm font-bold focus:border-emerald-500 outline-none dark:bg-gray-800"
                                            placeholder="Mis: REF-123 / No. Giro" />
                                    </div>
                                </>
                            )}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Catatan</label>
                                <textarea value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    className="w-full p-3 rounded-xl border-2 border-gray-100 text-sm font-bold focus:border-emerald-500 outline-none dark:bg-gray-800"
                                    rows={2} placeholder="Catatan internal" />
                            </div>
                            <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-2.5 text-xs font-black text-gray-400 uppercase">Batal</button>
                                <button type="submit" className="bg-emerald-600 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase shadow-lg hover:bg-emerald-700 transition-all">
                                    {selectedPayment ? "Update Payment" : "Simpan Draft"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Detail Modal (Journal Entries View) */}
            {isDetailOpen && detailData && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-4xl bg-white rounded-3xl p-6 shadow-2xl dark:bg-gray-900 flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between border-b pb-4 mb-6 shrink-0">
                            <div>
                                <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase italic">{detailData.payment_number}</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Payment Detail & Journal</p>
                            </div>
                            <button onClick={() => setIsDetailOpen(false)} className="text-gray-400 hover:text-red-500">✕</button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase text-emerald-600 tracking-widest border-b pb-1">Info Pembayaran</h4>
                                    <div className="grid grid-cols-2 gap-y-2 text-xs">
                                        <span className="text-gray-400 font-bold uppercase">Supplier</span>
                                        <span className="font-black text-right">
                                            {detailData.account_payable?.supplier?.nama ||
                                                detailData.account_payable?.invoice_receipt?.supplier?.nama ||
                                                detailData.account_payable?.invoice_receipt?.purchase_order?.supplier?.nama ||
                                                "—"}
                                        </span>
                                        <span className="text-gray-400 font-bold uppercase">No. Hutang</span>
                                        <span className="font-bold text-right">{detailData.account_payable?.payable_number}</span>
                                        <span className="text-gray-400 font-bold uppercase">Metode</span>
                                        <span className="font-bold text-right uppercase tracking-wider">{detailData.payment_method}</span>
                                        <span className="text-gray-400 font-bold uppercase text-lg">Jumlah</span>
                                        <span className="font-black text-right text-lg text-emerald-600">{formatCurrency(detailData.amount)}</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase text-blue-600 tracking-widest border-b pb-1">Catatan</h4>
                                    <p className="text-xs text-gray-600 bg-gray-50 p-4 rounded-xl italic">
                                        {detailData.notes || "Tidak ada catatan."}
                                    </p>
                                </div>
                            </div>

                            {detailData.journal && (
                                <div className="rounded-2xl border border-gray-100 overflow-hidden">
                                    <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                                        <h4 className="text-xs font-black uppercase text-gray-600 tracking-wider">Jurnal Otomatis</h4>
                                        <span className="text-[10px] font-black text-indigo-600 uppercase">{detailData.journal.journal_number}</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs min-w-[500px]">
                                            <thead>
                                                <tr className="text-[9px] font-black uppercase text-gray-400 border-b bg-gray-50/20">
                                                    <th className="p-4">Akun</th>
                                                    <th className="p-4 text-right">Debit</th>
                                                    <th className="p-4 text-right">Kredit</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 font-bold">
                                                {detailData.journal.entries?.map((entry: any) => (
                                                    <tr key={entry.id}>
                                                        <td className="p-4">
                                                            <div className="text-gray-800 uppercase tracking-tighter">{entry.account?.name}</div>
                                                            <div className="text-[9px] text-gray-400">{entry.account?.code}</div>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            {entry.type === 'debit' ? (
                                                                <span className="text-blue-600">{formatCurrency(entry.amount)}</span>
                                                            ) : "—"}
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            {entry.type === 'credit' ? (
                                                                <span className="text-red-600">{formatCurrency(entry.amount)}</span>
                                                            ) : "—"}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-4 border-t mt-4 shrink-0">
                            <button onClick={() => setIsDetailOpen(false)} className="px-6 py-2.5 text-xs font-black text-gray-400 uppercase">Tutup</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
