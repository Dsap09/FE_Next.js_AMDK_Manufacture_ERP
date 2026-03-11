"use client";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CustomerTable from "@/components/tables/CustomerTable";

export default function CustomerPage() {
    return (
        <div className="p-4 md:p-6 2xl:p-10">
            <PageBreadcrumb pageName="Data Customer" />
            <div className="mt-6">
                <CustomerTable />
            </div>
        </div>
    );
}
