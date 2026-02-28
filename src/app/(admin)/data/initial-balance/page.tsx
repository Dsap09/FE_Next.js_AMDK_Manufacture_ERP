import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import InitialBalanceTable from "@/components/tables/InitialBalanceTable";

export const metadata = {
    title: "Initial Balance | ERP Management",
};

export default function InitialBalancePage() {
    return (
        <div className="p-4 md:p-6 2xl:p-10">
            <PageBreadcrumb pageName="Initial Balance (Saldo Awal)" />
            <div className="mt-6">
                <InitialBalanceTable />
            </div>
        </div>
    );
}
