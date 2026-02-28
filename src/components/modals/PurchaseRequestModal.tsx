"use client";
import React, { useEffect, useState } from "react";
import { purchaseRequestService } from "@/services/purchaseRequestService";
import { X, ClipboardList, Calendar, Building2 } from "lucide-react";

interface PRFormData {
  request_date: string;
  type: "product" | "raw_materials";
  department: string;
  notes: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData?: any;
}

export default function PurchaseRequestModal({ isOpen, onClose, onSave, initialData }: ModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PRFormData>({
    request_date: new Date().toISOString().split("T")[0],
    type: "product",
    department: "",
    notes: "",
  });

  // Mengisi data jika dalam mode edit
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        request_date: initialData.request_date || "",
        type: initialData.type || "product",
        department: initialData.department || "",
        notes: initialData.notes || "",
      });
    } else if (isOpen) {
      setFormData({
        request_date: new Date().toISOString().split("T")[0],
        type: "product",
        department: "",
        notes: "",
      });
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log("=== FORM DATA TO SEND ===", formData);

    try {
      // Payload hanya mengirimkan data header sesuai revisi workflow Anda
      if (initialData) {
        await purchaseRequestService.update(initialData.id, formData);
        alert("Purchase Request berhasil diperbarui!");
      } else {
        console.log("Creating new PR with data:", formData);
        const response = await purchaseRequestService.create(formData);
        console.log("Create PR Response:", response);
        alert("Purchase Request baru berhasil diterbitkan!");
      }
      onSave();
      onClose();
    } catch (error: any) {
      console.error("=== CAUGHT ERROR IN MODAL ===", error);
      const errorMessage = error.response?.data?.message || error.message || "Terjadi kesalahan sistem";
      alert("Gagal: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl dark:bg-gray-900 border border-white/10">

        {/* Header Modal */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-xl font-black uppercase text-gray-800 dark:text-white tracking-tighter italic flex items-center gap-2">
            <ClipboardList className="text-blue-600" />
            {initialData ? `Edit Header: ${initialData.kode}` : "Purchase Request Baru"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Input Kategori */}
          <div>
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 mb-1.5 ml-1 tracking-widest">
              Kategori Permintaan
            </label>
            <select
              className="w-full border-2 border-gray-100 p-3 rounded-2xl text-sm font-bold focus:border-blue-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              disabled={!!initialData}
              required
            >
              <option value="product">📦 Produk Jadi</option>
              <option value="raw_materials">🏭 Bahan Baku</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input Departemen */}
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 mb-1.5 ml-1 tracking-widest">
                <Building2 size={12} /> Departemen
              </label>
              <input
                type="text"
                className="w-full border-2 border-gray-100 p-3 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 dark:bg-gray-800"
                placeholder="Misal: Produksi"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              />
            </div>

            {/* Input Tanggal */}
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 mb-1.5 ml-1 tracking-widest">
                <Calendar size={12} /> Tanggal Request
              </label>
              <input
                type="date"
                className="w-full border-2 border-gray-100 p-3 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 dark:bg-gray-800"
                value={formData.request_date}
                onChange={(e) => setFormData({ ...formData, request_date: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Input Catatan */}
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 ml-1 tracking-widest">
              Keterangan / Notes
            </label>
            <textarea
              className="w-full border-2 border-gray-100 p-3 rounded-2xl text-sm outline-none focus:border-blue-500 dark:bg-gray-800"
              rows={3}
              placeholder="Berikan alasan atau detail keperluan PR ini..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
            <p className="text-[10px] text-blue-700 font-bold leading-relaxed italic">
              * Setelah header ini disimpan, Anda dapat menambahkan daftar barang secara detail pada menu "Kelola Item" di tabel utama.
            </p>
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-gray-400 uppercase tracking-widest px-6"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all disabled:bg-gray-300"
            >
              {loading ? "⌛ Memproses..." : "Lanjut ke Kelola Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}