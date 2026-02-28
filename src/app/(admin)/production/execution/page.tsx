"use client";
import React, { useEffect, useState } from "react";
import { productionExecutionService } from "@/services/productionExecutionService";
import {
    Play, CheckCircle, Clock, Users, DollarSign, FileText, Loader2, ArrowRight
} from "lucide-react";

export default function ProductionExecutionPage() {
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"released" | "in_progress" | "completed">("released");

    // Data list
    const [releasedOrders, setReleasedOrders] = useState<any[]>([]);
    const [inProgressOrders, setInProgressOrders] = useState<any[]>([]);
    const [completedExecutions, setCompletedExecutions] = useState<any[]>([]);

    // Start Modal
    const [isStartOpen, setIsStartOpen] = useState(false);
    const [startForm, setStartForm] = useState({ id: "", started_at: "", operator: "" });

    // Complete Modal
    const [isCompleteOpen, setIsCompleteOpen] = useState(false);
    const [completeForm, setCompleteForm] = useState<{
        id: string; quantity_actual: string; quantity_waste: string;
        completed_at: string; labor_cost: string; overhead_cost: string; notes: string;
    }>({
        id: "", quantity_actual: "", quantity_waste: "",
        completed_at: "", labor_cost: "", overhead_cost: "", notes: ""
    });

    // Report Detail Modal
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [reportData, setReportData] = useState<any>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            if (tab === "released") {
                const res = await productionExecutionService.getReadyOrders();
                setReleasedOrders(Array.isArray(res) ? res : res.data || []);
            } else if (tab === "in_progress") {
                const res = await productionExecutionService.getInProgressOrders();
                setInProgressOrders(Array.isArray(res) ? res : res.data || []);
            } else {
                const res = await productionExecutionService.getAll();
                setCompletedExecutions(Array.isArray(res) ? res : res.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [tab]);

    const handleStart = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await productionExecutionService.start(startForm.id, {
                started_at: startForm.started_at,
                operator: startForm.operator
            });
            alert("Produksi dimulai!");
            setIsStartOpen(false);
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal memulai produksi");
        }
    };

    const handleComplete = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await productionExecutionService.complete(completeForm.id, {
                quantity_actual: Number(completeForm.quantity_actual),
                quantity_waste: Number(completeForm.quantity_waste),
                completed_at: completeForm.completed_at,
                labor_cost: Number(completeForm.labor_cost),
                overhead_cost: Number(completeForm.overhead_cost),
                notes: completeForm.notes
            });
            alert("Produksi selesai! HPP telah dihitung.");
            setIsCompleteOpen(false);
            setTab("completed");
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal menyelesaikan produksi");
        }
    };

    const viewReport = async (id: number) => {
        try {
            const res = await productionExecutionService.getReport(id);
            setReportData(res);
            setIsReportOpen(true);
        } catch (error) {
            console.error("Failed to fetch report:", error);
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6 bg-gray-50/30 min-h-screen">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 dark:bg-gray-900">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                            <Play className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black uppercase italic text-gray-800 dark:text-white tracking-tighter">
                                Produk Eksekusi
                            </h1>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Execution & Costing (HPP)</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 pb-1">
                <button onClick={() => setTab("released")} className={`px-4 py-2 text-xs font-bold uppercase transition-all border-b-2 ${tab === "released" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-400"}`}>
                    Ready to Start
                </button>
                <button onClick={() => setTab("in_progress")} className={`px-4 py-2 text-xs font-bold uppercase transition-all border-b-2 ${tab === "in_progress" ? "border-orange-500 text-orange-600" : "border-transparent text-gray-400"}`}>
                    In Progress
                </button>
                <button onClick={() => setTab("completed")} className={`px-4 py-2 text-xs font-bold uppercase transition-all border-b-2 ${tab === "completed" ? "border-emerald-500 text-emerald-600" : "border-transparent text-gray-400"}`}>
                    Completed (History)
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-300" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Released Orders (Ready to Start) */}
                    {tab === "released" && releasedOrders.map(po => (
                        <div key={po.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm dark:bg-gray-900">
                            <span className="text-[10px] font-black uppercase bg-blue-50 text-blue-600 px-3 py-1 rounded-full mb-2 inline-block">Released</span>
                            <h3 className="text-lg font-black">{po.product?.name}</h3>
                            <p className="text-xs text-gray-400 font-bold mb-4">{po.production_number}</p>

                            <div className="space-y-2 text-xs text-gray-500 mb-6">
                                <div className="flex justify-between">
                                    <span>Plan Qty:</span>
                                    <span className="font-bold">{po.quantity_plan} {po.product?.unit?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Date:</span>
                                    <span>{po.production_date}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Warehouse:</span>
                                    <span>{po.warehouse?.name}</span>
                                </div>
                            </div>

                            <button onClick={() => {
                                setStartForm({ id: po.id, started_at: new Date().toISOString().slice(0, 16), operator: "" });
                                setIsStartOpen(true);
                            }} className="w-full bg-blue-600 text-white py-3 rounded-2xl text-xs font-black uppercase hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex justify-center items-center gap-2">
                                <Play size={16} /> Mulai Produksi
                            </button>
                        </div>
                    ))}

                    {/* In Progress Orders (Ready to Complete) */}
                    {tab === "in_progress" && inProgressOrders.map(po => (
                        <div key={po.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm dark:bg-gray-900 border-l-4 border-l-orange-500">
                            <span className="text-[10px] font-black uppercase bg-orange-50 text-orange-600 px-3 py-1 rounded-full mb-2 inline-block">In Progress</span>
                            <h3 className="text-lg font-black">{po.product?.name}</h3>
                            <p className="text-xs text-gray-400 font-bold mb-4">{po.production_number}</p>

                            <div className="space-y-2 text-xs text-gray-500 mb-6">
                                <div className="flex justify-between">
                                    <span>Plan Qty:</span>
                                    <span className="font-bold">{po.quantity_plan} {po.product?.unit?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Operator:</span>
                                    <span>{po.operator}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Started:</span>
                                    <span>{po.started_at}</span>
                                </div>
                            </div>

                            <button onClick={() => {
                                setCompleteForm({
                                    id: po.id, quantity_actual: po.quantity_plan, quantity_waste: "0",
                                    completed_at: new Date().toISOString().slice(0, 16), labor_cost: "0", overhead_cost: "0", notes: ""
                                });
                                setIsCompleteOpen(true);
                            }} className="w-full bg-orange-600 text-white py-3 rounded-2xl text-xs font-black uppercase hover:bg-orange-700 shadow-lg shadow-orange-100 transition-all flex justify-center items-center gap-2">
                                <CheckCircle size={16} /> Selesai & Hitung HPP
                            </button>
                        </div>
                    ))}

                    {/* Completed Executions (History) */}
                    {tab === "completed" && completedExecutions.map(po => (
                        <div key={po.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm dark:bg-gray-900 opacity-80 hover:opacity-100 transition-opacity">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full mb-2 inline-block">Completed</span>
                                    <h3 className="text-lg font-black">{po.product?.name}</h3>
                                    <p className="text-xs text-gray-400 font-bold">{po.production_number}</p>
                                </div>
                                <button onClick={() => viewReport(po.id)} className="p-2 bg-gray-50 text-gray-500 hover:text-blue-600 rounded-xl">
                                    <FileText size={18} />
                                </button>
                            </div>

                            <div className="mt-4 p-3 bg-gray-50 rounded-2xl">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-500 uppercase">HPP / Unit</span>
                                    <span className="text-sm font-black text-emerald-600">Rp {Number(po.hpp_per_unit).toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs text-gray-400">Actual Qty</span>
                                    <span className="text-xs font-bold">{Number(po.quantity_actual)} {po.product?.unit?.name}</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Empty States */}
                    {!loading && ((tab === "released" && releasedOrders.length === 0) || (tab === "in_progress" && inProgressOrders.length === 0) || (tab === "completed" && completedExecutions.length === 0)) && (
                        <div className="col-span-full text-center py-20 text-gray-400 font-bold uppercase tracking-widest text-xs">
                            Tidak ada data {tab.replace("_", " ")}
                        </div>
                    )}
                </div>
            )}

            {/* Start Modal */}
            {isStartOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl dark:bg-gray-900">
                        <h3 className="text-lg font-black mb-4 uppercase italic">Mulai Produksi</h3>
                        <form onSubmit={handleStart} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Waktu Mulai</label>
                                <input type="datetime-local" required value={startForm.started_at} onChange={e => setStartForm({ ...startForm, started_at: e.target.value })} className="w-full p-3 rounded-xl border border-gray-200" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Operator (PIC)</label>
                                <input type="text" required value={startForm.operator} onChange={e => setStartForm({ ...startForm, operator: e.target.value })} className="w-full p-3 rounded-xl border border-gray-200" placeholder="Nama Operator" />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsStartOpen(false)} className="px-6 py-2 text-xs font-black text-gray-400 uppercase">Batal</button>
                                <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase">Mulai</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Complete Modal */}
            {isCompleteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl dark:bg-gray-900 overflow-y-auto max-h-[90vh]">
                        <h3 className="text-lg font-black mb-4 uppercase italic">Selesaikan Produksi</h3>
                        <form onSubmit={handleComplete} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Actual Qty</label>
                                    <input type="number" required step="0.001" value={completeForm.quantity_actual} onChange={e => setCompleteForm({ ...completeForm, quantity_actual: e.target.value })} className="w-full p-3 rounded-xl border border-gray-200" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Waste Qty (Gagal)</label>
                                    <input type="number" step="0.001" value={completeForm.quantity_waste} onChange={e => setCompleteForm({ ...completeForm, quantity_waste: e.target.value })} className="w-full p-3 rounded-xl border border-gray-200" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Biaya Tenaga Kerja (Labor)</label>
                                    <input type="number" value={completeForm.labor_cost} onChange={e => setCompleteForm({ ...completeForm, labor_cost: e.target.value })} className="w-full p-3 rounded-xl border border-gray-200" placeholder="0" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Biaya Overhead</label>
                                    <input type="number" value={completeForm.overhead_cost} onChange={e => setCompleteForm({ ...completeForm, overhead_cost: e.target.value })} className="w-full p-3 rounded-xl border border-gray-200" placeholder="0" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Waktu Selesai</label>
                                <input type="datetime-local" required value={completeForm.completed_at} onChange={e => setCompleteForm({ ...completeForm, completed_at: e.target.value })} className="w-full p-3 rounded-xl border border-gray-200" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Catatan</label>
                                <textarea value={completeForm.notes} onChange={e => setCompleteForm({ ...completeForm, notes: e.target.value })} className="w-full p-3 rounded-xl border border-gray-200" rows={2} />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsCompleteOpen(false)} className="px-6 py-2 text-xs font-black text-gray-400 uppercase">Batal</button>
                                <button type="submit" className="bg-emerald-600 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase shadow-lg">Selesai</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Report Modal */}
            {isReportOpen && reportData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl dark:bg-gray-900 overflow-y-auto max-h-[90vh]">
                        <div className="flex items-center justify-between border-b pb-4 mb-6">
                            <div>
                                <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase italic">{reportData.product}</h3>
                                <p className="text-xs text-gray-400 font-bold">{reportData.production_number}</p>
                            </div>
                            <button onClick={() => setIsReportOpen(false)} className="text-gray-400 hover:text-red-500">✕</button>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="p-4 bg-gray-50 rounded-2xl text-center">
                                <p className="text-[10px] font-black uppercase text-gray-400">Total HPP</p>
                                <p className="text-lg font-black text-gray-800">Rp {Number(reportData.total_production_cost).toLocaleString()}</p>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-2xl text-center">
                                <p className="text-[10px] font-black uppercase text-blue-400">Yield</p>
                                <p className="text-lg font-black text-blue-600">{Number(reportData.quantity_actual)}</p>
                            </div>
                            <div className="p-4 bg-emerald-50 rounded-2xl text-center border-2 border-emerald-100">
                                <p className="text-[10px] font-black uppercase text-emerald-500">HPP Per Unit</p>
                                <p className="text-lg font-black text-emerald-600">Rp {Number(reportData.hpp_per_unit).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h4 className="text-xs font-black uppercase text-gray-400 mb-3 ml-1">Detail Biaya</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center p-3 rounded-xl border border-gray-100">
                                    <span className="text-sm font-bold text-gray-600">Material Cost</span>
                                    <span className="text-sm font-black">Rp {Number(reportData.material_cost).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-xl border border-gray-100">
                                    <span className="text-sm font-bold text-gray-600">labor Cost</span>
                                    <span className="text-sm font-black">Rp {Number(reportData.labor_cost).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-xl border border-gray-100">
                                    <span className="text-sm font-bold text-gray-600">Overhead Cost</span>
                                    <span className="text-sm font-black">Rp {Number(reportData.overhead_cost).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h4 className="text-xs font-black uppercase text-gray-400 mb-3 ml-1">Material Used</h4>
                            <table className="w-full text-xs">
                                <tbody className="divide-y divide-gray-50">
                                    {reportData.material_usage.map((m: any, idx: number) => (
                                        <tr key={idx}>
                                            <td className="p-2 font-bold">{m.material}</td>
                                            <td className="p-2 text-right">{Number(m.quantity_used)}</td>
                                            <td className="p-2 text-right text-gray-400">Rp {Number(m.total_cost).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <button onClick={() => setIsReportOpen(false)} className="w-full bg-gray-100 text-gray-600 py-3 rounded-2xl font-black uppercase text-xs hover:bg-gray-200">
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
