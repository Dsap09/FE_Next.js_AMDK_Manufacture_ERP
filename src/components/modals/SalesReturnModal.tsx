"use client";
import React, { useEffect, useState } from "react";
import Button from "../ui/button/Button";
import { salesInvoiceService } from "@/services/salesInvoiceService";
import { productService } from "@/services/productService";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
}

export default function SalesReturnModal({ isOpen, onClose, onSave }: Props) {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        sales_invoice_id: "",
        return_date: new Date().toISOString().split("T")[0],
        reason: ""
    });

    const [items, setItems] = useState<{ product_id: string; qty: number; condition: string; price: number }[]>([
        { product_id: "", qty: 1, condition: "good", price: 0 }
    ]);

    useEffect(() => {
        if (isOpen) {
            salesInvoiceService.getAll().then((res: any) => {
                const dataArray = res.data?.data || res.data || [];
                setInvoices(Array.isArray(dataArray) ? dataArray : []);
            });
            productService.getAll().then((res: any) => setProducts(Array.isArray(res) ? res : res.data || []));

            setFormData({
                sales_invoice_id: "",
                return_date: new Date().toISOString().split("T")[0],
                reason: ""
            });
            setItems([{ product_id: "", qty: 1, condition: "good", price: 0 }]);
        }
    }, [isOpen]);

    const handleAddItem = () => {
        setItems([...items, { product_id: "", qty: 1, condition: "good", price: 0 }]);
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
            // Optionally auto-get price from products/invoice if needed
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
        if (!formData.sales_invoice_id || !formData.return_date) {
            return alert("Harap isi Invoice Referensi dan tanggal!");
        }

        if (items.some(it => !it.product_id || it.qty <= 0 || it.price < 0)) {
            return alert("Harap isi semua item retur dengan benar!");
        }

        const payload = {
            sales_invoice_id: parseInt(formData.sales_invoice_id),
            return_date: formData.return_date,
            reason: formData.reason,
            items: items.map(it => ({
                product_id: parseInt(it.product_id),
                qty: it.qty,
                condition: it.condition,
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
                    Buat Retur Penjualan Baru
                </h3>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium">Invoice Referensi <span className="text-red-500">*</span></label>
                            <select
                                className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
                                value={formData.sales_invoice_id}
                                onChange={(e) => setFormData({ ...formData, sales_invoice_id: e.target.value })}
                            >
                                <option value="">-- Pilih Invoice --</option>
                                {invoices.map((inv: any) => (
                                    <option key={inv.id} value={inv.id}>{inv.no_invoice || inv.invoice_number}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Tanggal Retur <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
                                value={formData.return_date}
                                onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium">Alasan Retur</label>
                            <input
                                type="text"
                                className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 mt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-sm font-bold text-gray-800">Daftar Produk Diretur</h4>
                            <button type="button" onClick={handleAddItem} className="text-sm font-bold text-blue-600 hover:text-blue-800">
                                + Tambah Item
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="flex gap-3 px-2 text-xs font-semibold text-gray-500">
                                <div className="flex-1">Nama Produk</div>
                                <div className="w-24 text-center">Qty</div>
                                <div className="w-32 text-center">Kondisi</div>
                                <div className="w-36 text-center">Harga Jual (Rp)</div>
                                <div className="w-10"></div>
                            </div>
                            {items.map((item, index) => (
                                <div key={index} className="flex gap-3 items-center">
                                    <div className="flex-1">
                                        <select
                                            className="w-full border-2 border-gray-50 p-2.5 rounded-xl text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
                                            value={item.product_id}
                                            onChange={(e) => handleItemChange(index, "product_id", e.target.value)}
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
                                        />
                                    </div>
                                    <div className="w-32">
                                        <select
                                            className="w-full border-2 border-gray-50 p-2.5 rounded-xl text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
                                            value={item.condition}
                                            onChange={(e) => handleItemChange(index, "condition", e.target.value)}
                                        >
                                            <option value="good">Bagus (Good)</option>
                                            <option value="damaged">Rusak (Damaged)</option>
                                            <option value="reject">Ditolak (Reject)</option>
                                        </select>
                                    </div>
                                    <div className="w-36">
                                        <input
                                            type="number"
                                            placeholder="Harga"
                                            className="w-full border-2 border-gray-50 p-2.5 rounded-xl text-sm text-right outline-none focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
                                            value={item.price === 0 ? "" : item.price}
                                            onChange={(e) => handleItemChange(index, "price", e.target.value)}
                                        />
                                    </div>
                                    <div className="w-10 text-center">
                                        {items.length > 1 && (
                                            <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-400 hover:text-red-600 transition-colors p-2">
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Batal</button>
                    <Button onClick={handleSubmit}>Simpan Retur</Button>
                </div>
            </div>
        </div>
    );
}
