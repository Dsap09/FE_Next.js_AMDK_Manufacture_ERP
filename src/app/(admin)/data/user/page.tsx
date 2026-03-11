import React from "react";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import UserTable from "@/components/tables/UserTable";

export const metadata = {
  title: "Data User | Project ERP",
};

export default function UserPage() {
  return (
    <div className="p-4 md:p-6 2xl:p-10">
      <PageBreadCrumb pageName="Data User" />
      <UserTable />
    </div>
  );
}
