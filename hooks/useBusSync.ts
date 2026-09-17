'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import type {
  AbsenceReason,
  AppState,
  BusLocation,
  StudentStatus,
  SyncEvent,
  TripMode,
} from '@/types';
import { INITIAL_STATE } from '@/lib/mockData';
import {
  STORAGE_KEY,
  getChannel,
  isSyncMessage,
  readPersisted,
  reducer,
  writePersisted,
} from '@/lib/sync';

/**
 * Shared demo state, mirrored across every open tab.
 *
 * Actions — not whole states — travel over the BroadcastChannel: each tab feeds
 * the same event into the same reducer and therefore lands on the same state.
 * A tab that joins late asks for a snapshot; localStorage covers reloads and
 * browsers without BroadcastChannel.
 *
 * @param onRemoteEvent called only for events that arrived from *another* tab,
 *   which is what the parent screen hangs its toasts and chimes off.
 */
export function useBusSync(onRemoteEvent?: (event: SyncEvent) => void) {
  const [state, rawDispatch] = useReducer(reducer, undefined, INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);

  // Refs so the mount-only effect below always sees current values.
  const stateRef = useRef(state);
  stateRef.current = state;

  const remoteHandler = useRef(onRemoteEvent);
  remoteHandler.current = onRemoteEvent;

  const senderId = useRef<string>('');
  if (!senderId.current && typeof window !== 'undefined') {
    senderId.current =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `tab-${Math.random().toString(36).slice(2)}`;
  }

  /** Apply locally, persist, then tell the other tabs. */
  const dispatch = useCallback((event: SyncEvent) => {
    rawDispatch(event);
    getChannel()?.postMessage({ senderId: senderId.current, event });
  }, []);

  // --- wiring: channel + storage fallback + late-join handshake ------------
  useEffect(() => {
    const channel = getChannel();

    const onMessage = (ev: MessageEvent) => {
      if (!isSyncMessage(ev.data)) return;
      const { senderId: from, event } = ev.data;
      if (from === senderId.current) return; // our own echo

      if (event.type === 'STATE_REQUEST') {
        channel?.postMessage({
          senderId: senderId.current,
          event: { type: 'STATE_SNAPSHOT', payload: stateRef.current },
        });
        return;
      }

      rawDispatch(event);
      remoteHandler.current?.(event);
    };

    // Works even where BroadcastChannel does not: another tab's write to
    // localStorage reaches us as a whole-state snapshot.
    const onStorage = (ev: StorageEvent) => {
      if (ev.key !== STORAGE_KEY || !ev.newValue) return;
      try {
        const snapshot = JSON.parse(ev.newValue) as AppState;
        rawDispatch({ type: 'STATE_SNAPSHOT', payload: snapshot });
      } catch {
        /* ignore malformed payloads */
      }
    };

    channel?.addEventListener('message', onMessage);
    window.addEventListener('storage', onStorage);

    // Catch up: whatever this browser last stored, then whatever a live tab has.
    const persisted = readPersisted();
    if (persisted) rawDispatch({ type: 'STATE_SNAPSHOT', payload: persisted });
    channel?.postMessage({
      senderId: senderId.current,
      event: { type: 'STATE_REQUEST' },
    });

    setHydrated(true);

    return () => {
      channel?.removeEventListener('message', onMessage);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // Persist only once hydrated, so the initial render never clobbers storage.
  useEffect(() => {
    if (hydrated) writePersisted(state);
  }, [state, hydrated]);

  // --- convenience actions ------------------------------------------------
  const setStudentStatus = useCallback(
    (studentId: string, status: StudentStatus) =>
      dispatch({
        type: 'STUDENT_STATUS_CHANGE',
        payload: { studentId, status, at: new Date().toISOString() },
      }),
    [dispatch],
  );

  const toggleAbsent = useCallback(
    (studentId: string, absent: boolean, reason?: AbsenceReason) =>
      dispatch({
        type: 'STUDENT_ABSENT_TOGGLE',
        payload: { studentId, absent, reason, at: new Date().toISOString() },
      }),
    [dispatch],
  );

  const setTripMode = useCallback(
    (mode: TripMode) => dispatch({ type: 'TRIP_STATE_CHANGE', payload: { mode } }),
    [dispatch],
  );

  const updateBusLocation = useCallback(
    (bus: BusLocation) => dispatch({ type: 'BUS_LOCATION_UPDATE', payload: bus }),
    [dispatch],
  );

  const resetDemo = useCallback(() => dispatch({ type: 'RESET_DEMO' }), [dispatch]);

  return {
    state,
    hydrated,
    dispatch,
    setStudentStatus,
    toggleAbsent,
    setTripMode,
    updateBusLocation,
    resetDemo,
  };
}
