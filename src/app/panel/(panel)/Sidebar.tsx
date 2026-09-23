"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./admin.module.css";

const NAV_ITEMS = [
  { href: "/panel", label: "Dashboard", icon: "📊" },
  { href: "/panel/mensajes", label: "Mensajes", icon: "✉️" },
  { href: "/panel/programas", label: "Programas", icon: "🎙️" },
  { href: "/panel/eventos", label: "Eventos", icon: "📅" },
  { href: "/panel/videos", label: "Videos", icon: "🎬" },
  { href: "/panel/albumes", label: "Álbumes / Fotos", icon: "📸" },
  { href: "/panel/menu", label: "Menú", icon: "🧭" },
  { href: "/panel/redes", label: "Redes Sociales", icon: "🔗" },
  { href: "/panel/contacto-info", label: "Info de Contacto", icon: "☎️" },
  { href: "/panel/nosotros", label: "Secciones Nosotros", icon: "📖" },
  { href: "/panel/equipo", label: "Equipo", icon: "👥" },
  { href: "/panel/ajustes", label: "Ajustes", icon: "⚙️" },
];

export default function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/panel" ? pathname === href : pathname.startsWith(href);

  return (
    <>
      <button
        className={styles.menuToggle}
        onClick={() => setOpen(!open)}
        aria-label="Abrir menú"
      >
        ☰
      </button>

      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""}`}>
        <div className={styles.brand}>
          <Link href="/panel">
            <img src="/logo.jpg" alt="Viajeros Radio" className={styles.logo} />
            <span className={styles.brandName}>Viajeros Radio</span>
          </Link>
          <p className={styles.brandSub}>Panel Admin</p>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <span className={styles.userEmail}>{userEmail}</span>
          <Link href="/" className={styles.viewSite}>
            Ver sitio →
          </Link>
        </div>
      </aside>

      {open && <div className={styles.overlay} onClick={() => setOpen(false)} />}
    </>
  );
}