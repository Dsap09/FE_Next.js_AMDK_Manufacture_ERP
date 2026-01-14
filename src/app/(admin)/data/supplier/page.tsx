import React from "react";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import SupplierTable from "@/components/tables/SupplierTable";

export const metadata = {
  title: "Data Supplier | Project ERP",
};

export default function SupplierPage() {
  return (
    <div className="p-4 md:p-6 2xl:p-10">
      <PageBreadCrumb pageName="Data Supplier" />
      <SupplierTable />
    </div>
  );
}