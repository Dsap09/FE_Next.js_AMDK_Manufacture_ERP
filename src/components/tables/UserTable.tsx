"use client";
import React, { useEffect, useState } from "react";
import { PencilIcon, TrashBinIcon, PlusIcon } from "@/icons/index";

export default function UserTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fungsi untuk mengambil data dari API dummy
  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => console.error("Gagal load user:", err));
  }, []);

  if (loading) return <p className="p-6">Memuat data user...</p>;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">Daftar Pengguna</h3>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <PlusIcon /> Tambah User
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-y border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-white/5">
            <tr>
              <th className="px-6 py-4 text-sm font-medium text-gray-400">Nama</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-400">Email</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-400">Perusahaan</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-400 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {users.map((user: any) => (
              <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5">
                <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-white/90">{user.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{user.company.name}</td>
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