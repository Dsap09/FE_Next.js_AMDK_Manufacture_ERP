"use client";
import React, { useEffect, useState } from "react";
import { userService } from "@/services/userService";
import Button from "../ui/button/Button";
import UserModal from "../modals/UserModal";

// 1. Letakkan helper function di LUAR komponen agar bersih
const getRoleStyle = (role: string) => {
  switch (role) {
    case 'super-admin':
      return 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400';
    case 'admin-operasional':
    case 'admin-penjualan':
      return 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
    case 'staff-gudang':
    case 'staff-produksi':
      return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
    case 'owner':
      return 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-800 dark:text-gray-400';
  }
};

export default function UserTableDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      const data = Array.isArray(response) ? response : response.data || [];
      setUsers(data);
    } catch (error) {
      console.error("Gagal load user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: any) => {
    try {
      if (selectedUser) {
        await userService.updateUser((selectedUser as any).id, formData);
      } else {
        await userService.createUser(formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert("Gagal memproses data user.");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Hapus user "${name}"?`)) {
      await userService.deleteUser(id);
      fetchData();
    }
  };

  if (loading) return <p className="p-6 text-sm">Memuat daftar user...</p>;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-sm">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Manajemen User</h3>
        <Button size="sm" onClick={() => { setSelectedUser(null); setIsModalOpen(true); }}>
          + User
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5">
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">User</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Role</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {users.map((user: any) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-800 dark:text-white">{user.name}</span>
                    <span className="text-xs text-gray-500">{user.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border ${getRoleStyle(user.roles?.[0]?.name || "")}`}>
                    {user.roles?.[0]?.name?.replace(/-/g, " ") || "-"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button onClick={() => { setSelectedUser(user); setIsModalOpen(true); }} className="text-blue-500 hover:text-blue-700 text-xs font-bold">Edit</button>
                  <button onClick={() => handleDelete(user.id, user.name)} className="text-red-500 hover:text-red-700 text-xs font-bold">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={selectedUser}
      />
    </div>
  );
}
