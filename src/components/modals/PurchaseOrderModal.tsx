"use client";
import React, { useEffect, useState } from "react";
import { purchaseOrderService } from "@/services/purchaseOrderService";
import { purchaseRequestService } from "@/services/purchaseRequestService"; // Gunakan service PR
import { supplierService } from "@/services/supplierService";
import { X, ShoppingCart, FileText, AlertCircle } from "lucide-react";

interface ApprovedPR {
  id: number;
  kode: string;
  status: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function PurchaseOrderModal({ isOpen, onClose, onSave }: ModalProps) {
  const [approvedPRs, setApprovedPRs] = useState<ApprovedPR[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPRId, setSelectedPRId] = useState("");

  // --- Mengambil Data PR Approved ---
  useEffect(() => {
    if (isOpen) {
      const loadPRs = async () => {
        try {
          const res = await purchaseRequestService.getAll();
          const allPRs = res.data?.data || res.data || res;
          
          // Backend mewajibkan PR berstatus 'approved'
          const filtered = Array.isArray(allPRs) 
            ? allPRs.filter((pr: any) => pr.status === 'approved')
            : [];
          
          setApprovedPRs(filtered);
        } catch (error) {
          console.error("Gagal memuat daftar PR Approved");
        }
      };
      loadPRs();
    }
  }, [isOpen]);

  // --- Fungsi Simpan Data ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPRId) return alert("Pilih nomor PR terlebih dahulu!");

    setLoading(true);
    try {
      /**
       * Sesuai PurchaseOrderController.php:
       * Fungsi generateFromPR($prId) hanya menerima ID PR melalui URL.
       * Tanggal, status draft, dan item dibuat otomatis dari data PR.
       */
      await purchaseOrderService.generateFromPR(Number(selectedPRId));
      
      alert("PO Draft Berhasil Diterbitkan! Silakan lengkapi Supplier dan Harga di halaman detail.");
      
      if (onSave) onSave(); 
      setSelectedPRId("");
      onClose();
    } catch (error: any) {
      // Menangkap pesan error spesifik dari backend
      const message = error.response?.data?.message || "Gagal membuat PO";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl dark:bg-gray-900">
        
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-xl font-black uppercase text-gray-800 dark:text-white flex items-center gap-2">
            <ShoppingCart size={20} className="text-blue-600" /> Terbitkan PO
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 mb-4">
            <div className="flex gap-3">
              <AlertCircle size={20} className="text-blue-600 shrink-0" />
              <p className="text-[11px] leading-relaxed text-blue-700 font-medium">
                Pilih Purchase Request (PR) yang telah disetujui. Sistem akan menyalin semua item PR ke dalam Draft PO baru. 
                <b> Supplier dan Harga Satuan</b> diisi setelah Draft PO berhasil dibuat.
              </p>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 mb-1.5 ml-1 tracking-widest">
              <FileText size={12} /> Referensi PR (Approved Only)
            </label>
            <select 
              className="w-full border-2 border-gray-100 p-3 rounded-2xl text-sm font-bold focus:border-blue-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700"
              value={selectedPRId}
              onChange={(e) => setSelectedPRId(e.target.value)}
              required
            >
              <option value="">-- Pilih Nomor PR --</option>
              {approvedPRs.map((pr) => (
                <option key={pr.id} value={pr.id}>{pr.kode}</option>
              ))}
            </select>
            {approvedPRs.length === 0 && (
              <p className="text-[10px] text-amber-600 mt-2 ml-1 italic font-bold">
                * Tidak ada PR berstatus 'approved' yang tersedia.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-800">
            <button type="button" onClick={onClose} className="text-xs font-bold text-gray-400 uppercase px-6">Batal</button>
            <button 
              type="submit" 
              disabled={loading || !selectedPRId}
              className="bg-blue-600 text-white px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 disabled:bg-gray-300"
            >
              {loading ? "⌛ Memproses..." : "Buat Draft PO"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}