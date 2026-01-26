"use client";
import React from "react";

export default function StockStats({ data }: any) {
  const stats = [
    { label: "Total Stok Barang", value: data?.total_items || 0, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Stok Rendah", value: data?.low_stock_count || 0, color: "text-red-600", bg: "bg-red-50" },
    { label: "Permintaan Pending", value: data?.pending_requests || 0, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Gudang Aktif", value: data?.warehouse_count || 0, color: "text-green-600", bg: "bg-green-50" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div key={index} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-500">{stat.label}</p>
          <p className={`mt-2 text-3xl font-bold ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}