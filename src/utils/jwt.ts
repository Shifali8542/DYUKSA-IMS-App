import type { JwtPayload, ImsRole } from '../types';

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    // Use atob — available in React Native's Hermes engine
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function getImsRole(token: string): ImsRole | string | null {
  return decodeJwtPayload(token)?.platform_roles?.ims ?? null;
}

export function getUserDisplayName(token: string): string {
  const p = decodeJwtPayload(token);
  if (!p) return 'User';
  return [p.first_name, p.last_name].filter(Boolean).join(' ') || p.username;
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeJwtPayload(token) as any;
    if (!payload?.exp) return false;
    return Date.now() / 1000 > payload.exp;
  } catch {
    return true;
  }
}