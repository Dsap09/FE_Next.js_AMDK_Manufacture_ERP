import React from "react";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import UnitTable from "@/components/tables/UnitTable";

export const metadata = {
  title: "Data Unit | ERP Management",
};

export default function UnitPage() {
  return (
    <div className="p-4 md:p-6 2xl:p-10">
      <PageBreadCrumb pageName="Data Unit" />
      <UnitTable />
    </div>
  );
}
