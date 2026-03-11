"use client";
import React, { useEffect, useState } from "react";
import Button from "../ui/button/Button";
import { salesOrderService } from "@/services/salesOrderService";
import { warehouseService } from "@/services/warehouseService";
import { deliveryOrderService } from "@/services/deliveryOrderService";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData?: any;
}

export default function DeliveryOrderModal({ isOpen, onClose, onSave, initialData }: Props) {
    const [salesOrders, setSalesOrders] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        sales_order_id: "",
        warehouse_id: "",
        tanggal: new Date().toISOString().split("T")[0],
        notes: "",
        status: "draft"
    });

    const [items, setItems] = useState<any[]>([]);
    const [loadingSoItems, setLoadingSoItems] = useState(false);

    useEffect(() => {
        if (isOpen) {
            salesOrderService.getAll().then((res: any) => setSalesOrders(Array.isArray(res) ? res : res.data || []));
            warehouseService.getAll().then((res: any) => {
                setWarehouses(res.data?.data || (Array.isArray(res.data) ? res.data : []));
            });

            if (initialData) {
                setFormData({
                    sales_order_id: initialData.sales_order_id?.toString() || "",
                    warehouse_id: initialData.warehouse_id?.toString() || "",
                    tanggal: initialData.tanggal || new Date().toISOString().split("T")[0],
                    notes: initialData.notes || "",
                    status: initialData.status || "draft"
                });

                if (initialData.items && initialData.items.length > 0) {
                    setItems(initialData.items.map((it: any) => ({
                        sales_order_item_id: it.sales_order_item_id,
                        product_id: it.product_id,
                        product_name: it.product?.name || "Produk",
                        qty_sisa: it.qty_dikirim, // For edit, we just show what was sent
                        qty_dikirim: it.qty_realisasi || it.qty_dikirim
                    })));
                } else {
                    setItems([]);
                }
            } else {
                setFormData({
                    sales_order_id: "",
                    warehouse_id: "",
                    tanggal: new Date().toISOString().split("T")[0],
                    notes: "",
                    status: "draft"
                });
                setItems([]);
            }
        }
    }, [isOpen, initialData]);

    useEffect(() => {
        if (formData.sales_order_id && !initialData) {
            fetchOutstandingItems(formData.sales_order_id);
        }
    }, [formData.sales_order_id]);

    const fetchOutstandingItems = async (soId: string) => {
        try {
            setLoadingSoItems(true);
            const res = await salesOrderService.getOutstandingItems(parseInt(soId));
            const outstandingItems = res.data?.items || res.items;

            if (outstandingItems) {
                // Initialize dikirim with sisa
                setItems(outstandingItems.map((it: any) => ({
                    ...it,
                    qty_dikirim: it.qty_sisa
                })));
            }
        } catch (error) {
            console.error("Gagal load outstanding items", error);
            setItems([]);
        } finally {
            setLoadingSoItems(false);
        }
    }

    const handleItemChange = (index: number, value: string) => {
        const newItems = [...items];
        let parsed = value === "" ? 0 : parseFloat(value);
        if (isNaN(parsed)) parsed = 0;

        // Cap at qty_sisa to prevent over-shipping
        const finalVal = Math.min(parsed, newItems[index].qty_sisa);

        newItems[index].qty_dikirim = finalVal;
        setItems(newItems);
    }

    const handleSubmit = () => {
        if (!initialData) {
            if (!formData.sales_order_id || !formData.warehouse_id || !formData.tanggal) {
                return alert("Harap isi SPK, Gudang, dan tanggal kirim!");
            }

            const selectedSo = salesOrders.find(so => so.id.toString() === formData.sales_order_id);

            const payload = {
                sales_order_id: parseInt(formData.sales_order_id),
                warehouse_id: parseInt(formData.warehouse_id),
                tanggal: formData.tanggal,
                customer_id: selectedSo?.customer_id,
                no_spk: selectedSo?.no_spk,
                notes: formData.notes,
                status: formData.status,
                items: items
                    .filter(it => it.qty_dikirim > 0)
                    .map(it => ({
                        sales_order_item_id: it.sales_order_item_id,
                        product_id: parseInt(it.product_id),
                        qty: it.qty_dikirim
                    }))
            };

            if (payload.items.length === 0) {
                return alert("Minimal 1 barang harus dikirim (qty > 0)!");
            }

            onSave(payload);
        } else {
            // Edit Header
            const payload = {
                tanggal: formData.tanggal,
                notes: formData.notes,
                status: formData.status
            };
            onSave(payload);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
                <h3 className="mb-6 text-xl font-bold text-gray-800 dark:text-white">
                    {initialData ? "Edit Surat Jalan" : "Buat Surat Jalan (DO)"}
                </h3>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium">Surat Pesanan Konsumen (SPK) <span className="text-red-500">*</span></label>
                            <select
                                className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700 disabled:bg-gray-100 disabled:text-gray-500"
                                value={formData.sales_order_id}
                                onChange={(e) => setFormData({ ...formData, sales_order_id: e.target.value })}
                                disabled={!!initialData}
                            >
                                <option value="">-- Pilih SPK --</option>
                                {salesOrders.map((so: any) => (
                                    <option key={so.id} value={so.id}>{so.no_spk}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Gudang Pengiriman <span className="text-red-500">*</span></label>
                            <select
                                className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700 disabled:bg-gray-100 disabled:text-gray-500"
                                value={formData.warehouse_id}
                                onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })}
                                disabled={!!initialData}
                            >
                                <option value="">-- Pilih Gudang --</option>
                                {warehouses.map((w: any) => (
                                    <option key={w.id} value={w.id}>{w.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium">Tanggal Kirim <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
                                value={formData.tanggal}
                                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Catatan</label>
                            <input
                                type="text"
                                className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
                                value={formData.notes || ""}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </div>
                    {initialData && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Status <span className="text-red-500">*</span></label>
                                <select
                                    className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="draft">Draft</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="received">Received</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {!initialData && (
                        <div className="border-t border-gray-100 pt-4 mt-6">
                            <h4 className="text-sm font-bold text-gray-800 mb-4">Barang untuk Dikirim (Outstanding SPK)</h4>
                            {loadingSoItems ? (
                                <p className="text-sm text-gray-500">Memuat sisa barang SPK...</p>
                            ) : items.length > 0 ? (
                                <div className="space-y-3">
                                    <div className="flex gap-4 px-2 text-[10px] font-black uppercase tracking-wider text-gray-400">
                                        <div className="flex-1 min-w-0">Nama Produk</div>
                                        <div className="w-20 text-center">Total SPK</div>
                                        <div className="w-20 text-center">Terkirim</div>
                                        <div className="w-24 text-center">Sisa Order</div>
                                        <div className="w-32 text-center text-blue-600">Kirim Sekarang</div>
                                    </div>
                                    {items.map((item, index) => (
                                        <div key={index} className="flex gap-4 items-center bg-gray-50/50 p-3 rounded-xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all group">
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-bold text-gray-800 truncate">{item.product_name}</div>
                                                <div className="text-[10px] text-gray-400">ID Produk: {item.product_id}</div>
                                            </div>
                                            <div className="w-20 text-center text-sm font-medium text-gray-500">
                                                {item.qty_pesanan}
                                            </div>
                                            <div className="w-20 text-center text-sm font-medium text-emerald-600">
                                                {item.qty_terkirim}
                                            </div>
                                            <div className="w-24 text-center text-sm font-black text-gray-800">
                                                {item.qty_sisa}
                                            </div>
                                            <div className="w-32">
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        className="w-full border-2 border-transparent bg-white p-2 text-sm text-center font-black focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none rounded-lg shadow-sm transition-all group-hover:border-blue-200"
                                                        value={item.qty_dikirim === 0 ? "" : item.qty_dikirim}
                                                        onChange={(e) => handleItemChange(index, e.target.value)}
                                                        placeholder="0"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-center text-gray-500 border border-dashed border-gray-300 rounded-lg py-8 bg-gray-50">
                                    {formData.sales_order_id ? "Tidak ada sisa barang untuk dikirim pada SPK ini." : "Pilih SPK untuk melihat barang yang harus dikirim."}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Batal</button>
                    <Button onClick={handleSubmit}>Simpan Surat Jalan</Button>
                </div>
            </div>
        </div>
    );
}
