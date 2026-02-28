"use client";
import React, { useEffect, useState } from "react";
import Button from "../ui/button/Button";
import { warehouseService } from "@/services/warehouseService";
import { productService } from "@/services/productService";
import { rawMaterialService } from "@/services/rawMaterialService";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
}

export default function StockTransferModal({ isOpen, onClose, onSave }: Props) {
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [rawMaterials, setRawMaterials] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        dari_warehouse_id: "",
        ke_warehouse_id: "",
        transfer_date: new Date().toISOString().split("T")[0],
        notes: "",
    });

    const [items, setItems] = useState<{ type: string; itemable_id: string; quantity: number }[]>([
        { type: "product", itemable_id: "", quantity: 0 }
    ]);

    useEffect(() => {
        if (isOpen) {
            warehouseService.getAll().then((res: any) => setWarehouses(Array.isArray(res) ? res : res.data || []));
            productService.getAll().then((res: any) => setProducts(Array.isArray(res) ? res : res.data || []));
            rawMaterialService.getAll().then((res: any) => setRawMaterials(Array.isArray(res) ? res : res.data || []));
            setFormData({
                dari_warehouse_id: "",
                ke_warehouse_id: "",
                transfer_date: new Date().toISOString().split("T")[0],
                notes: "",
            });
            setItems([{ type: "product", itemable_id: "", quantity: 0 }]);
        }
    }, [isOpen]);

    const handleAddItem = () => {
        setItems([...items, { type: "product", itemable_id: "", quantity: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...items] as any[];
        if (field === "quantity") {
            const parsed = value === "" ? 0 : parseFloat(value);
            newItems[index][field] = isNaN(parsed) ? 0 : parsed;
        } else if (field === "type") {
            newItems[index].type = value;
            newItems[index].itemable_id = "";
        } else {
            newItems[index][field] = value;
        }
        setItems(newItems);
    };

    const handleSubmit = () => {
        if (!formData.dari_warehouse_id || !formData.ke_warehouse_id) {
            return alert("Harap pilih gudang asal dan tujuan!");
        }
        if (formData.dari_warehouse_id === formData.ke_warehouse_id) {
            return alert("Gudang asal dan tujuan harus berbeda!");
        }
        if (items.some(it => !it.itemable_id || it.quantity <= 0)) {
            return alert("Harap isi semua item dengan benar!");
        }

        const payload = {
            dari_warehouse_id: parseInt(formData.dari_warehouse_id),
            ke_warehouse_id: parseInt(formData.ke_warehouse_id),
            transfer_date: formData.transfer_date,
            notes: formData.notes || undefined,
            items: items.map(it => ({
                product_id: it.type === "product" ? parseInt(it.itemable_id) : null,
                raw_material_id: it.type === "raw_material" ? parseInt(it.itemable_id) : null,
                quantity: it.quantity,
            }))
        };
        onSave(payload);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
                <h3 className="mb-6 text-xl font-bold text-gray-800 dark:text-white">
                    Buat Transfer Gudang
                </h3>

                <div className="space-y-4">
                    {/* Gudang Asal & Tujuan */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium">Gudang Asal</label>
                            <select
                                className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
                                value={formData.dari_warehouse_id}
                                onChange={(e) => setFormData({ ...formData, dari_warehouse_id: e.target.value })}
                            >
                                <option value="">-- Pilih Gudang --</option>
                                {warehouses.map((w: any) => (
                                    <option key={w.id} value={w.id}>{w.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Gudang Tujuan</label>
                            <select
                                className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
                                value={formData.ke_warehouse_id}
                                onChange={(e) => setFormData({ ...formData, ke_warehouse_id: e.target.value })}
                            >
                                <option value="">-- Pilih Gudang --</option>
                                {warehouses.map((w: any) => (
                                    <option key={w.id} value={w.id}>{w.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Date & Notes */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium">Tanggal Transfer</label>
                            <input
                                type="date"
                                className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
                                value={formData.transfer_date}
                                onChange={(e) => setFormData({ ...formData, transfer_date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Catatan</label>
                            <input
                                type="text"
                                className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Opsional"
                            />
                        </div>
                    </div>

                    {/* Items */}
                    <div className="border-t border-gray-100 pt-4">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Item Transfer</h4>
                            <button type="button" onClick={handleAddItem} className="text-xs font-black text-blue-600 hover:text-blue-800 uppercase">
                                + Tambah Item
                            </button>
                        </div>

                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={index} className="flex gap-3 items-center">
                                    <div className="w-36">
                                        <select
                                            className="w-full border-2 border-gray-50 p-2.5 rounded-xl text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
                                            value={item.type}
                                            onChange={(e) => handleItemChange(index, "type", e.target.value)}
                                        >
                                            <option value="product">Produk</option>
                                            <option value="raw_material">Bahan Baku</option>
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <select
                                            className="w-full border-2 border-gray-50 p-2.5 rounded-xl text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
                                            value={item.itemable_id}
                                            onChange={(e) => handleItemChange(index, "itemable_id", e.target.value)}
                                        >
                                            <option value="">-- Pilih {item.type === "product" ? "Produk" : "Bahan Baku"} --</option>
                                            {(item.type === "product" ? products : rawMaterials).map((p: any) => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-28">
                                        <input
                                            type="number"
                                            placeholder="Qty"
                                            className="w-full border-2 border-gray-50 p-2.5 rounded-xl text-sm text-center outline-none focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
                                            value={item.quantity === 0 ? "" : item.quantity}
                                            onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
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
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Batal</button>
                    <Button onClick={handleSubmit}>Simpan Transfer</Button>
                </div>
            </div>
        </div>
    );
}
