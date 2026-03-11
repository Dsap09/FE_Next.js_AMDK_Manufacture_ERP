"use client";
import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { stockAdjustmentService } from "@/services/stockAdjustmentService";
import StockAdjustmentModal from "@/components/modals/StockAdjustmentModal";
import { 
    Package, 
    Droplets, 
    Plus, 
    Trash2, 
    Pencil, 
    Calendar, 
    Warehouse, 
    Info, 
    AlertCircle,
    Loader2
} from "lucide-react";

type AdjustmentTab = "product" | "raw_material";

export default function StockAdjustmentPage() {
  const [activeTab, setActiveTab] = useState<AdjustmentTab>("product");
  const [adjustments, setAdjustments] = useState([]);
  const [rawAdjustments, setRawAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resProd, resRaw] = await Promise.all([
        stockAdjustmentService.getAll(),
        stockAdjustmentService.getRawMaterials()
      ]);
      setAdjustments(Array.isArray(resProd) ? resProd : resProd.data || []);
      setRawAdjustments(Array.isArray(resRaw) ? resRaw : resRaw.data || []);
    } catch (error) {
      console.error("Gagal mengambil data penyesuaian");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: number, type: AdjustmentTab) => {
    if (confirm("Hapus data penyesuaian ini? (Ini tidak akan mengembalikan stok)")) {
        try {
            if (type === "product") await stockAdjustmentService.delete(id);
            else await stockAdjustmentService.deleteRawMaterial(id);
            fetchData();
        } catch (e) {
            alert("Gagal menghapus data.");
        }
    }
  };

  const formatNumber = (num: any) => parseFloat(num || 0).toLocaleString('id-ID');

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50/30 min-h-screen flex flex-col items-stretch max-w-full overflow-hidden">
      <PageBreadcrumb pageName="Penyesuaian Stok (Adjustment)" />

      {/* Header Card */}
      <div className="flex-none w-full">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 dark:bg-gray-900 dark:border-gray-800 overflow-hidden">
          <div className="flex items-center gap-4 min-w-0">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-100 dark:shadow-none shrink-0">
                <AlertCircle className="text-white" size={24} />
            </div>
            <div className="min-w-0">
                <h1 className="text-2xl font-black uppercase italic text-gray-800 dark:text-white tracking-tighter truncate">Stock Adjustment</h1>
                <p className="text-xs font-bold text-gray-400 tracking-widest uppercase truncate">Rekonsiliasi Stok & Opname</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Tabs Selector */}
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl">
                <button 
                    onClick={() => setActiveTab("product")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === "product" ? "bg-white dark:bg-gray-700 shadow-xl shadow-gray-200/50 text-blue-600 scale-105" : "text-gray-400 hover:text-gray-600"}`}
                >
                    <Package size={14} /> Produk Jadi
                </button>
                <button 
                    onClick={() => setActiveTab("raw_material")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === "raw_material" ? "bg-white dark:bg-gray-700 shadow-xl shadow-gray-200/50 text-blue-600 scale-105" : "text-gray-400 hover:text-gray-600"}`}
                >
                    <Droplets size={14} /> Bahan Baku
                </button>
            </div>

            <button 
                onClick={() => { setSelectedData(null); setIsModalOpen(true); }}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-200 dark:shadow-none hover:scale-105 transition-all"
            >
                <Plus size={16} /> Tambah {activeTab === "product" ? "Produk" : "Bahan Baku"}
            </button>
          </div>
        </div>
      </div>

      {/* Content Area - Isolation using Grid */}
      <div className="grid grid-cols-1 w-full min-w-0 overflow-hidden">
        <div className="rounded-3xl border border-gray-100 bg-white shadow-sm dark:bg-gray-900 dark:border-gray-800 overflow-hidden w-full">
            <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-gray-200">
            <table className="w-full text-left min-w-[1000px] table-auto">
                <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                    <tr className="border-b border-gray-50 dark:border-gray-800">
                        <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest italic"><Calendar className="inline mr-2" size={14}/> Tanggal</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest italic"><Warehouse className="inline mr-2" size={14}/> Gudang</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest italic">Item</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest italic text-center">Qty Fisik</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest italic"><Info className="inline mr-2" size={14}/> Alasan / Catatan</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest italic text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                    <tr><td colSpan={6} className="py-20 text-center"><Loader2 className="animate-spin inline-block text-gray-300" size={32} /></td></tr>
                ) : (activeTab === "product" ? (
                    adjustments.length === 0 ? (
                        <tr><td colSpan={6} className="py-20 text-center text-[10px] font-black uppercase text-gray-300 tracking-widest">Tidak ada data penyesuaian produk</td></tr>
                    ) : adjustments.map((adj: any) => (
                        <tr key={adj.id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-6 py-4 text-xs font-bold text-gray-700 dark:text-gray-300">{adj.adjustment_date}</td>
                            <td className="px-6 py-4">
                                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tight dark:bg-blue-900/10">
                                    {adj.warehouse?.name || adj.warehouse_name || `ID: ${adj.warehouse_id}`}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-gray-800 dark:text-white truncate max-w-[200px]">
                                        {adj.items?.[0]?.product?.name || "Multi-Item"}
                                    </span>
                                    {adj.items?.length > 1 && (
                                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">+{adj.items.length - 1} Item Lainnya</span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className="text-xs font-black text-gray-800 bg-gray-100 px-4 py-1.5 rounded-xl dark:bg-gray-800 dark:text-white">
                                    {adj.items?.length || 0} Item
                                </span>
                            </td>
                            <td className="px-6 py-4 text-xs italic text-gray-500 uppercase font-medium">{adj.reason || adj.notes || "—"}</td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => { setSelectedData(adj); setIsModalOpen(true); }} className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-colors">
                                        <Pencil size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(adj.id, "product")} className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                ) : (
                    rawAdjustments.length === 0 ? (
                        <tr><td colSpan={6} className="py-20 text-center text-[10px] font-black uppercase text-gray-300 tracking-widest">Tidak ada data penyesuaian bahan baku</td></tr>
                    ) : rawAdjustments.map((adj: any) => (
                        <tr key={adj.id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-6 py-4 text-xs font-bold text-gray-700 dark:text-gray-300">{adj.created_at?.split('T')[0]}</td>
                            <td className="px-6 py-4">
                                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tight dark:bg-blue-900/10">
                                    {adj.warehouse?.name || 'Gudang Utama'}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-blue-600 truncate max-w-[200px]">
                                        {adj.raw_material?.name || "Bahan Baku"}
                                    </span>
                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">{adj.raw_material?.code}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-black text-gray-800 dark:text-white">{formatNumber(adj.after_quantity)} {adj.raw_material?.unit}</span>
                                    <span className={`text-[8px] font-bold uppercase italic px-2 py-0.5 rounded-lg mt-1 ${parseFloat(adj.difference) >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                        {parseFloat(adj.difference) >= 0 ? '+' : ''}{formatNumber(adj.difference)} Selisih
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-xs italic text-gray-500 uppercase font-medium">{adj.reason || "Penyesuaian Stok Baku"}</td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => handleDelete(adj.id, "raw_material")} className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                ))}
                </tbody>
            </table>
            </div>
        </div>
      </div>

      <StockAdjustmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={fetchData} 
        initialData={selectedData} 
      />
    </div>
  );
}
