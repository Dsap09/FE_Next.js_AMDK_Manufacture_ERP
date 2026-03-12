"use client";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DeliveryOrderTable from "@/components/tables/DeliveryOrderTable";

export default function DeliveryOrderPage() {
    return (
        <div className="p-4 md:p-6 2xl:p-10 w-full max-w-full overflow-hidden">
            <PageBreadcrumb pageName="Surat Jalan (Delivery Order)" />
            <div className="mt-6">
                <DeliveryOrderTable />
            </div>
        </div>
    );
}
