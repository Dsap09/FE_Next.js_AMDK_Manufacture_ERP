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
    subItems: [{ name: "Overview", path: "/", pro: false }],
  },
  {
    icon: <BoxIcon />,
    name: "Pembelian",
    subItems: [
        { name: "Purchase Request", path: "/purchasing/purchase-request" },
        { name: "Purchase Request Item", path: "/purchasing/Purchase-Request-Item" },
        { name: "Purchase Order", path: "/purchasing/purchase-order"},
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "Persediaan",
    subItems: [
      { name: "Dashboard Stok", path: "/inventory/dashboard" },
      { name: "Permintaan Stok", path: "/inventory/request" },
      { name: "Penyesuaian Stok", path: "/inventory/adjustment" },
      { name: "Stok Awal", path: "/inventory/stock-initial" },
      { name: "Stok Keluar", path: "/inventory/stock-out" },
      { name: "Bahan Baku", path: "/inventory/raw-materials" },
      { name: "Bahan Baku Masuk", path: "/inventory/raw-materials-in"},
      { name: "Bahan Baku Keluar", path: "/inventory/raw-materials-out"},
    ],
  },
  {
    icon: <DollarLineIcon />,
    name: "Penjualan",
    subItems: [
      { name: "Pesanan Penjualan (SO)", path: "/penjualan/so" },
      { name: "Pengiriman Barang", path: "/penjualan/pengiriman" },
    ],
  },
  {
    name: "Data Master",
    icon: <TableIcon />,
    subItems: [
      //{ name: "Data Admin", path: "/data/admin" },
      { name: "Data Supplier", path: "/data/supplier" },
      { name: "Data Produk", path: "/data/produk" },
      { name: "Data Unit", path: "/data/unit" },
      { name: "Data Warehouse", path: "/data/warehouse" },
     // { name: "Data User", path: "/data/user" },
    ],
  },
  {
    name: "Keuangan & Akuntansi",
    icon: <PieChartIcon />,
    subItems: [
      { name: "Kas Masuk", path: "/keuangan/kas-masuk" },
      { name: "Kas Keluar", path: "/keuangan/kas-keluar" },
      { name: "Jurnal Memorial", path: "/akuntansi/jurnal" },
      { name: "Laporan Keuangan", path: "/akuntansi/laporan" },
    ],
  },
];

const othersItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Laporan Keuangan",
    subItems: [
      { name: "Laporan Laba Rugi", path: "/laporan/laba-rugi" },
      { name: "Jurnal Memorial", path: "/laporan/jurnal" },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Authentication",
    subItems: [
      { name: "Sign In", path: "/signin" },
      { name: "Sign Up", path: "/signup" },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({ type: menuType as "main" | "others", index });
              submenuMatched = true;
            }
          });
        }
      });
    });
    if (!submenuMatched) setOpenSubmenu(null);
  }, [pathname, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const renderMenuItems = (navItems: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer w-full flex items-center ${
                !isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
              }`}
            >
              <span className={openSubmenu?.type === menuType && openSubmenu?.index === index ? "menu-item-icon-active" : "menu-item-icon-inactive"}>
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text ml-3">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index ? "rotate-180" : ""
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
              ref={(el) => { subMenuRefs.current[`${menuType}-${index}`] = el; }}
              className="overflow-hidden transition-all duration-300"
              style={{ height: openSubmenu?.type === menuType && openSubmenu?.index === index ? `${subMenuHeight[`${menuType}-${index}`]}px` : "0px" }}
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
      <div className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <Image src="/images/logo/logo.svg" alt="Logo" width={150} height={40} className="dark:hidden" />
          ) : (
            <Image src="/images/logo/logo-icon.svg" alt="Logo" width={32} height={32} />
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
              {renderMenuItems(navItems, "main")}
            </div>
            <div>
              <h2 className={`mb-4 text-xs uppercase flex text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
                {isExpanded || isHovered || isMobileOpen ? "Lainnya" : <HorizontaLDots />}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;