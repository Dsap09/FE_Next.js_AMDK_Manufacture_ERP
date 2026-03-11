import React from "react";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import AdminTable from "@/components/tables/AdminTable";

export const metadata = {
  title: "Data Admin | Project ERP",
};

export default function AdminPage() {
  return (
    <div className="p-4 md:p-6 2xl:p-10">
      <PageBreadCrumb pageName="Data Admin" />
      <AdminTable />
    </div>
  );
}
