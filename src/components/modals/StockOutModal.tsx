"use client";
import React, { useState, useEffect } from "react";
import { stockOutService } from "@/services/stockOutService";
import { stockRequestService } from "@/services/stockRequestService";
// Pastikan kamu punya warehouseService atau ganti dengan axios langsung
import axiosInstance from "@/lib/axios"; 

export default function StockOutModal({ isOpen, onClose, onSave, initialData }: any) {
  const [formData, setFormData] = useState({
    stock_request_id: "",
    warehouse_id: "",
    out_date: new Date().toISOString().split("T")[0],
    notes: ""
  });

  const [requests, setRequests] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Ambil data untuk dropdown
      stockRequestService.getAll().then((res: any) => {
        const data = Array.isArray(res) ? res : res.data || [];
        // Opsional: Hanya tampilkan permintaan yang sudah 'approved'
        setRequests(data.filter((r: any) => r.status === 'approved' || r.id === initialData?.stock_request_id));
      });

      axiosInstance.get("/api/v1/warehouses").then((res: any) => {
        setWarehouses(res.data?.data || res.data || []);
      });

      if (initialData) {
        setFormData({
            stock_request_id: initialData.stock_request_id,
            warehouse_id: initialData.warehouse_id,
            out_date: initialData.out_date,
            notes: initialData.notes || ""
        });
      } else {
        setFormData({
            stock_request_id: "",
            warehouse_id: "",
            out_date: new Date().toISOString().split("T")[0],
            notes: ""
        });
      }
    }
  }, [initialData, isOpen]);

  const handleSubmit = async () => {
    try {
      if (initialData) {
        await stockOutService.update(initialData.id, formData);
      } else {
        await stockOutService.create(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      alert("Gagal menyimpan data barang keluar. Pastikan semua field terisi.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="mb-6 text-xl font-bold">
          {initialData ? "Edit Catatan Keluar" : "Catat Barang Keluar"}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Referensi Permintaan (Approved)</label>
            <select 
              className="w-full border p-2 rounded-lg text-sm"
              value={formData.stock_request_id}
              onChange={(e) => setFormData({...formData, stock_request_id: e.target.value})}
            >
              <option value="">Pilih No. Permintaan</option>
              {requests.map((req: any) => (
                <option key={req.id} value={req.id}>REQ-{req.id} ({req.product_name || 'Multi-item'})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Gudang Sumber</label>
            <select 
              className="w-full border p-2 rounded-lg text-sm"
              value={formData.warehouse_id}
              onChange={(e) => setFormData({...formData, warehouse_id: e.target.value})}
            >
              <option value="">Pilih Gudang</option>
              {warehouses.map((wh: any) => (
                <option key={wh.id} value={wh.id}>{wh.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tanggal Keluar</label>
            <input 
              type="date" 
              className="w-full border p-2 rounded-lg text-sm" 
              value={formData.out_date} 
              onChange={(e) => setFormData({...formData, out_date: e.target.value})} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Catatan Tambahan</label>
            <textarea 
              className="w-full border p-2 rounded-lg text-sm" 
              rows={3} 
              value={formData.notes} 
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Contoh: Untuk keperluan produksi mesin A"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onClose} className="text-gray-500 text-sm font-bold px-4">Batal</button>
          <button onClick={handleSubmit} className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold text-sm">
            Simpan Data
          </button>
        </div>
      </div>
    </div>
  );
}