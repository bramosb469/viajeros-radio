'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePlayer } from '@/lib/player-context';
import { useTheme } from '@/lib/theme-provider';
import styles from './Header.module.css';
import MobileMenu from './MobileMenu';

export interface MenuItem {
  slug: string;
  label: string;
  icon?: string | null;
  visible: boolean;
}

export interface SocialNetwork {
  platform: string;
  url: string;
  label: string;
}

interface HeaderProps {
  menuItems: MenuItem[];
  siteName: string;
  slogan: string;
  logoUrl: string;
  socialNetworks: SocialNetwork[];
  isPlaying?: boolean;
  onListenClick?: () => void;
}

export default function Header({
  menuItems,
  siteName,
  slogan,
  logoUrl,
  socialNetworks,
  isPlaying = false,
  onListenClick,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { play } = usePlayer();
  const { theme, toggleTheme } = useTheme();

  const handleListen = () => {
    if (onListenClick) {
      onListenClick();
    } else {
      play();
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.left}>
            <Link href="/" className={styles.brand}>
              {logoUrl && <img src={logoUrl} alt={`Logo ${siteName}`} className={styles.logo} />}
              <span className={styles.brandText}>
                <span className={styles.siteName}>{siteName}</span>
                {slogan && <span className={styles.brandSlogan}>{slogan}</span>}
              </span>
            </Link>
          </div>

          <nav className={styles.desktopNav}>
            <ul className={styles.navList}>
              {menuItems
                .filter((item) => item.visible)
                .map((item) => {
                  const isActive = pathname === item.slug;
                  return (
                    <li key={item.slug} className={styles.navItem}>
                      <Link
                        href={item.slug}
                        className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </nav>

          <div className={styles.right}>
            <button
              className={styles.themeBtn}
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
              title={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
            >
              {theme === 'dark' ? (
                <svg viewBox="0 0 24 24" className={styles.themeIcon} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className={styles.themeIcon} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <button className={styles.listenButton} onClick={handleListen}>
              {isPlaying && <span className={styles.liveIndicator}></span>}
              ESCUCHAR EN VIVO
            </button>
            <button
              className={`${styles.hamburger} ${isMobileMenuOpen ? styles.open : ''}`}
              onClick={toggleMobileMenu}
              aria-label="Menú"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        menuItems={menuItems}
        socialNetworks={socialNetworks}
        siteName={siteName}
        slogan={slogan}
      />
    </>
  );
}
