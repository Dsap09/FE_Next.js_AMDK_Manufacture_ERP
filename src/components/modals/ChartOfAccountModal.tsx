"use client";
import React, { useEffect, useState } from "react";
import Button from "../ui/button/Button";

const ACCOUNT_TYPES = [
    { value: "asset", label: "Asset" },
    { value: "liability", label: "Liability" },
    { value: "equity", label: "Equity" },
    { value: "revenue", label: "Revenue" },
    { value: "expense", label: "Expense" },
];

export default function ChartOfAccountModal({ isOpen, onClose, onSave, initialData }: any) {
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        type: "asset",
        category: "",
        is_cash: false,
        is_active: true,
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                code: initialData.code || "",
                name: initialData.name || "",
                type: initialData.type || "asset",
                category: initialData.category || "",
                is_cash: initialData.is_cash ?? false,
                is_active: initialData.is_active ?? true,
            });
        } else {
            setFormData({ code: "", name: "", type: "asset", category: "", is_cash: false, is_active: true });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
                <h3 className="mb-6 text-xl font-bold text-gray-800 dark:text-white">
                    {initialData ? "Edit Akun" : "Tambah Akun Baru"}
                </h3>

                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                        <label className="mb-1 block text-sm font-medium">Kode Akun</label>
                        <input
                            type="text"
                            className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            placeholder="Contoh: 1-1001"
                        />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label className="mb-1 block text-sm font-medium">Tipe Akun</label>
                        <select
                            className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            {ACCOUNT_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className="mb-1 block text-sm font-medium">Nama Akun</label>
                        <input
                            type="text"
                            className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Contoh: Kas Besar"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="mb-1 block text-sm font-medium">Kategori</label>
                        <input
                            type="text"
                            className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            placeholder="Contoh: Kas & Bank"
                        />
                    </div>
                    <div className="col-span-2 flex gap-6">
                        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={formData.is_cash}
                                onChange={(e) => setFormData({ ...formData, is_cash: e.target.checked })}
                            />
                            Akun Kas
                        </label>
                        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            />
                            Aktif
                        </label>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                        Batal
                    </button>
                    <Button onClick={() => onSave(formData)}>Simpan Akun</Button>
                </div>
            </div>
        </div>
    );
}
