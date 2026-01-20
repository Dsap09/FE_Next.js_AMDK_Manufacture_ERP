import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import WarehouseTable from "@/components/tables/WarehouseTable";

export const metadata = {
  title: "Data Warehouse | ERP Management",
};

export default function WarehousePage() {
  return (
    <div className="p-4 md:p-6 2xl:p-10">
      <PageBreadcrumb pageName="Data Warehouse" />
      <div className="mt-6">
        <WarehouseTable />
      </div>
    </div>
  );
}