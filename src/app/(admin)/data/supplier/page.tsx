import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import SupplierTable from "@/components/tables/SupplierTable";

export default function SupplierPage() {
  return (
    <div className="p-4 md:p-6 2xl:p-10">
      <PageBreadcrumb pageName="Data Supplier" />
      <div className="mt-6">
        <SupplierTable />
      </div>
    </div>
  );
}