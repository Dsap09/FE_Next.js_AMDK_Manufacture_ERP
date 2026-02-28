"use client";
import React, { useEffect, useState } from "react";
import Button from "../ui/button/Button";
import { chartOfAccountService } from "@/services/chartOfAccountService";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
}

export default function InitialBalanceModal({ isOpen, onClose, onSave }: Props) {
    const [year, setYear] = useState(new Date().getFullYear());
    const [accounts, setAccounts] = useState<any[]>([]);
    const [items, setItems] = useState<{ account_id: string; debit: number; credit: number }[]>([
        { account_id: "", debit: 0, credit: 0 }
    ]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            chartOfAccountService.getAll().then((res: any) => {
                setAccounts(Array.isArray(res) ? res : res.data || []);
            });
            setItems([{ account_id: "", debit: 0, credit: 0 }]);
        }
    }, [isOpen]);

    const handleAddItem = () => {
        setItems([...items, { account_id: "", debit: 0, credit: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...items] as any[];
        if (field === "debit" || field === "credit") {
            const parsed = value === "" ? 0 : parseFloat(value);
            newItems[index][field] = isNaN(parsed) ? 0 : parsed;
        } else {
            newItems[index][field] = value;
        }
        setItems(newItems);
    };

    const totalDebit = items.reduce((sum, item) => sum + (item.debit || 0), 0);
    const totalCredit = items.reduce((sum, item) => sum + (item.credit || 0), 0);

    const handleSubmit = () => {
        if (items.some(it => !it.account_id)) {
            return alert("Harap pilih akun untuk semua item!");
        }
        onSave({
            year,
            items: items.map(it => ({
                account_id: parseInt(it.account_id),
                debit: it.debit || 0,
                credit: it.credit || 0,
            }))
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
                <h3 className="mb-6 text-xl font-bold text-gray-800 dark:text-white">
                    Input Saldo Awal
                </h3>

                <div className="space-y-5">
                    {/* Year */}
                    <div>
                        <label className="mb-1 block text-sm font-medium">Tahun</label>
                        <input
                            type="number"
                            min={2000}
                            max={2100}
                            className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                        />
                    </div>

                    {/* Items */}
                    <div className="border-t border-gray-100 pt-4">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Detail Akun</h4>
                            <button type="button" onClick={handleAddItem} className="text-xs font-black text-blue-600 hover:text-blue-800 uppercase">
                                + Tambah Akun
                            </button>
                        </div>

                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={index} className="flex gap-3 items-center">
                                    <div className="flex-1">
                                        <select
                                            className="w-full border-2 border-gray-50 p-2.5 rounded-xl text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
                                            value={item.account_id}
                                            onChange={(e) => handleItemChange(index, "account_id", e.target.value)}
                                        >
                                            <option value="">-- Pilih Akun --</option>
                                            {accounts.map((acc: any) => (
                                                <option key={acc.id} value={acc.id}>
                                                    {acc.code} - {acc.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-36">
                                        <input
                                            type="number"
                                            placeholder="Debit"
                                            className="w-full border-2 border-gray-50 p-2.5 rounded-xl text-sm text-right outline-none focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
                                            value={item.debit === 0 ? "" : item.debit}
                                            onChange={(e) => handleItemChange(index, "debit", e.target.value)}
                                        />
                                    </div>
                                    <div className="w-36">
                                        <input
                                            type="number"
                                            placeholder="Credit"
                                            className="w-full border-2 border-gray-50 p-2.5 rounded-xl text-sm text-right outline-none focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
                                            value={item.credit === 0 ? "" : item.credit}
                                            onChange={(e) => handleItemChange(index, "credit", e.target.value)}
                                        />
                                    </div>
                                    {items.length > 1 && (
                                        <button type="button" onClick={() => handleRemoveItem(index)} className="text-gray-300 hover:text-red-500 transition-colors p-2">
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-6 text-sm">
                            <div>
                                <span className="text-gray-400 mr-2">Total Debit:</span>
                                <span className="font-bold text-gray-800 dark:text-white">{totalDebit.toLocaleString("id-ID")}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 mr-2">Total Credit:</span>
                                <span className="font-bold text-gray-800 dark:text-white">{totalCredit.toLocaleString("id-ID")}</span>
                            </div>
                            {totalDebit !== totalCredit && (
                                <span className="text-red-500 text-xs font-semibold">⚠ Tidak seimbang</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Batal</button>
                    <Button onClick={handleSubmit}>Simpan Saldo Awal</Button>
                </div>
            </div>
        </div>
    );
}
