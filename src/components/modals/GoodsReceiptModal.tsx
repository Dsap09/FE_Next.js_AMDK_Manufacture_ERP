"use client";
import React, { useEffect, useState } from "react";
import { X, Package, Calendar, Warehouse, Truck, FileText, Plus, Trash2 } from "lucide-react";
import { goodsReceiptService } from "@/services/goodsReceiptService";
import { purchaseOrderService } from "@/services/purchaseOrderService";
import { warehouseService } from "@/services/warehouseService";

interface GoodsReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    initialData?: any;
}

export default function GoodsReceiptModal({
    isOpen,
    onClose,
    onSave,
    initialData,
}: GoodsReceiptModalProps) {
    const [loading, setLoading] = useState(false);
    const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [selectedPO, setSelectedPO] = useState<any>(null);

    const [formData, setFormData] = useState({
        purchase_order_id: "",
        warehouse_id: "",
        receipt_date: new Date().toISOString().split("T")[0],
        delivery_note_number: "",
        vehicle_number: "",
        type: "GOODS_RECEIPT" as "GOODS_RECEIPT" | "RETURN",
        notes: "",
    });

    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen) {
            fetchPurchaseOrders();
            fetchWarehouses();
        }
    }, [isOpen]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                purchase_order_id: initialData.purchase_order_id || "",
                warehouse_id: initialData.warehouse_id || "",
                receipt_date: initialData.receipt_date || new Date().toISOString().split("T")[0],
                delivery_note_number: initialData.delivery_note_number || "",
                vehicle_number: initialData.vehicle_number || "",
                type: initialData.type || "GOODS_RECEIPT",
                notes: initialData.notes || "",
            });
            if (initialData.items) {
                setItems(initialData.items);
            }
        } else {
            resetForm();
        }
    }, [initialData]);

    const fetchPurchaseOrders = async () => {
        try {
            const res = await purchaseOrderService.getAll();
            const data = Array.isArray(res) ? res : res.data || [];
            // Filter hanya PO yang status 'sent' (sudah dikirim supplier)
            const sentPOs = data.filter((po: any) => po.status === "sent");
            setPurchaseOrders(sentPOs);
        } catch (error) {
            console.error("Gagal fetch PO:", error);
        }
    };

    const fetchWarehouses = async () => {
        try {
            const res = await warehouseService.getAll();
            const data = Array.isArray(res) ? res : res.data || [];
            setWarehouses(data);
        } catch (error) {
            console.error("Gagal fetch warehouses:", error);
        }
    };

    const handlePOChange = async (poId: string) => {
        setFormData({ ...formData, purchase_order_id: poId });

        if (!poId) {
            setSelectedPO(null);
            setItems([]);
            return;
        }

        try {
            const res = await purchaseOrderService.getById(poId);
            const po = res.data || res;
            setSelectedPO(po);

            // Auto-populate items dari PO
            const poItems = po.items?.map((item: any) => ({
                purchase_order_item_id: item.id,
                raw_material_id: item.raw_material_id,
                product_id: item.product_id,
                unit_id: item.unit_id,
                name: item.raw_material?.name || item.product?.name || "-",
                unit_name: item.unit?.name || "-",
                quantity_ordered: item.quantity,
                quantity_received: item.quantity, // Default sama dengan ordered
                notes: "",
            })) || [];

            setItems(poItems);
        } catch (error) {
            console.error("Gagal fetch detail PO:", error);
        }
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.purchase_order_id || !formData.warehouse_id) {
            alert("PO dan Warehouse wajib dipilih!");
            return;
        }

        if (items.length === 0) {
            alert("Minimal harus ada 1 item!");
            return;
        }

        // Validasi quantity received
        const invalidItems = items.filter(
            (item) => !item.quantity_received || item.quantity_received <= 0
        );
        if (invalidItems.length > 0) {
            alert("Semua item harus memiliki quantity received > 0");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                ...formData,
                purchase_order_id: Number(formData.purchase_order_id),
                warehouse_id: Number(formData.warehouse_id),
                items: items.map((item) => ({
                    purchase_order_item_id: item.purchase_order_item_id,
                    quantity_received: Number(item.quantity_received),
                    notes: item.notes || "",
                })),
            };

            if (initialData?.id) {
                await goodsReceiptService.update(initialData.id, payload);
                alert("Goods Receipt berhasil diupdate!");
            } else {
                await goodsReceiptService.create(payload);
                alert("Goods Receipt berhasil dibuat!");
            }

            onSave();
            onClose();
            resetForm();
        } catch (error: any) {
            console.error("Error:", error);
            alert(error.response?.data?.message || "Gagal menyimpan Goods Receipt");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            purchase_order_id: "",
            warehouse_id: "",
            receipt_date: new Date().toISOString().split("T")[0],
            delivery_note_number: "",
            vehicle_number: "",
            type: "GOODS_RECEIPT",
            notes: "",
        });
        setItems([]);
        setSelectedPO(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl dark:bg-gray-900 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 p-6 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 rounded-2xl dark:bg-blue-900/20">
                            <Package className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase italic">
                                {initialData ? "Edit" : "Buat"} Goods Receipt
                            </h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">
                                Penerimaan Barang dari Supplier
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-red-500 transition-all rounded-xl hover:bg-red-50"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Grid 2 Kolom */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Purchase Order */}
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                                <FileText size={14} className="inline mr-1" /> Purchase Order
                            </label>
                            <select
                                value={formData.purchase_order_id}
                                onChange={(e) => handlePOChange(e.target.value)}
                                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 transition-all dark:bg-gray-800 dark:border-gray-700"
                                required
                                disabled={!!initialData}
                            >
                                <option value="">-- Pilih PO (Status: Sent) --</option>
                                {purchaseOrders.map((po) => (
                                    <option key={po.id} value={po.id}>
                                        {po.kode} - {po.supplier?.nama || "No Supplier"}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Warehouse */}
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                                <Warehouse size={14} className="inline mr-1" /> Gudang Penerima
                            </label>
                            <select
                                value={formData.warehouse_id}
                                onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })}
                                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 transition-all dark:bg-gray-800 dark:border-gray-700"
                                required
                            >
                                <option value="">-- Pilih Gudang --</option>
                                {warehouses.map((wh) => (
                                    <option key={wh.id} value={wh.id}>
                                        {wh.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Receipt Date */}
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                                <Calendar size={14} className="inline mr-1" /> Tanggal Terima
                            </label>
                            <input
                                type="date"
                                value={formData.receipt_date}
                                onChange={(e) => setFormData({ ...formData, receipt_date: e.target.value })}
                                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 transition-all dark:bg-gray-800 dark:border-gray-700"
                                required
                            />
                        </div>

                        {/* Delivery Note */}
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                                <FileText size={14} className="inline mr-1" /> No. Surat Jalan
                            </label>
                            <input
                                type="text"
                                value={formData.delivery_note_number}
                                onChange={(e) =>
                                    setFormData({ ...formData, delivery_note_number: e.target.value })
                                }
                                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 transition-all dark:bg-gray-800 dark:border-gray-700"
                                placeholder="Opsional"
                            />
                        </div>

                        {/* Vehicle Number */}
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                                <Truck size={14} className="inline mr-1" /> No. Kendaraan
                            </label>
                            <input
                                type="text"
                                value={formData.vehicle_number}
                                onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 transition-all dark:bg-gray-800 dark:border-gray-700"
                                placeholder="Opsional"
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                                Catatan
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 transition-all dark:bg-gray-800 dark:border-gray-700"
                                rows={3}
                                placeholder="Catatan tambahan..."
                            />
                        </div>
                    </div>

                    {/* Items Table */}
                    {items.length > 0 && (
                        <div className="border-2 border-gray-100 rounded-2xl overflow-hidden dark:border-gray-800">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                    Daftar Barang
                                </h4>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr className="text-[10px] font-black uppercase text-gray-400">
                                            <th className="p-4">Nama Barang</th>
                                            <th className="p-4 text-center">Qty Ordered</th>
                                            <th className="p-4 text-center">Qty Received</th>
                                            <th className="p-4">Catatan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {items.map((item, index) => (
                                            <tr key={index}>
                                                <td className="p-4 font-bold text-gray-700 dark:text-gray-300">
                                                    {item.name}
                                                    <span className="text-xs text-gray-400 ml-2">({item.unit_name})</span>
                                                </td>
                                                <td className="p-4 text-center font-black text-blue-600">
                                                    {item.quantity_ordered}
                                                </td>
                                                <td className="p-4">
                                                    <input
                                                        type="number"
                                                        value={item.quantity_received}
                                                        onChange={(e) =>
                                                            handleItemChange(index, "quantity_received", e.target.value)
                                                        }
                                                        className="w-24 border-2 border-blue-50 rounded-xl px-3 py-2 text-center font-black outline-none focus:border-blue-500 transition-all dark:bg-gray-800"
                                                        min="0"
                                                        max={item.quantity_ordered}
                                                        step="0.01"
                                                        required
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <input
                                                        type="text"
                                                        value={item.notes}
                                                        onChange={(e) => handleItemChange(index, "notes", e.target.value)}
                                                        className="w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all dark:bg-gray-800"
                                                        placeholder="Catatan item..."
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {selectedPO && items.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                            <p className="text-xs font-bold uppercase">PO tidak memiliki item</p>
                        </div>
                    )}
                </form>

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t border-gray-100 p-6 dark:border-gray-800">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 text-xs font-black text-gray-400 uppercase hover:text-gray-600 transition-all"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || items.length === 0}
                        className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Menyimpan..." : initialData ? "Update" : "Simpan"}
                    </button>
                </div>
            </div>
        </div>
    );
}
