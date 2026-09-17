'use client';

import React, { useState, useCallback } from 'react';

// Tipo simplificado para los enlaces externos
type ExternalLinks = {
  spotify?: string;
  youtube?: string;
  appleMusic?: string;
} | null;

// Tipo simplificado para el resultado de reconocimiento
type RecognitionResult = {
  title?: string;
  artist?: string;
  album?: string;
  albumArt?: string;
  externalLinks: ExternalLinks;
};

interface MusicIdentifierButtonProps {
  className?: string;
  tooltip?: string;
}

export default function MusicIdentifierButton({
  className,
  tooltip = 'Hacé clic para identificar la canción que suena en la radio',
}: MusicIdentifierButtonProps) {
  const [state, setState] = useState<'idle' | 'listening' | 'identifying' | 'result' | 'error'>('idle');
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleIdentify = useCallback(async () => {
    setState('listening');
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/music/identify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!data.success) {
        setState('error');
        setError(data.error || 'ERROR_UNKNOWN');
        return;
      }

      setState('result');
      setResult(data.result || null);
    } catch (err) {
      console.error('Error identifying song:', err);
      setState('error');
      setError('No pudimos identificar la canción que está sonando.');
    }
  }, []);

  const handleRetry = useCallback(() => {
    setState('idle');
    setResult(null);
    setError(null);
    handleIdentify();
  }, [handleIdentify]);

  const renderButton = () => {
    switch (state) {
      case 'idle':
        return (
          <button
            className={className}
            type="button"
            aria-label="Identificar canción"
            title={tooltip}
          >
            🔍 Identificar canción
          </button>
        );

      case 'listening':
        return (
          <button
            className={className}
            type="button"
            aria-label="Identificar canción"
            title={tooltip}
            disabled
          >
            🎧 Escuchando...
          </button>
        );

      case 'identifying':
        return (
          <button
            className={className}
            type="button"
            aria-label="Identificar canción"
            title={tooltip}
            disabled
          >
            🔍 Identificando canción...
          </button>
        );

      case 'result':
        if (!result) return null;
        return (
          <div style={{ marginTop: '1rem' }}>
            <p>
              <strong>{result.artist || ''}</strong> - {result.title || ''}
            </p>
            {result.albumArt && (
              <img
                src={result.albumArt}
                alt="Portada del álbum"
                style={{ width: 50, height: 50, borderRadius: 4, marginRight: '0.5rem' }}
              />
            )}
            {result.externalLinks &&
              Object.values(result.externalLinks).some((link) => link) && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                  {result.externalLinks.spotify && (
                    <a href={result.externalLinks.spotify} target="_blank" rel="noopener">
                      ▶ Spotify
                    </a>
                  )}
                  {result.externalLinks.youtube && (
                    <a href={result.externalLinks.youtube} target="_blank" rel="noopener">
                      ▶ YouTube
                    </a>
                  )}
                  {result.externalLinks.appleMusic && (
                    <a href={result.externalLinks.appleMusic} target="_blank" rel="noopener">
                      ▶ Apple Music
                    </a>
                  )}
                </div>
              )}
            <button
              onClick={handleRetry}
              style={{ marginTop: '0.5rem', background: 'none', border: '1px solid #9aa3af', color: '#e8eaed', padding: '0.25rem 0.5rem', cursor: 'pointer' }}
            >
              Intentar nuevamente
            </button>
          </div>
        );

      case 'error':
        return (
          <div style={{ marginTop: '1rem', color: '#e63946' }}>
            <p>No pudimos identificar la canción que está sonando.</p>
            <button
              onClick={handleRetry}
              style={{ marginTop: '0.5rem', background: 'none', border: '1px solid #9aa3af', color: '#e8eaed', padding: '0.25rem 0.5rem', cursor: 'pointer' }}
            >
              Intentar nuevamente
            </button>
          </div>
        );
    }
  };

  return <>{renderButton()}</>;
}