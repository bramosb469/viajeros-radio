import Link from "next/link";
import { notFound } from "next/navigation";
import { RESOURCES, getPrismaModel } from "@/lib/admin-resources";
import { deleteResource } from "../actions";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export default async function ResourceListPage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  const def = RESOURCES.find((r) => r.key === resource || r.slug === resource);
  if (!def) notFound();

  const model = getPrismaModel(def.key) as any;
  const items = await model.findMany({ orderBy: { id: "desc" } });

  const previewFields = def.fields.filter((f) =>
    ["text", "textarea", "url"].includes(f.type)
  );

  return (
    <div>
      <div className={styles.listHeader}>
        <div>
          <h2 className={styles.sectionTitle}>{def.labelPlural}</h2>
          <p className={styles.sectionDesc}>{def.description}</p>
        </div>
        <Link href={`/panel/${def.slug}/nuevo`} className={styles.addBtn}>
          + Nuevo {def.label}
        </Link>
      </div>

      {items.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Aún no hay {def.labelPlural.toLowerCase()}. Creá el primero.</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                {previewFields.slice(0, 2).map((f) => (
                  <th key={f.name}>{f.label}</th>
                ))}
                <th>Visible</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any) => {
                const hasVisible = "visible" in item || "published" in item || "active" in item;
                const visibleFlag =
                  item.visible ?? item.published ?? item.active ?? null;
                return (
                  <tr key={item.id}>
                    <td className={styles.tableId}>{item.id}</td>
                    {previewFields.slice(0, 2).map((f) => {
                      const value = item[f.name];
                      return (
                        <td key={f.name} className={styles.tableText}>
                          {typeof value === "string" && value.length > 60
                            ? value.slice(0, 60) + "…"
                            : String(value ?? "—")}
                        </td>
                      );
                    })}
                    <td>
                      {hasVisible ? (
                        <span className={visibleFlag ? styles.badgeOn : styles.badgeOff}>
                          {visibleFlag ? "Sí" : "No"}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className={styles.tableActions}>
                      <Link href={`/panel/${def.slug}/${item.id}`} className={styles.editBtn}>
                        Editar
                      </Link>
                      <form action={deleteResource.bind(null, def.key, item.id)}>
                        <button type="submit" className={styles.deleteBtn}>
                          Eliminar
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}