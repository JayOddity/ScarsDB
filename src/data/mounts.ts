export interface Mount {
  name: string;
  type: string;
  description: string;
  faction?: string;
}

// Only ground mounts are confirmed. No flying mounts in the game.
// Specific mount names, speeds, sources, and rarities are not yet confirmed by the developers.
export const mounts: Mount[] = [];
