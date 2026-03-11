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

const CATEGORIES: Record<string, { value: string; label: string }[]> = {
    asset: [
        { value: "kas_bank", label: "Kas & Bank" },
        { value: "piutang", label: "Piutang" },
        { value: "persediaan", label: "Persediaan" },
        { value: "aset_tetap", label: "Aset Tetap" },
    ],
    liability: [
        { value: "utang_lancar", label: "Utang Lancar" },
        { value: "utang_jangka_panjang", label: "Utang Jangka Panjang" },
    ],
    equity: [
        { value: "modal", label: "Modal" },
    ],
    revenue: [
        { value: "pendapatan_usaha", label: "Pendapatan Usaha" },
        { value: "pendapatan_lain", label: "Pendapatan Lain-lain" },
    ],
    expense: [
        { value: "biaya", label: "Biaya / Beban" },
    ],
};

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
            setFormData({ code: "", name: "", type: "asset", category: "kas_bank", is_cash: false, is_active: true });
        }
    }, [initialData, isOpen]);

    const handleTypeChange = (type: string) => {
        const firstCategory = CATEGORIES[type]?.[0]?.value || "";
        setFormData({ ...formData, type, category: firstCategory });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                        {initialData ? "Edit Akun" : "Tambah Akun Baru"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Lengkapi informasi bagan akun di bawah ini.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">Kode Akun</label>
                        <input
                            type="text"
                            className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            placeholder="Contoh: 1-1001"
                        />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">Tipe Akun</label>
                        <select
                            className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            value={formData.type}
                            onChange={(e) => handleTypeChange(e.target.value)}
                        >
                            {ACCOUNT_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">Nama Akun</label>
                        <input
                            type="text"
                            className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Contoh: Kas Besar"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">Kategori</label>
                        <select
                            className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="">-- Pilih Kategori --</option>
                            {CATEGORIES[formData.type]?.map((c) => (
                                <option key={c.value} value={c.value}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-span-2 flex gap-8 pt-2">
                        <label className="flex items-center gap-3 text-sm font-medium cursor-pointer group">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    className="peer h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                                    checked={formData.is_cash}
                                    onChange={(e) => setFormData({ ...formData, is_cash: e.target.checked })}
                                />
                            </div>
                            <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors">Akun Kas</span>
                        </label>
                        <label className="flex items-center gap-3 text-sm font-medium cursor-pointer group">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    className="peer h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                />
                            </div>
                            <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors">Aktif</span>
                        </label>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all"
                    >
                        Batal
                    </button>
                    <Button
                        onClick={() => onSave(formData)}
                        className="px-6 shadow-lg shadow-blue-500/20"
                    >
                        Simpan Akun
                    </Button>
                </div>
            </div>
        </div>
    );
}
