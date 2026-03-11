"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  BoxIcon, // Menambahkan BoxIcon
  BoxCubeIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  TableIcon,
  DollarLineIcon, // Menambahkan DollarLineIcon
  PieChartIcon,
  PlugInIcon,
} from "../icons/index";
import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

// Modifikasi navItems sesuai kebutuhan ERP
const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: <BoxIcon />,
    name: "Pembelian",
    subItems: [
      { name: "Purchase Request", path: "/purchasing/purchase-request" },
      { name: "Purchase Request Item", path: "/purchasing/Purchase-Request-Item" },
      { name: "Purchase Order", path: "/purchasing/purchase-order" },
      { name: "Goods Receipt", path: "/purchasing/goods-receipt" },
      { name: "Purchase Return", path: "/purchasing/purchase-return" },
      { name: "Tanda Terima Faktur", path: "/purchasing/invoice-receipt" },
      { name: "Laporan Supplier", path: "/purchasing/supplier-report" },
      { name: "Laporan TTF", path: "/purchasing/ttf-report" },
      { name: "Laporan Retur", path: "/purchasing/return-report" },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "Persediaan",
    subItems: [
      { name: "Stock Movement", path: "/inventory/stock-movement" },
      { name: "Transfer Gudang", path: "/inventory/transfer-warehouse" },
      { name: "Kartu Persediaan", path: "/inventory/kartu-persediaan" },
      { name: "Laporan Persediaan", path: "/inventory/laporan" },
      { name: "Permintaan Stok", path: "/inventory/request" },
      { name: "Penyesuaian Stok", path: "/inventory/adjustment" },
      { name: "Stok Awal", path: "/inventory/stock-initial" },
      { name: "Stok Keluar", path: "/inventory/stock-out" },
      { name: "Bahan Baku", path: "/inventory/raw-materials" },
      { name: "Bahan Baku Masuk", path: "/inventory/raw-materials-in" },
      { name: "Bahan Baku Keluar", path: "/inventory/raw-materials-out" },
    ],
  },
  {
    icon: <DollarLineIcon />,
    name: "Penjualan",
    subItems: [
      { name: "Penawaran Penjualan", path: "/sales/quotations" },
      { name: "Pesanan Penjualan (SO)", path: "/sales/orders" },
      { name: "Surat Jalan (DO)", path: "/sales/delivery-orders" },
      { name: "Invoice Penjualan", path: "/sales/invoices" },
      { name: "Retur Penjualan", path: "/sales/returns" },
      { name: "Laporan Penjualan", path: "/sales/reports" },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "Produksi",
    subItems: [
      { name: "Bill of Material (BOM)", path: "/production/bom" },
      { name: "Production Order", path: "/production/order" },
      { name: "Produk Eksekusi", path: "/production/execution" },
    ],
  },
  {
    name: "Data Master",
    icon: <TableIcon />,
    subItems: [
      //{ name: "Data Admin", path: "/data/admin" },
      { name: "Data Customer", path: "/data/customer" },
      { name: "Data Supplier", path: "/data/supplier" },
      { name: "Data Produk", path: "/data/produk" },
      { name: "Data Unit", path: "/data/unit" },
      { name: "Data User", path: "/data/user" },
      { name: "Data Warehouse", path: "/data/warehouse" },
      { name: "Chart of Accounts", path: "/data/chart-of-accounts" },
      { name: "Initial Balance", path: "/data/initial-balance" },
    ],
  },
  {
    name: "Keuangan & Akuntansi",
    icon: <PieChartIcon />,
    subItems: [
      { name: "Account Payable", path: "/keuangan/account-payable" },
      { name: "Account Payment", path: "/keuangan/account-payment" },
      { name: "Jurnal & Buku Besar", path: "/akuntansi/jurnal" },
    ],
  },
];


const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prev) => (prev === index ? null : index));
  };

  useEffect(() => {
    let submenuMatched = false;
    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu(index);
            submenuMatched = true;
          }
        });
      }
    });
    if (!submenuMatched) setOpenSubmenu(null);
  }, [pathname, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `main-${openSubmenu}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index)}
              className={`menu-item group ${openSubmenu === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer w-full flex items-center ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
                }`}
            >
              <span className={openSubmenu === index ? "menu-item-icon-active" : "menu-item-icon-inactive"}>
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text ml-3">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu === index ? "rotate-180" : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link href={nav.path} className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"}`}>
                <span className={isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}>
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text ml-3">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => { subMenuRefs.current[`main-${index}`] = el; }}
              className="overflow-hidden transition-all duration-300"
              style={{ height: openSubmenu === index ? `${subMenuHeight[`main-${index}`]}px` : "0px" }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link href={subItem.path} className={`menu-dropdown-item ${isActive(subItem.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"}`}>
                      {subItem.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 ${isExpanded || isMobileOpen || isHovered ? "w-[290px]" : "w-[90px]"} ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`} onMouseEnter={() => !isExpanded && setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className={`py-2 flex justify-center w-full -mx-5 px-5`}>
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <img src="/images/logo/logo_amdk.png" alt="Logo" className="h-28 w-auto object-contain" />
          ) : (
            <img src="/images/logo/logo_amdk.png" alt="Logo" className="h-16 w-16 object-contain" />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className={`mb-4 text-xs uppercase flex text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
                {isExpanded || isHovered || isMobileOpen ? "Menu Utama" : <HorizontaLDots />}
              </h2>
              {renderMenuItems(navItems)}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
