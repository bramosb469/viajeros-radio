import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth-helpers";
import Sidebar from "./Sidebar";
import LogoutButton from "./LogoutButton";
import styles from "./admin.module.css";

export const metadata: Metadata = {
  title: "Admin - Viajeros Radio",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className={styles.layout}>
      <Sidebar userEmail={session.user.email ?? ""} />
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