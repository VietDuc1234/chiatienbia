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
  const [state, setState] = useState<AppState | null>(() => readFromLocalStorage());
  const skipNextSave = useRef(state !== null);
  const hasLocalEdit = useRef(false);
  const latestStateRef = useRef(state);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    latestStateRef.current = state;
  }, [state]);

  // Load: localStorage đã đọc ngay khi init state (instant) → API sau (sync từ server)
  useEffect(() => {
    let active = true;
    fetch("/api/state")
      .then((res) => res.json())
      .then((data: AppState) => {
        // Nếu người dùng đã sửa state (ghi điểm...) trong lúc chờ API,
        // bỏ qua response cũ này để không đè mất thay đổi mới hơn.
        if (!active || hasLocalEdit.current) return;
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

  // Đồng bộ giữa các tab cùng trình duyệt: tab khác ghi localStorage → tab này cập nhật theo
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key !== LS_KEY || !e.newValue) return;
      try {
        const parsed = JSON.parse(e.newValue);
        if (isValidAppState(parsed)) {
          skipNextSave.current = true;
          setState(parsed);
        }
      } catch {
        // dữ liệu hỏng từ tab khác — bỏ qua
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Save: localStorage ngay lập tức + API debounce
  useEffect(() => {
    if (state === null) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    hasLocalEdit.current = true;
    writeToLocalStorage(state);

    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = null;
      fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      }).catch(() => {
        // API lỗi — localStorage đã lưu rồi, không cần xử lý thêm
      });
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [state]);

  // Đóng tab/trình duyệt trước khi debounce kịp gửi API → mất bản ghi mới nhất.
  // Bắt visibilitychange + pagehide để gửi ngay phần đang chờ bằng sendBeacon (chạy được lúc unload).
  useEffect(() => {
    function flushPendingSave() {
      if (!saveTimerRef.current || !latestStateRef.current) return;
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
      const blob = new Blob([JSON.stringify(latestStateRef.current)], { type: "application/json" });
      navigator.sendBeacon("/api/state", blob);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") flushPendingSave();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", flushPendingSave);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", flushPendingSave);
    };
  }, []);

  return <AppStateContext.Provider value={{ state, setState }}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState phải dùng trong AppStateProvider");
  return ctx;
}

