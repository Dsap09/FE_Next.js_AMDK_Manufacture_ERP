"use client";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import SalesInvoiceTable from "@/components/tables/SalesInvoiceTable";

export default function SalesInvoicePage() {
    return (
        <div className="p-4 md:p-6 2xl:p-10">
            <PageBreadcrumb pageName="Invoice Penjualan (Tagihan)" />
            <div className="mt-6">
                <SalesInvoiceTable />
            </div>
        </div>
    );
}
