"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSettings } from "../actions";
import styles from "./ajustes.module.css";

type Settings = {
  id: number;
  siteName: string;
  slogan: string;
  logoUrl: string;
  faviconUrl: string;
  streamUrl: string;
  metaTitle: string;
  metaDescription: string;
  ogImage: string | null;
  contactName: string | null;
  contactEmail: string | null;
  whatsappNumber: string | null;
  whatsappMessage: string;
  whatsappEnabled: boolean;
  footerText: string;
};

export default function SettingsForm({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const set = (key: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    await updateSettings(form);
    setSaving(false);
    setMsg("Ajustes guardados correctamente.");
    router.refresh();
  };

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    data.append("category", "general");
    const res = await fetch("/api/upload", { method: "POST", body: data });
    const json = await res.json();
    if (res.ok) set(key, json.url);
    e.target.value = "";
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.grid}>
        <Field label="Nombre del sitio">
          <input
            className={styles.input}
            value={form.siteName}
            onChange={(e) => set("siteName", e.target.value)}
          />
        </Field>

        <Field label="Eslogan">
          <input
            className={styles.input}
            value={form.slogan}
            onChange={(e) => set("slogan", e.target.value)}
          />
        </Field>

        <Field label="URL del stream (en vivo)">
          <input
            className={styles.input}
            value={form.streamUrl}
            onChange={(e) => set("streamUrl", e.target.value)}
            placeholder="https://..."
          />
        </Field>

        <Field label="Texto del pie de página">
          <textarea
            className={styles.textarea}
            value={form.footerText}
            onChange={(e) => set("footerText", e.target.value)}
            rows={2}
          />
        </Field>

        <Field label="Meta título (SEO)">
          <input
            className={styles.input}
            value={form.metaTitle}
            onChange={(e) => set("metaTitle", e.target.value)}
          />
        </Field>

        <Field label="Meta descripción (SEO)">
          <textarea
            className={styles.textarea}
            value={form.metaDescription}
            onChange={(e) => set("metaDescription", e.target.value)}
            rows={2}
          />
        </Field>
      </div>

      <div className={styles.imgGrid}>
        <ImageField
          label="Logo"
          value={form.logoUrl}
          onUpload={(e) => uploadImage(e, "logoUrl")}
        />
        <ImageField
          label="Favicon"
          value={form.faviconUrl}
          onUpload={(e) => uploadImage(e, "faviconUrl")}
        />
        <ImageField
          label="Imagen de OpenGraph"
          value={form.ogImage ?? ""}
          onUpload={(e) => uploadImage(e, "ogImage")}
        />
      </div>

      <div className={styles.wa}>
        <h3 className={styles.waTitle}>Información de contacto</h3>
        <div className={styles.grid}>
          <Field label="Nombre de contacto">
            <input
              className={styles.input}
              value={form.contactName ?? ""}
              onChange={(e) => set("contactName", e.target.value)}
            />
          </Field>
          <Field label="Número de WhatsApp">
            <input
              className={styles.input}
              value={form.whatsappNumber ?? ""}
              onChange={(e) => set("whatsappNumber", e.target.value)}
              placeholder="5989..."
            />
          </Field>
          <Field label="Correo electrónico">
            <input
              className={styles.input}
              type="email"
              value={form.contactEmail ?? ""}
              onChange={(e) => set("contactEmail", e.target.value)}
            />
          </Field>
        </div>
      </div>

      <div className={styles.wa}>
        <h3 className={styles.waTitle}>Contáctanos por WhatsApp</h3>
        <div className={styles.grid}>
          <Field label="Mensaje predeterminado">
            <input
              className={styles.input}
              value={form.whatsappMessage}
              onChange={(e) => set("whatsappMessage", e.target.value)}
            />
          </Field>
        </div>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={form.whatsappEnabled}
            onChange={(e) => set("whatsappEnabled", e.target.checked)}
          />
          <span>Mostrar botón de WhatsApp</span>
        </label>
      </div>

      {msg && <div className={styles.success}>{msg}</div>}

      <div className={styles.actions}>
        <button type="submit" className={styles.saveBtn} disabled={saving}>
          {saving ? "Guardando…" : "Guardar ajustes"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      {children}
    </label>
  );
}

function ImageField({
  label,
  value,
  onUpload,
}: {
  label: string;
  value: string;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className={styles.imgField}>
      <span className={styles.fieldLabel}>{label}</span>
      {value ? (
        <div className={styles.imgPreviewWrap}>
          <img src={value} alt={label} className={styles.imgPreview} />
          <div className={styles.imgActions}>
            <label className={styles.imgChangeBtn}>
              <input
                type="file"
                accept="image/*"
                onChange={onUpload}
                className={styles.hiddenInput}
              />
              Cambiar
            </label>
          </div>
        </div>
      ) : (
        <label className={styles.imgUpload}>
          <input
            type="file"
            accept="image/*"
            onChange={onUpload}
            className={styles.hiddenInput}
          />
          📷 Subir imagen
        </label>
      )}
    </div>
  );
}