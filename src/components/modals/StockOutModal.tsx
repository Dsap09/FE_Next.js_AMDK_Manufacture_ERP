"use client";
import React, { useState, useEffect } from "react";
import { stockOutService } from "@/services/stockOutService";
import { warehouseService } from "@/services/warehouseService";

export default function StockOutProcessModal({ isOpen, onClose, requestData, onSuccess }: any) {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    warehouse_id: "",
    out_date: new Date().toISOString().split("T")[0],
    notes: ""
  });

  useEffect(() => {
    if (isOpen) {
      // Ambil data gudang dari backend
      warehouseService.getAll().then((res) => {
        setWarehouses(Array.isArray(res) ? res : res.data || []);
      });
      
      // Reset form dan berikan catatan default jika ada data request
      setFormData(prev => ({
        ...prev,
        warehouse_id: "", // Reset agar user memilih ulang
        notes: requestData ? `Pengeluaran barang untuk permintaan #${requestData.request_number}` : ""
      }));
    }
  }, [isOpen, requestData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi sederhana di sisi client
    if (!formData.warehouse_id) return alert("Pilih gudang sumber terlebih dahulu!");
    if (!requestData?.id) return alert("ID Permintaan tidak ditemukan. Silakan ulangi.");

    setLoading(true);
    try {
      // Pastikan semua key sesuai dengan $request->validate() di StockOutController
      const payload = {
        stock_request_id: Number(requestData.id), // Pastikan mengirim angka
        warehouse_id: Number(formData.warehouse_id), // Pastikan mengirim angka
        out_date: formData.out_date,
        notes: formData.notes
      };

      console.log("Mengirim payload:", payload); // Debugging: Cek data di console browser

      await stockOutService.create(payload);
      
      alert("Stok berhasil dikeluarkan!");
      onSuccess(); // Refresh tabel di halaman utama
      onClose();
    } catch (error: any) {
      // Jika error 422, tampilkan detail error dari Laravel
      const apiErrors = error.response?.data?.errors;
      if (apiErrors) {
        console.error("Validation Errors:", apiErrors);
        alert(`Gagal: ${Object.values(apiErrors).flat().join(", ")}`);
      } else {
        alert(error.response?.data?.message || "Terjadi kesalahan sistem.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <h3 className="text-lg font-bold mb-6 border-b pb-2 uppercase text-gray-700">Konfirmasi Stok Keluar</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg text-blue-800 text-xs font-medium border border-blue-100 mb-4">
            Memproses Request: <span className="font-bold">{requestData?.request_number}</span>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Pilih Gudang Sumber</label>
            <select 
              className="w-full border-2 border-gray-100 p-2.5 rounded-lg text-sm focus:border-blue-500 outline-none"
              value={formData.warehouse_id}
              onChange={(e) => setFormData({...formData, warehouse_id: e.target.value})}
              required
            >
              <option value="">-- Pilih Gudang --</option>
              {warehouses.map((w: any) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Tanggal Keluar</label>
            <input 
              type="date" 
              className="w-full border-2 border-gray-100 p-2.5 rounded-lg text-sm"
              value={formData.out_date}
              onChange={(e) => setFormData({...formData, out_date: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Catatan</label>
            <textarea 
              className="w-full border-2 border-gray-100 p-2.5 rounded-lg text-sm focus:border-blue-500 outline-none"
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="text-xs font-bold text-gray-400 uppercase">Batal</button>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg text-xs font-bold uppercase shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? "Memproses..." : "Konfirmasi Keluar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
