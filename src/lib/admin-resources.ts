import { prisma } from "@/lib/db";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "datetime"
  | "time"
  | "select"
  | "image"
  | "url";

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  options?: { value: string; label: string }[];
  defaultValue?: string | number | boolean;
};

export type ModelKey =
  | "program"
  | "event"
  | "video"
  | "album"
  | "menuItem"
  | "socialNetwork"
  | "contactInfo"
  | "aboutSection"
  | "teamMember";

export type ResourceDef = {
  key: ModelKey;
  slug: string;
  label: string;
  labelPlural: string;
  description: string;
  searchable?: boolean;
  fields: FieldDef[];
};

export const RESOURCES: ResourceDef[] = [
  {
    key: "program",
    slug: "programas",
    label: "Programa",
    labelPlural: "Programas",
    description: "Programas de la radio y su horario semana",
    fields: [
      { name: "name", label: "Nombre", type: "text", required: true },
      { name: "description", label: "Descripción", type: "textarea" },
      { name: "imageUrl", label: "Imagen", type: "image", help: "JPG o PNG, se recorta a cuadrado" },
      { name: "conductor", label: "Conductor/a", type: "text" },
      { name: "socialLinks", label: "Links sociales (JSON)", type: "textarea", help: 'Formato JSON: {"facebook":"...","instagram":"..."}' },
      { name: "active", label: "Programa activo", type: "boolean", defaultValue: true },
      { name: "lunAViernes", label: "Lunes a viernes (tarjeta única)", type: "boolean", defaultValue: false, help: "Marcar si se transmite de lunes a viernes en el mismo horario" },
    ],
  },
  {
    key: "event",
    slug: "eventos",
    label: "Evento",
    labelPlural: "Eventos",
    description: "Eventos y festivales",
    fields: [
      { name: "title", label: "Título", type: "text", required: true },
      { name: "description", label: "Descripción", type: "textarea" },
      { name: "eventDate", label: "Fecha del evento", type: "datetime", required: true },
      { name: "eventTime", label: "Hora (opcional)", type: "time" },
      { name: "location", label: "Lugar", type: "text" },
      { name: "imageUrl", label: "Imagen", type: "image" },
      { name: "videoUrl", label: "Video (YouTube)", type: "url" },
      { name: "externalLink", label: "Link externo", type: "url" },
      { name: "additionalInfo", label: "Información adicional", type: "textarea" },
      {
        name: "status",
        label: "Estado",
        type: "select",
        options: [
          { value: "borrador", label: "Borrador" },
          { value: "publicado", label: "Publicado" },
        ],
        defaultValue: "borrador",
      },
      { name: "featured", label: "Destacado en inicio", type: "boolean", defaultValue: false },
    ],
  },
  {
    key: "video",
    slug: "videos",
    label: "Video",
    labelPlural: "Videos",
    description: "Videos de YouTube",
    fields: [
      { name: "youtubeUrl", label: "URL de YouTube", type: "url", required: true },
      { name: "title", label: "Título", type: "text" },
      { name: "description", label: "Descripción", type: "textarea" },
      { name: "thumbnailUrl", label: "Miniatura (opcional)", type: "image" },
      {
        name: "videoType",
        label: "Tipo",
        type: "select",
        options: [
          { value: "video", label: "Video" },
          { value: "en-vivo", label: "En vivo" },
        ],
        defaultValue: "video",
      },
      { name: "displayOrder", label: "Orden", type: "number", defaultValue: 0 },
      { name: "visible", label: "Visible", type: "boolean", defaultValue: true },
    ],
  },
  {
    key: "album",
    slug: "albumes",
    label: "Álbum",
    labelPlural: "Álbumes",
    description: "Álbumes de fotos de la galería",
    fields: [
      { name: "name", label: "Nombre", type: "text", required: true },
      { name: "description", label: "Descripción", type: "textarea" },
      { name: "coverImageUrl", label: "Imagen de portada", type: "image" },
      { name: "displayOrder", label: "Orden", type: "number", defaultValue: 0 },
      { name: "published", label: "Publicado", type: "boolean", defaultValue: false },
    ],
  },
  {
    key: "menuItem",
    slug: "menu",
    label: "Ítem de menú",
    labelPlural: "Ítems de menú",
    description: "Elementos de navegación del sitio",
    fields: [
      { name: "label", label: "Etiqueta", type: "text", required: true },
      { name: "slug", label: "Ruta (ej. /programacion)", type: "text", required: true },
      { name: "icon", label: "Icono", type: "text", help: "Nombre opcional de ícono" },
      { name: "displayOrder", label: "Orden", type: "number", defaultValue: 0 },
      { name: "visible", label: "Visible", type: "boolean", defaultValue: true },
    ],
  },
  {
    key: "socialNetwork",
    slug: "redes",
    label: "Red social",
    labelPlural: "Redes sociales",
    description: "Redes sociales mostradas en el pie",
    fields: [
      {
        name: "platform",
        label: "Plataforma",
        type: "select",
        required: true,
        options: [
          { value: "youtube", label: "YouTube" },
          { value: "facebook", label: "Facebook" },
          { value: "instagram", label: "Instagram" },
          { value: "x", label: "X / Twitter" },
          { value: "tiktok", label: "TikTok" },
          { value: "whatsapp", label: "WhatsApp" },
        ],
      },
      { name: "url", label: "URL", type: "url", required: true },
      { name: "label", label: "Etiqueta", type: "text" },
      { name: "displayOrder", label: "Orden", type: "number", defaultValue: 0 },
      { name: "visible", label: "Visible", type: "boolean", defaultValue: true },
    ],
  },
  {
    key: "contactInfo",
    slug: "contacto-info",
    label: "Información de contacto",
    labelPlural: "Información de contacto",
    description: "Datos de contacto mostrados en /contacto",
    fields: [
      { name: "name", label: "Nombre", type: "text", required: true, help: "Nombre del contacto" },
      { name: "whatsapp", label: "Número de WhatsApp", type: "text", help: "Con código de país, sin espacios" },
      { name: "email", label: "Correo electrónico", type: "text" },
      { name: "displayOrder", label: "Orden", type: "number", defaultValue: 0 },
      { name: "visible", label: "Visible", type: "boolean", defaultValue: true },
    ],
  },
  {
    key: "aboutSection",
    slug: "nosotros",
    label: "Sección",
    labelPlural: "Secciones Nosotros",
    description: "Secciones de contenido de la página /nosotros",
    fields: [
      { name: "sectionKey", label: "Clave (única)", type: "text", required: true, help: "Identificador interno (historia, mision...)" },
      { name: "title", label: "Título", type: "text", required: true },
      { name: "content", label: "Contenido", type: "textarea" },
      { name: "displayOrder", label: "Orden", type: "number", defaultValue: 0 },
      { name: "visible", label: "Visible", type: "boolean", defaultValue: true },
    ],
  },
  {
    key: "teamMember",
    slug: "equipo",
    label: "Miembro del equipo",
    labelPlural: "Equipo",
    description: "Miembros del equipo en /nosotros",
    fields: [
      { name: "name", label: "Nombre", type: "text", required: true },
      { name: "role", label: "Rol", type: "text" },
      { name: "description", label: "Descripción", type: "textarea" },
      { name: "photoUrl", label: "Foto", type: "image" },
      { name: "socialLinks", label: "Links sociales (JSON)", type: "textarea", help: 'Formato JSON: {"facebook":"...","instagram":"..."}' },
      { name: "displayOrder", label: "Orden", type: "number", defaultValue: 0 },
      { name: "visible", label: "Visible", type: "boolean", defaultValue: true },
    ],
  },
];

export function getResource(key: string): ResourceDef | undefined {
  return RESOURCES.find((r) => r.key === key || r.slug === key);
}

// Mapa modelo prisma -> delegado
export const prismaModel = {
  program: prisma.program,
  event: prisma.event,
  video: prisma.video,
  album: prisma.album,
  menuItem: prisma.menuItem,
  socialNetwork: prisma.socialNetwork,
  contactInfo: prisma.contactInfo,
  aboutSection: prisma.aboutSection,
  teamMember: prisma.teamMember,
} as const;

export function getPrismaModel(key: ModelKey) {
  return prismaModel[key];
}