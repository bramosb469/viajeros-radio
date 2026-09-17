'use client'

import { useState } from 'react'
import styles from './MediaTabs.module.css'

interface MediaTabsProps {
  videosContent: React.ReactNode
  photosContent: React.ReactNode
  videosCount: number
  photosCount: number
}

export default function MediaTabs({ videosContent, photosContent, videosCount, photosCount }: MediaTabsProps) {
  const [activeTab, setActiveTab] = useState<'videos' | 'fotos'>('videos')

  return (
    <div className={styles.container}>
      <div className={styles.tabs} role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'videos'}
          className={`${styles.tab} ${activeTab === 'videos' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('videos')}
        >
          Videos {videosCount > 0 && <span className={styles.count}>{videosCount}</span>}
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'fotos'}
          className={`${styles.tab} ${activeTab === 'fotos' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('fotos')}
        >
          Fotos {photosCount > 0 && <span className={styles.count}>{photosCount}</span>}
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'videos' && (
          <div role="tabpanel" className="fade-in">
            {videosContent}
          </div>
        )}
        {activeTab === 'fotos' && (
          <div role="tabpanel" className="fade-in">
            {photosContent}
          </div>
        )}
      </div>
    </div>
  )
}
