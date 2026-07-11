"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faXmark,
  faGaugeHigh,
  faMapLocationDot,
  faDatabase,
  faRobot,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";

const navItems = [
  { href: "/#dashboard", label: "Dashboard", icon: faGaugeHigh },
  { href: "/map", label: "Map", icon: faMapLocationDot },
  { href: "/hazards", label: "Data", icon: faDatabase },
  { href: "/#product", label: "Product", icon: faRobot },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => {
    setOpen(false);
  };

  return (
    <nav className="fixed left-1/2 top-4 z-50 w-[95vw] max-w-[1440px] -translate-x-1/2 rounded-full border border-white/25 bg-[#0b1623]/70 px-5 shadow-[0_12px_30px_-12px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-300 sm:px-6">
      <div className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3" onClick={closeMenu}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/15 ring-1 ring-white/30">
            <Image
              src="/images/logo(2).png"
              alt="Avengineers team logo"
              width={64}
              height={64}
              className="object-contain"
              priority
            />
          </div>

          <div className="flex min-w-0 flex-col">
            <span className="hidden text-lg font-bold tracking-wide text-orange-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)] md:block">
              Avengineers
            </span>
            <p className="max-w-[150px] truncate text-xs text-white sm:max-w-none">
              Engineering a Safer Tomorrow
            </p>
          </div>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-2 text-sm font-semibold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)] transition hover:text-orange-200"
              >
                <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/contact"
          className="hidden items-center gap-2 rounded-full bg-white/20 px-5 py-2 text-sm font-bold text-white ring-1 ring-white/30 drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)] transition hover:bg-white/30 md:flex"
        >
          <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4" />
          Connect
        </Link>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 transition hover:bg-white/25 md:hidden"
        >
          <FontAwesomeIcon icon={open ? faXmark : faBars} className="h-5 w-5" />
        </button>
      </div>

      <div
        className={`absolute left-0 top-20 w-full transition-all duration-300 md:hidden ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-3 opacity-0"
        }`}
      >
        <ul className="flex flex-col gap-3 rounded-[2rem] border border-white/20 bg-[#0b1623]/85 p-5 shadow-[0_16px_35px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15 hover:text-orange-200"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
                  <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
                </span>
                {item.label}
              </Link>
            </li>
          ))}

          <li>
            <Link
              href="/contact"
              onClick={closeMenu}
              className="flex items-center justify-center gap-3 rounded-full bg-white/15 px-4 py-3 text-center text-sm font-bold text-white ring-1 ring-white/20 transition hover:bg-white/25"
            >
              <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4" />
              Connect
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
