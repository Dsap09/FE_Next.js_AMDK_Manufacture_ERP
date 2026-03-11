"use client";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import SalesOrderTable from "@/components/tables/SalesOrderTable";

export default function SalesOrderPage() {
    return (
        <div className="p-4 md:p-6 2xl:p-10">
            <PageBreadcrumb pageName="Surat Pesanan Konsumen (SPK)" />
            <div className="mt-6">
                <SalesOrderTable />
            </div>
        </div>
    );
}
