"use client";
import React, { useEffect, useState } from "react";

export default function ProductTable() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://fakestoreapi.com/products?limit=5")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-6">Memuat produk...</p>;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50/50 dark:bg-white/5">
          <tr>
            <th className="px-6 py-4 text-sm font-medium text-gray-400">Produk</th>
            <th className="px-6 py-4 text-sm font-medium text-gray-400">Kategori</th>
            <th className="px-6 py-4 text-sm font-medium text-gray-400">Harga</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {products.map((p: any) => (
            <tr key={p.id}>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <img src={p.image} alt={p.title} className="w-10 h-10 rounded object-contain" />
                  <span className="text-sm font-medium truncate max-w-[200px]">{p.title}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">{p.category}</td>
              <td className="px-6 py-4 text-sm font-bold text-green-600">${p.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}