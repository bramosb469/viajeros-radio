"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getResource, getPrismaModel, type ModelKey } from "@/lib/admin-resources";

function parseValue(value: unknown, type: string): unknown {
  switch (type) {
    case "number":
      return value === "" || value === null || value === undefined ? null : Number(value);
    case "boolean":
      return value === true || value === "true" || value === "on";
    case "datetime":
      if (!value) return null;
      return new Date(value as string);
    default:
      if (value === null || value === undefined) return null;
      const s = String(value).trim();
      return s === "" ? null : s;
  }
}

function buildData(key: ModelKey, formData: FormData) {
  const resource = getResource(key);
  if (!resource) throw new Error("Recurso no encontrado");

  const data: Record<string, unknown> = {};
  for (const field of resource.fields) {
    const raw = formData.get(field.name);
    const val = parseValue(raw, field.type);
    if (val !== null || field.type !== "text") {
      data[field.name] = val;
    }
  }

  return data;
}

export async function saveSchedules(programId: number, schedulesJson: string) {
  const schedules = JSON.parse(schedulesJson || "[]");
  await prisma.programSchedule.deleteMany({ where: { programId } });
  for (const s of schedules) {
    if (!s.startTime || !s.endTime) continue;
    await prisma.programSchedule.create({
      data: {
        programId,
        dayOfWeek: Number(s.dayOfWeek),
        startTime: String(s.startTime),
        endTime: String(s.endTime),
      },
    });
  }
  revalidatePath("/");
  revalidatePath("/programacion");
  return { ok: true };
}

// Modelos que tienen createdAt / updatedAt en el schema de Prisma.
// createResource solo debe setear los timestamps que el modelo acepta;
// el resto (Video sin updatedAt, MenuItem/SocialNetwork/ContactInfo/
// AboutSection/TeamMember sin ninguno) tirarían "Unknown argument".
const HAS_TIMESTAMPS: Record<ModelKey, { createdAt: boolean; updatedAt: boolean }> = {
  program: { createdAt: true, updatedAt: true },
  event: { createdAt: true, updatedAt: true },
  video: { createdAt: true, updatedAt: false },
  album: { createdAt: true, updatedAt: true },
  menuItem: { createdAt: false, updatedAt: false },
  socialNetwork: { createdAt: false, updatedAt: false },
  contactInfo: { createdAt: false, updatedAt: false },
  aboutSection: { createdAt: false, updatedAt: false },
  teamMember: { createdAt: false, updatedAt: false },
};

function friendlyError(e: unknown, fallback: string) {
  const code = (e as any)?.code;
  if (code === "P2002") {
    return { ok: false as const, error: "Ya existe un registro con ese valor único" };
  }
  const message = e instanceof Error ? e.message : String(e);
  return { ok: false as const, error: message || fallback };
}

export async function createResource(key: ModelKey, formData: FormData) {
  const resource = getResource(key);
  if (!resource) throw new Error("Recurso no encontrado");

  for (const field of resource.fields) {
    if (field.required) {
      const raw = formData.get(field.name);
      if (!raw || String(raw).trim() === "") {
        return { ok: false, error: `El campo "${field.label}" es obligatorio` };
      }
    }
  }

  const data = buildData(key, formData);
  if (HAS_TIMESTAMPS[key].createdAt) data.createdAt = new Date();
  if (HAS_TIMESTAMPS[key].updatedAt) data.updatedAt = new Date();

  // SocialNetwork.label es obligatorio en la DB pero opcional en el form:
  // si viene vacío, usar la plataforma como etiqueta por defecto.
  if (key === "socialNetwork" && !data.label) {
    data.label = String(formData.get("platform") ?? "");
  }

  try {
    if (key === "program") {
      const schedulesJson = formData.get("_schedules") as string | null;
      const schedules = JSON.parse(schedulesJson || "[]");
      const created = await (getPrismaModel(key) as any).create({
        data: {
          ...data,
          schedules: {
            create: schedules
              .filter((s: any) => s.startTime && s.endTime)
              .map((s: any) => ({
                dayOfWeek: Number(s.dayOfWeek),
                startTime: String(s.startTime),
                endTime: String(s.endTime),
              })),
          },
        },
      });
      const _ = created;
    } else {
      await (getPrismaModel(key) as any).create({ data });
    }
  } catch (e) {
    return friendlyError(e, "Error al guardar");
  }

  revalidatePath("/");
  revalidatePath("/panel/" + resource.slug);
  return { ok: true };
}

export async function updateResource(key: ModelKey, id: number, formData: FormData) {
  const resource = getResource(key);
  if (!resource) throw new Error("Recurso no encontrado");

  for (const field of resource.fields) {
    if (field.required) {
      const raw = formData.get(field.name);
      if (!raw || String(raw).trim() === "") {
        return { ok: false, error: `El campo "${field.label}" es obligatorio` };
      }
    }
  }

  const data = buildData(key, formData);
  const model = getPrismaModel(key) as any;

  try {
    if (key === "program") {
      await model.update({ where: { id }, data });
      const schedulesJson = formData.get("_schedules") as string | null;
      if (schedulesJson) await saveSchedules(id, schedulesJson);
    } else {
      await model.update({ where: { id }, data });
    }
  } catch (e) {
    return friendlyError(e, "Error al guardar");
  }

  revalidatePath("/");
  revalidatePath("/panel/" + resource.slug);
  return { ok: true };
}

export async function deleteResource(key: ModelKey, id: number) {
  const resource = getResource(key);
  if (!resource) throw new Error("Recurso no encontrado");

  const model = getPrismaModel(key) as any;
  await model.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/panel/" + resource.slug);
}

// Mensajes
export async function updateSettings(data: {
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
}) {
  await prisma.siteSettings.upsert({
    where: { id: data.id || 1 },
    update: { ...data },
    create: { ...data, id: data.id || 1 },
  });
  revalidatePath("/");
  return { ok: true };
}

export async function toggleMessageRead(id: number) {
  const msg = await prisma.contactMessage.findUnique({ where: { id } });
  await prisma.contactMessage.update({
    where: { id },
    data: { read: !msg?.read },
  });
  revalidatePath("/panel/mensajes");
}

export async function deleteMessage(id: number) {
  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/panel/mensajes");
}