export const GENRES = [
  'Jazz', 'Classical', 'Rock', 'Pop', 'R&B', 'Hip Hop', 'Country',
  'Blues', 'Electronic', 'Folk', 'Latin', 'Reggae', 'Gospel', 'Indie',
  'Metal', 'Funk', 'Soul', 'World', 'Acoustic', 'Wedding',
] as const;

export type Genre = typeof GENRES[number];
