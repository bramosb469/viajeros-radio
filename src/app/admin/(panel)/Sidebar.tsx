"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./admin.module.css";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/mensajes", label: "Mensajes", icon: "✉️" },
  { href: "/admin/programas", label: "Programas", icon: "🎙️" },
  { href: "/admin/eventos", label: "Eventos", icon: "📅" },
  { href: "/admin/videos", label: "Videos", icon: "🎬" },
  { href: "/admin/albumes", label: "Álbumes / Fotos", icon: "📸" },
  { href: "/admin/menu", label: "Menú", icon: "🧭" },
  { href: "/admin/redes", label: "Redes Sociales", icon: "🔗" },
  { href: "/admin/contacto-info", label: "Info de Contacto", icon: "☎️" },
  { href: "/admin/nosotros", label: "Secciones Nosotros", icon: "📖" },
  { href: "/admin/equipo", label: "Equipo", icon: "👥" },
  { href: "/admin/ajustes", label: "Ajustes", icon: "⚙️" },
];

export default function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === href : pathname.startsWith(href);

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
          <Link href="/admin">
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