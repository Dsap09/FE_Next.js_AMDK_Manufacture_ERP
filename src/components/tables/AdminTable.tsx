"use client";
import React, { useEffect, useState } from "react";
import { PencilIcon, TrashBinIcon, PlusIcon } from "@/icons/index";

export default function AdminTable() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((res) => res.json())
      .then((data) => {
        // Kita batasi hanya 5 data pertama untuk Admin
        setAdmins(data.slice(0, 5));
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-6 text-center">Loading Admin Data...</div>;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">Daftar Administrator</h3>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
          <PlusIcon /> Tambah Admin
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-y border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-white/5">
            <tr>
              <th className="px-6 py-4 text-sm font-medium text-gray-400">Nama Lengkap</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-400">Username</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-400">Email</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-400 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {admins.map((admin: any) => (
              <tr key={admin.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-white/90">{admin.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">@{admin.username}</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{admin.email}</td>
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
