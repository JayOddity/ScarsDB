let adminSet: Set<string> | null = null;

function loadAdminUsers(): Set<string> {
  if (adminSet) return adminSet;
  const raw = process.env.ADMIN_USERS || '';
  adminSet = new Set(
    raw.split(',').map((id) => id.trim()).filter(Boolean)
  );
  return adminSet;
}

export function isAdmin(sanityUserId: string | undefined | null): boolean {
  if (!sanityUserId) return false;
  const admins = loadAdminUsers();
  const shortId = sanityUserId.startsWith('user-') ? sanityUserId.slice(5) : sanityUserId;
  return admins.has(shortId) || admins.has(sanityUserId);
}
