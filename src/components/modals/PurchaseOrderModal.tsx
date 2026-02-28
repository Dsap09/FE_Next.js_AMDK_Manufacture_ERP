"use client";
import React, { useEffect, useState } from "react";
import { purchaseOrderService } from "@/services/purchaseOrderService";
import { purchaseRequestService } from "@/services/purchaseRequestService";
import { supplierService } from "@/services/supplierService";
import { X, ShoppingCart, Truck, FileText, Loader2 } from "lucide-react";

export default function PurchaseOrderModal({ isOpen, onClose, onSave }: any) {
  const [approvedPRs, setApprovedPRs] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPRId, setSelectedPRId] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState("");

  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        const [resPR, resSup] = await Promise.all([purchaseRequestService.getAll(), supplierService.getAll()]);
        const prs = resPR.data?.data || resPR.data || resPR;
        setApprovedPRs(Array.isArray(prs) ? prs.filter((p: any) => p.status === 'approved') : []);
        setSuppliers(resSup.data?.data || resSup.data || resSup || []);
      };
      loadData();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const genRes = await purchaseOrderService.generateFromPR(selectedPRId);
      const newPoId = genRes.data?.id || genRes.id;
      await purchaseOrderService.update(newPoId, {
        supplier_id: Number(selectedSupplierId),
        order_date: new Date().toISOString().split("T")[0],
      });
      alert("PO Berhasil Diterbitkan!");
      onSave(); onClose();
    } catch (error) { alert("Gagal proses PO"); } finally { setLoading(false); }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl">
        <h3 className="text-lg font-black uppercase italic mb-6 flex items-center gap-2"><ShoppingCart className="text-blue-600"/> Terbitkan PO</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select className="w-full border-2 p-3 rounded-2xl font-bold" value={selectedPRId} onChange={(e) => setSelectedPRId(e.target.value)} required>
            <option value="">-- Pilih PR Approved --</option>
            {approvedPRs.map((pr) => <option key={pr.id} value={pr.id}>{pr.kode}</option>)}
          </select>
          <select className="w-full border-2 p-3 rounded-2xl font-bold" value={selectedSupplierId} onChange={(e) => setSelectedSupplierId(e.target.value)} required>
            <option value="">-- Pilih Supplier --</option>
            {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.nama}</option>)}
          </select>
          <div className="flex justify-end gap-3 pt-4">
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-blue-700">
              {loading ? <Loader2 className="animate-spin" /> : "Buat PO Sekarang"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}