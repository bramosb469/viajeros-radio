'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import RadioPlayer from '@/components/player/RadioPlayer';

interface RadioPlayerWrapperProps {
  streamUrl?: string;
  currentProgram?: any;
}

function PlayerInner({ streamUrl, currentProgram }: RadioPlayerWrapperProps) {
  const pathname = usePathname();
  // En el panel de administración no se muestra el reproductor para que
  // no tape la navegación lateral.
  if (pathname?.startsWith('/panel')) return null;
  return (
    <RadioPlayer streamUrl={streamUrl ?? ''} currentProgram={currentProgram} />
  );
}

export default function RadioPlayerWrapper({ streamUrl, currentProgram }: RadioPlayerWrapperProps) {
  return (
    <Suspense fallback={null}>
      <PlayerInner streamUrl={streamUrl} currentProgram={currentProgram} />
    </Suspense>
  );
}
