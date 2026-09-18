import { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'node:path';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Eventos - Viajeros Radio',
  description: 'Descubre los próximos eventos y fiestas. Viajeros Radio, siempre acompañando la tradición.',
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('es-UY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

async function getEventos() {
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  const client = new PrismaClient({ adapter });
  try {
    const eventos = await client.event.findMany({
      where: { status: 'publicado' },
      orderBy: { eventDate: 'desc' },
    });
    console.log('[EVENTOS] Fresh client count:', eventos.length);
    return eventos;
  } finally {
    await client.$disconnect();
  }
}

export default async function EventosPage() {
  const eventos = await getEventos();

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const proximos = eventos.filter((e) => new Date(e.eventDate) >= now);
  const pasados = eventos.filter((e) => new Date(e.eventDate) < now);

  const hasEventos = eventos.length > 0;

  return (
    <div className={`container section-padding ${styles.container}`}>
      <h1 className="fade-in">Eventos y Festivales</h1>

      {!hasEventos ? (
        <div className={`fade-in ${styles.emptyState}`}>
          <p>No hay eventos publicados por el momento. ¡Pronto tendremos novedades!</p>
        </div>
      ) : (
        <div className="fade-in">
          {proximos.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Próximos Eventos</h2>
              <div className={styles.grid}>
                {proximos.map((evento) => (
                  <EventCard key={evento.id} evento={evento} />
                ))}
              </div>
            </section>
          )}

          {proximos.length > 0 && pasados.length > 0 && <hr className={styles.separator} />}

          {pasados.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Eventos Pasados</h2>
              <div className={`${styles.grid} ${styles.pasadosGrid}`}>
                {pasados.map((evento) => (
                  <EventCard key={evento.id} evento={evento} isPasado />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function EventCard({ evento, isPasado = false }: { evento: any; isPasado?: boolean }) {
  return (
    <div className={`${styles.card} ${isPasado ? styles.cardPasado : ''}`}>
      {evento.imageUrl ? (
        <div className={styles.imageWrapper}>
          <img src={evento.imageUrl} alt={evento.title} className={styles.image} />
        </div>
      ) : (
        <div className={styles.imagePlaceholder}>
          <span>Sin imagen</span>
        </div>
      )}
      <div className={styles.cardContent}>
        <h3 className={styles.title}>{evento.title}</h3>
        <div className={styles.meta}>
          <span className={styles.date}>📅 {formatDate(new Date(evento.eventDate))}</span>
          {evento.eventTime && <span className={styles.time}>⏰ {evento.eventTime}</span>}
          {evento.location && <span className={styles.location}>📍 {evento.location}</span>}
        </div>
        {evento.description && (
          <p className={styles.description}>
            {evento.description.length > 120
              ? `${evento.description.substring(0, 120)}...`
              : evento.description}
          </p>
        )}
      </div>
    </div>
  );
}