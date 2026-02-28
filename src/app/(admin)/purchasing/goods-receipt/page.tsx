"use client";
import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { goodsReceiptService } from "@/services/goodsReceiptService";
import GoodsReceiptModal from "@/components/modals/GoodsReceiptModal";
import {
    Eye,
    Package,
    CheckCircle,
    Clock,
    Loader2,
    Plus,
    Send,
    Calendar,
    Warehouse,
    FileText,
} from "lucide-react";

export default function GoodsReceiptPage() {
    const [loading, setLoading] = useState(true);
    const [receipts, setReceipts] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

    // Filter states
    const [filterStatus, setFilterStatus] = useState("");
    const [filterStartDate, setFilterStartDate] = useState("");
    const [filterEndDate, setFilterEndDate] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (filterStatus) params.status = filterStatus;
            if (filterStartDate) params.start_date = filterStartDate;
            if (filterEndDate) params.end_date = filterEndDate;

            const res = await goodsReceiptService.getAll(params);
            const data = Array.isArray(res) ? res : res.data || [];
            setReceipts(data);
        } catch (error) {
            console.error("Gagal fetch Goods Receipts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filterStatus, filterStartDate, filterEndDate]);

    const handlePostReceipt = async (id: number) => {
        if (!confirm("Post Goods Receipt ini? Stock akan diupdate ke warehouse.")) return;
        try {
            await goodsReceiptService.post(id);
            alert("Goods Receipt berhasil diposting! Stock telah diupdate.");
            setIsDetailModalOpen(false);
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal posting Goods Receipt");
        }
    };

    const handleViewDetail = async (receipt: any) => {
        try {
            const res = await goodsReceiptService.getById(receipt.id);
            const data = res.data || res;
            setSelectedReceipt(data);
            setIsDetailModalOpen(true);
        } catch (error) {
            console.error("Gagal fetch detail:", error);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: any = {
            draft: "bg-gray-100 text-gray-400",
            posted: "bg-emerald-100 text-emerald-600",
            cancelled: "bg-red-100 text-red-600",
        };
        return styles[status] || "bg-gray-100";
    };

    return (
        <div className="p-4 md:p-6 space-y-6 bg-gray-50/30 min-h-screen">
            <PageBreadcrumb pageName="Goods Receipt (Penerimaan Barang)" />

            {/* Filter & Action Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="border-2 border-gray-100 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-blue-500 transition-all dark:bg-gray-800"
                    >
                        <option value="">Semua Status</option>
                        <option value="draft">Draft</option>
                        <option value="posted">Posted</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    <input
                        type="date"
                        value={filterStartDate}
                        onChange={(e) => setFilterStartDate(e.target.value)}
                        className="border-2 border-gray-100 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-blue-500 transition-all dark:bg-gray-800"
                        placeholder="Dari Tanggal"
                    />

                    <input
                        type="date"
                        value={filterEndDate}
                        onChange={(e) => setFilterEndDate(e.target.value)}
                        className="border-2 border-gray-100 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-blue-500 transition-all dark:bg-gray-800"
                        placeholder="Sampai Tanggal"
                    />

                    {(filterStatus || filterStartDate || filterEndDate) && (
                        <button
                            onClick={() => {
                                setFilterStatus("");
                                setFilterStartDate("");
                                setFilterEndDate("");
                            }}
                            className="text-xs font-black text-red-500 hover:text-red-700 uppercase"
                        >
                            Reset Filter
                        </button>
                    )}
                </div>

                {/* Create Button */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
                >
                    <Plus size={16} className="inline mr-2" /> Buat Penerimaan Baru
                </button>
            </div>

            {/* Table */}
            <div className="rounded-3xl border border-gray-100 bg-white shadow-sm dark:bg-gray-900 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                    Identitas
                                </th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                    PO Reference
                                </th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                    Warehouse
                                </th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">
                                    Status
                                </th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <Loader2 className="animate-spin mx-auto text-gray-300 mb-2" />
                                        <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">
                                            Loading...
                                        </span>
                                    </td>
                                </tr>
                            ) : receipts.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-20 text-center text-xs font-bold text-gray-300 uppercase tracking-widest"
                                    >
                                        Belum ada data penerimaan barang
                                    </td>
                                </tr>
                            ) : (
                                receipts.map((receipt) => (
                                    <tr key={receipt.id} className="hover:bg-gray-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-blue-600 uppercase italic tracking-tighter">
                                                    {receipt.receipt_number}
                                                </span>
                                                <span className="text-[9px] text-gray-400 font-bold uppercase">
                                                    {receipt.receipt_date}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-gray-700 dark:text-gray-300">
                                            {receipt.po_reference || receipt.purchase_order?.kode || "—"}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-gray-700 dark:text-gray-300">
                                            {receipt.warehouse?.name || "—"}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span
                                                className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusBadge(
                                                    receipt.status
                                                )}`}
                                            >
                                                {receipt.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {receipt.status === "draft" && (
                                                    <button
                                                        onClick={() => handlePostReceipt(receipt.id)}
                                                        className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase shadow-lg shadow-emerald-100 hover:scale-105 transition-all"
                                                    >
                                                        <Send size={10} /> Post
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleViewDetail(receipt)}
                                                    className="p-2.5 bg-gray-50 text-gray-400 hover:text-blue-600 rounded-xl transition-all"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {isDetailModalOpen && selectedReceipt && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-4xl bg-white rounded-3xl p-6 shadow-2xl dark:bg-gray-900 flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between border-b pb-4 mb-6">
                            <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase italic">
                                {selectedReceipt.receipt_number}
                            </h3>
                            <button
                                onClick={() => setIsDetailModalOpen(false)}
                                className="text-gray-400 hover:text-red-500"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-4 dark:bg-gray-800">
                                <FileText className="text-blue-600" size={24} />
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase">PO Reference</p>
                                    <p className="text-sm font-black uppercase">{selectedReceipt.po_reference}</p>
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-4 dark:bg-gray-800">
                                <Warehouse className="text-emerald-600" size={24} />
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase">Warehouse</p>
                                    <p className="text-sm font-black">{selectedReceipt.warehouse?.name}</p>
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-4 dark:bg-gray-800">
                                <Calendar className="text-purple-600" size={24} />
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase">Receipt Date</p>
                                    <p className="text-sm font-black">{selectedReceipt.receipt_date}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto rounded-2xl border border-gray-100 dark:border-gray-800 mb-6">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-gray-50 sticky top-0 dark:bg-gray-800">
                                    <tr className="text-[9px] font-black uppercase text-gray-400">
                                        <th className="p-5">Barang</th>
                                        <th className="p-5 text-center">Qty Ordered</th>
                                        <th className="p-5 text-center">Qty Received</th>
                                        <th className="p-5">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                    {selectedReceipt.items?.map((item: any) => (
                                        <tr key={item.id}>
                                            <td className="p-5 font-bold text-gray-700 dark:text-gray-300">
                                                {item.raw_material?.name || item.product?.name}
                                            </td>
                                            <td className="p-5 text-center font-black text-blue-600">
                                                {item.quantity_ordered} {item.unit?.name}
                                            </td>
                                            <td className="p-5 text-center font-black text-emerald-600">
                                                {item.quantity_received} {item.unit?.name}
                                            </td>
                                            <td className="p-5 text-gray-500 text-xs">{item.notes || "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t">
                            <button
                                onClick={() => setIsDetailModalOpen(false)}
                                className="px-6 py-2.5 text-xs font-black text-gray-400 uppercase"
                            >
                                Tutup
                            </button>
                            {selectedReceipt.status === "draft" && (
                                <button
                                    onClick={() => handlePostReceipt(selectedReceipt.id)}
                                    className="bg-emerald-600 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase flex items-center gap-2"
                                >
                                    <Send size={16} /> Post Receipt
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <GoodsReceiptModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={fetchData}
            />
        </div>
    );
}
