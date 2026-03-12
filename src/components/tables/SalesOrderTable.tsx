"use client";
import React, { useEffect, useState } from "react";
import { salesOrderService } from "@/services/salesOrderService";
import Button from "../ui/button/Button";
import SalesOrderModal from "../modals/SalesOrderModal";
import * as Icons from "lucide-react";
const { Edit, Trash, FileText } = Icons;

export default function SalesOrderTable() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await salesOrderService.getAll();
            setOrders(Array.isArray(res.data) ? res.data : res.data?.data || res.data || []);
        } catch (error) {
            console.error("Gagal memuat data SPK:", error);
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
                await salesOrderService.update(selectedOrder.id, payload);
            } else {
                await salesOrderService.store(payload);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal menyimpan data.");
        }
    };

    const handleUpdateStatus = async (id: number, newStatus: string) => {
        try {
            setUpdatingStatusId(`${id}-${newStatus}`);
            await salesOrderService.update(id, { status: newStatus });
            await fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal mengubah status.");
        } finally {
            setUpdatingStatusId(null);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Apakah Anda yakin ingin menghapus SPK ini?")) {
            try {
                await salesOrderService.delete(id);
                fetchData();
            } catch (error: any) {
                alert(error.response?.data?.message || "Gagal menghapus data.");
            }
        }
    };

    const handlePrintPdf = async (id: number, noSpk: string) => {
        try {
            const blob = await salesOrderService.printPdf(id);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${noSpk}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (error) {
            console.error("Failed to print PDF", error);
            alert("Gagal mengunduh PDF");
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

    const statusBadge = (order: any) => {
        const status = (order.status || "").toLowerCase().trim();
        const styles: Record<string, string> = {
            pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400",
            approved: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
            partial: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/10 dark:text-purple-400",
            completed: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400",
            cancelled: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400",
        };

        return (
            <div className={`inline-flex px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-dashed justify-center w-fit ${styles[status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                {status ? status.replace('_', ' ') : 'N/A'}
            </div>
        );
    };

    const workflowActions = (order: any) => {
        const { id } = order;
        const status = (order.status || "").toLowerCase().trim();

        const actions: any[] = [];

        if (status === 'pending') {
            actions.push({ label: 'Approve', value: 'approved', color: 'blue', icon: Icons.CheckCircle });
            actions.push({ label: 'Cancel', value: 'cancelled', color: 'red', icon: Icons.XCircle });
        } else if (status === 'approved') {
            actions.push({ label: 'Partial', value: 'partial', color: 'purple', icon: Icons.Truck });
            actions.push({ label: 'Complete', value: 'completed', color: 'green', icon: Icons.CheckCheck });
            actions.push({ label: 'Cancel', value: 'cancelled', color: 'red', icon: Icons.XCircle });
        } else if (status === 'partial') {
            actions.push({ label: 'Complete', value: 'completed', color: 'green', icon: Icons.CheckCheck });
            actions.push({ label: 'Cancel', value: 'cancelled', color: 'red', icon: Icons.XCircle });
        }

        const colorMap: Record<string, string> = {
            blue: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30",
            red: "bg-red-500 hover:bg-red-600 shadow-red-500/30",
            purple: "bg-violet-600 hover:bg-violet-700 shadow-violet-500/30",
            green: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30",
        };

        if (actions.length === 0) {
            return <span className="text-[10px] text-gray-400 italic font-medium">Selesai</span>;
        }

        return (
            <div className="flex flex-wrap gap-2 text-white">
                {actions.map((action: any) => {
                    const isUpdating = updatingStatusId === `${id}-${action.value}`;
                    const Icon = action.icon;

                    return (
                        <button
                            key={action.value}
                            type="button"
                            disabled={!!updatingStatusId}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleUpdateStatus(id, action.value);
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm ${colorMap[action.color] || "bg-blue-600"}`}
                        >
                            {isUpdating ? <Icons.Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" />}
                            {action.label}
                        </button>
                    );
                })}
            </div>
        );
    };

    if (loading) return <div className="p-10 text-center">Memuat data pesanan...</div>;

    return (
        <div className="w-full max-w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold">Surat Pesanan Konsumen (SPK)</h3>
                <Button onClick={openCreateModal} size="sm">+ Buat SPK Baru</Button>
            </div>

            <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead className="bg-gray-50/50 dark:bg-white/5">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">No. SPK</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Total</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Update Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {orders.length > 0 ? (
                            orders.map((order: any) => (
                                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-sm font-mono font-medium">{order.no_spk}</td>
                                    <td className="px-6 py-4 text-sm font-semibold">{order.customer?.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                        {new Date(order.tanggal).toLocaleDateString("id-ID")}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-green-600">
                                        Rp {Number(order.total_price).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 text-sm">{statusBadge(order)}</td>
                                    <td className="px-6 py-4 text-sm">{workflowActions(order)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 items-center">
                                            <button onClick={() => handlePrintPdf(order.id, order.no_spk)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Cetak PDF">
                                                <FileText className="w-4 h-4" />
                                            </button>
                                            {order.status !== 'completed' && order.status !== 'cancelled' && (
                                                <>
                                                    <button onClick={() => openEditModal(order)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Header">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(order.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                                                        <Trash className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={7} className="p-10 text-center text-gray-400">Belum ada data SPK.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <SalesOrderModal
                isOpen={isModalOpen}
                initialData={selectedOrder}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
            />
        </div>
    );
}
