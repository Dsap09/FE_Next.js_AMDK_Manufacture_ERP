"use client";
import React, { useEffect, useState } from "react";
import Button from "../ui/button/Button";
import { productService } from "@/services/productService";
import { customerService } from "@/services/customerService";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData?: any;
}

export default function SalesQuotationModal({ isOpen, onClose, onSave, initialData }: Props) {
    const [customers, setCustomers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        customer_id: "",
        tanggal: new Date().toISOString().split("T")[0],
        cara_bayar: "",
        dp_amount: 0,
        notes: "",
    });

    const [items, setItems] = useState<{ product_id: string; qty: number; price: number }[]>([
        { product_id: "", qty: 1, price: 0 }
    ]);

    useEffect(() => {
        if (isOpen) {
            customerService.getAll().then((res: any) => setCustomers(Array.isArray(res) ? res : res.data || []));
            productService.getAll().then((res: any) => setProducts(Array.isArray(res) ? res : res.data || []));

            if (initialData) {
                setFormData({
                    customer_id: initialData.customer_id?.toString() || "",
                    tanggal: initialData.tanggal || new Date().toISOString().split("T")[0],
                    cara_bayar: initialData.cara_bayar || "",
                    dp_amount: initialData.dp_amount || 0,
                    notes: initialData.notes || "",
                });
                if (initialData.items && initialData.items.length > 0) {
                    setItems(initialData.items.map((it: any) => ({
                        product_id: it.product_id?.toString() || "",
                        qty: it.qty,
                        price: it.price
                    })));
                } else {
                    setItems([{ product_id: "", qty: 1, price: 0 }]);
                }
            } else {
                setFormData({
                    customer_id: "",
                    tanggal: new Date().toISOString().split("T")[0],
                    cara_bayar: "",
                    dp_amount: 0,
                    notes: "",
                });
                setItems([{ product_id: "", qty: 1, price: 0 }]);
            }
        }
    }, [isOpen, initialData]);

    const handleAddItem = () => {
        setItems([...items, { product_id: "", qty: 1, price: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...items] as any[];
        if (field === "qty" || field === "price") {
            const parsed = value === "" ? 0 : parseFloat(value);
            newItems[index][field] = isNaN(parsed) ? 0 : parsed;
        } else {
            newItems[index][field] = value;
            if (field === "product_id") {
                const prod = products.find(p => p.id.toString() === value);
                if (prod && prod.price) {
                    newItems[index].price = prod.price;
                }
            }
        }
        setItems(newItems);
    };

    const handleSubmit = () => {
        if (!formData.customer_id || !formData.tanggal) {
            return alert("Harap isi customer dan tanggal!");
        }
        if (items.some(it => !it.product_id || it.qty <= 0 || it.price < 0)) {
            return alert("Harap isi semua item dengan benar!");
        }

        const payload = {
            customer_id: parseInt(formData.customer_id),
            tanggal: formData.tanggal,
            cara_bayar: formData.cara_bayar,
            dp_amount: formData.dp_amount,
            notes: formData.notes,
            items: items.map(it => ({
                product_id: parseInt(it.product_id),
                qty: it.qty,
                price: it.price,
            }))
        };
        onSave(payload);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
                <h3 className="mb-6 text-xl font-bold text-gray-800 dark:text-white">
                    {initialData ? "Edit Penawaran Penjualan" : "Buat Penawaran Penjualan Baru"}
                </h3>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium">Customer <span className="text-red-500">*</span></label>
                            <select
                                className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
                                value={formData.customer_id}
                                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                                disabled={!!initialData}
                            >
                                <option value="">-- Pilih Customer --</option>
                                {customers.map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Tanggal <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
                                value={formData.tanggal}
                                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium">Cara Bayar</label>
                            <select
                                className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
                                value={formData.cara_bayar}
                                onChange={(e) => setFormData({ ...formData, cara_bayar: e.target.value })}
                            >
                                <option value="">-- Pilih Cara Bayar --</option>
                                <option value="Lunas">Lunas</option>
                                <option value="DP">DP</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">DP Amount (Rp)</label>
                            <input
                                type="number"
                                className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
                                value={formData.dp_amount === 0 ? "" : formData.dp_amount}
                                onChange={(e) => setFormData({ ...formData, dp_amount: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Catatan</label>
                        <input
                            type="text"
                            className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Catatan tambahan"
                        />
                    </div>

                    {/* Items */}
                    <div className="border-t border-gray-100 pt-4">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-sm font-bold text-gray-800">Item Produk</h4>
                            {!initialData && (
                                <button type="button" onClick={handleAddItem} className="text-sm font-bold text-blue-600 hover:text-blue-800">
                                    + Tambah Item
                                </button>
                            )}
                        </div>

                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={index} className="flex gap-3 items-center">
                                    <div className="flex-1">
                                        <select
                                            className="w-full border-2 border-gray-50 p-2.5 rounded-xl text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
                                            value={item.product_id}
                                            onChange={(e) => handleItemChange(index, "product_id", e.target.value)}
                                            disabled={!!initialData}
                                        >
                                            <option value="">-- Pilih Produk --</option>
                                            {products.map((p: any) => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-24">
                                        <input
                                            type="number"
                                            placeholder="Qty"
                                            className="w-full border-2 border-gray-50 p-2.5 rounded-xl text-sm text-center outline-none focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
                                            value={item.qty === 0 ? "" : item.qty}
                                            onChange={(e) => handleItemChange(index, "qty", e.target.value)}
                                            disabled={!!initialData}
                                        />
                                    </div>
                                    <div className="w-40">
                                        <input
                                            type="number"
                                            placeholder="Harga Rp"
                                            className="w-full border-2 border-gray-50 p-2.5 rounded-xl text-sm text-right outline-none focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
                                            value={item.price === 0 ? "" : item.price}
                                            onChange={(e) => handleItemChange(index, "price", e.target.value)}
                                            disabled={!!initialData}
                                        />
                                    </div>
                                    {!initialData && items.length > 1 && (
                                        <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-400 hover:text-red-600 transition-colors p-2">
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Batal</button>
                    <Button onClick={handleSubmit}>Simpan</Button>
                </div>
            </div>
        </div>
    );
}
