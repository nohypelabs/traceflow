/**
 * Role hierarchy for TraceFlow.
 * Higher number = more permissions.
 */

export const ROLE_HIERARCHY: Record<string, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 80,
  MANAGER: 60,
  USER: 40,
  VIEWER: 0,
} as const;

export type AppRole = keyof typeof ROLE_HIERARCHY;

/**
 * Check if `role` has at least `minRole` level.
 */
export function hasMinRole(role: string | undefined | null, minRole: AppRole): boolean {
  if (!role) return false;
  return (ROLE_HIERARCHY[role] ?? 0) >= ROLE_HIERARCHY[minRole];
}

/**
 * Can the actor change the target's role?
 * Only SUPER_ADMIN can change roles.
 * Cannot change your own role.
 */
export function canChangeRole(actorRole: string, targetUserId: string, actorUserId: string): boolean {
  if (actorRole !== 'SUPER_ADMIN') return false;
  if (actorUserId === targetUserId) return false; // can't demote yourself
  return true;
}

/**
 * Can the actor assign this specific role?
 * SUPER_ADMIN can assign any role.
 * Nobody else can assign roles.
 */
export function canAssignRole(actorRole: string, _targetRole: AppRole): boolean {
  return actorRole === 'SUPER_ADMIN';
}
