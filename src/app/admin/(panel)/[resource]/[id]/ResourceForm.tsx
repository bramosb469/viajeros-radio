"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createResource, updateResource } from "../../actions";
import type { FieldDef } from "@/lib/admin-resources";
import styles from "../../admin.module.css";

export default function ResourceForm({
  resourceKey,
  resourceSlug,
  fields,
  initial,
  schedules,
}: {
  resourceKey: string;
  resourceSlug: string;
  fields: FieldDef[];
  initial: Record<string, unknown> | null;
  schedules?: any[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [formState, setFormState] = useState<Record<string, unknown>>(
    initial ?? {}
  );
  const [uploading, setUploading] = useState<string | null>(null);

  const DAYS = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  const [schedRows, setSchedRows] = useState<any[]>(
    schedules ?? [
      { dayOfWeek: 1, startTime: "09:00", endTime: "12:00" },
    ]
  );

  const setField = (name: string, value: unknown) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);

    if (resourceKey === "program") {
      const validSchedules = schedRows.filter(
        (s) => s.startTime && s.endTime && s.dayOfWeek !== ""
      );
      formData.append("_schedules", JSON.stringify(validSchedules));
    }

    const result = initial
      ? await updateResource(resourceKey as any, (initial as any).id, formData)
      : await createResource(resourceKey as any, formData);

    if (result.ok) {
      router.push(`/admin/${resourceSlug}`);
      router.refresh();
    } else {
      setError(result.error || "Error al guardar");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    if (!input.files?.[0]) return;
    const file = input.files[0];

    const uploadField = input.dataset.field || "";
    setUploading(uploadField);

    const data = new FormData();
    data.append("file", file);
    data.append("category", resourceSlug);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error de subida");
      setField(uploadField, json.url);
    } catch {
      setError("No se pudo subir la imagen. Probá de nuevo.");
    } finally {
      setUploading(null);
      input.value = "";
    }
  };

  const toInputValue = (field: FieldDef): string => {
    const value = formState[field.name];
    if (value === null || value === undefined) return "";
    if (field.type === "datetime" && value instanceof Date) {
      const local = new Date(value);
      const offset = local.getTimezoneOffset();
      return new Date(local.getTime() - offset * 60000)
        .toISOString()
        .slice(0, 16);
    }
    return String(value);
  };

  const toCheckbox = (field: FieldDef): boolean => {
    const value = formState[field.name];
    if (value === undefined) {
      return Boolean(field.defaultValue);
    }
    return Boolean(value);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form} encType="multipart/form-data">
      {fields.map((field) => (
        <div key={field.name} className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor={field.name}>
            {field.label}
            {field.required && <span className={styles.required}>*</span>}
          </label>

          {field.type === "textarea" && (
            <textarea
              id={field.name}
              name={field.name}
              className={styles.fieldInput}
              rows={4}
              value={toInputValue(field)}
              onChange={(e) => setField(field.name, e.target.value)}
            />
          )}

          {field.type === "select" && (
            <select
              id={field.name}
              name={field.name}
              className={styles.fieldInput}
              value={toInputValue(field)}
              onChange={(e) => setField(field.name, e.target.value)}
            >
              <option value="">Seleccionar…</option>
              {(field.options || []).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {field.type === "boolean" && (
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name={field.name}
                checked={toCheckbox(field)}
                onChange={(e) => setField(field.name, e.target.checked)}
              />
              <span>Activado</span>
            </label>
          )}

          {field.type === "datetime" && (
            <input
              id={field.name}
              name={field.name}
              type="datetime-local"
              className={styles.fieldInput}
              value={toInputValue(field)}
              onChange={(e) => setField(field.name, e.target.value)}
            />
          )}

          {field.type === "time" && (
            <input
              id={field.name}
              name={field.name}
              type="time"
              className={styles.fieldInput}
              value={toInputValue(field)}
              onChange={(e) => setField(field.name, e.target.value)}
            />
          )}

          {field.type === "number" && (
            <input
              id={field.name}
              name={field.name}
              type="number"
              className={styles.fieldInput}
              value={toInputValue(field)}
              onChange={(e) => setField(field.name, e.target.value)}
            />
          )}

          {field.type === "image" && (
            <div className={styles.imageField}>
              <input
                type="hidden"
                name={field.name}
                value={toInputValue(field)}
              />
              {formState[field.name] ? (
                <div className={styles.imagePreviewWrap}>
                  <img
                    src={String(formState[field.name])}
                    alt="Vista previa"
                    className={styles.imagePreview}
                  />
                  <button
                    type="button"
                    className={styles.imageRemove}
                    onClick={() => setField(field.name, "")}
                  >
                    Quitar
                  </button>
                </div>
              ) : (
                <label className={styles.imageUpload}>
                  <input
                    type="file"
                    accept="image/*"
                    data-field={field.name}
                    onChange={handleImageUpload}
                    className={styles.fileInput}
                  />
                  {uploading === field.name
                    ? "Subiendo…"
                    : "📷 Elegir imagen"}
                </label>
              )}
            </div>
          )}

          {field.type === "url" && (
            <input
              id={field.name}
              name={field.name}
              type="url"
              className={styles.fieldInput}
              value={toInputValue(field)}
              onChange={(e) => setField(field.name, e.target.value)}
            />
          )}

          {field.type === "text" && (
            <input
              id={field.name}
              name={field.name}
              type="text"
              className={styles.fieldInput}
              value={toInputValue(field)}
              onChange={(e) => setField(field.name, e.target.value)}
            />
          )}

          {field.help && <p className={styles.fieldHelp}>{field.help}</p>}
        </div>
      ))}

      {resourceKey === "program" && (
        <div className={styles.schedSection}>
          <h3 className={styles.schedTitle}>Horarios semanales</h3>
          <div className={styles.schedHeader}>
            <span>Día</span>
            <span>Inicio</span>
            <span>Fin</span>
            <span></span>
          </div>
          {schedRows.map((row, idx) => (
            <div key={idx} className={styles.schedRow}>
              <select
                className={styles.fieldInput}
                value={row.dayOfWeek}
                onChange={(e) =>
                  setSchedRows((prev) =>
                    prev.map((r, i) =>
                      i === idx ? { ...r, dayOfWeek: Number(e.target.value) } : r
                    )
                  )
                }
              >
                {DAYS.map((d, i) => (
                  <option key={i} value={i}>
                    {d}
                  </option>
                ))}
              </select>
              <input
                type="time"
                className={styles.fieldInput}
                value={row.startTime}
                onChange={(e) =>
                  setSchedRows((prev) =>
                    prev.map((r, i) =>
                      i === idx ? { ...r, startTime: e.target.value } : r
                    )
                  )
                }
              />
              <input
                type="time"
                className={styles.fieldInput}
                value={row.endTime}
                onChange={(e) =>
                  setSchedRows((prev) =>
                    prev.map((r, i) =>
                      i === idx ? { ...r, endTime: e.target.value } : r
                    )
                  )
                }
              />
              <button
                type="button"
                className={styles.schedRemove}
                onClick={() =>
                  setSchedRows((prev) => prev.filter((_, i) => i !== idx))
                }
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            className={styles.schedAdd}
            onClick={() =>
              setSchedRows((prev) => [
                ...prev,
                { dayOfWeek: 1, startTime: "09:00", endTime: "12:00" },
              ])
            }
          >
            + Agregar horario
          </button>
        </div>
      )}

      {error && <div className={styles.formError}>{error}</div>}

      <div className={styles.formActions}>
        <button type="submit" className={styles.saveBtn}>
          Guardar
        </button>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={() => router.push(`/admin/${resourceSlug}`)}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}