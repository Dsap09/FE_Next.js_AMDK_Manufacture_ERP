"use client";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import SalesReturnTable from "@/components/tables/SalesReturnTable";

export default function SalesReturnPage() {
    return (
        <div className="p-4 md:p-6 2xl:p-10 w-full max-w-full overflow-hidden">
            <PageBreadcrumb pageName="Retur Penjualan" />
            <div className="mt-6">
                <SalesReturnTable />
            </div>
        </div>
    );
}
