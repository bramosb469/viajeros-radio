'use client';

import React from 'react';
import { usePlayer } from '@/lib/player-context';

export default function ListenButton({ className }: { className?: string }) {
  const { play } = usePlayer();
  return (
    <button className={className} onClick={play}>
      ESCUCHAR EN VIVO
    </button>
  );
}