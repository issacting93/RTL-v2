import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';

// ── Types ──────────────────────────────────────────────────────────

interface SelectionState {
  selectedIds: Set<string>;
  hoveredId: string | null;
  filters: Record<string, string[]>;
}

interface LinkedDashboardProps {
  children: React.ReactNode;
  onSelectionChange?: (state: SelectionState) => void;
}

interface LinkedSelectionAPI {
  state: SelectionState;
  select: (ids: string[]) => void;
  hover: (id: string | null) => void;
  setFilter: (key: string, values: string[]) => void;
  clearAll: () => void;
  isSelected: (id: string) => boolean;
  isHovered: (id: string) => boolean;
  isFiltered: (key: string, value: string) => boolean;
}

// ── Reducer ────────────────────────────────────────────────────────

type Action =
  | { type: 'SELECT'; ids: string[] }
  | { type: 'HOVER'; id: string | null }
  | { type: 'SET_FILTER'; key: string; values: string[] }
  | { type: 'CLEAR_ALL' };

const initialState: SelectionState = {
  selectedIds: new Set<string>(),
  hoveredId: null,
  filters: {},
};

function reducer(state: SelectionState, action: Action): SelectionState {
  switch (action.type) {
    case 'SELECT':
      return { ...state, selectedIds: new Set(action.ids) };
    case 'HOVER':
      return { ...state, hoveredId: action.id };
    case 'SET_FILTER': {
      const filters = { ...state.filters };
      if (action.values.length === 0) {
        delete filters[action.key];
      } else {
        filters[action.key] = action.values;
      }
      return { ...state, filters };
    }
    case 'CLEAR_ALL':
      return { ...initialState, selectedIds: new Set<string>() };
    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────────────────────

const LinkedSelectionContext = createContext<LinkedSelectionAPI | null>(null);

// ── Provider ───────────────────────────────────────────────────────

export const LinkedDashboard: React.FC<LinkedDashboardProps> = ({
  children,
  onSelectionChange,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const dispatchAndNotify = useCallback(
    (action: Action) => {
      dispatch(action);
      // We compute the next state inline so the callback gets the new value
      // without waiting for a re-render.
      const next = reducer(state, action);
      onSelectionChange?.(next);
    },
    [state, onSelectionChange]
  );

  const select = useCallback(
    (ids: string[]) => dispatchAndNotify({ type: 'SELECT', ids }),
    [dispatchAndNotify]
  );

  const hover = useCallback(
    (id: string | null) => dispatchAndNotify({ type: 'HOVER', id }),
    [dispatchAndNotify]
  );

  const setFilter = useCallback(
    (key: string, values: string[]) =>
      dispatchAndNotify({ type: 'SET_FILTER', key, values }),
    [dispatchAndNotify]
  );

  const clearAll = useCallback(
    () => dispatchAndNotify({ type: 'CLEAR_ALL' }),
    [dispatchAndNotify]
  );

  const isSelected = useCallback(
    (id: string) => state.selectedIds.has(id),
    [state.selectedIds]
  );

  const isHovered = useCallback(
    (id: string) => state.hoveredId === id,
    [state.hoveredId]
  );

  const isFiltered = useCallback(
    (key: string, value: string) =>
      state.filters[key]?.includes(value) ?? false,
    [state.filters]
  );

  const api = useMemo<LinkedSelectionAPI>(
    () => ({
      state,
      select,
      hover,
      setFilter,
      clearAll,
      isSelected,
      isHovered,
      isFiltered,
    }),
    [state, select, hover, setFilter, clearAll, isSelected, isHovered, isFiltered]
  );

  return (
    <LinkedSelectionContext.Provider value={api}>
      {children}
    </LinkedSelectionContext.Provider>
  );
};

// ── Hook ───────────────────────────────────────────────────────────

export function useLinkedSelection(): LinkedSelectionAPI {
  const ctx = useContext(LinkedSelectionContext);
  if (!ctx) {
    throw new Error(
      'useLinkedSelection must be used within a <LinkedDashboard> provider.'
    );
  }
  return ctx;
}
