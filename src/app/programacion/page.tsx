import { Metadata } from 'next';
import prisma from '@/lib/db';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Programación - Viajeros Radio',
  description: 'Conoce nuestra grilla semanal de programas. Viajeros Radio, sencillito y de alpargatas.',
};

const daysOfWeek = [
  { id: 1, name: 'Lunes' },
  { id: 2, name: 'Martes' },
  { id: 3, name: 'Miércoles' },
  { id: 4, name: 'Jueves' },
  { id: 5, name: 'Viernes' },
  { id: 6, name: 'Sábado' },
  { id: 0, name: 'Domingo' },
];

export default async function ProgramacionPage() {
  const activePrograms = await prisma.program.findMany({
    where: { active: true },
    include: { schedules: true },
  });

  const currentDay = new Date().getDay();

  const weekdayPrograms = activePrograms
    .filter((program) => program.lunAViernes)
    .map((program) => {
      const schedule =
        program.schedules.find((s) => s.dayOfWeek === 1) ||
        program.schedules.find((s) => s.dayOfWeek >= 1 && s.dayOfWeek <= 5);
      const startT = program.schedules
        .filter((s) => s.dayOfWeek >= 1 && s.dayOfWeek <= 5)
        .map((s) => s.startTime)
        .sort()[0];
      const endT = program.schedules
        .filter((s) => s.dayOfWeek >= 1 && s.dayOfWeek <= 5)
        .map((s) => s.endTime)
        .sort().reverse()[0];
      return {
        ...program,
        startTime: startT || schedule?.startTime || '',
        endTime: endT || schedule?.endTime || '',
      };
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const weekdayIds = new Set(weekdayPrograms.map((p) => p.id));

  const scheduleByDay = daysOfWeek
    .map((day) => {
      const programsForDay = activePrograms
        .filter((program) => !weekdayIds.has(program.id))
        .filter((program) => program.schedules.some((s) => s.dayOfWeek === day.id))
        .map((program) => {
          const schedule = program.schedules.find((s) => s.dayOfWeek === day.id);
          return {
            ...program,
            startTime: schedule?.startTime || '',
            endTime: schedule?.endTime || '',
          };
        })
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

      return {
        ...day,
        programs: programsForDay,
      };
    })
    .filter((day) => day.programs.length > 0);

  const hasAnyProgram = activePrograms.length > 0;

  return (
    <div className={`container section-padding ${styles.container}`}>
      <h1 className="fade-in">Nuestra Programación</h1>
      
      {!hasAnyProgram ? (
        <div className={`fade-in ${styles.emptyState}`}>
          <p>Pronto actualizaremos nuestra grilla de programación. ¡Mantente en sintonía!</p>
        </div>
      ) : (
        <div className={`fade-in ${styles.grid}`}>
          {weekdayPrograms.length > 0 && (
            <div className={`${styles.dayCard} ${styles.weekdayCard}`}>
              <div className={styles.dayHeader}>
                <h2>Lunes a Viernes</h2>
              </div>
              <div className={styles.programList}>
                {weekdayPrograms.map((program) => (
                  <div key={`lun-vie-${program.id}`} className={styles.programItem}>
                    <div className={styles.timeBlock}>
                      <span className={styles.time}>{program.startTime}</span>
                      <span className={styles.separator}>-</span>
                      <span className={styles.time}>{program.endTime}</span>
                    </div>
                    <div className={styles.programInfo}>
                      {program.imageUrl && (
                        <img src={program.imageUrl} alt={program.name} className={styles.programImage} />
                      )}
                      <div>
                        <h3 className={styles.programName}>{program.name}</h3>
                        {program.conductor && (
                          <p className={styles.conductor}>{program.conductor}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {scheduleByDay.map((day) => (
            <div 
              key={day.id} 
              className={`${styles.dayCard} ${currentDay === day.id ? styles.currentDay : ''}`}
            >
              <div className={styles.dayHeader}>
                <h2>{day.name}</h2>
                {currentDay === day.id && <span className={styles.todayBadge}>Hoy</span>}
              </div>
              <div className={styles.programList}>
                {day.programs.length > 0 ? (
                  day.programs.map((program) => (
                    <div key={`${day.id}-${program.id}`} className={styles.programItem}>
                      <div className={styles.timeBlock}>
                        <span className={styles.time}>{program.startTime}</span>
                        <span className={styles.separator}>-</span>
                        <span className={styles.time}>{program.endTime}</span>
                      </div>
                      <div className={styles.programInfo}>
                        {program.imageUrl && (
                          <img src={program.imageUrl} alt={program.name} className={styles.programImage} />
                        )}
                        <div>
                          <h3 className={styles.programName}>{program.name}</h3>
                          {program.conductor && (
                            <p className={styles.conductor}>{program.conductor}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={styles.noPrograms}>Sin programación asignada</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}