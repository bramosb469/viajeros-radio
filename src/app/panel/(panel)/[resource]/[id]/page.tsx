import Link from "next/link";
import { notFound } from "next/navigation";
import { RESOURCES, getPrismaModel } from "@/lib/admin-resources";
import ResourceForm from "./ResourceForm";
import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

export default async function ResourceFormPage({
  params,
}: {
  params: Promise<{ resource: string; id?: string }>;
}) {
  const { resource, id } = await params;
  const def = RESOURCES.find((r) => r.key === resource || r.slug === resource);
  if (!def) notFound();

  let initial: Record<string, unknown> | null = null;
  let schedules: any[] = [];

  if (id && id !== "nuevo") {
    const model = getPrismaModel(def.key) as any;
    if (def.key === "program") {
      initial = await model.findUnique({
        where: { id: Number(id) },
        include: { schedules: true },
      });
      if (initial) {
        schedules = (initial as any).schedules || [];
        delete (initial as any).schedules;
      }
    } else {
      initial = await model.findUnique({ where: { id: Number(id) } });
    }
    if (!initial) notFound();
  }

  return (
    <div>
      <div className={styles.listHeader}>
        <div>
          <h2 className={styles.sectionTitle}>
            {initial ? `Editar ${def.label}` : `Nuevo ${def.label}`}
          </h2>
          <p className={styles.sectionDesc}>{def.description}</p>
        </div>
        <Link href={`/panel/${def.slug}`} className={styles.backBtn}>
          ← Volver
        </Link>
      </div>

      <ResourceForm
        resourceKey={def.key}
        resourceSlug={def.slug}
        fields={def.fields}
        initial={initial}
        schedules={schedules}
      />
    </div>
  );
}