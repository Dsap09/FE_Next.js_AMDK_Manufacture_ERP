"use client";
import React, { useEffect, useState } from "react";
import { productionOrderService } from "@/services/productionOrderService";
import { productService } from "@/services/productService";
import { bomService } from "@/services/bomService";
import { warehouseService } from "@/services/warehouseService";
import {
    Plus, Loader2, Factory, Calendar, ClipboardCheck, AlertTriangle, Check, Trash2, X, Play, Edit
} from "lucide-react";

export default function ProductionOrderPage() {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<any[]>([]);
    const [filterStatus, setFilterStatus] = useState("draft");

    // Dropdowns
    const [products, setProducts] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [boms, setBoms] = useState<any[]>([]); // Filtered BOMs for selected product

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState({
        product_id: "",
        bom_id: "",
        warehouse_id: "",
        production_date: new Date().toISOString().split("T")[0],
        quantity_plan: "",
        notes: ""
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await productionOrderService.getAll({ status: filterStatus === "all" ? undefined : filterStatus });
            setOrders(Array.isArray(res) ? res : res.data || []);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setLoading(false);
        }
    };

    // ... (fetchDropdowns, useEffects remain same)

    const fetchDropdowns = async () => {
        try {
            const resProd = await productService.getAll();
            setProducts(Array.isArray(resProd) ? resProd : resProd.data || []);
            const resWh = await warehouseService.getAll();
            setWarehouses(Array.isArray(resWh) ? resWh : resWh.data || []);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filterStatus]);

    useEffect(() => {
        fetchDropdowns();
    }, []);

    // When product changes, fetch compatible BOMs
    useEffect(() => {
        const fetchBoms = async () => {
            if (!form.product_id) {
                setBoms([]);
                return;
            }
            try {
                const res = await bomService.getAll({ product_id: form.product_id, is_active: true });
                setBoms(Array.isArray(res) ? res : res.data || []);
            } catch (e) {
                console.error(e);
            }
        };
        fetchBoms();
    }, [form.product_id]);

    const handleEdit = (po: any) => {
        setEditId(po.id);
        setForm({
            product_id: po.product_id,
            bom_id: po.bom_id,
            warehouse_id: po.warehouse_id,
            production_date: po.production_date,
            quantity_plan: po.quantity_plan,
            notes: po.notes || ""
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editId) {
                await productionOrderService.update(editId, {
                    production_date: form.production_date,
                    quantity_plan: Number(form.quantity_plan),
                    notes: form.notes
                });
                alert("Production Order berhasil diupdate!");
            } else {
                await productionOrderService.create({
                    product_id: Number(form.product_id),
                    bom_id: Number(form.bom_id),
                    warehouse_id: Number(form.warehouse_id),
                    production_date: form.production_date,
                    quantity_plan: Number(form.quantity_plan),
                    notes: form.notes
                });
                alert("Production Order berhasil dibuat!");
            }

            setIsModalOpen(false);
            setEditId(null);
            fetchData();
            setForm({ product_id: "", bom_id: "", warehouse_id: "", production_date: new Date().toISOString().split("T")[0], quantity_plan: "", notes: "" });
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal menyimpan Production Order");
        }
    };

    const handleRelease = async (id: number) => {
        if (!confirm("Release order ini? Stok material akan dicek.")) return;
        try {
            await productionOrderService.release(id);
            alert("Order berhasil direlease! Siap produksi.");
            fetchData();
        } catch (error: any) {
            const insufficient = error.response?.data?.insufficient_materials;
            if (insufficient) {
                let msg = "Material tidak mencukupi:\n";
                insufficient.forEach((m: any) => {
                    msg += `- ${m.material}: Butuh ${m.required}, Stok ${m.available}\n`;
                });
                alert(msg);
            } else {
                alert(error.response?.data?.message || "Gagal release order");
            }
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Hapus order ini?")) return;
        try {
            await productionOrderService.delete(id);
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal hapus order");
        }
    };

    const getStatusColor = (status: string) => {
        const colors: any = {
            draft: "bg-gray-100 text-gray-500",
            released: "bg-blue-100 text-blue-600",
            in_progress: "bg-orange-100 text-orange-600",
            completed: "bg-emerald-100 text-emerald-600",
        };
        return colors[status] || "bg-gray-100";
    };

    return (
        <div className="p-4 md:p-6 space-y-6 bg-gray-50/30 min-h-screen">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 dark:bg-gray-900">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                            <Factory className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black uppercase italic text-gray-800 dark:text-white tracking-tighter">
                                Production Order
                            </h1>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Planning & Execution</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setEditId(null);
                            setForm({ product_id: "", bom_id: "", warehouse_id: "", production_date: new Date().toISOString().split("T")[0], quantity_plan: "", notes: "" });
                            setIsModalOpen(true);
                        }}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
                    >
                        <Plus size={16} className="inline mr-2" /> Plan Order
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 border-b border-gray-200 pb-1">
                {["draft", "released", "in_progress", "completed", "all"].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 text-xs font-bold uppercase transition-all border-b-2 ${filterStatus === status ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                    >
                        {status.replace("_", " ")}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-300" /></div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest text-xs">Belum ada Production Order</div>
                ) : (
                    orders.map((po) => (
                        <div key={po.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all dark:bg-gray-900 flex flex-col md:flex-row gap-6 items-center">
                            <div className="flex-1">
                                <div className="flex gap-3 mb-2">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(po.status)}`}>
                                        {po.status.replace("_", " ")}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{po.production_number}</span>
                                </div>
                                <h3 className="text-lg font-black text-gray-800 dark:text-white uppercase italic">{po.product?.name}</h3>
                                <div className="flex gap-6 mt-3 text-xs text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <ClipboardCheck size={14} />
                                        <span className="font-bold">Plan: {Number(po.quantity_plan).toLocaleString()} {po.product?.unit?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} />
                                        <span>{po.production_date}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Factory size={14} />
                                        <span>{po.warehouse?.name}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                {po.status === "draft" && (
                                    <>
                                        <button onClick={() => handleEdit(po)} className="bg-blue-50 text-blue-600 p-2 rounded-xl transition-colors hover:bg-blue-100" title="Edit Date/Qty/Note">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleRelease(po.id)} className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-emerald-100 transition-colors">
                                            <Play size={14} /> Release
                                        </button>
                                        <button onClick={() => handleDelete(po.id)} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </>
                                )}
                                {po.status === "released" && (
                                    <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[10px] font-bold uppercase flex items-center gap-2">
                                        <Check size={14} /> Ready to execute
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl dark:bg-gray-900 overflow-y-auto">
                        <div className="flex items-center justify-between border-b pb-4 mb-6">
                            <h3 className="text-lg font-black text-gray-800 dark:text-white uppercase italic">
                                {editId ? "Edit Production Order" : "Plan Production"}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Product</label>
                                <select required value={form.product_id}
                                    disabled={!!editId}
                                    onChange={(e) => setForm({ ...form, product_id: e.target.value, bom_id: "" })}
                                    className="w-full p-3 rounded-xl border-2 border-gray-100 text-sm font-bold focus:border-indigo-500 outline-none dark:bg-gray-800 disabled:bg-gray-100 disabled:text-gray-500">
                                    <option value="">Select Product...</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>

                            {/* Auto-fetch BOMs when product selected */}
                            {form.product_id && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Bill of Material (BOM)</label>
                                    <select required value={form.bom_id}
                                        disabled={!!editId}
                                        onChange={(e) => setForm({ ...form, bom_id: e.target.value })}
                                        className="w-full p-3 rounded-xl border-2 border-gray-100 text-sm font-bold focus:border-indigo-500 outline-none dark:bg-gray-800 disabled:bg-gray-100 disabled:text-gray-500">
                                        <option value="">Select BOM Recipe...</option>
                                        {boms.map(b => <option key={b.id} value={b.id}>{b.bom_number} (Batch: {b.batch_size})</option>)}
                                    </select>
                                    {boms.length === 0 && <p className="text-xs text-red-500 mt-1">Product ini belum memiliki BOM aktif.</p>}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Target Warehouse</label>
                                <select required value={form.warehouse_id}
                                    disabled={!!editId}
                                    onChange={(e) => setForm({ ...form, warehouse_id: e.target.value })}
                                    className="w-full p-3 rounded-xl border-2 border-gray-100 text-sm font-bold focus:border-indigo-500 outline-none dark:bg-gray-800 disabled:bg-gray-100 disabled:text-gray-500">
                                    <option value="">Select Warehouse...</option>
                                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Qty Plan</label>
                                    <input type="number" required min="1" value={form.quantity_plan}
                                        onChange={(e) => setForm({ ...form, quantity_plan: Number(e.target.value) })}
                                        className="w-full p-3 rounded-xl border-2 border-gray-100 text-sm font-bold focus:border-indigo-500 outline-none dark:bg-gray-800" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Date</label>
                                    <input type="date" required value={form.production_date}
                                        onChange={(e) => setForm({ ...form, production_date: e.target.value })}
                                        className="w-full p-3 rounded-xl border-2 border-gray-100 text-sm font-bold focus:border-indigo-500 outline-none dark:bg-gray-800" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Notes</label>
                                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    className="w-full p-3 rounded-xl border-2 border-gray-100 text-sm font-bold focus:border-indigo-500 outline-none dark:bg-gray-800"
                                    rows={2} placeholder="Optional notes..." />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-xs font-black text-gray-400 uppercase">Cancel</button>
                                <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase shadow-lg">
                                    {editId ? "Save Changes" : "Save Order"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
