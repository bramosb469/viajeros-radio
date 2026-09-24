"use client";

import { useState } from "react";
import styles from "./ajustes.module.css";

export default function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Completá los tres campos.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("La contraseña nueva y su confirmación no coinciden.");
      return;
    }
    if (newPassword.length < 8) {
      setError("La contraseña nueva debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword,
          newPassword,
          revokeOtherSessions: true,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(
          (data as any)?.message ||
            "No se pudo cambiar la contraseña. Verificá la actual."
        );
        return;
      }
      setSuccess("Contraseña actualizada correctamente.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("Error de conexión. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "2.5rem" }}>
      <div className={styles.header}>
        <h2 className={styles.title}>Cambiar contraseña</h2>
        <p className={styles.subtitle}>
          Actualizá la contraseña de tu cuenta de administrador.
        </p>
      </div>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.grid}>
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="currentPassword">
              Contraseña actual
            </label>
            <input
              id="currentPassword"
              type="password"
              className={styles.input}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="newPassword">
              Contraseña nueva (mínimo 8 caracteres)
            </label>
            <input
              id="newPassword"
              type="password"
              className={styles.input}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="confirmPassword">
              Confirmar contraseña nueva
            </label>
            <input
              id="confirmPassword"
              type="password"
              className={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
        </div>

        {error && (
          <p style={{ color: "#c0392b", marginTop: "1rem" }}>{error}</p>
        )}
        {success && (
          <p style={{ color: "#1e8449", marginTop: "1rem" }}>{success}</p>
        )}

        <div className={styles.actions}>
          <button type="submit" className={styles.saveBtn} disabled={loading}>
            {loading ? "Guardando..." : "Cambiar contraseña"}
          </button>
        </div>
      </form>
    </div>
  );
}
