import { Metadata } from 'next';
import prisma from '@/lib/db';
import ContactForm from '@/components/sections/ContactForm';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Contacto - Viajeros Radio',
  description: 'Comunicate con Viajeros Radio. Mándanos tu mensaje o visítanos en nuestras redes.',
};

export default async function ContactoPage() {
  const [settings, contactInfo, socialNetworks] = await Promise.all([
    prisma.siteSettings.findFirst(),
    prisma.contactInfo.findMany({
      where: { visible: true },
      orderBy: { displayOrder: 'asc' },
    }),
    prisma.socialNetwork.findMany({
      where: { visible: true },
      orderBy: { displayOrder: 'asc' },
    }),
  ]);

  const settingsItems: { label: string; value: string; href?: string }[] = [];
  let contactName = '';
  if (settings?.contactName) {
    contactName = settings.contactName;
    settingsItems.push({ label: 'Contacto', value: settings.contactName });
  }
  if (settings?.whatsappNumber) {
    settingsItems.push({
      label: 'WhatsApp',
      value: settings.whatsappNumber,
      href: `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`,
    });
  }
  if (settings?.contactEmail) {
    settingsItems.push({
      label: 'Correo electrónico',
      value: settings.contactEmail,
      href: `mailto:${settings.contactEmail}`,
    });
  }

  return (
    <div className={`container section-padding ${styles.container}`}>
      <h1 className="fade-in">Contacto</h1>

      <div className={`fade-in ${styles.layout}`}>
        <div className={styles.formColumn}>
          <h2>Envíanos un mensaje</h2>
          <p className={styles.subtitle}>
            Completá el formulario y nos pondremos en contacto contigo a la brevedad.
          </p>
          <ContactForm />
        </div>

        <div className={styles.infoColumn}>
          <div className={styles.infoBox}>
            <h2>Información de Contacto</h2>
            
            {(settingsItems.length > 0 || contactInfo.length > 0) ? (
              <ul className={styles.infoList}>
                {settingsItems.map((item, i) => (
                  <li key={`s-${i}`}>
                    <strong>{item.label}:</strong>{" "}
                    {item.href ? (
                      <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                        {item.value}
                      </a>
                    ) : (
                      item.value
                    )}
                  </li>
                ))}
                {contactInfo.map((info) => (
                  <li key={info.id}>
                    <strong>{info.name}:</strong>{" "}
                    {info.whatsapp ? (
                      <a href={`https://wa.me/${info.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer">
                        {info.whatsapp}
                      </a>
                    ) : (
                      info.email ?? ""
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyText}>No hay información de contacto disponible.</p>
            )}

            <h3 className={styles.socialTitle}>Nuestras Redes</h3>
            {socialNetworks.length > 0 ? (
              <div className={styles.socialGrid}>
                {socialNetworks.map((social) => (
                  <a 
                    key={social.id} 
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            ) : (
              <p className={styles.emptyText}>No hay redes sociales configuradas.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}