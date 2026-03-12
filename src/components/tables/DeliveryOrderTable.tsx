"use client";
import React, { useEffect, useState } from "react";
import { deliveryOrderService } from "@/services/deliveryOrderService";
import Button from "../ui/button/Button";
import DeliveryOrderModal from "../modals/DeliveryOrderModal";
import { Edit, Trash, Send, CheckCircle } from "lucide-react";

export default function DeliveryOrderTable() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await deliveryOrderService.getAll();
            setOrders(res.data?.data || res.data || []);
        } catch (error) {
            console.error("Gagal memuat data Surat Jalan:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async (payload: any) => {
        try {
            if (selectedOrder) {
                await deliveryOrderService.update(selectedOrder.id, payload);
            } else {
                await deliveryOrderService.store(payload);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error: any) {
            const msg = error.response?.data?.message || "Gagal menyimpan data Surat Jalan.";
            alert(msg);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Apakah Anda yakin ingin menghapus Surat Jalan ini?")) {
            try {
                await deliveryOrderService.delete(id);
                fetchData();
            } catch (error: any) {
                alert(error.response?.data?.message || "Gagal menghapus data.");
            }
        }
    };

    const handleSend = async (id: number) => {
        if (confirm("Kirim pesanan sekarang? (Akan mengurangi stok)")) {
            try {
                await deliveryOrderService.sendOrder(id);
                fetchData();
            } catch (error: any) {
                alert(error.response?.data?.message || "Gagal mengirim pesanan.");
            }
        }
    }

    const handleConfirmReceived = async (id: number) => {
        if (confirm("Konfirmasi pesanan telah diterima oleh customer?")) {
            try {
                await deliveryOrderService.confirmReceived(id);
                fetchData();
            } catch (error: any) {
                alert(error.response?.data?.message || "Gagal mengkonfirmasi penerimaan.");
            }
        }
    }


    const openCreateModal = () => {
        setSelectedOrder(null);
        setIsModalOpen(true);
    };

    const openEditModal = (order: any) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
            shipped: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
            received: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
            cancelled: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${styles[status] || "bg-gray-100 text-gray-600"}`}>
                {status.replace('_', ' ')}
            </span>
        );
    };

    if (loading) return <div className="p-10 text-center">Memuat data Surat Jalan...</div>;

    return (
        <div className="w-full max-w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold">Surat Jalan (Delivery Order)</h3>
                <Button onClick={openCreateModal} size="sm">+ Buat Surat Jalan</Button>
            </div>

            <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead className="bg-gray-50/50 dark:bg-white/5">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">No. SJ</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Ref SPK</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Tgl Kirim</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Input By</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {orders.length > 0 ? (
                            orders.map((doItem: any) => (
                                <tr key={doItem.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-sm font-mono font-medium">{doItem.no_sj}</td>
                                    <td className="px-6 py-4 text-sm font-semibold">
                                        <div className="text-blue-600">{doItem.salesOrder?.no_spk || "-"}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                        {new Date(doItem.tanggal).toLocaleDateString("id-ID")}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                        {doItem.creator?.name || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm">{statusBadge(doItem.status)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 items-center">
                                            {doItem.status === 'draft' && (
                                                <button onClick={() => handleSend(doItem.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1" title="Kirim Surat Jalan">
                                                    <Send className="w-4 h-4" /> <span className="text-xs font-semibold">Kirim</span>
                                                </button>
                                            )}
                                            {doItem.status === 'shipped' && (
                                                <button onClick={() => handleConfirmReceived(doItem.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-1" title="Konfirmasi Diterima">
                                                    <CheckCircle className="w-4 h-4" /> <span className="text-xs font-semibold">Diterima</span>
                                                </button>
                                            )}
                                            {(doItem.status === 'draft' || doItem.status === 'cancelled') && (
                                                <button onClick={() => openEditModal(doItem)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                            )}
                                            {(doItem.status === 'draft' || doItem.status === 'cancelled') && (
                                                <button onClick={() => handleDelete(doItem.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={6} className="p-10 text-center text-gray-400">Belum ada data Surat Jalan.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <DeliveryOrderModal
                isOpen={isModalOpen}
                initialData={selectedOrder}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
            />
        </div>
    );
}
