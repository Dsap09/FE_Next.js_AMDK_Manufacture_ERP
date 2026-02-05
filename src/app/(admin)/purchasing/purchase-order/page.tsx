"use client";
import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { purchaseOrderService } from "@/services/purchaseOrderService";
import { supplierService } from "@/services/supplierService";
import { 
  Eye, 
  Send, 
  PackageCheck, 
  Trash2, 
  AlertCircle,
  FileText,
  Clock,
  CheckCircle,
  Truck
} from "lucide-react";

export default function PurchaseOrderPage() {
  const [loading, setLoading] = useState(true);
  const [pos, setPos] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [selectedPO, setSelectedPO] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // 1. Ambil Data PO & Supplier sesuai relasi di Controller
  const fetchData = async () => {
    try {
      setLoading(true);
      const [resPO, resSuppliers] = await Promise.all([
        purchaseOrderService.getAll(),
        supplierService.getAll()
      ]);
      setPos(Array.isArray(resPO) ? resPO : resPO.data || []);
      setSuppliers(Array.isArray(resSuppliers) ? resSuppliers : resSuppliers.data || []);
    } catch (error) {
      console.error("Gagal sinkronisasi data PO:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Update Harga Item (Hanya jika status PO 'draft')
  const handleUpdatePrice = async (itemId: number, price: number) => {
    try {
      await purchaseOrderService.updateItemPrice(itemId, price);
      // Refresh detail untuk melihat update subtotal dari backend
      const updatedPO = await purchaseOrderService.getById(selectedPO.id);
      setSelectedPO(updatedPO);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal memperbarui harga");
    }
  };

  // 3. Submit PO ke Supplier (Draft -> Sent)
  const handleSubmitPO = async (id: number) => {
    if (!confirm("Kirim PO ini ke supplier? Pastikan semua harga telah diisi.")) return;
    try {
      await purchaseOrderService.submit(id);
      alert("PO Berhasil dikirim!");
      setIsDetailModalOpen(false);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal mengirim PO");
    }
  };

  // 4. Konfirmasi Terima Barang (Sent -> Received)
  const handleReceivePO = async (id: number) => {
    if (!confirm("Konfirmasi penerimaan barang untuk PO ini?")) return;
    try {
      await purchaseOrderService.receive(id);
      alert("Status PO diperbarui: Barang Diterima");
      setIsDetailModalOpen(false);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal konfirmasi penerimaan");
    }
  };


  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50/30 min-h-screen">
      <PageBreadcrumb pageName="Purchase Order (PO)" />

      {/* TABEL UTAMA */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:bg-gray-900 dark:border-gray-800">
        <div className="p-6 border-b border-gray-50 dark:border-gray-800">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-800 dark:text-white">Daftar Pesanan Pembelian</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50">
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-500">Kode PO</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-500">Supplier</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-500">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-500">Dibuat Oleh</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-500 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={5} className="p-10 text-center animate-pulse text-gray-400 font-bold uppercase text-[10px]">Sinkronisasi Data...</td></tr>
              ) : pos.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic text-xs">Belum ada Purchase Order.</td></tr>
              ) : pos.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-6 py-4 font-black text-blue-600 text-xs">{po.kode}</td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-700 dark:text-gray-300">
                    {po.supplier?.name || <span className="text-amber-500">Belum dipilih</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                      po.status === 'draft' ? 'bg-gray-100 text-gray-500' :
                      po.status === 'sent' ? 'bg-blue-100 text-blue-600' :
                      'bg-emerald-100 text-emerald-600'
                    }`}>
                      {po.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[10px] font-medium text-gray-500">
                    {po.creator?.name || "System"}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => { setSelectedPO(po); setIsDetailModalOpen(true); }}
                      className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETAIL & WORKFLOW ACTION */}
      {isDetailModalOpen && selectedPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <div>
                <h3 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tight">Detail {selectedPO.kode}</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Status: {selectedPO.status}</p>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-800 transition-colors">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-xs font-medium">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Supplier</p>
                <p className="font-black text-gray-800 dark:text-white">{selectedPO.supplier?.name || "—"}</p>
                <p className="text-gray-500">{selectedPO.supplier?.email || selectedPO.supplier?.phone}</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Tanggal Order</p>
                <p className="font-black text-gray-800 dark:text-white">
                  {new Date(selectedPO.order_date).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto rounded-xl border border-gray-100 dark:border-gray-800 mb-6">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800/50 font-black text-[9px] text-gray-500 uppercase">
                  <tr>
                    <th className="p-4">Item (Bahan/Produk)</th>
                    <th className="p-4 text-center">Jumlah</th>
                    <th className="p-4 text-right">Harga Satuan (IDR)</th>
                    <th className="p-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {selectedPO.items?.map((item: any) => (
                    <tr key={item.id} className="hover:bg-gray-50/30">
                      <td className="p-4 font-bold text-gray-700 dark:text-gray-300">
                        {item.raw_material?.name || item.product?.name || "Item"}
                      </td>
                      <td className="p-4 text-center font-black text-gray-500">
                        {item.quantity} {item.unit?.name}
                      </td>
                      <td className="p-4 text-right">
                        {selectedPO.status === 'draft' ? (
                          <input 
                            type="number"
                            defaultValue={item.price || 0}
                            onBlur={(e) => handleUpdatePrice(item.id, Number(e.target.value))}
                            className="w-28 border border-gray-200 rounded-lg px-2 py-1.5 text-right font-black focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                          />
                        ) : (
                          <span className="font-black">{(item.price || 0).toLocaleString('id-ID')}</span>
                        )}
                      </td>
                      <td className="p-4 text-right font-black text-blue-600">
                        {(item.subtotal || 0).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ACTION FOOTER SESUAI WORKFLOW CONTROLLER */}
            <div className="flex justify-end items-center gap-3 pt-6 border-t dark:border-gray-800">
              <button 
                onClick={() => setIsDetailModalOpen(false)}
                className="px-6 py-2.5 text-xs font-black text-gray-400 uppercase hover:text-gray-600 transition-colors"
              >
                Tutup
              </button>
              
              {selectedPO.status === 'draft' && (
                <button 
                  onClick={() => handleSubmitPO(selectedPO.id)}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-black text-white hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
                >
                  <Send size={16} /> SUBMIT KE SUPPLIER
                </button>
              )}

              {selectedPO.status === 'sent' && (
                <button 
                  onClick={() => handleReceivePO(selectedPO.id)}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-black text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all active:scale-95"
                >
                  <PackageCheck size={16} /> KONFIRMASI TERIMA BARANG
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}