import Link from "next/link";
import { prisma } from "@/lib/db";
import styles from "./admin.module.css";

export default async function AdminDashboardPage() {
  const [
    programs,
    events,
    videos,
    albums,
    messages,
    unreadMessages,
    menuItems,
    team,
  ] = await Promise.all([
    prisma.program.count().then(Number),
    prisma.event.count().then(Number),
    prisma.video.count().then(Number),
    prisma.album.count().then(Number),
    prisma.contactMessage.count().then(Number),
    prisma.contactMessage.count({ where: { read: false } }).then(Number),
    prisma.menuItem.count().then(Number),
    prisma.teamMember.count().then(Number),
  ]);

  return (
    <div>
      <div className={styles.statsGrid}>
        <StatCard title="Mensajes" value={messages} href="/admin/mensajes" highlight={unreadMessages > 0} badge={unreadMessages} />
        <StatCard title="Programas" value={programs} href="/admin/programas" />
        <StatCard title="Eventos" value={events} href="/admin/eventos" />
        <StatCard title="Videos" value={videos} href="/admin/videos" />
        <StatCard title="Álbumes de fotos" value={albums} href="/admin/albumes" />
        <StatCard title="Ítems de menú" value={menuItems} href="/admin/menu" />
        <StatCard title="Equipo" value={team} href="/admin/equipo" />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  href,
  highlight = false,
  badge,
}: {
  title: string;
  value: number;
  href: string;
  highlight?: boolean;
  badge?: number;
}) {
  return (
    <Link href={href} className={`${styles.statCard} ${highlight ? styles.statCardHighlight : ""}`}>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statTitle}>
        {title}
        {badge !== undefined && badge > 0 && (
          <span className={styles.statBadge}>{badge} nuevos</span>
        )}
      </div>
    </Link>
  );
}