"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { AppState } from "./types";

const SAVE_DEBOUNCE_MS = 350;

interface AppStateContextValue {
  state: AppState | null;
  setState: Dispatch<SetStateAction<AppState | null>>;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);
  const skipNextSave = useRef(false);

  useEffect(() => {
    let active = true;
    fetch("/api/state")
      .then((res) => res.json())
      .then((data: AppState) => {
        if (!active) return;
        skipNextSave.current = true;
        setState(data);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (state === null) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    const timer = setTimeout(() => {
      fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
    }, SAVE_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [state]);

  return <AppStateContext.Provider value={{ state, setState }}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState phải dùng trong AppStateProvider");
  return ctx;
}
