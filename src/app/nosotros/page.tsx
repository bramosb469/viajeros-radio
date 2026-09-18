import { Metadata } from 'next';
import prisma from '@/lib/db';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Nosotros - Viajeros Radio',
  description: 'Conoce nuestra historia y al equipo de Viajeros Radio.',
};

export default async function NosotrosPage() {
  const [sections, team] = await Promise.all([
    prisma.aboutSection.findMany({
      where: { visible: true },
      orderBy: { displayOrder: 'asc' },
    }),
    prisma.teamMember.findMany({
      where: { visible: true },
      orderBy: { displayOrder: 'asc' },
    }),
  ]);

  const isEmpty = sections.length === 0 && team.length === 0;

  return (
    <div className={`container section-padding ${styles.container}`}>
      <h1 className="fade-in">Sobre Nosotros</h1>

      {isEmpty ? (
        <div className={`fade-in ${styles.emptyState}`}>
          <p>Pronto compartiremos más sobre nuestra historia y equipo.</p>
        </div>
      ) : (
        <div className="fade-in">
          {sections.length > 0 && (
            <div className={styles.sectionsContainer}>
              {sections.map((section, index) => (
                <section 
                  key={section.id} 
                  className={`${styles.aboutSection} ${index % 2 !== 0 ? styles.alternateBg : ''}`}
                >
                  <h2>{section.title}</h2>
                  {section.content && (
                    <div 
                      className={styles.content}
                      dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br />') }}
                    />
                  )}
                </section>
              ))}
            </div>
          )}

          {team.length > 0 && (
            <section className={styles.teamSection}>
              <h2 className={styles.teamTitle}>Nuestro Equipo</h2>
              <div className={styles.teamGrid}>
                {team.map((member) => (
                  <div key={member.id} className={styles.teamCard}>
                    {member.photoUrl ? (
                      <img src={member.photoUrl} alt={member.name} className={styles.memberPhoto} />
                    ) : (
                      <div className={styles.memberPhotoPlaceholder}>👤</div>
                    )}
                    <div className={styles.memberInfo}>
                      <h3>{member.name}</h3>
                      {member.role && <p className={styles.memberRole}>{member.role}</p>}
                      {member.description && (
                        <p className={styles.memberDescription}>{member.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}