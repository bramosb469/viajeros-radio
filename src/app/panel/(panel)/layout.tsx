import type { Metadata } from "next";
import Sidebar from "./Sidebar";
import LogoutButton from "./LogoutButton";
import styles from "./admin.module.css";

export const metadata: Metadata = {
  title: "Admin - Viajeros Radio",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <Sidebar userEmail="" />
      <div className={styles.main}>
        <header className={styles.topbar}>
          <h1 className={styles.pageTitle}>Panel de Administración</h1>
          <LogoutButton />
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
