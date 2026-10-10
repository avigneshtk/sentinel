'use client';

/**
 * Incident store — client-side, opt-in persistence.
 *
 * Default: in-memory only (lost when the tab closes).
 * If the user explicitly enables "Keep on this device",
 * incidents are stored in this browser's localStorage.
 * This is NOT a secure evidence vault and the UI says so.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import {
  createIncident,
  generateIncidentId,
  Incident,
} from '@/lib/timeline/incidents';

const STORAGE_KEY = 'sentinel:incidents:v1';
const PERSIST_KEY = 'sentinel:persist:v1';

interface IncidentsContextValue {
  incidents: Incident[];
  persistenceEnabled: boolean;
  addIncident: (input: {
    title: string;
    description: string;
    category: Incident['category'];
    date: string | null;
    dateUnknown: boolean;
  }) => Incident;
  updateIncident: (id: string, patch: Partial<Omit<Incident, 'id' | 'createdAt'>>) => void;
  deleteIncident: (id: string) => void;
  clearAll: () => void;
  setPersistenceEnabled: (enabled: boolean) => void;
}

const IncidentsContext = createContext<IncidentsContextValue | null>(null);

function readPersisted(): { incidents: Incident[]; enabled: boolean } {
  if (typeof window === 'undefined') return { incidents: [], enabled: false };
  try {
    const enabled = window.localStorage.getItem(PERSIST_KEY) === 'yes';
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const incidents = raw ? (JSON.parse(raw) as Incident[]) : [];
    return { incidents, enabled };
  } catch {
    return { incidents: [], enabled: false };
  }
}

export function IncidentsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    incidents: Incident[];
    persistenceEnabled: boolean;
  }>({ incidents: [], persistenceEnabled: false });
  const [hydrated, setHydrated] = useState(false);

  // Load opt-in persistence exactly once after mount.
  useEffect(() => {
    if (hydrated) return;
    const persisted = readPersisted();
    setState({
      incidents: persisted.incidents,
      persistenceEnabled: persisted.enabled,
    });
    setHydrated(true);
  }, [hydrated]);

  // Persist only when the user has opted in.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(PERSIST_KEY, state.persistenceEnabled ? 'yes' : 'no');
      if (state.persistenceEnabled) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.incidents));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Storage may be unavailable (private mode). In-memory state still works.
    }
  }, [state, hydrated]);

  const addIncident: IncidentsContextValue['addIncident'] = useCallback(
    (input) => {
      const incident = createIncident(input, generateIncidentId());
      setState((s) => ({ ...s, incidents: [...s.incidents, incident] }));
      return incident;
    },
    []
  );

  const updateIncident: IncidentsContextValue['updateIncident'] = useCallback(
    (id, patch) => {
      setState((s) => ({
        ...s,
        incidents: s.incidents.map((inc) =>
          inc.id === id ? { ...inc, ...patch, id: inc.id } : inc
        ),
      }));
    },
    []
  );

  const deleteIncident: IncidentsContextValue['deleteIncident'] = useCallback(
    (id) => {
      setState((s) => ({
        ...s,
        incidents: s.incidents.filter((inc) => inc.id !== id),
      }));
    },
    []
  );

  const clearAll = useCallback(() => {
    setState((s) => ({ ...s, incidents: [] }));
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* in-memory only */
    }
  }, []);

  const setPersistenceEnabled = useCallback((enabled: boolean) => {
    setState((s) => ({ ...s, persistenceEnabled: enabled }));
  }, []);

  const value = useMemo(
    () => ({
      incidents: state.incidents,
      persistenceEnabled: state.persistenceEnabled,
      addIncident,
      updateIncident,
      deleteIncident,
      clearAll,
      setPersistenceEnabled,
    }),
    [
      state.incidents,
      state.persistenceEnabled,
      addIncident,
      updateIncident,
      deleteIncident,
      clearAll,
      setPersistenceEnabled,
    ]
  );

  return (
    <IncidentsContext.Provider value={value}>
      {children}
    </IncidentsContext.Provider>
  );
}

export function useIncidents(): IncidentsContextValue {
  const ctx = useContext(IncidentsContext);
  if (!ctx) throw new Error('useIncidents must be used within IncidentsProvider');
  return ctx;
}
