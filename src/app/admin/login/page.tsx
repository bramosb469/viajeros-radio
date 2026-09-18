import LoginForm from "./LoginForm";
import styles from "./login.module.css";

export default async function AdminLoginPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <img src="/logo.jpg" alt="Viajeros Radio" className={styles.logo} />
          <h1 className={styles.title}>Viajeros Radio</h1>
          <p className={styles.subtitle}>Panel de administración</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}