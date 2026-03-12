"use client";
import React, { useEffect, useState } from "react";
import { salesInvoiceService } from "@/services/salesInvoiceService";
import Button from "../ui/button/Button";
import SalesInvoiceModal from "../modals/SalesInvoiceModal";
import CustomerLedgerModal from "../modals/CustomerLedgerModal";
import * as Icons from "lucide-react";

export default function SalesInvoiceTable() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

    // Ledger Modal state
    const [isLedgerOpen, setIsLedgerOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await salesInvoiceService.getAll();
            const dataArray = res.data?.data || res.data || [];
            setInvoices(Array.isArray(dataArray) ? dataArray : []);
        } catch (error) {
            console.error("Gagal memuat data Invoice:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async (payload: any) => {
        try {
            if (selectedInvoice) {
                await salesInvoiceService.update(selectedInvoice.id, payload);
            } else {
                await salesInvoiceService.store(payload);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal menyimpan data Invoice.");
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Apakah Anda yakin ingin menghapus Invoice ini ke sampah?")) {
            try {
                await salesInvoiceService.delete(id);
                fetchData();
            } catch (error: any) {
                alert(error.response?.data?.message || "Gagal menghapus data.");
            }
        }
    };

    const handlePayRemainder = async (id: number, balance: number) => {
        if (confirm(`Lunasi sisa pembayaran sebesar Rp ${Number(balance).toLocaleString('id-ID')}?`)) {
            try {
                await salesInvoiceService.payRemainder(id);
                fetchData();
            } catch (error: any) {
                alert(error.response?.data?.message || "Gagal memproses pembayaran.");
            }
        }
    };

    const handleReturnGallon = async (id: number) => {
        if (confirm("Konfirmasi pengembalian galon kosong untuk transaksi ini?")) {
            try {
                await salesInvoiceService.returnGallon(id);
                alert("Status pengembalian galon berhasil diperbarui.");
                fetchData();
            } catch (error: any) {
                alert(error.response?.data?.message || "Gagal memproses retur galon.");
            }
        }
    };

    const handlePrintPdf = async (id: number, invNumber: string) => {
        try {
            const blob = await salesInvoiceService.downloadPdf(id);

            // Periksa jika blob sebenarnya adalah JSON error (dari backend)
            if (blob.type === 'application/json') {
                const text = await blob.text();
                const errorData = JSON.parse(text);
                throw new Error(errorData.message || "Gagal mengunduh PDF: Terjadi kesalahan pada server.");
            }

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice-${invNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error("Download PDF Gagal:", error);
            const message = error.message || "Gagal mengunduh file PDF.";
            alert(message);
        }
    };

    const openCreateModal = () => {
        setSelectedInvoice(null);
        setIsModalOpen(true);
    };

    const openEditModal = (inv: any) => {
        setSelectedInvoice(inv);
        setIsModalOpen(true);
    };

    const openLedger = (customer: any) => {
        setSelectedCustomer(customer);
        setIsLedgerOpen(true);
    };

    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            draft: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400",
            partial: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/10 dark:text-blue-400",
            paid: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400",
            cancelled: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400",
        };

        return (
            <div className={`inline-flex px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-dashed justify-center w-fit ${styles[status] || "bg-gray-100 text-gray-600"}`}>
                {status || 'N/A'}
            </div>
        );
    };

    if (loading) return <div className="p-10 text-center text-gray-500 animate-pulse font-bold uppercase tracking-widest">Sinkronisasi Data Tagihan...</div>;

    return (
        <div className="w-full max-w-full rounded-3xl border border-gray-100 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between p-8 gap-6 border-b border-gray-50 dark:border-gray-800 bg-gradient-to-r from-blue-600/5 to-transparent">
                <div>
                    <h3 className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-3">
                        <Icons.FileText className="w-8 h-8 text-blue-600" />
                        Invoice Penjualan
                    </h3>
                    <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-[0.2em] opacity-70">Manajemen Piutang & Invoice Konsumen</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={openCreateModal} className="shadow-2xl shadow-blue-500/30 rounded-full px-8 py-3 bg-blue-600 hover:bg-blue-700">
                        <Icons.PlusCircle className="w-5 h-5 mr-2" /> Terbitkan Invoice
                    </Button>
                </div>
            </div>

            <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                        <tr className="bg-gray-50/50 dark:bg-white/5">
                            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Doc Info</th>
                            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Reference</th>
                            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer Context</th>
                            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Financial Summary</th>
                            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Manajemen</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {invoices.length > 0 ? (
                            invoices.map((inv: any) => (
                                <tr key={inv.id} className="group hover:bg-gray-50/80 dark:hover:bg-white/5 transition-all">
                                    <td className="px-6 py-5">
                                        <div className="text-sm font-black text-gray-800 dark:text-white font-mono tracking-tighter">{inv.no_invoice}</div>
                                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold mt-1 uppercase">
                                            <Icons.Calendar className="w-3.5 h-3.5 opacity-50" />
                                            {new Date(inv.tanggal).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full uppercase tracking-tighter">
                                                SPK: {inv.sales_order?.no_spk || "-"}
                                            </div>
                                            <div className="text-[9px] font-bold text-gray-400 italic">
                                                {inv.payment_type === 'dp' ? 'Down Payment Flow' : 'Full Payment Flow'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20">
                                                <Icons.User className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-gray-900 dark:text-white">{inv.customer?.name || "N/A"}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="space-y-1">
                                            <div className="text-sm font-black text-gray-900 dark:text-white">
                                                Rp {Number(inv.final_amount || inv.total_price).toLocaleString('id-ID')}
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {inv.ppn_amount > 0 && (
                                                    <span className="text-[9px] font-black text-rose-500 bg-rose-50 dark:bg-rose-950/30 px-1.5 py-0.5 rounded border border-rose-100 dark:border-rose-900/50 uppercase">PPN 11%</span>
                                                )}
                                                {inv.pph_amount > 0 && (
                                                    <span className="text-[9px] font-black text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-100 dark:border-amber-900/50 uppercase">PPh 2%</span>
                                                )}
                                            </div>
                                            {inv.balance_due > 0 ? (
                                                <div className="text-[10px] font-black text-orange-600 flex items-center gap-1 mt-2 uppercase">
                                                    <Icons.AlertCircle className="w-3 h-3" /> Sisa: Rp {Number(inv.balance_due).toLocaleString('id-ID')}
                                                </div>
                                            ) : (
                                                <div className="text-[10px] font-black text-emerald-600 flex items-center gap-1 mt-2 uppercase tracking-tighter shadow-sm w-fit bg-emerald-50 px-2 py-0.5 rounded">
                                                    <Icons.CheckCircle2 className="w-3 h-3" /> Full Paid
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">{statusBadge(inv.status)}</td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end gap-1.5 opacity-40 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => handlePrintPdf(inv.id, inv.no_invoice)}
                                                className="p-2.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all hover:scale-110 active:scale-95 shadow-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                                                title="Print Invoice"
                                            >
                                                <Icons.Printer className="w-4 h-4" />
                                            </button>

                                            {(inv.status === 'draft' || inv.status === 'partial') && (
                                                <button
                                                    onClick={() => handlePayRemainder(inv.id, inv.balance_due)}
                                                    className="p-2.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-xl transition-all hover:scale-110 active:scale-95 shadow-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                                                    title="Proses Pelunasan"
                                                >
                                                    <Icons.CheckCircle2 className="w-4 h-4" />
                                                </button>
                                            )}

                                            {inv.gallon_deposit_status === 'loaned' && (
                                                <button
                                                    onClick={() => handleReturnGallon(inv.id)}
                                                    className="p-2.5 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-xl transition-all hover:scale-110 active:scale-95 shadow-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                                                    title="Retur Galon Pinjaman"
                                                >
                                                    <Icons.RotateCcw className="w-4 h-4" />
                                                </button>
                                            )}

                                            {inv.status !== 'paid' && (
                                                <>
                                                    <button
                                                        onClick={() => openEditModal(inv)}
                                                        className="p-2.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all hover:scale-110 active:scale-95 shadow-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                                                        title="Edit Header"
                                                    >
                                                        <Icons.Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(inv.id)}
                                                        className="p-2.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all hover:scale-110 active:scale-95 shadow-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                                                        title="Delete (Trash)"
                                                    >
                                                        <Icons.Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="p-32 text-center">
                                    <div className="flex flex-col items-center justify-center gap-4 opacity-30">
                                        <div className="w-20 h-20 rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center">
                                            <Icons.Inbox className="w-10 h-10" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-black text-gray-500 uppercase tracking-widest">Database Kosong</p>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Belum ada invoice yang terdaftar sistem.</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <SalesInvoiceModal
                isOpen={isModalOpen}
                initialData={selectedInvoice}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
            />

            <CustomerLedgerModal
                isOpen={isLedgerOpen}
                customer={selectedCustomer}
                onClose={() => setIsLedgerOpen(false)}
            />
        </div>
    );
}


