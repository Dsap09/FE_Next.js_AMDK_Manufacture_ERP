"use client";
import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { stockInitialService } from "@/services/stockInitialService";
import { productService } from "@/services/productService";
import { warehouseService } from "@/services/warehouseService";

export default function StockInitialPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    warehouse_id: "",
    items: [{ product_id: "", quantity: 0 }]
  });

  useEffect(() => {
    productService.getAll().then(res => setProducts(res.data || res));
    warehouseService.getAll().then(res => setWarehouses(res.data || res));
  }, []);

  const handleAddItem = () => {
    setFormData({ ...formData, items: [...formData.items, { product_id: "", quantity: 0 }] });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items] as any;

    if (field === "quantity") {
      // Ubah string kosong langsung menjadi 0, atau parse ke angka
      const parsedValue = value === "" ? 0 : parseFloat(value);
      // Gunakan isNaN untuk menjaga jika user mengetik karakter non-angka
      newItems[index][field] = isNaN(parsedValue) ? 0 : parsedValue;
    } else {
      newItems[index][field] = value;
    }

    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.warehouse_id || formData.items.some(it => !it.product_id || Number(it.quantity) <= 0)) {
      return alert("Harap isi semua field dengan benar!");
    }

    setLoading(true);
    try {
      const payload = {
        warehouse_id: parseInt(formData.warehouse_id),
        items: formData.items.map(it => ({
          product_id: parseInt(it.product_id as string),
          quantity: Number(it.quantity) || 0
        }))
      };

      await stockInitialService.create(payload);
      alert("Stok awal berhasil diinput!");
      setFormData({ warehouse_id: "", items: [{ product_id: "", quantity: 0 }] });
    } catch (error: any) {
      alert(error.response?.data?.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageBreadcrumb pageName="Input Stok Awal" />

      <div className="max-w-3xl mx-auto rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Pemilihan Gudang */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 ml-1">Gudang Tujuan</label>
            <select
              className="w-full border-2 border-gray-50 p-3 rounded-xl text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 transition-all"
              value={formData.warehouse_id}
              onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })}
              required
            >
              <option value="">-- Pilih Gudang --</option>
              {warehouses.map((w: any) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div className="border-t border-gray-50 pt-5">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Daftar Produk & Saldo Awal</h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-tighter"
              >
                + TAMBAH ITEM
              </button>
            </div>

            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-3 items-center group">
                  <div className="flex-1">
                    <select
                      className="w-full border-2 border-gray-50 p-2.5 rounded-xl text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
                      value={item.product_id}
                      onChange={(e) => handleItemChange(index, "product_id", e.target.value)}
                      required
                    >
                      <option value="">-- Pilih Produk --</option>
                      {products.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      placeholder="0"
                      // Perbaikan: Hilangkan focus ring hitam & handle value 0
                      className="w-full border-2 border-gray-50 p-2.5 rounded-xl text-sm text-center outline-none focus:ring-0 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
                      value={item.quantity === 0 ? "" : item.quantity}
                      onChange={e => handleItemChange(index, "quantity", e.target.value)}
                      required
                    />
                  </div>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-2"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tombol Simpan - Diperkecil (Smaller Button) */}
          <div className="pt-6 border-t border-gray-50 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-black text-[11px] uppercase tracking-widest shadow-md shadow-blue-100 hover:bg-blue-700 transition-all disabled:bg-gray-300 active:scale-95"
            >
              {loading ? "Proses..." : "Simpan Stok"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
