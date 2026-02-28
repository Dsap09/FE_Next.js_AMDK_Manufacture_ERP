"use client";
import React, { useEffect, useState } from "react";
import { chartOfAccountService } from "@/services/chartOfAccountService";
import Button from "../ui/button/Button";
import ChartOfAccountModal from "../modals/ChartOfAccountModal";

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
    asset: { label: "Asset", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    liability: { label: "Liability", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
    equity: { label: "Equity", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
    revenue: { label: "Revenue", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    expense: { label: "Expense", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

export default function ChartOfAccountTable() {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<any>(null);
    const [filterType, setFilterType] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchData();
    }, [filterType]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (filterType) params.type = filterType;
            const res = await chartOfAccountService.getAll(params);
            setAccounts(Array.isArray(res) ? res : res.data || []);
        } catch (error) {
            console.error("Gagal load chart of accounts");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (formData: any) => {
        try {
            if (selectedAccount) {
                await chartOfAccountService.update(selectedAccount.id, formData);
            } else {
                await chartOfAccountService.create(formData);
            }
            setIsModalOpen(false);
            setSelectedAccount(null);
            fetchData();
        } catch (error) {
            alert("Gagal menyimpan data akun.");
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (confirm(`Hapus akun "${name}"?`)) {
            await chartOfAccountService.delete(id);
            fetchData();
        }
    };

    const filteredAccounts = accounts.filter((a) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            a.code?.toLowerCase().includes(q) ||
            a.name?.toLowerCase().includes(q) ||
            a.category?.toLowerCase().includes(q)
        );
    });

    if (loading) return <div className="p-10 text-center">Memuat data akun...</div>;

    return (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            {/* Header */}
            <div className="flex flex-col gap-4 p-6 border-b border-gray-100 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-bold">Chart of Accounts</h3>
                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Cari kode/nama akun..."
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {/* Filter */}
                    <select
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="">Semua Tipe</option>
                        <option value="asset">Asset</option>
                        <option value="liability">Liability</option>
                        <option value="equity">Equity</option>
                        <option value="revenue">Revenue</option>
                        <option value="expense">Expense</option>
                    </select>
                    <Button
                        onClick={() => {
                            setSelectedAccount(null);
                            setIsModalOpen(true);
                        }}
                        size="sm"
                    >
                        + Tambah Akun
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 dark:bg-white/5">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Kode</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Nama Akun</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Tipe</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Kategori</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-center">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {filteredAccounts.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">
                                    Tidak ada data akun.
                                </td>
                            </tr>
                        ) : (
                            filteredAccounts.map((a: any) => {
                                const typeInfo = TYPE_LABELS[a.type] || { label: a.type, color: "bg-gray-100 text-gray-700" };
                                return (
                                    <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-mono font-bold text-gray-900 dark:text-white">{a.code}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">{a.name}</div>
                                            {a.is_cash && (
                                                <span className="mt-1 inline-block rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-semibold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                    Kas
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${typeInfo.color}`}>
                                                {typeInfo.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{a.category}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span
                                                className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${a.is_active
                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                        : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                                                    }`}
                                            >
                                                {a.is_active ? "Aktif" : "Nonaktif"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-3">
                                            <button
                                                onClick={() => {
                                                    setSelectedAccount(a);
                                                    setIsModalOpen(true);
                                                }}
                                                className="text-blue-500 font-bold text-sm"
                                            >
                                                Edit
                                            </button>
                                            <button onClick={() => handleDelete(a.id, a.name)} className="text-red-500 font-bold text-sm">
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <ChartOfAccountModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedAccount(null);
                }}
                onSave={handleSave}
                initialData={selectedAccount}
            />
        </div>
    );
}
