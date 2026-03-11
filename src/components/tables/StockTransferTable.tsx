"use client";
import React, { useEffect, useState } from "react";
import { stockTransferService } from "@/services/stockTransferService";
import { warehouseService } from "@/services/warehouseService";
import { productService } from "@/services/productService";
import { rawMaterialService } from "@/services/rawMaterialService";
import Button from "../ui/button/Button";
import { toast } from "react-hot-toast";

export default function StockTransferForm() {
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [rawMaterials, setRawMaterials] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        warehouseService.getAll().then((res: any) => setWarehouses(Array.isArray(res) ? res : res.data || []));
        productService.getAll().then((res: any) => setProducts(Array.isArray(res) ? res : res.data || []));
        rawMaterialService.getAll().then((res: any) => setRawMaterials(Array.isArray(res) ? res : res.data || []));
    }, []);

    const resetForm = () => {
        setFormData({
            dari_warehouse_id: "",
            ke_warehouse_id: "",
            transfer_date: new Date().toISOString().split("T")[0],
            notes: "",
        });
        setItems([{ type: "product", itemable_id: "", quantity: 0 }]);
    };

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

    const handleSubmit = async () => {
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

        setIsSubmitting(true);
        try {
            // Step 1: Create
            const createRes = await stockTransferService.store(payload);
            const transferId = createRes?.data?.id;

            if (transferId) {
                // Step 2: Approve
                await stockTransferService.approve(transferId);
                // Step 3: Execute (Move Stock)
                await stockTransferService.execute(transferId);

                alert("Transfer gudang berhasil dieksekusi!");
                resetForm();
            } else {
                throw new Error("ID Transfer tidak ditemukan dari response.");
            }

        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || error.message || "Terjadi kesalahan saat mengeksekusi transfer.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-6 border-b border-gray-100 pb-4 dark:border-gray-800">
                <h3 className="text-lg font-bold">Form Input Transfer Gudang</h3>
                <p className="text-sm text-gray-500">Transfer akan langsung dieksekusi dan memotong/menambah stok.</p>
            </div>

            <div className="space-y-6">
                {/* Gudang Asal & Tujuan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="mb-2 block text-sm font-medium">Dari Gudang Asal</label>
                        <select
                            className="w-full rounded-lg border border-gray-200 p-3 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                            value={formData.dari_warehouse_id}
                            onChange={(e) => setFormData({ ...formData, dari_warehouse_id: e.target.value })}
                        >
                            <option value="">-- Pilih Gudang Asal --</option>
                            {warehouses.map((w: any) => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium">Ke Gudang Tujuan</label>
                        <select
                            className="w-full rounded-lg border border-gray-200 p-3 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                            value={formData.ke_warehouse_id}
                            onChange={(e) => setFormData({ ...formData, ke_warehouse_id: e.target.value })}
                        >
                            <option value="">-- Pilih Gudang Tujuan --</option>
                            {warehouses.map((w: any) => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Date & Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="mb-2 block text-sm font-medium">Tanggal Transfer</label>
                        <input
                            type="date"
                            className="w-full rounded-lg border border-gray-200 p-3 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                            value={formData.transfer_date}
                            onChange={(e) => setFormData({ ...formData, transfer_date: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium">Catatan (Notes)</label>
                        <input
                            type="text"
                            className="w-full rounded-lg border border-gray-200 p-3 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Keterangan operasional opsional"
                        />
                    </div>
                </div>

                {/* Items */}
                <div className="border-t border-gray-100 pt-6">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Item yang Ditransfer</h4>
                        <button type="button" onClick={handleAddItem} className="text-sm font-bold text-blue-600 hover:text-blue-800 uppercase px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                            + Tambah Item
                        </button>
                    </div>

                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div key={index} className="flex flex-col md:flex-row gap-4 items-center bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                <div className="w-full md:w-48">
                                    <label className="text-xs text-gray-500 mb-1 block">Tipe Barang</label>
                                    <select
                                        className="w-full border border-gray-200 p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        value={item.type}
                                        onChange={(e) => handleItemChange(index, "type", e.target.value)}
                                    >
                                        <option value="product">Produk Jadi</option>
                                        <option value="raw_material">Bahan Baku</option>
                                    </select>
                                </div>
                                <div className="flex-1 w-full">
                                    <label className="text-xs text-gray-500 mb-1 block">Pilih Item</label>
                                    <select
                                        className="w-full border border-gray-200 p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        value={item.itemable_id}
                                        onChange={(e) => handleItemChange(index, "itemable_id", e.target.value)}
                                    >
                                        <option value="">-- Pilih {item.type === "product" ? "Produk" : "Bahan Baku"} --</option>
                                        {(item.type === "product" ? products : rawMaterials).map((p: any) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-full md:w-32">
                                    <label className="text-xs text-gray-500 mb-1 block">Kuantitas</label>
                                    <input
                                        type="number"
                                        placeholder="Qty"
                                        className="w-full border border-gray-200 p-2.5 rounded-lg text-sm text-center outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        value={item.quantity === 0 ? "" : item.quantity}
                                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                                    />
                                </div>
                                {items.length > 1 && (
                                    <div className="pt-5">
                                        <button type="button" onClick={() => handleRemoveItem(index)} className="text-gray-400 hover:text-red-500 bg-white hover:bg-red-50 w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center transition-all">
                                            ✕
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-4">
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full md:w-auto px-10">
                        {isSubmitting ? "Memproses..." : "Submit & Eksekusi Transfer"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
