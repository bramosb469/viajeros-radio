'use client';

import { createContext, useCallback, useContext, useRef, type ReactNode } from 'react';

type PlayerContextValue = {
  play: () => void;
  registerPlayHandler: (fn: () => void) => void;
};

const PlayerContext = createContext<PlayerContextValue>({
  play: () => {},
  registerPlayHandler: () => {},
});

export function PlayerProvider({ children }: { children: ReactNode }) {
  const playHandlerRef = useRef<() => void>(() => {});

  const play = useCallback(() => {
    playHandlerRef.current();
  }, []);

  const registerPlayHandler = useCallback((fn: () => void) => {
    playHandlerRef.current = fn;
  }, []);

  return (
    <PlayerContext.Provider value={{ play, registerPlayHandler }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}