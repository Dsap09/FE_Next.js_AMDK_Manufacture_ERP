"use client";
import React, { useEffect, useState } from "react";
import { bomService } from "@/services/bomService";
import { productService } from "@/services/productService";
import { rawMaterialService } from "@/services/rawMaterialService";
import { unitService } from "@/services/unitService";
import {
    Plus, Loader2, ArrowRight, Package, Calculator, Trash2, Edit, Save, X, Search
} from "lucide-react";

export default function BOMPage() {
    const [loading, setLoading] = useState(true);
    const [boms, setBoms] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [materials, setMaterials] = useState<any[]>([]);
    const [units, setUnits] = useState<any[]>([]);

    // Create/Edit Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({
        product_id: "",
        batch_size: 1,
        notes: "",
        items: [{ raw_material_id: "", quantity: "", unit_id: "" }]
    });
    const [editId, setEditId] = useState<number | null>(null);

    // Cost Detail Modal State
    const [costDetail, setCostDetail] = useState<any>(null);
    const [isCostModalOpen, setIsCostModalOpen] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await bomService.getAll();
            setBoms(Array.isArray(res) ? res : res.data || []);
        } catch (error) {
            console.error("Failed to fetch BOMs:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdowns = async () => {
        try {
            const resProducts = await productService.getAll();
            setProducts(Array.isArray(resProducts) ? resProducts : resProducts.data || []);

            const resMaterials = await rawMaterialService.getAll();
            setMaterials(Array.isArray(resMaterials) ? resMaterials : resMaterials.data || []);

            const resUnits = await unitService.getAll();
            setUnits(Array.isArray(resUnits) ? resUnits : resUnits.data || []);
        } catch (error) {
            console.error("Failed to fetch dropdowns:", error);
        }
    };

    useEffect(() => {
        fetchData();
        fetchDropdowns();
    }, []);

    const handleAddItem = () => {
        setForm({ ...form, items: [...form.items, { raw_material_id: "", quantity: "", unit_id: "" }] });
    };

    const handleRemoveItem = (index: number) => {
        const newItems = form.items.filter((_, i) => i !== index);
        setForm({ ...form, items: newItems });
    };

    const handleEdit = (bom: any) => {
        setEditId(bom.id);
        setForm({
            product_id: bom.product_id,
            batch_size: bom.batch_size,
            notes: bom.notes || "",
            items: bom.items.map((item: any) => ({
                raw_material_id: item.raw_material_id,
                quantity: item.quantity,
                unit_id: item.unit_id || ""
            }))
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                product_id: Number(form.product_id),
                batch_size: Number(form.batch_size),
                notes: form.notes,
                items: form.items.map(i => ({
                    raw_material_id: Number(i.raw_material_id),
                    quantity: Number(i.quantity),
                    unit_id: i.unit_id ? Number(i.unit_id) : undefined
                }))
            };

            if (editId) {
                await bomService.update(editId, payload);
                alert("BOM berhasil diupdate!");
            } else {
                await bomService.create(payload);
                alert("BOM berhasil dibuat!");
            }

            setIsModalOpen(false);
            setEditId(null);
            fetchData();
            // Reset form
            setForm({ product_id: "", batch_size: 1, notes: "", items: [{ raw_material_id: "", quantity: "", unit_id: "" }] });
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal menyimpan BOM");
        }
    };

    const viewCost = async (id: number) => {
        try {
            const res = await bomService.calculateCost(id);
            setCostDetail(res);
            setIsCostModalOpen(true);
        } catch (error) {
            console.error("Failed to calculate cost:", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Hapus BOM ini?")) return;
        try {
            await bomService.delete(id);
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal hapus BOM");
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6 bg-gray-50/30 min-h-screen">
            {/* Header */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 dark:bg-gray-900">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                            <Package className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black uppercase italic text-gray-800 dark:text-white tracking-tighter">
                                Bill of Materials
                            </h1>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recipe Management</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setEditId(null);
                            setForm({ product_id: "", batch_size: 1, notes: "", items: [{ raw_material_id: "", quantity: "", unit_id: "" }] });
                            setIsModalOpen(true);
                        }}
                        className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
                    >
                        <Plus size={16} className="inline mr-2" /> Buat Resep Baru
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full flex justify-center py-20">
                        <Loader2 className="animate-spin text-gray-300" />
                    </div>
                ) : boms.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-gray-400 font-bold uppercase tracking-widest text-xs">
                        Belum ada BOM
                    </div>
                ) : (
                    boms.map((bom) => (
                        <div key={bom.id} className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all dark:bg-gray-900 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-black text-gray-800 dark:text-white uppercase italic">{bom.product?.name}</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{bom.bom_number}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(bom)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors" title="Edit">
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => viewCost(bom.id)} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors" title="Hitung Biaya">
                                        <Calculator size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(bom.id)} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors" title="Hapus">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-xs border-b border-gray-50 pb-2">
                                    <span className="text-gray-400 uppercase font-bold">Batch Size</span>
                                    <span className="font-bold">{bom.batch_size} {bom.product?.unit?.name}</span>
                                </div>
                                <div className="flex justify-between text-xs border-b border-gray-50 pb-2">
                                    <span className="text-gray-400 uppercase font-bold">Total Material</span>
                                    <span className="font-bold">{bom.items?.length || 0} Item</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-4 dark:bg-gray-800">
                                <p className="text-[10px] uppercase font-black text-gray-400 mb-2">Komposisi Utama:</p>
                                <ul className="space-y-1">
                                    {bom.items?.slice(0, 3).map((item: any) => (
                                        <li key={item.id} className="text-xs flex justify-between">
                                            <span className="text-gray-600 font-bold">{item.raw_material?.name}</span>
                                            <span className="text-gray-400 font-medium">{Number(item.quantity)} {item.unit?.name}</span>
                                        </li>
                                    ))}
                                    {(bom.items?.length || 0) > 3 && (
                                        <li className="text-[10px] text-gray-400 italic text-center mt-2">+ {(bom.items?.length || 0) - 3} lainnya</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl dark:bg-gray-900 overflow-y-auto max-h-[90vh]">
                        <div className="flex items-center justify-between border-b pb-4 mb-6">
                            <h3 className="text-lg font-black text-gray-800 dark:text-white uppercase italic">
                                {editId ? "Edit Resep (BOM)" : "Buat Resep Baru (BOM)"}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Produk</label>
                                    <select required value={form.product_id}
                                        disabled={!!editId}
                                        onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                                        className="w-full p-3 rounded-xl border-2 border-gray-100 text-sm font-bold focus:border-blue-500 outline-none dark:bg-gray-800 disabled:bg-gray-100 disabled:text-gray-500">
                                        <option value="">Pilih Produk...</option>
                                        {products.map((p) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Batch Size (Output)</label>
                                    <input type="number" required min="1" value={form.batch_size}
                                        onChange={(e) => setForm({ ...form, batch_size: Number(e.target.value) })}
                                        className="w-full p-3 rounded-xl border-2 border-gray-100 text-sm font-bold focus:border-blue-500 outline-none dark:bg-gray-800" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Material (Komposisi)</label>
                                <div className="bg-gray-50 p-4 rounded-2xl space-y-3 dark:bg-gray-800">
                                    {form.items.map((item, idx) => (
                                        <div key={idx} className="flex gap-3 items-start">
                                            <select required value={item.raw_material_id}
                                                onChange={(e) => {
                                                    const newItems = [...form.items];
                                                    newItems[idx].raw_material_id = e.target.value;
                                                    setForm({ ...form, items: newItems });
                                                }}
                                                className="flex-1 p-2.5 rounded-xl border-2 border-gray-200 text-sm font-bold focus:border-blue-500 outline-none">
                                                <option value="">Pilih Material...</option>
                                                {materials.map((m) => (
                                                    <option key={m.id} value={m.id}>{m.name} ({m.unit?.name})</option>
                                                ))}
                                            </select>
                                            <input type="number" required step="0.001" min="0" placeholder="Qty" value={item.quantity}
                                                onChange={(e) => {
                                                    const newItems = [...form.items];
                                                    newItems[idx].quantity = e.target.value;
                                                    setForm({ ...form, items: newItems });
                                                }}
                                                className="w-24 p-2.5 rounded-xl border-2 border-gray-200 text-sm font-bold focus:border-blue-500 outline-none" />

                                            <select required value={item.unit_id}
                                                onChange={(e) => {
                                                    const newItems = [...form.items];
                                                    newItems[idx].unit_id = e.target.value;
                                                    setForm({ ...form, items: newItems });
                                                }}
                                                className="w-24 p-2.5 rounded-xl border-2 border-gray-200 text-sm font-bold focus:border-blue-500 outline-none">
                                                <option value="">Unit...</option>
                                                {units.map((u) => (
                                                    <option key={u.id} value={u.id}>{u.name}</option>
                                                ))}
                                            </select>

                                            {form.items.length > 1 && (
                                                <button type="button" onClick={() => handleRemoveItem(idx)} className="p-2.5 text-red-400 hover:text-red-600">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button type="button" onClick={handleAddItem}
                                        className="mt-2 text-xs font-black text-blue-600 uppercase flex items-center gap-1 hover:underline">
                                        <Plus size={12} /> Tambah Material
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Catatan</label>
                                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    className="w-full p-3 rounded-xl border-2 border-gray-100 text-sm font-bold focus:border-blue-500 outline-none dark:bg-gray-800"
                                    rows={2} placeholder="Catatan tambahan..." />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-xs font-black text-gray-400 uppercase">Batal</button>
                                <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase shadow-lg">
                                    {editId ? "Simpan Perubahan" : "Simpan Resep"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Cost Detail Modal */}
            {isCostModalOpen && costDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl dark:bg-gray-900">
                        <div className="flex items-center justify-between border-b pb-4 mb-6">
                            <h3 className="text-lg font-black text-gray-800 dark:text-white uppercase italic">Kalkulasi Material Cost</h3>
                            <button onClick={() => setIsCostModalOpen(false)} className="text-gray-400 hover:text-red-500">✕</button>
                        </div>

                        <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 mb-6 text-center">
                            <p className="text-xs font-bold text-gray-500 uppercase">Cost Per Unit</p>
                            <p className="text-2xl font-black text-orange-600">Rp {Number(costDetail.material_cost_per_unit).toLocaleString('id-ID')}</p>
                            <p className="text-[10px] text-gray-400 mt-1">Estimasi berdasarkan harga pembelian terakhir material</p>
                        </div>

                        <div className="max-h-[300px] overflow-y-auto mb-6 pr-2">
                            <table className="w-full text-xs">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr className="text-left font-black text-gray-400 uppercase">
                                        <th className="p-2">Material</th>
                                        <th className="p-2 text-right">Qty</th>
                                        <th className="p-2 text-right">Harga</th>
                                        <th className="p-2 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {costDetail.details.map((detail: any, idx: number) => (
                                        <tr key={idx}>
                                            <td className="p-2 font-bold text-gray-700">{detail.raw_material}</td>
                                            <td className="p-2 text-right">{Number(detail.quantity)}</td>
                                            <td className="p-2 text-right text-gray-500">{Number(detail.unit_price).toLocaleString()}</td>
                                            <td className="p-2 text-right font-bold">Rp {Number(detail.total_cost).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-50 font-black">
                                        <td colSpan={3} className="p-2 text-right uppercase text-gray-500">Total Batch ({costDetail.batch_size})</td>
                                        <td className="p-2 text-right text-orange-600">Rp {Number(costDetail.material_cost_per_batch).toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <button onClick={() => setIsCostModalOpen(false)} className="w-full bg-gray-100 text-gray-600 py-3 rounded-2xl font-black uppercase text-xs hover:bg-gray-200">
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
