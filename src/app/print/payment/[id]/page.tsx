"use client";
import React, { useEffect, useState } from "react";
import { payablePaymentService } from "@/services/payablePaymentService";
import { Loader2 } from "lucide-react";

export default function PaymentPrintPage({ params }: { params: Promise<{ id: string }> }) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [resolvedId, setResolvedId] = useState<string>("");

    useEffect(() => {
        params.then((p) => setResolvedId(p.id));
    }, [params]);

    useEffect(() => {
        if (!resolvedId) return;
        const fetchPrint = async () => {
            try {
                const res = await payablePaymentService.print(resolvedId);
                setData(res);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchPrint();
    }, [resolvedId]);

    useEffect(() => {
        if (data) {
            setTimeout(() => window.print(), 500);
        }
    }, [data]);

    const formatCurrency = (amount: number) =>
        `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-400 font-bold">Data tidak ditemukan</p>
            </div>
        );
    }

    return (
        <div className="max-w-[800px] mx-auto p-8 bg-white text-black print:p-4">
            <style jsx global>{`
                @media print {
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print { display: none !important; }
                }
            `}</style>

            {/* Header */}
            <div className="text-center border-b-2 border-black pb-4 mb-6">
                <img src="/images/logo/logo_amdk.png" alt="Logo" className="h-16 mx-auto mb-2" />
                <h1 className="text-2xl font-black uppercase tracking-wider">Bukti Pembayaran</h1>
                <p className="text-sm text-gray-500 mt-1 uppercase font-bold tracking-widest">PT. Manufaktur DKM</p>
            </div>

            {/* Payment Info */}
            <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
                <div>
                    <table className="w-full">
                        <tbody>
                            <tr><td className="font-bold py-1 w-40">No. Pembayaran</td><td>: {data.payment?.payment_number}</td></tr>
                            <tr><td className="font-bold py-1">Tanggal</td><td>: {data.payment?.payment_date ? data.payment.payment_date.split('T')[0] : "—"}</td></tr>
                            <tr><td className="font-bold py-1">Metode</td><td>: {data.payment?.payment_method}</td></tr>
                            <tr><td className="font-bold py-1">Akun</td><td>: {data.payment?.payment_account}</td></tr>
                        </tbody>
                    </table>
                </div>
                <div>
                    <table className="w-full">
                        <tbody>
                            <tr><td className="font-bold py-1 w-40">Supplier</td><td>: {data.supplier?.name}</td></tr>
                            <tr><td className="font-bold py-1">Alamat</td><td>: {data.supplier?.address || "—"}</td></tr>
                            <tr><td className="font-bold py-1">Telepon</td><td>: {data.supplier?.phone || "—"}</td></tr>
                            <tr><td className="font-bold py-1">Email</td><td>: {data.supplier?.email || "—"}</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payable / Invoice Info */}
            <div className="border rounded-lg overflow-hidden mb-6">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left font-bold">Keterangan</th>
                            <th className="p-3 text-left font-bold">Referensi</th>
                            <th className="p-3 text-right font-bold">Jumlah</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-t">
                            <td className="p-3">Hutang Usaha</td>
                            <td className="p-3">{data.payable?.payable_number}</td>
                            <td className="p-3 text-right font-bold">{formatCurrency(data.payable?.amount)}</td>
                        </tr>
                        {data.receipt && (
                            <tr className="border-t">
                                <td className="p-3 text-gray-500">TTF</td>
                                <td className="p-3 text-gray-500">{data.receipt?.receipt_number} (PO: {data.receipt?.po_kode})</td>
                                <td className="p-3"></td>
                            </tr>
                        )}
                        {data.invoice && (
                            <tr className="border-t">
                                <td className="p-3 text-gray-500">Invoice</td>
                                <td className="p-3 text-gray-500">{data.invoice?.invoice_number}</td>
                                <td className="p-3 text-right text-gray-500">{formatCurrency(data.invoice?.amount)}</td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t-2">
                        <tr>
                            <td colSpan={2} className="p-3 font-black text-right uppercase">Total Pembayaran</td>
                            <td className="p-3 text-right font-black text-lg">{formatCurrency(data.payment?.amount)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Bank details */}
            {(data.payment?.bank_name || data.payment?.account_number || data.payment?.reference_number) && (
                <div className="mb-6 p-4 border rounded-lg bg-gray-50 text-sm">
                    <p className="font-bold mb-2">Detail Pembayaran:</p>
                    {data.payment?.bank_name && <p>Bank: {data.payment.bank_name}</p>}
                    {data.payment?.account_number && <p>No. Rekening: {data.payment.account_number}</p>}
                    {data.payment?.reference_number && <p>No. Referensi: {data.payment.reference_number}</p>}
                </div>
            )}

            {data.payment?.notes && (
                <div className="mb-6 text-sm">
                    <p className="font-bold">Catatan:</p>
                    <p className="text-gray-600">{data.payment.notes}</p>
                </div>
            )}

            {/* Signatures */}
            <div className="grid grid-cols-3 gap-6 mt-12 text-center text-sm">
                <div>
                    <p className="font-bold mb-16">Dibuat oleh</p>
                    <p className="border-t pt-2">{data.created_by || "___________"}</p>
                </div>
                <div>
                    <p className="font-bold mb-16">Disetujui oleh</p>
                    <p className="border-t pt-2">{data.payment?.confirmed_by || "___________"}</p>
                </div>
                <div>
                    <p className="font-bold mb-16">Diterima oleh</p>
                    <p className="border-t pt-2">___________</p>
                </div>
            </div>

            {/* Print button */}
            <div className="no-print mt-8 text-center">
                <button onClick={() => window.print()}
                    className="bg-gray-800 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-gray-900 transition-all">
                    🖨️ Cetak
                </button>
            </div>
        </div>
    );
}
