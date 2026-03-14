"use client";
import React, { useEffect, useState } from "react";
import { productService } from "@/services/productService";
import Button from "../ui/button/Button";
import Badge from "../ui/badge/Badge";
import ProductModal from "../modals/ProductModal";

export default function ProductTable() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await productService.getAll();
      setProducts(Array.isArray(res) ? res : res.data || []);
    } catch (error) {
      console.error("Gagal load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: any) => {
    try {
      if (selectedProduct) {
        // Mode Edit
        await productService.updateProduct((selectedProduct as any).id, formData);
      } else {
        // Mode Tambah
        await productService.createProduct(formData);
      }
      setIsModalOpen(false);
      fetchData(); // Refresh tabel
    } catch (error) {
      alert("Gagal menyimpan data produk.");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Hapus produk ini?")) {
      await productService.deleteProduct(id);
      fetchData();
    }
  };

  const openAddModal = () => { setSelectedProduct(null); setIsModalOpen(true); };
  const openEditModal = (product: any) => { setSelectedProduct(product); setIsModalOpen(true); };

  if (loading) return <div className="p-10 text-center">Memuat data...</div>;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-bold">Daftar Produk</h3>
        <Button onClick={openAddModal} size="sm">+ Tambah Produk</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 dark:bg-white/5">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Kode</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Nama</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Harga</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {products.map((p: any) => (
              <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                <td className="px-6 py-4 text-sm font-bold">{p.kode}</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{p.name}</td>
                <td className="px-6 py-4 text-sm font-bold text-green-600">
                  Rp {(p.harga ? Number(p.harga) : 0).toLocaleString("id-ID")}
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-3">
                  <button onClick={() => openEditModal(p)} className="text-blue-500 hover:underline text-sm font-bold">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:underline text-sm font-bold">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sertakan Modal di Sini */}
      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        initialData={selectedProduct} 
      />
    </div>
  );
}
