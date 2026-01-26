"use client";
import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { stockRequestService } from "@/services/stockRequestService";
import { stockAdjustmentService } from "@/services/stockAdjustmentService";

export default function StockDashboard() {
  const [stats, setStats] = useState({
    totalRequests: 0,
    draftRequests: 0,
    approvedRequests: 0,
    totalAdjustments: 0,
  });
  const [recentAdjustments, setRecentAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Ambil data dari kedua modul
        const [reqRes, adjRes] = await Promise.all([
          stockRequestService.getAll(),
          stockAdjustmentService.getAll(),
        ]);

        const requests = Array.isArray(reqRes) ? reqRes : reqRes.data || [];
        const adjustments = Array.isArray(adjRes) ? adjRes : adjRes.data || [];

        // Hitung statistik sederhana
        setStats({
          totalRequests: requests.length,
          draftRequests: requests.filter((r: any) => r.status === "draft").length,
          approvedRequests: requests.filter((r: any) => r.status === "approved").length,
          totalAdjustments: adjustments.length,
        });

        // Ambil 5 penyesuaian terakhir
        setRecentAdjustments(adjustments.slice(0, 5));
      } catch (error) {
        console.error("Gagal memuat data dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageBreadcrumb pageName="Dashboard Stok" />

      {/* Baris Statistik Utama */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Permintaan" value={stats.totalRequests} color="blue" />
        <StatCard title="Menunggu Approval" value={stats.draftRequests} color="yellow" />
        <StatCard title="Disetujui" value={stats.approvedRequests} color="green" />
        <StatCard title="Total Penyesuaian" value={stats.totalAdjustments} color="gray" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Ringkasan Penyesuaian Terbaru */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-4 text-lg font-bold">Penyesuaian Stok Terbaru</h3>
          <div className="space-y-4">
            {recentAdjustments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Belum ada aktivitas penyesuaian.</p>
            ) : (
              recentAdjustments.map((adj: any) => (
                <div key={adj.id} className="flex justify-between items-center border-b pb-3 border-gray-50 dark:border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm font-bold">{adj.reason}</p>
                    <p className="text-xs text-gray-500">{adj.adjustment_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-400">Gudang ID: {adj.warehouse_id}</p>
                    <p className="text-xs font-bold text-blue-600">{adj.items?.length || 0} Item</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Info Tambahan */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-4 text-lg font-bold">Status Operasional</h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Tips:</p>
              <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                Pastikan semua permintaan "Draft" segera diperiksa untuk kelancaran produksi.
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p className="text-sm font-bold">Update Terakhir</p>
              <p className="text-xs text-gray-500">Sistem melakukan sinkronisasi otomatis setiap kali halaman dibuka.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Komponen Card Kecil agar Kode Rapi
function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  const colorClasses: any = {
    blue: "text-blue-600 bg-blue-50",
    yellow: "text-yellow-600 bg-yellow-50",
    green: "text-green-600 bg-green-50",
    gray: "text-gray-600 bg-gray-50",
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
      <h4 className={`mt-2 text-3xl font-bold ${colorClasses[color].split(" ")[0]}`}>
        {value}
      </h4>
    </div>
  );
}