"use client";
import React from "react";
import Breadcrumb from "@/components/common/PageBreadCrumb";
// Import ikon asli dari folder icons proyekmu
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  DocsIcon, 
  TimeIcon 
} from "@/icons/index";

export default function Dashboard() {
  return (
    <>
      <Breadcrumb pageName="Dashboard Overview" />

      {/* Bagian Atas: Ringkasan Menu (Card-based) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6 2xl:gap-7.5">
        
        {/* Card Pengeluaran */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/10">
              <ArrowUpIcon />
            </div>
            <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">PENGELUARAN</h4>
          </div>
          <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
            <li className="hover:text-blue-600 cursor-pointer transition-colors">Kas Keluar</li>
            <li className="hover:text-blue-600 cursor-pointer transition-colors">Bank Keluar</li>
            <li className="hover:text-blue-600 cursor-pointer transition-colors">Bon Sementara</li>
          </ul>
        </div>

        {/* Card Penerimaan */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600 dark:bg-green-500/10">
              <ArrowDownIcon />
            </div>
            <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">PENERIMAAN</h4>
          </div>
          <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
            <li className="hover:text-blue-600 cursor-pointer transition-colors">Kas Masuk</li>
            <li className="hover:text-blue-600 cursor-pointer transition-colors">Bank Masuk</li>
          </ul>
        </div>

        {/* Card Akuntansi */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10">
              <DocsIcon />
            </div>
            <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">AKUNTANSI</h4>
          </div>
          <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
            <li className="hover:text-blue-600 cursor-pointer transition-colors">Jurnal Memorial</li>
            <li className="hover:text-blue-600 cursor-pointer transition-colors">Laporan Keuangan</li>
          </ul>
        </div>
      </div>

      {/* Bagian Bawah: Tabel Dokumen Pending */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-2 mb-6">
          <div className="text-orange-500"><TimeIcon /></div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Dokumen Pending Terbaru
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="pb-4 font-medium text-gray-400">Status</th>
                <th className="pb-4 font-medium text-gray-400">No Dokumen</th>
                <th className="pb-4 font-medium text-gray-400">Tanggal</th>
                <th className="pb-4 font-medium text-gray-400">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {[
                { status: "Pending", no: "SPK-R/2025/01", tgl: "14 Jan 2025", ket: "PT JENAR ABADI" },
                { status: "Pending", no: "SPK-R/2025/02", tgl: "15 Jan 2025", ket: "PT ADICIPTA PUTRA" },
              ].map((item, key) => (
                <tr key={key} className="group hover:bg-gray-50 dark:hover:bg-white/5">
                  <td className="py-4">
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600 dark:bg-orange-500/10">
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 text-gray-700 dark:text-gray-300">{item.no}</td>
                  <td className="py-4 text-gray-700 dark:text-gray-300">{item.tgl}</td>
                  <td className="py-4 text-gray-700 dark:text-gray-300 font-medium">{item.ket}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}