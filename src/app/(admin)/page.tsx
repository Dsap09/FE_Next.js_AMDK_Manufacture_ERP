"use client";

import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UserTableDashboard from "@/components/tables/UserTableDashboard";

export default function Dashboard() {
  return (
    <div className="p-4 md:p-6 2xl:p-10">
      {/* Header Halaman */}
      <PageBreadcrumb pageName="Dashboard Utama" />

      <div className="mt-6 grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        {/* Kolom untuk Tabel User (Kita buat lebar agar terlihat jelas) */}
        <div className="col-span-12 xl:col-span-8">
          <UserTableDashboard />
        </div>

        {/* Kolom samping (Bisa untuk info tambahan nanti) */}
        <div className="col-span-12 xl:col-span-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
              Informasi Sistem
            </h3>
            <p className="text-sm text-gray-500">
              Selamat datang di panel admin. Gunakan menu di samping untuk mengelola Data Master.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}