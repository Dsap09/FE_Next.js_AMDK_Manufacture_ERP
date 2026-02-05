"use client";
import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { stockInitialService } from "@/services/stockInitialService"; // Service stok produk
import { rawMaterialService } from "@/services/rawMaterialService"; // Service bahan baku
import { purchaseRequestService } from "@/services/purchaseRequestService";
import { 
  Package, 
  Database, 
  ClipboardList, 
  Clock,
  CheckCircle,
  AlertCircle,
  Layers
} from "lucide-react";

export default function InventoryDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalProducts: 0,
    totalRawMaterials: 0,
    totalPR: 0,
    pendingApproval: 0,
    approvedPR: 0,
    recentPR: [] as any[],
    recentProducts: [] as any[],
    recentMaterials: [] as any[]
  });

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const [resStocks, resMaterials, resRequests] = await Promise.all([
        stockInitialService.getAll(), 
        rawMaterialService.getAll(),
        purchaseRequestService.getAll()
      ]);

      // --- PERBAIKAN NORMALISASI DATA ---
      const stocks = Array.isArray(resStocks) ? resStocks : resStocks.data || [];
      
      // Khusus Bahan Baku (karena Laravel paginate(10) membungkus array di dalam properti .data)
      const materials = resMaterials?.data && Array.isArray(resMaterials.data) 
        ? resMaterials.data // Ambil array dari dalam object pagination
        : (Array.isArray(resMaterials) ? resMaterials : []);

      const requests = Array.isArray(resRequests) ? resRequests : resRequests.data || [];

      // 1. HITUNG TOTAL UNIT BARANG JADI
      const sumProducts = stocks.reduce((acc: number, item: any) => {
        const qty = Number(item.quantity || 0);
        return acc + (isNaN(qty) ? 0 : qty);
      }, 0);

      // 2. HITUNG TOTAL UNIT BAHAN BAKU (Pastikan menggunakan 'quantity')
      const sumMaterials = materials.reduce((acc: number, item: any) => {
        // Cek 'quantity' sesuai field di tabel raw_materials kamu
        const qty = Number(item.quantity || item.stock || 0);
        return acc + (isNaN(qty) ? 0 : qty);
      }, 0);

      setData({
        totalProducts: sumProducts,
        recentProducts: stocks,
        totalRawMaterials: sumMaterials, // Angka total di kartu hijau
        recentMaterials: materials,      // List untuk rincian rincian
        totalPR: requests.length,
        pendingApproval: requests.filter((r: any) => r.status === 'submitted' || r.status === 'draft').length,
        approvedPR: requests.filter((r: any) => r.status === 'approved').length,
        recentPR: requests.slice(0, 5)
      });

    } catch (error) {
      console.error("Dashboard Sync Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50/30 min-h-screen">
      <PageBreadcrumb pageName="Dashboard Persediaan Real-time" />

      {/* --- BAGIAN KARTU STATISTIK --- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
        
        {/* Kartu Stok Barang Jadi */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:bg-gray-900 dark:border-gray-800">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20">
            <Package size={22} />
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-black text-gray-800 dark:text-white">
              {loading ? "..." : data.totalProducts.toLocaleString('id-ID')}
            </h4>
            <div className="flex items-center gap-1.5 mt-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Unit Produk</p>
              <span className="h-1 w-1 rounded-full bg-blue-400"></span>
              <p className="text-[10px] font-bold text-blue-500 uppercase">{data.recentProducts.length} SKU</p>
            </div>
          </div>
        </div>

        {/* Kartu Stok Bahan Baku */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:bg-gray-900 dark:border-gray-800">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20">
            <Database size={22} />
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-black text-gray-800 dark:text-white">
              {loading ? "..." : data.totalRawMaterials.toLocaleString('id-ID')}
            </h4>
            <div className="flex items-center gap-1.5 mt-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Unit Bahan</p>
              <span className="h-1 w-1 rounded-full bg-emerald-400"></span>
              <p className="text-[10px] font-bold text-emerald-500 uppercase">{data.recentMaterials.length} Jenis</p>
            </div>
          </div>
        </div>

        {/* Status Approval */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:bg-gray-900 dark:border-gray-800">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/20">
            <Clock size={22} />
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-black text-gray-800 dark:text-white">{loading ? "..." : data.pendingApproval}</h4>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Menunggu Approval</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:bg-gray-900 dark:border-gray-800">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/20">
            <CheckCircle size={22} />
          </div>
          <div className="mt-4">
            <h4 className="text-2xl font-black text-gray-800 dark:text-white">{loading ? "..." : data.approvedPR}</h4>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">PR Disetujui</p>
          </div>
        </div>
      </div>

      {/* --- BAGIAN RINCIAN LIST --- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Rincian Produk Jadi */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6 border-b border-gray-50 dark:border-gray-800 pb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-800 dark:text-white">Rincian Unit Produk</h3>
            <Package size={16} className="text-blue-500" />
          </div>
          <div className="space-y-3">
            {data.recentProducts.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-4">Tidak ada data stok produk.</p>
            ) : (
              data.recentProducts.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-transparent hover:border-blue-100 transition-all">
                  <div>
                    <p className="text-xs font-black text-gray-700 dark:text-gray-200">{item.product_name}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">{item.warehouse || 'Gudang Utama'}</p>
                  </div>
                  <span className="text-sm font-black text-blue-600">
                    {(Number(item.quantity) || 0).toLocaleString('id-ID')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Rincian Bahan Baku */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6 border-b border-gray-50 dark:border-gray-800 pb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-800 dark:text-white">Rincian Unit Bahan Baku</h3>
            <Layers size={16} className="text-emerald-500" />
          </div>
          <div className="space-y-3">
            {data.recentMaterials.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-4">Tidak ada data bahan baku.</p>
            ) : (
              data.recentMaterials.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-transparent hover:border-emerald-100 transition-all">
                  <div>
                    <p className="text-xs font-black text-gray-700 dark:text-gray-200">{item.name || item.product_name}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{item.unit || 'Satuan'}</p>
                  </div>
                  <span className="text-sm font-black text-emerald-600">
                    {(Number(item.quantity || item.stock) || 0).toLocaleString('id-ID')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* --- WIDGET INFORMASI --- */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <AlertCircle size={20} className="text-blue-500" />
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Angka di atas adalah <b>Total Unit Fisik</b> yang tersedia di seluruh gudang berdasarkan transaksi Stok Awal dan Mutasi Barang.
          </p>
        </div>
      </div>
    </div>
  );
}

// Komponen SVG Helper untuk icon file jika dibutuhkan
const FileText = ({ size, className }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
);