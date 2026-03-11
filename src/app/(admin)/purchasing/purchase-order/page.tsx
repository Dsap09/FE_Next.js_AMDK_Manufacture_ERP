"use client";
import React, { useEffect, useState, useCallback } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { purchaseOrderService } from "@/services/purchaseOrderService";
import PurchaseOrderModal from "@/components/modals/PurchaseOrderModal";
import {
  Eye, Send, PackageCheck, Plus, Truck, Loader2, Calendar,
  Package, CheckCircle, Clock, Banknote
} from "lucide-react";

export default function PurchaseOrderPage() {
  const [loading, setLoading] = useState(true);
  const [pos, setPos] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<any>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const resPO = await purchaseOrderService.getAll();
      setPos(Array.isArray(resPO) ? resPO : resPO.data || []);
    } catch (error) {
      console.error("Gagal sinkronisasi data PO:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- LOGIKA UPDATE HARGA (Wajib ada agar bisa Submit) ---
  const handleUpdatePrice = async (itemId: number, price: number) => {
    try {
      await purchaseOrderService.updateItemPrice(itemId, price);
      // Refresh data detail agar total_amount terupdate otomatis dari backend
      const res = await purchaseOrderService.getById(selectedPO.id);
      setSelectedPO(res.data || res);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal memperbarui harga");
    }
  };

  const handleSubmitPO = async (id: number) => {
    if (!confirm("Kirim PO ini ke supplier? Pastikan semua harga item sudah terisi.")) return;
    try {
      await purchaseOrderService.submit(id);
      alert("PO Berhasil dikirim!");
      setIsDetailModalOpen(false);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal: Harga item mungkin masih ada yang kosong");
    }
  };

  const handleReceivePO = async (id: number) => {
    if (!confirm("Konfirmasi penerimaan barang?")) return;
    try {
      await purchaseOrderService.receive(id);
      alert("Barang diterima!");
      setIsDetailModalOpen(false);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal konfirmasi");
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50/30 min-h-screen">
      <PageBreadcrumb pageName="Purchase Order (PO)" />

      <div className="flex justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
        >
          <Plus size={16} className="inline mr-2" /> Terbitkan PO Baru
        </button>
      </div>

      {/* Tabel PO */}
      <div className="rounded-3xl border border-gray-100 bg-white shadow-sm dark:bg-gray-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50">
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Identitas</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Supplier</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Status</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={4} className="py-20 text-center animate-pulse text-gray-400 font-black uppercase text-[10px]">Syncing...</td></tr>
              ) : pos.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-blue-600 uppercase italic tracking-tighter">{po.kode}</span>
                      <span className="text-[9px] text-gray-400 font-bold uppercase">{po.order_date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-700 dark:text-gray-300">
                    {po.supplier?.nama || "—"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${po.status === 'draft' ? 'bg-gray-100 text-gray-400' :
                        po.status === 'sent' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                      }`}>{po.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => { setSelectedPO(po); setIsDetailModalOpen(true); }} className="p-2.5 bg-gray-50 text-gray-400 hover:text-blue-600 rounded-xl"><Eye size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETAIL (PO ACTION) */}
      {isDetailModalOpen && selectedPO && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-white rounded-3xl p-6 shadow-2xl dark:bg-gray-900 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase italic">{selectedPO.kode}</h3>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-red-500">✕</button>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-4 dark:bg-gray-800">
                <Truck className="text-blue-600" size={24} />
                <div><p className="text-[9px] font-black text-gray-400 uppercase">Supplier</p><p className="text-sm font-black uppercase">{selectedPO.supplier?.nama}</p></div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto rounded-2xl border border-gray-100 dark:border-gray-800 mb-6">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 sticky top-0 dark:bg-gray-800">
                  <tr className="text-[9px] font-black uppercase text-gray-400">
                    <th className="p-5">Barang</th>
                    <th className="p-5 text-center">Qty</th>
                    <th className="p-5 text-right">Harga Satuan (PO)</th>
                    <th className="p-5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {selectedPO.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td className="p-5 font-bold text-gray-700 dark:text-gray-300">{item.raw_material?.name || item.product?.name}</td>
                      <td className="p-5 text-center font-black">{item.quantity} {item.unit?.name}</td>
                      <td className="p-5 text-right">
                        {selectedPO.status === 'draft' ? (
                          <input
                            type="number"
                            defaultValue={item.price || 0}
                            onBlur={(e) => handleUpdatePrice(item.id, Number(e.target.value))}
                            className="w-28 border-2 border-blue-50 rounded-xl px-2 py-1.5 text-right font-black outline-none focus:border-blue-500 transition-all dark:bg-gray-800"
                          />
                        ) : <span className="font-bold">Rp {(item.price || 0).toLocaleString()}</span>}
                      </td>
                      <td className="p-5 text-right font-black text-blue-600">Rp {(item.subtotal || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <button onClick={() => setIsDetailModalOpen(false)} className="px-6 py-2.5 text-xs font-black text-gray-400 uppercase">Tutup</button>
              {selectedPO.status === 'draft' && (
                <button onClick={() => handleSubmitPO(selectedPO.id)} className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase flex items-center gap-2"><Send size={16} /> Submit PO</button>
              )}
              {selectedPO.status === 'sent' && (
                <button onClick={() => handleReceivePO(selectedPO.id)} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase flex items-center gap-2"><PackageCheck size={16} /> Terima Barang</button>
              )}
            </div>
          </div>
        </div>
      )}

      <PurchaseOrderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={fetchData} />
    </div>
  );
}
