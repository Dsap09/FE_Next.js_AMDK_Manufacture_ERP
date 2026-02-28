"use client";
import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { purchaseReturnService } from "@/services/purchaseReturnService";
import PurchaseReturnModal from "@/components/modals/PurchaseReturnModal";
import {
    Eye,
    RotateCcw,
    Send,
    Check,
    X,
    Zap,
    CheckCircle,
    Loader2,
    Plus,
    AlertCircle,
} from "lucide-react";

export default function PurchaseReturnPage() {
    const [loading, setLoading] = useState(true);
    const [returns, setReturns] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState<any>(null);

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

            const res = await purchaseReturnService.getAll(params);
            const data = Array.isArray(res) ? res : res.data || [];
            setReturns(data);
        } catch (error) {
            console.error("Gagal fetch Purchase Returns:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filterStatus, filterStartDate, filterEndDate]);

    // Workflow Actions
    const handleSubmit = async (id: number) => {
        if (!confirm("Submit retur ini untuk persetujuan supplier?")) return;
        try {
            await purchaseReturnService.submit(id);
            alert("Retur berhasil disubmit!");
            fetchData();
            setIsDetailModalOpen(false);
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal submit retur");
        }
    };

    const handleApprove = async (id: number) => {
        if (!confirm("Approve retur ini?")) return;
        try {
            await purchaseReturnService.approve(id);
            alert("Retur berhasil diapprove!");
            fetchData();
            setIsDetailModalOpen(false);
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal approve retur");
        }
    };

    const handleReject = async (id: number) => {
        if (!confirm("Reject retur ini?")) return;
        try {
            await purchaseReturnService.reject(id);
            alert("Retur ditolak!");
            fetchData();
            setIsDetailModalOpen(false);
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal reject retur");
        }
    };

    const handleRealize = async (id: number) => {
        if (!confirm("Realisasi retur ini? Stock akan dikurangi dari warehouse.")) return;
        try {
            await purchaseReturnService.realize(id);
            alert("Retur berhasil direalisasi! Stock telah dikurangi.");
            fetchData();
            setIsDetailModalOpen(false);
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal realize retur");
        }
    };

    const handleComplete = async (id: number) => {
        if (!confirm("Tandai retur ini sebagai selesai?")) return;
        try {
            await purchaseReturnService.complete(id);
            alert("Retur selesai!");
            fetchData();
            setIsDetailModalOpen(false);
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal complete retur");
        }
    };

    const handleViewDetail = async (returnItem: any) => {
        try {
            const res = await purchaseReturnService.getById(returnItem.id);
            const data = res.data || res;
            setSelectedReturn(data);
            setIsDetailModalOpen(true);
        } catch (error) {
            console.error("Gagal fetch detail:", error);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: any = {
            draft: "bg-gray-100 text-gray-400",
            pending: "bg-blue-100 text-blue-600",
            approved: "bg-emerald-100 text-emerald-600",
            rejected: "bg-red-100 text-red-600",
            realized: "bg-purple-100 text-purple-600",
            completed: "bg-green-100 text-green-600",
        };
        return styles[status] || "bg-gray-100";
    };

    return (
        <div className="p-4 md:p-6 space-y-6 bg-gray-50/30 min-h-screen">
            <PageBreadcrumb pageName="Purchase Return (Retur Pembelian)" />

            {/* Filter & Action Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="border-2 border-gray-100 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-red-500 transition-all dark:bg-gray-800"
                    >
                        <option value="">Semua Status</option>
                        <option value="draft">Draft</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="realized">Realized</option>
                        <option value="completed">Completed</option>
                    </select>

                    <input
                        type="date"
                        value={filterStartDate}
                        onChange={(e) => setFilterStartDate(e.target.value)}
                        className="border-2 border-gray-100 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-red-500 transition-all dark:bg-gray-800"
                        placeholder="Dari Tanggal"
                    />

                    <input
                        type="date"
                        value={filterEndDate}
                        onChange={(e) => setFilterEndDate(e.target.value)}
                        className="border-2 border-gray-100 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-red-500 transition-all dark:bg-gray-800"
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
                    className="bg-red-600 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase shadow-lg shadow-red-100 hover:bg-red-700 active:scale-95 transition-all"
                >
                    <Plus size={16} className="inline mr-2" /> Buat Retur Baru
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
                                    PO / Supplier
                                </th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                    Alasan
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
                            ) : returns.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-20 text-center text-xs font-bold text-gray-300 uppercase tracking-widest"
                                    >
                                        Belum ada data retur pembelian
                                    </td>
                                </tr>
                            ) : (
                                returns.map((returnItem) => {
                                    const isDraft = returnItem.status === "draft";
                                    const isPending = returnItem.status === "pending";
                                    const isApproved = returnItem.status === "approved";
                                    const isRealized = returnItem.status === "realized";

                                    return (
                                        <tr key={returnItem.id} className="hover:bg-gray-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-red-600 uppercase italic tracking-tighter">
                                                        {returnItem.return_number}
                                                    </span>
                                                    <span className="text-[9px] text-gray-400 font-bold uppercase">
                                                        {returnItem.return_date}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                                        {returnItem.purchase_order?.kode || "—"}
                                                    </span>
                                                    <span className="text-[9px] text-gray-400 font-bold">
                                                        {returnItem.purchase_order?.supplier?.nama || "—"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-600 dark:text-gray-400">
                                                {returnItem.reason?.substring(0, 50)}
                                                {returnItem.reason?.length > 50 ? "..." : ""}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span
                                                    className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusBadge(
                                                        returnItem.status
                                                    )}`}
                                                >
                                                    {returnItem.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {isDraft && (
                                                        <button
                                                            onClick={() => handleSubmit(returnItem.id)}
                                                            className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase shadow-lg shadow-blue-100 hover:scale-105 transition-all"
                                                        >
                                                            <Send size={10} /> Submit
                                                        </button>
                                                    )}

                                                    {isPending && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(returnItem.id)}
                                                                className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase shadow-lg shadow-emerald-100 hover:scale-105 transition-all"
                                                            >
                                                                <Check size={10} /> Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(returnItem.id)}
                                                                className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase shadow-lg shadow-red-100 hover:scale-105 transition-all"
                                                            >
                                                                <X size={10} /> Reject
                                                            </button>
                                                        </>
                                                    )}

                                                    {isApproved && (
                                                        <button
                                                            onClick={() => handleRealize(returnItem.id)}
                                                            className="flex items-center gap-1.5 bg-purple-600 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase shadow-lg shadow-purple-100 hover:scale-105 transition-all"
                                                        >
                                                            <Zap size={10} /> Realize
                                                        </button>
                                                    )}

                                                    {isRealized && (
                                                        <button
                                                            onClick={() => handleComplete(returnItem.id)}
                                                            className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase shadow-lg shadow-green-100 hover:scale-105 transition-all"
                                                        >
                                                            <CheckCircle size={10} /> Complete
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => handleViewDetail(returnItem)}
                                                        className="p-2.5 bg-gray-50 text-gray-400 hover:text-red-600 rounded-xl transition-all"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {isDetailModalOpen && selectedReturn && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-4xl bg-white rounded-3xl p-6 shadow-2xl dark:bg-gray-900 flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between border-b pb-4 mb-6">
                            <div>
                                <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase italic">
                                    {selectedReturn.return_number}
                                </h3>
                                <p className="text-xs text-gray-400 font-bold mt-1">
                                    Status:{" "}
                                    <span
                                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${getStatusBadge(
                                            selectedReturn.status
                                        )}`}
                                    >
                                        {selectedReturn.status}
                                    </span>
                                </p>
                            </div>
                            <button
                                onClick={() => setIsDetailModalOpen(false)}
                                className="text-gray-400 hover:text-red-500"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 dark:bg-red-900/20">
                                <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Alasan Retur</p>
                                <p className="text-sm font-bold text-red-600">{selectedReturn.reason}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 dark:bg-gray-800">
                                <p className="text-[9px] font-black text-gray-400 uppercase mb-1">PO Reference</p>
                                <p className="text-sm font-black">{selectedReturn.purchase_order?.kode}</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto rounded-2xl border border-gray-100 dark:border-gray-800 mb-6">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-gray-50 sticky top-0 dark:bg-gray-800">
                                    <tr className="text-[9px] font-black uppercase text-gray-400">
                                        <th className="p-5">Barang</th>
                                        <th className="p-5 text-center">Qty Return</th>
                                        <th className="p-5">Alasan</th>
                                        <th className="p-5">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                    {selectedReturn.items?.map((item: any) => (
                                        <tr key={item.id}>
                                            <td className="p-5 font-bold text-gray-700 dark:text-gray-300">
                                                {item.raw_material?.name || item.product?.name}
                                            </td>
                                            <td className="p-5 text-center font-black text-red-600">
                                                {item.quantity_return} {item.unit?.name}
                                            </td>
                                            <td className="p-5 text-gray-600 text-xs">{item.reason || "—"}</td>
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

                            {selectedReturn.status === "draft" && (
                                <button
                                    onClick={() => handleSubmit(selectedReturn.id)}
                                    className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase flex items-center gap-2"
                                >
                                    <Send size={16} /> Submit
                                </button>
                            )}

                            {selectedReturn.status === "pending" && (
                                <>
                                    <button
                                        onClick={() => handleApprove(selectedReturn.id)}
                                        className="bg-emerald-600 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase flex items-center gap-2"
                                    >
                                        <Check size={16} /> Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(selectedReturn.id)}
                                        className="bg-red-600 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase flex items-center gap-2"
                                    >
                                        <X size={16} /> Reject
                                    </button>
                                </>
                            )}

                            {selectedReturn.status === "approved" && (
                                <button
                                    onClick={() => handleRealize(selectedReturn.id)}
                                    className="bg-purple-600 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase flex items-center gap-2"
                                >
                                    <Zap size={16} /> Realize
                                </button>
                            )}

                            {selectedReturn.status === "realized" && (
                                <button
                                    onClick={() => handleComplete(selectedReturn.id)}
                                    className="bg-green-600 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase flex items-center gap-2"
                                >
                                    <CheckCircle size={16} /> Complete
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <PurchaseReturnModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={fetchData}
            />
        </div>
    );
}
