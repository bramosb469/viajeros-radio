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
  const [playingId, setPlayingId] = useState<number | null>(null);

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|live\/|watch\?v=|&v=)([^#&?]*).*/;
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
                        playingId === video.id ? (
                          <div className={styles.iframeWrapper}>
                            <iframe
                              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                              title={video.title || 'YouTube Video'}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPlayingId(video.id)}
                            className={styles.iframeWrapper}
                            style={{
                              position: 'relative',
                              width: '100%',
                              padding: 0,
                              border: 'none',
                              cursor: 'pointer',
                              background: '#000',
                            }}
                            aria-label={`Reproducir ${video.title || 'video'}`}
                          >
                            <img
                              src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
                              alt={video.title || 'Miniatura del video'}
                              loading="lazy"
                              style={{ width: '100%', display: 'block' }}
                            />
                            <span
                              style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '68px',
                                height: '48px',
                                background: 'rgba(255,0,0,0.9)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <span
                                style={{
                                  width: 0,
                                  height: 0,
                                  borderTop: '10px solid transparent',
                                  borderBottom: '10px solid transparent',
                                  borderLeft: '16px solid #fff',
                                  marginLeft: '4px',
                                }}
                              />
                            </span>
                          </button>
                        )
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