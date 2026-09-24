import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
import styles from '../page.module.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const evento = await prisma.event.findUnique({
    where: { id: Number(id) },
  });
  if (!evento) return { title: 'Evento no encontrado - Viajeros Radio' };
  return {
    title: `${evento.title} - Viajeros Radio`,
    description: evento.description ?? undefined,
  };
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('es-UY', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export default async function EventoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const evento = await prisma.event.findUnique({
    where: { id: Number(id) },
    include: { images: { orderBy: { displayOrder: 'asc' } } },
  });

  if (!evento || evento.status !== 'publicado') notFound();

  return (
    <div className={`container section-padding ${styles.container}`}>
      <Link href="/eventos" style={{ display: "inline-block", marginBottom: "1rem" }}>
        ← Volver a eventos
      </Link>

      <h1 className="fade-in">{evento.title}</h1>

      <div className={styles.meta}>
        <span className={styles.date}>📅 {formatDate(new Date(evento.eventDate))}</span>
        {evento.eventTime && <span className={styles.time}>⏰ {evento.eventTime}</span>}
        {evento.location && <span className={styles.location}>📍 {evento.location}</span>}
      </div>

      {evento.imageUrl && (
        <div className={styles.imageWrapper}>
          <img src={evento.imageUrl} alt={evento.title} className={styles.image} />
        </div>
      )}

      {evento.description && (
        <p className={styles.description} style={{ whiteSpace: 'pre-line' }}>
          {evento.description}
        </p>
      )}

      {evento.additionalInfo && (
        <p className={styles.description} style={{ whiteSpace: 'pre-line' }}>
          {evento.additionalInfo}
        </p>
      )}

      {evento.images.length > 0 && (
        <div className={styles.grid}>
          {evento.images.map((img) => (
            <div key={img.id} className={styles.imageWrapper}>
              <img
                src={img.imageUrl}
                alt={img.caption ?? evento.title}
                className={styles.image}
              />
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        {evento.videoUrl && (
          <a href={evento.videoUrl} target="_blank" rel="noopener noreferrer">
            Ver video
          </a>
        )}
        {evento.externalLink && (
          <a href={evento.externalLink} target="_blank" rel="noopener noreferrer">
            Más información
          </a>
        )}
      </div>
    </div>
  );
}
