"use client";
import React, { useEffect, useState } from "react";
import Button from "../ui/button/Button";
import { salesOrderService } from "@/services/salesOrderService";
import * as Icons from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData?: any;
}

export default function SalesInvoiceModal({ isOpen, onClose, onSave, initialData }: Props) {
    const [salesOrders, setSalesOrders] = useState<any[]>([]);
    const [selectedSoDetail, setSelectedSoDetail] = useState<any | null>(null);

    const [formData, setFormData] = useState({
        sales_order_id: "",
        payment_type: "full",
        dp_amount: 0,
        due_date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split("T")[0],
        notes: ""
    });

    useEffect(() => {
        if (isOpen) {
            salesOrderService.getAll().then((res: any) => {
                const sos = res.data || (Array.isArray(res) ? res : []);
                setSalesOrders(sos);
            });

            if (initialData) {
                setFormData({
                    sales_order_id: initialData.sales_order_id?.toString() || "",
                    payment_type: initialData.payment_type || "full",
                    dp_amount: initialData.dp_amount || 0,
                    due_date: initialData.due_date ? initialData.due_date.split('T')[0] : new Date().toISOString().split("T")[0],
                    notes: initialData.notes || ""
                });

                // Set SO details if editing
                const so = salesOrders.find(o => o.id === initialData.sales_order_id);
                if (so) setSelectedSoDetail(so);
            } else {
                setFormData({
                    sales_order_id: "",
                    payment_type: "full",
                    dp_amount: 0,
                    due_date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split("T")[0],
                    notes: ""
                });
                setSelectedSoDetail(null);
            }
        }
    }, [isOpen, initialData, salesOrders.length]);

    const handleSoChange = (soId: string) => {
        setFormData({ ...formData, sales_order_id: soId });
        const so = salesOrders.find(o => o.id.toString() === soId);
        setSelectedSoDetail(so || null);
    };

    const handleSubmit = () => {
        if (!initialData) {
            if (!formData.sales_order_id) return alert("Harap pilih Surat Pesanan (SPK)!");
            if (formData.payment_type === "dp" && (formData.dp_amount <= 0)) {
                return alert("Harap masukkan jumlah DP yang valid!");
            }

            const payload = {
                sales_order_id: parseInt(formData.sales_order_id),
                payment_type: formData.payment_type,
                dp_amount: formData.payment_type === 'dp' ? formData.dp_amount : undefined,
                notes: formData.notes
            };

            onSave(payload);
        } else {
            const payload = {
                due_date: formData.due_date,
                notes: formData.notes
            };
            onSave(payload);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-900 flex flex-col border border-white/20">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-blue-600/5 to-transparent">
                    <div>
                        <h3 className="text-xl font-black text-gray-800 dark:text-white">
                            {initialData ? "Kelola Header Invoice" : "Penerbitan Invoice Baru"}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-widest">Penjualan & Penagihan</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400">
                        <Icons.X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto space-y-6">
                    {!initialData && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1.5">
                                    <Icons.FileSearch className="w-3.5 h-3.5" /> Referensi SPK <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    className="w-full rounded-xl border-2 border-gray-100 bg-gray-50 p-3 text-sm font-bold text-gray-700 focus:border-blue-500 focus:ring-0 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 ring-0 outline-none transition-all"
                                    value={formData.sales_order_id}
                                    onChange={(e) => handleSoChange(e.target.value)}
                                >
                                    <option value="">-- Pilih Nomor SPK --</option>
                                    {salesOrders.map((so: any) => (
                                        <option key={so.id} value={so.id}>{so.no_spk} - {so.customer?.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1.5">
                                    <Icons.CreditCard className="w-3.5 h-3.5" /> Metode Penagihan <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    className="w-full rounded-xl border-2 border-gray-100 bg-gray-50 p-3 text-sm font-bold text-gray-700 focus:border-blue-500 focus:ring-0 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 ring-0 outline-none transition-all"
                                    value={formData.payment_type}
                                    onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
                                >
                                    <option value="full">Lunas Penuh (Full Payment)</option>
                                    <option value="dp">Uang Muka (Down Payment)</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* SO Quick Info Section */}
                    {selectedSoDetail && (
                        <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] uppercase font-black text-blue-500 tracking-tighter">Nama Konsumen</p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{selectedSoDetail.customer?.name || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-black text-blue-500 tracking-tighter">Total Pesanan</p>
                                    <p className="text-sm font-black text-blue-700 dark:text-blue-400">Rp {Number(selectedSoDetail.total_price).toLocaleString('id-ID')}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!initialData && formData.payment_type === "dp" && (
                        <div className="space-y-2 animate-in zoom-in-95 duration-200">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1.5">
                                <Icons.Wallet className="w-3.5 h-3.5" /> Nominal Uang Muka (DP) <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400 mt-0.5">Rp</span>
                                <input
                                    type="number"
                                    placeholder="0"
                                    className="w-full rounded-xl border-2 border-gray-100 bg-gray-50 p-3 pl-12 text-lg font-black text-gray-800 focus:border-blue-500 focus:ring-0 dark:bg-gray-800 dark:border-gray-700 dark:text-white ring-0 outline-none transition-all"
                                    value={formData.dp_amount || ""}
                                    onChange={(e) => setFormData({ ...formData, dp_amount: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                    )}

                    {initialData && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1.5">
                                <Icons.Calendar className="w-3.5 h-3.5" /> Tanggal Jatuh Tempo <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="date"
                                className="w-full rounded-xl border-2 border-gray-100 bg-gray-50 p-3 text-sm font-bold text-gray-700 focus:border-blue-500 focus:ring-0 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 ring-0 outline-none transition-all"
                                value={formData.due_date}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1.5">
                            <Icons.MessageSquare className="w-3.5 h-3.5" /> Catatan Tambahan
                        </label>
                        <textarea
                            rows={3}
                            className="w-full rounded-xl border-2 border-gray-100 bg-gray-50 p-3 text-sm font-medium text-gray-700 focus:border-blue-500 focus:ring-0 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 ring-0 outline-none transition-all resize-none"
                            placeholder="Contoh: Tagihan termin 1, Mohon segera dilunasi..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    {!initialData && (
                        <div className="bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-400 p-4 rounded-r-xl">
                            <div className="flex gap-3">
                                <Icons.AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-amber-800 dark:text-amber-400">Informasi Kalkulasi Otomatis</p>
                                    <p className="text-[10px] text-amber-700/80 dark:text-amber-500/80 mt-1 leading-relaxed italic animate-pulse">
                                        Pintu sistem akan menghitung diskon otomatis (5% retur galon &gt; 5 dan 2% repeat customer) berdasarkan riwayat transaksi di backend. Pastikan data SPK sudah memiliki riwayat pengiriman.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
                    >
                        Batalkan
                    </button>
                    <Button
                        onClick={handleSubmit}
                        className="shadow-xl shadow-blue-500/20 px-8 py-2.5"
                    >
                        {initialData ? "Simpan Perubahan" : "Terbitkan Invoice"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

