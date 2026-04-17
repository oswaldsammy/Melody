export const MUSICIAN_TYPES = [
  { value: 'solo', label: 'Solo Performer' },
  { value: 'band', label: 'Band / Group' },
  { value: 'session', label: 'Session Musician' },
  { value: 'teacher', label: 'Music Teacher' },
] as const;

export type MusicianType = 'solo' | 'band' | 'session' | 'teacher';
