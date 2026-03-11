"use client";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import SalesQuotationTable from "@/components/tables/SalesQuotationTable";

export default function SalesQuotationPage() {
    return (
        <div className="p-4 md:p-6 2xl:p-10">
            <PageBreadcrumb pageName="Penawaran Penjualan (Quotations)" />
            <div className="mt-6">
                <SalesQuotationTable />
            </div>
        </div>
    );
}
