"use client";

import { useEffect, useState } from "react";
import styles from "./ajustes.module.css";

type Backup = {
  name: string;
  size: number;
  mtime: string;
};

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  return (bytes / 1024).toFixed(1) + " KB";
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-UY");
  } catch {
    return iso;
  }
}

export default function BackupSection() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/backup/list", { credentials: "include" });
      const data = await res.json();
      setBackups(data.backups || []);
    } catch {
      setError("No se pudo cargar la lista de respaldos.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/backup/create", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data?.error || "No se pudo crear el respaldo.");
        return;
      }
      setSuccess("Respaldo creado: " + data.name);
      await load();
    } catch {
      setError("Error de conexión. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (!window.confirm("¿Eliminar el respaldo " + name + "?")) return;
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/backup/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setError(data?.error || "No se pudo eliminar.");
        return;
      }
      await load();
    } catch {
      setError("Error de conexión. Probá de nuevo.");
    }
  };

  const handleRestore = async (name: string) => {
    if (
      !window.confirm(
        "¿Restaurar la base de datos desde " +
          name +
          "? Se guardará una copia de seguridad del estado actual primero. Vas a tener que volver a entrar y esperar unos 20 segundos."
      )
    )
      return;
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/backup/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setError(data?.error || "No se pudo restaurar.");
        return;
      }
      setSuccess(
        "Restauración iniciada. Esperá unos 20 segundos, recargá la página y volvé a entrar."
      );
    } catch {
      setError("Error de conexión. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "2.5rem" }}>
      <div className={styles.header}>
        <h2 className={styles.title}>Respaldos de datos</h2>
        <p className={styles.subtitle}>
          Copias de seguridad de la base de datos. Se guardan los últimos 10.
        </p>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.saveBtn}
          disabled={loading}
          onClick={handleCreate}
        >
          {loading ? "Trabajando..." : "Crear respaldo ahora"}
        </button>
      </div>

      {error && <p style={{ color: "#c0392b", marginTop: "1rem" }}>{error}</p>}
      {success && (
        <p style={{ color: "#1e8449", marginTop: "1rem" }}>{success}</p>
      )}

      {backups.length === 0 ? (
        <p className={styles.subtitle} style={{ marginTop: "1rem" }}>
          Todavía no hay respaldos. Creá el primero con el botón de arriba.
        </p>
      ) : (
        <div style={{ marginTop: "1rem", display: "grid", gap: "0.75rem" }}>
          {backups.map((b) => (
            <div
              key={b.name}
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.75rem",
                alignItems: "center",
                justifyContent: "space-between",
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "0.75rem 1rem",
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{b.name}</div>
                <div className={styles.subtitle}>
                  {formatSize(b.size)} · {formatDate(b.mtime)}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <a
                  href={"/api/backup/download?name=" + encodeURIComponent(b.name)}
                  className={styles.saveBtn}
                  style={{ textDecoration: "none" }}
                >
                  Descargar
                </a>
                <button
                  type="button"
                  className={styles.saveBtn}
                  onClick={() => handleRestore(b.name)}
                >
                  Restaurar
                </button>
                <button type="button" onClick={() => handleDelete(b.name)}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
