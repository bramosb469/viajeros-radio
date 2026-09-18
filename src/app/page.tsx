import Image from 'next/image';
import Link from 'next/link';
import prisma from '@/lib/db';
import ListenButton from '@/components/player/ListenButton';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

type ProgramSchedule = {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

type Program = {
  id: number;
  name: string;
  conductor: string | null;
  active: boolean;
};

type ProgramWithSchedules = Program & { schedules: ProgramSchedule[] };

function getCurrentProgram(programs: ProgramWithSchedules[]) {
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  return programs.find(p => 
    p.active && p.schedules.some(s => 
      s.dayOfWeek === currentDay && 
      s.startTime <= currentTime && 
      s.endTime > currentTime
    )
  ) || null;
}

function getYouTubeId(url: string) {
  const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  return match && match[2].length === 11 ? match[2] : null;
}

export default async function Home() {
  const [siteSettings, programs, upcomingEvents, recentVideos] = await Promise.all([
    prisma.siteSettings.findFirst(),
    prisma.program.findMany({ include: { schedules: true } }),
    prisma.event.findMany({
      where: { status: 'publicado', featured: true },
      take: 3,
      orderBy: { eventDate: 'asc' },
    }),
    prisma.video.findMany({
      where: { visible: true },
      take: 4,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const currentProgram = getCurrentProgram(programs);
  
  const todayPrograms = programs.flatMap(p => 
    p.schedules.filter(s => s.dayOfWeek === new Date().getDay()).map(s => ({
      ...p,
      schedule: s
    }))
  ).sort((a, b) => a.schedule.startTime.localeCompare(b.schedule.startTime));

  return (
    <div className={styles.homeContainer}>
      <video
        className={styles.backgroundVideo}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source src="/videos/background.mp4" type="video/mp4" />
      </video>
      <div className={styles.backgroundOverlay} aria-hidden="true" />
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroLogoWrapper}>
            {siteSettings?.logoUrl ? (
              <img src={siteSettings.logoUrl} alt="Viajeros Radio Logo" className={styles.heroLogo} />
            ) : (
              <div className={styles.placeholderLogo}>VR</div>
            )}
          </div>
          <h1 className={styles.heroTitle}>VIAJEROS RADIO</h1>
          <p className={styles.heroSlogan}>{siteSettings?.slogan || 'Sencillitos y de alpargatas'}</p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <ListenButton className={styles.listenButton} />
          </div>
        </div>
      </section>

      <section className={styles.nowPlayingSection}>
        <div className={styles.nowPlaying}>
          {currentProgram ? (
            <div className={styles.nowPlayingInfo}>
              <div className={styles.liveIndicator}>
                <span className={styles.pulse}></span>
                EN VIVO
              </div>
              <h2 className={styles.nowPlayingTitle}>{currentProgram.name}</h2>
              {currentProgram.conductor && <p className={styles.nowPlayingHost}>Con {currentProgram.conductor}</p>}
            </div>
          ) : (
            <div className={styles.nowPlayingInfo}>
              <div className={styles.liveIndicator}>
                <span className={styles.pulse}></span>
                EN VIVO
              </div>
              <h2 className={styles.nowPlayingTitle}>Viajeros Radio - Transmisión en vivo</h2>
            </div>
          )}
        </div>
      </section>

      <section className={styles.scheduleSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Programación de hoy</h2>
          {todayPrograms.length > 0 ? (
            <ul className={styles.scheduleList}>
              {todayPrograms.map((p, i) => (
                <li key={`${p.id}-${i}`} className={styles.scheduleItem}>
                  <span className={styles.scheduleTime}>{p.schedule.startTime} - {p.schedule.endTime}</span>
                  <span className={styles.scheduleTitle}>{p.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.emptyMessage}>Aún no hay programación cargada. Administrala desde el panel.</p>
          )}
          <Link href="/programacion" className={styles.viewMoreLink}>Ver programación completa</Link>
        </div>
      </section>

      {upcomingEvents.length > 0 && (
        <section className={styles.eventsSection}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Próximos eventos</h2>
            <div className={styles.eventCards}>
              {upcomingEvents.map((event: any) => (
                <div key={event.id} className={styles.eventCard}>
                  {event.imageUrl && (
                    <div className={styles.eventImageWrapper}>
                      <img src={event.imageUrl} alt={event.title} className={styles.eventImage} />
                    </div>
                  )}
                  <div className={styles.eventContent}>
                    <h3 className={styles.eventTitle}>{event.title}</h3>
                    <p className={styles.eventDate}>
                      {event.eventDate ? new Date(event.eventDate).toLocaleDateString('es-UY') : ''}
                    </p>
                    {event.location && <p className={styles.eventLocation}>{event.location}</p>}
                  </div>
                </div>
              ))}
            </div>
            <Link href="/eventos" className={styles.viewMoreLink}>Ver todos los eventos</Link>
          </div>
        </section>
      )}

      {recentVideos.length > 0 && (
        <section className={styles.videosSection}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Videos</h2>
            <div className={styles.videoGrid}>
              {recentVideos.map((video: any) => (
                <div key={video.id} className={styles.videoCard}>
                  <div className={styles.videoThumbnail}>
                    <img src={`https://img.youtube.com/vi/${getYouTubeId(video.youtubeUrl) ?? ''}/hqdefault.jpg`} alt={video.title ?? ''} />
                  </div>
                  {video.title && <h3 className={styles.videoTitle}>{video.title}</h3>}
                </div>
              ))}
            </div>
            <Link href="/videos-fotos" className={styles.viewMoreLink}>Ver más videos</Link>
          </div>
        </section>
      )}
    </div>
  );
}