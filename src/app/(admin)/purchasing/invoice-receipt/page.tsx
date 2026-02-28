"use client";
import React, { useEffect, useState } from "react";
import { invoiceReceiptService } from "@/services/invoiceReceiptService";
import { userService } from "@/services/userService";
import {
    FileText, Eye, Send, Check, X, Plus, Loader2, RefreshCw,
    Calendar, DollarSign, ClipboardList, Trash2, Printer
} from "lucide-react";

export default function InvoiceReceiptPage() {
    const [loading, setLoading] = useState(true);
    const [receipts, setReceipts] = useState<any[]>([]);
    const [filterStatus, setFilterStatus] = useState("");
    const [filterStartDate, setFilterStartDate] = useState("");
    const [filterEndDate, setFilterEndDate] = useState("");

    // Create Modal
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [eligiblePOs, setEligiblePOs] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [createForm, setCreateForm] = useState({
        purchase_order_id: "",
        transaction_date: "",
        requester_id: "",
        notes: "",
        invoice_number: "",
        invoice_date: "",
        due_date: ""
    });

    // Detail Modal
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

    // Add Invoice inline
    const [showAddInvoice, setShowAddInvoice] = useState(false);
    const [invoiceForm, setInvoiceForm] = useState({ invoice_number: "", invoice_date: "", due_date: "", amount: "", notes: "" });

    const fetchData = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (filterStatus) params.status = filterStatus;
            if (filterStartDate) params.start_date = filterStartDate;
            if (filterEndDate) params.end_date = filterEndDate;
            const res = await invoiceReceiptService.getAll(params);
            setReceipts(Array.isArray(res) ? res : res?.data || []);
        } catch (error) {
            console.error("Failed to fetch:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [filterStatus, filterStartDate, filterEndDate]);

    const openCreate = async () => {
        try {
            const res = await invoiceReceiptService.getEligiblePOs();
            setEligiblePOs(Array.isArray(res) ? res : res?.data || []);

            const resUsers = await userService.getAllUsers();
            setUsers(Array.isArray(resUsers) ? resUsers : resUsers?.data || []);
        } catch (e) { console.error(e); }
        setCreateForm({
            purchase_order_id: "",
            transaction_date: new Date().toISOString().split("T")[0],
            requester_id: "",
            notes: "",
            invoice_number: "",
            invoice_date: "",
            due_date: ""
        });
        setIsCreateOpen(true);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Get current user id from localStorage
            const userId = localStorage.getItem("userId") || "1";
            await invoiceReceiptService.create({
                purchase_order_id: Number(createForm.purchase_order_id),
                transaction_date: createForm.transaction_date,
                requester_id: Number(createForm.requester_id || userId),
                notes: createForm.notes || undefined,
                invoice_number: createForm.invoice_number,
                invoice_date: createForm.invoice_date,
                due_date: createForm.due_date,
            });
            alert("Tanda Terima Faktur berhasil dibuat!");
            setIsCreateOpen(false);
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal membuat TTF");
        }
    };

    const viewDetail = async (receipt: any) => {
        try {
            const res = await invoiceReceiptService.getById(receipt.id);
            setSelectedReceipt(res?.data || res);
            setIsDetailOpen(true);
            setIsDetailOpen(true);
            // setShowAddInvoice(false); // Removed
        } catch (e) { console.error(e); }
    };

    const handleAddInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await invoiceReceiptService.addInvoice(selectedReceipt.id, {
                invoice_number: invoiceForm.invoice_number,
                invoice_date: invoiceForm.invoice_date,
                due_date: invoiceForm.due_date,
                amount: Number(invoiceForm.amount),
                notes: invoiceForm.notes || undefined,
            });
            alert("Faktur berhasil ditambahkan!");
            setInvoiceForm({ invoice_number: "", invoice_date: "", due_date: "", amount: "", notes: "" });
            setShowAddInvoice(false);
            viewDetail(selectedReceipt);
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal menambah faktur");
        }
    };

    const handleRemoveInvoice = async (invoiceId: number) => {
        if (!confirm("Hapus faktur ini?")) return;
        try {
            await invoiceReceiptService.removeInvoice(selectedReceipt.id, invoiceId);
            viewDetail(selectedReceipt);
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal hapus faktur");
        }
    };

    const handleSubmit = async (id: number) => {
        if (!confirm("Submit TTF ini untuk persetujuan?")) return;
        try {
            await invoiceReceiptService.submit(id);
            alert("TTF berhasil disubmit!");
            fetchData();
            setIsDetailOpen(false);
        } catch (error: any) { alert(error.response?.data?.message || "Gagal submit"); }
    };

    const handleApprove = async (id: number) => {
        if (!confirm("Approve TTF ini?")) return;
        try {
            await invoiceReceiptService.approve(id);
            alert("TTF berhasil diapprove!");
            fetchData();
            setIsDetailOpen(false);
        } catch (error: any) { alert(error.response?.data?.message || "Gagal approve"); }
    };

    const handleReject = async (id: number) => {
        if (!confirm("Reject TTF ini?")) return;
        try {
            await invoiceReceiptService.reject(id);
            alert("TTF ditolak!");
            fetchData();
            setIsDetailOpen(false);
        } catch (error: any) { alert(error.response?.data?.message || "Gagal reject"); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Hapus TTF ini?")) return;
        try {
            await invoiceReceiptService.delete(id);
            alert("TTF berhasil dihapus!");
            fetchData();
        } catch (error: any) { alert(error.response?.data?.message || "Gagal hapus"); }
    };

    const handlePrint = (id: number) => {
        window.open(invoiceReceiptService.getPrintUrl(id), '_blank');
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
        <div className="p-4 md:p-6 space-y-6 bg-gray-50/30 min-h-screen">
            {/* Header */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 dark:bg-gray-900">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
                            <ClipboardList className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black uppercase italic text-gray-800 dark:text-white tracking-tighter">
                                Tanda Terima Faktur
                            </h1>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Invoice Receipt Management</p>
                        </div>
                    </div>
                    <button
                        onClick={openCreate}
                        className="bg-orange-600 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase shadow-lg shadow-orange-100 hover:bg-orange-700 active:scale-95 transition-all"
                    >
                        <Plus size={16} className="inline mr-2" /> Buat TTF Baru
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border-2 border-gray-100 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-orange-500 transition-all dark:bg-gray-800"
                >
                    <option value="">Semua Status</option>
                    <option value="draft">Draft</option>
                    <option value="submitted">Submitted</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
                <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)}
                    className="border-2 border-gray-100 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-orange-500 transition-all dark:bg-gray-800" />
                <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)}
                    className="border-2 border-gray-100 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-orange-500 transition-all dark:bg-gray-800" />
                {(filterStatus || filterStartDate || filterEndDate) && (
                    <button onClick={() => { setFilterStatus(""); setFilterStartDate(""); setFilterEndDate(""); }}
                        className="text-xs font-black text-orange-500 hover:text-orange-700 uppercase">Reset</button>
                )}
            </div>

            {/* Table */}
            <div className="rounded-3xl border border-gray-100 bg-white shadow-sm dark:bg-gray-900 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">No. TTF</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">PO / Supplier</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Jumlah Faktur</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {loading ? (
                                <tr><td colSpan={5} className="py-20 text-center">
                                    <Loader2 className="animate-spin mx-auto text-gray-300 mb-2" />
                                    <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Loading...</span>
                                </td></tr>
                            ) : receipts.length === 0 ? (
                                <tr><td colSpan={5} className="py-20 text-center text-xs font-bold text-gray-300 uppercase tracking-widest">
                                    Belum ada data Tanda Terima Faktur
                                </td></tr>
                            ) : (
                                receipts.map((r) => (
                                    <tr key={r.id} className="hover:bg-gray-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-orange-600 uppercase italic tracking-tighter">{r.receipt_number}</span>
                                            <br /><span className="text-[9px] text-gray-400 font-bold">{r.transaction_date}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{r.purchase_order?.kode || "—"}</span>
                                            <br /><span className="text-[9px] text-gray-400 font-bold">{r.purchase_order?.supplier?.nama || "—"}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-orange-50 text-orange-600 border border-orange-200">
                                                {r.invoices?.length || 0} Faktur
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusBadge(r.status)}`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {r.status === "draft" && (
                                                    <>
                                                        <button onClick={() => handleSubmit(r.id)}
                                                            className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase shadow-lg shadow-blue-100 hover:scale-105 transition-all">
                                                            <Send size={10} /> Submit
                                                        </button>
                                                        <button onClick={() => handleDelete(r.id)}
                                                            className="p-2 bg-red-50 text-red-400 hover:text-red-600 rounded-xl transition-all">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </>
                                                )}
                                                {r.status === "submitted" && (
                                                    <>
                                                        <button onClick={() => handleApprove(r.id)}
                                                            className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase shadow-lg shadow-emerald-100 hover:scale-105 transition-all">
                                                            <Check size={10} /> Approve
                                                        </button>
                                                        <button onClick={() => handleReject(r.id)}
                                                            className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase shadow-lg shadow-red-100 hover:scale-105 transition-all">
                                                            <X size={10} /> Reject
                                                        </button>
                                                    </>
                                                )}
                                                <button onClick={() => viewDetail(r)}
                                                    className="p-2.5 bg-gray-50 text-gray-500 hover:text-orange-600 rounded-xl transition-all">
                                                    <Eye size={18} />
                                                </button>
                                                {r.status === "approved" && (
                                                    <button onClick={() => handlePrint(r.id)}
                                                        className="p-2.5 bg-gray-50 text-gray-500 hover:text-blue-600 rounded-xl transition-all">
                                                        <Printer size={18} />
                                                    </button>
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

            {/* Create Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl dark:bg-gray-900 overflow-y-auto max-h-[90vh]">
                        <div className="flex items-center justify-between border-b pb-4 mb-6">
                            <h3 className="text-lg font-black text-gray-800 dark:text-white uppercase italic">Buat TTF Baru</h3>
                            <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-red-500">✕</button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Purchase Order</label>
                                <select required value={createForm.purchase_order_id}
                                    onChange={(e) => setCreateForm({ ...createForm, purchase_order_id: e.target.value })}
                                    className="w-full p-3 rounded-xl border-2 border-gray-100 text-sm font-bold focus:border-orange-500 outline-none dark:bg-gray-800">
                                    <option value="">Pilih PO...</option>
                                    {eligiblePOs.map((po: any) => (
                                        <option key={po.id} value={po.id}>{po.kode} - {po.supplier?.nama}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Tanggal Transaksi</label>
                                <input type="date" required value={createForm.transaction_date}
                                    onChange={(e) => setCreateForm({ ...createForm, transaction_date: e.target.value })}
                                    className="w-full p-3 rounded-xl border-2 border-gray-100 text-sm font-bold focus:border-orange-500 outline-none dark:bg-gray-800" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Requester (Peminta)</label>
                                <select required value={createForm.requester_id}
                                    onChange={(e) => setCreateForm({ ...createForm, requester_id: e.target.value })}
                                    className="w-full p-3 rounded-xl border-2 border-gray-100 text-sm font-bold focus:border-orange-500 outline-none dark:bg-gray-800">
                                    <option value="">Pilih Requester...</option>
                                    {users.map((u: any) => (
                                        <option key={u.id} value={u.id}>{u.name || u.email}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">No. Faktur Supplier</label>
                                    <input type="text" required value={createForm.invoice_number}
                                        onChange={(e) => setCreateForm({ ...createForm, invoice_number: e.target.value })}
                                        className="w-full p-3 rounded-xl border-2 border-gray-100 text-sm font-bold focus:border-orange-500 outline-none dark:bg-gray-800"
                                        placeholder="Nomor Faktur Fisik" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Tanggal Faktur</label>
                                    <input type="date" required value={createForm.invoice_date}
                                        onChange={(e) => setCreateForm({ ...createForm, invoice_date: e.target.value })}
                                        className="w-full p-3 rounded-xl border-2 border-gray-100 text-sm font-bold focus:border-orange-500 outline-none dark:bg-gray-800" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Jatuh Tempo</label>
                                    <input type="date" required value={createForm.due_date}
                                        onChange={(e) => setCreateForm({ ...createForm, due_date: e.target.value })}
                                        className="w-full p-3 rounded-xl border-2 border-gray-100 text-sm font-bold focus:border-orange-500 outline-none dark:bg-gray-800" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Catatan</label>
                                <textarea value={createForm.notes}
                                    onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                                    className="w-full p-3 rounded-xl border-2 border-gray-100 text-sm font-bold focus:border-orange-500 outline-none dark:bg-gray-800"
                                    rows={2} placeholder="Catatan (opsional)" />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsCreateOpen(false)}
                                    className="px-6 py-2.5 text-xs font-black text-gray-400 uppercase">Batal</button>
                                <button type="submit"
                                    className="bg-orange-600 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase shadow-lg">
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {isDetailOpen && selectedReceipt && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-4xl bg-white rounded-3xl p-6 shadow-2xl dark:bg-gray-900 flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between border-b pb-4 mb-6">
                            <div>
                                <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase italic">{selectedReceipt.receipt_number}</h3>
                                <p className="text-xs text-gray-400 font-bold mt-1">
                                    Status: <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${getStatusBadge(selectedReceipt.status)}`}>
                                        {selectedReceipt.status}
                                    </span>
                                </p>
                            </div>
                            <button onClick={() => setIsDetailOpen(false)} className="text-gray-400 hover:text-red-500">✕</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 dark:bg-orange-900/20">
                                <p className="text-[9px] font-black text-gray-400 uppercase mb-1">PO Reference</p>
                                <p className="text-sm font-black">{selectedReceipt.purchase_order?.kode}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 dark:bg-gray-800">
                                <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Supplier</p>
                                <p className="text-sm font-bold">{selectedReceipt.purchase_order?.supplier?.nama}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 dark:bg-gray-800">
                                <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Tanggal</p>
                                <p className="text-sm font-bold">{selectedReceipt.transaction_date}</p>
                            </div>
                        </div>





                        <div className="flex-1 overflow-y-auto rounded-2xl border border-gray-100 dark:border-gray-800 mb-6">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-gray-50 sticky top-0 dark:bg-gray-800">
                                    <tr className="text-[9px] font-black uppercase text-gray-400">
                                        <th className="p-4">No. Faktur</th>
                                        <th className="p-4">Tgl Faktur</th>
                                        <th className="p-4">Jatuh Tempo</th>
                                        <th className="p-4 text-right">Jumlah</th>
                                        <th className="p-4">Jumlah (Auto)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                    {(selectedReceipt.invoices || []).length === 0 ? (
                                        <tr><td colSpan={5} className="p-8 text-center text-xs text-gray-300 font-bold uppercase">Belum ada faktur</td></tr>
                                    ) : (
                                        selectedReceipt.invoices.map((inv: any) => (
                                            <tr key={inv.id}>
                                                <td className="p-4 font-bold text-gray-700">{inv.invoice_number}</td>
                                                <td className="p-4 text-gray-500">{inv.invoice_date}</td>
                                                <td className="p-4 text-gray-500">{inv.due_date}</td>
                                                <td className="p-4 text-right font-black text-orange-600">
                                                    Rp {Number(inv.amount || 0).toLocaleString()}
                                                </td>

                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary */}
                        {selectedReceipt.invoices?.length > 0 && (
                            <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 mb-4 flex items-center justify-between">
                                <span className="text-xs font-black text-gray-500 uppercase">Total Faktur</span>
                                <span className="text-lg font-black text-orange-600">
                                    Rp {selectedReceipt.invoices.reduce((sum: number, inv: any) => sum + Number(inv.amount || 0), 0).toLocaleString()}
                                </span>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button onClick={() => setIsDetailOpen(false)} className="px-6 py-2.5 text-xs font-black text-gray-400 uppercase">Tutup</button>
                            {selectedReceipt.status === "draft" && (
                                <button onClick={() => handleSubmit(selectedReceipt.id)}
                                    className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase flex items-center gap-2">
                                    <Send size={16} /> Submit
                                </button>
                            )}
                            {selectedReceipt.status === "submitted" && (
                                <>
                                    <button onClick={() => handleApprove(selectedReceipt.id)}
                                        className="bg-emerald-600 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase flex items-center gap-2">
                                        <Check size={16} /> Approve
                                    </button>
                                    <button onClick={() => handleReject(selectedReceipt.id)}
                                        className="bg-red-600 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase flex items-center gap-2">
                                        <X size={16} /> Reject
                                    </button>
                                </>
                            )}
                            {selectedReceipt.status === "approved" && (
                                <button onClick={() => handlePrint(selectedReceipt.id)}
                                    className="bg-gray-800 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase flex items-center gap-2 shadow-lg shadow-gray-200 hover:scale-105 transition-all">
                                    <Printer size={16} /> Print PDF
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
