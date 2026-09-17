import React, { useEffect, useRef, useState, useCallback } from 'react';
import { usePlayer } from '@/lib/player-context';
import { useTheme } from '@/lib/theme-provider';
import styles from './RadioPlayer.module.css';

interface RadioPlayerProps {
  streamUrl: string;
  currentProgram?: {
    name: string;
    conductor?: string;
  };
}

type PlayerState = 'idle' | 'loading' | 'playing' | 'paused' | 'error' | 'reconnecting';

export default function RadioPlayer({ streamUrl, currentProgram }: RadioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>('idle');
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showAutoplayPrompt, setShowAutoplayPrompt] = useState<boolean>(false);
  const reconnectAttempts = useRef<number>(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { registerPlayHandler } = usePlayer();
  const { theme, toggleTheme } = useTheme();

  // Intervalos de backoff: 3s, 5s, 10s, 20s, 30s
  const BACKOFF_INTERVALS = [3000, 5000, 10000, 20000, 30000];

  const handlePlayPause = useCallback(() => {
    if (!audioRef.current) return;

    if (playerState === 'playing' || playerState === 'loading' || playerState === 'reconnecting') {
      audioRef.current.pause();
      setPlayerState('paused');
      setShowAutoplayPrompt(false);
    } else {
      setPlayerState('loading');
      audioRef.current.play().catch(() => {
        setPlayerState('error');
      });
    }
  }, [playerState]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectAttempts.current >= BACKOFF_INTERVALS.length) {
      setPlayerState('error');
      return;
    }

    const timeout = BACKOFF_INTERVALS[reconnectAttempts.current];
    setPlayerState('reconnecting');

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttempts.current += 1;
      if (audioRef.current) {
        audioRef.current.load(); // Recarga la fuente
        audioRef.current.play().catch(scheduleReconnect);
      }
    }, timeout);
  }, [BACKOFF_INTERVALS]);

  // Efecto para inicializar el audio y event listeners
  useEffect(() => {
    const audio = new Audio(streamUrl);
    audioRef.current = audio;

    const onPlaying = () => {
      setPlayerState('playing');
      reconnectAttempts.current = 0;
      setShowAutoplayPrompt(false);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };

    const onWaiting = () => setPlayerState('loading');
    
    const onError = () => {
      // Intentar reconectar si hay error de red
      scheduleReconnect();
    };

    const onPause = () => {
      // Solo cambiar a paused si no estamos intentando reconectar
      if (playerState !== 'reconnecting' && playerState !== 'error') {
        setPlayerState('paused');
      }
    };

    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('error', onError);
    audio.addEventListener('pause', onPause);

    // Intento de autoplay
    setPlayerState('loading');
    audio.play().catch(() => {
      setPlayerState('idle');
      setShowAutoplayPrompt(true);
    });

    registerPlayHandler(() => {
      if (!audioRef.current) return;
      setPlayerState('loading');
      audioRef.current.play().catch(() => {
        setPlayerState('error');
      });
    });

    return () => {
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('pause', onPause);
      audio.pause();
      audio.src = '';
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamUrl]);

  // Manejo del volumen
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val > 0 && isMuted) setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const isPlaying = playerState === 'playing';

  return (
    <div className={`${styles.playerContainer} ${theme === 'light' ? styles.themeLight : styles.themeDark}`}>
      {/* Banner de autoplay si es necesario */}
      {showAutoplayPrompt && (
        <div className={styles.autoplayPrompt}>
          <span>¡La radio está lista!</span>
          <button onClick={handlePlayPause} className={styles.listenButton}>
            ESCUCHAR EN VIVO
          </button>
        </div>
      )}

      <div className={styles.playerBar}>
        {/* Lado izquierdo: En Vivo e Info del Programa */}
        <div className={styles.leftSection}>
          <div className={`${styles.liveIndicator} ${isPlaying ? styles.isLive : ''}`}>
            <span className={styles.pulseDot}></span>
            <span className={styles.liveText}>EN VIVO</span>
          </div>

          {currentProgram && (
            <div className={styles.programInfo}>
              <span className={styles.programName}>{currentProgram.name}</span>
              {currentProgram.conductor && (
                <span className={styles.programConductor}>{currentProgram.conductor}</span>
              )}
            </div>
          )}
        </div>

        {/* Centro: Controles principales */}
        <div className={styles.centerSection}>
          <button
            className={styles.playPauseBtn}
            onClick={handlePlayPause}
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {playerState === 'loading' || playerState === 'reconnecting' ? (
              <div className={styles.spinner}></div>
            ) : isPlaying ? (
              // Pause Icon
              <svg viewBox="0 0 24 24" className={styles.icon} fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              // Play Icon
              <svg viewBox="0 0 24 24" className={styles.iconPlay} fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Mensaje de estado debajo del botón si hay error o reconexión */}
          {(playerState === 'error' || playerState === 'reconnecting') && (
            <div className={styles.statusMessage}>
              {playerState === 'reconnecting' ? 'Reconectando...' : 'Error de conexión'}
            </div>
          )}
        </div>

        {/* Derecha: Ecualizador y Volumen */}
        <div className={styles.rightSection}>
          <div className={`${styles.equalizer} ${isPlaying ? styles.eqActive : ''}`}>
            <div className={styles.bar}></div>
            <div className={styles.bar}></div>
            <div className={styles.bar}></div>
            <div className={styles.bar}></div>
          </div>

          <div className={styles.volumeControl}>
            <button onClick={toggleMute} className={styles.muteBtn} aria-label="Silenciar">
              {isMuted || volume === 0 ? (
                // Mute Icon
                <svg viewBox="0 0 24 24" className={styles.iconSmall} fill="currentColor">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
              ) : (
                // Volume Icon
                <svg viewBox="0 0 24 24" className={styles.iconSmall} fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className={styles.volumeSlider}
              aria-label="Volumen"
            />
          </div>

          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            title={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
          >
            {theme === 'dark' ? (
              // Sol
              <svg viewBox="0 0 24 24" className={styles.iconSmall} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              // Luna
              <svg viewBox="0 0 24 24" className={styles.iconSmall} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
