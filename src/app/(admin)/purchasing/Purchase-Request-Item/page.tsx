"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { purchaseRequestService } from "@/services/purchaseRequestService";
import { purchaseRequestItemService } from "@/services/purchaseRequestItemService";
import { unitService } from "@/services/unitService";
import { rawMaterialService } from "@/services/rawMaterialService";
import { productService } from "@/services/productService";
import { Plus, Trash2, Save, Edit2, Check, X, AlertCircle, ChevronLeft } from "lucide-react";

export default function PurchaseRequestItemPage() {
  const { id: prId } = useParams();
  const router = useRouter();

  const [pr, setPr] = useState<any>(null);
  const [units, setUnits] = useState([]);
  const [masterData, setMasterData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ quantity: 0, notes: "" });
  const [newRows, setNewRows] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    if (!prId || prId === "undefined") return;
    setLoading(true);
    try {
      const resPr = await purchaseRequestService.getById(prId as string);
      const currentPr = resPr.data || resPr;
      setPr(currentPr);

      const resUnits = await unitService.getAll();
      setUnits(Array.isArray(resUnits) ? resUnits : resUnits.data || []);

      if (currentPr.type === "raw_materials") {
        const res = await rawMaterialService.getAll();
        setMasterData(res.data?.data || res.data || []);
      } else {
        const res = await productService.getAll();
        setMasterData(res.data?.data || res.data || []);
      }
    } catch (e) { console.error("Sync Error:", e); } finally { setLoading(false); }
  }, [prId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSaveItems = async () => {
    try {
      const payload = {
        purchase_request_id: Number(prId),
        items: newRows.map(row => ({
          ...row,
          quantity: Number(row.quantity),
          unit_id: Number(row.unit_id),
          product_id: row.product_id ? Number(row.product_id) : null,
          raw_material_id: row.raw_material_id ? Number(row.raw_material_id) : null
        }))
      };
      await purchaseRequestItemService.store(payload);
      setNewRows([]);
      loadData();
    } catch (e) { alert("Gagal simpan item"); }
  };

  if (loading && !pr) return <div className="p-10 text-center font-black animate-pulse text-gray-400">LOADING DATA...</div>;

  const isDraft = pr?.status === 'draft';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-gray-100 dark:bg-gray-900">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl"><ChevronLeft /></button>
          <div>
            <h2 className="text-xl font-black uppercase italic">{pr?.kode}</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{pr?.status} • {pr?.type}</p>
          </div>
        </div>
        {isDraft && (
          <button onClick={() => setNewRows([...newRows, { unit_id: "", quantity: 1, notes: "" }])} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-black uppercase">
            Tambah Item
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-900">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 border-b dark:bg-gray-800">
            <tr>
              <th className="p-5">Nama Barang</th>
              <th className="p-5 text-center">Unit</th>
              <th className="p-5 text-center">Qty</th>
              <th className="p-5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {pr?.items?.map((item: any) => (
              <tr key={item.id} className="hover:bg-gray-50/50">
                <td className="p-5 font-bold">{item.raw_material?.name || item.product?.name}</td>
                <td className="p-5 text-center">{item.unit?.name}</td>
                <td className="p-5 text-center font-black text-blue-600">{item.quantity}</td>
                <td className="p-5 text-right">
                  {isDraft && <button onClick={() => purchaseRequestItemService.destroy(item.id).then(loadData)} className="text-red-500 p-2"><Trash2 size={16}/></button>}
                </td>
              </tr>
            ))}
            {newRows.map((row, index) => (
              <tr key={index} className="bg-blue-50/20">
                <td className="p-4">
                  <select className="w-full p-2 rounded-xl text-xs font-bold border-2 border-blue-100 dark:bg-gray-800"
                    onChange={(e) => { const u = [...newRows]; u[index][pr.type === 'product' ? 'product_id' : 'raw_material_id'] = e.target.value; setNewRows(u); }}>
                    <option value="">-- Pilih Barang --</option>
                    {masterData.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </td>
                <td className="p-4">
                  <select className="w-full p-2 rounded-xl text-xs font-bold border-2 border-blue-100 dark:bg-gray-800"
                    onChange={(e) => { const u = [...newRows]; u[index].unit_id = e.target.value; setNewRows(u); }}>
                    <option value="">-- Unit --</option>
                    {units.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </td>
                <td className="p-4">
                  <input type="number" className="w-20 p-2 text-center font-black border-2 border-blue-100 rounded-xl dark:bg-gray-800"
                    value={row.quantity} onChange={(e) => { const u = [...newRows]; u[index].quantity = e.target.value; setNewRows(u); }} />
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => setNewRows(newRows.filter((_, i) => i !== index))} className="text-red-400"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {newRows.length > 0 && (
          <div className="p-4 bg-gray-50 flex justify-end dark:bg-gray-800">
            <button onClick={handleSaveItems} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase">
              Simpan Semua Item
            </button>
          </div>
        )}
      </div>
    </div>
  );
}