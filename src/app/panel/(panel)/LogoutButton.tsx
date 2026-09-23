"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import styles from "./admin.module.css";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/panel/login");
    router.refresh();
  };

  return (
    <button className={styles.logoutBtn} onClick={handleLogout}>
      Cerrar sesión
    </button>
  );
}