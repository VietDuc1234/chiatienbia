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
import { isValidAppState, type AppState } from "./types";

const SAVE_DEBOUNCE_MS = 350;
const LS_KEY = "chiatienbia-state";

function readFromLocalStorage(): AppState | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isValidAppState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeToLocalStorage(state: AppState) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    // quota exceeded hoặc private mode — bỏ qua
  }
}

interface AppStateContextValue {
  state: AppState | null;
  setState: Dispatch<SetStateAction<AppState | null>>;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);
  const skipNextSave = useRef(false);

  // Load: localStorage trước (instant) → API sau (sync từ server)
  useEffect(() => {
    const cached = readFromLocalStorage();
    if (cached) {
      skipNextSave.current = true;
      setState(cached);
    }

    let active = true;
    fetch("/api/state")
      .then((res) => res.json())
      .then((data: AppState) => {
        if (!active) return;
        skipNextSave.current = true;
        setState(data);
      })
      .catch(() => {
        // Offline hoặc API lỗi — giữ nguyên localStorage
      });
    return () => {
      active = false;
    };
  }, []);

  // Save: localStorage ngay lập tức + API debounce
  useEffect(() => {
    if (state === null) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    writeToLocalStorage(state);

    const timer = setTimeout(() => {
      fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      }).catch(() => {
        // API lỗi — localStorage đã lưu rồi, không cần xử lý thêm
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

