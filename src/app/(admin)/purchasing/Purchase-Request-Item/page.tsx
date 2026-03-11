"use client";
import React, { useEffect, useState, useCallback, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { purchaseRequestService } from "@/services/purchaseRequestService";
import { purchaseRequestItemService } from "@/services/purchaseRequestItemService";
import { unitService } from "@/services/unitService";
import { rawMaterialService } from "@/services/rawMaterialService";
import { productService } from "@/services/productService";
import {
  Plus, Trash2, Save, Edit2, Check, X,
  ChevronLeft, Loader2, Calculator, BadgeDollarSign
} from "lucide-react";

function PurchaseRequestItemContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const prId = searchParams.get("id");

  const [pr, setPr] = useState<any>(null);
  const [units, setUnits] = useState([]);
  const [masterData, setMasterData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ quantity: 0, notes: "" });
  const [newRows, setNewRows] = useState<any[]>([]);

  // --- Helper Konversi Angka Aman ---
  const toNum = (val: any) => {
    const n = parseFloat(val);
    return isNaN(n) ? 0 : n;
  };



  const loadData = useCallback(async () => {
    if (!prId) return;
    setLoading(true);
    try {
      const resPr = await purchaseRequestService.getById(prId);
      const currentPr = resPr.data || resPr;
      setPr(currentPr);

      const resUnits = await unitService.getAll();
      setUnits(Array.isArray(resUnits) ? resUnits : resUnits.data || []);

      const resMaster = currentPr.type === "raw_materials"
        ? await rawMaterialService.getAll()
        : await productService.getAll();
      setMasterData(resMaster.data?.data || resMaster.data || []);
    } catch (e) {
      console.error("Gagal load data:", e);
    } finally {
      setLoading(false);
    }
  }, [prId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSaveNewItems = async () => {
    try {
      const payload = {
        purchase_request_id: Number(prId),
        items: newRows.map(row => ({
          ...row,
          quantity: toNum(row.quantity),
          price: 0,
          unit_id: Number(row.unit_id),
          product_id: row.product_id ? Number(row.product_id) : null,
          raw_material_id: row.raw_material_id ? Number(row.raw_material_id) : null
        }))
      };
      await purchaseRequestItemService.store(payload);
      setNewRows([]);
      loadData();
      alert("Item berhasil ditambahkan!");
    } catch (e) { alert("Gagal simpan items"); }
  };

  const handleUpdate = async (id: number) => {
    try {
      const payload = {
        quantity: toNum(editForm.quantity),
        price: 0,
        notes: editForm.notes
      };
      await purchaseRequestItemService.update(id, payload);
      setEditingId(null);
      loadData();
      alert("Qty berhasil diperbarui!");
    } catch (e: any) {
      alert("Update Gagal: " + (e.response?.data?.message || "Cek Koneksi"));
    }
  };

  if (loading && !pr) return <div className="p-10 text-center font-black animate-pulse text-blue-600">MENYIAPKAN DATA...</div>;

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50/20 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-gray-100 dark:bg-gray-900">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><ChevronLeft /></button>
          <div>
            <h2 className="text-xl font-black uppercase italic text-blue-600 tracking-tighter">{pr?.kode}</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{pr?.status} • {pr?.type}</p>
          </div>
        </div>
        {pr?.status === 'draft' && (
          <button
            onClick={() => setNewRows([...newRows, { unit_id: "", quantity: 1, price: 0, notes: "" }])}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase shadow-lg shadow-blue-100 hover:scale-105 transition-all"
          >
            + Tambah Baris
          </button>
        )}
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-900">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 border-b dark:bg-gray-800 tracking-widest">
            <tr>
              <th className="p-6">Nama Barang</th>
              <th className="p-6 text-center">Unit</th>
              <th className="p-6 text-center">Qty</th>
              <th className="p-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {pr?.items?.map((item: any) => (
              <tr key={item.id} className="hover:bg-gray-50/30 transition-colors">
                <td className="p-6 font-bold text-gray-700 dark:text-gray-300">
                  {item.raw_material?.name || item.product?.name}
                </td>
                <td className="p-6 text-center font-bold text-gray-400">{item.unit?.name || "N/A"}</td>
                <td className="p-6 text-center">
                  {editingId === item.id ? (
                    <input type="number" className="w-16 border-2 border-blue-100 rounded-lg p-1 text-center font-bold"
                      value={editForm.quantity} onChange={(e) => setEditForm({ ...editForm, quantity: toNum(e.target.value) })} />
                  ) : <span className="font-black">{item.quantity}</span>}
                </td>
                <td className="p-6 text-right">
                  {pr.status === 'draft' && (
                    <div className="flex justify-end gap-2">
                      {editingId === item.id ? (
                        <>
                          <button onClick={() => handleUpdate(item.id)} className="text-emerald-500 p-2 bg-emerald-50 rounded-lg"><Check size={16} /></button>
                          <button onClick={() => setEditingId(null)} className="text-gray-400 p-2 bg-gray-50 rounded-lg"><X size={16} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingId(item.id); setEditForm({ quantity: item.quantity, notes: item.notes || "" }); }}
                            className="text-blue-500 p-2 bg-blue-50 rounded-lg transition-transform active:scale-90"><Edit2 size={16} /></button>
                          <button onClick={() => { if (confirm("Hapus item?")) purchaseRequestItemService.destroy(item.id).then(loadData); }}
                            className="text-red-400 p-2 bg-red-50 rounded-lg transition-transform active:scale-90"><Trash2 size={16} /></button>
                        </>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}

            {/* BARIS INPUT BARU */}
            {newRows.map((row, index) => (
              <tr key={index} className="bg-blue-50/20">
                <td className="p-4">
                  <select className="w-full p-2.5 rounded-xl text-xs font-bold border-2 border-blue-100 dark:bg-gray-800"
                    onChange={(e) => { const u = [...newRows]; u[index][pr.type === 'product' ? 'product_id' : 'raw_material_id'] = e.target.value; setNewRows(u); }}>
                    <option value="">-- Pilih Barang --</option>
                    {masterData.map((m: any) => <option key={m.id} value={m.id}>{m.name || m.nama}</option>)}
                  </select>
                </td>
                <td className="p-4">
                  <select className="w-full p-2.5 rounded-xl text-xs font-bold border-2 border-blue-100 dark:bg-gray-800"
                    onChange={(e) => { const u = [...newRows]; u[index].unit_id = e.target.value; setNewRows(u); }}>
                    <option value="">-- Unit --</option>
                    {units.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </td>
                <td className="p-4">
                  <input type="number" className="w-full p-2.5 text-center font-black border-2 border-blue-100 rounded-xl"
                    value={row.quantity} onChange={(e) => { const u = [...newRows]; u[index].quantity = e.target.value; setNewRows(u); }} />
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => setNewRows(newRows.filter((_, i) => i !== index))} className="text-red-400 p-2"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>


        </table>
      </div>

      {/* Action Footer */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100 dark:bg-gray-900 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Calculator size={20} /></div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Item Management</p>
            <p className="text-[10px] font-bold text-blue-600 italic">Tambahkan item yang dibutuhkan</p>
          </div>
        </div>
        {newRows.length > 0 && (
          <button onClick={handleSaveNewItems} className="bg-emerald-600 text-white px-10 py-3 rounded-2xl text-[11px] font-black uppercase shadow-lg shadow-emerald-100 transition-all active:scale-95 flex items-center gap-2">
            <Save size={16} /> Simpan Semua Item Baru
          </button>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-black text-gray-400 tracking-widest animate-pulse">SYNCHRONIZING PR DATA...</div>}>
      <PurchaseRequestItemContent />
    </Suspense>
  );
}
