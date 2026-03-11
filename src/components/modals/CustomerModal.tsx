"use client";
import React, { useEffect, useState } from "react";
import Button from "../ui/button/Button";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData?: any;
}

export default function CustomerModal({ isOpen, onClose, onSave, initialData }: Props) {
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        type: "distributor",
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    name: initialData.name || "",
                    address: initialData.address || "",
                    type: initialData.type || "distributor",
                });
            } else {
                setFormData({
                    name: "",
                    address: "",
                    type: "distributor",
                });
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = () => {
        if (!formData.name || !formData.address || !formData.type) {
            return alert("Harap isi semua field wajib!");
        }
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
                <h3 className="mb-6 text-xl font-bold text-gray-800 dark:text-white">
                    {initialData ? "Edit Customer" : "Tambah Customer Baru"}
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">Nama Customer <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Nama Lengkap / Perusahaan"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Tipe <span className="text-red-500">*</span></label>
                        <select
                            className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="distributor">Distributor</option>
                            <option value="agent">Agen</option>
                            <option value="retail">Retail</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Alamat <span className="text-red-500">*</span></label>
                        <textarea
                            className="w-full rounded-lg border border-gray-200 p-2.5 dark:bg-gray-800 dark:border-gray-700"
                            rows={3}
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Alamat Lengkap"
                        />
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                        Batal
                    </button>
                    <Button onClick={handleSubmit}>Simpan</Button>
                </div>
            </div>
        </div>
    );
}
