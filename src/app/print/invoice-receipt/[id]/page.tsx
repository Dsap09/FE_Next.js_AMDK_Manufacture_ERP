"use client";
import { useEffect, useState } from "react";
import { invoiceReceiptService } from "@/services/invoiceReceiptService";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function InvoiceReceiptPrintPage() {
    const { id } = useParams();
    const [receipt, setReceipt] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                // Determine if ID is string or array
                const receiptId = Array.isArray(id) ? id[0] : id;
                const res = await invoiceReceiptService.getById(parseInt(receiptId));
                setReceipt(res);
            } catch (error) {
                console.error("Failed to fetch receipt:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        if (!loading && receipt) {
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, [loading, receipt]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
        );
    }

    if (!receipt) return <div className="p-8 text-center text-red-500 font-bold">Data tidak ditemukan</div>;

    return (
        <div className="bg-white min-h-screen text-black font-sans p-8 max-w-[210mm] mx-auto print:p-0 print:max-w-none">
            {/* Header */}
            <div className="mb-8 border-b-2 border-black pb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter mb-1">Tanda Terima Faktur</h1>
                        <p className="text-sm font-bold text-gray-600 uppercase">No. {receipt.receipt_number}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-lg font-bold uppercase">PT. DKM Manufaktur</h2>
                        <p className="text-xs text-gray-500">Jl. Raya Industri No. 123, Cikarang</p>
                        <p className="text-xs text-gray-500">Telp: (021) 89012345</p>
                    </div>
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                <div>
                    <table className="w-full">
                        <tbody>
                            <tr>
                                <td className="font-bold py-1 w-32 align-top uppercase text-xs text-gray-500">Dari Supplier</td>
                                <td className="py-1 font-bold">{receipt.purchase_order?.supplier?.nama}</td>
                            </tr>
                            <tr>
                                <td className="font-bold py-1 align-top uppercase text-xs text-gray-500">Telepon</td>
                                <td className="py-1">{receipt.purchase_order?.supplier?.telepon || "-"}</td>
                            </tr>
                            <tr>
                                <td className="font-bold py-1 align-top uppercase text-xs text-gray-500">Alamat</td>
                                <td className="py-1 max-w-[200px]">{receipt.purchase_order?.supplier?.alamat || "-"}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div>
                    <table className="w-full">
                        <tbody>
                            <tr>
                                <td className="font-bold py-1 w-32 align-top uppercase text-xs text-gray-500">Tanggal TTF</td>
                                <td className="py-1 font-bold">{receipt.transaction_date}</td>
                            </tr>
                            <tr>
                                <td className="font-bold py-1 align-top uppercase text-xs text-gray-500">PO Ref</td>
                                <td className="py-1 font-bold">{receipt.purchase_order?.kode}</td>
                            </tr>
                            <tr>
                                <td className="font-bold py-1 align-top uppercase text-xs text-gray-500">Requester</td>
                                <td className="py-1">{receipt.requester?.name || "-"}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Table */}
            <div className="mb-8">
                <table className="w-full border-collapse border border-black text-xs">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black p-2 text-left uppercase">No. Faktur</th>
                            <th className="border border-black p-2 text-left uppercase">Tanggal Faktur</th>
                            <th className="border border-black p-2 text-left uppercase">Jatuh Tempo</th>
                            <th className="border border-black p-2 text-right uppercase">Jumlah (RP)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {receipt.invoices?.map((inv: any) => (
                            <tr key={inv.id}>
                                <td className="border border-black p-2 font-bold">{inv.invoice_number}</td>
                                <td className="border border-black p-2">{inv.invoice_date}</td>
                                <td className="border border-black p-2">{inv.due_date}</td>
                                <td className="border border-black p-2 text-right font-bold">
                                    {Number(inv.amount).toLocaleString("id-ID")}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-50">
                            <td colSpan={3} className="border border-black p-2 text-right font-black uppercase">Total Amount</td>
                            <td className="border border-black p-2 text-right font-black text-sm">
                                {Number(receipt.invoices?.reduce((sum: number, i: any) => sum + Number(i.amount), 0) || 0).toLocaleString("id-ID")}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Notes */}
            {receipt.notes && (
                <div className="mb-12 p-4 border border-dashed border-gray-400 rounded-lg bg-gray-50">
                    <p className="text-xs font-bold uppercase text-gray-500 mb-1">Catatan:</p>
                    <p className="text-sm italic">"{receipt.notes}"</p>
                </div>
            )}

            {/* Signatures */}
            <div className="flex justify-between mt-16 text-center text-xs">
                <div className="w-1/3">
                    <p className="font-bold uppercase mb-16">Dibuat Oleh</p>
                    <p className="font-bold underline">{receipt.requester?.name || "( ........................... )"}</p>
                </div>
                <div className="w-1/3">
                    <p className="font-bold uppercase mb-16">Diterima Oleh</p>
                    <p className="font-bold underline">{receipt.creator?.name || "( ........................... )"}</p>
                </div>
                <div className="w-1/3">
                    <p className="font-bold uppercase mb-16">Disetujui Oleh</p>
                    <p className="font-bold underline">( ........................... )</p>
                    <p className="mt-1">Manager Purchasing</p>
                </div>
            </div>

            {/* Print Footer */}
            <div className="fixed bottom-4 left-0 w-full text-center text-[10px] text-gray-400 print:block hidden">
                Dicetak pada {new Date().toLocaleString("id-ID")}
            </div>
        </div>
    );
}
