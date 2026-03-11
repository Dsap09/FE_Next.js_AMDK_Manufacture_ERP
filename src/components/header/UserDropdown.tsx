"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  // --- FUNGSI LOGOUT ---
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // 1. Hapus token & user dari localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // 2. Hapus Cookie jika ada
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // 3. Arahkan ke halaman login
    router.push("/signin");
  };

  return (
    <div className="relative">
      {/* Tombol Trigger (Identitas Pengguna di Header) */}
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 pr-2 text-left sm:gap-4 group"
      >
        <div className="flex flex-col text-right">
          <span className="block text-sm font-black text-gray-800 dark:text-white uppercase tracking-tighter group-hover:text-blue-600 transition-colors">
            {user?.name || "Admin"}
          </span>
          <span className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 lowercase tracking-tight">
            {user?.email || "loading..."}
          </span>
        </div>

        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl group-hover:bg-blue-50 transition-all">
            <svg
            className={`fill-gray-400 transition-transform duration-300 group-hover:fill-blue-600 ${
                isOpen ? "rotate-180 text-blue-600" : ""
            }`}
            width="14"
            height="14"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.32293 6.38394C3.52516 6.13314 3.89409 6.08767 4.14488 6.28991L9.00013 10.2114L13.8554 6.28991C14.1062 6.08767 14.4751 6.13314 14.6773 6.38394C14.8796 6.63473 14.8341 7.00366 14.5833 7.2059L9.36409 11.4214C9.15317 11.5917 8.84709 11.5917 8.63617 11.4214L3.41693 7.2059C3.16614 7.00366 3.12067 6.63473 3.32293 6.38394Z"
            />
            </svg>
        </div>
      </button>

      {/* Konten Dropdown */}
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[220px] flex-col rounded-3xl border border-gray-100 bg-white p-2 shadow-2xl dark:border-gray-800 dark:bg-gray-900 overflow-hidden"
      >
        <div className="px-4 py-4 mb-1 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
          <p className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-tight">
            {user?.name || "Admin"}
          </p>
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500">
            {user?.email || ""}
          </p>
        </div>

        {/* Tombol Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-red-500 transition-all rounded-2xl hover:bg-red-50 dark:hover:bg-red-500/10 w-full text-left"
        >
          <svg
            className="fill-red-500"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.1007 19.247C14.6865 19.247 14.3507 18.9112 14.3507 18.497L14.3507 14.245H12.8507V18.497C12.8507 19.7396 13.8581 20.747 15.1007 20.747H18.5007C19.7434 20.747 20.7507 19.7396 20.7507 18.497L20.7507 5.49609C20.7507 4.25345 19.7433 3.24609 18.5007 3.24609H15.1007C13.8581 3.24609 12.8507 4.25345 12.8507 5.49609V9.74501L14.3507 9.74501V5.49609C14.3507 5.08188 14.6865 4.74609 15.1007 4.74609L18.5007 4.74609C18.9149 4.74609 19.2507 5.08188 19.2507 5.49609L19.2507 18.497C19.2507 18.9112 18.9149 19.247 18.5007 19.247H15.1007ZM3.25073 11.9984C3.25073 12.2144 3.34204 12.4091 3.48817 12.546L8.09483 17.1556C8.38763 17.4485 8.86251 17.4487 9.15549 17.1559C9.44848 16.8631 9.44863 16.3882 9.15583 16.0952L5.81116 12.7484L16.0007 12.7484C16.4149 12.7484 16.7507 12.4127 16.7507 11.9984C16.7507 11.5842 16.4149 11.2484 16.0007 11.2484L5.81528 11.2484L9.15585 7.90554C9.44864 7.61255 9.44847 7.13767 9.15547 6.84488C8.86248 6.55209 8.3876 6.55226 8.09481 6.84525L3.52309 11.4202C3.35673 11.5577 3.25073 11.7657 3.25073 11.9984Z"
              fill="currentColor"
            />
          </svg>
          Sign out
        </button>
      </Dropdown>
    </div>
  );
}
