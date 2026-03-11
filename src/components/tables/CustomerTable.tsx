"use client";
import React, { useEffect, useState } from "react";
import { customerService } from "@/services/customerService";
import Button from "../ui/button/Button";
import CustomerModal from "../modals/CustomerModal";
import { Edit, Trash } from "lucide-react";

export default function CustomerTable() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await customerService.getAll();
            setCustomers(Array.isArray(res) ? res : res.data || []);
        } catch (error) {
            console.error("Gagal memuat data pelanggan:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async (payload: any) => {
        try {
            if (selectedCustomer) {
                await customerService.update(selectedCustomer.id, payload);
            } else {
                await customerService.store(payload);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal menyimpan data.");
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Apakah Anda yakin ingin menghapus pelanggan ini?")) {
            try {
                await customerService.delete(id);
                fetchData();
            } catch (error: any) {
                alert(error.response?.data?.message || "Gagal menghapus data.");
            }
        }
    };

    const openCreateModal = () => {
        setSelectedCustomer(null);
        setIsModalOpen(true);
    };

    const openEditModal = (customer: any) => {
        setSelectedCustomer(customer);
        setIsModalOpen(true);
    };

    const typeBadge = (type: string) => {
        const typeStyles: Record<string, string> = {
            distributor: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
            agent: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
            retail: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${typeStyles[type] || "bg-gray-100 text-gray-600"}`}>
                {type}
            </span>
        );
    };

    if (loading) return <div className="p-10 text-center">Memuat data pelanggan...</div>;

    return (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold">Data Customer</h3>
                <Button onClick={openCreateModal} size="sm">+ Tambah Customer</Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 dark:bg-white/5">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Kode</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Nama</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Tipe</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Alamat</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {customers.length > 0 ? (
                            customers.map((c: any) => (
                                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-sm font-mono font-medium">{c.kode_customer}</td>
                                    <td className="px-6 py-4 text-sm font-semibold">{c.name}</td>
                                    <td className="px-6 py-4 text-sm">{typeBadge(c.type)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">{c.address}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openEditModal(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(c.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={5} className="p-10 text-center text-gray-400">Belum ada data customer.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <CustomerModal
                isOpen={isModalOpen}
                initialData={selectedCustomer}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
            />
        </div>
    );
}
