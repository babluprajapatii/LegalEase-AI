import { createContext, useContext } from 'react';
import type { ToastKind } from './components';

export type Route =
  | 'landing' | 'auth' | 'dashboard' | 'upload' | 'processing'
  | 'analysis' | 'qa' | 'compare' | 'nextsteps' | 'history' | 'settings';

export interface AppCtx {
  route: Route;
  navigate: (r: Route) => void;
  toast: (kind: ToastKind, message: string) => void;
  authed: boolean;
  signIn: () => void;
  signOut: () => void;
  hasDocuments: boolean;
  setHasDocuments: (v: boolean) => void;
}

export const AppContext = createContext<AppCtx | null>(null);
export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp outside provider');
  return ctx;
};
