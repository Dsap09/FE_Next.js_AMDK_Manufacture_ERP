import React from "react";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import ProductTable from "@/components/tables/ProductTable";

export const metadata = {
  title: "Data Produk | ERP System",
};

export default function ProductPage() {
  return (
    <div className="p-4 md:p-6 2xl:p-10">
      <PageBreadCrumb pageName="Data Produk" />
      <ProductTable />
    </div>
  );
}