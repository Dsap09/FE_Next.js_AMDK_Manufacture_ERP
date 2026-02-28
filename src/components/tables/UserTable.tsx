"use client";
import React, { useEffect, useState } from "react";
import { userService } from "@/services/userService";
import Button from "../ui/button/Button";
import UserModal from "../modals/UserModal";

export default function UserTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await userService.getAllUsers();
      setUsers(Array.isArray(res) ? res : res.data || []);
    } catch (error) {
      console.error("Gagal load data user");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: any) => {
    try {
      if (selectedUser) {
        await userService.updateUser(selectedUser.id, formData);
      } else {
        await userService.createUser(formData);
      }
      setIsModalOpen(false);
      setSelectedUser(null);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal menyimpan data user.");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Hapus user "${name}"?`)) {
      try {
        await userService.deleteUser(id);
        fetchData();
      } catch (error) {
        alert("Gagal menghapus user.");
      }
    }
  };

  const openAddModal = () => { setSelectedUser(null); setIsModalOpen(true); };
  const openEditModal = (user: any) => {
    setSelectedUser({
      ...user,
      role: user.roles?.[0]?.name || ""
    });
    setIsModalOpen(true);
  };

  if (loading) return <div className="p-10 text-center">Memuat data user...</div>;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-bold">Daftar Pengguna</h3>
        <Button onClick={openAddModal} size="sm">+ Tambah User</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 dark:bg-white/5">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Nama</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Email</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Role</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {users.length > 0 ? (
              users.map((u: any) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{u.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{u.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2.5 py-1 rounded-full text-xs font-semibold capitalize">
                      {u.roles?.[0]?.name?.replace(/-/g, " ") || "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-3">
                    <button onClick={() => openEditModal(u)} className="text-blue-500 hover:text-blue-700 text-sm font-bold">Edit</button>
                    <button onClick={() => handleDelete(u.id, u.name)} className="text-red-500 hover:text-red-700 text-sm font-bold">Hapus</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4} className="p-10 text-center text-gray-400">Belum ada data user.</td></tr>
            )}
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