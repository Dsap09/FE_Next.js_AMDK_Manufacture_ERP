"use client";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import StockTransferTable from "@/components/tables/StockTransferTable";

export default function TransferWarehousePage() {
    return (
        <div className="p-4 md:p-6 2xl:p-10">
            <PageBreadcrumb pageName="Transfer Gudang" />
            <div className="mt-6">
                <StockTransferTable />
            </div>
        </div>
    );
}
