"use client";
import React, { useEffect, useState } from "react";
import { stockMovementService } from "@/services/stockMovementService";
import { Package, TrendingUp, TrendingDown, Calendar, Filter, RefreshCw } from "lucide-react";
import { useSearch } from "@/context/SearchContext";

interface StockMovement {
    id: number;
    item_name: string;
    item_type: "Product" | "RawMaterial";
    movement_type: string;
    quantity: number;
    created_at: string;
}

export default function StockMovementPage() {
    const { searchTerm } = useSearch();
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        type: "all", // all, Product, RawMaterial
        movementType: "all", // all, IN, OUT, ADJUSTMENT
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await stockMovementService.getAll();
            const data = response?.data || response;
            setMovements(Array.isArray(data) ? data : Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Failed to load stock movements:", error);
            setMovements([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Filter movements
    const filteredMovements = movements.filter((movement) => {
        const matchesSearch = !searchTerm || movement.item_name.toLowerCase().includes(searchTerm.toLowerCase()) || movement.movement_type.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesSearch) return false;
        
        if (filter.type !== "all" && movement.item_type !== filter.type) return false;
        if (filter.movementType !== "all") {
            const movementTypeUpper = movement.movement_type?.toUpperCase();
            if (movementTypeUpper !== filter.movementType) return false;
        }
        return true;
    });

    const getMovementIcon = (type: string) => {
        const typeUpper = type?.toUpperCase();
        if (typeUpper === "IN" || typeUpper === "TRANSFER_IN") {
            return <TrendingUp className="text-green-600" size={18} />;
        } else if (typeUpper === "OUT" || typeUpper === "TRANSFER_OUT") {
            return <TrendingDown className="text-red-600" size={18} />;
        }
        return <Package className="text-blue-600" size={18} />;
    };

    const getMovementBadge = (type: string) => {
        const typeUpper = type?.toUpperCase();
        if (typeUpper === "IN" || typeUpper === "TRANSFER_IN") {
            return "bg-green-100 text-green-700 border-green-200";
        } else if (typeUpper === "OUT" || typeUpper === "TRANSFER_OUT") {
            return "bg-red-100 text-red-700 border-red-200";
        }
        return "bg-blue-100 text-blue-700 border-blue-200";
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <RefreshCw className="animate-spin mx-auto mb-4 text-blue-600" size={40} />
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Loading Stock Movements...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6 bg-gray-50/20 min-h-screen">
            {/* Header */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 dark:bg-gray-900">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                            <Package className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black uppercase italic text-gray-800 dark:text-white tracking-tighter">
                                Stock Movement
                            </h1>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                Histori Pergerakan Stok
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={loadData}
                        className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 dark:bg-gray-900">
                <div className="flex items-center gap-2 mb-4">
                    <Filter size={16} className="text-gray-400" />
                    <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest">Filter</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                            Tipe Item
                        </label>
                        <select
                            className="w-full p-3 rounded-xl border-2 border-gray-100 text-sm font-bold focus:border-blue-500 outline-none transition-all dark:bg-gray-800"
                            value={filter.type}
                            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                        >
                            <option value="all">Semua</option>
                            <option value="Product">Produk Jadi</option>
                            <option value="RawMaterial">Bahan Baku</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                            Tipe Pergerakan
                        </label>
                        <select
                            className="w-full p-3 rounded-xl border-2 border-gray-100 text-sm font-bold focus:border-blue-500 outline-none transition-all dark:bg-gray-800"
                            value={filter.movementType}
                            onChange={(e) => setFilter({ ...filter, movementType: e.target.value })}
                        >
                            <option value="all">Semua</option>
                            <option value="IN">Masuk (IN)</option>
                            <option value="OUT">Keluar (OUT)</option>
                            <option value="ADJUSTMENT">Penyesuaian</option>
                            <option value="TRANSFER_IN">Transfer Masuk</option>
                            <option value="TRANSFER_OUT">Transfer Keluar</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-900">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-xs font-black uppercase text-gray-400 border-b dark:bg-gray-800 tracking-widest">
                            <tr>
                                <th className="p-6">Tanggal</th>
                                <th className="p-6">Nama Item</th>
                                <th className="p-6 text-center">Kategori</th>
                                <th className="p-6 text-center">Tipe Pergerakan</th>
                                <th className="p-6 text-right">Quantity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {filteredMovements.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center">
                                        <Package className="mx-auto mb-4 text-gray-300" size={48} />
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                            Tidak ada data pergerakan stok
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredMovements.map((movement, index) => (
                                    <tr key={`${movement.id}-${index}`} className="hover:bg-gray-50/30 transition-colors">
                                        <td className="p-6">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-gray-400" />
                                                <span className="text-xs font-bold text-gray-600">
                                                    {new Date(movement.created_at).toLocaleDateString("id-ID", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className="font-bold text-gray-800 dark:text-gray-200">
                                                {movement.item_name}
                                            </span>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span
                                                className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${movement.item_type === "Product"
                                                    ? "bg-purple-100 text-purple-700 border border-purple-200"
                                                    : "bg-amber-100 text-amber-700 border border-amber-200"
                                                    }`}
                                            >
                                                {movement.item_type === "Product" ? "Produk" : "Bahan Baku"}
                                            </span>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {getMovementIcon(movement.movement_type)}
                                                <span
                                                    className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getMovementBadge(
                                                        movement.movement_type
                                                    )}`}
                                                >
                                                    {movement.movement_type}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <span className="font-black text-blue-600 text-base">
                                                {movement.quantity.toLocaleString()}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Summary */}
                {filteredMovements.length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                Total Records
                            </p>
                            <p className="text-sm font-black text-blue-600">
                                {filteredMovements.length} Movement{filteredMovements.length > 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
