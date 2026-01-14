"use client";
import React, { useEffect, useState } from "react";
import { PencilIcon, TrashBinIcon, PlusIcon } from "@/icons/index";

export default function SupplierTable() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((res) => res.json())
      .then((data) => {
        setSuppliers(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-6 text-center">Loading Supplier Data...</div>;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">Daftar Supplier</h3>
        <button className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700">
          <PlusIcon /> Tambah Supplier
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-y border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-white/5">
            <tr>
              <th className="px-6 py-4 text-sm font-medium text-gray-400">Nama Perusahaan</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-400">Kontak Person</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-400">Telepon</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-400 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {suppliers.map((sup: any) => (
              <tr key={sup.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-gray-800 dark:text-white/90">
                  {sup.company.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{sup.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{sup.phone}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="text-gray-400 hover:text-blue-600"><PencilIcon /></button>
                    <button className="text-gray-400 hover:text-red-600"><TrashBinIcon /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}