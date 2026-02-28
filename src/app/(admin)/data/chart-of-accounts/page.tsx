import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ChartOfAccountTable from "@/components/tables/ChartOfAccountTable";

export const metadata = {
    title: "Chart of Accounts | ERP Management",
};

export default function ChartOfAccountsPage() {
    return (
        <div className="p-4 md:p-6 2xl:p-10">
            <PageBreadcrumb pageName="Chart of Accounts" />
            <div className="mt-6">
                <ChartOfAccountTable />
            </div>
        </div>
    );
}
