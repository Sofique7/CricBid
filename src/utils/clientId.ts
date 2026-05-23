const STORAGE_KEY = 'cricbid_client_id';

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `client_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export function getClientId(): string {
  if (typeof window === 'undefined') {
    return 'ssr_placeholder';
  }
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = generateId();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
