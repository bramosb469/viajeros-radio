'use client';

import { useState } from 'react';
import styles from './page.module.css';

interface Video {
  id: number;
  title: string | null;
  youtubeUrl: string;
}

interface Album {
  id: number;
  name: string;
  coverImageUrl: string | null;
  _count: { photos: number };
}

export default function TabsContent({ videos, albums }: { videos: Video[]; albums: Album[] }) {
  const [activeTab, setActiveTab] = useState<'videos' | 'fotos'>('videos');

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  return (
    <div className="fade-in">
      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabButton} ${activeTab === 'videos' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('videos')}
        >
          VIDEOS
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'fotos' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('fotos')}
        >
          FOTOS
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'videos' && (
          <div>
            {videos.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Aún no hay videos publicados.</p>
              </div>
            ) : (
              <div className={styles.videosGrid}>
                {videos.map((video) => {
                  const videoId = getYouTubeId(video.youtubeUrl);
                  return (
                    <div key={video.id} className={styles.videoCard}>
                      {videoId ? (
                        <div className={styles.iframeWrapper}>
                          <iframe
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title={video.title || 'YouTube Video'}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                          ></iframe>
                        </div>
                      ) : (
                        <div className={styles.emptyState}>URL inválida</div>
                      )}
                      {video.title && <h3 className={styles.videoTitle}>{video.title}</h3>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'fotos' && (
          <div>
            {albums.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Aún no hay álbumes publicados.</p>
              </div>
            ) : (
              <div className={styles.albumsGrid}>
                {albums.map((album) => (
                  <div key={album.id} className={styles.albumCard}>
                    {album.coverImageUrl ? (
                      <img src={album.coverImageUrl} alt={album.name} className={styles.albumCover} />
                    ) : (
                      <div className={styles.albumPlaceholder}>Sin portada</div>
                    )}
                    <div className={styles.albumInfo}>
                      <h3 className={styles.albumName}>{album.name}</h3>
                      <span className={styles.photoCount}>
                        {album._count.photos} {album._count.photos === 1 ? 'foto' : 'fotos'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}