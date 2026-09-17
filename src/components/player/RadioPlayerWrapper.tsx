'use client';

import React from 'react';
import RadioPlayer from '@/components/player/RadioPlayer';

interface RadioPlayerWrapperProps {
  streamUrl?: string;
  currentProgram?: any;
}

export default function RadioPlayerWrapper({ streamUrl, currentProgram }: RadioPlayerWrapperProps) {
  return (
    <RadioPlayer streamUrl={streamUrl ?? ''} currentProgram={currentProgram} />
  );
}
