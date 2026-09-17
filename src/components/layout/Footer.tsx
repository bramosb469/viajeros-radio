import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

interface MenuItem {
  slug: string;
  label: string;
}

interface SocialNetwork {
  platform: string;
  url: string;
  label: string;
}

interface FooterProps {
  siteName: string;
  slogan: string;
  socialNetworks: SocialNetwork[];
  footerText: string;
  menuItems: MenuItem[];
}

const getSocialIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
        </svg>
      );
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      );
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
        </svg>
      );
    default:
      return null;
  }
};

export default function Footer({
  siteName,
  slogan,
  socialNetworks,
  footerText,
  menuItems,
}: FooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Column 1: Brand */}
          <div className={styles.brandCol}>
            <Link href="/" className={styles.brand}>
              {siteName}
            </Link>
            <p className={styles.slogan}>{slogan}</p>
            <p className={styles.description}>
              Llevando la identidad folclórica y rural uruguaya a todo el mundo a través de la mejor música y programación.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div className={styles.navCol}>
            <h3 className={styles.colTitle}>Navegación</h3>
            <ul className={styles.navList}>
              {menuItems.map((item) => (
                <li key={item.slug}>
                  <Link href={item.slug} className={styles.navLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Social */}
          <div className={styles.socialCol}>
            <h3 className={styles.colTitle}>Síguenos</h3>
            <div className={styles.socialNetworks}>
              {socialNetworks.map((social) => (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label={social.label}
                >
                  {getSocialIcon(social.platform)}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            {footerText.replace('{year}', new Date().getFullYear().toString())}
          </p>
        </div>
      </div>
    </footer>
  );
}
