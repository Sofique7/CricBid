import { isFirebaseConfigured } from '../firebase';
import { getFirebaseMultiplayerService } from './firebaseMultiplayer';
import { getSocketMultiplayerService } from './socketMultiplayer';
import type { IMultiplayerService } from './types';

export type { IMultiplayerService, MultiplayerEvent, MultiplayerEventMap, RoomSnapshot } from './types';

export function getMultiplayerMode(): 'firebase' | 'socket' {
  return isFirebaseConfigured() ? 'firebase' : 'socket';
}

/** SSR-safe: do not branch on `window` (causes hydration mismatch). */
export function isMultiplayerConfigured(): boolean {
  return true;
}

export function getMultiplayerService(): IMultiplayerService {
  if (isFirebaseConfigured()) {
    return getFirebaseMultiplayerService();
  }
  return getSocketMultiplayerService();
}
